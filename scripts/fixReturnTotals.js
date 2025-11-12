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

const fixReturnTotals = async () => {
  try {
    await connectDB();

    const Return = mongoose.model('Return', new mongoose.Schema({}, { strict: false }));

    console.log('\n🔧 Buscando devoluciones sin total calculado...\n');

    // Buscar todas las devoluciones y filtrar las que no tienen total válido
    const allReturns = await Return.find({});
    const returns = allReturns.filter(ret => 
      ret.total === undefined || 
      ret.total === null || 
      !ret.total ||
      isNaN(ret.total)
    );

    console.log(`📊 Total de devoluciones: ${allReturns.length}`);
    console.log(`📊 Devoluciones sin total válido: ${returns.length}\n`);

    if (returns.length === 0) {
      console.log('✅ Todas las devoluciones ya tienen su total calculado');
      process.exit(0);
    }

    let updated = 0;
    let errors = 0;

    for (const returnDoc of returns) {
      try {
        // Calcular total basado en items
        let calculatedTotal = 0;
        
        if (returnDoc.items && returnDoc.items.length > 0) {
          for (const item of returnDoc.items) {
            // Calcular: cantidad * precio original
            const itemTotal = (item.quantity || 0) * (item.originalPrice || item.returnAmount || 0);
            calculatedTotal += itemTotal;
          }
        }

        // Actualizar el documento
        await Return.updateOne(
          { _id: returnDoc._id },
          { $set: { total: calculatedTotal } }
        );

        console.log(`✅ ${returnDoc.returnNumber || returnDoc._id}: Total = $${calculatedTotal.toFixed(2)}`);
        console.log(`   Items: ${returnDoc.items?.length || 0} productos`);
        
        updated++;
      } catch (error) {
        console.error(`❌ Error en ${returnDoc.returnNumber || returnDoc._id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n📈 Resumen:`);
    console.log(`   ✅ Actualizadas: ${updated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`\n✅ Script completado\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixReturnTotals();
