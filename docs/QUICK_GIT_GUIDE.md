# 🎯 Guía Rápida - Flujo de Trabajo Git

## 🚀 ¿En qué rama estoy?

```bash
git branch
# La rama actual tiene un * asterisco
```

---

## 📝 Trabajo Diario

### ✅ Siempre trabaja en `develop`

```bash
# 1. Verificar que estás en develop
git checkout develop

# 2. Actualizar con últimos cambios
git pull origin develop

# 3. Hacer tus cambios
# ... editar archivos ...

# 4. Ver qué cambiaste
git status
git diff

# 5. Agregar y commitear
git add .
git commit -m "feat: descripción clara del cambio"

# 6. Subir a develop
git push origin develop
```

---

## 🎁 Publicar Nueva Versión

### Cuando el código en develop está listo para producción:

```bash
# Para correcciones de errores (1.0.0 → 1.0.1)
npm run release:patch

# Para nuevas funcionalidades (1.0.0 → 1.1.0)
npm run release:minor

# Para cambios importantes (1.0.0 → 2.0.0)
npm run release:major
```

El script automáticamente:
1. ✅ Fusiona develop → main
2. ✅ Crea tag de versión
3. ✅ Sube todo a GitHub
4. ✅ Te regresa a develop

---

## 🆘 Comandos de Emergencia

### Deshacer cambios no guardados
```bash
git restore .
```

### Ver historial
```bash
git log --oneline --graph --all
```

### Ver versiones publicadas
```bash
git tag -l
```

### Cambiar de rama
```bash
git checkout develop  # Para desarrollo
git checkout main     # Para ver producción (solo lectura)
```

---

## 📋 Reglas de Oro

1. ⛔ **NUNCA trabajes directamente en `main`**
2. ✅ **SIEMPRE trabaja en `develop`**
3. 📦 **Solo usa los comandos `npm run release:*` para actualizar `main`**
4. 💾 **Commitea frecuentemente con mensajes claros**
5. 🔄 **Actualiza `develop` antes de empezar a trabajar (`git pull`)**

---

## 📚 Documentación Completa

Para más detalles, consulta: **[docs/GIT_WORKFLOW.md](./GIT_WORKFLOW.md)**

---

**Última actualización**: Octubre 7, 2025
