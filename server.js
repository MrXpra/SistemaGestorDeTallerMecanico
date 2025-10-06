/**
 * SERVER.JS - Punto de entrada principal del servidor backend
 * 
 * Este archivo configura y arranca el servidor Express que maneja:
 * - Autenticación de usuarios (JWT)
 * - Gestión de inventario de productos
 * - Procesamiento de ventas y facturación
 * - Administración de clientes y proveedores
 * - Configuración del sistema
 * - Retiros de caja y cierres
 * - Reportes y estadísticas del dashboard
 */

import express from 'express';
import cors from 'cors'; // Middleware para permitir peticiones desde otros dominios (frontend)
import dotenv from 'dotenv'; // Carga variables de entorno desde archivo .env
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js'; // Función para conectar a MongoDB

// ========== IMPORTAR TODAS LAS RUTAS ==========
// Cada archivo de rutas maneja un módulo específico de la aplicación
import authRoutes from './routes/authRoutes.js'; // Login, registro, verificación de token
import userRoutes from './routes/userRoutes.js'; // CRUD de usuarios del sistema
import productRoutes from './routes/productRoutes.js'; // CRUD de productos en inventario
import saleRoutes from './routes/saleRoutes.js'; // Crear ventas, historial, estadísticas
import customerRoutes from './routes/customerRoutes.js'; // CRUD de clientes
import settingsRoutes from './routes/settingsRoutes.js'; // Configuración del negocio y sistema
import dashboardRoutes from './routes/dashboardRoutes.js'; // Estadísticas y KPIs del dashboard
import supplierRoutes from './routes/supplierRoutes.js'; // CRUD de proveedores
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js'; // Órdenes de compra a proveedores
import proxyRoutes from './routes/proxyRoutes.js'; // Proxy para APIs externas (clima, etc)
import returnRoutes from './routes/returnRoutes.js'; // Devoluciones de productos
import cashWithdrawalRoutes from './routes/cashWithdrawalRoutes.js'; // Retiros de caja

// Importar middleware de manejo de errores global
import { errorHandler } from './middleware/errorMiddleware.js';

// ========== CONFIGURACIÓN INICIAL ==========
// Configurar __dirname para ES modules (necesario porque usamos "type": "module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno (.env) - PORT, MONGO_URI, JWT_SECRET, etc
dotenv.config();

// Conectar a MongoDB usando la URI en variables de entorno
connectDB();

// Inicializar la aplicación Express
const app = express();

// ========== MIDDLEWARE GLOBAL ==========
// CORS: Configurado para desarrollo local y producción
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'https://autoparts-manager.vercel.app'
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Parser de JSON: Convierte el body de las peticiones HTTP en objetos JavaScript
app.use(express.json());

// Parser de URL-encoded: Para formularios HTML tradicionales
app.use(express.urlencoded({ extended: true }));

// ========== REGISTRO DE RUTAS API ==========
// Cada ruta tiene su prefijo y se delega a su archivo de rutas correspondiente
app.use('/api/auth', authRoutes); // /api/auth/login, /api/auth/register, etc
app.use('/api/users', userRoutes); // /api/users (CRUD usuarios)
app.use('/api/products', productRoutes); // /api/products (CRUD productos)
app.use('/api/sales', saleRoutes); // /api/sales (crear ventas, historial)
app.use('/api/customers', customerRoutes); // /api/customers (CRUD clientes)
app.use('/api/settings', settingsRoutes); // /api/settings (configuración)
app.use('/api/dashboard', dashboardRoutes); // /api/dashboard/stats
app.use('/api/suppliers', supplierRoutes); // /api/suppliers (CRUD proveedores)
app.use('/api/purchase-orders', purchaseOrderRoutes); // /api/purchase-orders
app.use('/api/proxy', proxyRoutes); // /api/proxy/weather (proxy APIs externas)
app.use('/api/returns', returnRoutes); // /api/returns (devoluciones)
app.use('/api/cash-withdrawals', cashWithdrawalRoutes); // /api/cash-withdrawals

// ========== SERVIR FRONTEND EN PRODUCCIÓN ==========
// En producción, Express sirve los archivos estáticos del build de React
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Cualquier ruta no API devuelve el index.html (para React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // En desarrollo, solo mostramos un mensaje en la ruta raíz
  app.get('/', (req, res) => {
    res.json({ message: 'AutoParts Manager API está funcionando correctamente' });
  });
}

// ========== MIDDLEWARE DE ERRORES ==========
// Este middleware captura cualquier error que ocurra en las rutas
// Debe estar DESPUÉS de todas las rutas para que pueda interceptar sus errores
app.use(errorHandler);

// ========== ARRANCAR SERVIDOR ==========
// Usa el puerto de la variable de entorno o 5000 por defecto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
