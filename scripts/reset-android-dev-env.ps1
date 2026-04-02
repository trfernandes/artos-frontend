param(
  [string]$ProjectDir = (Split-Path -Parent $PSScriptRoot),
  [string]$AppPackage = "com.church.artos"
)

$ErrorActionPreference = "SilentlyContinue"

Write-Host "Limpando ambiente Android/Expo..." -ForegroundColor DarkYellow

$expoProcesses = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "node.exe" -and
    $_.CommandLine -and
    $_.CommandLine -like "*$ProjectDir*" -and
    (
      $_.CommandLine -like "*expo*" -or
      $_.CommandLine -like "*android:staging*" -or
      $_.CommandLine -like "*android:local*"
    )
  }

foreach ($process in $expoProcesses) {
  try {
    Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop
  } catch {}
}

try {
  $deviceLines = adb devices | Select-Object -Skip 1
  foreach ($line in $deviceLines) {
    if ($line -match "^(?<serial>\S+)\s+device$") {
      adb -s $matches.serial shell am force-stop $AppPackage | Out-Null
    }
  }
} catch {}

try {
  adb reverse --remove-all | Out-Null
} catch {}

Write-Host "Reset concluido." -ForegroundColor DarkGreen
