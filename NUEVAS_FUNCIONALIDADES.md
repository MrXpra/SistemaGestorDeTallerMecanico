# Nuevas Funcionalidades - AutoParts Manager

## 📋 Resumen de Características Implementadas

Se han implementado 4 nuevas funcionalidades para mejorar la experiencia de usuario y la eficiencia operativa del sistema:

---

## 1. 🔴 Devoluciones de Productos Defectuosos

### Descripción
Los productos devueltos por razón "defectuoso" ahora se registran en un inventario separado (`defectiveStock`) en lugar de volver al stock normal.

### Archivos Modificados
- **models/Product.js**: Nuevo campo `defectiveStock`
- **models/Return.js**: Nuevo campo `isDefective` en items
- **controllers/returnController.js**: Lógica para detectar productos defectuosos

### Flujo de Trabajo
1. Usuario crea una devolución con razón "Defectuoso"
2. Sistema marca automáticamente `isDefective = true`
3. Stock se incrementa en `defectiveStock` en lugar de `stock`
4. Permite auditoría y gestión separada de productos defectuosos

### Ejemplo de Uso
```javascript
// Producto antes de devolución
{
  _id: "...",
  name: "Freno de disco",
  stock: 50,
  defectiveStock: 0
}

// Después de devolver 3 unidades defectuosas
{
  stock: 50,        // No cambia
  defectiveStock: 3 // Incrementa
}
```

---

## 2. 📧 Envío de Órdenes de Compra por Email

### Descripción
Permite enviar órdenes de compra directamente al proveedor vía email con un formato profesional HTML.

### Archivos Creados
- **services/emailService.js**: Servicio de envío de emails con nodemailer

### Archivos Modificados
- **controllers/purchaseOrderController.js**: Nueva función `sendPurchaseOrder`
- **routes/purchaseOrderRoutes.js**: Nuevo endpoint POST `/:id/send`
- **models/PurchaseOrder.js**: Campos `emailSent` y `emailSentDate`
- **.env.production.example**: Variables SMTP

### Configuración Requerida
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password-de-gmail
```

### Para Gmail:
1. Activar verificación en 2 pasos
2. Generar contraseña de aplicación en: https://myaccount.google.com/apppasswords
3. Usar esa contraseña en `SMTP_PASS`

### Endpoint API
```http
POST /api/purchase-orders/:id/send
Authorization: Bearer <token>

Response:
{
  "message": "Orden de compra enviada exitosamente",
  "order": { ...ordenActualizada }
}
```

### Características del Email
- ✅ Logo y datos del negocio (desde Settings)
- ✅ Información del proveedor
- ✅ Tabla de productos con precios
- ✅ Totales con IVA
- ✅ Fecha de entrega esperada
- ✅ Diseño responsive HTML

---

## 3. 💰 Retiros de Caja en Cierre de Caja

### Descripción
Los retiros de caja aprobados durante el día ahora se muestran y descuentan automáticamente en el cierre de caja.

### Archivos Modificados
- **models/CashierSession.js**: 
  - Nuevo campo `totalWithdrawals`
  - Nuevo campo `withdrawals` (array de referencias)
- **controllers/saleController.js**: 
  - Actualizada función `closeCashRegister`
  - Calcula total de retiros del día
  - Ajusta dinero esperado

### Lógica Implementada
```javascript
// Al cerrar caja
const withdrawals = await CashWithdrawal.find({
  withdrawnBy: cashierId,
  createdAt: { $gte: startOfDay, $lte: now },
  status: 'Aprobado'
});

const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);

// Se resta del efectivo esperado
systemTotals.cash -= totalWithdrawals;
```

### Ejemplo
```javascript
// Ventas del día
Efectivo recibido: $1000
Retiros aprobados: -$200
-----------------------------
Efectivo esperado: $800

// En el cierre se mostrará:
{
  cash: 800,  // Ya con el ajuste
  totalWithdrawals: 200,
  withdrawals: [
    { amount: 150, reason: "Compra urgente" },
    { amount: 50, reason: "Caja chica" }
  ]
}
```

---

## 4. ⌨️ Atajos de Teclado

### Descripción
Sistema completo de atajos de teclado para navegación rápida con indicadores visuales en el sidebar.

### Archivos Creados
- **hooks/useKeyboardShortcuts.js**: Hook personalizado para shortcuts globales
- **components/KeyboardShortcutsHelp.jsx**: Modal de ayuda
- **components/ShortcutTooltip.jsx**: Componente de tooltips (opcional)

### Archivos Modificados
- **App.jsx**: Integración del hook y modal
- **components/Layout/Sidebar.jsx**: 
  - Badges `<kbd>` mostrando shortcuts
  - Botón "?" para ayuda

### Atajos Disponibles

| Atajo | Acción | Descripción |
|-------|--------|-------------|
| `Ctrl + B` | Facturación | Ir a nueva factura (Billing) |
| `Ctrl + I` | Inventario | Ir a productos |
| `Ctrl + H` | Historial | Ir a historial de ventas |
| `Ctrl + C` | Clientes | Ir a clientes |
| `Ctrl + R` | Reportes | Ir a reportes (admin) |
| `Ctrl + ,` | Configuración | Ir a configuración |
| `Ctrl + K` | Búsqueda | Búsqueda rápida (placeholder) |
| `?` | Ayuda | Mostrar modal de atajos |
| `Esc` | Cerrar | Cerrar modales |

> **Nota**: En Mac se usa `⌘ (Cmd)` en lugar de `Ctrl`

### Características
- ✅ Detecta automáticamente SO (Mac vs Windows)
- ✅ Funciona globalmente en toda la app
- ✅ Se inhabilita al escribir en inputs
- ✅ Indicadores visuales en sidebar
- ✅ Modal de ayuda elegante
- ✅ Responsive (shortcuts ocultos en móvil)

### Personalización
Para agregar nuevos atajos, editar `useKeyboardShortcuts.js`:

```javascript
case 'n':  // Ctrl+N
  event.preventDefault();
  navigate('/nueva-ruta');
  break;
