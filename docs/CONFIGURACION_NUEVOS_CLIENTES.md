# 🏢 Guía de Configuración para Nuevos Clientes

## 📋 Objetivo

Esta guía te ayudará a configurar la aplicación AutoParts Manager para un **nuevo cliente** con una base de datos limpia y lista para usar.

---

## 🎯 Casos de Uso

Usa este proceso cuando:
- ✅ Vas a vender el sistema a un nuevo cliente
- ✅ Necesitas una instalación limpia sin datos de prueba
- ✅ Quieres resetear completamente el sistema
- ✅ Estás migrando a una nueva base de datos

---

## 📦 Lo Que Se Incluye

El script de inicialización crea:

1. **✅ Usuario Administrador**
   - Email personalizado del cliente
   - Contraseña segura elegida por ellos
   - Rol de administrador completo

2. **✅ Configuración del Negocio**
   - Nombre del negocio
   - Datos de contacto
   - Configuración regional (moneda, impuestos, zona horaria)

3. **✅ Colecciones de Base de Datos**
   - Todas las colecciones necesarias (vacías)
   - Índices optimizados para rendimiento
   - Estructura lista para usar

4. **✅ Sin Datos de Prueba**
   - Sin productos de ejemplo
   - Sin clientes ficticios
   - Sin ventas de prueba
   - Base de datos completamente limpia

---

## 🚀 Proceso de Configuración

### Paso 1: Preparar Nueva Base de Datos MongoDB

#### Opción A: Nuevo Cluster en MongoDB Atlas (RECOMENDADO)

1. **Ir a MongoDB Atlas**: https://cloud.mongodb.com

2. **Crear Nuevo Cluster**:
   ```
   • Name: autoparts-cliente-[nombre]
   • Tier: M0 Free (512MB)
   • Region: Elegir más cercana al cliente
   ```

3. **Configurar Acceso**:
   ```
   Security → Database Access:
   • Username: autoparts_user
   • Password: [generar password seguro]
   • Role: Atlas admin o readWriteAnyDatabase
   
   Security → Network Access:
   • Agregar: 0.0.0.0/0 (permite acceso desde cualquier IP)
   • O específica: IP del servidor de deployment
   ```

4. **Obtener Connection String**:
   ```
   Databases → Connect → Connect your application
   
   Formato:
   mongodb+srv://autoparts_user:PASSWORD@cluster.mongodb.net/autoparts_db
   ```

#### Opción B: Usar Cluster Existente con Nueva Base de Datos

Si ya tienes un cluster, simplemente cambia el nombre de la base de datos en el connection string:

```
mongodb+srv://user:pass@cluster.mongodb.net/autoparts_cliente1
mongodb+srv://user:pass@cluster.mongodb.net/autoparts_cliente2
mongodb+srv://user:pass@cluster.mongodb.net/autoparts_cliente3
```

---

### Paso 2: Configurar Variables de Entorno

1. **Crear archivo `.env` para el nuevo cliente**:

```bash
# .env.cliente-nuevo
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/autoparts_cliente_nuevo
JWT_SECRET=clave_super_secreta_unica_para_este_cliente_min_32_caracteres_12345
NODE_ENV=production
PORT=5000

# Configuración de Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=autoparts@tudominio.com
```

2. **Reemplazar el `.env` actual** (o usar variables de entorno en Railway/Vercel):

```bash
# Backup del .env actual
cp .env .env.backup

# Copiar configuración del nuevo cliente
cp .env.cliente-nuevo .env
```

---

### Paso 3: Ejecutar Script de Inicialización

```bash
npm run setup-client
```

#### ¿Qué Hace el Script?

```
╔════════════════════════════════════════════════════════╗
║        PROCESO DE INICIALIZACIÓN                       ║
╚════════════════════════════════════════════════════════╝

1. 📡 Conecta a la base de datos MongoDB
2. 🧹 Limpia TODOS los datos existentes (si los hay)
3. 👤 Te pregunta datos del administrador:
   • Nombre completo
   • Email
   • Contraseña (mínimo 6 caracteres)
4. 🏢 Te pregunta datos del negocio:
   • Nombre del negocio
   • Teléfono, dirección, email
5. 🌍 Te pregunta configuración regional:
   • Moneda (USD, MXN, EUR, etc.)
   • Tasa de impuesto (%)
   • Zona horaria
6. ✅ Crea usuario administrador
7. ⚙️ Configura ajustes del sistema
8. 📦 Crea todas las colecciones vacías
9. 🎉 ¡Listo para usar!
```

#### Ejemplo de Ejecución:

