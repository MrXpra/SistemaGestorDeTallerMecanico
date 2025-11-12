# 🚂 Variables de Entorno para Railway

**Configurar en:** Railway Dashboard → Tu Proyecto → Variables → Raw Editor

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/sgtm?retryWrites=true&w=majority
JWT_SECRET=cambia-esto-por-algo-super-secreto-y-largo-minimo-32-caracteres-aleatorios
CLIENT_URL=https://tu-frontend.vercel.app
PORT=5000
```

---

## 📝 Instrucciones

### 1. MONGODB_URI
**Obtener de MongoDB Atlas:**
1. Ir a [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Crear cluster M0 (gratuito)
3. Database Access → Add User
4. Network Access → Add IP: `0.0.0.0/0`
5. Connect → Drivers → Copy connection string
6. Reemplazar `<password>` con tu contraseña real

**Ejemplo:**
```
mongodb+srv://sgtm-admin:MiPassword123@cluster0.abc123.mongodb.net/sgtm?retryWrites=true&w=majority
```

---

### 2. JWT_SECRET
**Generar secreto único:**

**Opción A - Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opción B - PowerShell:**
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Ejemplo resultado:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

⚠️ **Importante:** Debe tener mínimo 32 caracteres y ser único por proyecto.

---

### 3. CLIENT_URL
**Después de desplegar frontend en Vercel:**

1. Desplegar frontend en Vercel
2. Copiar URL generada (ej: `https://sgtm-cliente1.vercel.app`)
3. Pegar en `CLIENT_URL`
4. Railway redesplegará automáticamente

**Durante desarrollo inicial, puedes usar:**
```
CLIENT_URL=http://localhost:5173
```

---

### 4. PORT
Railway asigna el puerto automáticamente vía variable `PORT`.

Ya está configurado en `server.js`:
```javascript
const PORT = process.env.PORT || 5000;
```

---

## 🔄 Cómo Actualizar Variables

### Método 1: Panel Web
1. Railway Dashboard
2. Tu proyecto
3. Variables tab
4. Edit o Add variables
5. Save (redeploy automático)

### Método 2: Railway CLI
```bash
railway variables set VARIABLE_NAME="valor"
```

---

## ✅ Verificar Configuración

Después de configurar variables, verifica que el backend funcione:

```bash
curl https://tu-backend.railway.app/api/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-12T..."
}
```

---

## 🐛 Problemas Comunes

### Error: "Cannot connect to MongoDB"
**Solución:**
- Verificar [`MONGODB_URI`](/c:/Users/Edgar%20Padilla/AppData/Local/Microsoft/TypeScript/5.9/node_modules/@types/node/globals.d.ts ) (sin espacios)
- Verificar contraseña (caracteres especiales deben estar URL-encoded)
- Verificar whitelist IP en Atlas

### Error: "Invalid JWT"
**Solución:**
- Verificar que `JWT_SECRET` tenga mínimo 32 caracteres
- No incluir comillas en el valor

### Error: CORS
**Solución:**
- Verificar `CLIENT_URL` coincida con URL de Vercel
- No incluir `/` al final

---

## 📚 Documentación Completa

Ver [docs/DEPLOY-RAILWAY.md](../docs/DEPLOY-RAILWAY.md) para instrucciones paso a paso.
