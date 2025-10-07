# Sistema de Auditoría de Acciones de Usuario

## 📋 Descripción General

Este sistema registra exclusivamente **eventos de negocio significativos** realizados por usuarios, en un formato legible para humanos. Es un sistema **separado y complementario** al log técnico del sistema.

---

## 🎯 Objetivo

Proporcionar un registro claro y comprensible de las acciones que los usuarios realizan sobre los datos y funcionalidades clave del sistema, facilitando:

- **Auditoría de cumplimiento** - Seguimiento de quién hizo qué y cuándo
- **Seguridad** - Detección de accesos no autorizados o actividades sospechosas
- **Trazabilidad** - Historial completo de modificaciones de datos
- **Análisis de comportamiento** - Patrones de uso del sistema
- **Resolución de conflictos** - Evidencia de cambios realizados

---

## 🏗️ Arquitectura

### Componentes del Sistema

```
📁 Backend
├── models/AuditLog.js              # Modelo de datos de auditoría
├── services/auditLogService.js     # Lógica de registro de auditoría
├── routes/auditLogRoutes.js        # Endpoints de API
└── controllers/                    # Integración en lógica de negocio
    ├── saleController.js
    ├── productController.js
    ├── authController.js
    ├── customerController.js
    └── ... (otros controladores)

📁 Frontend
├── pages/AuditLogs.jsx             # Vista de logs de auditoría
├── App.jsx                         # Ruta /auditoria
└── components/Layout/Sidebar.jsx   # Enlace en menú
```

---

## 📊 Estructura de Datos

Cada entrada de auditoría contiene:

### Campos Principales

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `user` | ObjectId | Usuario que realizó la acción | `507f1f77bcf86cd799439011` |
| `userInfo.name` | String | Nombre del usuario (histórico) | `"Edgar Padilla"` |
| `userInfo.username` | String | Username del usuario | `"epadilla"` |
| `userInfo.role` | String | Rol del usuario | `"admin"` |
| `timestamp` | Date | Fecha y hora exacta | `2025-10-07T09:15:00.000Z` |
| `module` | String | Módulo del sistema | `"ventas"`, `"inventario"`, `"usuarios"` |
| `action` | String | Acción realizada (español) | `"Creación de Venta"`, `"Modificación de Producto"` |
| `entity.type` | String | Tipo de entidad afectada | `"Factura"`, `"Producto"`, `"Cliente"` |
| `entity.id` | String | ID de la entidad | `"507f1f77bcf86cd799439011"` |
| `entity.name` | String | Nombre legible de la entidad | `"Factura #2045"`, `"Producto 'Filtro de Aire XYZ'"` |
| `description` | String | Descripción completa en español | `"Se creó la factura #2045 por un monto de RD$1,250.00"` |
| `changes` | Array | Cambios realizados (opcional) | Ver sección de Cambios |
| `metadata` | Object | Datos adicionales relevantes | IP, monto, cantidad, etc. |
| `result` | String | Resultado de la acción | `"success"`, `"failed"`, `"partial"` |
| `severity` | String | Severidad del evento | `"info"`, `"warning"`, `"critical"` |

### Estructura de Cambios

Para modificaciones, se registra el antes y después:

```javascript
{
  changes: [
    {
      field: "stock",
      fieldLabel: "Stock",
      oldValue: 50,
      newValue: 45
    },
    {
      field: "sellingPrice",
      fieldLabel: "Precio de Venta",
      oldValue: "RD$550.00",
      newValue: "RD$575.00"
    }
  ]
}
```

---

## 🔍 Eventos Registrados

### 📦 Módulo de Ventas

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Creación de Venta** | Se genera una nueva factura | `info` |
| **Anulación de Venta** | Se cancela una factura existente | `warning` |
| **Modificación de Venta** | Se edita una venta | `info` |
| **Registro de Pago** | Se registra un pago a una factura | `info` |

