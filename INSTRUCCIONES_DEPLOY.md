# 🚀 Instrucciones Manuales de Deploy - AutoParts Manager

## ✅ Estado Actual del Código

He preparado tu código para producción con los siguientes cambios:

### Archivos Modificados:
- ✅ `server.js` - CORS configurado para producción
- ✅ `client/src/services/api.js` - API URL dinámica
- ✅ `.gitignore` - Mejorado para producción

### Archivos Creados:
- ✅ `client/vercel.json` - Configuración de Vercel
- ✅ `railway.toml` - Configuración de Railway
- ✅ `.env.production.example` - Template de variables de entorno
- ✅ `client/.env.example` - Variables de entorno del frontend
- ✅ `DEPLOYMENT.md` - Guía completa de deploy

---

## 📝 PASOS MANUALES A SEGUIR

### PASO 1: Instalar Git (REQUERIDO)

1. Descargar Git desde: https://git-scm.com/download/win
2. Ejecutar el instalador
3. Durante la instalación:
   - ✅ Marcar "Git from the command line and also from 3rd-party software"
   - ✅ Usar el editor predeterminado
   - ✅ Dejar todas las demás opciones por defecto
4. **Reiniciar VS Code** después de instalar
5. Verificar instalación en nueva terminal:
   ```powershell
   git --version
   ```

---

### PASO 2: Configurar Git (Primera Vez)

Abrir PowerShell y ejecutar:

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@ejemplo.com"
```

---

### PASO 3: Crear Repositorio en GitHub

1. Ir a https://github.com
2. Si no tienes cuenta, crear una (gratis)
3. Click en el botón **"+"** → **"New repository"**
4. Configurar:
   - **Repository name**: `autoparts-manager` (o el nombre que prefieras)
   - **Description**: "Sistema POS para tiendas de repuestos automotrices"
   - **Visibility**: Public o Private (recomiendo Private para empezar)
   - ❌ **NO marcar** "Initialize this repository with a README"
   - ❌ **NO agregar** .gitignore ni license (ya los tenemos)
5. Click **"Create repository"**
6. **COPIAR** la URL que aparece (ejemplo: `https://github.com/tu-usuario/autoparts-manager.git`)

---

### PASO 4: Subir Código a GitHub

En VS Code, abrir **PowerShell** en la carpeta del proyecto y ejecutar:

```powershell
# 1. Inicializar repositorio Git
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer el primer commit
git commit -m "Initial commit - AutoParts Manager ready for production"

# 4. Renombrar rama a main
git branch -M main

# 5. Conectar con GitHub (REEMPLAZAR con tu URL)
git remote add origin https://github.com/TU-USUARIO/autoparts-manager.git

# 6. Subir código
git push -u origin main
```

**Posibles Problemas:**
- Si pide usuario/contraseña de GitHub:
  - Usar tu email de GitHub como usuario
  - Para la contraseña, necesitas un **Personal Access Token**
  - Ir a: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
  - Seleccionar scope: **repo** (todos los permisos de repositorio)
  - Copiar el token y usarlo como contraseña

---

### PASO 5: Configurar MongoDB Atlas

