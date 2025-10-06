import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Sale from '../models/Sale.js';

dotenv.config();

const checkSales = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB conectado');

    // Obtener todas las ventas
    const allSales = await Sale.find().sort({ createdAt: -1 }).limit(10);
    console.log('\n📊 Total de ventas:', await Sale.countDocuments());
    
    if (allSales.length > 0) {
      console.log('\n🔍 Últimas 10 ventas:');
      allSales.forEach((sale, i) => {
        console.log(`${i + 1}. Invoice: ${sale.invoiceNumber}, Fecha: ${sale.createdAt}, Total: $${sale.total}`);
      });

      // Ventas de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todaySales = await Sale.find({
        createdAt: { $gte: today, $lt: tomorrow }
      });

      console.log(`\n📅 Ventas de hoy (${today.toLocaleDateString()}):`, todaySales.length);
      if (todaySales.length > 0) {
        todaySales.forEach(sale => {
          console.log(`   - Invoice: ${sale.invoiceNumber}, Hora: ${sale.createdAt.toLocaleTimeString()}, Total: $${sale.total}`);
        });
      }
    } else {
      console.log('❌ No hay ventas en la base de datos');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkSales();
