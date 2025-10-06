# 🎨 Documentación Frontend (En Progreso)

## Resumen

Frontend de AutoParts Manager desarrollado con:
- **React 18** + **Vite** (build tool)
- **React Router v6** (navegación)
- **Zustand** (state management)
- **Tailwind CSS** (estilos)
- **Lucide React** (iconos)
- **React Hot Toast** (notificaciones)
- **Axios** (HTTP client)

---

## ✅ Archivos Documentados

### 🚀 Entry Point & Core (2)

✅ **main.jsx**
- Entry point de React
- Renderiza <App /> en #root
- Importa estilos globales (Tailwind)

✅ **App.jsx**
- Configuración de React Router
- ProtectedRoute component (auth + admin)
- Configuración de Toaster global
- Rutas: /login (público), / (protegido con Layout)

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
- No persiste (se carga en cada sesión)

✅ **store/themeStore.js**
- Tema claro/oscuro (isDarkMode)
- Acciones: toggleTheme, setDarkMode
- Persistencia en localStorage

---

### 🌐 Services (1)

✅ **services/api.js** (YA ESTABA COMENTADO)
- Cliente Axios configurado
- baseURL: '/api'
- Interceptor request: Agrega token JWT automáticamente
- Interceptor response: Maneja 401 (logout)
- Funciones exportadas para cada endpoint

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
- Barra superior con widgets
- ClockWidget, WeatherWidget (condicional)
- Botón de tema (claro/oscuro)
- Menú de usuario con logout

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
- Estados: loading, error, success

✅ **components/AnimatedBackground.jsx**
- Fondo animado con Canvas API
- 100 partículas con movimiento aleatorio
- Líneas de conexión entre partículas cercanas
- Colores adaptativos según tema

---

## 📄 Páginas (Pendientes de Documentar)

### Páginas Principales (14)

⏳ **pages/Login.jsx** - Autenticación
⏳ **pages/Dashboard.jsx** - Vista principal con estadísticas
⏳ **pages/Billing.jsx** - POS (Punto de Venta)
⏳ **pages/Inventory.jsx** - CRUD de productos
⏳ **pages/Customers.jsx** - CRUD de clientes
⏳ **pages/Suppliers.jsx** - CRUD de proveedores
⏳ **pages/PurchaseOrders.jsx** - Órdenes de compra
⏳ **pages/Returns.jsx** - Devoluciones
⏳ **pages/SalesHistory.jsx** - Historial de ventas
⏳ **pages/CashRegister.jsx** - Cierre de caja
⏳ **pages/CashWithdrawals.jsx** - Retiros de caja
⏳ **pages/Users.jsx** - CRUD de usuarios (admin)
⏳ **pages/Reports.jsx** - Reportes (admin)
⏳ **pages/Settings.jsx** - Configuración (admin)

### Páginas de Configuración (5 subsecciones en Settings)

Settings tiene tabs:
- Business (Información del negocio)
- System (Sistema)
- Notifications (Notificaciones)
- Billing (Facturación)
- Integrations (Integraciones)

---

## 🎯 Progreso Frontend

| Categoría | Archivos | Documentados | Pendientes |
|-----------|----------|--------------|------------|
| Core | 2 | ✅ 2 | - |
| Stores | 4 | ✅ 4 | - |
| Services | 1 | ✅ 1 | - |
| Layout | 3 | ✅ 3 | - |
| Components | 3 | ✅ 3 | - |
| Pages | 14 | ⏳ 0 | 14 |
| **TOTAL** | **27** | **✅ 13 (48%)** | **⏳ 14 (52%)** |

---

## 📋 Arquitectura Frontend

### Flujo de Autenticación
1. Usuario entra a /login
2. Ingresa email + password
3. Frontend llama POST /api/auth/login
4. Backend retorna token JWT + datos de usuario
5. authStore.login(user, token) → guarda en localStorage
6. Redirect a / (Dashboard)
7. Interceptor de Axios agrega token en cada request

### Flujo de Venta (POS)
1. Usuario va a /facturacion (Billing.jsx)
2. Busca productos y agrega al carrito (cartStore.addItem)
3. Selecciona cliente (cartStore.setCustomer)
4. Revisa totales (getSubtotal, getTotalDiscount, getTotal)
5. Confirma venta → POST /api/sales
6. Backend crea Sale + actualiza stock
7. Frontend limpia carrito (clearCart) + muestra toast de éxito

### Flujo de Protección de Rutas
1. Usuario intenta acceder a ruta protegida
2. ProtectedRoute verifica isAuthenticated
3. Si no autenticado → redirect a /login
4. Si adminOnly=true, verifica user.role === 'admin'
5. Si no es admin → redirect a /
6. Si pasa validaciones → renderiza children (página)

### Flujo de Tema
1. Usuario hace click en botón de tema (TopBar)
2. toggleTheme() invierte isDarkMode
3. Zustand guarda en localStorage (persist middleware)
4. App.jsx lee isDarkMode y aplica className="dark" al div raíz
5. Tailwind CSS aplica estilos dark:* a todos los componentes

---

## 🎨 Convenciones de Estilos

### Glassmorphism
```jsx
className="glass-strong" // Backdrop blur con border sutil
className="card-glass" // Card con glassmorphism
```

### Colores (Tailwind)
- Primary: `primary-600`, `primary-700` (violeta/azul)
- Success: `green-600`
- Warning: `yellow-600`
- Error: `red-600`
- Dark mode: `dark:bg-gray-900`, `dark:text-white`

### Animaciones
- Hover: `hover:scale-105 transition-transform`
- Active: `active:scale-95`
- Transitions: `transition-all duration-200`

---

## 🔄 Próximos Pasos

1. **Documentar páginas principales** (Login, Dashboard, Billing)
2. **Documentar páginas de gestión** (Inventory, Customers, etc.)
3. **Documentar página de configuración** (Settings)
4. **Crear documento de referencia completo** (equivalente a RUTAS_BACKEND.md)

---

**Estado Actual:** Frontend 48% documentado (13/27 archivos)
**Próximo:** Documentar páginas (Login, Dashboard, Billing como prioridad)
