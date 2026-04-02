@echo off
setlocal
cd /d "%~dp0"
powershell -NoLogo -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\launch-artos-mobile-wifi.ps1" -EnvName staging -ClearCache
if errorlevel 1 (
  echo.
  echo Falha ao iniciar o Diakonia no celular.
  pause
)
