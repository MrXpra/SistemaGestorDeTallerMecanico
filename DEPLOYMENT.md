# 🚀 Guía de Despliegue - AutoParts Manager

## 📋 Checklist Pre-Deploy

### 1. Variables de Entorno

#### Backend (Railway/Render)
Copiar y configurar estas variables en el dashboard:

```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/TiendaRepuestos
JWT_SECRET=generar_secreto_aleatorio_minimo_32_caracteres
JWT_EXPIRE=7d
FRONTEND_URL=https://tu-app.vercel.app
```

#### Frontend (Vercel)
```env
VITE_API_URL=https://tu-backend.railway.app/api
```

---

## 🔧 Configuración MongoDB Atlas

1. **Network Access** → Add IP Address → `0.0.0.0/0` (permitir todas)
2. **Database Access** → Crear usuario con permisos de lectura/escritura
3. **Connect** → Copiar connection string
4. Reemplazar `<password>` en el string

---

## 🚂 Deploy Backend (Railway)

### Opción A: Desde GitHub (Recomendado)

1. Ir a https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Seleccionar repositorio `autoparts-manager`
4. Railway detecta automáticamente Node.js
5. Configurar variables de entorno (ver arriba)
6. Deploy automático

### Opción B: Desde CLI

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

### Verificar Deploy
```bash
curl https://tu-backend.railway.app/api/settings
```

---

## ▲ Deploy Frontend (Vercel)

### Desde Web UI (Recomendado)

1. Ir a https://vercel.com
2. "Add New..." → "Project"
3. Importar repositorio de GitHub
4. **Configuración:**
   - Framework Preset: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables:**
   - `VITE_API_URL` = URL del backend de Railway
6. Deploy

### Desde CLI

```bash
npm i -g vercel
cd client
vercel
```

---

## 🧪 Testing Post-Deploy

### Backend
```bash
# Health check
curl https://tu-backend.railway.app/api/settings

# Login test
curl -X POST https://tu-backend.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"123456"}'
```

### Frontend
1. Abrir `https://tu-app.vercel.app`
2. Probar login
3. Verificar que carga dashboard
4. Crear una venta de prueba

---

## 🔄 Actualizaciones Futuras

### Automatic Deployments (ya configurado)
- Push a `main` → Auto-deploy en Railway y Vercel
- Pull Requests → Preview deployments en Vercel

### Manual Deploy
```bash
# Desde cualquier rama
git push origin main
```

---

## 📊 Monitoreo

### Railway
- Dashboard → Logs
- Dashboard → Metrics
- Dashboard → Deployments

### Vercel
- Project → Deployments
- Project → Analytics (si está habilitado)

### MongoDB Atlas
- Clusters → Metrics
- Clusters → Real-time Performance

---

## ⚠️ Troubleshooting

### Error: CORS blocked
- Verificar `FRONTEND_URL` en Railway matches Vercel URL
- Verificar `VITE_API_URL` en Vercel matches Railway URL

### Error: Cannot connect to MongoDB
- Verificar IP whitelist en MongoDB Atlas
- Verificar MONGO_URI en Railway

### Error: 401 Unauthorized
- Verificar JWT_SECRET es el mismo en todas las instancias
- Limpiar localStorage del browser

### Frontend no carga
- Verificar build logs en Vercel
- Verificar `vercel.json` está en carpeta `client/`

---

## 🎯 URLs Finales

Actualizar estos valores después del deploy:

- **Frontend**: https://autoparts-manager.vercel.app
- **Backend**: https://autoparts-backend-production.up.railway.app
- **MongoDB**: mongodb+srv://cluster.mongodb.net

---

## 📝 Notas

- Railway plan gratuito: $5 crédito/mes
- Vercel plan gratuito: Ilimitado para proyectos personales
- MongoDB Atlas: 512MB gratuito permanente

---

Para más detalles, ver documentación en `docs/PROYECTO_COMPLETO.md`