**Ejemplo de registro:**
```
Usuario: Edgar Padilla
Fecha: 07/10/2025 09:15:30 AM
Acción: Creación de Venta
Entidad: Factura #2045
Descripción: Se creó la factura #2045 por un monto de RD$1,250.00 para el cliente Juan Pérez
Metadata: {
  itemsCount: 3,
  paymentMethod: "Efectivo",
  discount: 50.00
}
```

### 📦 Módulo de Inventario

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Creación de Producto** | Se añade un nuevo producto | `info` |
| **Eliminación de Producto** | Se elimina un producto | `warning` |
| **Modificación de Producto** | Se edita un producto existente | `info` |
| **Ajuste de Stock** | Se ajusta manualmente el stock | `info` |
| **Cambio de Precio** | Se modifica el precio de venta | `info` |

**Ejemplo de registro:**
```
Usuario: María González
Fecha: 07/10/2025 10:30:15 AM
Acción: Modificación de Producto
Entidad: Producto "Aceite 10W40"
Descripción: Se modificó el producto "Aceite 10W40" (SKU: ACE-10W40)
Cambios:
  - Precio de Venta: "RD$550.00" → "RD$575.00"
  - Stock: "50" → "45"
```

### 👥 Módulo de Clientes

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Creación de Cliente** | Se registra un nuevo cliente | `info` |
| **Eliminación de Cliente** | Se elimina un cliente | `warning` |
| **Modificación de Cliente** | Se edita información del cliente | `info` |

### 🏭 Módulo de Proveedores

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Creación de Proveedor** | Se registra un nuevo proveedor | `info` |
| **Eliminación de Proveedor** | Se elimina un proveedor | `warning` |
| **Modificación de Proveedor** | Se edita información del proveedor | `info` |

### 🔐 Módulo de Usuarios y Seguridad

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Inicio de Sesión Exitoso** | Un usuario inicia sesión correctamente | `info` |
| **Intento de Inicio de Sesión Fallido** | Intento fallido de acceso | `warning` |
| **Cierre de Sesión** | Un usuario cierra sesión | `info` |
| **Creación de Usuario** | Se crea un nuevo usuario del sistema | `info` |
| **Eliminación de Usuario** | Se elimina un usuario | `warning` |
| **Cambio de Rol** | Se modifica el rol de un usuario | `warning` |
| **Cambio de Permisos** | Se modifican permisos de usuario | `warning` |
| **Cambio de Contraseña** | Usuario cambia su contraseña | `info` |

**Ejemplo de registro:**
```
Usuario: N/A
Fecha: 07/10/2025 08:00:00 AM
Acción: Intento de Inicio de Sesión Fallido
Entidad: Usuario "edgar@ejemplo.com"
Descripción: Intento fallido de inicio de sesión con el email: edgar@ejemplo.com
Metadata: {
  attemptedUsername: "edgar@ejemplo.com",
  reason: "Contraseña incorrecta",
  ip: "192.168.1.105"
}
```

### 💰 Módulo de Caja

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Apertura de Caja** | Se abre una sesión de caja | `info` |
| **Cierre de Caja** | Se cierra una sesión de caja | `info` |
| **Retiro de Efectivo** | Se retira dinero de la caja | `warning` |

### 🔄 Módulo de Devoluciones

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Creación de Devolución** | Se procesa una devolución | `info` |
| **Anulación de Devolución** | Se cancela una devolución | `warning` |

### 📋 Módulo de Órdenes de Compra

| Acción | Descripción | Severidad |
|--------|-------------|-----------|
| **Creación de Orden de Compra** | Se genera una orden a proveedor | `info` |
| **Recepción de Orden de Compra** | Se recibe mercancía de una orden | `info` |
| **Anulación de Orden de Compra** | Se cancela una orden | `warning` |

---

## 💻 Uso Técnico

### Backend: Registrar Eventos

#### Método Genérico

