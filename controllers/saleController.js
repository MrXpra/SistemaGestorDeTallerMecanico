import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import CashierSession from '../models/CashierSession.js';

// @desc    Crear nueva venta
// @route   POST /api/sales
// @access  Private
export const createSale = async (req, res) => {
  try {
    const { items, paymentMethod, customer, notes, globalDiscount = 0, globalDiscountAmount = 0 } = req.body;

    // Validar que hay items
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Debe haber al menos un producto en la venta' });
    }

    // Verificar stock y calcular totales
    let subtotal = 0;
    let totalDiscount = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({ message: `Producto con ID ${item.product} no encontrado` });
      }

      // Verificar stock disponible
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}` 
        });
      }

      // Calcular precio con descuento del producto
      const priceWithDiscount = product.sellingPrice * (1 - product.discountPercentage / 100);
      
      // Aplicar descuento adicional si se proporciona
      const additionalDiscount = item.discountApplied || 0;
      const finalPrice = priceWithDiscount * (1 - additionalDiscount / 100);
      
      const itemSubtotal = finalPrice * item.quantity;
      const itemDiscount = (product.sellingPrice * item.quantity) - itemSubtotal;

      subtotal += product.sellingPrice * item.quantity;
      totalDiscount += itemDiscount;

      processedItems.push({
        product: product._id,
        quantity: item.quantity,
        priceAtSale: product.sellingPrice,
        discountApplied: product.discountPercentage + additionalDiscount,
        subtotal: itemSubtotal
      });

      // Actualizar stock y soldCount del producto
      product.stock -= item.quantity;
      product.soldCount = (product.soldCount || 0) + item.quantity;
      await product.save();
    }

    // Aplicar descuento global
    const subtotalAfterItemDiscounts = subtotal - totalDiscount;
    // Si se proporciona el monto exacto del descuento, usar ese; si no, calcular desde el porcentaje
    const finalGlobalDiscountAmount = globalDiscountAmount > 0 
      ? globalDiscountAmount 
      : (globalDiscount / 100) * subtotalAfterItemDiscounts;
    totalDiscount += finalGlobalDiscountAmount;

    const total = subtotal - totalDiscount;

    // Generar número de factura
    const invoiceNumber = await Sale.generateInvoiceNumber();

    // Crear venta
    const sale = await Sale.create({
      invoiceNumber,
      user: req.user._id,
      customer: customer || null,
      items: processedItems,
      subtotal,
      totalDiscount,
      total,
      paymentMethod,
      notes
    });

    // Si hay cliente, actualizar su historial
    if (customer) {
      await Customer.findByIdAndUpdate(customer, {
        $push: { purchaseHistory: sale._id },
        $inc: { totalPurchases: total }
      });
    }

    // Poblar información de la venta
    const populatedSale = await Sale.findById(sale._id)
      .populate('user', 'name email')
      .populate('customer', 'fullName phone email')
      .populate('items.product', 'name sku');

    res.status(201).json(populatedSale);
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({ message: 'Error al crear venta', error: error.message });
  }
};

// @desc    Obtener todas las ventas
// @route   GET /api/sales
// @access  Private
export const getSales = async (req, res) => {
  try {
    const { startDate, endDate, user, paymentMethod, status, search } = req.query;
    
    console.log('📅 Query params:', { startDate, endDate, search });
    
    let query = {};

    // Filtro por búsqueda de número de factura
    if (search) {
      query.invoiceNumber = { $regex: search, $options: 'i' };
    }

    // Filtro por rango de fechas
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        // Inicio del día en zona horaria local
        const start = new Date(startDate + 'T00:00:00.000');
        query.createdAt.$gte = start;
      }
      if (endDate) {
        // Final del día en zona horaria local (23:59:59.999)
        const end = new Date(endDate + 'T23:59:59.999');
        query.createdAt.$lte = end;
      }
      console.log('📅 Query createdAt:', query.createdAt);
    }

    // Filtro por usuario (cajero)
    if (user) {
      query.user = user;
    }

    // Filtro por método de pago
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    // Filtro por estado
    if (status) {
      query.status = status;
    }

    const sales = await Sale.find(query)
      .populate('user', 'name email')
      .populate('customer', 'fullName phone')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    console.log('💰 Sales found:', sales.length);
    if (sales.length > 0) {
      console.log('First sale date:', sales[0].createdAt);
      console.log('Last sale date:', sales[sales.length - 1].createdAt);
    }

    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error al obtener ventas', error: error.message });
  }
};

// @desc    Obtener una venta por ID
// @route   GET /api/sales/:id
// @access  Private
export const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('user', 'name email')
      .populate('customer', 'fullName phone email address')
      .populate('items.product', 'name sku brand');

    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    res.json(sale);
  } catch (error) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ message: 'Error al obtener venta', error: error.message });
  }
};

// @desc    Obtener ventas del usuario actual (para cierre de caja)
// @route   GET /api/sales/user/me
// @access  Private
export const getMySales = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sales = await Sale.find({
      user: req.user._id,
      createdAt: { $gte: today },
      status: 'Completada'
    })
      .populate('customer', 'fullName phone email')
      .populate('items.product', 'name sku')
      .sort({ createdAt: -1 });

    // Calcular totales por método de pago
    const summary = {
      totalSales: sales.length,
      totalAmount: 0,
      byPaymentMethod: {
        Efectivo: 0,
        Tarjeta: 0,
        Transferencia: 0
      }
    };

    sales.forEach(sale => {
      summary.totalAmount += sale.total;
      summary.byPaymentMethod[sale.paymentMethod] += sale.total;
    });

    res.json({
      sales,
      summary
    });
  } catch (error) {
    console.error('Error al obtener ventas del usuario:', error);
    res.status(500).json({ message: 'Error al obtener ventas', error: error.message });
  }
};

// @desc    Cancelar venta
// @route   PUT /api/sales/:id/cancel
// @access  Private/Admin
export const cancelSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id).populate('items.product');

    if (!sale) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }

    if (sale.status === 'Cancelada') {
      return res.status(400).json({ message: 'La venta ya está cancelada' });
    }

    // Restaurar stock de los productos
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: item.quantity }
      });
    }

    sale.status = 'Cancelada';
    await sale.save();

    // Actualizar historial del cliente si existe
    if (sale.customer) {
      await Customer.findByIdAndUpdate(sale.customer, {
        $inc: { totalPurchases: -sale.total }
      });
    }

    res.json({ message: 'Venta cancelada exitosamente', sale });
  } catch (error) {
    console.error('Error al cancelar venta:', error);
    res.status(500).json({ message: 'Error al cancelar venta', error: error.message });
  }
};

// @desc    Cerrar caja / Finalizar turno del cajero
// @route   POST /api/sales/close-register
// @access  Private
export const closeCashRegister = async (req, res) => {
  try {
    const { countedTotals, notes } = req.body;
    const cashierId = req.user._id;

    // Validar datos requeridos
    if (!countedTotals || !countedTotals.cash === undefined || !countedTotals.card === undefined || !countedTotals.transfer === undefined) {
      return res.status(400).json({ message: 'Debe proporcionar los totales contados (efectivo, tarjeta, transferencia)' });
    }

    // Obtener ventas del cajero del día actual (desde las 00:00:00 hasta ahora)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const now = new Date();

    const sales = await Sale.find({
      cashier: cashierId,
      createdAt: { 
        $gte: startOfDay,
        $lte: now
      },
      status: { $ne: 'Cancelada' }
    });

    // Calcular totales del sistema
    const systemTotals = {
      totalSales: sales.length,
      totalAmount: 0,
      cash: 0,
      card: 0,
      transfer: 0
    };

    sales.forEach(sale => {
      systemTotals.totalAmount += sale.total;
      
      if (sale.paymentMethod === 'Efectivo') {
        systemTotals.cash += sale.total;
      } else if (sale.paymentMethod === 'Tarjeta') {
        systemTotals.card += sale.total;
      } else if (sale.paymentMethod === 'Transferencia') {
        systemTotals.transfer += sale.total;
      }
    });

    // Calcular diferencias
    const differences = {
      cash: countedTotals.cash - systemTotals.cash,
      card: countedTotals.card - systemTotals.card,
      transfer: countedTotals.transfer - systemTotals.transfer,
      total: (countedTotals.cash + countedTotals.card + countedTotals.transfer) - systemTotals.totalAmount
    };

    // Crear registro de sesión de caja
    const session = await CashierSession.create({
      cashier: cashierId,
      openedAt: startOfDay,
      closedAt: now,
      systemTotals,
      countedTotals,
      differences,
      notes: notes || '',
      sales: sales.map(s => s._id)
    });

    // Poblar datos del cajero para la respuesta
    await session.populate('cashier', 'fullName email');

    res.status(201).json({
      message: 'Cierre de caja realizado exitosamente',
      session,
      summary: {
        systemTotals,
        countedTotals,
        differences
      }
    });

  } catch (error) {
    console.error('Error al cerrar caja:', error);
    res.status(500).json({ message: 'Error al cerrar caja', error: error.message });
  }
};
