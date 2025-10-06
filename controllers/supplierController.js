import Supplier from '../models/Supplier.js';

// Obtener todos los proveedores
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ name: 1 });
    res.json(suppliers);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
};

// Obtener un proveedor por ID
export const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ message: 'Error al obtener proveedor' });
  }
};

// Crear nuevo proveedor
export const createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El RNC ya está registrado' });
    }
    res.status(500).json({ message: 'Error al crear proveedor' });
  }
};

// Actualizar proveedor
export const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json(supplier);
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El RNC ya está registrado' });
    }
    res.status(500).json({ message: 'Error al actualizar proveedor' });
  }
};

// Eliminar proveedor (soft delete)
export const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!supplier) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    res.json({ message: 'Proveedor desactivado correctamente' });
  } catch (error) {
    console.error('Error al eliminar proveedor:', error);
    res.status(500).json({ message: 'Error al eliminar proveedor' });
  }
};
