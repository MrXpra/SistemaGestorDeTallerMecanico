#!/usr/bin/env node
/**
 * scripts/loadtest-db.js
 *
 * Generador de carga para MongoDB Atlas (colecciones `loadtest_*`).
 * Usa mongoose (el mismo que usa el proyecto). El script:
 *  - toma snapshot antes y después (db.stats + collStats)
 *  - inserta datos en batches por colección según escenario
 *  - informa tamaños y proyecciones
 *
 * Uso:
 *  node scripts/loadtest-db.js --uri="<MONGODB_URI>" --db=PRUEBA --scenario=A --batchSize=200 --pause=100
 *
 * Opciones:
 *  --uri: MongoDB connection string (o usa MONGODB_URI env)
 *  --db: nombre de la base de datos (por defecto PRUEBA)
 *  --scenario: A (moderado), B (intensivo), C (stress)  (por defecto A)
 *  --batchSize: tamaño de lote por inserción (por defecto 500)
 *  --pause: ms a pausar entre batches (por defecto 100)
 *  --cleanup: si se pasa, borra las colecciones `loadtest_*` al final
 *
 * Nota: ejecuta este script en tu máquina local (en la copia del repo con dependencias instaladas).
 */

import mongoose from 'mongoose';

function parseArgs() {
  const args = {};
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      args[k] = v === undefined ? true : v;
    }
  }
  return args;
}

const ARGS = parseArgs();
const MONGODB_URI = ARGS.uri || process.env.MONGODB_URI;
const DB_NAME = ARGS.db || 'PRUEBA';
const SCENARIO = (ARGS.scenario || 'A').toUpperCase();
const BATCH_SIZE = parseInt(ARGS.batchSize || '500', 10) || 500;
const PAUSE_MS = parseInt(ARGS.pause || '100', 10) || 100;
const CLEANUP = ARGS.cleanup === 'true' || ARGS.cleanup === true || ARGS.cleanup === '1';

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI no especificado. Usa --uri="<uri>" o configura MONGODB_URI en .env');
  process.exit(1);
}

const SCENARIOS = {
  A: {
    customers: 1000,
    suppliers: 500,
    products: 2000,
    sales: 5000,
    returns: 1000,
    logs: 5000
  },
  B: {
    customers: 5000,
    suppliers: 2000,
    products: 10000,
    sales: 50000,
    returns: 10000,
    logs: 50000
  },
  C: {
    customers: 20000,
    suppliers: 5000,
    products: 30000,
    sales: 200000,
    returns: 40000,
    logs: 200000
  }
};

const counts = SCENARIOS[SCENARIO] || SCENARIOS.A;

function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function now() { return new Date(); }

async function snapshot(db) {
  const stats = await db.stats();
  const cols = await db.listCollections().toArray();
  const collStats = {};
  for (const c of cols) {
    try {
      const s = await db.command({ collStats: c.name });
      collStats[c.name] = s;
    } catch (e) {
      collStats[c.name] = { error: e.message };
    }
  }
  return { dbStats: stats, collStats };
}

async function insertInBatches(coll, docs, batchSize, pauseMs) {
  let inserted = 0;
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    await coll.insertMany(batch);
    inserted += batch.length;
    console.log(`  Inserted ${inserted}/${docs.length} into ${coll.collectionName}`);
    if (pauseMs > 0) await sleep(pauseMs);
  }
}

function generateCustomers(n, startIndex = 0) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const idx = startIndex + i + 1;
    arr.push({
      name: `Cliente ${idx}`,
      phone: `809-${rndInt(100,999)}-${rndInt(1000,9999)}`,
      email: `cliente${idx}@example.com`,
      address: `Direccion ${idx}`,
      createdAt: now()
    });
  }
  return arr;
}

