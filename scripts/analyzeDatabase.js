#!/usr/bin/env node
/**
 * Script para analizar y verificar estadísticas de la base de datos
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://TEST_USER:vWHPZ0VKzSDXdsSp@cluster0.fmycxxx.mongodb.net/PRUEBA';

async function analyzeDatabase() {
  try {
    console.log('🔗 Conectando a MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('=' .repeat(80));
    console.log('ANÁLISIS DE BASE DE DATOS - VERIFICACIÓN DE ESTADÍSTICAS');
    console.log('=' .repeat(80));
    console.log();

    // 1. VENTAS (Sales)
    console.log('📊 1. ANÁLISIS DE VENTAS');
    console.log('-'.repeat(80));
    
    const totalSales = await db.collection('sales').countDocuments();
    const completedSales = await db.collection('sales').countDocuments({ status: 'Completada' });
    const cancelledSales = await db.collection('sales').countDocuments({ status: 'Cancelada' });
    
    const salesAggregation = await db.collection('sales').aggregate([
      { $match: { status: 'Completada' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' },
          totalSubtotal: { $sum: '$subtotal' },
          totalDiscount: { $sum: '$totalDiscount' }
        }
      }
    ]).toArray();

    const salesStats = salesAggregation[0] || { totalAmount: 0, totalSubtotal: 0, totalDiscount: 0 };

    console.log(`Total de ventas: ${totalSales}`);
    console.log(`Ventas completadas: ${completedSales}`);
    console.log(`Ventas canceladas: ${cancelledSales}`);
    console.log(`Monto total (completadas): $${salesStats.totalAmount.toFixed(2)}`);
    console.log(`Subtotal total: $${salesStats.totalSubtotal.toFixed(2)}`);
    console.log(`Descuentos totales: $${salesStats.totalDiscount.toFixed(2)}`);
    console.log();

    // Ventas por método de pago
    const salesByPayment = await db.collection('sales').aggregate([
      { $match: { status: 'Completada' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      }
    ]).toArray();

    console.log('Ventas por método de pago:');
    salesByPayment.forEach(method => {
      console.log(`  ${method._id}: ${method.count} ventas - $${method.total.toFixed(2)}`);
    });
    console.log();

    // 2. PRODUCTOS (Products)
    console.log('📦 2. ANÁLISIS DE PRODUCTOS');
    console.log('-'.repeat(80));
    
    const totalProducts = await db.collection('products').countDocuments();
    const lowStockProducts = await db.collection('products').countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] }
    });
    const outOfStockProducts = await db.collection('products').countDocuments({ stock: 0 });
    
    const productsAggregation = await db.collection('products').aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$stock', '$sellingPrice'] } },
          avgPrice: { $avg: '$sellingPrice' }
        }
      }
    ]).toArray();

    const productsStats = productsAggregation[0] || { totalStock: 0, totalValue: 0, avgPrice: 0 };

    console.log(`Total de productos: ${totalProducts}`);
    console.log(`Productos con bajo stock: ${lowStockProducts}`);
    console.log(`Productos agotados: ${outOfStockProducts}`);
    console.log(`Stock total: ${productsStats.totalStock} unidades`);
    console.log(`Valor total inventario: $${productsStats.totalValue.toFixed(2)}`);
    console.log(`Precio promedio: $${productsStats.avgPrice.toFixed(2)}`);
    console.log();

    // Productos por categoría
    const productsByCategory = await db.collection('products').aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log('Productos por categoría:');
    productsByCategory.forEach(cat => {
      console.log(`  ${cat._id || 'Sin categoría'}: ${cat.count} productos - ${cat.totalStock} unidades`);
    });
    console.log();

    // 3. CLIENTES (Customers)
    console.log('👥 3. ANÁLISIS DE CLIENTES');
    console.log('-'.repeat(80));
    
    const totalCustomers = await db.collection('customers').countDocuments();
    
    const customersAggregation = await db.collection('customers').aggregate([
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: '$totalPurchases' },
          avgPurchases: { $avg: '$totalPurchases' }
        }
      }
    ]).toArray();

    const customersStats = customersAggregation[0] || { totalPurchases: 0, avgPurchases: 0 };

    console.log(`Total de clientes: ${totalCustomers}`);
    console.log(`Compras totales: $${customersStats.totalPurchases.toFixed(2)}`);
    console.log(`Promedio por cliente: $${customersStats.avgPurchases.toFixed(2)}`);
    console.log();

    // 4. PROVEEDORES (Suppliers)
    console.log('🚚 4. ANÁLISIS DE PROVEEDORES');
    console.log('-'.repeat(80));
    
    const totalSuppliers = await db.collection('suppliers').countDocuments();
    
    console.log(`Total de proveedores: ${totalSuppliers}`);
    console.log();

    // 5. DEVOLUCIONES (Returns)
    console.log('↩️  5. ANÁLISIS DE DEVOLUCIONES');
    console.log('-'.repeat(80));
    
    const totalReturns = await db.collection('returns').countDocuments();
    const pendingReturns = await db.collection('returns').countDocuments({ status: 'Pendiente' });
    const approvedReturns = await db.collection('returns').countDocuments({ status: 'Aprobada' });
    const rejectedReturns = await db.collection('returns').countDocuments({ status: 'Rechazada' });
    
    const returnsAggregation = await db.collection('returns').aggregate([
      { $match: { status: 'Aprobada' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$total' }
        }
      }
    ]).toArray();

    const returnsStats = returnsAggregation[0] || { totalAmount: 0 };

    console.log(`Total de devoluciones: ${totalReturns}`);
    console.log(`Pendientes: ${pendingReturns}`);
    console.log(`Aprobadas: ${approvedReturns}`);
    console.log(`Rechazadas: ${rejectedReturns}`);
    console.log(`Monto total devuelto: $${returnsStats.totalAmount.toFixed(2)}`);
    console.log();

    // 6. LOGS
    console.log('📝 6. ANÁLISIS DE LOGS');
    console.log('-'.repeat(80));
    
    const totalLogs = await db.collection('logs').countDocuments();
    const logsByType = await db.collection('logs').aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    console.log(`Total de logs: ${totalLogs}`);
    console.log('Logs por tipo:');
    logsByType.forEach(log => {
      console.log(`  ${log._id}: ${log.count}`);
    });
    console.log();

    // RESUMEN FINAL
    console.log('=' .repeat(80));
    console.log('RESUMEN EJECUTIVO');
    console.log('=' .repeat(80));
    console.log(`📊 Ventas completadas: ${completedSales} | Monto: $${salesStats.totalAmount.toFixed(2)}`);
    console.log(`📦 Productos: ${totalProducts} | Stock: ${productsStats.totalStock} | Valor: $${productsStats.totalValue.toFixed(2)}`);
    console.log(`👥 Clientes: ${totalCustomers} | Compras: $${customersStats.totalPurchases.toFixed(2)}`);
    console.log(`🚚 Proveedores: ${totalSuppliers}`);
    console.log(`↩️  Devoluciones: ${totalReturns} (${approvedReturns} aprobadas) | Monto: $${returnsStats.totalAmount.toFixed(2)}`);
    console.log(`📝 Logs: ${totalLogs}`);
    console.log('=' .repeat(80));
    console.log();

    await mongoose.disconnect();
    console.log('✅ Análisis completado\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeDatabase();
