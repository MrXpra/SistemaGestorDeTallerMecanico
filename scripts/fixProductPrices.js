#!/usr/bin/env node
/**
 * Script para agregar precios a productos que no los tienen
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://TEST_USER:vWHPZ0VKzSDXdsSp@cluster0.fmycxxx.mongodb.net/PRUEBA';

async function fixPrices() {
  try {
    console.log('Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('Buscando productos sin precio...');
    const products = await db.collection('products').find({
      $or: [
        { price: { $exists: false } },
        { price: 0 },
        { price: null }
      ]
    }).toArray();

    console.log(`Productos sin precio encontrados: ${products.length}`);

    if (products.length === 0) {
      console.log('✅ Todos los productos tienen precio');
      await mongoose.disconnect();
      return;
    }

    let updated = 0;
    for (const product of products) {
      // Precio aleatorio entre 100 y 5000
      const price = Math.floor(Math.random() * 4900) + 100;
      // Costo es 60% del precio
      const cost = Math.floor(price * 0.6);
      
      await db.collection('products').updateOne(
        { _id: product._id },
        { 
          $set: { 
            price: price,
            cost: cost,
            sellingPrice: price 
          } 
        }
      );
      
      updated++;
      if (updated % 100 === 0) {
        console.log(`  Actualizados ${updated}/${products.length}...`);
      }
    }

    console.log(`✅ ${updated} productos actualizados con precios`);
    await mongoose.disconnect();
    console.log('Conexión cerrada');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPrices();
