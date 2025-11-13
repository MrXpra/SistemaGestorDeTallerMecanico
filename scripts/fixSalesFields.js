#!/usr/bin/env node
/**
 * Script para completar campos faltantes en ventas del loadtest
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://TEST_USER:vWHPZ0VKzSDXdsSp@cluster0.fmycxxx.mongodb.net/PRUEBA';

const PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia'];

async function fixSalesFields() {
  try {
    console.log('🔗 Conectando a MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // Buscar ventas sin paymentMethod
    console.log('📊 Corrigiendo campos de ventas...');
    const salesMissing = await db.collection('sales').find({
      $or: [
        { paymentMethod: { $exists: false } },
        { paymentMethod: null },
        { subtotal: { $exists: false } },
        { totalDiscount: { $exists: false } }
      ]
    }).toArray();

    console.log(`Ventas a corregir: ${salesMissing.length}`);

    // Obtener primer usuario
    const firstUser = await db.collection('users').findOne({});
    if (!firstUser) {
      console.error('❌ No se encontró ningún usuario en la BD');
      await mongoose.disconnect();
      return;
    }

    // Actualizar con updateMany (más rápido)
    const result = await db.collection('sales').updateMany(
      { paymentMethod: null },
      {
        $set: {
          paymentMethod: 'Efectivo',
          user: firstUser._id
        }
      }
    );
    console.log(`✅ ${result.modifiedCount} ventas actualizadas (paymentMethod)`);

    // Actualizar subtotal donde falte
    const result2 = await db.collection('sales').updateMany(
      { subtotal: { $exists: false } },
      [{ $set: { subtotal: '$total' } }]
    );
    console.log(`✅ ${result2.modifiedCount} ventas actualizadas (subtotal)`);

    // Actualizar totalDiscount donde falte
    const result3 = await db.collection('sales').updateMany(
      { totalDiscount: { $exists: false } },
      { $set: { totalDiscount: 0 } }
    );
    console.log(`✅ ${result3.modifiedCount} ventas actualizadas (totalDiscount)`);
    console.log();

    // Verificación final
    console.log('🔍 VERIFICACIÓN FINAL:');
    console.log('-'.repeat(60));
    
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
    let totalAmount = 0;
    salesByPayment.forEach(method => {
      console.log(`  ${method._id}: ${method.count} ventas - $${method.total.toFixed(2)}`);
      totalAmount += method.total;
    });
    console.log(`\nMonto total: $${totalAmount.toFixed(2)}`);
    console.log();

    await mongoose.disconnect();
    console.log('✅ Corrección completada\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixSalesFields();
