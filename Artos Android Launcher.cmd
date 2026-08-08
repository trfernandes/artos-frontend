@echo off
setlocal
cd /d "%~dp0"
powershell -NoLogo -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\launch-artos-android.ps1" -EnvName staging -TargetMode any
if errorlevel 1 (
  echo.
  echo Falha ao iniciar o Diakonia no emulador.
  pause
)
