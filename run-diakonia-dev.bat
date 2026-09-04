@echo off
echo === Diakonia Dev — Metro WiFi (worktree artos_frontend_dev) ===

set DEVICE_PORT=5555

:: 1. Conectar device via WiFi
call "D:\artos\connect-device.bat"
if errorlevel 1 (
    echo Falha ao conectar device. Abortando.
    pause
    exit /b 1
)

:: Ler IP do device (salvo pelo connect-device.bat)
set /p DEVICE_IP=<"D:\artos\device-ip.txt"

:: 2. Descobrir IP do PC na mesma sub-rede do celular
echo.
echo [2/3] Detectando IP do PC...
set PC_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192.168.68"') do set PC_IP=%%a
set PC_IP=%PC_IP: =%

if "%PC_IP%"=="" (
    echo [AVISO] Nao detectou IP em 192.168.68.x — usando IP do device como referencia de rede
    echo         Verifique se PC e celular estao na mesma rede WiFi.
    pause
    exit /b 1
)
echo     PC: %PC_IP% ^| Device: %DEVICE_IP%

:: 3. Subir Metro apontando para o IP do PC, nesta worktree (artos_frontend_dev)
echo.
echo [3/3] Iniciando Metro (artos_frontend_dev)...
echo       Pressione Ctrl+C para encerrar.
echo.
set ANDROID_SERIAL=%DEVICE_IP%:%DEVICE_PORT%
cd /d "%~dp0"
set REACT_NATIVE_PACKAGER_HOSTNAME=%PC_IP%
npx expo start --port 8081
