param(
  [ValidateSet("local", "staging")]
  [string]$EnvName = "staging",
  [int]$Port = 8081,
  [switch]$ClearCache
)

$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot

function Import-EnvFile {
  param(
    [string]$FilePath
  )

  if (-not (Test-Path $FilePath)) {
    throw "Arquivo de ambiente nao encontrado em $FilePath"
  }

  foreach ($rawLine in Get-Content $FilePath) {
    $line = $rawLine.Trim()
    if (-not $line -or $line.StartsWith("#")) { continue }

    $separatorIndex = $line.IndexOf("=")
    if ($separatorIndex -lt 1) { continue }

    $key = $line.Substring(0, $separatorIndex).Trim()
    $value = $line.Substring($separatorIndex + 1).Trim()

    if (
      ($value.StartsWith('"') -and $value.EndsWith('"')) -or
      ($value.StartsWith("'") -and $value.EndsWith("'"))
    ) {
      $value = $value.Substring(1, $value.Length - 2)
    }

    Set-Item -Path "Env:$key" -Value $value
  }
}

function Get-LocalIPv4 {
  $wifiPattern = 'Wi-?Fi|WLAN|Wireless|802\.11'

  $wifiIp = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      $_.IPAddress -notlike "169.254*" -and
      $_.IPAddress -ne "127.0.0.1" -and
      $_.InterfaceAlias -match $wifiPattern
    } |
    Sort-Object SkipAsSource, InterfaceMetric |
    Select-Object -First 1 -ExpandProperty IPAddress

  if ($wifiIp) {
    return $wifiIp
  }

  $ip = $null

  try {
    $udp = New-Object System.Net.Sockets.UdpClient
    $udp.Connect("8.8.8.8", 53)
    $ip = ($udp.Client.LocalEndPoint).Address.IPAddressToString
    $udp.Close()
  } catch {}

  if (-not $ip) {
    $ip = Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object {
        $_.IPAddress -notlike "169.254*" -and
        $_.IPAddress -ne "127.0.0.1" -and
        $_.InterfaceAlias -notmatch "Loopback|vEthernet|WSL|Virtual|Hyper-V|Bluetooth"
      } |
      Sort-Object SkipAsSource, InterfaceMetric |
      Select-Object -First 1 -ExpandProperty IPAddress
  }

  if (-not $ip) {
    throw "Nao foi possivel detectar IPv4 local."
  }

  return $ip
}

function Get-ListeningProcessForPort {
  param([int]$LocalPort)

  try {
    $connection = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop |
      Select-Object -First 1

    if (-not $connection) { return $null }

    $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
    if (-not $process) { return $null }

    return [PSCustomObject]@{
      Id = $process.Id
      Name = $process.ProcessName
      Port = $LocalPort
    }
  } catch {
    return $null
  }
}

function Ensure-MetroPortAvailable {
  param([int]$LocalPort)

  $listener = Get-ListeningProcessForPort -LocalPort $LocalPort
  if (-not $listener) { return }

  if ($listener.Name -in @("node", "node.exe")) {
    Write-Host "Processo Node detectado na porta $LocalPort. Encerrando para liberar o Metro..." -ForegroundColor Yellow
    taskkill /PID $listener.Id /F /T | Out-Null
    Start-Sleep -Seconds 2
    return
  }

  throw "A porta $LocalPort esta ocupada por $($listener.Name) (PID $($listener.Id))."
}

Set-Location $projectDir

$envFile = Join-Path $projectDir ".env.$EnvName"
Import-EnvFile -FilePath $envFile

$ip = Get-LocalIPv4
Ensure-MetroPortAvailable -LocalPort $Port

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip

$args = @(
  "expo",
  "start",
  "--dev-client",
  "--host", "lan",
  "--port", "$Port"
)

if ($ClearCache) {
  $args += "--clear"
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor DarkCyan
Write-Host " Diakonia no Celular (Wi-Fi)" -ForegroundColor Cyan
Write-Host " Ambiente: $EnvName" -ForegroundColor Cyan
Write-Host " IP do computador: $ip" -ForegroundColor Cyan
Write-Host " Porta Metro: $Port" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor DarkCyan
Write-Host ""
Write-Host "Para abrir no celular:" -ForegroundColor Green
Write-Host "1. Confirme que o celular e este computador estao na mesma rede Wi-Fi." -ForegroundColor Green
Write-Host "2. Escaneie o QR code no Dev Client do app." -ForegroundColor Green
Write-Host "3. Se nao abrir, teste no navegador do celular: http://$ip`:$Port" -ForegroundColor Green
Write-Host ""
Write-Host "Encerrar Metro: Ctrl + C" -ForegroundColor DarkYellow
Write-Host ""

npx @args

if ($LASTEXITCODE -ne 0) {
  throw "Falha ao iniciar o Expo em modo LAN para celular."
}
