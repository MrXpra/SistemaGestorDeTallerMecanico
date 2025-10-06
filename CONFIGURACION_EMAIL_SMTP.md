# 📧 Guía Completa: Configuración de Email/SMTP

## 🎯 Resumen

El sistema ahora lee la configuración SMTP **directamente desde la base de datos** (colección `settings`) en lugar de usar variables de entorno. Esto significa que puedes configurar el email desde la interfaz web sin necesidad de acceder al servidor.

---

## ✅ Ventajas del Nuevo Sistema

1. **✨ Configuración desde la interfaz**: No necesitas editar archivos .env
2. **🔒 Usa el email de la empresa**: Los emails se envían desde la cuenta configurada en Settings
3. **🧪 Prueba en vivo**: Botón para probar la conexión SMTP antes de guardar
4. **🔄 Cambios instantáneos**: Sin necesidad de reiniciar el servidor
5. **📱 Multi-proveedor**: Soporta Gmail, Outlook, Yahoo, etc.

---

## 🚀 Paso 1: Configurar Gmail para Envío de Emails

### Opción A: Contraseña de Aplicación (Recomendado)

1. **Ir a tu cuenta de Gmail**
   - URL: https://myaccount.google.com

2. **Activar verificación en 2 pasos**
   - Seguridad → Verificación en 2 pasos → Activar

3. **Generar contraseña de aplicación**
   - Seguridad → Contraseñas de aplicaciones
   - Seleccionar: Correo → Windows Computer
   - Copiar la contraseña de 16 dígitos (ejemplo: `abcd efgh ijkl mnop`)

### Opción B: Permitir Aplicaciones Menos Seguras (No recomendado)

1. Ir a: https://myaccount.google.com/lesssecureapps
2. Activar "Permitir aplicaciones menos seguras"
3. Usar tu contraseña normal de Gmail

---

## 🔧 Paso 2: Configurar en la Interfaz Web

### 2.1 Acceder a Configuración

1. Iniciar sesión como **administrador**
2. Ir a: **Configuración** (sidebar) o presionar `Ctrl + ,`
3. Buscar la sección: **📧 Configuración de Email/SMTP**

### 2.2 Completar los Campos

#### Para Gmail:
```
Proveedor SMTP:     smtp.gmail.com
Puerto:             587
Usar SSL:           No (desactivado)
Usuario (Email):    tucorreo@gmail.com
Contraseña:         abcd efgh ijkl mnop (contraseña de app)
Nombre Remitente:   Nombre de tu Empresa
Email Remitente:    tucorreo@gmail.com
```

#### Para Outlook/Hotmail:
```
Proveedor SMTP:     smtp.office365.com
Puerto:             587
Usar SSL:           No
Usuario:            tucorreo@hotmail.com
Contraseña:         tu_contraseña
```

#### Para Yahoo:
```
Proveedor SMTP:     smtp.mail.yahoo.com
Puerto:             587
Usar SSL:           No
Usuario:            tucorreo@yahoo.com
Contraseña:         contraseña_de_app
```

### 2.3 Probar Conexión

1. Hacer clic en **"🧪 Probar Conexión"**
2. Esperar el resultado:
   - ✅ **Éxito**: Configuración válida, puedes guardar
   - ❌ **Error**: Revisar credenciales o configuración

### 2.4 Guardar Configuración

1. Hacer clic en **"💾 Guardar Configuración SMTP"**
2. Verás un mensaje de confirmación
3. La configuración se guarda en la base de datos MongoDB

---

## 📤 Paso 3: Enviar Órdenes de Compra por Email

Una vez configurado el SMTP:

1. **Ir a Órdenes de Compra**
2. **Crear una orden nueva** o seleccionar una existente
3. **Hacer clic en "📧 Enviar por Email"** (botón en la interfaz)
4. El sistema:
   - Lee la configuración SMTP de la BD
   - Verifica que el proveedor tenga email
   - Envía el email con plantilla HTML profesional
   - Marca la orden como "Email Enviado"

### Email que se envía:

- ✅ Header con logo y nombre de la empresa
- ✅ Datos del negocio (RNC, teléfono, email)
- ✅ Información del proveedor
- ✅ Tabla de productos con precios
- ✅ Total de la orden
- ✅ Notas adicionales
- ✅ Footer profesional

---

## 🔍 Paso 4: Verificar en Railway (Opcional)

