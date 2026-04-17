param(
  [ValidateSet("local", "staging")]
  [string]$EnvName = "staging",
  [ValidateSet("emulator", "device", "any")]
  [string]$TargetMode = "emulator",
  [string]$PreferredAvdName = "Pixel_6_Pro_API_34"
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "launch-artos-android.ps1"
$resetScriptPath = Join-Path $PSScriptRoot "reset-android-dev-env.ps1"

if (-not (Test-Path $scriptPath)) {
  throw "Script base nao encontrado em $scriptPath"
}

if (Test-Path $resetScriptPath) {
  & $resetScriptPath
}

try {
  & $scriptPath -EnvName $EnvName -TargetMode $TargetMode -OpenLogcat -PreferredAvdName $PreferredAvdName
} catch {
  Write-Host ""
  Write-Host "Falha ao iniciar o Diakonia Android em modo debug." -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red

  if ($_.ScriptStackTrace) {
    Write-Host ""
    Write-Host "Stack trace:" -ForegroundColor DarkRed
    Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
  }

  exit 1
}