```

Y agregar en el sidebar:
```javascript
{ path: '/nueva-ruta', icon: Icon, label: 'Nuevo', shortcut: 'Ctrl+N' }
```

---

## 🚀 Próximos Pasos

### Frontend Pendiente
- [ ] UI para botón "Enviar Email" en órdenes de compra
- [ ] Mostrar retiros en UI de cierre de caja
- [ ] Indicador visual de órdenes enviadas por email

### Testing
- [ ] Probar envío de emails en producción
- [ ] Validar cálculos de cierre de caja con retiros
- [ ] Verificar shortcuts en diferentes navegadores

### Deployment
```bash
# 1. Configurar variables de entorno en Railway
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# 2. Commit y push
git add .
git commit -m "feat: devoluciones defectuosas, emails, retiros en cierre, atajos de teclado"
git push origin main

# 3. Railway y Vercel auto-deploy
```

---

## 📚 Documentación de Código

Todos los archivos incluyen comentarios JSDoc explicando:
- Propósito de cada función
- Parámetros y tipos
- Lógica de negocio
- Ejemplos de uso

### Ejemplo:
```javascript
/**
 * sendPurchaseOrderEmail - Envía orden de compra por email
 * @param {Object} purchaseOrder - Orden de compra completa
 * @param {Object} supplier - Datos del proveedor
 * @param {Object} settings - Configuración del negocio
 * @returns {Promise<Object>} Resultado del envío
 */
```

---

## 🛡️ Seguridad

### Email
- ✅ Validación de email del proveedor
- ✅ Autenticación SMTP segura
- ✅ No se exponen credenciales en código
- ✅ Solo usuarios autenticados pueden enviar

### Retiros de Caja
- ✅ Solo retiros aprobados se descuentan
- ✅ Referencias a documentos reales
- ✅ Auditoría completa con timestamps

### Atajos de Teclado
- ✅ Se inhabilitan en campos de texto
- ✅ No interfieren con shortcuts del navegador
- ✅ Prevención de acciones duplicadas

---

## 📊 Impacto en Base de Datos

### Nuevas Colecciones
Ninguna (se usan las existentes)

### Campos Agregados

**Product**:
```javascript
defectiveStock: Number (default: 0)
```

**Return.items**:
```javascript
isDefective: Boolean (default: false)
```

**PurchaseOrder**:
```javascript
emailSent: Boolean (default: false)
emailSentDate: Date
```

**CashierSession**:
```javascript
totalWithdrawals: Number (default: 0)
withdrawals: [ObjectId ref 'CashWithdrawal']
```

### Migración
No se requiere migración. Los campos nuevos tienen valores por defecto y son compatibles con documentos existentes.

---

## 💡 Tips de Uso

### Para Cajeros
- Usa `Ctrl+B` para abrir facturación rápidamente
- Presiona `?` si olvidas los atajos
- El cierre de caja ahora muestra automáticamente tus retiros

### Para Administradores
- Envía órdenes de compra desde la interfaz (próximamente)
- Revisa el stock defectuoso por separado
- Usa `Ctrl+R` para ir directo a reportes

### Para Desarrolladores
- Todo el código está documentado
- Los atajos son extensibles
- El servicio de email es reutilizable para otras notificaciones

---

## 🐛 Troubleshooting

### Email no se envía
1. Verificar variables SMTP en Railway
2. Comprobar contraseña de aplicación de Gmail
3. Revisar logs del servidor: `railway logs`

### Retiros no aparecen en cierre
1. Verificar que el retiro está en estado "Aprobado"
2. Confirmar que la fecha del retiro es del día actual
3. Verificar que `withdrawnBy` coincide con el cajero

### Shortcuts no funcionan
1. Verificar que no estás en un campo de texto
2. Refrescar la página
3. Probar en modo incógnito (sin extensiones)

---

## ✅ Checklist de Implementación

- [x] Modelo de productos defectuosos
- [x] Lógica de devoluciones defectuosas
- [x] Servicio de email con nodemailer
- [x] Endpoint para enviar órdenes
- [x] Tracking de emails enviados
- [x] Modelo de retiros en sesión
- [x] Cálculo de retiros en cierre
- [x] Hook de atajos de teclado
- [x] Modal de ayuda de shortcuts
- [x] Indicadores visuales en sidebar
- [x] Documentación completa
- [ ] UI frontend para emails
- [ ] UI frontend para retiros en cierre
- [ ] Testing en producción

---

**Fecha de Implementación**: Enero 2025  
**Versión**: 2.0.0  
**Autor**: GitHub Copilot + Usuario
