import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

const checkReturns = async () => {
  try {
    await connectDB();

    const Sale = mongoose.model('Sale', new mongoose.Schema({}, { strict: false }));
    const Return = mongoose.model('Return', new mongoose.Schema({}, { strict: false }));

    console.log('\n🔍 Verificando devoluciones en la base de datos...\n');

    // Contar ventas
    const totalSales = await Sale.countDocuments();
    console.log(`📊 Total de ventas: ${totalSales}`);

    // Contar devoluciones
    const totalReturns = await Return.countDocuments();
    console.log(`🔄 Total de devoluciones: ${totalReturns}`);

    if (totalReturns > 0) {
      console.log('\n📋 Devoluciones encontradas:');
      const returns = await Return.find().populate('sale').limit(5);
      
      returns.forEach((ret, index) => {
        console.log(`\n  ${index + 1}. Devolución: ${ret.returnNumber || ret._id}`);
        console.log(`     Sale ID: ${ret.sale?._id || ret.sale || 'N/A'}`);
        console.log(`     Invoice: ${ret.sale?.invoiceNumber || 'N/A'}`);
        console.log(`     Status: ${ret.status}`);
        console.log(`     Total: $${ret.total || 0}`);
        console.log(`     Fecha: ${ret.createdAt}`);
      });

      // Verificar ventas con devoluciones
      console.log('\n🔗 Verificando relación venta-devolución...');
      const saleIds = returns.map(r => r.sale?._id || r.sale).filter(Boolean);
      
      for (const saleId of saleIds.slice(0, 3)) {
        const returnsForSale = await Return.find({ sale: saleId });
        console.log(`\n  Sale ${saleId}:`);
        console.log(`    Tiene ${returnsForSale.length} devolución(es)`);
      }
    } else {
      console.log('\n⚠️  No hay devoluciones en la base de datos');
      console.log('   Para probar la funcionalidad, crea una devolución desde el sistema');
    }

    console.log('\n✅ Verificación completada\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkReturns();