```javascript
import AuditLogService from '../services/auditLogService.js';

await AuditLogService.log({
  user: req.user,                    // Usuario autenticado
  module: 'ventas',                  // Módulo del sistema
  action: 'Creación de Venta',       // Acción en español
  entity: {
    type: 'Factura',
    id: sale._id.toString(),
    name: `Factura #${sale.invoiceNumber}`
  },
  description: `Se creó la factura #${sale.invoiceNumber} por RD$${total.toFixed(2)}`,
  changes: [],                       // Opcional: array de cambios
  metadata: {                        // Opcional: datos adicionales
    itemsCount: 3,
    paymentMethod: 'Efectivo'
  },
  req                               // Request object (para IP, UserAgent)
});
```

#### Métodos de Conveniencia

El servicio proporciona métodos específicos por módulo:

**Ventas:**
```javascript
await AuditLogService.logSale({
  user: req.user,
  action: 'Creación de Venta',
  saleId: sale._id.toString(),
  saleNumber: sale.invoiceNumber,
  description: `Se creó la factura #${sale.invoiceNumber}...`,
  amount: total,
  customer: customerInfo?.fullName,
  metadata: { itemsCount: 3 },
  req
});
```

**Inventario:**
```javascript
await AuditLogService.logInventory({
  user: req.user,
  action: 'Modificación de Producto',
  productId: product._id.toString(),
  productName: product.name,
  description: `Se modificó el producto "${product.name}"...`,
  changes: [
    { field: 'price', fieldLabel: 'Precio', oldValue: 550, newValue: 575 }
  ],
  metadata: { sku: product.sku },
  req
});
```

**Autenticación:**
```javascript
await AuditLogService.logAuth({
  user,
  action: 'Inicio de Sesión Exitoso',
  description: `${user.name} inició sesión exitosamente`,
  metadata: { email: user.email, role: user.role },
  req,
  result: 'success'
});
```

**Clientes:**
```javascript
await AuditLogService.logCustomer({
  user: req.user,
  action: 'Creación de Cliente',
  customerId: customer._id.toString(),
  customerName: customer.fullName,
  description: `Se creó el cliente "${customer.fullName}"`,
  metadata: { phone: customer.phone },
  req
});
```

### Integración en Controladores

**Ubicación:** Después de operaciones exitosas en la base de datos

```javascript
export const createSale = async (req, res) => {
  try {
    // 1. Validación de datos
    // 2. Lógica de negocio
    // 3. Guardar en base de datos
    const sale = await Sale.create({...});
    
    // 4. Log técnico del sistema (ya existente)
    await LogService.logAction({...});
    
    // 5. ✨ Log de auditoría de usuario (NUEVO)
    await AuditLogService.logSale({
      user: req.user,
      action: 'Creación de Venta',
      saleId: sale._id.toString(),
      saleNumber: sale.invoiceNumber,
      description: `Se creó la factura #${sale.invoiceNumber}...`,
      ...
    });
    
    // 6. Responder al cliente
    res.status(201).json(sale);
    
  } catch (error) {
    // Manejo de errores
  }
};
```

---

## 🖥️ Interfaz de Usuario

### Acceso

**Ruta:** `/auditoria`  
**Permisos:** Solo administradores  
**Menú:** Sidebar → "Auditoría de Usuario"

### Características de la Interfaz

#### 1. Estadísticas Resumidas (7 días)
- Total de acciones
- Acciones críticas
- Advertencias
- Acciones normales

#### 2. Filtros Avanzados
- **Módulo:** Ventas, Inventario, Clientes, etc.
- **Acción:** Lista específica por módulo
- **Severidad:** Info, Warning, Critical
- **Tipo de Entidad:** Factura, Producto, Cliente, etc.
- **Rango de Fechas:** Inicio y fin
- **Paginación:** 25, 50, 100, 200 logs por página

#### 3. Tabla de Logs
Columnas:
- Fecha/Hora (con icono de reloj)
- Usuario (nombre + rol)
- Módulo (badge con color)
- Acción (texto descriptivo)
- Entidad Afectada (tipo + nombre)
- Descripción (texto completo)
- Severidad (badge con icono)
- Detalles (botón para modal)

#### 4. Modal de Detalles Completos
Al hacer clic en "Ver detalles":
- Información completa del usuario
- Fecha y hora extendida
- Módulo y severidad
- Acción realizada
- Entidad afectada (con ID)
- Descripción completa
- **Cambios realizados** (tabla before/after)
- **Metadata** (JSON formateado)

#### 5. Exportación
- Botón "Exportar CSV"
- Descarga archivo con logs visibles
- Formato: `auditoria_2025-10-07.csv`

#### 6. Limpieza
- Botón "Limpiar Antiguos"
- Elimina logs mayores a 365 días
- Confirmación antes de ejecutar

---

## 🔐 Seguridad

### Permisos de Acceso

- **Visualización:** Solo administradores
- **Exportación:** Solo administradores
- **Limpieza:** Solo administradores
- **Creación:** Automática por el sistema

### Protecciones

- Los logs **no pueden ser editados** ni eliminados individualmente
- Solo limpieza masiva por antigüedad (365 días)
- Registros inmutables para auditoría forense
- Información del usuario guardada históricamente (aunque el usuario se elimine)

---

## 📡 API Endpoints

### GET /api/audit-logs
Obtener logs con filtros

**Query Parameters:**
- `page` - Número de página (default: 1)
- `limit` - Logs por página (default: 50)
- `module` - Filtrar por módulo
- `action` - Filtrar por acción
- `severity` - Filtrar por severidad
- `entityType` - Filtrar por tipo de entidad
- `startDate` - Fecha de inicio (ISO 8601)
- `endDate` - Fecha de fin (ISO 8601)

**Respuesta:**
```json
{
  "logs": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 245,
    "pages": 5
  }
}
```

### GET /api/audit-logs/stats
Obtener estadísticas

**Query Parameters:**
- `days` - Número de días hacia atrás (default: 7)

**Respuesta:**
```json
{
  "stats": [
    { "_id": { "module": "ventas", "action": "Creación de Venta" }, "count": 45 },
    ...
  ],
  "summary": {
    "total": 245,
    "critical": 3,
    "warning": 28,
    "info": 214
  }
}
```

### DELETE /api/audit-logs/clean
Limpiar logs antiguos

**Body:**
```json
{
  "daysToKeep": 365
}
```

**Respuesta:**
```json
{
  "message": "Se eliminaron 150 logs anteriores a 07/10/2024",
  "deleted": 150,
  "cutoffDate": "2024-10-07T00:00:00.000Z"
}
```

---

## 🔄 Diferencias: Log Técnico vs Auditoría de Usuario

| Aspecto | Log Técnico (`/api/logs`) | Auditoría de Usuario (`/api/audit-logs`) |
|---------|---------------------------|----------------------------------------|
| **Propósito** | Debug, monitoreo técnico | Auditoría de negocio, cumplimiento |
| **Audiencia** | Desarrolladores, DevOps | Administradores, auditores |
| **Nivel** | Peticiones HTTP, errores, performance | Eventos de negocio significativos |
| **Formato** | Técnico (GET /api/products - 200) | Legible ("Se creó el producto X") |
| **Granularidad** | Todas las peticiones | Solo acciones importantes |
| **Cambios** | No registra before/after | Registra valores antiguos y nuevos |
| **Ejemplo** | `GET /api/products - 200 - 45ms` | `"Se modificó el precio del producto 'Aceite 10W40' de RD$550 a RD$575"` |

**Ambos sistemas coexisten:**
- El log técnico sigue registrando todas las peticiones HTTP
- La auditoría registra solo eventos de negocio

---

## 📝 Ejemplos Completos

### Ejemplo 1: Crear una Venta

**Código en `saleController.js`:**
```javascript
// Después de crear la venta exitosamente
await AuditLogService.logSale({
  user: req.user,
  action: 'Creación de Venta',
  saleId: sale._id.toString(),
  saleNumber: sale.invoiceNumber,
  description: `Se creó la factura #${sale.invoiceNumber} por un monto de RD$${total.toFixed(2)}${customerInfo ? ` para el cliente ${customerInfo.fullName}` : ''}`,
  amount: total,
  customer: customerInfo?.fullName,
  metadata: {
    itemsCount: sale.items.length,
    paymentMethod: sale.paymentMethod,
    discount: totalDiscount
  },
  req
});
```

**Registro generado:**
```json
{
  "_id": "671e9a5b8f4d2a001c8e4567",
  "user": "507f1f77bcf86cd799439011",
  "userInfo": {
    "username": "epadilla",
    "name": "Edgar Padilla",
    "role": "admin"
  },
  "timestamp": "2025-10-07T09:15:30.000Z",
  "module": "ventas",
  "action": "Creación de Venta",
  "entity": {
    "type": "Factura",
    "id": "671e9a5b8f4d2a001c8e4568",
    "name": "Factura #2045"
  },
  "description": "Se creó la factura #2045 por un monto de RD$1,250.00 para el cliente Juan Pérez",
  "changes": [],
  "metadata": {
    "amount": 1250.00,
    "customer": "Juan Pérez",
    "itemsCount": 3,
    "paymentMethod": "Efectivo",
    "discount": 50.00,
    "ip": "192.168.1.105",
    "userAgent": "Mozilla/5.0..."
  },
  "result": "success",
  "severity": "info"
}
```

### Ejemplo 2: Modificar un Producto

**Código en `productController.js`:**
```javascript
// Calcular cambios
const changes = [];
if (before.stock !== after.stock) {
  changes.push({
    field: 'stock',
    fieldLabel: 'Stock',
    oldValue: before.stock,
    newValue: after.stock
  });
}
if (before.sellingPrice !== after.sellingPrice) {
  changes.push({
    field: 'sellingPrice',
    fieldLabel: 'Precio de Venta',
    oldValue: `RD$${before.sellingPrice}`,
    newValue: `RD$${after.sellingPrice}`
  });
}

