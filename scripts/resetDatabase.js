import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') });

// Importar modelos
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Sale from '../models/Sale.js';
import Return from '../models/Return.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import CashierSession from '../models/CashierSession.js';
import Settings from '../models/Settings.js';

console.log('\n🔄 Reiniciando base de datos...\n');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Conectado a MongoDB');
  } catch (error) {
    console.error('✗ Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Limpiar colecciones
    console.log('\n🗑️  Limpiando colecciones...');
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await Sale.deleteMany({});
    await Return.deleteMany({});
    await PurchaseOrder.deleteMany({});
    await CashierSession.deleteMany({});
    await Settings.deleteMany({});
    console.log('✓ Colecciones limpiadas\n');

    // 1. CREAR CONFIGURACIÓN
    console.log('1/9 Creando configuración...');
    await Settings.create({
      businessName: 'AutoParts Manager Demo',
      businessAddress: 'Av. Principal #123, Santo Domingo',
      businessPhone: '(809) 555-1234',
      businessEmail: 'info@autoparts.com',
      taxRate: 18,
      currency: 'DOP',
      businessLogoUrl: 'https://via.placeholder.com/150',
      receiptFooter: '¡Gracias por su compra! Vuelva pronto.',
      lowStockAlert: true,
      weatherLocation: 'Santo Domingo,DO',
      weatherApiKey: '',
      showWeather: true,
      autoCreatePurchaseOrders: false,
      autoOrderThreshold: 5,
      toastPosition: 'top-center',
    });

    // 2. CREAR USUARIOS
    console.log('2/9 Creando usuarios...');
    const admin = await User.create({
      name: 'Juan Pérez',
      email: 'admin@autoparts.com',
      password: 'admin123',
      role: 'admin'
    });

    const cajero = await User.create({
      name: 'María González',
      email: 'cajero@autoparts.com',
      password: 'admin123',
      role: 'cajero'
    });

    // 3. CREAR PROVEEDORES
    console.log('3/9 Creando proveedores...');
    const suppliers = await Supplier.insertMany([
      {
        name: 'Repuestos El Sol',
        contactName: 'Roberto Martínez',
        email: 'ventas@elsol.com',
        phone: '809-555-1111',
        address: 'Zona Industrial Herrera',
        rnc: '402-1111111-1',
        paymentTerms: '30 días'
      },
      {
        name: 'AutoPartes Dominicanas',
        contactName: 'Ana Díaz',
        email: 'info@autopartesdom.com',
        phone: '809-555-2222',
        address: 'Av. Duarte #456',
        rnc: '402-2222222-2',
        paymentTerms: 'Contado'
      },
      {
        name: 'Importadora Luna',
        contactName: 'Luis Luna',
        email: 'compras@luna.com',
        phone: '809-555-3333',
        address: 'Zona Franca Industrial',
        rnc: '402-3333333-3',
        paymentTerms: '15 días'
      }
    ]);

    // 4. CREAR CLIENTES
    console.log('4/9 Creando clientes...');
    const customers = await Customer.insertMany([
      {
        fullName: 'Pedro García',
        cedula: '402-1234567-1',
        phone: '809-111-1111',
        email: 'pedro.garcia@email.com',
        address: 'Calle Principal #12'
      },
      {
        fullName: 'Taller Mecánico Jiménez',
        cedula: '402-2345678-2',
        phone: '809-222-2222',
        email: 'taller.jimenez@email.com',
        address: 'Av. Independencia #234'
      },
      {
        fullName: 'Laura Santana',
        cedula: '402-3456789-3',
        phone: '809-333-3333',
        email: 'laura.santana@email.com',
        address: 'Urbanización La Fe #56'
      },
      {
        fullName: 'AutoServicio Central',
        cedula: '402-4567890-4',
        phone: '809-444-4444',
        email: 'central@autoservicio.com',
        address: 'Zona Colonial #789'
      },
      {
        fullName: 'Miguel Ángel Torres',
        cedula: '402-5678901-5',
        phone: '809-555-5555',
        email: 'ma.torres@email.com',
        address: 'Los Prados #123'
      }
    ]);

    // 5. CREAR PRODUCTOS
    console.log('5/9 Creando productos...');
    const products = await Product.insertMany([
      // Aceites
      {
        sku: 'ACE-001',
        name: 'Aceite Mobil 1 5W-30',
        category: 'Lubricantes',
        brand: 'Mobil',
        description: 'Aceite sintético premium',
        purchasePrice: 450,
        sellingPrice: 650,
        stock: 45,
        lowStockThreshold: 15,
        supplier: suppliers[0]._id
      },
      {
        sku: 'ACE-002',
        name: 'Aceite Castrol 10W-40',
        category: 'Lubricantes',
        brand: 'Castrol',
        description: 'Aceite mineral',
        purchasePrice: 320,
        sellingPrice: 480,
        stock: 60,
        lowStockThreshold: 20,
        supplier: suppliers[0]._id
      },
      {
        sku: 'ACE-003',
        name: 'Aceite Shell Helix 5W-40',
        category: 'Lubricantes',
        brand: 'Shell',
        description: 'Aceite semi-sintético',
        purchasePrice: 380,
        sellingPrice: 550,
        stock: 35,
        lowStockThreshold: 12,
        supplier: suppliers[0]._id
      },
      // Filtros
      {
        sku: 'FIL-001',
        name: 'Filtro de Aceite Fram PH3593A',
        category: 'Filtros',
        brand: 'Fram',
        description: 'Filtro de aceite universal',
        purchasePrice: 85,
        sellingPrice: 135,
        stock: 120,
        lowStockThreshold: 30,
        supplier: suppliers[1]._id
      },
      {
        sku: 'FIL-002',
        name: 'Filtro de Aire K&N E-1083',
        category: 'Filtros',
        brand: 'K&N',
        description: 'Filtro de aire alto flujo',
        purchasePrice: 450,
        sellingPrice: 680,
        stock: 25,
        lowStockThreshold: 8,
        supplier: suppliers[1]._id
      },
      {
        sku: 'FIL-003',
        name: 'Filtro de Combustible Wix 33032',
        category: 'Filtros',
        brand: 'Wix',
        description: 'Filtro de gasolina',
        purchasePrice: 95,
        sellingPrice: 150,
        stock: 5,
        lowStockThreshold: 15,
        supplier: suppliers[1]._id
      },
      // Frenos
      {
        sku: 'FRE-001',
        name: 'Pastillas Delanteras Brembo P85020',
        category: 'Frenos',
        brand: 'Brembo',
        description: 'Pastillas cerámicas',
        purchasePrice: 850,
        sellingPrice: 1250,
        stock: 18,
        lowStockThreshold: 8,
        supplier: suppliers[2]._id
      },
      {
        sku: 'FRE-002',
        name: 'Disco de Freno ATE 24.0122-0154.1',
        category: 'Frenos',
        brand: 'ATE',
        description: 'Disco ventilado delantero',
        purchasePrice: 1200,
        sellingPrice: 1800,
        stock: 0,
        lowStockThreshold: 6,
        supplier: suppliers[2]._id
      },
      {
        sku: 'FRE-003',
        name: 'Líquido de Frenos DOT 4',
        category: 'Frenos',
        brand: 'ATE',
        description: 'Líquido de frenos 1L',
        purchasePrice: 180,
        sellingPrice: 280,
        stock: 55,
        lowStockThreshold: 20,
        supplier: suppliers[2]._id
      },
      // Suspensión
      {
        sku: 'SUS-001',
        name: 'Amortiguador Monroe 801583',
        category: 'Suspensión',
        brand: 'Monroe',
        description: 'Amortiguador delantero gas',
        purchasePrice: 980,
        sellingPrice: 1450,
        stock: 12,
        lowStockThreshold: 6,
        supplier: suppliers[0]._id
      },
      {
        sku: 'SUS-002',
        name: 'Rotula Moog K80027',
        category: 'Suspensión',
        brand: 'Moog',
        description: 'Rótula superior',
        purchasePrice: 420,
        sellingPrice: 620,
        stock: 8,
        lowStockThreshold: 8,
        supplier: suppliers[0]._id
      },
      {
        sku: 'SUS-003',
        name: 'Terminal de Dirección TRW JTE1053',
        category: 'Suspensión',
        brand: 'TRW',
        description: 'Terminal externo',
        purchasePrice: 350,
        sellingPrice: 520,
        stock: 15,
        lowStockThreshold: 10,
        supplier: suppliers[0]._id
      },
      // Baterías
      {
        sku: 'BAT-001',
        name: 'Batería Optima YellowTop D34',
        category: 'Baterías',
        brand: 'Optima',
        description: 'Batería AGM 55Ah',
        purchasePrice: 4200,
        sellingPrice: 5800,
        stock: 8,
        lowStockThreshold: 4,
        supplier: suppliers[1]._id
      },
      {
        sku: 'BAT-002',
        name: 'Batería Bosch S4 60Ah',
        category: 'Baterías',
        brand: 'Bosch',
        description: 'Batería libre mantenimiento',
        purchasePrice: 2800,
        sellingPrice: 3900,
        stock: 12,
        lowStockThreshold: 5,
        supplier: suppliers[1]._id
      },
      // Llantas
      {
        sku: 'LLA-001',
        name: 'Llanta Michelin Primacy 4 205/55R16',
        category: 'Llantas',
        brand: 'Michelin',
        description: 'Llanta touring premium',
        purchasePrice: 3200,
        sellingPrice: 4500,
        stock: 16,
        lowStockThreshold: 8,
        supplier: suppliers[2]._id
      },
      {
        sku: 'LLA-002',
        name: 'Llanta Bridgestone Turanza T005 195/65R15',
        category: 'Llantas',
        brand: 'Bridgestone',
        description: 'Llanta confort',
        purchasePrice: 2800,
        sellingPrice: 3900,
        stock: 20,
        lowStockThreshold: 12,
        supplier: suppliers[2]._id
      },
      // Bujías
      {
        sku: 'BUJ-001',
        name: 'Bujías NGK Iridium IX BKR6EIX',
        category: 'Encendido',
        brand: 'NGK',
        description: 'Set 4 bujías iridio',
        purchasePrice: 280,
        sellingPrice: 420,
        stock: 40,
        lowStockThreshold: 16,
        supplier: suppliers[1]._id
      },
      {
        sku: 'BUJ-002',
        name: 'Cables de Bujía NGK RC-HE77',
        category: 'Encendido',
        brand: 'NGK',
        description: 'Set cables 8mm',
        purchasePrice: 520,
        sellingPrice: 780,
        stock: 15,
        lowStockThreshold: 8,
        supplier: suppliers[1]._id
      },
      // Correas
      {
        sku: 'COR-001',
        name: 'Correa de Distribución Gates T304',
        category: 'Correas',
        brand: 'Gates',
        description: 'Kit con tensor',
        purchasePrice: 1800,
        sellingPrice: 2600,
        stock: 3,
        lowStockThreshold: 6,
        supplier: suppliers[0]._id
      },
      {
        sku: 'COR-002',
        name: 'Correa Serpentina Dayco 5060895',
        category: 'Correas',
        brand: 'Dayco',
        description: 'Correa multi-accesorios',
        purchasePrice: 380,
        sellingPrice: 560,
        stock: 25,
        lowStockThreshold: 12,
        supplier: suppliers[0]._id
      },
      // Refrigeración
      {
        sku: 'REF-001',
        name: 'Radiador Spectra CU2816',
        category: 'Refrigeración',
        brand: 'Spectra',
        description: 'Radiador aluminio/plástico',
        purchasePrice: 2400,
        sellingPrice: 3500,
        stock: 4,
        lowStockThreshold: 4,
        supplier: suppliers[2]._id
      },
      {
        sku: 'REF-002',
        name: 'Termostato Stant 48708',
        category: 'Refrigeración',
        brand: 'Stant',
        description: 'Termostato 180°F',
        purchasePrice: 180,
        sellingPrice: 280,
        stock: 30,
        lowStockThreshold: 15,
        supplier: suppliers[2]._id
      },
      {
        sku: 'REF-003',
        name: 'Anticongelante Prestone 50/50',
        category: 'Refrigeración',
        brand: 'Prestone',
        description: 'Pre-mezclado 1 galón',
        purchasePrice: 280,
        sellingPrice: 420,
        stock: 45,
        lowStockThreshold: 20,
        supplier: suppliers[0]._id
      },
      // Luces
      {
        sku: 'LUZ-001',
        name: 'Foco H4 Philips X-treme Vision',
        category: 'Iluminación',
        brand: 'Philips',
        description: 'Foco halógeno +130% luz',
        purchasePrice: 450,
        sellingPrice: 650,
        stock: 35,
        lowStockThreshold: 15,
        supplier: suppliers[1]._id
      },
      {
        sku: 'LUZ-002',
        name: 'Kit LED H7 Osram LEDriving',
        category: 'Iluminación',
        brand: 'Osram',
        description: 'Conversión LED 6000K',
        purchasePrice: 1800,
        sellingPrice: 2600,
        stock: 10,
        lowStockThreshold: 6,
        supplier: suppliers[1]._id
      }
    ]);

    // 6. CREAR ÓRDENES DE COMPRA
    console.log('6/9 Creando órdenes de compra...');
    
    // Orden recibida
    const po1Items = [
      { product: products[0]._id, quantity: 50, unitPrice: 450, subtotal: 22500 },
      { product: products[1]._id, quantity: 60, unitPrice: 320, subtotal: 19200 }
    ];
    const po1Subtotal = 41700;
    await PurchaseOrder.create({
      supplier: suppliers[0]._id,
      items: po1Items,
      subtotal: po1Subtotal,
      tax: po1Subtotal * 0.18,
      total: po1Subtotal * 1.18,
      status: 'Recibida',
      orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      receivedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      notes: 'Pedido mensual de lubricantes',
      createdBy: admin._id
    });

    // Orden pendiente (producto agotado)
    const po2Items = [
      { product: products[7]._id, quantity: 15, unitPrice: 1200, subtotal: 18000 }
    ];
    await PurchaseOrder.create({
      supplier: suppliers[2]._id,
      items: po2Items,
      subtotal: 18000,
      tax: 3240,
      total: 21240,
      status: 'Pendiente',
      orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'URGENTE: Discos de freno agotados',
      createdBy: admin._id
    });

    // 7. CREAR VENTAS
    console.log('7/9 Creando ventas...');
    
    for (let i = 0; i < 20; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const saleDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      const numItems = Math.floor(Math.random() * 3) + 1;
      const saleItems = [];
      
      for (let j = 0; j < numItems; j++) {
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const itemSubtotal = randomProduct.sellingPrice * quantity;
        
        saleItems.push({
          product: randomProduct._id,
          quantity: quantity,
          priceAtSale: randomProduct.sellingPrice,
          discountApplied: 0,
          subtotal: itemSubtotal
        });
      }
      
      const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
      const total = subtotal;
      
      const paymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia'];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      const customer = Math.random() < 0.7 ? customers[Math.floor(Math.random() * customers.length)]._id : null;
      
      await Sale.create({
        invoiceNumber: `INV-${String(i + 1).padStart(6, '0')}`,
        user: Math.random() < 0.5 ? admin._id : cajero._id,
        customer: customer,
        items: saleItems,
        subtotal: subtotal,
        totalDiscount: 0,
        total: total,
        paymentMethod: paymentMethod,
        status: 'Completada',
        createdAt: saleDate
      });
    }

    // 8. CREAR DEVOLUCIONES
    console.log('8/9 Creando devoluciones...');
    
    const someSales = await Sale.find().limit(2).populate('items.product');
    
    for (const sale of someSales) {
      if (sale.items.length > 0 && sale.createdAt) {
        const returnItem = sale.items[0];
        const returnQuantity = 1;
        const returnAmount = returnItem.priceAtSale * returnQuantity;

        // Mapear método de pago
        let refundMethod = 'Efectivo';
        if (sale.paymentMethod === 'Tarjeta') refundMethod = 'Tarjeta';
        else if (sale.paymentMethod === 'Transferencia') refundMethod = 'Efectivo';

        await Return.create({
          sale: sale._id,
          customer: sale.customer,
          items: [{
            product: returnItem.product._id,
            quantity: returnQuantity,
            originalPrice: returnItem.priceAtSale,
            returnAmount: returnAmount
          }],
          reason: 'Defectuoso',
          totalAmount: returnAmount,
          refundMethod: refundMethod,
          processedBy: cajero._id,
          status: 'Completada',
          notes: 'Devolución procesada sin problemas'
        });
      }
    }

    // 9. CREAR SESIÓN DE CAJA (Opcional - se crea al usar el sistema)
    console.log('9/9 Sesión de caja... (se creará al usar el sistema)');

    console.log('\n✅ Base de datos poblada exitosamente!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 RESUMEN:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✓ Usuarios:           2`);
    console.log(`✓ Proveedores:        3`);
    console.log(`✓ Clientes:           5`);
    console.log(`✓ Productos:          25`);
    console.log(`✓ Órdenes de Compra:  2`);
    console.log(`✓ Ventas:             20`);
    console.log(`✓ Devoluciones:       2`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🔑 CREDENCIALES:');
    console.log('   Admin:  admin@autoparts.com / admin123');
    console.log('   Cajero: cajero@autoparts.com / admin123');
    console.log('═══════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
