param(
  [ValidateSet("local", "staging")]
  [string]$EnvName = "staging",
  [ValidateSet("emulator", "device", "any")]
  [string]$TargetMode = "emulator",
  [string]$PreferredAvdName = "Pixel_6_Pro_API_34"
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "launch-artos-android.ps1"

if (-not (Test-Path $scriptPath)) {
  throw "Script base nao encontrado em $scriptPath"
}

& $scriptPath -EnvName $EnvName -TargetMode $TargetMode -OpenLogcat -PreferredAvdName $PreferredAvdName