1. Ir a https://www.mongodb.com/cloud/atlas
2. Crear cuenta gratuita (si no tienes)
3. Crear un nuevo Cluster (Free Tier M0 - 512MB gratis)
4. Una vez creado:

   **A) Network Access:**
   - Click en "Network Access" en el menú lateral
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Confirm

   **B) Database Access:**
   - Click en "Database Access"
   - Click "Add New Database User"
   - Authentication Method: Password
   - Username: `autopartsuser` (o el que prefieras)
   - Password: Generar una contraseña segura y **COPIARLA**
   - Database User Privileges: "Read and write to any database"
   - Add User

   **C) Obtener Connection String:**
   - Click en "Database" (o "Clusters")
   - Click en "Connect" en tu cluster
   - Click "Connect your application"
   - Driver: Node.js, Version: 5.5 or later
   - **COPIAR** la connection string
   - Ejemplo: `mongodb+srv://autopartsuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **REEMPLAZAR** `<password>` con tu password real

5. **GUARDAR** esta connection string para el siguiente paso

---

### PASO 6: Deploy Backend en Railway

1. Ir a https://railway.app
2. Crear cuenta con GitHub (Sign up with GitHub)
3. Autorizar Railway a acceder a tu GitHub
4. Click **"New Project"**
5. Seleccionar **"Deploy from GitHub repo"**
6. Seleccionar tu repositorio `autoparts-manager`
7. Railway detectará automáticamente Node.js

   **Configurar Variables de Entorno:**
   - Click en tu proyecto
   - Click en pestaña **"Variables"**
   - Agregar las siguientes variables (click "+ New Variable" para cada una):

   ```
   NODE_ENV = production
   PORT = 5000
   MONGO_URI = mongodb+srv://autopartsuser:TU_PASSWORD@cluster0.xxxxx.mongodb.net/TiendaRepuestos?retryWrites=true&w=majority
   JWT_SECRET = generar_un_string_aleatorio_de_al_menos_32_caracteres_aqui
   JWT_EXPIRE = 7d
   FRONTEND_URL = https://autoparts-manager.vercel.app
   ```

   **Para generar JWT_SECRET seguro:**
   En PowerShell:
   ```powershell
   -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
   ```

8. Click **"Deploy"** (arriba a la derecha)
9. Esperar a que termine el deploy (1-3 minutos)
10. Una vez terminado, click en **"Settings"** → **"Generate Domain"**
11. **COPIAR** tu URL de Railway (ejemplo: `autoparts-backend-production-xxxx.up.railway.app`)

---

### PASO 7: Deploy Frontend en Vercel

1. Ir a https://vercel.com
2. Crear cuenta con GitHub (Sign up with GitHub)
3. Click **"Add New..."** → **"Project"**
4. Click "Import" en tu repositorio `autoparts-manager`

   **Configurar Build:**
   - Framework Preset: **Vite**
   - Root Directory: **client** (click Edit → escribir `client`)
   - Build Command: `npm run build` (ya viene por defecto)
   - Output Directory: `dist` (ya viene por defecto)
   - Install Command: `npm install` (ya viene por defecto)

   **Variables de Entorno:**
   - Click en "Environment Variables"
   - Agregar:
     ```
     VITE_API_URL = https://TU-URL-DE-RAILWAY.up.railway.app/api
     ```
     (Usar la URL que copiaste de Railway, agregar `/api` al final)

5. Click **"Deploy"**
6. Esperar 2-5 minutos
7. Una vez terminado, Vercel te da tu URL
8. **COPIAR** tu URL de Vercel

---

### PASO 8: Actualizar FRONTEND_URL en Railway

1. Volver a Railway (https://railway.app)
2. Ir a tu proyecto
3. Click en "Variables"
4. Buscar `FRONTEND_URL`
5. Cambiar el valor a tu URL real de Vercel
6. Click "Save"
7. Railway re-desplegará automáticamente

---

### PASO 9: Verificar que Funciona

1. **Abrir tu URL de Vercel** en el navegador
2. Deberías ver la pantalla de login
3. Probar login con un usuario (si seeded antes):
   - Email: `admin@autoparts.com`
   - Password: `admin123`

4. Si NO funciona el login:
   - Abrir **DevTools** (F12)
   - Ir a pestaña **Console**
   - Buscar errores
   - Verificar pestaña **Network** → ver si las requests fallan

**Troubleshooting Común:**

❌ **Error CORS:**
- Verificar que `FRONTEND_URL` en Railway matches tu URL de Vercel exacta
- Verificar que `VITE_API_URL` en Vercel matches tu URL de Railway exacta

❌ **Error 502/503 en Railway:**
- Ir a Railway → Logs
- Verificar que no hay errores de conexión a MongoDB
- Verificar que `MONGO_URI` es correcta

❌ **Login no funciona:**
- Verificar que MongoDB tiene datos (usar Seed)
- O crear usuario manualmente en MongoDB Compass

---

### PASO 10: Seed de Datos (Opcional pero Recomendado)

Si tu base de datos está vacía, necesitas datos de prueba.

**Opción A: Seed Local → Sync a Atlas**
```powershell
# En tu máquina local
npm run seed
```
Esto agregará datos de prueba a tu MongoDB Atlas

**Opción B: Crear Usuario Manualmente en MongoDB Atlas**
1. MongoDB Atlas → Browse Collections
2. Seleccionar database `TiendaRepuestos`
3. Colección `users` → Insert Document
4. Agregar (cambiar el password):
```json
{
  "name": "Admin",
  "email": "admin@autoparts.com",
  "password": "$2a$10$hashedPasswordAquí",
  "role": "admin",
  "isActive": true
}
```

---

## 🎉 ¡LISTO!

Si todo funcionó:
- ✅ Código en GitHub
- ✅ Backend en Railway
- ✅ Frontend en Vercel
- ✅ MongoDB Atlas conectado
- ✅ Login funciona

---

## 📱 URLs Finales

Guardar estas URLs:

- **Frontend (Usuarios)**: https://tu-app.vercel.app
- **Backend (API)**: https://tu-backend.railway.app
- **GitHub (Código)**: https://github.com/tu-usuario/autoparts-manager
- **MongoDB (Admin)**: https://cloud.mongodb.com

---

## 🔄 Actualizaciones Futuras

Para actualizar la aplicación después de cambios:

```powershell
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel y Railway se actualizarán automáticamente.

---

## 📞 Si Necesitas Ayuda

Si tienes algún error en cualquier paso:
1. Copiar el mensaje de error completo
2. Decirme en qué paso estás
3. Te ayudaré a resolverlo

---

**¡Éxito con el deploy!** 🚀
