# 📚 Documentación del Código - AutoParts Manager

Este documento lista todos los archivos del proyecto con sus descripciones y propósitos.

## ✅ Archivos Ya Comentados (con comentarios inline detallados)

### Backend - Configuración y Middleware

1. **server.js** ⭐ - Punto de entrada del servidor Express
   - Configuración de middleware (CORS, JSON parser)
   - Registro de todas las rutas API
   - Manejo de errores global
   - Servir frontend en producción

2. **config/db.js** ⭐ - Conexión a MongoDB
   - Función `connectDB()` que conecta usando Mongoose
   - Manejo de errores de conexión

3. **middleware/authMiddleware.js** ⭐ - Autenticación y autorización
   - `protect`: Middleware que verifica token JWT
   - `admin`: Middleware que verifica rol de administrador
   - `generateToken`: Función para crear tokens JWT

4. **middleware/errorMiddleware.js** ⭐ - Manejo de errores
   - `errorHandler`: Middleware global de errores
   - `notFound`: Middleware para rutas 404

### Backend - Modelos

5. **models/User.js** ⭐ - Modelo de Usuario
   - Campos: name, email, password, role, isActive
   - Pre-save hook para hashear contraseñas
   - Método `comparePassword` para login

6. **models/Product.js** ⭐ - Modelo de Producto
   - Campos: SKU, nombre, precios, stock, categoría, marca, proveedor
   - Virtuals: `profitMargin`, `isLowStock`
   - Pre-update hook para actualizar fecha

7. **models/Sale.js** ⭐ - Modelo de Venta
   - Campos: invoiceNumber, user, customer, items, totales, paymentMethod
   - Método estático `generateInvoiceNumber()` con formato INV241006-0001
   - Items incluyen priceAtSale (precio al momento de venta)

8. **models/Customer.js** ⭐ - Modelo de Cliente
   - Campos: fullName, cédula, phone, email, address, purchaseHistory
   - Índices sparse para permitir múltiples null
   - Pre-update hook para fecha

9. **models/Supplier.js** ⭐ - Modelo de Proveedor
   - Campos: name, contactName, email, phone, RNC, paymentTerms
   - Términos de pago (Contado, 15/30/60/90 días)
   - Campo isActive para desactivar sin eliminar

10. **models/Settings.js** ⭐ - Modelo de Configuración (Singleton)
    - Datos del negocio (nombre, logo, contacto)
    - Configuración fiscal (taxRate, currency)
    - Alertas y umbrales (lowStockAlert, autoOrderThreshold)
    - Integraciones (weatherLocation, weatherApiKey)
    - Método `getInstance()` implementa patrón Singleton

11. **models/PurchaseOrder.js** ⭐ - Modelo de Orden de Compra
    - Campos: orderNumber, supplier, items, status, fechas
    - Estados: Pendiente, Enviada, Recibida Parcial, Recibida, Cancelada
    - Pre-validate hook genera número automático (PO-000001)

12. **models/CashWithdrawal.js** ⭐ - Modelo de Retiro de Caja
    - Campos: número de retiro, monto, razón, categoría, estado
    - Método estático `generateWithdrawalNumber()` formato RET-YYYYMMDD-XXX
    - Sistema de aprobación (pending → approved/rejected)

### Backend - Controladores

13. **controllers/authController.js** ⭐ - Controlador de Autenticación
    - `login`: Autenticar con email/password, generar token
    - `getProfile`: Obtener perfil del usuario actual
    - `updateProfile`: Actualizar datos del usuario

### Frontend - Servicios y Stores

14. **client/src/services/api.js** ⭐ - Cliente HTTP centralizado
    - Instancia de Axios configurada con baseURL: '/api'
    - Interceptor de request (agrega token JWT automáticamente)
    - Interceptor de response (maneja errores 401, redirige a login)
    - 70+ funciones para todos los endpoints API (comentadas por módulo)
    - Grupos: Auth, Products, Sales, Customers, Users, Settings, Dashboard, Suppliers, Purchase Orders, Returns, Cash Withdrawals

15. **client/src/store/authStore.js** ⭐ - Store de autenticación Zustand
    - Estado: user, token, isAuthenticated
    - Acciones: login, logout, setAuth, updateUser
    - Middleware persist para guardar en localStorage automáticamente

---

## 📋 Archivos Pendientes de Comentar (con descripción)

### Backend - Modelos

11. **models/Sale.js** - Modelo de Venta
    - Campos: número de venta, items, total, cliente, método de pago
    - Auto-generación de número de venta
    - Cálculo de totales

12. **models/Customer.js** - Modelo de Cliente
    - Campos: nombre, RNC, teléfono, dirección
    - Historial de compras

13. **models/Supplier.js** - Modelo de Proveedor
    - Campos: nombre, RNC, contacto, dirección
    - Relación con productos

