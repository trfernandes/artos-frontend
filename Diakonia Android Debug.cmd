@echo off
setlocal
cd /d "%~dp0"
powershell -NoLogo -NoExit -ExecutionPolicy Bypass -File "%~dp0scripts\launch-artos-android-debug.ps1" -EnvName staging -TargetMode emulator -PreferredAvdName Pixel_6_Pro_API_34
if errorlevel 1 (
  echo.
  echo Falha ao iniciar o Diakonia Android com debug.
  pause
)
