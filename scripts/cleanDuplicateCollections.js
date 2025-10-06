import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

dotenv.config();

const cleanDuplicateCollections = async () => {
  try {
    await connectDB();

    console.log('🧹 Iniciando limpieza de colecciones duplicadas...\n');

    const db = mongoose.connection.db;

    // 1. Verificar y migrar datos útiles de businessinfos a settings
    console.log('📋 Revisando businessinfos...');
    const businessInfos = await db.collection('businessinfos').find({}).toArray();
    if (businessInfos.length > 0) {
      console.log(`   Encontrados ${businessInfos.length} documentos en businessinfos`);
      const businessInfo = businessInfos[0];
      
      // Verificar si settings tiene estos datos
      const settings = await db.collection('settings').findOne({});
      if (settings) {
        let needsUpdate = false;
        const updates = {};

        // Migrar campos útiles que no existan en settings
        if (businessInfo.commercialName && !settings.businessName) {
          updates.businessName = businessInfo.commercialName;
          needsUpdate = true;
        }
        if (businessInfo.address && !settings.businessAddress) {
          updates.businessAddress = businessInfo.address;
          needsUpdate = true;
        }
        if (businessInfo.phone && !settings.businessPhone) {
          updates.businessPhone = businessInfo.phone;
          needsUpdate = true;
        }
        if (businessInfo.email && !settings.businessEmail) {
          updates.businessEmail = businessInfo.email;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await db.collection('settings').updateOne({ _id: settings._id }, { $set: updates });
          console.log('   ✅ Datos útiles migrados a settings');
        } else {
          console.log('   ℹ️  Settings ya tiene toda la información necesaria');
        }
      }
    } else {
      console.log('   ℹ️  businessinfos está vacía');
    }

    // 2. Verificar y migrar datos de systemsettings a settings
    console.log('\n📋 Revisando systemsettings...');
    const systemSettings = await db.collection('systemsettings').find({}).toArray();
    if (systemSettings.length > 0) {
      console.log(`   Encontrados ${systemSettings.length} documentos en systemsettings`);
      const systemSetting = systemSettings[0];
      
      const settings = await db.collection('settings').findOne({});
      if (settings) {
        let needsUpdate = false;
        const updates = {};

        if (systemSetting.taxRate && !settings.taxRate) {
          updates.taxRate = systemSetting.taxRate;
          needsUpdate = true;
        }
        if (systemSetting.currencySymbol && !settings.currency) {
          updates.currency = systemSetting.currencySymbol;
          needsUpdate = true;
        }
        if (systemSetting.logoUrl && !settings.businessLogoUrl) {
          updates.businessLogoUrl = systemSetting.logoUrl;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await db.collection('settings').updateOne({ _id: settings._id }, { $set: updates });
          console.log('   ✅ Datos útiles migrados a settings');
        } else {
          console.log('   ℹ️  Settings ya tiene toda la información necesaria');
        }
      }
    } else {
      console.log('   ℹ️  systemsettings está vacía');
    }

    // 3. Eliminar colecciones duplicadas/no usadas
    console.log('\n🗑️  Eliminando colecciones duplicadas...\n');

    const collectionsToDelete = ['businessinfos', 'systemsettings', 'cashregisters'];

    for (const collectionName of collectionsToDelete) {
      try {
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length > 0) {
          await db.collection(collectionName).drop();
          console.log(`   ✅ Colección "${collectionName}" eliminada`);
        } else {
          console.log(`   ℹ️  Colección "${collectionName}" no existe`);
        }
      } catch (error) {
        if (error.message.includes('ns not found')) {
          console.log(`   ℹ️  Colección "${collectionName}" no existe`);
        } else {
          console.log(`   ⚠️  Error al eliminar "${collectionName}": ${error.message}`);
        }
      }
    }

    // 4. Resumen de colecciones restantes
    console.log('\n📊 Colecciones restantes:');
    const collections = await db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    console.log('\n✨ Limpieza completada exitosamente\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la limpieza:', error);
    process.exit(1);
  }
};

cleanDuplicateCollections();
