@echo off
setlocal
set "PAUSE_AT_END=1"
if /I "%~1"=="--no-pause" set "PAUSE_AT_END=0"
set "LOG_DIR=%~dp0logs"
set "LOG_FILE=%LOG_DIR%\submit-ios.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
> "%LOG_FILE%" echo [%date% %time%] Iniciando submit iOS

echo ============================================
echo   Build e Submit - iOS
echo ============================================
echo.

cd /d "%~dp0"

echo [1/1] Iniciando build e submit para iOS...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); $OutputEncoding = [Console]::OutputEncoding; eas build --platform ios --profile production --auto-submit --non-interactive 2>&1 | ForEach-Object { $line = $_.ToString(); Write-Host $line; Add-Content -Path '%LOG_FILE%' -Value $line }; exit $LASTEXITCODE }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Build/submit iOS falhou!
    echo Log salvo em: "%LOG_FILE%"
    echo.
    if "%PAUSE_AT_END%"=="1" pause
    exit /b 1
)

echo.
echo [OK] iOS concluido!
echo Log salvo em: "%LOG_FILE%"
echo.
if "%PAUSE_AT_END%"=="1" pause
exit /b 0
