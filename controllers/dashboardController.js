import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';

// @desc    Obtener estadísticas del dashboard
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - 7);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Ventas de hoy
    const todaySales = await Sale.find({
      createdAt: { $gte: today },
      status: 'Completada'
    });

    const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todayTransactions = todaySales.length;
    const todayAvgTicket = todayTransactions > 0 ? todayTotal / todayTransactions : 0;

    // Ventas de la semana
    const weekSales = await Sale.find({
      createdAt: { $gte: startOfWeek },
      status: 'Completada'
    });

    const weekTotal = weekSales.reduce((sum, sale) => sum + sale.total, 0);

    // Ventas del mes
    const monthSales = await Sale.find({
      createdAt: { $gte: startOfMonth },
      status: 'Completada'
    });

    const monthTotal = monthSales.reduce((sum, sale) => sum + sale.total, 0);

    // Productos con bajo stock
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    }).limit(10);

    // Total de productos
    const totalProducts = await Product.countDocuments();

    // Total de clientes
    const totalCustomers = await Customer.countDocuments();

    // Total de usuarios activos
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      today: {
        total: todayTotal,
        transactions: todayTransactions,
        avgTicket: todayAvgTicket
      },
      week: {
        total: weekTotal,
        transactions: weekSales.length
      },
      month: {
        total: monthTotal,
        transactions: monthSales.length
      },
      inventory: {
        totalProducts,
        lowStockProducts: lowStockProducts.length,
        lowStockItems: lowStockProducts
      },
      customers: totalCustomers,
      users: activeUsers
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
  }
};

// @desc    Obtener ventas por día (última semana)
// @route   GET /api/dashboard/sales-by-day
// @access  Private
export const getSalesByDay = async (req, res) => {
  try {
    const daysAgo = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    const sales = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'Completada'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Formatear para el frontend
    const formattedSales = sales.map(item => ({
      date: item._id,
      total: item.total,
      transactions: item.count
    }));

    res.json(formattedSales);
  } catch (error) {
    console.error('Error al obtener ventas por día:', error);
    res.status(500).json({ message: 'Error al obtener ventas', error: error.message });
  }
};

// @desc    Obtener productos más vendidos
// @route   GET /api/dashboard/top-products
// @access  Private
export const getTopProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topProducts = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'Completada'
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 1,
          name: '$product.name',
          sku: '$product.sku',
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.json(topProducts);
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// @desc    Obtener ventas por método de pago
// @route   GET /api/dashboard/sales-by-payment
// @access  Private
export const getSalesByPayment = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesByPayment = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'Completada'
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(salesByPayment);
  } catch (error) {
    console.error('Error al obtener ventas por método de pago:', error);
    res.status(500).json({ message: 'Error al obtener datos', error: error.message });
  }
};
