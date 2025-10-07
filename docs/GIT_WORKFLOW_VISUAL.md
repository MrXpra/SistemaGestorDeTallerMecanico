# 🎨 Flujo de Trabajo Visual - Git

## 📊 Diagrama del Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                    REPOSITORIO REMOTO (GitHub)                  │
│                                                                 │
│  ┌─────────────────────┐         ┌──────────────────────┐      │
│  │   main (producción) │◄────────┤  develop (desarrollo)│      │
│  │   🔒 Solo releases  │  merge  │  🛠️ Trabajo diario   │      │
│  │   📦 Tags: v1.0.0   │         │                      │      │
│  └─────────────────────┘         └──────────────────────┘      │
│           ▲                                ▲                    │
│           │                                │                    │
└───────────┼────────────────────────────────┼────────────────────┘
            │                                │
            │ push con tags                  │ push
            │                                │
┌───────────┼────────────────────────────────┼────────────────────┐
│           │                                │                    │
│                   REPOSITORIO LOCAL                             │
│           │                                │                    │
│  ┌────────┴────────────┐         ┌────────┴─────────────┐      │
│  │   main (local)      │◄────────┤  develop (local)     │      │
│  │                     │  merge  │                      │      │
│  └─────────────────────┘         └──────────────────────┘      │
│                                            ▲                    │
│                                            │                    │
│                                   ┌────────┴─────────────┐      │
│                                   │   ÁREA DE TRABAJO    │      │
│                                   │   (tu código)        │      │
│                                   └──────────────────────┘      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Ciclo de Vida del Código

### Fase 1️⃣: Desarrollo Diario

```
  develop (local)
       │
       ├──> 📝 Editar código
       │
       ├──> ✅ git add .
       │
       ├──> 💾 git commit -m "feat: ..."
       │
       └──> ☁️ git push origin develop
```

### Fase 2️⃣: Preparación para Release

```
  develop
       │
       ├──> ✅ Probar todas las funcionalidades
       │
       ├──> 🧪 Verificar que no hay errores
       │
       ├──> 📝 Actualizar CHANGELOG.md
       │
       └──> ✓ Listo para release
```

### Fase 3️⃣: Publicación de Versión

```
  Ejecutar comando de release
       │
       ├──> npm run release:patch  (1.0.0 → 1.0.1)
       │    npm run release:minor  (1.0.0 → 1.1.0)
       │    npm run release:major  (1.0.0 → 2.0.0)
       │
       ├──> 🔄 Script automático:
       │    │
       │    ├──> 1. Actualizar version.json
       │    │
       │    ├──> 2. Cambiar a main
       │    │
       │    ├──> 3. Merge develop → main
       │    │
       │    ├──> 4. Crear tag (v1.0.1)
       │    │
       │    ├──> 5. Push main + tags
       │    │
       │    └──> 6. Volver a develop
       │
       └──> ✓ Nueva versión publicada
```

---

## 🎯 Estados de las Ramas

### 🌿 Rama `develop`

```
Estado: SIEMPRE ACTIVA
Propósito: Desarrollo continuo
Commits: Frecuentes (diarios)
Push: Cada vez que completes una tarea
Merge desde: feature branches (opcional)
Merge hacia: main (solo en releases)

┌─────────────────────────────────────────────┐
│  develop                                    │
│  ●───●───●───●───●───●───●───●───●───●      │
│  │   │   │   │   │   │   │   │   │   │      │
│  feat fix feat docs style fix feat fix feat │
└─────────────────────────────────────────────┘
```

### 🔒 Rama `main`

```
Estado: SOLO RELEASES
Propósito: Producción estable
Commits: Esporádicos (solo releases)
Push: Solo mediante script de release
Tags: Uno por cada release
Merge desde: develop (solo releases)
Merge hacia: ninguna

┌─────────────────────────────────────────────┐
│  main                                       │
│  ●─────────────●─────────────●──────────    │
│  v1.0.0       v1.0.1       v1.1.0           │
│  (inicial)    (hotfix)     (features)       │
└─────────────────────────────────────────────┘
```

---

