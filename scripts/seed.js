import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Settings from '../models/Settings.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Iniciando seeding de la base de datos...');

    // Eliminar colecciones completamente para evitar problemas de índices
    try {
      await mongoose.connection.db.dropCollection('users');
      console.log('🗑️  Colección users eliminada');
    } catch (err) {
      console.log('ℹ️  Colección users no existía');
    }

    try {
      await mongoose.connection.db.dropCollection('settings');
      console.log('🗑️  Colección settings eliminada');
    } catch (err) {
      console.log('ℹ️  Colección settings no existía');
    }

    try {
      await mongoose.connection.db.dropCollection('products');
      console.log('🗑️  Colección products eliminada');
    } catch (err) {
      console.log('ℹ️  Colección products no existía');
    }

    try {
      await mongoose.connection.db.dropCollection('suppliers');
      console.log('🗑️  Colección suppliers eliminada');
    } catch (err) {
      console.log('ℹ️  Colección suppliers no existía');
    }

    console.log('✨ Base de datos lista para seeding');

    // Crear usuario administrador
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'Administrador',
      email: process.env.ADMIN_EMAIL || 'admin@autoparts.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'admin'
    });

    console.log('✅ Usuario administrador creado:', adminUser.email);

    // Crear usuario cajero de prueba
    const cashierUser = await User.create({
      name: 'Juan Pérez',
      email: 'cajero@autoparts.com',
      password: 'Cajero123!',
      role: 'cajero'
    });

    console.log('✅ Usuario cajero creado:', cashierUser.email);

    // Crear proveedores de ejemplo
    const suppliers = await Supplier.insertMany([
      {
        name: 'Repuestos del Caribe',
        contactName: 'Carlos Rodríguez',
        email: 'ventas@repuestoscaribe.com',
        phone: '809-555-1111',
        address: 'Calle Principal #45, Santo Domingo',
        rnc: '101234567',
        paymentTerms: '30 días',
        notes: 'Proveedor principal de filtros y aceites',
      },
      {
        name: 'Autopartes Dominicanas',
        contactName: 'María González',
        email: 'info@autopartesrd.com',
        phone: '809-555-2222',
        address: 'Av. Independencia #789, Santo Domingo',
        rnc: '102345678',
        paymentTerms: '15 días',
        notes: 'Especializado en frenos y suspensión',
      },
      {
        name: 'Importadora Global Parts',
        contactName: 'Juan Martínez',
        email: 'ventas@globalparts.com',
        phone: '809-555-3333',
        address: 'Zona Industrial Herrera, Santiago',
        rnc: '103456789',
        paymentTerms: '45 días',
        notes: 'Importador de piezas originales',
      },
    ]);

    console.log('✅ Proveedores creados:', suppliers.length);

    // Crear configuración inicial
    const settings = await Settings.create({
      businessName: 'AutoParts Manager',
      businessAddress: 'Av. Principal #123, Santo Domingo',
      businessPhone: '809-555-1234',
      businessEmail: 'info@autoparts.com',
      taxRate: 18,
      currency: 'DOP',
      receiptFooter: '¡Gracias por su compra! Vuelva pronto.',
      lowStockAlert: true
    });

    console.log('✅ Configuración inicial creada');

    // Crear productos de ejemplo con proveedores asignados
    const sampleProducts = [
      {
        sku: 'BRK-001',
        name: 'Pastillas de Freno Delanteras',
        description: 'Pastillas de freno de alta calidad para vehículos compactos',
        brand: 'Brembo',
        category: 'Frenos',
        purchasePrice: 800,
        sellingPrice: 1200,
        stock: 25,
        lowStockThreshold: 5,
        soldCount: 45, // Producto más vendido
        supplier: suppliers[1]._id, // Autopartes Dominicanas
        supplierSKU: 'APD-BRK-001'
      },
      {
        sku: 'FLT-002',
        name: 'Filtro de Aceite',
        description: 'Filtro de aceite estándar compatible con múltiples marcas',
        brand: 'Mann Filter',
        category: 'Filtros',
        purchasePrice: 150,
        sellingPrice: 250,
        stock: 50,
        lowStockThreshold: 10,
        soldCount: 38, // Segundo más vendido
        supplier: suppliers[0]._id, // Repuestos del Caribe
        supplierSKU: 'RDC-FLT-002'
      },
      {
        sku: 'SPK-003',
        name: 'Bujías de Encendido (Set de 4)',
        description: 'Bujías de encendido de larga duración',
        brand: 'NGK',
        category: 'Sistema de Encendido',
        purchasePrice: 400,
        sellingPrice: 650,
        stock: 30,
        lowStockThreshold: 8,
        soldCount: 32,
        supplier: suppliers[2]._id, // Importadora Global Parts
        supplierSKU: 'IGP-SPK-003'
      },
      {
        sku: 'BTR-004',
        name: 'Batería 12V 60Ah',
        description: 'Batería de alto rendimiento',
        brand: 'Varta',
        category: 'Sistema Eléctrico',
        purchasePrice: 2500,
        sellingPrice: 3500,
        stock: 15,
        lowStockThreshold: 3,
        soldCount: 18,
        supplier: suppliers[2]._id, // Importadora Global Parts
        supplierSKU: 'IGP-BTR-004'
      },
      {
        sku: 'TYR-005',
        name: 'Neumático 185/65 R15',
        description: 'Neumático para sedán mediano',
        brand: 'Michelin',
        category: 'Neumáticos',
        purchasePrice: 1800,
        sellingPrice: 2800,
        stock: 20,
        lowStockThreshold: 4,
        soldCount: 24,
        supplier: suppliers[2]._id, // Importadora Global Parts
        supplierSKU: 'IGP-TYR-005'
      },
      {
        sku: 'OIL-006',
        name: 'Aceite de Motor 5W-30 (4L)',
        description: 'Aceite sintético de alta calidad',
        brand: 'Castrol',
        category: 'Lubricantes',
        purchasePrice: 600,
        sellingPrice: 950,
        stock: 40,
        lowStockThreshold: 10,
        discountPercentage: 5,
        soldCount: 42, // Muy popular, con descuento
        supplier: suppliers[0]._id, // Repuestos del Caribe
        supplierSKU: 'RDC-OIL-006'
      },
      {
        sku: 'WPR-007',
        name: 'Plumillas Limpiaparabrisas (Par)',
        description: 'Plumillas universales de 18 pulgadas',
        brand: 'Bosch',
        category: 'Accesorios',
        purchasePrice: 200,
        sellingPrice: 350,
        stock: 35,
        lowStockThreshold: 8,
        soldCount: 28,
        supplier: suppliers[1]._id, // Autopartes Dominicanas
        supplierSKU: 'APD-WPR-007'
      },
      {
        sku: 'CLT-008',
        name: 'Líquido Refrigerante (1L)',
        description: 'Refrigerante anticongelante',
        brand: 'Prestone',
        category: 'Líquidos',
        purchasePrice: 180,
        sellingPrice: 300,
        stock: 45,
        lowStockThreshold: 12,
        soldCount: 35,
        supplier: suppliers[0]._id, // Repuestos del Caribe
        supplierSKU: 'RDC-CLT-008'
      },
      {
        sku: 'BLB-009',
        name: 'Bombillo H4 12V',
        description: 'Bombillo halógeno para faros',
        brand: 'Philips',
        category: 'Sistema Eléctrico',
        purchasePrice: 120,
        sellingPrice: 200,
        stock: 60,
        lowStockThreshold: 15,
        soldCount: 52, // Muy vendido (barato y necesario)
        supplier: suppliers[1]._id, // Autopartes Dominicanas
        supplierSKU: 'APD-BLB-009'
      },
      {
        sku: 'AIR-010',
        name: 'Filtro de Aire',
        description: 'Filtro de aire de alto flujo',
        brand: 'K&N',
        category: 'Filtros',
        purchasePrice: 280,
        sellingPrice: 450,
        stock: 3,
        lowStockThreshold: 5,
        soldCount: 12,
        supplier: suppliers[0]._id, // Repuestos del Caribe
        supplierSKU: 'RDC-AIR-010'
      }
    ];

    const products = await Product.insertMany(sampleProducts);

    console.log(`✅ ${products.length} productos de ejemplo creados`);

    console.log('\n🎉 Seeding completado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('━'.repeat(50));
    console.log(`👤 Admin - Email: ${adminUser.email}`);
    console.log(`   Contraseña: ${process.env.ADMIN_PASSWORD || 'Admin123!'}`);
    console.log(`👤 Cajero - Email: ${cashierUser.email}`);
    console.log(`   Contraseña: Cajero123!`);
    console.log('━'.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
