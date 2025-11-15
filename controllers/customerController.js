import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';

// @desc    Obtener todos los clientes (con paginación)
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    const { search, includeArchived, page = 1, limit = 50 } = req.query;
    
    let query = {};

    // Excluir archivados por defecto
    if (includeArchived !== 'true') {
      query.isArchived = { $ne: true };
    }

    // Búsqueda por nombre, cédula, teléfono o email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { cedula: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Paginación
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Contar total
    const totalDocs = await Customer.countDocuments(query);

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      customers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalDocs,
        pages: Math.ceil(totalDocs / limitNum),
        hasNextPage: pageNum < Math.ceil(totalDocs / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
};

// @desc    Obtener un cliente por ID
// @route   GET /api/customers/:id
// @access  Private
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate({
        path: 'purchaseHistory',
        populate: {
          path: 'items.product',
          select: 'name sku'
        }
      });

    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ message: 'Error al obtener cliente', error: error.message });
  }
};

// @desc    Crear nuevo cliente
// @route   POST /api/customers
// @access  Private
export const createCustomer = async (req, res) => {
  try {
    const { fullName, cedula, phone, email, address } = req.body;

    // Limpiar y normalizar campos (convertir strings vacíos a undefined)
    const cleanCedula = cedula && cedula.trim() !== '' ? cedula.trim() : undefined;
    const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : undefined;
    const cleanEmail = email && email.trim() !== '' ? email.trim().toLowerCase() : undefined;
    const cleanAddress = address && address.trim() !== '' ? address.trim() : undefined;

    // Verificar si ya existe un cliente con esa cédula
    if (cleanCedula) {
      const existingCedula = await Customer.findOne({ cedula: cleanCedula });
      if (existingCedula) {
        return res.status(400).json({ message: 'Ya existe un cliente con esa cédula' });
      }
    }

    // Verificar si ya existe un cliente con ese teléfono
    if (cleanPhone) {
      const existingPhone = await Customer.findOne({ phone: cleanPhone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Ya existe un cliente con ese número de teléfono' });
      }
    }

    // Verificar si ya existe un cliente con ese email
    if (cleanEmail) {
      const existingEmail = await Customer.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(400).json({ message: 'Ya existe un cliente con ese email' });
      }
    }

    // Preparar datos del cliente (solo incluir campos con valores)
    const customerData = {
      fullName: fullName.trim()
    };

    if (cleanCedula) customerData.cedula = cleanCedula;
    if (cleanPhone) customerData.phone = cleanPhone;
    if (cleanEmail) customerData.email = cleanEmail;
    if (cleanAddress) customerData.address = cleanAddress;

    const customer = await Customer.create(customerData);

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear cliente', error: error.message });
  }
};

// @desc    Actualizar cliente
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar duplicados si se actualiza cédula
    if (req.body.cedula && req.body.cedula !== customer.cedula) {
      const existingCedula = await Customer.findOne({ cedula: req.body.cedula });
      if (existingCedula) {
        return res.status(400).json({ message: 'Ya existe un cliente con esa cédula' });
      }
    }

    // Verificar duplicados si se actualiza teléfono o email
    if (req.body.phone && req.body.phone !== customer.phone) {
      const existingPhone = await Customer.findOne({ phone: req.body.phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Ya existe un cliente con ese número de teléfono' });
      }
    }

    if (req.body.email && req.body.email !== customer.email) {
      const existingEmail = await Customer.findOne({ email: req.body.email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Ya existe un cliente con ese email' });
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error al actualizar cliente', error: error.message });
  }
};

// @desc    Eliminar cliente
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Verificar si el cliente tiene ventas asociadas (excluyendo canceladas)
    const activeSalesCount = await Sale.countDocuments({ 
      customer: customer._id,
      status: { $ne: 'Cancelada' }
    });

    if (activeSalesCount > 0) {
      // Soft delete: archivar el cliente si tiene ventas activas
      customer.isArchived = true;
      await customer.save();
      
      console.log(`Cliente ${customer._id} archivado (tiene ${activeSalesCount} ventas activas)`);
      
      return res.json({ 
        message: `Cliente archivado correctamente. Mantiene ${activeSalesCount} ventas asociadas.`,
        archived: true,
        referencesCount: activeSalesCount
      });
    }

    // Hard delete: eliminar permanentemente si no tiene ventas activas
    await Customer.findByIdAndDelete(req.params.id);
    
    console.log(`Cliente ${customer._id} eliminado permanentemente (sin ventas activas)`);

    res.json({ 
      message: 'Cliente eliminado exitosamente',
      archived: false
    });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ message: 'Error al eliminar cliente', error: error.message });
  }
};

// @desc    Obtener historial de compras de un cliente
// @route   GET /api/customers/:id/purchases
// @access  Private
export const getCustomerPurchases = async (req, res) => {
  try {
    const sales = await Sale.find({ customer: req.params.id })
      .populate('items.product', 'name sku')
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    console.error('Error al obtener historial de compras:', error);
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};