function generateSuppliers(n, startIndex = 0) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const idx = startIndex + i + 1;
    arr.push({
      name: `Proveedor ${idx}`,
      contact: `Contacto ${idx}`,
      phone: `809-${rndInt(100,999)}-${rndInt(1000,9999)}`,
      email: `proveedor${idx}@supplier.com`,
      createdAt: now()
    });
  }
  return arr;
}

function generateProducts(n, startIndex = 0) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const idx = startIndex + i + 1;
    const price = rndInt(100, 5000);
    arr.push({
      sku: `P-${String(idx).padStart(6,'0')}`,
      name: `Producto ${idx}`,
      description: `Descripcion del producto ${idx}`,
      price,
      cost: Math.round(price * 0.6),
      stock: rndInt(0, 100),
      createdAt: now()
    });
  }
  return arr;
}

function generateSales(n, customersIds, productsDocs, startIndex = 0) {
  const arr = [];
  const prodCount = productsDocs.length;
  for (let i = 0; i < n; i++) {
    const idx = startIndex + i + 1;
    const customer = customersIds[rndInt(0, customersIds.length -1)];
    const itemsCount = rndInt(1, 4);
    const items = [];
    let total = 0;
    for (let j = 0; j < itemsCount; j++) {
      const p = productsDocs[rndInt(0, prodCount-1)];
      const qty = rndInt(1, 5);
      const line = {
        product: p._id,
        name: p.name,
        quantity: qty,
        unitPrice: p.price,
        lineTotal: qty * p.price
      };
      total += line.lineTotal;
      items.push(line);
    }
    arr.push({
      invoiceNumber: `INV${String(idx).padStart(12,'0')}`,
      customer,
      items,
      total,
      createdAt: now()
    });
  }
  return arr;
}

function generateReturns(n, salesDocs, startIndex = 0) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const idx = startIndex + i + 1;
    const sale = salesDocs[rndInt(0, salesDocs.length-1)];
    // pick one item from sale
    const item = sale.items[rndInt(0, sale.items.length-1)];
    const qty = Math.max(1, Math.min(item.quantity, rndInt(1, item.quantity)));
    const total = qty * item.unitPrice;
    arr.push({
      returnNumber: `DEV-${String(idx).padStart(7,'0')}`,
      sale: sale._id,
      invoiceNumber: sale.invoiceNumber,
      items: [{ product: item.product, quantity: qty, unitPrice: item.unitPrice }],
      total,
      status: 'Completada',
      createdAt: now()
    });
  }
  return arr;
}

function generateLogs(n, startIndex = 0) {
  const types = ['info','warning','error','debug'];
  const arr = [];
  for (let i = 0; i < n; i++) {
    const idx = startIndex + i + 1;
    const t = types[rndInt(0, types.length-1)];
    arr.push({
      type: t,
      module: 'loadtest',
      action: 'auto',
      message: `Log de prueba ${idx}`,
      timestamp: now()
    });
  }
  return arr;
}

