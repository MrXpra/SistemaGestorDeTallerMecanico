# Módulo de Retiros de Caja - Documentación

## 📋 Descripción
Sistema completo para gestionar retiros de efectivo de la caja registradora, con aprobación de administradores y seguimiento detallado.

## 🎯 Características

### Para Cajeros:
- ✅ Registrar nuevos retiros de caja
- ✅ Ver historial de sus propios retiros
- ✅ Categorizar retiros (Personal, Negocio, Proveedor, Otro)
- ✅ Agregar notas y marcar si tienen comprobante
- ✅ Ver estado de sus retiros (Pendiente/Aprobado/Rechazado)

### Para Administradores:
- ✅ Ver todos los retiros del sistema
- ✅ Aprobar o rechazar retiros pendientes
- ✅ Eliminar retiros
- ✅ Ver estadísticas de retiros
- ✅ Filtrar por estado, categoría y fechas

## 🔧 Estructura Técnica

### Backend

**Modelo: `models/CashWithdrawal.js`**
```javascript
{
  withdrawalNumber: String (auto-generado: RET-YYYYMMDD-XXX),
  amount: Number (requerido, > 0),
  reason: String (requerido),
  category: String (personal/business/supplier/other),
  withdrawnBy: ObjectId (ref: User),
  authorizedBy: ObjectId (ref: User),
  withdrawalDate: Date,
  status: String (pending/approved/rejected),
  receiptAttached: Boolean,
  notes: String,
  timestamps: true
}
```

**Controlador: `controllers/cashWithdrawalController.js`**
- `createCashWithdrawal` - Crear nuevo retiro
- `getCashWithdrawals` - Listar retiros con filtros
- `getCashWithdrawalById` - Obtener un retiro específico
- `updateCashWithdrawalStatus` - Aprobar/rechazar (admin only)
- `deleteCashWithdrawal` - Eliminar (admin only)

**Rutas: `/api/cash-withdrawals`**
- `GET /` - Listar retiros (con filtros)
- `POST /` - Crear nuevo retiro
- `GET /:id` - Obtener detalle de un retiro
- `PATCH /:id` - Actualizar estado (admin)
- `DELETE /:id` - Eliminar (admin)

### Frontend

**Página: `client/src/pages/CashWithdrawals.jsx`**

**Componentes:**
1. **Página Principal**
   - Tarjetas de estadísticas (Total, Monto, Pendientes, Aprobados)
   - Filtros por estado, categoría y fechas
   - Tabla de retiros con acciones
   
2. **Modal de Creación**
   - Formulario para registrar nuevo retiro
   - Campos: monto, razón, categoría, notas
   - Checkbox para indicar si hay comprobante

3. **Modal de Detalle**
   - Vista completa de la información del retiro
   - Datos del usuario que retiró
   - Datos del autorizador (si fue aprobado)

**API Cliente: `client/src/services/api.js`**
```javascript
getCashWithdrawals(params)
getCashWithdrawalById(id)
createCashWithdrawal(data)
updateCashWithdrawalStatus(id, data)
deleteCashWithdrawal(id)
```

**Ruta: `/retiros-caja`**
- Agregada en `App.jsx`
- Link agregado en `Sidebar.jsx` (después de Cierre de Caja)

## 🚀 Uso

### Registrar un Retiro
1. Navegar a **Retiros de Caja** en el menú lateral
2. Click en **Nuevo Retiro**
3. Llenar formulario:
   - Monto (requerido)
   - Razón del retiro (requerido)
   - Categoría (opcional)
   - Notas adicionales (opcional)
   - Marcar si tiene comprobante
4. Click en **Registrar Retiro**

**Nota:** 
- Si el usuario es cajero → el retiro queda en estado "Pendiente"
- Si el usuario es admin → el retiro se auto-aprueba

### Aprobar/Rechazar Retiros (Admin)
1. Ver lista de retiros con filtro "Pendientes"
2. Click en ✅ para aprobar o ❌ para rechazar
3. Al rechazar, se puede agregar una nota explicativa

### Filtrar Retiros
- **Por Estado:** Todos / Pendientes / Aprobados / Rechazados
- **Por Categoría:** Todas / Personal / Negocio / Proveedor / Otro
- **Por Fechas:** Rango de fechas inicio y fin

## 📊 Estadísticas Mostradas
- **Total Retiros:** Cantidad total de retiros
- **Monto Total:** Suma de todos los montos retirados
- **Pendientes:** Cantidad de retiros esperando aprobación
- **Aprobados:** Cantidad de retiros aprobados

## 🔐 Permisos
- **Cajeros:** Pueden crear y ver sus propios retiros
- **Administradores:** Pueden ver todos, aprobar, rechazar y eliminar

## 💾 Base de Datos
**Colección:** `cashwithdrawals`
**Índices:** 
- `withdrawalNumber` (unique)
- `withdrawnBy`, `status`, `withdrawalDate`

## ✅ Verificación
El módulo fue probado exitosamente:
- ✅ Endpoint funcionando: `/api/cash-withdrawals`
- ✅ Retiro existente encontrado: RET-20250930-001 ($520)
- ✅ Frontend integrado y rutas configuradas

## 🎨 UI/UX
- Diseño consistente con el resto de la aplicación
- Uso de badges de colores para estados
- Modales responsivos para crear y ver detalles
- Tabla con acciones inline
- Animaciones suaves (fade-in, scale-in)
- Dark mode soportado

## 📝 Notas Adicionales
- Los números de retiro se generan automáticamente (RET-YYYYMMDD-001)
- El sistema guarda quién retiró el dinero y quién lo autorizó
- Se puede marcar si se tiene comprobante físico adjunto
- Las notas permiten agregar contexto adicional

---

**Fecha de Creación:** Octubre 5, 2025
**Estado:** ✅ Completamente funcional e integrado
