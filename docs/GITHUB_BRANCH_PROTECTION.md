# 🛡️ Configuración de Protección de Ramas en GitHub

## 📋 Paso a Paso para Proteger la Rama `main`

Para completar la configuración profesional de tu repositorio, es **altamente recomendado** proteger la rama `main` en GitHub para evitar pushes accidentales.

---

## 🔐 Pasos para Configurar

### 1️⃣ Acceder a la Configuración del Repositorio

1. Ve a tu repositorio en GitHub:
   ```
   https://github.com/MrXpra/SistemaGestorDeTallerMecanico
   ```

2. Haz clic en **Settings** (⚙️ Configuración)

### 2️⃣ Configurar Reglas de Protección

1. En el menú lateral, busca **Branches** bajo la sección "Code and automation"

2. Haz clic en **Add rule** (Agregar regla)

### 3️⃣ Configurar la Regla para `main`

En el campo **Branch name pattern**, escribe:
```
main
```

### 4️⃣ Marcar las Siguientes Opciones

Marca estas casillas:

#### 🔒 Protecciones Básicas (RECOMENDADAS)

- ✅ **Require a pull request before merging**
  - Esto obliga a usar Pull Requests en lugar de pushes directos
  - Puedes desmarcar "Require approvals" si trabajas solo

- ✅ **Require status checks to pass before merging**
  - Si tienes CI/CD configurado

- ✅ **Do not allow bypassing the above settings**
  - Aplica las reglas incluso a administradores

#### 🚫 Protecciones Opcionales

- ⬜ **Require signed commits** (Opcional, requiere configuración GPG)
- ⬜ **Require linear history** (Opcional, para historial más limpio)
- ✅ **Include administrators** (Recomendado para evitar errores)

### 5️⃣ Guardar Cambios

Haz clic en **Create** o **Save changes** al final de la página.

---

## ✅ Verificar la Configuración

Una vez configurado, verás:

```
Protected branches
main         Edit rule
└─ Require pull request reviews before merging
└─ Include administrators
```

---

## 🎯 ¿Qué Logras con Esto?

### ✅ Beneficios

1. **Prevención de Errores**
   - No podrás hacer `git push origin main` por accidente
   - Te obligará a usar el script de release

2. **Código Revisado**
   - Opcional: Puedes requerir revisión de código antes de merge
   - Útil si trabajas en equipo

3. **Historial Limpio**
   - Solo commits bien organizados llegan a main
   - Cada commit en main representa una versión oficial

4. **Seguridad**
   - Protección contra eliminación accidental de la rama
   - Protección contra force push

---

## 🔄 Flujo con Rama Protegida

### Antes (Sin Protección)
```bash
# ❌ Esto funcionaría pero es peligroso
git checkout main
git commit -m "cambio directo"
git push origin main
```

### Después (Con Protección)
```bash
# ❌ Esto será rechazado por GitHub
git checkout main
git push origin main
# Error: Protected branch

# ✅ La forma correcta
npm run release:patch  # o minor/major
# El script lo hace todo automáticamente
```

---

## 🆘 Si Necesitas Hacer un Push de Emergencia

En casos muy excepcionales donde necesites subir directamente a main:

### Opción 1: Desactivar Temporalmente la Protección

1. Ve a Settings → Branches
2. Edita la regla de main
3. Desactiva temporalmente
4. Haz tu push
5. **¡Reactiva la protección inmediatamente!**

### Opción 2: Usar Pull Request

1. Crea una rama temporal:
   ```bash
   git checkout main
   git checkout -b emergency-fix
   ```

2. Haz tus cambios y push:
   ```bash
   git add .
   git commit -m "fix: emergency fix"
   git push origin emergency-fix
   ```

3. Crea un Pull Request en GitHub:
   - De `emergency-fix` hacia `main`
   - Apruébalo y mergea
   - Elimina la rama temporal

---