Ya **NO necesitas** configurar variables SMTP en Railway porque el sistema lee de la base de datos. Sin embargo, puedes verificar:

1. **Ir a Railway Dashboard**: https://railway.app
2. **Seleccionar tu proyecto**
3. **Ir a Variables**
4. **Eliminar variables antiguas** (si las tenías):
   - ~~SMTP_HOST~~
   - ~~SMTP_PORT~~
   - ~~SMTP_USER~~
   - ~~SMTP_PASS~~

El sistema ya **NO usa** esas variables. Todo viene de MongoDB.

---

## 🛠️ Arquitectura Técnica

### Flujo de Envío de Email:

```
┌─────────────────────┐
│  Frontend (React)   │
│  Botón "Enviar"     │
└──────────┬──────────┘
           │ POST /api/purchase-orders/:id/send
           ▼
┌─────────────────────┐
│  Controller         │
│  sendPurchaseOrder  │
└──────────┬──────────┘
           │ Prepara datos
           ▼
┌─────────────────────┐
│  Email Service      │
│  emailService.js    │
└──────────┬──────────┘
           │ 1. Lee Settings de MongoDB
           │ 2. Crea transporter con SMTP
           │ 3. Genera HTML del email
           │ 4. Envía con nodemailer
           ▼
┌─────────────────────┐
│  MongoDB (Settings) │
│  smtp: { host, ... }│
└──────────┬──────────┘
           │ Configuración dinámica
           ▼
┌─────────────────────┐
│  Servidor SMTP      │
│  (Gmail, Outlook)   │
└─────────────────────┘
```

### Modelos Actualizados:

**Settings.js**:
```javascript
{
  businessName: "Mi Taller",
  businessEmail: "contacto@mitaller.com",
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "contacto@mitaller.com",
    password: "abcd efgh ijkl mnop", // select: false (no se retorna)
    fromName: "Mi Taller Mecánico",
    fromEmail: "contacto@mitaller.com"
  }
}
```

---

## 🐛 Troubleshooting

### Error: "Configuración SMTP no encontrada"

**Causa**: No has configurado el SMTP todavía.

**Solución**:
1. Ir a Configuración
2. Sección Email/SMTP
3. Completar todos los campos
4. Guardar

---

### Error: "Invalid login"

**Causa**: Credenciales incorrectas o no usas contraseña de aplicación.

**Solución**:
1. Verificar email y contraseña
2. Si usas Gmail, **DEBES** usar contraseña de aplicación
3. Verificar que la verificación en 2 pasos esté activa
4. Regenerar contraseña de aplicación

---

### Error: "Connection timeout"

**Causa**: Puerto o host incorrectos.

**Solución**:
- Gmail: `smtp.gmail.com:587` (SSL: No)
- Outlook: `smtp.office365.com:587` (SSL: No)
- Para puerto 465, activar SSL: Sí

---

### Error: "El proveedor no tiene email"

**Causa**: El proveedor seleccionado no tiene email configurado.

**Solución**:
1. Ir a Proveedores
2. Editar el proveedor
3. Agregar email válido
4. Guardar

---

### Email no llega al proveedor

**Pasos de diagnóstico**:

1. **Verificar en spam/correo no deseado**
   - El email puede estar en spam del proveedor

2. **Revisar logs del servidor**
   ```bash
   railway logs
   ```
   - Buscar errores de "sendPurchaseOrderEmail"

3. **Probar conexión SMTP**
   - Botón "Probar Conexión" en Configuración
   - Debe decir "✅ Conexión exitosa"

4. **Verificar email del proveedor**
   - Asegurarse que el email sea válido
   - Probar enviando a tu propio email primero

---

## 📊 Estados de Email en Órdenes

Cada orden de compra tiene campos de tracking:

```javascript
{
  orderNumber: "PO-000001",
  emailSent: true,              // ¿Se envió el email?
  emailSentDate: "2025-01-15",  // ¿Cuándo se envió?
  // ...
}
```

En la interfaz verás:
- 📧 **Enviado**: Email enviado exitosamente
- 📭 **No enviado**: Aún no se ha enviado

---

## 🎨 Personalización del Email

El email usa automáticamente:
- **Nombre del negocio**: `settings.businessName`
- **Logo**: `settings.businessLogoUrl`
- **RNC**: `settings.rnc` (si está configurado)
- **Teléfono**: `settings.businessPhone`
- **Email**: `settings.businessEmail`
- **Nombre del remitente**: `settings.smtp.fromName`

