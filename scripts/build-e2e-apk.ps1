<#
.SYNOPSIS
  Builds a self-contained Android APK (bundle embedded) for Maestro E2E testing.

.DESCRIPTION
  Compila o APK com o bundle JS embutido via Gradle + expo export:embed.
  Sem Metro em runtime, sem dev client picker, sem ProtocolException.
  O APK resultante pode ser testado com Maestro diretamente.

.PARAMETER Device
  ADB device serial (default: emulator-5554)

.PARAMETER SkipBuild
  Pula o build do Gradle e usa o APK existente.

.EXAMPLE
  .\scripts\build-e2e-apk.ps1
  .\scripts\build-e2e-apk.ps1 -Device emulator-5556
  .\scripts\build-e2e-apk.ps1 -SkipBuild   # reinstala APK anterior
#>
param(
  [string]$Device = "emulator-5554",
  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$AndroidDir  = Join-Path $ProjectRoot "android"
$ApkPath     = Join-Path $AndroidDir "app\build\outputs\apk\release\app-release.apk"

Set-Location $ProjectRoot

if (-not $SkipBuild) {
  Write-Host "[e2e] Gerando bundle + compilando APK (x86_64)..." -ForegroundColor Cyan

  # Desabilita upload Sentry — sem auth token localmente, a task falharia
  $env:SENTRY_DISABLE_AUTO_UPLOAD = "true"
  $env:EXPO_PUBLIC_API_URL = "https://artos-backend-nwg5.onrender.com"
  $env:NODE_ENV = "production"

  # Limpa diretório de kotlin-classes que o Windows pode deixar bloqueado
  # entre builds (gradle --no-daemon não limpa isso automaticamente no Windows)
  $KotlinClassesRelease = Join-Path $AndroidDir "..\node_modules\expo\android\build\tmp\kotlin-classes\release"
  if (Test-Path $KotlinClassesRelease) {
    Remove-Item -Recurse -Force $KotlinClassesRelease -ErrorAction SilentlyContinue
  }

  # -PreactNativeArchitectures=x86_64  → só a arquitetura do emulador (mais rápido)
  # --no-daemon                         → evita estado sujo entre builds
  Set-Location $AndroidDir
  & ".\gradlew.bat" "assembleRelease" "-PreactNativeArchitectures=x86_64" "--no-daemon" "--quiet"

  if ($LASTEXITCODE -ne 0) {
    Write-Error "[e2e] Build falhou (exit $LASTEXITCODE)."
    exit 1
  }

  Set-Location $ProjectRoot
}

if (-not (Test-Path $ApkPath)) {
  Write-Error "[e2e] APK nao encontrado em: $ApkPath"
  Write-Host "  Execute sem -SkipBuild para gerar o APK."
  exit 1
}

$apkSize = [math]::Round((Get-Item $ApkPath).Length / 1MB, 1)
Write-Host "[e2e] APK pronto: $ApkPath ($apkSize MB)" -ForegroundColor Green

# Configura ADB reverse (garante que se ja existir, nao quebra)
Write-Host "[e2e] Configurando ADB reverse tcp:8081..." -ForegroundColor Cyan
& adb -s $Device reverse tcp:8081 tcp:8081 2>$null | Out-Null

# Instala no emulador (substitui versao anterior sem desinstalar dados)
Write-Host "[e2e] Instalando no device $Device..." -ForegroundColor Cyan
& adb -s $Device install -r $ApkPath

if ($LASTEXITCODE -ne 0) {
  Write-Host "[e2e] Tentando com -t (test APK)..." -ForegroundColor Yellow
  & adb -s $Device install -r -t $ApkPath
}

Write-Host ""
Write-Host "[e2e] APK instalado com sucesso!" -ForegroundColor Green
Write-Host "[e2e] Próximos passos:" -ForegroundColor White
Write-Host "  maestro test flows/run-smoke.yaml -e APP_EMAIL=ativo@teste.com -e APP_PASSWORD=Teste123!"
Write-Host "  maestro test flows/billing-311-compliance.yaml -e APP_EMAIL=ativo@teste.com -e APP_PASSWORD=Teste123!"
Write-Host ""
Write-Host "[e2e] Para rebuild após mudança de código:"
Write-Host "  .\scripts\build-e2e-apk.ps1"
Write-Host "[e2e] Para reinstalar sem rebuild (ex: troca de emulador):"
Write-Host "  .\scripts\build-e2e-apk.ps1 -SkipBuild"
