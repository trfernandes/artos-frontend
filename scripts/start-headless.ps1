param(
  [ValidateSet("local", "staging")]
  [string]$EnvName = "staging",
  [string]$AvdName = "Pixel_5_API_34",
  [int]$Port = 8081
)

# Inicia emulador + Metro sem nenhuma interacao humana.
# Rode antes de sair: o notebook fica pronto para uso remoto.

$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $projectDir "logs"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDir "headless-$timestamp.log"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null

Start-Transcript -Path $logPath -Force | Out-Null
Write-Host "Log: $logPath" -ForegroundColor DarkGray

# ── helpers ──────────────────────────────────────────────────────────────────

function Get-AdbDeviceState {
  param([string]$Serial)
  $line = adb devices | Select-Object -Skip 1 |
    Where-Object { $_ -match "^$([regex]::Escape($Serial))\s+" } |
    Select-Object -First 1
  if (-not $line) { return $null }
  ($line -split "\s+" | Where-Object { $_ })[1]
}

function Wait-ForAndroidBoot {
  param([string]$Serial, [int]$TimeoutSeconds = 180)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $lastState = $null
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3
    $state = Get-AdbDeviceState -Serial $Serial
    if ($state -ne $lastState -and $state) {
      Write-Host "Estado adb: $state" -ForegroundColor DarkYellow
      $lastState = $state
    }
    if ($state -eq "device") {
      $booted = ""
      try { $booted = (adb -s $Serial shell getprop sys.boot_completed 2>$null | Select-Object -First 1).Trim() } catch {}
      if ($booted -eq "1") { return }
    }
  }
  throw "Android nao terminou de iniciar dentro do tempo esperado."
}

function Wait-ForNewEmulatorSerial {
  param([string[]]$KnownSerials, [int]$TimeoutSeconds = 120)
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    $current = @(
      adb devices | Select-Object -Skip 1 |
        ForEach-Object { ($_ -split "\s+")[0].Trim() } |
        Where-Object { $_ }
    )
    $new = $current | Where-Object { $_ -like "emulator-*" -and $_ -notin $KnownSerials } | Select-Object -First 1
    if ($new) { return $new }
  }
  throw "Emulador iniciado mas nao apareceu no adb dentro do tempo esperado."
}

function Get-ListeningPid {
  param([int]$LocalPort)
  try {
    $conn = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop | Select-Object -First 1
    if (-not $conn) { return $null }
    return $conn.OwningProcess
  } catch { return $null }
}

function Import-EnvFile {
  param([string]$FilePath)
  if (-not (Test-Path $FilePath)) { return }
  foreach ($rawLine in Get-Content $FilePath) {
    $line = $rawLine.Trim()
    if (-not $line -or $line.StartsWith("#")) { continue }
    $sep = $line.IndexOf("=")
    if ($sep -lt 1) { continue }
    $key = $line.Substring(0, $sep).Trim()
    $val = $line.Substring($sep + 1).Trim()
    if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
      $val = $val.Substring(1, $val.Length - 2)
    }
    Set-Item -Path "Env:$key" -Value $val
  }
}

# ── main ─────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "=========================================" -ForegroundColor DarkCyan
Write-Host " Diakonia — Inicio Headless" -ForegroundColor Cyan
Write-Host " AVD      : $AvdName" -ForegroundColor Cyan
Write-Host " Ambiente : $EnvName" -ForegroundColor Cyan
Write-Host " Porta    : $Port" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor DarkCyan
Write-Host ""

Set-Location $projectDir

# Carrega variaveis de ambiente
$envFile = Join-Path $projectDir ".env.$EnvName"
Import-EnvFile -FilePath $envFile

