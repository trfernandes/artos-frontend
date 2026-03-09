@echo off
setlocal
set "PAUSE_AT_END=1"
if /I "%~1"=="--no-pause" set "PAUSE_AT_END=0"
set "LOG_DIR=%~dp0logs"
set "LOG_FILE=%LOG_DIR%\build-ios-only.log"

if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
> "%LOG_FILE%" echo [%date% %time%] Iniciando build iOS sem submit

echo ============================================
echo   Build iOS Sem Submit
echo ============================================
echo.

cd /d "%~dp0"

echo [1/1] Iniciando build para iOS...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "& { [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false); $OutputEncoding = [Console]::OutputEncoding; npx eas build --platform ios --profile production --non-interactive 2>&1 | ForEach-Object { $line = $_.ToString(); Write-Host $line; Add-Content -Path '%LOG_FILE%' -Value $line }; exit $LASTEXITCODE }"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Build iOS falhou!
    echo Log salvo em: "%LOG_FILE%"
    echo.
    if "%PAUSE_AT_END%"=="1" pause
    exit /b 1
)

echo.
echo [OK] Build iOS concluido!
echo Log salvo em: "%LOG_FILE%"
echo.
if "%PAUSE_AT_END%"=="1" pause
exit /b 0