async function run() {
  console.log('Loadtest DB script');
  console.log(`Scenario ${SCENARIO}:`, counts);
  console.log('Batch size:', BATCH_SIZE, 'Pause ms:', PAUSE_MS);

  await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
  const db = mongoose.connection.db;

  console.log('\nTaking initial snapshot...');
  const before = await snapshot(db);
  console.log(JSON.stringify({ before: { dbStats: before.dbStats, collectionsCount: Object.keys(before.collStats).length } }, null, 2));

  // Collections names
  const cCustomers = 'loadtest_customers';
  const cSuppliers = 'loadtest_suppliers';
  const cProducts = 'loadtest_products';
  const cSales = 'loadtest_sales';
  const cReturns = 'loadtest_returns';
  const cLogs = 'loadtest_logs';

  // 1) Customers
  console.log('\n== Inserting customers ==');
  const customersDocs = generateCustomers(counts.customers);
  await db.createCollection(cCustomers).catch(()=>{});
  await insertInBatches(db.collection(cCustomers), customersDocs, BATCH_SIZE, PAUSE_MS);

  // 2) Suppliers
  console.log('\n== Inserting suppliers ==');
  const suppliersDocs = generateSuppliers(counts.suppliers);
  await db.createCollection(cSuppliers).catch(()=>{});
  await insertInBatches(db.collection(cSuppliers), suppliersDocs, BATCH_SIZE, PAUSE_MS);

  // 3) Products
  console.log('\n== Inserting products ==');
  const productsDocs = generateProducts(counts.products);
  await db.createCollection(cProducts).catch(()=>{});
  await insertInBatches(db.collection(cProducts), productsDocs, BATCH_SIZE, PAUSE_MS);

  // Reload inserted docs to get _id
  const customersInserted = await db.collection(cCustomers).find().toArray();
  const productsInserted = await db.collection(cProducts).find().toArray();

  // 4) Sales
  console.log('\n== Inserting sales ==');
  const salesDocs = generateSales(counts.sales, customersInserted.map(c=>c._id), productsInserted);
  await db.createCollection(cSales).catch(()=>{});
  // insert sales in batches but to avoid huge memory, generate and insert per batch
  for (let i = 0; i < salesDocs.length; i += BATCH_SIZE) {
    const batch = salesDocs.slice(i, i + BATCH_SIZE);
    await db.collection(cSales).insertMany(batch);
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, salesDocs.length)}/${salesDocs.length} sales`);
    await sleep(PAUSE_MS);
  }

  const salesInserted = await db.collection(cSales).find().toArray();

  // 5) Returns
  console.log('\n== Inserting returns ==');
  const returnsDocs = generateReturns(counts.returns, salesInserted);
  await db.createCollection(cReturns).catch(()=>{});
  await insertInBatches(db.collection(cReturns), returnsDocs, BATCH_SIZE, PAUSE_MS);

  // 6) Logs
  console.log('\n== Inserting logs ==');
  const logsDocs = generateLogs(counts.logs);
  await db.createCollection(cLogs).catch(()=>{});
  await insertInBatches(db.collection(cLogs), logsDocs, BATCH_SIZE, PAUSE_MS);

  console.log('\nTaking final snapshot...');
  const after = await snapshot(db);

  // Summarize deltas for created collections
  const report = {};
  for (const name of [cCustomers,cSuppliers,cProducts,cSales,cReturns,cLogs]) {
    const beforeStats = before.collStats[name] || { size:0, storageSize:0, count:0 };
    const afterStats = after.collStats[name] || { size:0, storageSize:0, count:0 };
    report[name] = {
      before: { count: beforeStats.count || 0, size: beforeStats.size || 0, storageSize: beforeStats.storageSize || 0 },
      after: { count: afterStats.count || 0, size: afterStats.size || 0, storageSize: afterStats.storageSize || 0 },
      delta: {
        count: (afterStats.count||0) - (beforeStats.count||0),
        size: (afterStats.size||0) - (beforeStats.size||0),
        storageSize: (afterStats.storageSize||0) - (beforeStats.storageSize||0)
      }
    };
  }

  console.log('\n=== REPORT ===');
  console.log(JSON.stringify(report, null, 2));

  const totalDeltaBytes = Object.values(report).reduce((s, r) => s + (r.delta.size || 0), 0);
  console.log('\nTotal delta size (bytes):', totalDeltaBytes);
  console.log('Estimated usage vs Atlas M0 (512 MB):', (totalDeltaBytes / (512 * 1024 * 1024) * 100).toFixed(4) + '%');

  if (CLEANUP) {
    console.log('\nCleanup requested: dropping loadtest collections...');
    for (const name of [cCustomers,cSuppliers,cProducts,cSales,cReturns,cLogs]) {
      try { await db.collection(name).drop(); console.log(' Dropped', name); } catch(e){ console.log(' Skip drop', name, e.message); }
    }
    console.log('Cleanup complete.');
  }

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(err => { console.error('Error in loadtest:', err); process.exit(1); });
