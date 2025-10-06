# 📘 Documentación de Controladores Backend

## Resumen

Los controladores contienen la lógica de negocio de la aplicación. Cada controlador:
- Recibe peticiones HTTP desde las rutas
- Procesa la lógica necesaria
- Interactúa con los modelos de MongoDB
- Devuelve respuestas JSON

Todos usan try/catch para manejo de errores consistente.

---

## 1. authController.js ✅ (YA COMENTADO)

### Funciones:
- **login(req, res)** - POST /api/auth/login
  - Valida email y password
  - Verifica usuario activo
  - Compara contraseña hasheada
  - Genera token JWT
  - Retorna: { _id, name, email, role, token }

- **getProfile(req, res)** - GET /api/auth/profile
  - Obtiene datos del usuario del token (req.user)
  - Requiere middleware `protect`
  - Retorna: Datos del perfil sin password

- **updateProfile(req, res)** - PUT /api/auth/profile
  - Actualiza name, email y/o password
  - Si cambia password, se hashea automáticamente
  - Genera nuevo token
  - Retorna: Datos actualizados + nuevo token

---

## 2. productController.js ✅ (YA COMENTADO)

### Funciones:
- **getProducts(req, res)** - GET /api/products
  - Query params: search, category, brand, lowStock
  - Búsqueda por SKU o nombre (regex case-insensitive)
  - Filtros opcionales por categoría y marca
  - Puede filtrar solo productos con stock bajo
  - Retorna: Array de productos

- **getProductById(req, res)** - GET /api/products/:id
  - Busca producto por MongoDB ObjectId
  - Retorna: Producto o 404

- **getProductBySku(req, res)** - GET /api/products/sku/:sku
  - Busca por SKU (convertido a mayúsculas)
  - Usado en facturación rápida (escaneo de código)
  - Retorna: Producto o 404

- **createProduct(req, res)** - POST /api/products
  - Valida SKU único antes de crear
  - Convierte SKU a mayúsculas
  - Retorna: Producto creado (201)

- **updateProduct(req, res)** - PUT /api/products/:id
  - Si cambia SKU, valida que sea único
  - Usa findByIdAndUpdate con runValidators
  - Retorna: Producto actualizado

- **deleteProduct(req, res)** - DELETE /api/products/:id
  - Elimina producto del inventario
  - Retorna: Mensaje de confirmación

- **getCategories(req, res)** - GET /api/products/categories/list
  - Usa Product.distinct('category')
  - Filtra valores vacíos
  - Retorna: Array de strings únicos

- **getBrands(req, res)** - GET /api/products/brands/list
  - Usa Product.distinct('brand')
  - Filtra valores vacíos
  - Retorna: Array de strings únicos

---

## 3. saleController.js

### Funciones Principales:

- **createSale(req, res)** - POST /api/sales
  - **Flujo:**
    1. Genera número de factura automático
    2. Valida stock disponible de cada producto
    3. Crea venta con items y totales
    4. **Actualiza stock** (resta cantidad vendida)
    5. **Actualiza soldCount** de cada producto
    6. Actualiza historial del cliente (si existe)
  - Body: { customer, items: [{ product, quantity }], paymentMethod, notes }
  - Retorna: Venta creada con productos populated

- **getSales(req, res)** - GET /api/sales
  - Query params: startDate, endDate, status, paymentMethod
  - Filtra ventas por rango de fechas
  - Populate: user, customer, items.product
  - Ordenadas por fecha descendente
  - Retorna: Array de ventas

- **getSaleById(req, res)** - GET /api/sales/:id
  - Populate completo de relaciones
  - Retorna: Venta con todos los detalles

- **getMySales(req, res)** - GET /api/sales/user/me
  - Filtra ventas del usuario actual (req.user._id)
  - Usado por cajeros para ver sus propias ventas
  - Retorna: Array de ventas del usuario

- **closeCashRegister(req, res)** - POST /api/sales/close-register
  - **Flujo:**
    1. Obtiene ventas del día del cajero
    2. Calcula totales esperados por método de pago
    3. Recibe totales contados del cajero
    4. Calcula diferencias (contado - esperado)
    5. Crea CashierSession
  - Body: { countedTotals: { cash, card, transfer }, notes }
  - Retorna: Sesión de cierre con diferencias