await AuditLogService.logInventory({
  user: req.user,
  action: 'Modificación de Producto',
  productId: updatedProduct._id.toString(),
  productName: updatedProduct.name,
  description: `Se modificó el producto "${updatedProduct.name}" (SKU: ${updatedProduct.sku})`,
  changes,
  metadata: { sku: updatedProduct.sku, changesCount: changes.length },
  req
});
```

**Registro generado:**
```json
{
  "_id": "671e9b2c8f4d2a001c8e4569",
  "user": "507f1f77bcf86cd799439012",
  "userInfo": {
    "username": "mgonzalez",
    "name": "María González",
    "role": "employee"
  },
  "timestamp": "2025-10-07T10:30:15.000Z",
  "module": "inventario",
  "action": "Modificación de Producto",
  "entity": {
    "type": "Producto",
    "id": "671e9b2c8f4d2a001c8e456a",
    "name": "Aceite 10W40"
  },
  "description": "Se modificó el producto \"Aceite 10W40\" (SKU: ACE-10W40)",
  "changes": [
    {
      "field": "stock",
      "fieldLabel": "Stock",
      "oldValue": 50,
      "newValue": 45
    },
    {
      "field": "sellingPrice",
      "fieldLabel": "Precio de Venta",
      "oldValue": "RD$550.00",
      "newValue": "RD$575.00"
    }
  ],
  "metadata": {
    "sku": "ACE-10W40",
    "changesCount": 2,
    "ip": "192.168.1.110",
    "userAgent": "Mozilla/5.0..."
  },
  "result": "success",
  "severity": "info"
}
```

### Ejemplo 3: Intento de Login Fallido

**Código en `authController.js`:**
```javascript
await AuditLogService.logAuth({
  user: null,
  action: 'Intento de Inicio de Sesión Fallido',
  description: `Intento fallido de inicio de sesión con el email: ${email}`,
  metadata: {
    attemptedUsername: email,
    reason: 'Contraseña incorrecta'
  },
  req,
  result: 'failed'
});
```

**Registro generado:**
```json
{
  "_id": "671e9c3d8f4d2a001c8e456b",
  "user": "unknown",
  "userInfo": {
    "username": "Desconocido",
    "name": "Desconocido",
    "role": "unknown"
  },
  "timestamp": "2025-10-07T08:00:00.000Z",
  "module": "usuarios",
  "action": "Intento de Inicio de Sesión Fallido",
  "entity": {
    "type": "Usuario",
    "id": "unknown",
    "name": "edgar@ejemplo.com"
  },
  "description": "Intento fallido de inicio de sesión con el email: edgar@ejemplo.com",
  "changes": [],
  "metadata": {
    "attemptedUsername": "edgar@ejemplo.com",
    "reason": "Contraseña incorrecta",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0..."
  },
  "result": "failed",
  "severity": "warning"
}
```

---

## ✅ Checklist de Implementación

### Backend
- [x] Modelo `AuditLog` creado
- [x] Servicio `AuditLogService` implementado
- [x] Rutas API creadas y registradas
- [x] Integración en `saleController` (crear y anular)
- [x] Integración en `productController` (crear, modificar, eliminar)
- [x] Integración en `authController` (login exitoso y fallido)
- [ ] Integración en `customerController` (pendiente)
- [ ] Integración en `supplierController` (pendiente)
- [ ] Integración en `userController` (pendiente)
- [ ] Integración en `cashWithdrawalController` (pendiente)
- [ ] Integración en `returnController` (pendiente)
- [ ] Integración en `purchaseOrderController` (pendiente)

### Frontend
- [x] Página `AuditLogs.jsx` creada
- [x] Ruta `/auditoria` registrada en `App.jsx`
- [x] Enlace en `Sidebar.jsx` agregado
- [x] Filtros implementados
- [x] Modal de detalles implementado
- [x] Exportación CSV implementada
- [x] Limpieza de logs antiguos implementada

### Testing
- [ ] Probar creación de venta genera auditoría
- [ ] Probar anulación de venta genera auditoría
- [ ] Probar modificación de producto genera auditoría
- [ ] Probar eliminación de producto genera auditoría
- [ ] Probar login exitoso genera auditoría
- [ ] Probar login fallido genera auditoría
- [ ] Probar filtros en interfaz
- [ ] Probar exportación CSV
- [ ] Probar limpieza de logs antiguos

---

## 🚀 Próximos Pasos

1. **Completar integraciones** en controladores pendientes
2. **Probar todos los flujos** de eventos
3. **Ajustar descripciones** según feedback de usuarios
4. **Configurar retención** de logs (actualmente 365 días)
5. **Implementar alertas** para eventos críticos (opcional)

---

## 📞 Soporte

Si necesitas registrar un nuevo tipo de evento de auditoría:

1. Verifica si la acción ya está definida en `models/AuditLog.js`
2. Si no existe, agrégala al enum de `action`
3. Usa el método apropiado de `AuditLogService` en tu controlador
4. Proporciona una descripción clara en español
5. Incluye cambios y metadata relevantes

**Ejemplo:**
```javascript
await AuditLogService.log({
  user: req.user,
  module: 'tu_modulo',
  action: 'Tu Acción en Español',
  entity: { type: 'TipoEntidad', id: '...', name: '...' },
  description: 'Descripción legible de lo que pasó',
  req
});
```

---

**Fecha de creación:** 07 de Octubre de 2025  
**Versión:** 1.0.0  
**Autor:** Sistema AutoParts Manager