Todos estos se configuran en: **Configuración > Negocio**

---

## 🔐 Seguridad

### Contraseña SMTP:
- ✅ Campo `select: false` en Mongoose (no se retorna en queries)
- ✅ Se oculta en respuestas GET de /api/settings
- ✅ Solo se actualiza si se proporciona (no se borra por accidente)
- ✅ No se muestra en frontend
- ✅ Solo admin puede actualizar

### Buenas Prácticas:
1. Usar **contraseñas de aplicación**, no contraseñas de cuenta
2. Activar **verificación en 2 pasos**
3. No compartir credenciales SMTP
4. Rotar contraseñas periódicamente
5. Monitorear logs de envío

---

## 📝 API Endpoints

### 1. Obtener Configuración
```http
GET /api/settings
Authorization: Bearer <token>

Response:
{
  businessName: "Mi Taller",
  smtp: {
    host: "smtp.gmail.com",
    port: 587,
    user: "contacto@mitaller.com",
    password: "", // Oculto
    // ...
  }
}
```

### 2. Actualizar SMTP
```http
PUT /api/settings/smtp
Authorization: Bearer <token>
Content-Type: application/json

{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "user": "contacto@mitaller.com",
  "password": "abcd efgh ijkl mnop",
  "fromName": "Mi Taller",
  "fromEmail": "contacto@mitaller.com"
}

Response:
{
  "success": true,
  "message": "Configuración SMTP actualizada correctamente",
  "data": { ... }
}
```

### 3. Probar Conexión SMTP
```http
POST /api/settings/smtp/test
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "✅ Configuración SMTP válida. Conexión exitosa."
}
```

### 4. Enviar Orden por Email
```http
POST /api/purchase-orders/:id/send
Authorization: Bearer <token>

Response:
{
  "message": "Orden enviada exitosamente a proveedor@email.com",
  "order": { ... }
}
```

---

## ✅ Checklist de Configuración

- [ ] Crear contraseña de aplicación en Gmail
- [ ] Iniciar sesión como admin en la app
- [ ] Ir a Configuración
- [ ] Completar datos del negocio (nombre, email, teléfono)
- [ ] Completar sección SMTP:
  - [ ] Host (smtp.gmail.com)
  - [ ] Puerto (587)
  - [ ] Usuario (email)
  - [ ] Contraseña (contraseña de app)
  - [ ] Nombre remitente
- [ ] Hacer clic en "Probar Conexión"
- [ ] Verificar mensaje de éxito ✅
- [ ] Guardar configuración
- [ ] Verificar que proveedores tengan email
- [ ] Crear orden de compra de prueba
- [ ] Enviar email de prueba
- [ ] Verificar que llegue al proveedor

---

## 🎓 Preguntas Frecuentes

### ¿Puedo usar mi email personal?
Sí, pero es recomendable usar un email profesional del negocio para dar mejor imagen.

### ¿Cuánto cuesta enviar emails?
Gmail permite **500 emails por día gratis**. Para más, necesitas Google Workspace ($6/mes).

### ¿Puedo usar otro proveedor que no sea Gmail?
Sí, el sistema soporta cualquier servidor SMTP. Solo cambia el host y puerto.

### ¿Los emails se guardan?
No, los emails se envían directamente al proveedor. No se almacenan en la base de datos.

### ¿Puedo enviar emails a múltiples proveedores a la vez?
Actualmente no, pero se puede agregar esta funcionalidad en el futuro.

### ¿Qué pasa si cambio la configuración SMTP?
Los cambios se aplican inmediatamente. Los emails futuros usarán la nueva configuración.

---

## 🚀 Próximas Mejoras

Ideas para futuras versiones:
- [ ] Email con adjunto PDF de la orden
- [ ] Templates personalizables de email
- [ ] Envío masivo de órdenes
- [ ] Historial de emails enviados
- [ ] Reenvío automático si falla
- [ ] Emails a clientes (facturas, recibos)
- [ ] Notificaciones por email (stock bajo, etc.)

---

## 📚 Recursos Adicionales

- **Nodemailer**: https://nodemailer.com/
- **Gmail App Passwords**: https://support.google.com/accounts/answer/185833
- **SMTP Codes**: https://www.mailersend.com/blog/smtp-codes

---

**Fecha**: Octubre 2025  
**Versión**: 2.1.0  
**Autor**: Sistema AutoParts Manager