- **cancelSale(req, res)** - PUT /api/sales/:id/cancel
  - Solo admin puede cancelar ventas
  - Cambia status a 'Cancelada'
  - **Devuelve stock** de los productos
  - Retorna: Venta actualizada

---

## 4. customerController.js

### Funciones:
- **getCustomers(req, res)** - GET /api/customers
  - Query params: search (nombre, cédula, teléfono)
  - Búsqueda con regex case-insensitive
  - Retorna: Array de clientes

- **getCustomerById(req, res)** - GET /api/customers/:id
  - Populate purchaseHistory con detalles de ventas
  - Retorna: Cliente con historial completo

- **createCustomer(req, res)** - POST /api/customers
  - Valida email único (si se proporciona)
  - Retorna: Cliente creado (201)

- **updateCustomer(req, res)** - PUT /api/customers/:id
  - Actualiza datos del cliente
  - Retorna: Cliente actualizado

- **deleteCustomer(req, res)** - DELETE /api/customers/:id
  - Elimina cliente de la BD
  - Retorna: Mensaje de confirmación

- **getCustomerPurchases(req, res)** - GET /api/customers/:id/purchases
  - Obtiene historial de compras del cliente
  - Populate items.product para mostrar detalles
  - Retorna: Array de ventas del cliente

---

## 5. userController.js

### Funciones:
- **getUsers(req, res)** - GET /api/users
  - Solo admin puede acceder
  - Excluye password con .select('-password')
  - Retorna: Array de todos los usuarios

- **getUserById(req, res)** - GET /api/users/:id
  - Solo admin
  - Retorna: Usuario específico sin password

- **createUser(req, res)** - POST /api/users
  - Solo admin puede crear usuarios
  - Valida email único
  - Password se hashea automáticamente (pre-save hook)
  - Retorna: Usuario creado sin password (201)

- **updateUser(req, res)** - PUT /api/users/:id
  - Solo admin
  - Puede cambiar name, email, role, isActive
  - Si cambia password, se hashea automáticamente
  - Retorna: Usuario actualizado

- **deleteUser(req, res)** - DELETE /api/users/:id
  - Solo admin
  - En realidad, debería cambiar isActive a false (soft delete)
  - Retorna: Mensaje de confirmación

---

## 6. dashboardController.js

### Funciones:

- **getDashboardStats(req, res)** - GET /api/dashboard/stats
  - **Calcula:**
    - Total de ventas hoy
    - Total de ventas mes actual
    - Número de productos en inventario
    - Número de productos con stock bajo
    - Ventas completadas vs canceladas
  - Retorna: Objeto con todas las estadísticas

- **getSalesByDay(req, res)** - GET /api/dashboard/sales-by-day
  - Query param: days (default: 7)
  - Agrupa ventas por día
  - Calcula total por día
  - Retorna: Array de { _id: 'YYYY-MM-DD', total, count }

- **getTopProducts(req, res)** - GET /api/dashboard/top-products
  - Query params: limit (default: 10), days (default: 30)
  - Ordena productos por soldCount descendente
  - Filtra por rango de fechas opcional
  - Retorna: Array de productos más vendidos

- **getSalesByPayment(req, res)** - GET /api/dashboard/sales-by-payment
  - Query param: days (default: 30)
  - Agrupa ventas por método de pago
  - Calcula totales por método
  - Retorna: { Efectivo, Tarjeta, Transferencia }

---

## 7. supplierController.js

### Funciones (CRUD básico):
- **getSuppliers(req, res)** - GET /api/suppliers
  - Lista todos los proveedores activos
  - Retorna: Array de proveedores

- **getSupplierById(req, res)** - GET /api/suppliers/:id
  - Retorna: Proveedor específico

- **createSupplier(req, res)** - POST /api/suppliers
  - Valida RNC único (si se proporciona)
  - Retorna: Proveedor creado (201)