14. **models/PurchaseOrder.js** - Modelo de Orden de Compra
    - Campos: número, proveedor, items, total, estado
    - Estados: pending, received, cancelled

15. **models/Return.js** - Modelo de Devolución
    - Campos: número, venta original, items devueltos, razón
    - Estados: pending, approved, rejected

16. **models/Settings.js** - Modelo de Configuración
    - Campos: nombre del negocio, RNC, dirección, teléfono
    - Configuración de impuestos, moneda, logo

17. **models/CashierSession.js** - Modelo de Sesión de Caja
    - Campos: usuario, fecha apertura/cierre, monto inicial/final
    - Cálculo de diferencias

### Backend - Controladores

18. **controllers/productController.js** - Controlador de Productos
    - CRUD completo de productos
    - Búsqueda por SKU
    - Listar categorías y marcas únicas

19. **controllers/saleController.js** - Controlador de Ventas
    - Crear venta (actualiza stock automáticamente)
    - Listar ventas con filtros
    - Cierre de caja
    - Cancelar venta

20. **controllers/customerController.js** - Controlador de Clientes
    - CRUD de clientes
    - Historial de compras del cliente

21. **controllers/userController.js** - Controlador de Usuarios
    - CRUD de usuarios del sistema
    - Solo admin puede crear/editar/eliminar

22. **controllers/dashboardController.js** - Controlador del Dashboard
    - Estadísticas generales (ventas totales, productos, stock bajo)
    - Ventas por día (últimos 7/30 días)
    - Productos más vendidos
    - Ventas por método de pago

23. **controllers/supplierController.js** - Controlador de Proveedores
    - CRUD de proveedores

24. **controllers/purchaseOrderController.js** - Controlador de Órdenes de Compra
    - Crear orden manual
    - Generar orden automática basada en stock bajo
    - Recibir orden (actualiza stock)
    - Cambiar estado

25. **controllers/returnController.js** - Controlador de Devoluciones
    - Crear devolución
    - Aprobar (devuelve stock y dinero)
    - Rechazar
    - Estadísticas

26. **controllers/settingsController.js** - Controlador de Configuración
    - Obtener configuración actual
    - Actualizar configuración

27. **controllers/cashWithdrawalController.js** - Controlador de Retiros de Caja
    - Crear retiro
    - Listar retiros (con filtros)
    - Aprobar/rechazar (solo admin)
    - Eliminar (solo admin)

### Backend - Rutas

28. **routes/authRoutes.js** - Rutas de autenticación
    - POST /api/auth/login
    - GET /api/auth/profile (protected)
    - PUT /api/auth/profile (protected)

29. **routes/productRoutes.js** - Rutas de productos
    - GET/POST /api/products
    - GET/PUT/DELETE /api/products/:id
    - GET /api/products/sku/:sku
    - GET /api/products/categories/list
    - GET /api/products/brands/list

30. **routes/saleRoutes.js** - Rutas de ventas
    - GET/POST /api/sales
    - GET /api/sales/:id
    - POST /api/sales/close-register
    - PUT /api/sales/:id/cancel

31. **routes/customerRoutes.js** - Rutas de clientes
32. **routes/userRoutes.js** - Rutas de usuarios
33. **routes/dashboardRoutes.js** - Rutas del dashboard
34. **routes/supplierRoutes.js** - Rutas de proveedores
35. **routes/purchaseOrderRoutes.js** - Rutas de órdenes de compra
36. **routes/returnRoutes.js** - Rutas de devoluciones
37. **routes/settingsRoutes.js** - Rutas de configuración
38. **routes/cashWithdrawalRoutes.js** - Rutas de retiros de caja
39. **routes/proxyRoutes.js** - Proxy para APIs externas (clima)

### Frontend - Stores Zustand

40. **client/src/store/cartStore.js** - Store del carrito de compras
    - Estado: items en el carrito
    - Acciones: agregar, quitar, actualizar cantidad, limpiar

41. **client/src/store/settingsStore.js** - Store de configuración
    - Estado: configuración del negocio
    - Acciones: cargar y actualizar settings

42. **client/src/store/themeStore.js** - Store del tema (dark/light)
    - Estado: modo oscuro/claro
    - Acción: toggle theme

### Frontend - Páginas Principales

43. **client/src/pages/Login.jsx** - Página de inicio de sesión
    - Formulario de login
    - Validación de campos
    - Redirección al dashboard

44. **client/src/pages/Dashboard.jsx** - Dashboard principal
    - Cards de estadísticas
    - Gráficas de ventas
    - Productos con stock bajo
    - Widgets de clima y reloj

