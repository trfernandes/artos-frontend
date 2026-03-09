@echo off
setlocal
set "PAUSE_AT_END=1"
if /I "%~1"=="--no-pause" set "PAUSE_AT_END=0"

echo ============================================
echo   Build e Submit - iOS + Android
echo ============================================
echo.

cd /d "%~dp0"

echo [1/2] Executando fluxo iOS...
echo.
call "%~dp0submit-ios.bat" --no-pause
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Fluxo iOS falhou!
    echo.
    if "%PAUSE_AT_END%"=="1" pause
    exit /b 1
)

echo [2/2] Executando fluxo Android...
echo.
call "%~dp0submit-android.bat" --no-pause
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERRO] Fluxo Android falhou!
    echo.
    if "%PAUSE_AT_END%"=="1" pause
    exit /b 1
)

echo ============================================
echo   Processo finalizado com sucesso!
echo ============================================
if "%PAUSE_AT_END%"=="1" pause
exit /b 0