- **updateSupplier(req, res)** - PUT /api/suppliers/:id
  - Actualiza datos del proveedor
  - Retorna: Proveedor actualizado

- **deleteSupplier(req, res)** - DELETE /api/suppliers/:id
  - Cambia isActive a false (soft delete)
  - Retorna: Mensaje de confirmación

---

## 8. purchaseOrderController.js

### Funciones:

- **getPurchaseOrders(req, res)** - GET /api/purchase-orders
  - Populate: supplier, items.product, createdBy
  - Ordenadas por fecha descendente
  - Retorna: Array de órdenes

- **getPurchaseOrderById(req, res)** - GET /api/purchase-orders/:id
  - Populate completo
  - Retorna: Orden completa

- **createPurchaseOrder(req, res)** - POST /api/purchase-orders
  - Body: { supplier, items: [{ product, quantity, unitPrice }], notes }
  - orderNumber se genera automáticamente (pre-validate hook)
  - Calcula subtotal, tax, total
  - createdBy = req.user._id
  - Retorna: Orden creada (201)

- **generateAutoPurchaseOrder(req, res)** - POST /api/purchase-orders/generate-auto
  - **Flujo:**
    1. Busca productos con stock <= threshold
    2. Agrupa por supplier
    3. Crea orden para cada supplier automáticamente
    4. Cantidad sugerida = (threshold × 2) - stock actual
  - Retorna: Array de órdenes creadas

- **updatePurchaseOrder(req, res)** - PUT /api/purchase-orders/:id
  - Actualiza datos de la orden
  - Solo si status = 'Pendiente'
  - Retorna: Orden actualizada

- **updateOrderStatus(req, res)** - PUT /api/purchase-orders/:id/status
  - Cambia status de la orden
  - **Si status = 'Recibida':**
    - Actualiza stock de cada producto (suma quantity)
    - Actualiza purchasePrice si es diferente
    - Establece receivedDate = ahora
  - Retorna: Orden actualizada

- **deletePurchaseOrder(req, res)** - DELETE /api/purchase-orders/:id
  - Solo si status = 'Pendiente'
  - Retorna: Mensaje de confirmación

---

## 9. returnController.js

### Funciones:

- **getReturns(req, res)** - GET /api/returns
  - Query params: startDate, endDate, status
  - Populate: sale, customer, items.product, processedBy, approvedBy
  - Retorna: Array de devoluciones

- **getReturnById(req, res)** - GET /api/returns/:id
  - Populate completo
  - Retorna: Devolución con todos los detalles

- **createReturn(req, res)** - POST /api/returns
  - Body: { sale, items: [{ product, quantity, originalPrice }], reason, refundMethod, notes }
  - returnNumber se genera automáticamente
  - Valida que productos existan en la venta original
  - status inicial = 'Pendiente'
  - processedBy = req.user._id
  - Retorna: Devolución creada (201)

- **approveReturn(req, res)** - PUT /api/returns/:id/approve
  - Solo admin puede aprobar
  - **Flujo:**
    1. Cambia status a 'Aprobada'
    2. **Devuelve stock** de cada producto (suma quantity)
    3. Establece approvedBy = req.user._id
    4. Actualiza status de venta original a 'Devuelta' (si es devolución completa)
  - Retorna: Devolución aprobada

- **rejectReturn(req, res)** - PUT /api/returns/:id/reject
  - Solo admin puede rechazar
  - Body: { reason } (razón del rechazo)
  - Cambia status a 'Rechazada'
  - Agrega razón a notes
  - Retorna: Devolución rechazada

- **getReturnStats(req, res)** - GET /api/returns/stats
  - Query params: startDate, endDate
  - **Calcula:**
    - Total devoluciones
    - Total monto devuelto
    - Devoluciones por razón
    - Devoluciones por status
  - Retorna: Objeto con estadísticas

---

## 10. settingsController.js

### Funciones:

- **getSettings(req, res)** - GET /api/settings
  - Usa Settings.getInstance() (patrón Singleton)
  - Retorna: Objeto de configuración único

