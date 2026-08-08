param(
  [string]$Serial
)

$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectDir "logs"

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

if (-not $Serial) {
  $devices = @(
    adb devices |
      Select-Object -Skip 1 |
      ForEach-Object {
        $line = $_.Trim()
        if (-not $line) { return }
        $parts = ($line -split "\s+") | Where-Object { $_ }
        if ($parts.Count -lt 2 -or $parts[1] -ne "device") { return }
        [PSCustomObject]@{
          Serial = $parts[0]
        }
      }
  ) | Where-Object { $_ }

  if ($devices.Count -eq 0) {
    throw "Nenhum device Android conectado via adb."
  }

  if ($devices.Count -eq 1) {
    $Serial = $devices[0].Serial
  } else {
    Write-Host "Devices conectados:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $devices.Count; $i++) {
      Write-Host " [$($i + 1)] $($devices[$i].Serial)"
    }

    do {
      $choice = Read-Host "Escolha o numero do device"
      $selectedIndex = 0
      $valid = [int]::TryParse($choice, [ref]$selectedIndex) -and $selectedIndex -ge 1 -and $selectedIndex -le $devices.Count
    } while (-not $valid)

    $Serial = $devices[$selectedIndex - 1].Serial
  }
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDir "android-logcat-$($Serial.Replace(':', '_'))-$timestamp.log"

Write-Host ""
Write-Host "Device: $Serial" -ForegroundColor Green
Write-Host "Log: $logPath" -ForegroundColor Green
Write-Host "Reproduza o crash e pressione Ctrl+C para encerrar." -ForegroundColor Yellow
Write-Host ""

adb -s $Serial logcat -c
adb -s $Serial logcat AndroidRuntime:E ReactNative:V ReactNativeJS:V Expo:V ActivityManager:I System.err:V *:S | Tee-Object -FilePath $logPath