45. **client/src/pages/Billing.jsx** - Página de facturación (POS)
    - Búsqueda de productos por SKU
    - Carrito de compras
    - Cálculo de totales e impuestos
    - Procesar venta
    - Imprimir recibo

46. **client/src/pages/Inventory.jsx** - Gestión de inventario
    - Tabla de productos
    - Búsqueda y filtros
    - Crear/editar/eliminar productos
    - Indicadores de stock bajo

47. **client/src/pages/SalesHistory.jsx** - Historial de ventas
    - Tabla de ventas con filtros
    - Ver detalles de venta
    - Cancelar venta (solo admin)

48. **client/src/pages/Customers.jsx** - Gestión de clientes
    - CRUD de clientes
    - Ver historial de compras

49. **client/src/pages/Suppliers.jsx** - Gestión de proveedores

50. **client/src/pages/PurchaseOrders.jsx** - Órdenes de compra
    - Crear orden manual
    - Generar orden automática
    - Recibir orden

51. **client/src/pages/Returns.jsx** - Devoluciones
    - Crear devolución
    - Aprobar/rechazar

52. **client/src/pages/CashRegister.jsx** - Cierre de caja
    - Resumen de ventas del día
    - Calcular efectivo esperado vs real
    - Cerrar sesión de caja

53. **client/src/pages/CashWithdrawals.jsx** - Retiros de caja
    - Tabla de retiros
    - Crear retiro
    - Aprobar/rechazar (admin)
    - Filtros por status, categoría, fechas
    - Tarjetas de estadísticas

54. **client/src/pages/Users.jsx** - Gestión de usuarios
    - CRUD de usuarios (solo admin)

55. **client/src/pages/Reports.jsx** - Reportes
    - Reportes de ventas
    - Reportes de inventario
    - Exportar a PDF/Excel

56. **client/src/pages/Settings.jsx** - Configuración del sistema
    - Datos del negocio
    - Configuración de impuestos
    - Subir logo
    - Configuración de impresora

### Frontend - Componentes

57. **client/src/components/Layout/Layout.jsx** - Layout principal
    - Contiene Sidebar y TopBar
    - Outlet de React Router

58. **client/src/components/Layout/Sidebar.jsx** - Barra lateral de navegación
    - Logo del negocio
    - Menú de navegación con secciones expandibles
    - Información del usuario

59. **client/src/components/Layout/TopBar.jsx** - Barra superior
    - Toggle de tema (dark/light)
    - Botón de logout
    - Widgets de clima y reloj

60. **client/src/components/ClockWidget.jsx** - Widget de reloj
    - Muestra fecha y hora en tiempo real

61. **client/src/components/WeatherWidget.jsx** - Widget de clima
    - Obtiene clima actual vía API
    - Muestra temperatura e ícono

62. **client/src/components/AnimatedBackground.jsx** - Fondo animado
    - Animaciones SVG para el login

63. **client/src/components/SkeletonLoader.jsx** - Loaders de carga
    - Skeletons para tablas mientras cargan datos

### Frontend - Configuración

64. **client/src/App.jsx** - Componente raíz
    - React Router con todas las rutas
    - Rutas protegidas
    - Rutas solo para admin

65. **client/src/main.jsx** - Punto de entrada
    - Renderiza App en el DOM
    - Envuelve con StrictMode

66. **client/src/index.css** - Estilos globales
    - Estilos de Tailwind
    - Variables CSS personalizadas
    - Clases utilitarias (glass effects, scrollbars)

67. **client/vite.config.js** - Configuración de Vite
    - Proxy a backend en desarrollo
    - Plugins de React

68. **client/tailwind.config.js** - Configuración de Tailwind
    - Tema personalizado
    - Colores primary
    - Dark mode

### Scripts de Utilidad

69. **scripts/seed.js** - Script de seeding
    - Crea datos de prueba (usuarios, productos, configuración)
    - Útil para desarrollo

70. **scripts/cleanAndSeed.js** - Limpiar y poblar BD
71. **scripts/resetDatabase.js** - Resetear base de datos
72. **scripts/migrateInventoryItems.js** - Migración de colección antigua
73. **scripts/cleanDuplicateCollections.js** - Limpiar colecciones duplicadas

### Archivos de Configuración

74. **package.json** (root) - Dependencias y scripts del backend
75. **client/package.json** - Dependencias y scripts del frontend
76. **.env** - Variables de entorno (no versionado)
77. **nodemon.json** - Configuración de nodemon
78. **.vscode/tasks.json** - Tareas de VS Code

---

## 🎯 Convenciones del Proyecto

### Backend

- **Modelos**: PascalCase, singular (User, Product)
- **Controladores**: camelCase, verbos descriptivos (getProducts, createSale)
- **Rutas**: kebab-case en URLs (/api/products, /api/cash-withdrawals)
- **Middleware**: Primero `protect`, luego `admin` si es necesario
- **Errores**: Try/catch en todos los controladores, uso de errorHandler
- **Validación**: express-validator en rutas críticas

