import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

dotenv.config();

const migrateInventoryItems = async () => {
  try {
    await connectDB();

    console.log('🔄 Iniciando migración de inventoryitems a products...');

    const db = mongoose.connection.db;
    
    // Obtener todos los documentos de inventoryitems
    const inventoryItems = await db.collection('inventoryitems').find({}).toArray();
    
    console.log(`📦 Encontrados ${inventoryItems.length} productos en inventoryitems`);

    if (inventoryItems.length === 0) {
      console.log('⚠️  No hay productos para migrar');
      process.exit(0);
    }

    // Transformar los documentos al formato de products
    const products = inventoryItems.map(item => ({
      sku: item.sku,
      name: item.name,
      description: item.description || '',
      brand: '', // No existe en inventoryitems, se deja vacío
      category: '', // No existe en inventoryitems, se deja vacío
      purchasePrice: Math.round(item.price * 0.6), // Estimar 40% de margen
      sellingPrice: item.price,
      stock: item.quantity,
      lowStockThreshold: 5,
      discountPercentage: 0,
      soldCount: 0,
      supplier: item.supplier,
      supplierSKU: item.sku,
      imageUrl: '/placeholder-product.png',
      createdAt: item.createdAt || new Date(),
      updatedAt: item.updatedAt || new Date(),
    }));

    // Insertar en products (usar insertMany con ordered: false para continuar en caso de duplicados)
    try {
      const result = await db.collection('products').insertMany(products, { ordered: false });
      console.log(`✅ ${result.insertedCount} productos migrados exitosamente`);
    } catch (error) {
      if (error.code === 11000) {
        // Algunos productos ya existen (duplicados por SKU)
        const insertedCount = error.result?.nInserted || 0;
        console.log(`⚠️  ${insertedCount} productos migrados (algunos SKUs ya existían)`);
      } else {
        throw error;
      }
    }

    // Verificar el total en products
    const totalProducts = await db.collection('products').countDocuments();
    console.log(`📊 Total de productos en la colección 'products': ${totalProducts}`);

    // Eliminar la colección inventoryitems
    console.log('🗑️  Eliminando colección inventoryitems...');
    await db.collection('inventoryitems').drop();
    console.log('✅ Colección inventoryitems eliminada');

    console.log('');
    console.log('✨ Migración completada exitosamente');
    console.log('');
    console.log('📋 Resumen:');
    console.log(`   - Productos originales en inventoryitems: ${inventoryItems.length}`);
    console.log(`   - Total de productos en products: ${totalProducts}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
};

migrateInventoryItems();
