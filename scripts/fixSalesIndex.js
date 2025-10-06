import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixSalesIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://Edgar:C5OQOquuiKdkNFyy@cluster0.fmycxxx.mongodb.net/TiendaRepuestos');
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    
    // Listar todos los índices
    const indexes = await db.collection('sales').indexes();
    console.log('📋 Índices actuales:', indexes.map(i => i.name));

    // Eliminar el índice antiguo saleNumber_1
    try {
      await db.collection('sales').dropIndex('saleNumber_1');
      console.log('✅ Índice saleNumber_1 eliminado correctamente');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  El índice saleNumber_1 no existe (ya fue eliminado)');
      } else {
        throw error;
      }
    }

    // Listar índices después de eliminar
    const indexesAfter = await db.collection('sales').indexes();
    console.log('📋 Índices después de limpiar:', indexesAfter.map(i => i.name));

    await mongoose.connection.close();
    console.log('✅ Operación completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixSalesIndex();
