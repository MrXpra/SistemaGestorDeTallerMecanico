/**
 * PRODUCTCONTROLLER.JS - Controlador de Productos
 * 
 * Maneja toda la lógica de negocio relacionada con productos del inventario.
 * 
 * Funciones:
 * - getProducts: Lista productos con filtros (búsqueda, categoría, marca, stock bajo)
 * - getProductById: Obtiene un producto específico por ID
 * - getProductBySku: Busca producto por SKU (usado en facturación rápida)
 * - createProduct: Crea nuevo producto (valida SKU único)
 * - updateProduct: Actualiza producto existente
 * - deleteProduct: Elimina producto del inventario
 * - getCategories: Lista categorías únicas (para filtros)
 * - getBrands: Lista marcas únicas (para filtros)
 */

import Product from '../models/Product.js';

/**
 * GETPRODUCTS - Obtener lista de productos
 * 
 * @route   GET /api/products
 * @access  Private
 * @query   search - Buscar por SKU o nombre (case-insensitive)
 * @query   category - Filtrar por categoría
 * @query   brand - Filtrar por marca
 * @query   lowStock - 'true' para mostrar solo productos con stock <= threshold
 * @returns Array de productos ordenados por fecha de creación (más reciente primero)
 */
export const getProducts = async (req, res) => {
  try {
    const { search, category, brand, lowStock } = req.query;
    
    let query = {};

    // Búsqueda por SKU o nombre
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por categoría
    if (category) {
      query.category = category;
    }

    // Filtro por marca
    if (brand) {
      query.brand = brand;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    // Filtrar productos con bajo stock si se solicita
    let filteredProducts = products;
    if (lowStock === 'true') {
      filteredProducts = products.filter(p => p.stock <= p.lowStockThreshold);
    }

    res.json(filteredProducts);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// @desc    Obtener un producto por ID
// @route   GET /api/products/:id
// @access  Private
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: 'Error al obtener producto', error: error.message });
  }
};

// @desc    Buscar producto por SKU
// @route   GET /api/products/sku/:sku
// @access  Private
export const getProductBySku = async (req, res) => {
  try {
    const product = await Product.findOne({ sku: req.params.sku.toUpperCase() });

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error al buscar producto por SKU:', error);
    res.status(500).json({ message: 'Error al buscar producto', error: error.message });
  }
};

// @desc    Crear nuevo producto
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { sku, name, description, brand, category, purchasePrice, sellingPrice, stock, lowStockThreshold, discountPercentage, supplier } = req.body;

    // Verificar si el SKU ya existe
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });

    if (existingProduct) {
      return res.status(400).json({ message: 'El SKU ya existe' });
    }

    const product = await Product.create({
      sku: sku.toUpperCase(),
      name,
      description,
      brand,
      category,
      purchasePrice,
      sellingPrice,
      stock,
      lowStockThreshold,
      discountPercentage,
      supplier
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ message: 'Error al crear producto', error: error.message });
  }
};

// @desc    Actualizar producto
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Si se está actualizando el SKU, verificar que no exista otro producto con ese SKU
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existingProduct) {
        return res.status(400).json({ message: 'El SKU ya existe' });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, sku: req.body.sku ? req.body.sku.toUpperCase() : product.sku },
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: 'Error al actualizar producto', error: error.message });
  }
};

// @desc    Eliminar producto
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: 'Error al eliminar producto', error: error.message });
  }
};

// @desc    Obtener categorías únicas
// @route   GET /api/products/categories/list
// @access  Private
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.filter(c => c)); // Filtrar valores vacíos
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

// @desc    Obtener marcas únicas
// @route   GET /api/products/brands/list
// @access  Private
export const getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands.filter(b => b)); // Filtrar valores vacíos
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    res.status(500).json({ message: 'Error al obtener marcas', error: error.message });
  }
};
