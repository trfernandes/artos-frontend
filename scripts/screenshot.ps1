param(
  [string]$Serial,
  [string]$OutputDir = (Join-Path (Split-Path -Parent $PSScriptRoot) ".artifacts\screenshots")
)

$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot
$screenshotScript = Join-Path $PSScriptRoot "take-screenshot.js"

if (-not (Test-Path $screenshotScript)) {
  throw "take-screenshot.js nao encontrado em $screenshotScript"
}

if (-not $Serial) {
  $deviceLines = adb devices | Select-Object -Skip 1
  $devices = @(
    $deviceLines | ForEach-Object {
      $line = $_.Trim()
      if (-not $line) { return }
      $parts = ($line -split "\s+") | Where-Object { $_ }
      if ($parts.Count -lt 2 -or $parts[1] -ne "device") { return }
      $parts[0]
    } | Where-Object { $_ }
  )

  if ($devices.Count -eq 0) {
    throw "Nenhum device Android conectado. Inicie o emulador primeiro."
  }

  # Prefere emulador se houver um rodando
  $emulator = $devices | Where-Object { $_ -like "emulator-*" } | Select-Object -First 1
  $Serial = if ($emulator) { $emulator } else { $devices[0] }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outputPath = Join-Path $OutputDir "screen-$timestamp.png"

Write-Host "Capturando screenshot de $Serial..." -ForegroundColor Cyan
node $screenshotScript $outputPath --serial $Serial

if ($LASTEXITCODE -ne 0) {
  throw "Falha ao capturar screenshot."
}

Write-Host ""
Write-Host "Screenshot salvo em:" -ForegroundColor Green
Write-Host $outputPath -ForegroundColor White
Write-Host ""
