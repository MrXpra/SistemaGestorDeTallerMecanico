# 🎨 Frontend Completamente Documentado

## Resumen

El frontend del sistema AutoParts Manager está **completamente documentado** con comentarios inline y documentación de referencia.

---

## 📦 Archivos Documentados

### 🚀 Entry Point & Core (2)

✅ **main.jsx**
- Entry point de React
- Renderiza <App /> en #root
- Importa estilos globales (Tailwind)

✅ **App.jsx**
- Configuración de React Router (14 rutas)
- ProtectedRoute component (auth + admin validation)
- Configuración de Toaster global
- Tema dark/light mode

---

### 🗄️ State Management - Stores (4)

✅ **store/authStore.js**
- Estado de autenticación (user, token, isAuthenticated)
- Acciones: login, logout, setAuth, updateUser
- Persistencia en localStorage

✅ **store/cartStore.js**
- Carrito de compras para POS
- items: Array de productos con cantidad y descuento
- selectedCustomer: Cliente para la venta
- Acciones: addItem, removeItem, updateQuantity, updateDiscount, setCustomer, clearCart
- Cálculos: getSubtotal, getTotalDiscount, getTotal

✅ **store/settingsStore.js**
- Configuración global (cargada desde backend)
- businessInfo, fiscalSettings, alerts, weatherIntegration, UI
- Acciones: setSettings, updateSettings

✅ **store/themeStore.js**
- Tema claro/oscuro (isDarkMode)
- Acciones: toggleTheme, setDarkMode
- Persistencia en localStorage

---

### 🌐 Services (1)

✅ **services/api.js**
- Cliente Axios configurado con baseURL: '/api'
- Interceptor request: Agrega token JWT automáticamente
- Interceptor response: Maneja 401 (logout)
- Funciones exportadas para cada endpoint del backend

---

### 🏗️ Layout Components (3)

✅ **components/Layout/Layout.jsx**
- Layout principal con Sidebar + TopBar + Outlet
- Carga settings desde backend al montar
- AnimatedBackground decorativo

✅ **components/Layout/Sidebar.jsx**
- Menú lateral con logo del negocio
- Secciones expandibles: Ventas, Inventario, Contactos, Caja, Configuración
- Rutas de admin ocultas para cajeros
- NavLink con clases activas

✅ **components/Layout/TopBar.jsx**
- Barra superior con widgets (ClockWidget, WeatherWidget)
- Botón de tema (claro/oscuro)
- Menú de usuario con logout
- Portal para menú flotante

---

### 🎨 Utility Components (3)

✅ **components/ClockWidget.jsx**
- Reloj en tiempo real (actualiza cada segundo)
- Formato 12 horas con AM/PM
- Fecha completa en español

✅ **components/WeatherWidget.jsx**
- Clima actual (OpenWeatherMap API)
- Props: location, apiKey
- Iconos dinámicos según condición climática
- Botón de refresh manual

✅ **components/AnimatedBackground.jsx**
- Fondo animado con Canvas API
- 100 partículas con movimiento aleatorio
- Líneas de conexión entre partículas cercanas
- Colores adaptativos según tema

---

### 📄 Pages (14)

#### Páginas Principales

✅ **pages/Login.jsx**
- Autenticación con email + password
- Validación de credenciales
- Guardar token y user en authStore
- Redirect a Dashboard después de login
- Toggle para mostrar/ocultar password

✅ **pages/Dashboard.jsx**
- KPIs: ventas hoy, productos vendidos, bajo stock, clientes
- Gráfico de ventas por día (LineChart - 7 días)
- Tabla de productos más vendidos (top 5, 30 días)
- Gráfico de ventas por método de pago (PieChart - 30 días)

✅ **pages/Billing.jsx**
- POS (Punto de Venta)
- Búsqueda de productos (nombre, SKU, código de barras)
- Carrito con ajuste de cantidades y descuentos
- Selección de cliente
- Procesamiento de pago (Efectivo, Tarjeta, Transferencia)
- Generación e impresión de recibo
- Vista lista/grid toggle

