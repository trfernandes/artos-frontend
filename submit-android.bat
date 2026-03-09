@echo off
setlocal
set "PAUSE_AT_END=1"
if /I "%~1"=="--no-pause" set "PAUSE_AT_END=0"
set "LOG_DIR=%~dp0logs"
set "LOG_FILE=%LOG_DIR%\submit-android.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
> "%LOG_FILE%" echo [%date% %time%] Iniciando submit Android

echo ============================================
echo   Build e Submit - Android
echo ============================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando build para Android...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); $OutputEncoding = [Console]::OutputEncoding; npx eas build --platform android --profile production --non-interactive 2>&1 | ForEach-Object { $line = $_.ToString(); Write-Host $line; Add-Content -Path '%LOG_FILE%' -Value $line }; exit $LASTEXITCODE }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Build Android falhou!
    echo Log salvo em: "%LOG_FILE%"
    echo.
    if "%PAUSE_AT_END%"=="1" pause
    exit /b 1
)

echo.
echo [OK] Build Android concluido!
echo.
echo [2/2] Enviando Android para Google Play...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); $OutputEncoding = [Console]::OutputEncoding; npx eas submit --platform android --profile production --latest --non-interactive 2>&1 | ForEach-Object { $line = $_.ToString(); Write-Host $line; Add-Content -Path '%LOG_FILE%' -Value $line }; exit $LASTEXITCODE }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Submit Android para Google Play falhou!
    echo Log salvo em: "%LOG_FILE%"
    echo.
    if "%PAUSE_AT_END%"=="1" pause
    exit /b 1
)

echo.
echo [OK] Submit Android para Google Play concluido!
echo Log salvo em: "%LOG_FILE%"
echo.
if "%PAUSE_AT_END%"=="1" pause
exit /b 0
