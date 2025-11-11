Write-Host "🚀 Bootstrap: instalando dependencias en la raíz del proyecto..."
npm install

Write-Host "🚀 Instalando dependencias en el directorio client..."
Push-Location -Path "$(Join-Path $PSScriptRoot '..' 'client')"
npm install
Pop-Location

Write-Host "✅ Bootstrap completado: dependencias instaladas en root y client."
Write-Host "Puedes ejecutar 'cd client; npm run dev' para levantar el frontend." 