#### Gestión de Datos

✅ **pages/Inventory.jsx**
- CRUD completo de productos
- Filtros: categoría, marca, bajo stock
- Ordenamiento: nombre, stock, precio
- Indicadores de bajo stock
- Exportación de inventario

✅ **pages/Customers.jsx**
- CRUD completo de clientes
- Historial de compras por cliente
- Estadísticas del cliente (total gastado, número de compras)
- Identificación: Cédula, Pasaporte, RNC

✅ **pages/Suppliers.jsx**
- CRUD completo de proveedores (solo admin)
- Información de contacto
- Términos de pago: Contado, 15/30/45/60 días
- RNC único

✅ **pages/Users.jsx**
- CRUD completo de usuarios (solo admin)
- Filtro por rol: admin, cajero
- Toggle de estado activo/inactivo
- Prevención de auto-eliminación

#### Operaciones

✅ **pages/PurchaseOrders.jsx**
- Gestión de órdenes de compra
- Crear orden manual o automática (basada en stock bajo)
- Status flow: Pendiente → Confirmada → Recibida
- Actualización automática de stock al recibir
- Edición y eliminación (solo admin)

✅ **pages/Returns.jsx**
- Gestión de devoluciones
- Crear devolución vinculada a venta
- Razones: Producto defectuoso, equivocado, cliente insatisfecho, otra
- Flujo de aprobación (cajero crea, admin aprueba/rechaza)
- Devolución de stock automática al aprobar

✅ **pages/SalesHistory.jsx**
- Historial completo de ventas
- Filtros: status, método de pago, fechas, búsqueda
- Detalle de venta con items
- Cancelación de venta (solo admin, devuelve stock)
- Reimpresión de recibo
- Copiar invoiceNumber al portapapeles

#### Caja

✅ **pages/CashRegister.jsx**
- Cierre de caja del cajero
- Ventas del día del cajero actual
- Totales por método de pago (systemTotals)
- Ingreso de efectivo contado (countedTotals)
- Cálculo de diferencias
- Creación de CashierSession
- Reporte de cierre imprimible

✅ **pages/CashWithdrawals.jsx**
- Gestión de retiros de caja
- Categorías: Pago proveedores, gastos operativos, retiro personal, otros
- Lógica por rol:
  - Admin: crea con status 'approved', ve todos
  - Cajero: crea con status 'pending', ve solo los suyos
- Flujo de aprobación (admin aprueba/rechaza)

#### Administración

✅ **pages/Reports.jsx** (solo admin)
- 3 tipos de reportes: Ventas, Inventario, Clientes
- Gráficos interactivos (recharts)
- Exportación: Excel (XLSX), PDF (jsPDF), CSV
- Filtros por fechas
- Impresión de reportes

✅ **pages/Settings.jsx** (solo admin)
- Configuración global en 5 secciones:
  1. Negocio: Información de la empresa
  2. Sistema: Configuraciones generales
  3. Notificaciones: Alertas y notificaciones
  4. Facturación: Configuración fiscal
  5. Integraciones: APIs externas (clima)
- Indicador de cambios sin guardar
- Actualización global en settingsStore

---

## 🎯 Totales Frontend

| Categoría | Archivos | Estado |
|-----------|----------|--------|
| Core | 2 | ✅ 100% |
| Stores | 4 | ✅ 100% |
| Services | 1 | ✅ 100% |
| Layout | 3 | ✅ 100% |
| Components | 3 | ✅ 100% |
| Pages | 14 | ✅ 100% |
| **TOTAL FRONTEND** | **27** | **✅ 100%** |

---

## 🔄 Flujos Principales Documentados

