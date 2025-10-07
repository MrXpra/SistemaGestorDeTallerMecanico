# Sistema de Clasificación de Logs - Guía de Uso

## 🎯 ¿Qué se ha implementado?

El sistema ahora distingue automáticamente entre **acciones de usuario** y **acciones del sistema**.

---

## 📊 Clasificación Automática

### ⚙️ **Acciones del Sistema** (isSystemAction = true)
Son operaciones automáticas, de lectura, o consultas que no representan cambios significativos:

- `read` - Lectura de datos
- `export` - Exportación de información
- `list` - Listado de registros
- `fetch` - Obtención de datos
- `get` - Consultas GET
- `search` - Búsquedas
- `view` - Visualizaciones
- `query` - Consultas

**Ejemplo visual en la interfaz:**
```
⚙️ Sistema | GET /api/products - 200
```

### 👤 **Acciones del Usuario** (isSystemAction = false)
Son operaciones explícitas iniciadas por el usuario que modifican datos:

- `create` - Crear registros
- `update` - Actualizar información
- `delete` - Eliminar datos
- `archive` - Archivar elementos
- `restore` - Restaurar datos
- `cancel` - Cancelar operaciones
- `approve` - Aprobar
- `reject` - Rechazar

**Ejemplo visual en la interfaz:**
```
👤 Edgar Padilla | Producto creado: Filtro de Aceite
```

---

## 🖥️ Interfaz de Usuario

### Filtro de Origen
En la sección de filtros encontrarás un nuevo dropdown:

```
┌─────────────────────────────────┐
│ Todos los orígenes         ▼   │
├─────────────────────────────────┤
│ Todos los orígenes              │
│ 👤 Acciones de Usuario          │
│ ⚙️ Acciones del Sistema         │
└─────────────────────────────────┘
```

### Badges en la Tabla
Cada log muestra un badge visual junto al nombre del usuario:

**Acción de Usuario:**
```
┌──────┬────────────────┬────────────────┐
│ 👤   │ Edgar Padilla  │ Producto...    │
└──────┴────────────────┴────────────────┘
   ↑
   Badge azul con icono de persona
```

**Acción del Sistema:**
```
┌──────┬────────────────┬────────────────┐
│ ⚙️   │ Sistema        │ GET /api...    │
└──────┴────────────────┴────────────────┘
   ↑
   Badge gris con icono de engranaje
```

---

## 📈 Estadísticas Actuales

Según el último análisis de tu base de datos:

- **Total de logs:** 138
- **⚙️ Acciones del Sistema:** 103 (74.6%)
- **👤 Acciones del Usuario:** 35 (25.4%)

Esto es normal, ya que el sistema genera muchos logs de lectura y consulta automáticamente.

---

## 🔧 Uso Práctico

### Para ver solo acciones importantes de usuarios:
1. Ve a la página de Logs
2. En el filtro "Origen", selecciona: **👤 Acciones de Usuario**
3. Verás solo las acciones significativas (crear, editar, eliminar)

### Para auditar acciones críticas:
Combina filtros:
- **Origen:** 👤 Acciones de Usuario
- **Tipo:** Action
- **Severidad:** Medium o High
- **Módulo:** El módulo que quieres revisar

### Para debug del sistema:
- **Origen:** ⚙️ Acciones del Sistema
- **Tipo:** Error o Warning
- Verás problemas automáticos del sistema

---

## 🔄 Mantenimiento

### Script de Actualización
Si en el futuro necesitas reclasificar logs:

```bash
node scripts/updateLogsSystemAction.js
```

Este script:
- ✅ Encuentra logs sin clasificar
- ✅ Los clasifica según su acción
- ✅ Agrega tags 'user' o 'system'
- ✅ Muestra estadísticas del resultado

---

## 💡 Ventajas

1. **Auditoría limpia:** Filtra solo acciones importantes de usuarios
2. **Menos ruido:** Separa logs técnicos de logs de negocio
3. **Mejor seguridad:** Identifica rápidamente cambios críticos
4. **Debug eficiente:** Distingue errores de usuario vs errores de sistema
5. **Cumplimiento:** Logs de auditoría más claros para regulaciones

---

## 🎨 Personalización

Si necesitas agregar más acciones a la clasificación, edita:

**Backend:** `services/logService.js` - línea ~293
```javascript
const systemActions = ['read', 'export', 'list', 'fetch', 'get', 'search'];
```

**Script:** `scripts/updateLogsSystemAction.js` - líneas 8-12
```javascript
const SYSTEM_ACTIONS = ['read', 'export', 'list', 'fetch', 'get', 'search', 'view', 'query'];
const USER_ACTIONS = ['create', 'update', 'delete', 'archive', 'restore', 'cancel'];
```

---

## ✅ Todo Listo

El sistema está completamente funcional:
- ✅ Backend clasifica automáticamente nuevos logs
- ✅ Frontend muestra badges visuales
- ✅ Filtros funcionan correctamente
- ✅ Logs existentes actualizados
- ✅ Script de mantenimiento disponible

¡Ahora puedes distinguir claramente entre acciones de usuario y del sistema! 🎉
