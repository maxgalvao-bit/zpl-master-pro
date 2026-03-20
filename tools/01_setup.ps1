# tools/01_setup.ps1
Write-Host "Instalando dependencias do Client-Side (zpl-renderer-js, jspdf)..."
npm install jspdf zpl-renderer-js

Write-Host "Criando pastas de linguagens e removendo globais default..."
New-Item -ItemType Directory -Force -Path "src\locales"
Remove-Item -Path "src\app\page.tsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\app\layout.tsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "src\app\globals.css" -Force -ErrorAction SilentlyContinue

Write-Host "Setup base finalizado com sucesso."
