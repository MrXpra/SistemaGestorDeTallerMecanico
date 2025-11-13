#!/usr/bin/env node
/**
 * Script para corregir status de ventas y devoluciones del loadtest
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://TEST_USER:vWHPZ0VKzSDXdsSp@cluster0.fmycxxx.mongodb.net/PRUEBA';

async function fixStatuses() {
  try {
    console.log('🔗 Conectando a MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;

    // 1. Arreglar ventas sin status
    console.log('📊 Corrigiendo status de ventas...');
    const salesWithoutStatus = await db.collection('sales').countDocuments({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: '' }
      ]
    });

    if (salesWithoutStatus > 0) {
      const result = await db.collection('sales').updateMany(
        {
          $or: [
            { status: { $exists: false } },
            { status: null },
            { status: '' }
          ]
        },
        { $set: { status: 'Completada' } }
      );
      console.log(`✅ ${result.modifiedCount} ventas actualizadas a status 'Completada'`);
    } else {
      console.log('✅ Todas las ventas tienen status válido');
    }
    console.log();

    // 2. Arreglar devoluciones con status 'Completada' (debe ser 'Aprobada')
    console.log('↩️  Corrigiendo status de devoluciones...');
    const returnsCompletada = await db.collection('returns').countDocuments({ status: 'Completada' });
    
    if (returnsCompletada > 0) {
      const result = await db.collection('returns').updateMany(
        { status: 'Completada' },
        { $set: { status: 'Aprobada' } }
      );
      console.log(`✅ ${result.modifiedCount} devoluciones cambiadas de 'Completada' a 'Aprobada'`);
    }

    // Verificar y corregir devoluciones sin status
    const returnsWithoutStatus = await db.collection('returns').countDocuments({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: '' }
      ]
    });

    if (returnsWithoutStatus > 0) {
      // Distribución: 70% Aprobada, 20% Pendiente, 10% Rechazada
      const allReturns = await db.collection('returns').find({
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: '' }
        ]
      }).toArray();

      let approved = 0;
      let pending = 0;
      let rejected = 0;

      for (let i = 0; i < allReturns.length; i++) {
        let newStatus;
        const rand = Math.random();
        
        if (rand < 0.7) {
          newStatus = 'Aprobada';
          approved++;
        } else if (rand < 0.9) {
          newStatus = 'Pendiente';
          pending++;
        } else {
          newStatus = 'Rechazada';
          rejected++;
        }

        await db.collection('returns').updateOne(
          { _id: allReturns[i]._id },
          { $set: { status: newStatus } }
        );

        if ((i + 1) % 100 === 0) {
          console.log(`  Procesadas ${i + 1}/${allReturns.length}...`);
        }
      }

      console.log(`✅ Devoluciones actualizadas:`);
      console.log(`   - Aprobadas: ${approved}`);
      console.log(`   - Pendientes: ${pending}`);
      console.log(`   - Rechazadas: ${rejected}`);
    } else {
      console.log('✅ Todas las devoluciones tienen status válido');
    }
    console.log();

    // Verificación final
    console.log('🔍 VERIFICACIÓN FINAL:');
    console.log('-'.repeat(60));
    
    const completedSales = await db.collection('sales').countDocuments({ status: 'Completada' });
    const cancelledSales = await db.collection('sales').countDocuments({ status: 'Cancelada' });
    
    const approvedReturns = await db.collection('returns').countDocuments({ status: 'Aprobada' });
    const pendingReturns = await db.collection('returns').countDocuments({ status: 'Pendiente' });
    const rejectedReturns = await db.collection('returns').countDocuments({ status: 'Rechazada' });

    console.log(`Ventas completadas: ${completedSales}`);
    console.log(`Ventas canceladas: ${cancelledSales}`);
    console.log(`Devoluciones aprobadas: ${approvedReturns}`);
    console.log(`Devoluciones pendientes: ${pendingReturns}`);
    console.log(`Devoluciones rechazadas: ${rejectedReturns}`);
    console.log();

    await mongoose.disconnect();
    console.log('✅ Corrección completada\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixStatuses();