- **updateSettings(req, res)** - PUT /api/settings
  - Solo admin puede actualizar
  - Usa getInstance() para obtener el documento único
  - Actualiza campos proporcionados
  - updatedAt se actualiza automáticamente
  - Retorna: Settings actualizado

---

## 11. cashWithdrawalController.js

### Funciones:

- **createCashWithdrawal(req, res)** - POST /api/cash-withdrawals
  - Body: { amount, reason, category, notes, receiptAttached }
  - withdrawalNumber se genera automáticamente
  - withdrawnBy = req.user._id
  - **Lógica de status:**
    - Si user.role = 'admin': status = 'approved' (auto-aprobado)
    - Si user.role = 'cajero': status = 'pending' (requiere aprobación)
  - Populate: withdrawnBy
  - Retorna: Retiro creado (201)

- **getCashWithdrawals(req, res)** - GET /api/cash-withdrawals
  - Query params: status, category, startDate, endDate
  - **Lógica por rol:**
    - Admin: ve todos los retiros
    - Cajero: solo ve sus propios retiros (withdrawnBy = req.user._id)
  - Populate: withdrawnBy, authorizedBy
  - **Retorna:**
    - withdrawals: Array de retiros
    - summary: { total, totalAmount, pending, approved, rejected }

- **getCashWithdrawalById(req, res)** - GET /api/cash-withdrawals/:id
  - **Validación de permisos:**
    - Admin: puede ver cualquier retiro
    - Cajero: solo puede ver sus propios retiros
  - Populate: withdrawnBy, authorizedBy
  - Retorna: Retiro completo

- **updateCashWithdrawalStatus(req, res)** - PATCH /api/cash-withdrawals/:id
  - Solo admin puede aprobar/rechazar
  - Body: { status: 'approved' | 'rejected' }
  - Si status = 'approved': establece authorizedBy = req.user._id
  - Retorna: Retiro actualizado

- **deleteCashWithdrawal(req, res)** - DELETE /api/cash-withdrawals/:id
  - Solo admin puede eliminar
  - Elimina permanentemente el retiro
  - Retorna: Mensaje de confirmación

---

## Patrones Comunes

### 1. Estructura de Controlador
```javascript
export const functionName = async (req, res) => {
  try {
    // Lógica de negocio
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error message', error: error.message });
  }
};
```

### 2. Populate de Relaciones
```javascript
await Model.findById(id)
  .populate('user', 'name email') // Solo traer name y email
  .populate('items.product'); // Populate anidado
```

### 3. Filtros con Query Params
```javascript
const { search, status, startDate, endDate } = req.query;
let query = {};

if (search) {
  query.$or = [
    { field1: { $regex: search, $options: 'i' } },
    { field2: { $regex: search, $options: 'i' } }
  ];
}

if (startDate || endDate) {
  query.createdAt = {};
  if (startDate) query.createdAt.$gte = new Date(startDate);
  if (endDate) query.createdAt.$lte = new Date(endDate);
}
```

### 4. Verificación de Permisos
```javascript
// Solo admin
if (req.user.role !== 'admin') {
  return res.status(403).json({ message: 'Acceso denegado' });
}

// Admin o dueño del recurso
if (req.user.role !== 'admin' && resource.userId.toString() !== req.user._id.toString()) {
  return res.status(403).json({ message: 'Acceso denegado' });
}
```

### 5. Transacciones Críticas
Para operaciones que afectan múltiples colecciones:
```javascript
// Al crear venta: actualizar stock + soldCount
// Al aprobar devolución: devolver stock + actualizar venta
// Al recibir orden: actualizar stock de productos
```

---

## Códigos de Estado HTTP

- **200 OK** - Operación exitosa (GET, PUT, PATCH)
- **201 Created** - Recurso creado exitosamente (POST)
- **400 Bad Request** - Datos inválidos (SKU duplicado, etc)
- **401 Unauthorized** - Token inválido o expirado
- **403 Forbidden** - Sin permisos (no admin, etc)
- **404 Not Found** - Recurso no encontrado
- **500 Internal Server Error** - Error del servidor

---

Este documento sirve como referencia rápida para entender la lógica de negocio de cada controlador sin tener que leer todo el código.