## 📅 Calendario de Releases (Ejemplo)

```
Semana 1-2: Desarrollo en develop
├─ Lunes: feat: agregar módulo X
├─ Martes: feat: agregar componente Y
├─ Miércoles: fix: corregir error Z
├─ Jueves: feat: integrar API W
└─ Viernes: style: mejorar UI

Fin de Semana 2: Testing
├─ Pruebas de funcionalidad
├─ Corrección de bugs
└─ Preparación de release

Lunes Semana 3: 🚀 RELEASE v1.1.0
└─ npm run release:minor

Semana 3: Continuar desarrollo en develop
└─ El ciclo se repite...
```

---

## 🎨 Convenciones de Commits

```
┌──────────────────────────────────────────────────────┐
│  Tipo: Descripción corta (máx 50 caracteres)        │
│                                                      │
│  [Cuerpo opcional: explicación detallada]           │
│                                                      │
│  [Footer opcional: referencias a issues]            │
└──────────────────────────────────────────────────────┘
```

### Tipos de Commits

| Tipo | Emoji | Uso | Ejemplo |
|------|-------|-----|---------|
| `feat` | ✨ | Nueva funcionalidad | `feat: agregar módulo de reportes` |
| `fix` | 🐛 | Corrección de error | `fix: corregir cálculo de impuestos` |
| `docs` | 📚 | Documentación | `docs: actualizar README` |
| `style` | 🎨 | Formato, sin cambios de código | `style: formatear componentes` |
| `refactor` | ♻️ | Reestructurar código | `refactor: mejorar estructura de API` |
| `test` | 🧪 | Agregar pruebas | `test: agregar tests unitarios` |
| `chore` | 🔧 | Tareas de mantenimiento | `chore: actualizar dependencias` |
| `perf` | ⚡ | Mejoras de rendimiento | `perf: optimizar consultas DB` |

---

## 📊 Matriz de Decisiones

### ¿Qué tipo de release usar?

```
┌─────────────────────────────────────────────────────┐
│                   ¿Qué hiciste?                     │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
    🐛 Bug?    ✨ Nuevo?   💥 Rompe?
        │           │           │
        ▼           ▼           ▼
      PATCH       MINOR       MAJOR
    (1.0.X)     (1.X.0)     (X.0.0)
        │           │           │
        └───────────┴───────────┘
                    │
                    ▼
            npm run release:TYPE
```

### Ejemplos Específicos

| Escenario | Tipo | Comando |
|-----------|------|---------|
| Corregiste un error de cálculo | PATCH | `npm run release:patch` |
| Agregaste módulo de clientes | MINOR | `npm run release:minor` |
| Cambiaste estructura de DB | MAJOR | `npm run release:major` |
| Corregiste typo en UI | PATCH | `npm run release:patch` |
| Agregaste exportar a PDF | MINOR | `npm run release:minor` |
| Reescribiste toda la API | MAJOR | `npm run release:major` |

---

## 🔥 Casos de Emergencia

### ⚠️ Error Crítico en Producción

```
1. Crear hotfix branch desde main
   git checkout main
   git checkout -b hotfix/error-critico

2. Corregir el error
   [editar código]
   git add .
   git commit -m "fix: corregir error crítico X"

3. Merge a main
   git checkout main
   git merge hotfix/error-critico

4. Release urgente
   npm run release:patch

5. Merge a develop también
   git checkout develop
   git merge hotfix/error-critico

6. Eliminar branch de hotfix
   git branch -d hotfix/error-critico
```

---

## 📈 Progreso Visual del Proyecto

```
v1.0.0                v1.1.0                v2.0.0
  │                     │                     │
  ●─────────────────────●─────────────────────●──────►
  │                     │                     │
  ├─ Sistema base       ├─ Reportes          ├─ Nueva arquitectura
  ├─ CRUD básico        ├─ PDF export        ├─ GraphQL API
  ├─ Auth               ├─ Dashboard mejorado ├─ Microservicios
  └─ UI básica          └─ Notificaciones    └─ App móvil
```

---

**Última actualización**: Octubre 7, 2025  
**Versión del documento**: 1.0.0
