# 🛣️ Documentación de Rutas Backend

## Resumen

Las rutas conectan los endpoints HTTP con los controladores.
Cada archivo de rutas:
- Define los endpoints de un módulo
- Aplica middleware de autenticación y validación
- Delega la lógica a los controladores

---

## Middleware Común

### protect
- Verifica token JWT en header Authorization
- Inyecta req.user con datos del usuario
- Usado en TODAS las rutas privadas

### admin  
- Verifica que req.user.role === 'admin'
- Se aplica DESPUÉS de protect
- Usado en rutas de creación, actualización, eliminación

### validationMiddleware
- Valida campos requeridos con express-validator
- Retorna errores 400 si faltan campos o formato incorrecto

---

## 1. authRoutes.js

**Base:** `/api/auth`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| POST | /login | - | login | Autenticar usuario |
| GET | /profile | protect | getProfile | Obtener perfil actual |
| PUT | /profile | protect | updateProfile | Actualizar perfil |

**Notas:**
- /login es la única ruta pública (no requiere token)
- Retorna token JWT en login

---

## 2. productRoutes.js ✅ (COMENTADO)

**Base:** `/api/products`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getProducts | Listar productos |
| POST | / | protect, admin, validation | createProduct | Crear producto |
| GET | /categories/list | protect | getCategories | Listar categorías |
| GET | /brands/list | protect | getBrands | Listar marcas |
| GET | /sku/:sku | protect | getProductBySku | Buscar por SKU |
| GET | /:id | protect | getProductById | Obtener por ID |
| PUT | /:id | protect, admin | updateProduct | Actualizar producto |
| DELETE | /:id | protect, admin | deleteProduct | Eliminar producto |

**Query Params:**
- GET /: search, category, brand, lowStock

---

## 3. saleRoutes.js

**Base:** `/api/sales`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getSales | Listar ventas |
| POST | / | protect, validation | createSale | Crear venta |
| GET | /user/me | protect | getMySales | Mis ventas (cajero) |
| POST | /close-register | protect | closeCashRegister | Cerrar caja |
| GET | /:id | protect | getSaleById | Obtener venta |
| PUT | /:id/cancel | protect, admin | cancelSale | Cancelar venta |

**Query Params:**
- GET /: startDate, endDate, status, paymentMethod

**Importante:**
- createSale actualiza stock automáticamente
- cancelSale devuelve stock (solo admin)

---

## 4. customerRoutes.js

**Base:** `/api/customers`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getCustomers | Listar clientes |
| POST | / | protect | createCustomer | Crear cliente |
| GET | /:id | protect | getCustomerById | Obtener cliente |
| GET | /:id/purchases | protect | getCustomerPurchases | Historial de compras |
| PUT | /:id | protect | updateCustomer | Actualizar cliente |
| DELETE | /:id | protect, admin | deleteCustomer | Eliminar cliente |

**Query Params:**
- GET /: search (nombre, cédula, teléfono)

---

## 5. userRoutes.js

**Base:** `/api/users`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect, admin | getUsers | Listar usuarios |
| POST | / | protect, admin | createUser | Crear usuario |
| GET | /:id | protect, admin | getUserById | Obtener usuario |
| PUT | /:id | protect, admin | updateUser | Actualizar usuario |
| DELETE | /:id | protect, admin | deleteUser | Eliminar usuario |

**Notas:**
- TODAS las rutas requieren rol de admin
- Password se hashea automáticamente en creación/actualización

---

## 6. settingsRoutes.js

**Base:** `/api/settings`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getSettings | Obtener configuración |
| PUT | / | protect, admin | updateSettings | Actualizar configuración |

**Notas:**
- Solo existe un documento de settings (Singleton)
- Actualización solo para admin

---

## 7. dashboardRoutes.js

**Base:** `/api/dashboard`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | /stats | protect | getDashboardStats | Estadísticas generales |
| GET | /sales-by-day | protect | getSalesByDay | Ventas por día |
| GET | /top-products | protect | getTopProducts | Productos más vendidos |
| GET | /sales-by-payment | protect | getSalesByPayment | Ventas por método de pago |

**Query Params:**
- /sales-by-day: days (default: 7)
- /top-products: limit (default: 10), days (default: 30)
- /sales-by-payment: days (default: 30)

---

## 8. supplierRoutes.js

**Base:** `/api/suppliers`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getSuppliers | Listar proveedores |
| POST | / | protect, admin | createSupplier | Crear proveedor |
| GET | /:id | protect | getSupplierById | Obtener proveedor |
| PUT | /:id | protect, admin | updateSupplier | Actualizar proveedor |
| DELETE | /:id | protect, admin | deleteSupplier | Eliminar proveedor |

---

## 9. purchaseOrderRoutes.js

