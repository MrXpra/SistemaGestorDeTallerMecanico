# 🚂 Guía de Deploy en Railway

Esta guía te ayudará a desplegar el Sistema Gestor de Taller Mecánico en Railway.

---

## 📋 Requisitos Previos

1. **Cuenta en Railway:** [railway.app](https://railway.app) (gratis con GitHub)
2. **Cuenta en MongoDB Atlas:** [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas) (tier gratuito)
3. **Cuenta en Vercel (opcional):** [vercel.com](https://vercel.com) (para el frontend)
4. **Repositorio en GitHub:** Tu código debe estar en GitHub

---

## 🗄️ Paso 1: Configurar MongoDB Atlas

### 1.1 Crear Cluster

1. Ir a [MongoDB Atlas](https://mongodb.com/cloud/atlas)
2. **Create a Deployment** → **M0 Free** (512 MB)
3. **Provider:** AWS, GCP o Azure (el que prefieras)
4. **Region:** Selecciona la más cercana a tu ubicación
5. **Cluster Name:** `sgtm-cluster` (o el que prefieras)
6. **Create Deployment**

### 1.2 Configurar Acceso

**Database Access:**
1. **Database Access** → **Add New Database User**
2. **Authentication:** Password
3. **Username:** `sgtm-admin` (o el que prefieras)
4. **Password:** Genera una contraseña segura (guárdala)
5. **Database User Privileges:** Read and write to any database
6. **Add User**

**Network Access:**
1. **Network Access** → **Add IP Address**
2. **Access List Entry:** `0.0.0.0/0` (permitir desde cualquier IP)
3. **Comment:** "Railway deployment"
4. **Confirm**

⚠️ **Nota:** En producción, es mejor especificar las IPs de Railway, pero `0.0.0.0/0` funciona para empezar.

### 1.3 Obtener Connection String

1. **Database** → **Connect** → **Drivers**
2. **Driver:** Node.js
3. **Version:** 5.5 or later
4. **Copy** el connection string
5. Reemplaza `<password>` con tu contraseña real

**Ejemplo:**
```
mongodb+srv://sgtm-admin:TuPassword123@sgtm-cluster.abc123.mongodb.net/?retryWrites=true&w=majority&appName=sgtm-cluster
```

---

## 🚂 Paso 2: Desplegar Backend en Railway

### 2.1 Crear Proyecto en Railway

1. Ir a [railway.app](https://railway.app)
2. **Login** con GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Seleccionar repositorio: `SistemaGestorDeTallerMecanico`
5. Railway detectará automáticamente que es un proyecto Node.js

### 2.2 Configurar Variables de Entorno

En el dashboard de Railway, ve a tu proyecto → **Variables** → **Raw Editor** y pega:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://sgtm-admin:TuPassword123@sgtm-cluster.abc123.mongodb.net/?retryWrites=true&w=majority&appName=sgtm-cluster
JWT_SECRET=cambia-esto-por-algo-super-secreto-y-largo-min-32-caracteres
CLIENT_URL=https://tu-frontend.vercel.app
PORT=5000
```

**⚠️ IMPORTANTE:**
- Reemplaza `MONGODB_URI` con tu connection string real
- Genera un `JWT_SECRET` único y seguro (mínimo 32 caracteres aleatorios)
- `CLIENT_URL` lo configurarás después de desplegar el frontend

**Generar JWT_SECRET seguro:**
```bash
# Opción 1: En Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opción 2: En PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

### 2.3 Deploy

1. Railway comenzará a construir automáticamente
2. Espera 2-3 minutos
3. Una vez completado, verás **Deployment successful**
4. Copia la URL generada (ej: `https://sgtm-backend-production.up.railway.app`)

### 2.4 Verificar

Abre en tu navegador:
```
https://tu-backend.up.railway.app/api/health
```

Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "2025-11-12T..."
}
```

---

## 🎨 Paso 3: Desplegar Frontend en Vercel

### 3.1 Preparar Frontend

Asegúrate de que `client/.env.production` tenga:

```env
VITE_API_URL=https://tu-backend.up.railway.app/api
```

### 3.2 Deploy en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. **Add New** → **Project**
3. **Import Git Repository** → Selecciona tu repo
4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Environment Variables:**
   ```
   VITE_API_URL=https://tu-backend.up.railway.app/api
   ```

6. **Deploy**

### 3.3 Actualizar Railway

1. Regresa a Railway
2. **Variables** → Editar `CLIENT_URL`
3. Poner la URL de Vercel: `https://tu-app.vercel.app`
4. Railway redesplegará automáticamente

---

## 👤 Paso 4: Crear Usuario Administrador

### Opción A: Usar MongoDB Compass (Recomendada)

1. Descargar [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Conectar usando tu connection string
3. Navegar a la base de datos → colección `users`
4. **Insert Document:**

```json
{
  "username": "admin",
  "password": "$2a$10$YourBcryptHashHere",
  "email": "admin@sgtm.com",
  "fullName": "Administrador",
  "role": "admin",
  "isActive": true,
  "createdAt": { "$date": "2025-11-12T00:00:00.000Z" },
  "updatedAt": { "$date": "2025-11-12T00:00:00.000Z" }
}
```

**Para generar el hash de contraseña:**

```javascript
// En Node.js REPL o script temporal
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```

### Opción B: Endpoint Temporal (Eliminar después)

1. Agregar temporalmente en `server.js`:

```javascript
// ⚠️ TEMPORAL - ELIMINAR DESPUÉS DEL PRIMER USO
app.post('/api/setup-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin ya existe' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@sgtm.com',
      role: 'admin',
      fullName: 'Administrador',
      isActive: true
    });

    res.json({ message: 'Admin creado exitosamente', username: 'admin' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. Commit y push (Railway redesplegará)
3. Hacer POST a: `https://tu-backend.up.railway.app/api/setup-admin`
4. Eliminar el endpoint y volver a desplegar

### Opción C: Railway CLI

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar script
railway run node scripts/createAdmin.js
```

---

## ✅ Paso 5: Verificación Final

### 5.1 Checklist

- [ ] Backend desplegado en Railway
- [ ] Frontend desplegado en Vercel
- [ ] MongoDB Atlas configurado
- [ ] Variables de entorno correctas
- [ ] CORS configurado
- [ ] Usuario admin creado
- [ ] Puedes hacer login

### 5.2 Probar el Sistema

1. Abre `https://tu-app.vercel.app`
2. Login con: `admin` / `admin123`
3. Navega por el sistema
4. Crea productos, clientes, ventas, etc.

---

## 🔧 Comandos Útiles

### Ver Logs en Railway

```bash
# Opción 1: Dashboard web
railway.app → tu proyecto → Deployments → View Logs

# Opción 2: CLI
railway logs
```

### Redeploy Manual

```bash
# En Railway Dashboard
Deployments → Latest → Redeploy
```

### Variables de Entorno

```bash
railway variables
railway variables set KEY=value
```

---

## 🐛 Troubleshooting

### Error: "Application failed to start"

**Solución:**
1. Ver logs en Railway
2. Verificar que `package.json` tenga `"start": "node server.js"`
3. Verificar que todas las dependencias estén en `package.json`

### Error: "Cannot connect to MongoDB"

**Solución:**
1. Verificar `MONGODB_URI` en Railway variables
2. Verificar whitelist IP en MongoDB Atlas (`0.0.0.0/0`)
3. Verificar que el usuario de BD tenga permisos correctos

### Error: CORS

**Solución:**
1. Verificar `CLIENT_URL` en Railway
2. Verificar `VITE_API_URL` en Vercel
3. Ver logs del backend para mensajes de CORS

### Frontend no se conecta al Backend

**Solución:**
1. Abrir DevTools (F12) → Network
2. Verificar que las peticiones vayan a la URL correcta
3. Verificar `VITE_API_URL` en variables de Vercel
4. Hacer rebuild del frontend en Vercel

---

## 💰 Costos

| Servicio | Plan | Costo/mes |
|----------|------|-----------|
| **Railway** | Hobby | $5 (incluye $5 crédito)* |
| **Vercel** | Hobby | $0 |
| **MongoDB Atlas** | M0 Free | $0 |
| **TOTAL** | | **~$0-5/mes** |

\* Railway da $5 de crédito mensual. Si tu uso es menor, es gratis.

---

## 🔒 Seguridad en Producción

### Recomendaciones

1. **Cambiar contraseña de admin** inmediatamente
2. **JWT_SECRET único** por proyecto
3. **Whitelist IPs** en MongoDB Atlas (no usar `0.0.0.0/0`)
4. **Backups** habilitados en Atlas
5. **Monitoreo** configurado en Railway
6. **Rate limiting** habilitado
7. **Variables de entorno** nunca en el código

### Backups Automáticos (MongoDB Atlas)

1. **Clusters** → tu cluster → **Backup**
2. Configurar frecuencia (diario recomendado)
3. Retención: 7-30 días

---

## 🚀 Mejoras Opcionales

### Dominio Personalizado

**Railway:**
1. Settings → Networking → Custom Domain
2. Agregar tu dominio
3. Configurar DNS según instrucciones

**Vercel:**
1. Project Settings → Domains
2. Add Domain
3. Configurar DNS

### Monitoreo

**Railway:**
- Dashboard incluye métricas de CPU, RAM, Network

**Externo:**
- [UptimeRobot](https://uptimerobot.com) (gratis)
- [BetterStack](https://betterstack.com) (monitoring avanzado)

### CI/CD Mejorado

Railway y Vercel ya tienen CI/CD automático con GitHub. Cada push a `main` despliega automáticamente.

---

## 📞 Soporte

**Documentación:**
- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- MongoDB Atlas: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)

**Issues del Proyecto:**
- GitHub: [github.com/MrXpra/SistemaGestorDeTallerMecanico/issues](https://github.com/MrXpra/SistemaGestorDeTallerMecanico/issues)

---

## 📄 Archivo de Variables de Entorno

### Railway (Backend)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=super-secret-key-min-32-chars
CLIENT_URL=https://tu-frontend.vercel.app
PORT=5000
```

### Vercel (Frontend)
```env
VITE_API_URL=https://tu-backend.up.railway.app/api
```

---

**✅ ¡Listo! Tu sistema está desplegado en producción.**

Si tienes algún problema, revisa la sección de Troubleshooting o abre un issue en GitHub.
