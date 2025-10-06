import Customer from '../models/Customer.js';
import Sale from '../models/Sale.js';

// @desc    Obtener todos los clientes
// @route   GET /api/customers
// @access  Private
export const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {};

    // Búsqueda por nombre, cédula, teléfono o email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { cedula: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });

    res.json(customers);
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

    // Verificar si ya existe un cliente con esa cédula
    if (cedula) {
      const existingCedula = await Customer.findOne({ cedula });
      if (existingCedula) {
        return res.status(400).json({ message: 'Ya existe un cliente con esa cédula' });
      }
    }

    // Verificar si ya existe un cliente con ese teléfono o email
    if (phone) {
      const existingPhone = await Customer.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'Ya existe un cliente con ese número de teléfono' });
      }
    }

    if (email) {
      const existingEmail = await Customer.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: 'Ya existe un cliente con ese email' });
      }
    }

    const customer = await Customer.create({
      fullName,
      cedula,
      phone,
      email,
      address
    });

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

    // Verificar si el cliente tiene ventas asociadas
    const salesCount = await Sale.countDocuments({ customer: customer._id });

    if (salesCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el cliente porque tiene ventas asociadas' 
      });
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json({ message: 'Cliente eliminado exitosamente' });
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