```bash
$ npm run setup-client

╔════════════════════════════════════════════════════════╗
║  🚀 CONFIGURACIÓN DE NUEVO CLIENTE - AutoParts Manager ║
╚════════════════════════════════════════════════════════╝

📡 Conectando a MongoDB...
✅ Conectado a: cluster0.mongodb.net

⚠️  ADVERTENCIA: Este proceso eliminará TODOS los datos existentes.
    Solo continúa si estás configurando un nuevo cliente.

¿Deseas continuar? (escribe "SI" para confirmar): SI

═══════════════════════════════════════════════════════
  PASO 1: LIMPIANDO BASE DE DATOS
═══════════════════════════════════════════════════════

  🗑️  users                - 5 documentos eliminados
  🗑️  products             - 25 documentos eliminados
  🗑️  sales                - 10 documentos eliminados
  ...

✅ Total eliminados: 40 documentos

═══════════════════════════════════════════════════════
  PASO 2: DATOS DEL NUEVO CLIENTE
═══════════════════════════════════════════════════════

📋 USUARIO ADMINISTRADOR:

  Nombre completo del administrador: Juan Pérez
  Email del administrador: juan@repuestosabc.com
  Contraseña (min 6 caracteres): admin123456

📋 DATOS DEL NEGOCIO:

  Nombre del negocio: Repuestos ABC
  Teléfono del negocio (opcional): +52 123 456 7890
  Dirección del negocio (opcional): Av. Principal 123
  Email del negocio (opcional): contacto@repuestosabc.com

📋 CONFIGURACIÓN REGIONAL:

  Moneda (ej: USD, MXN, EUR) [USD]: MXN
  Tasa de impuesto en % (ej: 16) [16]: 16
  Zona horaria (ej: America/Mexico_City) [America/New_York]: America/Mexico_City

═══════════════════════════════════════════════════════
  PASO 3: CREANDO USUARIO ADMINISTRADOR
═══════════════════════════════════════════════════════

✅ Usuario administrador creado exitosamente
   ID: 67040b8e1234567890abcdef
   Nombre: Juan Pérez
   Email: juan@repuestosabc.com
   Rol: admin

═══════════════════════════════════════════════════════
  PASO 4: CONFIGURANDO SISTEMA
═══════════════════════════════════════════════════════

✅ Configuración del sistema creada
   Negocio: Repuestos ABC
   Moneda: MXN
   Tasa de impuesto: 16%
   Zona horaria: America/Mexico_City

═══════════════════════════════════════════════════════
  PASO 5: INICIALIZANDO COLECCIONES
═══════════════════════════════════════════════════════

  ✅ Products              - Colección creada e indexada
  ✅ Customers             - Colección creada e indexada
  ✅ Suppliers             - Colección creada e indexada
  ✅ Sales                 - Colección creada e indexada
  ...

═══════════════════════════════════════════════════════
  🎉 CONFIGURACIÓN COMPLETADA EXITOSAMENTE
═══════════════════════════════════════════════════════

📊 RESUMEN DE LA CONFIGURACIÓN:

  Base de Datos:
    • Colecciones creadas: 12
    • Índices configurados: ✅

  Usuario Administrador:
    • Email: juan@repuestosabc.com
    • Contraseña: [configurada]
    • Rol: admin

  Negocio:
    • Nombre: Repuestos ABC
    • Moneda: MXN
    • Impuesto: 16%

═══════════════════════════════════════════════════════

📝 PRÓXIMOS PASOS:

  1. Inicia el servidor: npm run dev
  2. Accede con las credenciales del administrador
  3. Configura los datos del negocio desde el panel
  4. Agrega productos, clientes y proveedores

🚀 El sistema está listo para usar!
```

---

### Paso 4: Verificar Instalación

1. **Iniciar el servidor**:
```bash
npm run dev
```

2. **Acceder al sistema**:
```
http://localhost:3000
```

3. **Login con credenciales del administrador**:
```
Email: [el que configuraste]
Contraseña: [la que configuraste]
```

4. **Verificar**:
   - ✅ Dashboard vacío (sin ventas)
   - ✅ Inventario vacío (sin productos)
   - ✅ Sin clientes ni proveedores
   - ✅ Configuración del negocio correcta

---

## 📋 Checklist de Entrega al Cliente

Antes de entregar el sistema al cliente, asegúrate de:

- [ ] Base de datos MongoDB creada y configurada
- [ ] Script de inicialización ejecutado exitosamente
- [ ] Usuario administrador creado con credenciales del cliente
- [ ] Configuración del negocio completa
- [ ] Servidor desplegado en Railway/Vercel (si aplica)
- [ ] Frontend desplegado en Vercel (si aplica)
- [ ] Variables de entorno configuradas en producción
- [ ] SSL/HTTPS funcionando correctamente
- [ ] Backup automático configurado en MongoDB Atlas
- [ ] Documentación de usuario entregada
- [ ] Capacitación básica al cliente realizada

