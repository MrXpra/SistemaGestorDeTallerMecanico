# Configuración de Git Recomendada para el Proyecto

# Este archivo contiene comandos de configuración recomendados para Git
# Ejecuta estos comandos en tu terminal para mejorar tu experiencia

# ==============================================================================
# CONFIGURACIÓN BÁSICA
# ==============================================================================

# Configurar nombre de usuario (reemplaza con tu nombre)
git config --global user.name "Tu Nombre"

# Configurar email (reemplaza con tu email)
git config --global user.email "tu.email@ejemplo.com"

# ==============================================================================
# CONFIGURACIÓN DE EDITOR
# ==============================================================================

# Usar VS Code como editor por defecto
git config --global core.editor "code --wait"

# ==============================================================================
# CONFIGURACIÓN DE FORMATO
# ==============================================================================

# Configurar el manejo de finales de línea (Windows)
git config --global core.autocrlf true

# Configurar el manejo de finales de línea (Mac/Linux)
# git config --global core.autocrlf input

# ==============================================================================
# CONFIGURACIÓN DE COLORES
# ==============================================================================

# Activar colores en la terminal
git config --global color.ui auto
git config --global color.branch auto
git config --global color.diff auto
git config --global color.status auto

# ==============================================================================
# CONFIGURACIÓN DE ALIASES ÚTILES
# ==============================================================================

# Alias para ver historial gráfico
git config --global alias.lg "log --oneline --graph --all --decorate"

# Alias para ver estado resumido
git config --global alias.st "status --short"

# Alias para ver ramas
git config --global alias.br "branch -a"

# Alias para último commit
git config --global alias.last "log -1 HEAD"

# Alias para deshacer último commit (mantener cambios)
git config --global alias.undo "reset --soft HEAD~1"

# Alias para ver cambios
git config --global alias.df "diff"

# Alias para commits
git config --global alias.cm "commit -m"

# Alias para checkout
git config --global alias.co "checkout"

# ==============================================================================
# CONFIGURACIÓN DE SEGURIDAD
# ==============================================================================

# Rechazar push a main directamente (requiere configuración en GitHub también)
# Esta es solo una advertencia local, la protección real está en GitHub

# ==============================================================================
# VERIFICAR CONFIGURACIÓN
# ==============================================================================

# Para ver toda tu configuración:
# git config --list

# Para ver una configuración específica:
# git config user.name
# git config user.email

# ==============================================================================
# NOTAS IMPORTANTES
# ==============================================================================

# 1. Los comandos con --global se aplican a todos tus proyectos
# 2. Puedes usar --local en lugar de --global para configurar solo este proyecto
# 3. Para más información: https://git-scm.com/book/es/v2/Personalizando-Git-Configuración-de-Git

