import mongoose from 'mongoose';
import dotenv from 'dotenv';
import LogService from '../services/logService.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const cleanLogs = async () => {
  try {
    await connectDB();

    console.log('\n🧹 LIMPIEZA MANUAL DE LOGS\n');
    console.log('═'.repeat(50));
    
    const env = process.env.NODE_ENV || 'development';
    console.log(`\n📍 Entorno: ${env}`);
    console.log('\n📋 Política de retención:');
    
    const retention = LogService.LOG_RETENTION[env];
    console.log(`   - INFO:     ${retention.info} días`);
    console.log(`   - WARNING:  ${retention.warning} días`);
    console.log(`   - ERROR:    ${retention.error} días`);
    console.log(`   - CRITICAL: ${retention.critical} días (no se eliminan automáticamente)`);
    
    console.log('\n⏳ Ejecutando limpieza...\n');
    
    const results = await LogService.cleanOldLogsByType();
    
    console.log('\n═'.repeat(50));
    console.log(`\n✅ Limpieza completada: ${results.deleted} logs eliminados\n`);
    
    if (results.deleted === 0) {
      console.log('   ℹ️  No hay logs antiguos para eliminar');
    }
    
    console.log('\n💡 Tip: Esta limpieza se ejecuta automáticamente cada 24 horas');
    console.log('   en el servidor cuando está activo.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
};

cleanLogs();