---

## 🔄 Gestión de Múltiples Clientes

### Estructura Recomendada

Si vas a tener múltiples clientes, mantén un registro organizado:

```
📁 Clientes/
├── 📁 Cliente1-RepuestosABC/
│   ├── .env.cliente1
│   ├── credenciales.txt
│   └── notas.md
│
├── 📁 Cliente2-TallerXYZ/
│   ├── .env.cliente2
│   ├── credenciales.txt
│   └── notas.md
│
└── 📁 Cliente3-AutopartesLMN/
    ├── .env.cliente3
    ├── credenciales.txt
    └── notas.md
```

### Archivo de Credenciales (Ejemplo)

**`credenciales.txt`:**
```
CLIENTE: Repuestos ABC
FECHA CONFIGURACIÓN: 2025-10-07
MONGODB CLUSTER: cluster-repuestosabc

ADMIN:
  Nombre: Juan Pérez
  Email: juan@repuestosabc.com
  Contraseña: [guardada en gestor de contraseñas]

MONGODB:
  Connection String: mongodb+srv://...
  Usuario DB: autoparts_user
  Password DB: [guardada en gestor de contraseñas]

DEPLOYMENT:
  Frontend: https://repuestosabc.vercel.app
  Backend: https://api-repuestosabc.railway.app
  
NOTAS:
  - Configurado con MXN como moneda
  - Impuesto del 16%
  - Zona horaria: America/Mexico_City
```

---

## 🔐 Seguridad y Mejores Prácticas

### ✅ Hacer Siempre:

1. **Usar contraseñas únicas y seguras** para cada cliente
2. **JWT_SECRET diferente** para cada instalación
3. **Backup antes de limpiar** datos existentes
4. **Documentar** las credenciales de forma segura
5. **Configurar límite de IP** en MongoDB Atlas si es posible
6. **Activar autenticación de 2 factores** en MongoDB Atlas

### ❌ Nunca Hacer:

1. **NO reutilices** la misma base de datos para múltiples clientes
2. **NO compartas** JWT_SECRET entre clientes
3. **NO uses** contraseñas débiles o predecibles
4. **NO dejes** acceso 0.0.0.0/0 sin necesidad
5. **NO olvides** hacer backup antes de resetear

---

## 💰 Costos por Cliente

### MongoDB Atlas (Base de Datos)

| Plan | Almacenamiento | Costo |
|------|---------------|-------|
| **M0 (Free)** | 512 MB | **$0/mes** |
| M10 | 10 GB | $0.08/hora (~$57/mes) |
| M20 | 20 GB | $0.20/hora (~$146/mes) |

**Recomendación:** Comenzar con M0 Free, escalar según necesidad del cliente.

### Railway (Backend)

| Plan | Recursos | Costo |
|------|----------|-------|
| **Hobby** | 512MB RAM, 0.5 CPU | **$5/mes** (con $5 crédito inicial) |
| Pro | 8GB RAM, 8 CPU | $20/mes |

### Vercel (Frontend)

| Plan | Proyectos | Costo |
|------|-----------|-------|
| **Hobby** | Ilimitados | **$0/mes** |
| Pro | + features | $20/mes |

### Total Estimado por Cliente

- **Mínimo:** $0/mes (MongoDB Free + Vercel Free + Railway $5 crédito)
- **Promedio:** $5-10/mes (cuando se acaba crédito de Railway)
- **Escalado:** $60-150/mes (si el cliente crece mucho)

---

## 🆘 Troubleshooting

### Problema: "Error connecting to MongoDB"

**Solución:**
```bash
1. Verifica que MONGO_URI en .env sea correcto
2. Verifica que el usuario de BD tenga permisos
3. Verifica IP Whitelist en MongoDB Atlas
4. Verifica que el cluster esté activo
```

### Problema: "Usuario administrador ya existe"

**Solución:**
```bash
# El script limpia la BD automáticamente, pero si falla:
1. Ve a MongoDB Atlas → Collections
2. Elimina manualmente la colección "users"
3. Vuelve a ejecutar: npm run setup-client
```

### Problema: Script se congela al preguntar datos

**Solución:**
```bash
# Asegúrate de que Node.js puede leer stdin
1. Cierra y reabre la terminal
2. Ejecuta directamente: node scripts/setupNewClient.js
3. Si persiste, verifica permisos de la terminal
```

---

## 📞 Soporte

Si tienes problemas durante la configuración:

1. Revisa esta documentación
2. Verifica los logs de error en la consola
3. Consulta la documentación de MongoDB Atlas
4. Revisa el archivo `.env` y credenciales

---

**Última actualización:** 2025-10-07  
**Versión del documento:** 1.0.0
