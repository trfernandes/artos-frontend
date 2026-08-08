@echo off
setlocal

cd /d "%~dp0"

:menu
cls
echo ============================================
echo   Artos - Menu de Build e Submit
echo ============================================
echo.
echo   1. Build e Submit (iOS e Android)
echo   2. Build e Submit Android
echo   3. Build e Submit iOS
echo   4. Build Android
echo   5. Submit Android
echo   6. Build iOS
echo   7. Submit iOS
echo   8. Sair
echo.
choice /c 12345678 /n /m "Escolha uma opcao: "

if errorlevel 8 goto end
if errorlevel 7 goto submit_ios
if errorlevel 6 goto build_ios
if errorlevel 5 goto submit_android
if errorlevel 4 goto build_android
if errorlevel 3 goto submit_ios_and_build
if errorlevel 2 goto submit_android_and_build
if errorlevel 1 goto submit_all

:submit_all
call "%~dp0submit-all.bat" --no-pause
goto result

:submit_android_and_build
call "%~dp0submit-android.bat" --no-pause
goto result

:submit_ios_and_build
call "%~dp0submit-ios.bat" --no-pause
goto result

:build_android
call "%~dp0build-android-only.bat" --no-pause
goto result

:submit_android
call "%~dp0submit-android-only.bat" --no-pause
goto result

:build_ios
call "%~dp0build-ios-only.bat" --no-pause
goto result

:submit_ios
call "%~dp0submit-ios-only.bat" --no-pause
goto result

:result
set "EXIT_CODE=%ERRORLEVEL%"
set "FINAL_EXIT_CODE=%EXIT_CODE%"
echo.
if not "%EXIT_CODE%"=="0" (
    echo [ERRO] Operacao finalizada com erro.
) else (
    echo [OK] Operacao finalizada com sucesso.
)
echo.
pause
goto end

:end
if not defined FINAL_EXIT_CODE set "FINAL_EXIT_CODE=0"
exit /b %FINAL_EXIT_CODE%