### Frontend

- **Componentes**: PascalCase (Dashboard.jsx, Sidebar.jsx)
- **Stores**: camelCase con prefijo 'use' (useAuthStore, useCartStore)
- **Páginas**: Un componente por página, organizado en carpeta pages/
- **API calls**: Siempre con try/catch, mostrar toast de error
- **Estilos**: Tailwind CSS con clases utilitarias
- **Estado**: Zustand para estado global, useState para estado local

### Estructura de Archivos

```
backend/
  config/         # Configuración (DB, etc)
  controllers/    # Lógica de negocio
  middleware/     # Middleware (auth, errors)
  models/         # Esquemas de Mongoose
  routes/         # Definición de endpoints
  scripts/        # Scripts de utilidad
  server.js       # Punto de entrada

client/
  src/
    components/   # Componentes reutilizables
    pages/        # Páginas de la aplicación
    services/     # API client
    store/        # Stores de Zustand
    App.jsx       # Router principal
    main.jsx      # Punto de entrada
```

---

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt (salt de 10 rondas)
- Tokens JWT con expiración de 30 días
- Middleware protect en todas las rutas privadas
- Validación de roles (admin vs cajero)
- CORS configurado
- Variables sensibles en .env

---

## 🚀 Flujos Principales

### 1. Login
1. Usuario envía email/password a POST /api/auth/login
2. Backend verifica credenciales y genera token JWT
3. Frontend guarda token en localStorage y store de Zustand
4. Todas las peticiones subsecuentes incluyen el token

### 2. Crear Venta
1. Cajero escanea productos (por SKU) en Billing.jsx
2. Se agregan al carrito (cartStore)
3. Al finalizar, se envía a POST /api/sales
4. Backend crea la venta y actualiza stock automáticamente
5. Frontend muestra recibo para imprimir

### 3. Cierre de Caja
1. Cajero va a CashRegister.jsx
2. Sistema muestra ventas del día
3. Cajero cuenta efectivo físico
4. Se calcula diferencia (esperado vs real)
5. Se crea sesión de cierre en BD

### 4. Retiro de Caja
1. Cajero crea retiro en CashWithdrawals.jsx (status: pending)
2. Admin revisa y aprueba/rechaza
3. Si aprueba, se registra authorizedBy
4. Cajero puede ver todos sus retiros, admin ve todos

### 5. Orden de Compra
1. Sistema detecta productos con stock bajo
2. Admin genera orden automática o manual
3. Al recibir orden, se actualiza stock de productos
4. Estado cambia de pending → received

---

## 📊 Base de Datos (MongoDB)

### Colecciones Activas

1. **users** - Usuarios del sistema
2. **products** - Productos en inventario
3. **sales** - Ventas realizadas
4. **customers** - Clientes
5. **suppliers** - Proveedores
6. **purchaseorders** - Órdenes de compra
7. **returns** - Devoluciones
8. **cashwithdrawals** - Retiros de caja
9. **cashiersessions** - Sesiones de caja (cierres)
10. **settings** - Configuración del sistema
11. **categories** (no usada actualmente)
12. **brands** (no usada actualmente)

---

## 🛠️ Comandos Útiles

### Backend
```bash
npm run dev          # Iniciar servidor con nodemon
npm run seed         # Poblar BD con datos de prueba
npm run build        # Build del frontend para producción
```

### Frontend
```bash
cd client
npm run dev          # Iniciar Vite dev server
npm run build        # Build para producción
npm run preview      # Preview del build
npm test             # Ejecutar tests con Vitest
```

### Ambos
```bash
# Usar tarea de VS Code: "Start Full Application"
# O correr ambos manualmente en terminales separadas
```

---

## 📝 Notas Adicionales

- El proyecto usa ES Modules (`"type": "module"` en package.json)
- MongoDB Atlas en la nube (ver MONGO_URI en .env)
- Frontend en puerto 3000, backend en puerto 5000
- Vite hace proxy de /api a http://localhost:5000 en desarrollo
- En producción, Express sirve el build de React como estáticos

---

## 🎨 Tema y UI

- **Colores**: Primary: Blue (#3B82F6), variantes en tailwind.config.js
- **Dark Mode**: Toggle en TopBar, persiste en localStorage
- **Glass Effects**: Clases personalizadas `glass`, `glass-strong`
- **Iconos**: lucide-react (consistentes en toda la app)
- **Fuentes**: Sistema por defecto (sans-serif)
- **Animaciones**: Tailwind transitions y animate classes

---

Este documento sirve como referencia rápida para entender la estructura y propósito de cada archivo en el proyecto AutoParts Manager.
