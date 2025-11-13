#!/usr/bin/env node
/**
 * Script para corregir productos del loadtest con estructura completa
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://TEST_USER:vWHPZ0VKzSDXdsSp@cluster0.fmycxxx.mongodb.net/PRUEBA';

const BRANDS = ['Bosch', 'Michelin', 'Castrol', 'NGK', 'Denso', 'Brembo', 'Monroe', 'AC Delco', 'Karpa', 'Generic'];
const CATEGORIES = ['Aceites', 'Filtros', 'Frenos', 'Suspensión', 'Iluminación', 'Motor', 'Transmisión', 'Eléctrico', 'Carrocería', 'Accesorios'];

async function fixProducts() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // Buscar productos que no tienen la estructura correcta (productos del loadtest)
    console.log('Buscando productos sin estructura correcta...');
    const products = await db.collection('products').find({
      $or: [
        { purchasePrice: { $exists: false } },
        { sellingPrice: { $exists: false } },
        { brand: { $exists: false } },
        { category: { $exists: false } }
      ]
    }).toArray();

    console.log(`Productos a corregir: ${products.length}`);

    if (products.length === 0) {
      console.log('✅ Todos los productos tienen estructura correcta');
      await mongoose.disconnect();
      return;
    }

    // Obtener un proveedor genérico o el primero disponible
    const supplier = await db.collection('suppliers').findOne({});
    const supplierId = supplier ? supplier._id : null;

    let updated = 0;
    for (const product of products) {
      // Generar precios si no existen
      const purchasePrice = product.purchasePrice || product.cost || Math.floor(Math.random() * 4000) + 500;
      const sellingPrice = product.sellingPrice || product.price || Math.floor(purchasePrice * 1.35); // 35% margen
      const cost = product.cost || Math.floor(purchasePrice * 0.9);
      
      // Asignar brand y category aleatorios
      const brand = product.brand || BRANDS[Math.floor(Math.random() * BRANDS.length)];
      const category = product.category || CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      
      const updateData = {
        purchasePrice: purchasePrice,
        sellingPrice: sellingPrice,
        cost: cost,
        price: sellingPrice,
        brand: brand,
        category: category,
        lowStockThreshold: product.lowStockThreshold || 5,
        discountPercentage: product.discountPercentage || 0,
        soldCount: product.soldCount || 0,
        defectiveStock: product.defectiveStock || 0,
        imageUrl: product.imageUrl || '/placeholder-product.png',
        isArchived: product.isArchived || false,
        updatedAt: new Date()
      };

      // Agregar supplier si existe
      if (supplierId) {
        updateData.supplier = supplierId;
      }

      await db.collection('products').updateOne(
        { _id: product._id },
        { $set: updateData }
      );
      
      updated++;
      if (updated % 100 === 0) {
        console.log(`  Actualizados ${updated}/${products.length}...`);
      }
    }

    console.log(`✅ ${updated} productos actualizados con estructura completa`);
    await mongoose.disconnect();
    console.log('Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixProducts();
