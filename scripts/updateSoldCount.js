import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

// Cargar variables de entorno
dotenv.config();

const updateSoldCount = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    // Actualizar todos los productos que no tienen soldCount
    const result = await Product.updateMany(
      { soldCount: { $exists: false } },
      { $set: { soldCount: 0 } }
    );

    console.log(`✅ ${result.modifiedCount} productos actualizados con soldCount: 0`);

    // Cerrar conexión
    await mongoose.connection.close();
    console.log('✅ Conexión cerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateSoldCount();
