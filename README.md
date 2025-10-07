# 🚗 AutoParts Manager - Sistema POS

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Sistema de Punto de Venta (POS) moderno y completo para tiendas de repuestos automotrices, desarrollado con tecnologías de vanguardia y diseño minimalista con efectos glassmorphism.

[🚀 Demo](#) | [📖 Documentación](./docs/) | [🐛 Reportar Bug](https://github.com/MrXpra/SistemaGestorDeTallerMecanico/issues)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [Flujo de Trabajo Git](#-flujo-de-trabajo-git)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Despliegue](#-despliegue)

---

## ✨ Características

### 🎨 Diseño Moderno
- **Glassmorphism**: Efectos de vidrio esmerilado con backdrop-blur
- **Modo Oscuro**: Toggle para alternar entre tema claro y oscuro
- **Animaciones Suaves**: Microinteracciones y transiciones fluidas
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Tipografía Inter**: Fuente moderna y legible
- **🕐 Reloj en Tiempo Real**: Muestra hora y fecha actualizada cada segundo
- **🌤️ Widget de Clima**: Temperatura, condiciones climáticas y pronóstico diario

### 🔐 Autenticación y Autorización
- Sistema de login con JWT
- Roles de usuario (Admin y Cajero)
- Rutas protegidas según rol
- Sesión persistente

### 📊 Dashboard Interactivo
- KPIs de ventas en tiempo real
- Gráficos de ventas por día
- Productos más vendidos
- Alertas de bajo stock
- Análisis por método de pago

### 🛒 Módulo de Facturación
- Búsqueda rápida de productos (SKU/Nombre)
- Soporte para lector de código de barras
- Carrito de compras interactivo
- Aplicación de descuentos
- Asociación de clientes
- Generación automática de factura
- Impresión optimizada para impresora térmica

### 📦 Gestión de Inventario
- CRUD completo de productos
- Búsqueda y filtros avanzados
- Control de stock automático
- Alertas de bajo inventario
- Categorías y marcas

### 👥 Gestión de Clientes
- Base de datos de clientes
- Historial de compras por cliente
- Asociación de ventas a clientes
- CRUD completo

### 💰 Cierre de Caja
- Resumen de ventas del cajero
- Totales por método de pago
- Ventas del día actual

### 🔧 Panel de Administración
- Gestión de usuarios del sistema
- Configuración del negocio
- Reportes y exportaciones
- Estadísticas avanzadas

---

## 🛠 Tecnologías

### Backend
- **Node.js** v18+ - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas

### Frontend
- **React 18** - Librería de UI
- **Vite** - Build tool y dev server
- **Zustand** - Manejo de estado global
- **React Router** - Enrutamiento SPA
- **Tailwind CSS** - Framework de estilos
- **Recharts** - Gráficos y visualizaciones
- **Lucide React** - Iconos
- **React Hot Toast** - Notificaciones

---

## 📋 Requisitos Previos

- **Node.js** >= 18.0.0
- **npm** o **yarn**
- **MongoDB Atlas** (cuenta gratuita) o MongoDB local
- Git (opcional)

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd autoparts-manager
```

### 2. Instalar dependencias del backend

```bash
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd client
npm install
cd ..
```

---

## ⚙ Configuración

### 1. Variables de Entorno

El archivo `.env` ya está configurado en la raíz del proyecto:

```env
# Conexión a MongoDB
MONGODB_URI=mongodb://localhost:27017/tu-base-de-datos
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Secreto para JWT (genera uno único y seguro)
JWT_SECRET=tu_secreto_jwt_super_seguro_cambiame_por_uno_real

# Puerto del servidor
PORT=5000

# Entorno
NODE_ENV=development
```

> ⚠️ **IMPORTANTE**: Nunca subas tu archivo `.env` a GitHub. El archivo `.gitignore` ya está configurado para ignorarlo.

### 2. Inicializar la Base de Datos

#### Opción A: Crear solo usuario administrador (Recomendado para producción)

```bash
npm run create-admin
```

Este comando creará:
- ✅ Usuario administrador (admin@admin.com / 123456)
- ✅ Configuración inicial del negocio

**⚠️ IMPORTANTE:** Cambia la contraseña después del primer login.

#### Opción B: Poblar con datos de ejemplo (Para desarrollo/pruebas)

```bash
npm run seed
```

Este comando creará:
- ✅ Usuario administrador y cajero
- ✅ Configuración inicial del negocio
- ✅ Proveedores de ejemplo
- ✅ 10 productos de ejemplo

---

## 🎯 Uso

### Desarrollo

#### Opción 1: Ejecutar backend y frontend por separado

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

El backend estará en `http://localhost:5000` y el frontend en `http://localhost:3000`

#### Opción 2: Ejecutar con el proxy de Vite

```bash
# Terminal 1
npm run dev

# Terminal 2
cd client
npm run dev
```

### Producción

#### 1. Build del frontend

```bash
cd client
npm run build
cd ..
```

#### 2. Servir la aplicación

```bash
NODE_ENV=production npm start
```

La aplicación completa estará disponible en `http://localhost:5000`

---

## 🌿 Flujo de Trabajo Git

Este proyecto utiliza un flujo de trabajo profesional basado en ramas:

### Ramas Principales

- **`main`** 🔒 - Versión de producción (solo código estable y etiquetado)
- **`develop`** 🛠️ - Rama de desarrollo (todo el trabajo nuevo va aquí)

### Trabajo Diario

```bash
# 1. Asegúrate de estar en develop
git checkout develop

# 2. Actualiza tu rama
git pull origin develop

# 3. Haz tus cambios y commitea
git add .
git commit -m "feat: descripción del cambio"

# 4. Sube tus cambios
git push origin develop
```

### Publicar Nueva Versión

```bash
# Para correcciones de bugs (1.0.0 → 1.0.1)
npm run release:patch

# Para nuevas funcionalidades (1.0.0 → 1.1.0)
npm run release:minor

# Para cambios importantes (1.0.0 → 2.0.0)
npm run release:major
```

📚 **Documentación completa**: [docs/GIT_WORKFLOW.md](./docs/GIT_WORKFLOW.md)  
📝 **Guía rápida**: [docs/QUICK_GIT_GUIDE.md](./docs/QUICK_GIT_GUIDE.md)

---

## 📁 Estructura del Proyecto

```
autoparts-manager/
├── client/                    # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── components/       # Componentes reutilizables
│   │   │   └── Layout/       # Layout (Sidebar, TopBar)
│   │   ├── pages/            # Páginas de la aplicación
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Billing.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/         # Servicios API
│   │   │   └── api.js
│   │   ├── store/            # Estado global (Zustand)
│   │   │   ├── authStore.js
│   │   │   ├── themeStore.js
│   │   │   └── cartStore.js
│   │   ├── App.jsx           # Componente principal
│   │   ├── main.jsx          # Entry point
│   │   └── index.css         # Estilos globales
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── config/                   # Configuraciones
│   └── db.js                # Conexión a MongoDB
│
├── controllers/              # Controladores
│   ├── authController.js
│   ├── productController.js
│   ├── saleController.js
│   ├── customerController.js
│   ├── userController.js
│   ├── settingsController.js
│   └── dashboardController.js
│
├── middleware/               # Middlewares
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   └── validationMiddleware.js
│
├── models/                   # Modelos de Mongoose
│   ├── User.js
│   ├── Product.js
│   ├── Sale.js
│   ├── Customer.js
│   └── Settings.js
│
├── routes/                   # Rutas de la API
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── saleRoutes.js
│   ├── customerRoutes.js
│   ├── userRoutes.js
│   ├── settingsRoutes.js
│   └── dashboardRoutes.js
│
├── scripts/                  # Scripts de utilidad
│   └── seed.js              # Seeding de la base de datos
│
├── .env                      # Variables de entorno
├── .gitignore
├── server.js                 # Servidor Express
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario
- `PUT /api/auth/profile` - Actualizar perfil

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto por ID
- `GET /api/products/sku/:sku` - Buscar por SKU
- `POST /api/products` - Crear producto (Admin)
- `PUT /api/products/:id` - Actualizar producto (Admin)
- `DELETE /api/products/:id` - Eliminar producto (Admin)
- `GET /api/products/categories/list` - Listar categorías
- `GET /api/products/brands/list` - Listar marcas

### Ventas
- `GET /api/sales` - Listar ventas
- `GET /api/sales/:id` - Obtener venta por ID
- `POST /api/sales` - Crear venta
- `GET /api/sales/user/me` - Ventas del usuario actual
- `PUT /api/sales/:id/cancel` - Cancelar venta (Admin)

### Clientes
- `GET /api/customers` - Listar clientes
- `GET /api/customers/:id` - Obtener cliente
- `POST /api/customers` - Crear cliente
- `PUT /api/customers/:id` - Actualizar cliente
- `DELETE /api/customers/:id` - Eliminar cliente (Admin)
- `GET /api/customers/:id/purchases` - Historial de compras

### Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `GET /api/users/:id` - Obtener usuario (Admin)
- `POST /api/users` - Crear usuario (Admin)
- `PUT /api/users/:id` - Actualizar usuario (Admin)
- `DELETE /api/users/:id` - Eliminar usuario (Admin)

### Configuración
- `GET /api/settings` - Obtener configuración
- `PUT /api/settings` - Actualizar configuración (Admin)

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas generales
- `GET /api/dashboard/sales-by-day` - Ventas por día
- `GET /api/dashboard/top-products` - Productos más vendidos
- `GET /api/dashboard/sales-by-payment` - Ventas por método de pago

---

## 🌐 Despliegue

### Render.com (Recomendado)

1. Crea una cuenta en [Render.com](https://render.com)
2. Conecta tu repositorio de GitHub
3. Crea un nuevo **Web Service**
4. Configura:
   - **Build Command**: `npm install && cd client && npm install && npm run build`
   - **Start Command**: `npm start`
5. Agrega las variables de entorno desde el panel de Render
6. Deploy!

### Variables de Entorno en Producción

Asegúrate de configurar todas las variables en tu plataforma de hosting:

- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `PORT` (generalmente lo asigna el hosting)

---

## 👥 Credenciales de Acceso

Después de ejecutar `npm run seed`:

**Administrador:**
- Email: `admin@autoparts.com`
- Contraseña: `Admin123!`

**Cajero:**
- Email: `cajero@autoparts.com`
- Contraseña: `Cajero123!`

---

## 📝 Scripts Disponibles

```bash
# Backend
npm start          # Iniciar servidor en producción
npm run dev        # Iniciar servidor en desarrollo con nodemon
npm run seed       # Poblar base de datos

# Frontend (dentro de /client)
npm run dev        # Iniciar dev server de Vite
npm run build      # Build para producción
npm run preview    # Preview del build

# Proyecto completo
npm run build      # Instalar dependencias y build completo
```

---

## 🎨 Características de Diseño

### Glassmorphism
Los elementos utilizan efectos de vidrio esmerilado con:
- `backdrop-filter: blur(16px)`
- Fondos semi-transparentes
- Bordes sutiles

### Modo Oscuro
Implementado con Tailwind CSS usando la clase `dark:`
- Persistente con localStorage
- Toggle en la TopBar
- Transiciones suaves

### Animaciones
- Fade in / Slide in / Scale in
- Hover effects con elevación
- Active states con scale
- Smooth transitions

---

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ Autenticación JWT
- ✅ Rutas protegidas por middleware
- ✅ Validación de datos en backend
- ✅ Sanitización de entradas
- ✅ CORS configurado
- ✅ Variables de entorno para secretos

---

## 🐛 Solución de Problemas

### El servidor no inicia
- Verifica que MongoDB esté conectado
- Comprueba las variables de entorno en `.env`
- Asegúrate de que el puerto 5000 esté libre

### Error de conexión a MongoDB
- Verifica la URL de conexión en `.env`
- Asegúrate de que tu IP esté en la whitelist de MongoDB Atlas
- Comprueba tus credenciales de MongoDB

### El frontend no se conecta al backend
- Verifica que ambos servidores estén corriendo
- Comprueba la configuración del proxy en `vite.config.js`
- Revisa la consola del navegador para errores

---

## 📧 Contacto y Soporte

Para preguntas, sugerencias o reportes de bugs, puedes crear un issue en el repositorio.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

<div align="center">

**Hecho con ❤️ para talleres mecánicos y tiendas de repuestos**

⭐ Si te gusta este proyecto, considera darle una estrella en GitHub

</div>