# Libera porta Metro se ocupada por Node
$metroOwner = Get-ListeningPid -LocalPort $Port
if ($metroOwner) {
  $proc = Get-Process -Id $metroOwner -ErrorAction SilentlyContinue
  if ($proc -and $proc.ProcessName -in @("node", "node.exe")) {
    Write-Host "Encerrando Metro anterior (PID $metroOwner)..." -ForegroundColor Yellow
    taskkill /PID $metroOwner /F /T | Out-Null
    Start-Sleep -Seconds 2
  }
}

# Verifica se o AVD ja esta rodando
$runningSerials = @(
  adb devices | Select-Object -Skip 1 |
    ForEach-Object { ($_ -split "\s+")[0].Trim() } |
    Where-Object { $_ -like "emulator-*" }
)

$targetSerial = $null

if ($runningSerials.Count -gt 0) {
  # Tenta encontrar o AVD preferido entre os que ja estao abertos
  foreach ($s in $runningSerials) {
    $avdRunning = ""
    try { $avdRunning = (adb -s $s emu avd name 2>$null | Select-Object -First 1).Trim() } catch {}
    if ($avdRunning -eq $AvdName) {
      $targetSerial = $s
      Write-Host "Emulador '$AvdName' ja esta rodando ($s)." -ForegroundColor Green
      break
    }
  }

  if (-not $targetSerial) {
    # Usa o primeiro emulador disponivel
    $targetSerial = $runningSerials[0]
    Write-Host "Usando emulador ja aberto: $targetSerial" -ForegroundColor Yellow
  }
} else {
  # Inicia o emulador
  Write-Host "Iniciando emulador '$AvdName'..." -ForegroundColor Cyan
  $knownSerials = @()

  Start-Process -FilePath "emulator" -ArgumentList @(
    "-avd", $AvdName,
    "-gpu", "swiftshader_indirect",
    "-no-snapshot-load",
    "-no-snapshot-save",
    "-no-boot-anim"
  )

  $targetSerial = Wait-ForNewEmulatorSerial -KnownSerials $knownSerials
  Write-Host "Emulador detectado: $targetSerial" -ForegroundColor DarkCyan
  Write-Host "Aguardando boot completo..." -ForegroundColor Yellow
  Wait-ForAndroidBoot -Serial $targetSerial
  Write-Host "Boot concluido." -ForegroundColor Green
}

# Configura adb reverse (trick critica: evita bug chunked stream do Metro via NAT QEMU)
Write-Host "Configurando adb reverse..." -ForegroundColor Yellow
adb -s $targetSerial reverse tcp:8081 tcp:8081 | Out-Null
adb -s $targetSerial reverse tcp:8082 tcp:8082 | Out-Null
Write-Host "adb reverse configurado." -ForegroundColor Green

# Define variaveis de ambiente para o Metro usar localhost (nao 10.0.2.2)
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "localhost"
$env:EXPO_PACKAGER_PROXY_URL = "http://localhost:$Port"
$env:ANDROID_SERIAL = $targetSerial

Write-Host ""
Write-Host "Serial   : $targetSerial" -ForegroundColor Green
Write-Host "Metro    : localhost:$Port" -ForegroundColor Green
Write-Host ""

# Inicia Metro em nova janela (nao bloqueia este processo)
Write-Host "Iniciando Metro em nova janela..." -ForegroundColor Cyan
$scriptName = if ($EnvName -eq "local") { "android:local" } else { "android:staging" }

Start-Process -FilePath "powershell.exe" `
  -WorkingDirectory $projectDir `
  -ArgumentList @(
    "-NoExit",
    "-ExecutionPolicy", "Bypass",
    "-Command", "npm run $scriptName"
  )

Write-Host ""
Write-Host "=========================================" -ForegroundColor DarkGreen
Write-Host " Pronto! Pode sair." -ForegroundColor Green
Write-Host " Metro rodando em nova janela." -ForegroundColor Green
Write-Host " Log desta sessao: $logPath" -ForegroundColor DarkGray
Write-Host "=========================================" -ForegroundColor DarkGreen
Write-Host ""

Stop-Transcript | Out-Null
