@echo off
echo Iniciando build e submit para iOS...
cd /d "%~dp0"
npx eas build --platform ios --auto-submit --non-interactive
echo.
echo Concluido!
pause
