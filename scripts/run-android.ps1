param(
  [ValidateSet("local", "staging")]
  [string]$EnvName = "staging"
)

$ErrorActionPreference = "Stop"
$projectDir = "D:\artos\artos_frontend"

Set-Location $projectDir

# Detecta IP local ativo (sem hardcode)
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
      $_.InterfaceAlias -notmatch "Loopback|vEthernet|WSL|Virtual|Hyper-V"
    } |
    Select-Object -First 1 -ExpandProperty IPAddress
}

if (-not $ip) { throw "Nao foi possivel detectar IPv4 local." }

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip

Write-Host ""
Write-Host "====================================="
Write-Host " Artos Android ($EnvName)"
Write-Host " Hostname Metro: $ip"
Write-Host "====================================="
Write-Host "Reload no app: tecla R nesta janela"
Write-Host "Encerrar: Ctrl + C"
Write-Host ""

if (-not (Test-Path "node_modules")) {
  npm install
  if ($LASTEXITCODE -ne 0) { throw "Falha no npm install." }
}

# Build/instala no Android fisico
if ($EnvName -eq "local") {
  npm run android:local
} else {
  npm run android:staging
}

if ($LASTEXITCODE -ne 0) { throw "Falha ao executar android:$EnvName" }
