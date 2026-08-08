@echo off
setlocal
cd /d "%~dp0"
powershell -NoLogo -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\launch-artos-android-debug.ps1" -EnvName staging -TargetMode emulator
if errorlevel 1 (
  echo.
  echo Falha ao iniciar o Diakonia no emulador Android.
  pause
)
