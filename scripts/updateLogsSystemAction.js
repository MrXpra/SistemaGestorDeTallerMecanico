/**
 * Script para actualizar los logs existentes y clasificarlos como acciones de usuario o sistema
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Log from '../models/Log.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Acciones que se consideran del sistema (automáticas)
const SYSTEM_ACTIONS = ['read', 'export', 'list', 'fetch', 'get', 'search', 'view', 'query'];

// Acciones que se consideran del usuario (explícitas)
const USER_ACTIONS = ['create', 'update', 'delete', 'archive', 'restore', 'cancel', 'approve', 'reject'];

async function updateLogs() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Conectado a MongoDB\n');

    // 1. Contar logs sin clasificar
    const unclassifiedCount = await Log.countDocuments({ 
      isSystemAction: { $exists: false } 
    });
    console.log(`📊 Logs sin clasificar: ${unclassifiedCount}\n`);

    if (unclassifiedCount === 0) {
      console.log('✅ Todos los logs ya están clasificados');
      process.exit(0);
    }

    // 2. Actualizar logs según la acción
    console.log('🔄 Clasificando logs...\n');

    // Marcar como acciones del sistema (reads, exports, etc.)
    const systemActionsRegex = new RegExp(SYSTEM_ACTIONS.join('|'), 'i');
    const systemResult = await Log.updateMany(
      { 
        isSystemAction: { $exists: false },
        action: { $regex: systemActionsRegex }
      },
      { 
        $set: { isSystemAction: true },
        $addToSet: { tags: 'system' }
      }
    );
    console.log(`⚙️  Acciones del Sistema: ${systemResult.modifiedCount} logs actualizados`);

    // Marcar como acciones del usuario (create, update, delete, etc.)
    const userActionsRegex = new RegExp(USER_ACTIONS.join('|'), 'i');
    const userResult = await Log.updateMany(
      { 
        isSystemAction: { $exists: false },
        action: { $regex: userActionsRegex }
      },
      { 
        $set: { isSystemAction: false },
        $addToSet: { tags: 'user' }
      }
    );
    console.log(`👤 Acciones del Usuario: ${userResult.modifiedCount} logs actualizados`);

    // 3. Marcar el resto como acciones de usuario por defecto
    const remainingResult = await Log.updateMany(
      { isSystemAction: { $exists: false } },
      { 
        $set: { isSystemAction: false },
        $addToSet: { tags: 'user' }
      }
    );
    console.log(`📝 Logs sin clasificación clara (marcados como usuario): ${remainingResult.modifiedCount}\n`);

    // 4. Verificar resultados
    const systemCount = await Log.countDocuments({ isSystemAction: true });
    const userCount = await Log.countDocuments({ isSystemAction: false });
    const totalCount = await Log.countDocuments({});

    console.log('📊 Resumen Final:');
    console.log(`   Total de logs: ${totalCount}`);
    console.log(`   ⚙️  Acciones del Sistema: ${systemCount} (${((systemCount/totalCount)*100).toFixed(1)}%)`);
    console.log(`   👤 Acciones del Usuario: ${userCount} (${((userCount/totalCount)*100).toFixed(1)}%)`);

    // 5. Mostrar ejemplos
    console.log('\n📋 Ejemplos de clasificación:');
    
    const systemExamples = await Log.find({ isSystemAction: true }).limit(3).select('module action message');
    console.log('\n⚙️  Acciones del Sistema:');
    systemExamples.forEach(log => {
      console.log(`   - [${log.module}] ${log.action}: ${log.message}`);
    });

    const userExamples = await Log.find({ isSystemAction: false }).limit(3).select('module action message');
    console.log('\n👤 Acciones del Usuario:');
    userExamples.forEach(log => {
      console.log(`   - [${log.module}] ${log.action}: ${log.message}`);
    });

    console.log('\n✅ Actualización completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error al actualizar logs:', error);
    process.exit(1);
  }
}

// Ejecutar script
updateLogs();
