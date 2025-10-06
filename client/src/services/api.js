/**
 * API.JS - Cliente HTTP para comunicación con el backend
 * 
 * Configuración centralizada de Axios con:
 * - Base URL configurada para apuntar a /api
 * - Interceptor de request: Agrega token JWT automáticamente
 * - Interceptor de response: Maneja errores 401 (no autorizado)
 * 
 * Todas las funciones exportadas retornan Promesas que se pueden usar con async/await.
 * 
 * Ejemplo de uso:
 * import { getProducts } from '../services/api';
 * const response = await getProducts();
 * const products = response.data;
 */

import axios from 'axios';

/**
 * Instancia de Axios configurada
 * baseURL: '/api' en desarrollo (proxy de Vite)
 * En producción: URL completa del backend (Railway/Render)
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

/**
 * INTERCEPTOR DE REQUEST
 * 
 * Se ejecuta ANTES de cada petición HTTP.
 * Agrega el token JWT del localStorage al header Authorization.
 * 
 * Formato del header: "Authorization: Bearer <token>"
 * 
 * El try/catch protege contra errores en entornos sin localStorage (tests, SSR)
 */
API.interceptors.request.use(
  (config) => {
    let token = null;
    try {
      // Verificar si localStorage está disponible (no existe en Node.js/tests)
      if (typeof localStorage !== 'undefined' && localStorage.getItem) {
        token = localStorage.getItem('token');
      }
    } catch (e) {
      token = null; // En caso de error, continuar sin token
    }

    // Si hay token, agregarlo al header
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Continuar con la petición
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * INTERCEPTOR DE RESPONSE
 * 
 * Se ejecuta DESPUÉS de recibir respuesta del servidor.
 * Maneja errores 401 (No autorizado) globalmente:
 * - Elimina token del localStorage
 * - Redirige a /login
 * 
 * Esto sucede cuando:
 * - El token expiró (30 días)
 * - El token es inválido
 * - El usuario fue desactivado
 */
API.interceptors.response.use(
  (response) => response, // Si todo ok, devolver response tal cual
  (error) => {
    // Si el servidor devuelve 401 (No autorizado)
    if (error.response?.status === 401) {
      // Limpiar token del localStorage
      try {
        if (typeof localStorage !== 'undefined' && localStorage.removeItem) {
          localStorage.removeItem('token');
        }
      } catch (e) {
        // Ignorar en entorno de tests
      }

      // Redirigir a login
      try {
        if (typeof window !== 'undefined' && window.location) {
          window.location.href = '/login';
        }
      } catch (e) {
        // Ignorar en entorno de tests
      }
    }
    return Promise.reject(error);
  }
);

// ========== FUNCIONES DE API POR MÓDULO ==========
// Cada función retorna una Promise con la respuesta de Axios
// Uso: const { data } = await login({ email, password });

// ===== AUTH - Autenticación =====
export const login = (credentials) => API.post('/auth/login', credentials);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// ===== PRODUCTS - Productos del inventario =====
export const getProducts = (params) => API.get('/products', { params }); // Listar con filtros opcionales
export const getProductById = (id) => API.get(`/products/${id}`); // Obtener por ID
export const getProductBySku = (sku) => API.get(`/products/sku/${sku}`); // Buscar por SKU para facturación rápida
export const createProduct = (data) => API.post('/products', data); // Crear producto nuevo
export const updateProduct = (id, data) => API.put(`/products/${id}`, data); // Actualizar producto
export const deleteProduct = (id) => API.delete(`/products/${id}`); // Eliminar producto
export const getCategories = () => API.get('/products/categories/list'); // Listar categorías únicas
export const getBrands = () => API.get('/products/brands/list'); // Listar marcas únicas

// ===== SALES - Ventas y facturación =====
export const getSales = (params) => API.get('/sales', { params }); // Listar ventas con filtros
export const getSaleById = (id) => API.get(`/sales/${id}`); // Obtener venta específica con detalles
export const createSale = (data) => API.post('/sales', data); // Procesar nueva venta
export const getMySales = () => API.get('/sales/user/me'); // Ventas del usuario actual (cajero)
export const closeCashRegister = (data) => API.post('/sales/close-register', data); // Cierre de caja
export const cancelSale = (id) => API.put(`/sales/${id}/cancel`); // Cancelar venta (solo admin)

// ===== CUSTOMERS - Clientes =====
export const getCustomers = (params) => API.get('/customers', { params }); // Listar clientes
export const getCustomerById = (id) => API.get(`/customers/${id}`); // Obtener cliente específico
export const createCustomer = (data) => API.post('/customers', data); // Crear cliente
export const updateCustomer = (id, data) => API.put(`/customers/${id}`, data); // Actualizar cliente
export const deleteCustomer = (id) => API.delete(`/customers/${id}`); // Eliminar cliente
export const getCustomerPurchases = (id) => API.get(`/customers/${id}/purchases`); // Historial de compras

// ===== USERS - Usuarios del sistema =====
export const getUsers = () => API.get('/users'); // Listar todos los usuarios (solo admin)
export const getUserById = (id) => API.get(`/users/${id}`); // Obtener usuario específico
export const createUser = (data) => API.post('/users', data); // Crear usuario (admin/cajero)
export const updateUser = (id, data) => API.put(`/users/${id}`, data); // Actualizar usuario
export const deleteUser = (id) => API.delete(`/users/${id}`); // Desactivar usuario

// ===== SETTINGS - Configuración del sistema =====
export const getSettings = () => API.get('/settings'); // Obtener configuración actual
export const updateSettings = (data) => API.put('/settings', data); // Actualizar configuración

// ===== DASHBOARD - Estadísticas y KPIs =====
export const getDashboardStats = () => API.get('/dashboard/stats'); // Stats generales (ventas, productos, etc)
export const getSalesByDay = (days) => API.get('/dashboard/sales-by-day', { params: { days } }); // Ventas por día
export const getTopProducts = (params) => API.get('/dashboard/top-products', { params }); // Productos más vendidos
export const getSalesByPayment = (days) => API.get('/dashboard/sales-by-payment', { params: { days } }); // Ventas por método de pago

// ===== SUPPLIERS - Proveedores =====
export const getSuppliers = () => API.get('/suppliers'); // Listar proveedores
export const getSupplierById = (id) => API.get(`/suppliers/${id}`); // Obtener proveedor específico
export const createSupplier = (data) => API.post('/suppliers', data); // Crear proveedor
export const updateSupplier = (id, data) => API.put(`/suppliers/${id}`, data); // Actualizar proveedor
export const deleteSupplier = (id) => API.delete(`/suppliers/${id}`); // Eliminar proveedor

// ===== PURCHASE ORDERS - Órdenes de compra a proveedores =====
export const getPurchaseOrders = () => API.get('/purchase-orders'); // Listar órdenes
export const getPurchaseOrderById = (id) => API.get(`/purchase-orders/${id}`); // Obtener orden específica
export const createPurchaseOrder = (data) => API.post('/purchase-orders', data); // Crear orden manual
export const generateAutoPurchaseOrder = (data) => API.post('/purchase-orders/generate-auto', data); // Generar orden automática por stock bajo
export const updatePurchaseOrder = (id, data) => API.put(`/purchase-orders/${id}`, data); // Actualizar orden
export const updateOrderStatus = (id, data) => API.put(`/purchase-orders/${id}/status`, data); // Cambiar status (pendiente/recibida/cancelada)
export const deletePurchaseOrder = (id) => API.delete(`/purchase-orders/${id}`); // Eliminar orden

// ===== RETURNS - Devoluciones de productos =====
export const getReturns = (params) => API.get('/returns', { params }); // Listar devoluciones
export const getReturnById = (id) => API.get(`/returns/${id}`); // Obtener devolución específica
export const createReturn = (data) => API.post('/returns', data); // Crear devolución
export const approveReturn = (id) => API.put(`/returns/${id}/approve`); // Aprobar devolución (devolver stock + dinero)
export const rejectReturn = (id, data) => API.put(`/returns/${id}/reject`, data); // Rechazar devolución
export const getReturnStats = (params) => API.get('/returns/stats', { params }); // Estadísticas de devoluciones

// ===== CASH WITHDRAWALS - Retiros de caja =====
export const getCashWithdrawals = (params) => API.get('/cash-withdrawals', { params }); // Listar retiros con filtros
export const getCashWithdrawalById = (id) => API.get(`/cash-withdrawals/${id}`); // Obtener retiro específico
export const createCashWithdrawal = (data) => API.post('/cash-withdrawals', data); // Crear retiro
export const updateCashWithdrawalStatus = (id, data) => API.patch(`/cash-withdrawals/${id}`, data); // Aprobar/rechazar retiro
export const deleteCashWithdrawal = (id) => API.delete(`/cash-withdrawals/${id}`); // Eliminar retiro (solo admin)

export default API;
