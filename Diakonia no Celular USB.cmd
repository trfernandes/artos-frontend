@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\scripts\launch-artos-android-debug.ps1" -EnvName staging -TargetMode device