## 📊 Niveles de Protección Recomendados

### 🟢 Nivel Básico (Solo tú trabajando)

```
✅ Require a pull request before merging
   ⬜ Require approvals (sin marcar)
✅ Include administrators
```

### 🟡 Nivel Intermedio (Pequeño equipo)

```
✅ Require a pull request before merging
   ✅ Require approvals (1 approval)
✅ Include administrators
✅ Do not allow bypassing the above settings
```

### 🔴 Nivel Avanzado (Equipo grande/profesional)

```
✅ Require a pull request before merging
   ✅ Require approvals (2+ approvals)
✅ Require status checks to pass
✅ Require conversation resolution before merging
✅ Include administrators
✅ Do not allow bypassing the above settings
✅ Require linear history
✅ Require signed commits
```

---

## 🎓 Conceptos Importantes

### Pull Request (PR)
Un Pull Request es una solicitud para fusionar cambios de una rama a otra. Es como decir:
> "Hice cambios en la rama X, ¿puedo fusionarlos en main?"

### Ventajas de Usar Pull Requests

1. **Revisión de Código**
   - Otros (o tú mismo) pueden revisar antes de fusionar
   - Detectar errores antes de que lleguen a producción

2. **Discusión**
   - Comentarios en líneas específicas
   - Sugerencias de mejoras

3. **Integración Continua**
   - Tests automáticos antes de fusionar
   - Validaciones de código

4. **Historial**
   - Registro claro de qué se cambió y por qué
   - Facilita auditorías

---

## 🚀 Flujo Completo con Protección

```
┌─────────────────────────────────────────────────┐
│  1. Trabajar en develop                         │
│     git checkout develop                        │
│     [hacer cambios]                             │
│     git commit -m "feat: nueva funcionalidad"   │
│     git push origin develop                     │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  2. Cuando esté listo para release              │
│     npm run release:minor                       │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│  3. Script automático intenta merge a main      │
│     - Si main está protegido SIN PR: ❌ Error   │
│     - Si main está protegido CON PR: ✅ Pasa    │
│     - Si main NO está protegido: ✅ Pasa        │
└─────────────────────────────────────────────────┘
```

---

## 💡 Recomendación Final

**Para tu caso específico (trabajando solo):**

```
Configuración Recomendada:
✅ Require a pull request before merging
   ⬜ Require approvals: NO (desmarcado)
✅ Include administrators: SÍ
⬜ Do not allow bypassing: NO (para flexibilidad)
```

Esto te da:
- ✅ Protección contra pushes accidentales
- ✅ Flexibilidad para releases rápidos
- ✅ Posibilidad de bypass en emergencias
- ✅ No necesitas aprobar tus propios PRs

---

## 📝 Checklist de Configuración

- [ ] Acceder a Settings del repositorio en GitHub
- [ ] Ir a Branches
- [ ] Crear regla para `main`
- [ ] Marcar "Require a pull request before merging"
- [ ] Marcar "Include administrators"
- [ ] Guardar cambios
- [ ] Verificar que aparece como "Protected"
- [ ] Probar hacer un push directo a main (debería fallar)
- [ ] Probar el script `npm run release:patch` (debería funcionar)

---

## 🆘 Troubleshooting

### Problema: El script de release falla con rama protegida

**Solución 1**: Desmarcar "Require approvals" en la configuración

**Solución 2**: Modificar el script para crear PR en lugar de merge directo

**Solución 3**: No proteger la rama y confiar en tu disciplina de usar siempre el script

### Problema: Necesito hacer un cambio urgente en main

**Solución**: Usa la Opción 1 o 2 de emergencia descritas arriba

---

## 📞 Recursos Adicionales

- [GitHub Docs: Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Pull Requests](https://docs.github.com/en/pull-requests)

---

**Última actualización**: 2025-10-07  
**Estado**: Instrucciones pendientes de aplicar en GitHub