**Base:** `/api/purchase-orders`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getPurchaseOrders | Listar órdenes |
| POST | / | protect, admin | createPurchaseOrder | Crear orden manual |
| POST | /generate-auto | protect, admin | generateAutoPurchaseOrder | Crear órdenes automáticas |
| GET | /:id | protect | getPurchaseOrderById | Obtener orden |
| PUT | /:id | protect, admin | updatePurchaseOrder | Actualizar orden |
| PUT | /:id/status | protect, admin | updateOrderStatus | Cambiar status |
| DELETE | /:id | protect, admin | deletePurchaseOrder | Eliminar orden |

**Importante:**
- /generate-auto crea órdenes basadas en stock bajo
- Cambiar status a 'Recibida' actualiza stock de productos

---

## 10. returnRoutes.js

**Base:** `/api/returns`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getReturns | Listar devoluciones |
| POST | / | protect | createReturn | Crear devolución |
| GET | /stats | protect | getReturnStats | Estadísticas |
| GET | /:id | protect | getReturnById | Obtener devolución |
| PUT | /:id/approve | protect, admin | approveReturn | Aprobar devolución |
| PUT | /:id/reject | protect, admin | rejectReturn | Rechazar devolución |

**Query Params:**
- GET /: startDate, endDate, status
- GET /stats: startDate, endDate

**Flujo de Aprobación:**
1. Cajero crea devolución (status: Pendiente)
2. Admin aprueba → devuelve stock + procesa reembolso
3. Admin rechaza → no pasa nada

---

## 11. cashWithdrawalRoutes.js

**Base:** `/api/cash-withdrawals`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | / | protect | getCashWithdrawals | Listar retiros |
| POST | / | protect | createCashWithdrawal | Crear retiro |
| GET | /:id | protect | getCashWithdrawalById | Obtener retiro |
| PATCH | /:id | protect, admin | updateCashWithdrawalStatus | Aprobar/rechazar |
| DELETE | /:id | protect, admin | deleteCashWithdrawal | Eliminar retiro |

**Query Params:**
- GET /: status, category, startDate, endDate

**Lógica por Rol:**
- Admin: crea con status 'approved', ve todos, puede aprobar/rechazar
- Cajero: crea con status 'pending', solo ve los suyos

---

## 12. proxyRoutes.js

**Base:** `/api/proxy`

| Método | Ruta | Middleware | Controlador | Descripción |
|--------|------|-----------|------------|-------------|
| GET | /weather | protect | getWeather | Obtener clima actual |

**Notas:**
- Hace proxy a OpenWeatherMap API
- Usa configuración de weatherLocation y weatherApiKey de Settings
- Evita exponer API key en el frontend

---

## Resumen de Middleware por Tipo de Operación

### Operaciones de Lectura (GET)
```javascript
router.get('/', protect, controller);
```
- Cualquier usuario autenticado puede leer

### Operaciones de Creación (POST)
```javascript
router.post('/', protect, admin, validation, controller);
```
- Solo admin (excepto: sales, returns, cash-withdrawals)
- Validación de campos requeridos

### Operaciones de Actualización (PUT/PATCH)
```javascript
router.put('/:id', protect, admin, controller);
```
- Solo admin (excepto: perfil propio)

### Operaciones de Eliminación (DELETE)
```javascript
router.delete('/:id', protect, admin, controller);
```
- Solo admin siempre

---

## Convenciones de URL

### Recursos
- `/api/products` - Colección
- `/api/products/:id` - Recurso individual

### Sub-recursos
- `/api/customers/:id/purchases` - Sub-colección

### Acciones especiales
- `/api/sales/:id/cancel` - Acción sobre recurso
- `/api/returns/:id/approve` - Acción sobre recurso
- `/api/purchase-orders/generate-auto` - Acción sobre colección

### Filtros
- `/api/products/sku/:sku` - Búsqueda por campo alternativo
- `/api/products/categories/list` - Listar valores únicos

---

## Códigos de Respuesta por Operación

| Operación | Éxito | Error |
|-----------|-------|-------|
| GET (lista) | 200 | 500 |
| GET (individual) | 200 | 404, 500 |
| POST | 201 | 400, 403, 500 |
| PUT/PATCH | 200 | 400, 403, 404, 500 |
| DELETE | 200 | 403, 404, 500 |

**Errores comunes:**
- 400: Validación fallida (SKU duplicado, campos faltantes)
- 401: Token inválido/expirado
- 403: Sin permisos (no admin)
- 404: Recurso no encontrado
- 500: Error del servidor

---

## Ejemplo de Uso con Axios

```javascript
// Listar productos
const { data } = await api.get('/products?search=filtro');

// Crear producto
const { data } = await api.post('/products', {
  sku: 'ABC123',
  name: 'Filtro de Aceite',
  purchasePrice: 100,
  sellingPrice: 150,
  stock: 20
});

// Actualizar producto
const { data } = await api.put('/products/ID', {
  stock: 25
});

// Eliminar producto
await api.delete('/products/ID');
```

Token se agrega automáticamente por el interceptor de Axios.

---

Este documento sirve como referencia rápida de todos los endpoints disponibles en el backend.
