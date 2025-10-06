import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

// Colecciones que usa este sistema
const SYSTEM_COLLECTIONS = [
  'users',
  'customers',
  'suppliers',
  'products',
  'sales',
  'returns',
  'purchaseorders',
  'cashiersessions',
  'settings'
];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.magenta}➜${colors.reset} ${msg}`)
};

// Conectar a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log.success('Conectado a MongoDB');
  } catch (error) {
    log.error('Error conectando a MongoDB:', error);
    process.exit(1);
  }
};

// Listar todas las colecciones
const listAllCollections = async () => {
  const collections = await mongoose.connection.db.listCollections().toArray();
  return collections.map(c => c.name);
};

// Crear backup de colecciones del sistema
const createBackup = async () => {
  log.step('Creando backup de colecciones del sistema...');
  
  const allCollections = await listAllCollections();
  const systemCollectionsFound = allCollections.filter(c => 
    SYSTEM_COLLECTIONS.includes(c.toLowerCase())
  );

  if (systemCollectionsFound.length === 0) {
    log.info('No hay colecciones del sistema para respaldar');
    return;
  }

  const backupData = {};
  
  for (const collectionName of systemCollectionsFound) {
    const collection = mongoose.connection.db.collection(collectionName);
    const count = await collection.countDocuments();
    backupData[collectionName] = count;
    log.info(`  - ${collectionName}: ${count} documentos`);
  }

  log.success(`Backup info guardado: ${systemCollectionsFound.length} colecciones`);
  return backupData;
};

// Limpiar solo las colecciones del sistema
const cleanSystemCollections = async () => {
  log.step('Limpiando colecciones del sistema...');
  
  const allCollections = await listAllCollections();
  const systemCollectionsFound = allCollections.filter(c => 
    SYSTEM_COLLECTIONS.includes(c.toLowerCase())
  );

  for (const collectionName of systemCollectionsFound) {
    const collection = mongoose.connection.db.collection(collectionName);
    await collection.deleteMany({});
    log.success(`  ✓ ${collectionName} limpiada`);
  }

  // Verificar colecciones que NO son del sistema
  const otherCollections = allCollections.filter(c => 
    !SYSTEM_COLLECTIONS.includes(c.toLowerCase())
  );

  if (otherCollections.length > 0) {
    log.warning('\n⚠️  Colecciones preservadas (de otros proyectos):');
    otherCollections.forEach(c => log.warning(`  - ${c}`));
  }
};

// Datos de demostración
const seedData = async () => {
  log.step('\nGenerando datos de demostración...\n');

  // 1. CREAR CONFIGURACIÓN
  log.info('1/9 - Creando configuración del sistema...');
  const settings = await Settings.create({
    businessName: 'AutoParts Manager Demo',
    address: 'Av. Principal #123, Santo Domingo, República Dominicana',
    phone: '(809) 555-1234',
    email: 'info@autopartsdemo.com',
    taxId: '402-1234567-8',
    taxRate: 18,
    currency: 'DOP',
    logo: 'https://via.placeholder.com/150x80?text=AutoParts',
    lowStockThreshold: 10,
    enableNotifications: true,
  });
  log.success('  ✓ Configuración creada');

  // 2. CREAR USUARIOS
  log.info('2/9 - Creando usuarios...');
  
  const adminUser = await User.create({
    name: 'Juan Pérez',
    email: 'admin@autoparts.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  });

  const cashierUser = await User.create({
    name: 'María González',
    email: 'cajero@autoparts.com',
    password: 'admin123',
    role: 'cajero',
    isActive: true
  });

  const managerUser = await User.create({
    name: 'Carlos Rodríguez',
    email: 'gerente@autoparts.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  });

  log.success(`  ✓ ${3} usuarios creados (admin@autoparts.com, cajero@autoparts.com, gerente@autoparts.com - password: admin123)`);

  // 3. CREAR PROVEEDORES
  log.info('3/9 - Creando proveedores...');
  const suppliers = await Supplier.insertMany([
    {
      name: 'Repuestos El Sol',
      contactPerson: 'Roberto Martínez',
      email: 'ventas@elsol.com',
      phone: '809-555-1111',
      address: 'Zona Industrial Herrera',
      taxId: '402-1111111-1',
      isActive: true
    },
    {
      name: 'AutoPartes Dominicanas',
      contactPerson: 'Ana Díaz',
      email: 'info@autopartesdom.com',
      phone: '809-555-2222',
      address: 'Av. Duarte #456',
      taxId: '402-2222222-2',
      isActive: true
    },
    {
      name: 'Importadora Luna',
      contactPerson: 'Luis Luna',
      email: 'compras@lunaimport.com',
      phone: '809-555-3333',
      address: 'Zona Franca Industrial',
      taxId: '402-3333333-3',
      isActive: true
    },
    {
      name: 'Distribuidora América',
      contactPerson: 'Sandra Pérez',
      email: 'ventas@america.com',
      phone: '809-555-4444',
      address: 'Carretera Mella Km 9',
      taxId: '402-4444444-4',
      isActive: true
    },
    {
      name: 'Lubricantes Premium',
      contactPerson: 'Jorge Castillo',
      email: 'info@lubripremium.com',
      phone: '809-555-5555',
      address: 'Av. Venezuela #789',
      taxId: '402-5555555-5',
      isActive: true
    }
  ]);
  log.success(`  ✓ ${suppliers.length} proveedores creados`);

  // 4. CREAR CLIENTES
  log.info('4/9 - Creando clientes...');
  const customers = await Customer.insertMany([
    {
      fullName: 'Pedro García',
      email: 'pedro.garcia@email.com',
      phone: '809-111-1111',
      address: 'Calle Principal #12, Santo Domingo',
      taxId: '402-1234567-1',
      customerType: 'retail',
      isActive: true,
      notes: 'Cliente frecuente, buen historial de pagos'
    },
    {
      fullName: 'Taller Mecánico Jiménez',
      email: 'taller.jimenez@email.com',
      phone: '809-222-2222',
      address: 'Av. Independencia #234',
      taxId: '402-2345678-2',
      customerType: 'wholesale',
      isActive: true,
      notes: 'Taller con 15 años de experiencia'
    },
    {
      fullName: 'Laura Santana',
      email: 'laura.santana@email.com',
      phone: '809-333-3333',
      address: 'Urbanización La Fe #56',
      taxId: '402-3456789-3',
      customerType: 'retail',
      isActive: true
    },
    {
      fullName: 'AutoServicio Central',
      email: 'central@autoservicio.com',
      phone: '809-444-4444',
      address: 'Zona Colonial #789',
      taxId: '402-4567890-4',
      customerType: 'wholesale',
      isActive: true,
      notes: 'Centro de servicio autorizado'
    },
    {
      fullName: 'Miguel Ángel Torres',
      email: 'ma.torres@email.com',
      phone: '809-555-5555',
      address: 'Los Prados #123',
      taxId: '402-5678901-5',
      customerType: 'retail',
      isActive: true
    },
    {
      fullName: 'Comercial Rodríguez',
      email: 'comercial.rod@email.com',
      phone: '809-666-6666',
      address: 'Av. Luperón #456',
      taxId: '402-6789012-6',
      customerType: 'wholesale',
      isActive: true
    },
    {
      fullName: 'Carmen Fernández',
      email: 'carmen.f@email.com',
      phone: '809-777-7777',
      address: 'Bella Vista #34',
      taxId: '402-7890123-7',
      customerType: 'retail',
      isActive: true
    },
    {
      fullName: 'Taller Express',
      email: 'taller.express@email.com',
      phone: '809-888-8888',
      address: 'Charles de Gaulle #567',
      taxId: '402-8901234-8',
      customerType: 'wholesale',
      isActive: true,
      notes: 'Servicio rápido y eficiente'
    },
    {
      fullName: 'José Manuel Ortiz',
      email: 'jm.ortiz@email.com',
      phone: '809-999-9999',
      address: 'Naco #890',
      taxId: '402-9012345-9',
      customerType: 'retail',
      isActive: true
    },
    {
      fullName: 'AutoParts Solutions',
      email: 'solutions@autoparts.com',
      phone: '809-101-0101',
      address: 'Piantini #123',
      taxId: '402-0123456-0',
      customerType: 'wholesale',
      isActive: true,
      notes: 'Distribuidor regional'
    }
  ]);
  log.success(`  ✓ ${customers.length} clientes creados`);

  // 5. CREAR PRODUCTOS
  log.info('5/9 - Creando productos...');
  const products = await Product.insertMany([
    // Aceites
    {
      sku: 'ACE-001',
      name: 'Aceite Mobil 1 5W-30',
      category: 'Lubricantes',
      brand: 'Mobil',
      description: 'Aceite sintético premium para motor',
      purchasePrice: 450,
      salePrice: 650,
      stock: 45,
      lowStockThreshold: 15,
      reorderPoint: 30,
      supplier: suppliers[4]._id,
      isActive: true
    },
    {
      sku: 'ACE-002',
      name: 'Aceite Castrol 10W-40',
      category: 'Lubricantes',
      brand: 'Castrol',
      description: 'Aceite mineral para motor',
      purchasePrice: 320,
      salePrice: 480,
      stock: 60,
      lowStockThreshold: 20,
      reorderPoint: 40,
      supplier: suppliers[4]._id,
      isActive: true
    },
    {
      sku: 'ACE-003',
      name: 'Aceite Shell Helix 5W-40',
      category: 'Lubricantes',
      brand: 'Shell',
      description: 'Aceite semi-sintético',
      purchasePrice: 380,
      salePrice: 550,
      stock: 35,
      lowStockThreshold: 12,
      reorderPoint: 25,
      supplier: suppliers[4]._id,
      isActive: true
    },
    // Filtros
    {
      sku: 'FIL-001',
      name: 'Filtro de Aceite Fram PH3593A',
      category: 'Filtros',
      brand: 'Fram',
      description: 'Filtro de aceite universal',
      purchasePrice: 85,
      salePrice: 135,
      stock: 120,
      lowStockThreshold: 30,
      reorderPoint: 60,
      supplier: suppliers[0]._id,
      isActive: true
    },
    {
      sku: 'FIL-002',
      name: 'Filtro de Aire K&N E-1083',
      category: 'Filtros',
      brand: 'K&N',
      description: 'Filtro de aire de alto flujo',
      purchasePrice: 450,
      salePrice: 680,
      stock: 25,
      lowStockThreshold: 8,
      reorderPoint: 15,
      supplier: suppliers[0]._id,
      isActive: true
    },
    {
      sku: 'FIL-003',
      name: 'Filtro de Combustible Wix 33032',
      category: 'Filtros',
      brand: 'Wix',
      description: 'Filtro de gasolina',
      purchasePrice: 95,
      salePrice: 150,
      stock: 5,
      lowStockThreshold: 15,
      reorderPoint: 30,
      supplier: suppliers[0]._id,
      isActive: true
    },
    {
      sku: 'FIL-004',
      name: 'Filtro de Cabina Mann CU 2442',
      category: 'Filtros',
      brand: 'Mann',
      description: 'Filtro de polen y polvo',
      purchasePrice: 120,
      salePrice: 190,
      stock: 40,
      lowStockThreshold: 15,
      reorderPoint: 30,
      supplier: suppliers[0]._id,
      isActive: true
    },
    // Frenos
    {
      sku: 'FRE-001',
      name: 'Pastillas Delanteras Brembo P85020',
      category: 'Frenos',
      brand: 'Brembo',
      description: 'Pastillas de freno cerámicas',
      purchasePrice: 850,
      salePrice: 1250,
      stock: 18,
      lowStockThreshold: 8,
      reorderPoint: 16,
      supplier: suppliers[1]._id,
      isActive: true
    },
    {
      sku: 'FRE-002',
      name: 'Disco de Freno ATE 24.0122-0154.1',
      category: 'Frenos',
      brand: 'ATE',
      description: 'Disco ventilado delantero',
      purchasePrice: 1200,
      salePrice: 1800,
      stock: 0,
      lowStockThreshold: 6,
      reorderPoint: 12,
      supplier: suppliers[1]._id,
      isActive: true
    },
    {
      sku: 'FRE-003',
      name: 'Líquido de Frenos DOT 4',
      category: 'Frenos',
      brand: 'ATE',
      description: 'Líquido de frenos 1L',
      purchasePrice: 180,
      salePrice: 280,
      stock: 55,
      lowStockThreshold: 20,
      reorderPoint: 40,
      supplier: suppliers[1]._id,
      isActive: true
    },
    // Suspensión
    {
      sku: 'SUS-001',
      name: 'Amortiguador Monroe 801583',
      category: 'Suspensión',
      brand: 'Monroe',
      description: 'Amortiguador delantero gas',
      purchasePrice: 980,
      salePrice: 1450,
      stock: 12,
      lowStockThreshold: 6,
      reorderPoint: 12,
      supplier: suppliers[2]._id,
      isActive: true
    },
    {
      sku: 'SUS-002',
      name: 'Rotula Moog K80027',
      category: 'Suspensión',
      brand: 'Moog',
      description: 'Rótula superior',
      purchasePrice: 420,
      salePrice: 620,
      stock: 8,
      lowStockThreshold: 8,
      reorderPoint: 16,
      supplier: suppliers[2]._id,
      isActive: true
    },
    {
      sku: 'SUS-003',
      name: 'Terminal de Dirección TRW JTE1053',
      category: 'Suspensión',
      brand: 'TRW',
      description: 'Terminal externo',
      purchasePrice: 350,
      salePrice: 520,
      stock: 15,
      lowStockThreshold: 10,
      reorderPoint: 20,
      supplier: suppliers[2]._id,
      isActive: true
    },
    // Baterías
    {
      sku: 'BAT-001',
      name: 'Batería Optima YellowTop D34',
      category: 'Baterías',
      brand: 'Optima',
      description: 'Batería AGM 55Ah',
      purchasePrice: 4200,
      salePrice: 5800,
      stock: 8,
      lowStockThreshold: 4,
      reorderPoint: 8,
      supplier: suppliers[3]._id,
      isActive: true
    },
    {
      sku: 'BAT-002',
      name: 'Batería Bosch S4 60Ah',
      category: 'Baterías',
      brand: 'Bosch',
      description: 'Batería libre mantenimiento',
      purchasePrice: 2800,
      salePrice: 3900,
      stock: 12,
      lowStockThreshold: 5,
      reorderPoint: 10,
      supplier: suppliers[3]._id,
      isActive: true
    },
    // Llantas
    {
      sku: 'LLA-001',
      name: 'Llanta Michelin Primacy 4 205/55R16',
      category: 'Llantas',
      brand: 'Michelin',
      description: 'Llanta touring premium',
      purchasePrice: 3200,
      salePrice: 4500,
      stock: 16,
      lowStockThreshold: 8,
      reorderPoint: 16,
      supplier: suppliers[2]._id,
      isActive: true
    },
    {
      sku: 'LLA-002',
      name: 'Llanta Bridgestone Turanza T005 195/65R15',
      category: 'Llantas',
      brand: 'Bridgestone',
      description: 'Llanta confort',
      purchasePrice: 2800,
      salePrice: 3900,
      stock: 20,
      lowStockThreshold: 12,
      reorderPoint: 24,
      supplier: suppliers[2]._id,
      isActive: true
    },
    // Bujías
    {
      sku: 'BUJ-001',
      name: 'Bujías NGK Iridium IX BKR6EIX',
      category: 'Encendido',
      brand: 'NGK',
      description: 'Bujías iridio set 4 piezas',
      purchasePrice: 280,
      salePrice: 420,
      stock: 40,
      lowStockThreshold: 16,
      reorderPoint: 32,
      supplier: suppliers[1]._id,
      isActive: true
    },
    {
      sku: 'BUJ-002',
      name: 'Cables de Bujía NGK RC-HE77',
      category: 'Encendido',
      brand: 'NGK',
      description: 'Set de cables 8mm',
      purchasePrice: 520,
      salePrice: 780,
      stock: 15,
      lowStockThreshold: 8,
      reorderPoint: 16,
      supplier: suppliers[1]._id,
      isActive: true
    },
    // Correas
    {
      sku: 'COR-001',
      name: 'Correa de Distribución Gates T304',
      category: 'Correas',
      brand: 'Gates',
      description: 'Kit completo con tensor',
      purchasePrice: 1800,
      salePrice: 2600,
      stock: 3,
      lowStockThreshold: 6,
      reorderPoint: 12,
      supplier: suppliers[0]._id,
      isActive: true
    },
    {
      sku: 'COR-002',
      name: 'Correa Serpentina Dayco 5060895',
      category: 'Correas',
      brand: 'Dayco',
      description: 'Correa multi-accesorios',
      purchasePrice: 380,
      salePrice: 560,
      stock: 25,
      lowStockThreshold: 12,
      reorderPoint: 24,
      supplier: suppliers[0]._id,
      isActive: true
    },
    // Refrigeración
    {
      sku: 'REF-001',
      name: 'Radiador Spectra CU2816',
      category: 'Refrigeración',
      brand: 'Spectra',
      description: 'Radiador aluminio/plástico',
      purchasePrice: 2400,
      salePrice: 3500,
      stock: 4,
      lowStockThreshold: 4,
      reorderPoint: 8,
      supplier: suppliers[3]._id,
      isActive: true
    },
    {
      sku: 'REF-002',
      name: 'Termostato Stant 48708',
      category: 'Refrigeración',
      brand: 'Stant',
      description: 'Termostato 180°F',
      purchasePrice: 180,
      salePrice: 280,
      stock: 30,
      lowStockThreshold: 15,
      reorderPoint: 30,
      supplier: suppliers[3]._id,
      isActive: true
    },
    {
      sku: 'REF-003',
      name: 'Anticongelante Prestone 50/50',
      category: 'Refrigeración',
      brand: 'Prestone',
      description: 'Pre-mezclado 1 galón',
      purchasePrice: 280,
      salePrice: 420,
      stock: 45,
      lowStockThreshold: 20,
      reorderPoint: 40,
      supplier: suppliers[4]._id,
      isActive: true
    },
    // Luces
    {
      sku: 'LUZ-001',
      name: 'Foco H4 Philips X-treme Vision',
      category: 'Iluminación',
      brand: 'Philips',
      description: 'Foco halógeno +130% luz',
      purchasePrice: 450,
      salePrice: 650,
      stock: 35,
      lowStockThreshold: 15,
      reorderPoint: 30,
      supplier: suppliers[1]._id,
      isActive: true
    },
    {
      sku: 'LUZ-002',
      name: 'Kit LED H7 Osram LEDriving',
      category: 'Iluminación',
      brand: 'Osram',
      description: 'Conversión LED 6000K',
      purchasePrice: 1800,
      salePrice: 2600,
      stock: 10,
      lowStockThreshold: 6,
      reorderPoint: 12,
      supplier: suppliers[1]._id,
      isActive: true
    }
  ]);
  log.success(`  ✓ ${products.length} productos creados`);

  // 6. CREAR ÓRDENES DE COMPRA
  log.info('6/9 - Creando órdenes de compra...');
  
  const purchaseOrders = [];
  
  // Orden recibida hace 3 meses
  const po1Items = [
    { product: products[0]._id, quantity: 50, unitPrice: 450, subtotal: 22500 },
    { product: products[1]._id, quantity: 60, unitPrice: 320, subtotal: 19200 },
    { product: products[3]._id, quantity: 100, unitPrice: 85, subtotal: 8500 }
  ];
  const po1Subtotal = po1Items.reduce((sum, item) => sum + item.subtotal, 0);
  purchaseOrders.push({
    supplier: suppliers[4]._id,
    items: po1Items,
    subtotal: po1Subtotal,
    tax: po1Subtotal * 0.18,
    total: po1Subtotal * 1.18,
    status: 'Recibida',
    orderDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    receivedDate: new Date(Date.now() - 88 * 24 * 60 * 60 * 1000),
    notes: 'Pedido trimestral de lubricantes',
    createdBy: adminUser._id
  });

  // Orden recibida hace 1 mes
  const po2Items = [
    { product: products[7]._id, quantity: 20, unitPrice: 850, subtotal: 17000 },
    { product: products[9]._id, quantity: 50, unitPrice: 180, subtotal: 9000 }
  ];
  const po2Subtotal = po2Items.reduce((sum, item) => sum + item.subtotal, 0);
  purchaseOrders.push({
    supplier: suppliers[1]._id,
    items: po2Items,
    subtotal: po2Subtotal,
    tax: po2Subtotal * 0.18,
    total: po2Subtotal * 1.18,
    status: 'Recibida',
    orderDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    receivedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
    notes: 'Reabastecimiento sistema de frenos',
    createdBy: managerUser._id
  });

  // Orden pendiente (discos agotados)
  const po3Items = [
    { product: products[8]._id, quantity: 15, unitPrice: 1200, subtotal: 18000 }
  ];
  const po3Subtotal = po3Items.reduce((sum, item) => sum + item.subtotal, 0);
  purchaseOrders.push({
    supplier: suppliers[1]._id,
    items: po3Items,
    subtotal: po3Subtotal,
    tax: po3Subtotal * 0.18,
    total: po3Subtotal * 1.18,
    status: 'Pendiente',
    orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    notes: 'URGENTE: Producto agotado en stock',
    createdBy: adminUser._id
  });

  // Orden pendiente (stock bajo)
  const po4Items = [
    { product: products[5]._id, quantity: 30, unitPrice: 95, subtotal: 2850 },
    { product: products[19]._id, quantity: 15, unitPrice: 1800, subtotal: 27000 }
  ];
  const po4Subtotal = po4Items.reduce((sum, item) => sum + item.subtotal, 0);
  purchaseOrders.push({
    supplier: suppliers[0]._id,
    items: po4Items,
    subtotal: po4Subtotal,
    tax: po4Subtotal * 0.18,
    total: po4Subtotal * 1.18,
    status: 'Pendiente',
    orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: 'Reposición productos con stock bajo',
    createdBy: managerUser._id
  });

  await PurchaseOrder.insertMany(purchaseOrders);
  log.success(`  ✓ ${purchaseOrders.length} órdenes de compra creadas`);

  // 7. CREAR VENTAS
  log.info('7/9 - Creando ventas...');
  
  const sales = [];
  const salesCount = 30; // Generar 30 ventas
  const daysBack = 60; // Últimos 60 días

  for (let i = 0; i < salesCount; i++) {
    const daysAgo = Math.floor(Math.random() * daysBack);
    const saleDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Seleccionar entre 1 y 5 productos aleatorios
    const numItems = Math.floor(Math.random() * 5) + 1;
    const saleItems = [];
    const usedProducts = new Set();
    
    for (let j = 0; j < numItems; j++) {
      let randomProduct;
      do {
        randomProduct = products[Math.floor(Math.random() * products.length)];
      } while (usedProducts.has(randomProduct._id.toString()));
      
      usedProducts.add(randomProduct._id.toString());
      
      const quantity = Math.floor(Math.random() * 3) + 1;
      const discount = Math.random() < 0.3 ? Math.floor(Math.random() * 15) : 0; // 30% chance de descuento
      
      saleItems.push({
        product: randomProduct._id,
        quantity: quantity,
        unitPrice: randomProduct.salePrice,
        discount: discount,
        subtotal: randomProduct.salePrice * quantity * (1 - discount / 100)
      });
    }
    
    const subtotal = saleItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    // Seleccionar método de pago aleatorio
    const paymentMethods = ['cash', 'card', 'transfer'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // Cliente aleatorio (70% con cliente, 30% sin cliente)
    const customer = Math.random() < 0.7 ? customers[Math.floor(Math.random() * customers.length)]._id : null;
    
    sales.push({
      customer: customer,
      items: saleItems,
      subtotal: subtotal,
      tax: tax,
      discount: 0,
      total: total,
      paymentMethod: paymentMethod,
      amountPaid: total,
      change: 0,
      soldBy: Math.random() < 0.5 ? cashierUser._id : managerUser._id,
      saleDate: saleDate
    });
  }

  await Sale.insertMany(sales);
  log.success(`  ✓ ${sales.length} ventas creadas`);

  // 8. CREAR DEVOLUCIONES
  log.info('8/9 - Creando devoluciones...');
  
  // Seleccionar 3 ventas aleatorias para crear devoluciones
  const salesWithReturns = [sales[0], sales[5], sales[10]];
  const returns = [];

  for (const sale of salesWithReturns) {
    const saleDoc = await Sale.findOne({ _id: sale._id }).populate('items.product');
    if (!saleDoc) continue;

    // Devolver el primer producto de la venta
    const returnItem = saleDoc.items[0];
    const returnQuantity = Math.min(returnItem.quantity, Math.floor(Math.random() * returnItem.quantity) + 1);
    
    const returnAmount = (returnItem.unitPrice * returnQuantity) * (1 - returnItem.discount / 100) * 1.18;

    returns.push({
      sale: saleDoc._id,
      customer: saleDoc.customer,
      items: [{
        product: returnItem.product._id,
        quantity: returnQuantity,
        priceAtSale: returnItem.unitPrice,
        reason: ['Producto defectuoso', 'No es lo esperado', 'Cambio de opinión'][Math.floor(Math.random() * 3)]
      }],
      totalAmount: returnAmount,
      refundMethod: saleDoc.paymentMethod,
      processedBy: cashierUser._id,
      returnDate: new Date(saleDoc.saleDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      status: 'completed',
      notes: 'Devolución procesada sin problemas'
    });
  }

  await Return.insertMany(returns);
  log.success(`  ✓ ${returns.length} devoluciones creadas`);

  // 9. CREAR SESIÓN DE CAJA EJEMPLO
  log.info('9/9 - Creando sesión de caja de ejemplo...');
  
  const todaySales = sales.filter(s => {
    const today = new Date();
    return s.saleDate.toDateString() === today.toDateString();
  });

  let cashTotal = 0, cardTotal = 0, transferTotal = 0;
  todaySales.forEach(sale => {
    switch(sale.paymentMethod) {
      case 'cash': cashTotal += sale.total; break;
      case 'card': cardTotal += sale.total; break;
      case 'transfer': transferTotal += sale.total; break;
    }
  });

  const session = await CashierSession.create({
    user: cashierUser._id,
    openingDate: new Date(new Date().setHours(8, 0, 0, 0)),
    openingAmount: 1000,
    expectedCash: cashTotal,
    expectedCard: cardTotal,
    expectedTransfer: transferTotal,
    status: 'open'
  });

  log.success(`  ✓ Sesión de caja creada (abierta hoy a las 8:00 AM)`);

  log.success('\n✓ Base de datos poblada exitosamente!\n');

  // Resumen
  console.log('═'.repeat(60));
  console.log(`${colors.green}RESUMEN DE DATOS CREADOS:${colors.reset}`);
  console.log('═'.repeat(60));
  console.log(`Configuración:        1 registro`);
  console.log(`Usuarios:             3 (admin, cajero1, gerente)`);
  console.log(`Proveedores:          ${suppliers.length}`);
  console.log(`Clientes:             ${customers.length}`);
  console.log(`Productos:            ${products.length}`);
  console.log(`Órdenes de Compra:    ${purchaseOrders.length}`);
  console.log(`Ventas:               ${sales.length}`);
  console.log(`Devoluciones:         ${returns.length}`);
  console.log(`Sesiones de Caja:     1`);
  console.log('═'.repeat(60));
  console.log(`\n${colors.yellow}CREDENCIALES DE ACCESO:${colors.reset}`);
  console.log('  Admin:    admin@autoparts.com / admin123');
  console.log('  Cajero:   cajero@autoparts.com / admin123');
  console.log('  Gerente:  gerente@autoparts.com / admin123');
  console.log('═'.repeat(60));
};

// Función principal
const main = async () => {
  console.log('\n' + '═'.repeat(60));
  console.log(`${colors.magenta}   LIMPIEZA Y POBLACIÓN DE BASE DE DATOS${colors.reset}`);
  console.log(`${colors.magenta}   AutoParts Manager - Sistema de Demostración${colors.reset}`);
  console.log('═'.repeat(60) + '\n');

  try {
    await connectDB();
    
    log.warning('\n⚠️  ADVERTENCIA: Este script va a:');
    log.warning('   1. Identificar las colecciones del sistema');
    log.warning('   2. Crear un backup de información');
    log.warning('   3. ELIMINAR todos los datos de las colecciones del sistema');
    log.warning('   4. Poblar con datos de demostración');
    log.warning('   5. NO tocará otras colecciones en la base de datos\n');

    // Listar todas las colecciones primero
    log.info('Colecciones encontradas en la base de datos:');
    const allCollections = await listAllCollections();
    allCollections.forEach(c => {
      const isSystem = SYSTEM_COLLECTIONS.includes(c.toLowerCase());
      if (isSystem) {
        log.info(`  ${colors.red}✗${colors.reset} ${c} (será limpiada)`);
      } else {
        log.info(`  ${colors.green}✓${colors.reset} ${c} (será preservada)`);
      }
    });

    console.log('\n');
    
    // Confirmar con el usuario
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`${colors.yellow}¿Desea continuar? (si/no): ${colors.reset}`, async (answer) => {
      if (answer.toLowerCase() === 'si' || answer.toLowerCase() === 's' || answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('');
        await createBackup();
        await cleanSystemCollections();
        await seedData();
        
        log.success('\n✓ Proceso completado exitosamente!');
        log.info('  Puedes iniciar sesión con cualquiera de los usuarios creados.');
        
        rl.close();
        process.exit(0);
      } else {
        log.info('\nOperación cancelada por el usuario.');
        rl.close();
        process.exit(0);
      }
    });

  } catch (error) {
    log.error('Error en el proceso:', error);
    process.exit(1);
  }
};

// Ejecutar
main();
