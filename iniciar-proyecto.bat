@echo off
title 🚀 Iniciando Proyecto Astro

echo ========================================
echo 🔧 Instalando dependencias del proyecto...
echo ========================================
npm install

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Hubo un error al instalar las dependencias.
    echo Asegúrate de tener Node.js correctamente instalado.
    pause
    exit /b
)

echo.
echo ========================================
echo ✅ Dependencias instaladas con éxito.
echo ========================================
echo Iniciando el servidor de desarrollo...

start http://localhost:4321
npm run dev

IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Error al iniciar el servidor.
    echo Verifica que tu archivo package.json tenga definido el script "dev".
    pause
    exit /b
)

pause