### Flujo de Autenticación
1. Login.jsx: email + password
2. POST /api/auth/login
3. authStore.login(user, token)
4. localStorage.setItem('token')
5. Redirect a Dashboard
6. Interceptor axios agrega token en cada request

### Flujo de Venta (POS)
1. Billing.jsx: buscar productos
2. cartStore.addItem(product, quantity)
3. cartStore.setCustomer(customer)
4. Confirmar venta → POST /api/sales
5. Backend: crear Sale + actualizar stock
6. Frontend: clearCart() + imprimir recibo

### Flujo de Cierre de Caja
1. CashRegister.jsx: GET /api/sales/user/me
2. Calcular systemTotals
3. Cajero ingresa countedCash
4. Calcular differences
5. POST /api/sales/close-register
6. Backend: crear CashierSession
7. Frontend: imprimir reporte

### Flujo de Orden de Compra
1. PurchaseOrders.jsx: crear orden manual o automática
2. POST /api/purchase-orders o /generate-auto
3. Cambiar status → PUT /api/purchase-orders/:id/status
4. Si status = 'Recibida': backend actualiza stock automáticamente

### Flujo de Devolución
1. Returns.jsx: cajero crea devolución (status: Pendiente)
2. POST /api/returns
3. Admin aprueba → PUT /api/returns/:id/approve
4. Backend: devuelve stock + procesa reembolso

---

## 🎨 Convenciones de UI

### Glassmorphism
```jsx
className="glass-strong" // Backdrop blur fuerte
className="card-glass" // Card con glassmorphism
```

### Colores Tailwind
- Primary: `primary-600`, `primary-700` (violeta)
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`
- Dark mode: `dark:bg-gray-900`, `dark:text-white`

### Badges de Status
- **Ventas**: Completada (verde), Cancelada (rojo)
- **Órdenes**: Pendiente (amarillo), Confirmada (azul), Recibida (verde), Cancelada (rojo)
- **Devoluciones**: Pendiente (amarillo), Aprobada (verde), Rechazada (rojo)
- **Retiros**: Pending (amarillo), Approved (verde), Rejected (rojo)

### Animaciones
- Hover: `hover:scale-105 transition-transform`
- Active: `active:scale-95`
- Transitions: `transition-all duration-200`

---

## 📋 Rutas de la Aplicación

| Ruta | Componente | Acceso |
|------|-----------|--------|
| /login | Login | Público |
| / | Dashboard | Protegido |
| /facturacion | Billing | Protegido |
| /inventario | Inventory | Protegido |
| /clientes | Customers | Protegido |
| /proveedores | Suppliers | Protegido |
| /ordenes-compra | PurchaseOrders | Protegido |
| /devoluciones | Returns | Protegido |
| /historial-ventas | SalesHistory | Protegido |
| /cierre-caja | CashRegister | Protegido |
| /retiros-caja | CashWithdrawals | Protegido |
| /usuarios | Users | Admin |
| /reportes | Reports | Admin |
| /configuracion | Settings | Admin |

---

## 🛠️ Librerías Principales

- **React 18** - Framework UI
- **React Router v6** - Navegación
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones
- **Recharts** - Gráficos
- **XLSX** - Exportación Excel
- **jsPDF** - Exportación PDF

---

## ✨ Características Documentadas

### Seguridad
- JWT token en localStorage
- Interceptor axios automático
- ProtectedRoute para rutas privadas
- Validación de rol (admin vs cajero)
- Logout automático en 401

### UX
- Skeleton loaders en todas las páginas
- Tooltips informativos
- Confirmaciones antes de acciones destructivas
- Feedback visual (toasts, badges, loading states)
- Responsive design (mobile-friendly)

### Performance
- Lazy loading de rutas
- Debounce en búsquedas
- Memoización con useMemo
- Cleanup de efectos y listeners

---

**Estado:** Frontend 100% documentado y listo para producción 🚀
**Total Archivos:** 27 archivos comentados
**Fecha:** Diciembre 2024
