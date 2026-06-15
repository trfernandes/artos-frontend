param(
  [ValidateSet("local", "staging")]
  [string]$EnvName = "staging",
  [ValidateSet("emulator", "device", "any")]
  [string]$TargetMode = "any",
  [switch]$OpenLogcat,
  [string]$PreferredAvdName
)

$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot
$repoDir = Split-Path -Parent $projectDir
$backendDir = Join-Path $repoDir "backend"
$logDir = Join-Path $projectDir "logs"
$logPath = Join-Path $logDir "diakonia-$TargetMode.log"
$transcriptStarted = $false

if (-not (Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}

if (-not ("EmulatorWindow" -as [type])) {
  Add-Type @"
using System;
using System.Runtime.InteropServices;
public class EmulatorWindow {
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndAfter, int x, int y, int cx, int cy, int flags);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@
}

try {
  Start-Transcript -Path $logPath -Force | Out-Null
  $transcriptStarted = $true
} catch {
  Write-Host "Aviso: nao foi possivel iniciar o log em arquivo." -ForegroundColor DarkYellow
}

function Assert-CommandAvailable {
  param(
    [string]$CommandName,
    [string]$HelpText
  )

  if (-not (Get-Command $CommandName -ErrorAction SilentlyContinue)) {
    throw "$CommandName nao foi encontrado. $HelpText"
  }
}

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

function Get-BackendPort {
  $envFiles = @(
    (Join-Path $backendDir ".env.local"),
    (Join-Path $backendDir ".env")
  )

  foreach ($envFile in $envFiles) {
    if (-not (Test-Path $envFile)) { continue }

    $match = Select-String -Path $envFile -Pattern '^APP_PORT=(\d+)$' | Select-Object -First 1
    if ($match) {
      return [int]$match.Matches[0].Groups[1].Value
    }
  }

  return 3000
}

function Test-TcpPortOpen {
  param(
    [int]$Port
  )

  return Test-NetConnection -ComputerName "127.0.0.1" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
}

function Get-ListeningProcessForPort {
  param(
    [int]$Port
  )

  try {
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $connection) {
      return $null
    }

    $process = Get-Process -Id $connection.OwningProcess -ErrorAction SilentlyContinue
    if (-not $process) {
      return $null
    }

    return [PSCustomObject]@{
      Port = $Port
      Id = $process.Id
      Name = $process.ProcessName
      Path = $process.Path
    }
  } catch {
    return $null
  }
}

function Ensure-MetroPortAvailable {
  param(
    [int]$Port = 8081
  )

  $listener = Get-ListeningProcessForPort -Port $Port
  if (-not $listener) {
    return
  }

  if ($listener.Name -in @("node", "node.exe")) {
    Write-Host "Processo Node detectado na porta $Port. Encerrando para liberar o Metro..." -ForegroundColor Yellow
    taskkill /PID $listener.Id /F /T | Out-Null
    Start-Sleep -Seconds 2

    if (Get-ListeningProcessForPort -Port $Port) {
      throw "Nao foi possivel liberar a porta $Port antes de iniciar o Metro."
    }

    return
  }

  throw "A porta $Port esta ocupada pelo processo $($listener.Name) (PID $($listener.Id)). Feche esse processo ou mude a porta manualmente."
}

function Wait-ForTcpPort {
  param(
    [int]$Port,
    [int]$TimeoutSeconds = 90
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    if (Test-TcpPortOpen -Port $Port) {
      return
    }

    Start-Sleep -Seconds 2
  }

  throw "Servico na porta $Port nao respondeu dentro do tempo esperado."
}

function Ensure-BackendRunning {
  param(
    [int]$Port
  )

  if (-not (Test-Path $backendDir)) {
    throw "Pasta do backend nao encontrada em $backendDir"
  }

  if (Test-TcpPortOpen -Port $Port) {
    Write-Host "Backend local ja esta ativo na porta $Port." -ForegroundColor Green
    return
  }

  Write-Host "Iniciando backend local em uma nova janela..." -ForegroundColor Yellow
  Start-Process -FilePath "powershell.exe" `
    -WorkingDirectory $backendDir `
    -ArgumentList @(
      "-NoExit",
      "-ExecutionPolicy", "Bypass",
      "-Command", "npm run start:dev"
    )

  Write-Host "Aguardando backend responder na porta $Port..." -ForegroundColor Yellow
  Wait-ForTcpPort -Port $Port
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

function Get-ConnectedAndroidTargets {
  $targets = @()
  $lines = adb devices -l | Select-Object -Skip 1

  foreach ($rawLine in $lines) {
    $line = $rawLine.Trim()
    if (-not $line) { continue }
    if ($line -notmatch "^(?<serial>\S+)\s+(?<state>\S+)(?<details>.*)$") { continue }

    if ($matches.state -ne "device") { continue }

    $serial = $matches.serial
    $details = $matches.details.Trim()
    $model = ""
    $expoDeviceName = $serial

    if ($details -match "model:(?<model>\S+)") {
      $model = $matches.model.Replace("_", " ")
      $expoDeviceName = $matches.model
    }

    $displayName = if ($serial -like "emulator-*") {
      try {
        $avdName = (adb -s $serial emu avd name 2>$null | Select-Object -First 1).Trim()
        if ($avdName) { "$avdName (Emulador)" } elseif ($model) { "$model (Emulador)" } else { "$serial (Emulador)" }
      } catch {
        if ($model) { "$model (Emulador)" } else { "$serial (Emulador)" }
      }
    } else {
      if ($model) { "$model (USB)" } else { "$serial (USB)" }
    }

    $targets += [PSCustomObject]@{
      Type = if ($serial -like "emulator-*") { "running-emulator" } else { "device" }
      Serial = $serial
      Name = $displayName
      DeviceArgument = if ($serial -like "emulator-*") { $serial } else { $expoDeviceName }
    }
  }

  return $targets
}

function Get-StoppedEmulators {
  $runningNames = @(
    Get-ConnectedAndroidTargets |
      Where-Object { $_.Type -eq "running-emulator" } |
      ForEach-Object {
        try {
          (adb -s $_.Serial emu avd name 2>$null | Select-Object -First 1).Trim()
        } catch {
          $null
        }
      } |
      Where-Object { $_ }
  )

  $allAvds = @(emulator -list-avds | Where-Object { $_.Trim() })
  return @($allAvds | Where-Object { $_ -notin $runningNames })
}

function Wait-ForNewEmulatorSerial {
  param(
    [string[]]$KnownSerials,
    [int]$TimeoutSeconds = 120
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2

    $currentSerials = @(
      adb devices |
        Select-Object -Skip 1 |
        ForEach-Object { ($_ -split "\s+")[0].Trim() } |
        Where-Object { $_ }
    )

    $newSerial = $currentSerials | Where-Object { $_ -like "emulator-*" -and $_ -notin $KnownSerials } | Select-Object -First 1
    if ($newSerial) {
      return $newSerial
    }
  }

  throw "O emulador foi iniciado, mas nao apareceu no adb dentro do tempo esperado."
}

function Move-EmulatorWindowToVisibleArea {
  param(
    [string]$AvdName,
    [int]$TimeoutSeconds = 60
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $hwnd = [IntPtr]::Zero

  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2

    $processes = Get-Process | Where-Object {
      $_.MainWindowHandle -ne 0 -and (
        $_.MainWindowTitle -match "Android Emulator" -or
        ($AvdName -and $_.MainWindowTitle -match [regex]::Escape($AvdName))
      )
    }

    $process = $processes | Select-Object -First 1
    if ($process) {
      $hwnd = $process.MainWindowHandle
      break
    }
  }

  if ($hwnd -eq [IntPtr]::Zero) {
    Write-Host "Aviso: janela do emulador nao encontrada para reposicionamento." -ForegroundColor DarkYellow
    return
  }

  [EmulatorWindow]::ShowWindow($hwnd, 9) | Out-Null
  Start-Sleep -Milliseconds 400
  [EmulatorWindow]::SetWindowPos($hwnd, [IntPtr]::Zero, 100, 50, 420, 860, 0x0040) | Out-Null
  Write-Host "Janela do emulador reposicionada para area visivel." -ForegroundColor Green
}

function Get-AdbDeviceState {
  param(
    [string]$Serial
  )

  $deviceLine = adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "^$([regex]::Escape($Serial))\s+" } | Select-Object -First 1
  if (-not $deviceLine) {
    return $null
  }

  $parts = ($deviceLine -split "\s+") | Where-Object { $_ }
  if ($parts.Count -lt 2) {
    return $null
  }

  return $parts[1].Trim()
}

function Wait-ForAndroidBoot {
  param(
    [string]$Serial,
    [int]$TimeoutSeconds = 180
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $lastState = $null

  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 3

    $state = Get-AdbDeviceState -Serial $Serial
    if ($state -ne $lastState -and $state) {
      Write-Host "Estado adb do emulador: $state" -ForegroundColor DarkYellow
      $lastState = $state
    }

    if ($state -ne "device") {
      continue
    }

    $bootCompleted = ""
    try {
      $bootCompleted = (adb -s $Serial shell getprop sys.boot_completed 2>$null | Select-Object -First 1).Trim()
    } catch {
      continue
    }

    if ($bootCompleted -eq "1") {
      return
    }
  }

  throw "O Android nao terminou de iniciar dentro do tempo esperado."
}

function Configure-AdbReverse {
  param(
    [string]$Serial,
    [int]$BackendPort
  )

  adb -s $Serial reverse tcp:8081 tcp:8081 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao configurar adb reverse para a porta 8081."
  }

  adb -s $Serial reverse tcp:8082 tcp:8082 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao configurar adb reverse para a porta 8082."
  }

  if ($EnvName -eq "local") {
    adb -s $Serial reverse tcp:$BackendPort tcp:$BackendPort | Out-Null
    if ($LASTEXITCODE -ne 0) {
      throw "Falha ao configurar adb reverse para o backend local."
    }
  }
}

function Configure-MetroAccess {
  param(
    [pscustomobject]$Target,
    [int]$BackendPort
  )

  if ($Target.Type -eq "running-emulator") {
    Write-Host "Configurando adb reverse para o emulador..." -ForegroundColor Yellow
    Configure-AdbReverse -Serial $Target.Serial -BackendPort $BackendPort
    return "10.0.2.2"
  }

  if ($Target.Type -eq "device") {
    Write-Host "Configurando adb reverse para o celular..." -ForegroundColor Yellow
    Configure-AdbReverse -Serial $Target.Serial -BackendPort $BackendPort
  }

  return Get-LocalIPv4
}

function Set-MetroEnvironment {
  param(
    [string]$MetroHost,
    [int]$Port
  )

  $env:REACT_NATIVE_PACKAGER_HOSTNAME = $MetroHost
  $env:EXPO_PACKAGER_PROXY_URL = "http://$MetroHost`:$Port"
  [System.Environment]::SetEnvironmentVariable("REACT_NATIVE_PACKAGER_HOSTNAME", $MetroHost, "Process")
  [System.Environment]::SetEnvironmentVariable("EXPO_PACKAGER_PROXY_URL", "http://$MetroHost`:$Port", "Process")
}


function Set-FrontendEnvironment {
  param(
    [pscustomobject]$Target,
    [string]$MetroHost,
    [int]$BackendPort
  )

  $envFileName = if ($EnvName -eq "local") { ".env.local" } else { ".env.staging" }
  $envFilePath = Join-Path $projectDir $envFileName
  Import-EnvFile -FilePath $envFilePath

  if ($EnvName -eq "local") {
    $apiHost = if ($Target.Type -eq "running-emulator") { "127.0.0.1" } else { $MetroHost }
    $env:EXPO_PUBLIC_API_URL = "http://$apiHost`:$BackendPort"
  }
}

function Start-AndroidApp {
  param(
    [pscustomobject]$Target
  )

  $scriptName = if ($EnvName -eq "local") { "android:local" } else { "android:staging" }
  $targetLabel = if ($Target.Type -eq "device") { "celular" } else { "emulador" }

  Write-Host "Iniciando app no $targetLabel com npm run $scriptName..." -ForegroundColor Cyan
  npm run $scriptName
}

function Start-LogcatWindow {
  param(
    [pscustomobject]$Target
  )

  $captureScript = Join-Path $PSScriptRoot "capture-android-logcat.ps1"
  if (-not (Test-Path $captureScript)) {
    Write-Host "Aviso: script de logcat nao encontrado em $captureScript" -ForegroundColor DarkYellow
    return
  }

  Write-Host "Abrindo janela de logcat para $($Target.Serial)..." -ForegroundColor DarkCyan
  Start-Process -FilePath "powershell.exe" `
    -WorkingDirectory $projectDir `
    -ArgumentList @(
      "-NoExit",
      "-ExecutionPolicy", "Bypass",
      "-File", $captureScript,
      "-Serial", $Target.Serial
    )
}

function Select-Target {
  $connected = @(Get-ConnectedAndroidTargets)
  $runningEmulators = @($connected | Where-Object { $_.Type -eq "running-emulator" })
  $usbDevices = @($connected | Where-Object { $_.Type -eq "device" })
  $stoppedEmulators = @(Get-StoppedEmulators)
  $availableOptions = @()
  $options = @()
  $index = 1
  $title = switch ($TargetMode) {
    "emulator" { "Diakonia no Emulador" }
    "device" { "Diakonia no Celular" }
    default { "Diakonia Android" }
  }
  $selectionLabel = switch ($TargetMode) {
    "emulator" { "emulador" }
    "device" { "celular" }
    default { "device/emulador" }
  }

  Write-Host ""
  Write-Host "=====================================" -ForegroundColor DarkCyan
  Write-Host " $title" -ForegroundColor Cyan
  Write-Host "=====================================" -ForegroundColor DarkCyan
  Write-Host ""
  Write-Host "Ambiente selecionado: $EnvName" -ForegroundColor DarkCyan
  Write-Host "Procurando devices Android e emuladores..." -ForegroundColor DarkCyan
  Write-Host ""

  switch ($TargetMode) {
    "emulator" {
      $availableOptions += @($runningEmulators | ForEach-Object {
        [PSCustomObject]@{
          Kind = "connected"
          Target = $_
        }
      })
      $availableOptions += @($stoppedEmulators | ForEach-Object {
        [PSCustomObject]@{
          Kind = "avd"
          Target = $_
        }
      })
    }
    "device" {
      $availableOptions += @($usbDevices | ForEach-Object {
        [PSCustomObject]@{
          Kind = "connected"
          Target = $_
        }
      })
    }
    default {
      $availableOptions += @($runningEmulators | ForEach-Object {
        [PSCustomObject]@{
          Kind = "connected"
          Target = $_
        }
      })
      $availableOptions += @($usbDevices | ForEach-Object {
        [PSCustomObject]@{
          Kind = "connected"
          Target = $_
        }
      })
      $availableOptions += @($stoppedEmulators | ForEach-Object {
        [PSCustomObject]@{
          Kind = "avd"
          Target = $_
        }
      })
    }
  }

  if ($TargetMode -eq "emulator" -and $PreferredAvdName) {
    $preferredRunning = $runningEmulators | Where-Object {
      $_.Name -like "$PreferredAvdName*" -or $_.DeviceArgument -eq $PreferredAvdName
    } | Select-Object -First 1

    if ($preferredRunning) {
      Write-Host "Usando emulador preferido ja aberto: $($preferredRunning.Name)" -ForegroundColor Green
      return [PSCustomObject]@{
        Index = 1
        Kind = "connected"
        Target = $preferredRunning
      }
    }

    $preferredStopped = $stoppedEmulators | Where-Object { $_ -eq $PreferredAvdName } | Select-Object -First 1
    if ($preferredStopped) {
      Write-Host "Abrindo emulador preferido automaticamente: $preferredStopped" -ForegroundColor Green
      return [PSCustomObject]@{
        Index = 1
        Kind = "avd"
        Target = $preferredStopped
      }
    }
  }

  if ($availableOptions.Count -eq 1 -and $availableOptions[0].Kind -eq "connected") {
    Write-Host "Destino encontrado. Usando automaticamente: $($availableOptions[0].Target.Name)" -ForegroundColor Green
    return [PSCustomObject]@{
      Index = 1
      Kind = "connected"
      Target = $availableOptions[0].Target
    }
  }

  if ($availableOptions.Count -eq 1 -and $availableOptions[0].Kind -eq "avd") {
    Write-Host "Um emulador disponivel. Abrindo automaticamente: $($availableOptions[0].Target)" -ForegroundColor Green
    return [PSCustomObject]@{
      Index = 1
      Kind = "avd"
      Target = $availableOptions[0].Target
    }
  }

  if ($TargetMode -eq "emulator" -and $runningEmulators.Count -eq 1 -and $stoppedEmulators.Count -eq 0) {
    Write-Host "Um emulador aberto foi encontrado. Usando automaticamente: $($runningEmulators[0].Name)" -ForegroundColor Green
    return [PSCustomObject]@{
      Index = 1
      Kind = "connected"
      Target = $runningEmulators[0]
    }
  }

  if ($TargetMode -eq "emulator" -and $runningEmulators.Count -eq 0 -and $stoppedEmulators.Count -eq 1) {
    Write-Host "Um emulador disponivel. Abrindo automaticamente: $($stoppedEmulators[0])" -ForegroundColor Green
    return [PSCustomObject]@{
      Index = 1
      Kind = "avd"
      Target = $stoppedEmulators[0]
    }
  }

  if (($TargetMode -eq "emulator" -or $TargetMode -eq "any") -and $runningEmulators.Count -gt 0) {
    Write-Host "Emuladores ja abertos:" -ForegroundColor Yellow
    foreach ($target in $runningEmulators) {
      Write-Host " [$index] $($target.Name)" -ForegroundColor Green
      $options += [PSCustomObject]@{
        Index = $index
        Kind = "connected"
        Target = $target
      }
      $index++
    }
    Write-Host ""
  }

  if (($TargetMode -eq "device" -or $TargetMode -eq "any") -and $usbDevices.Count -gt 0) {
    Write-Host "Celulares USB conectados:" -ForegroundColor Yellow
    foreach ($target in $usbDevices) {
      Write-Host " [$index] $($target.Name)" -ForegroundColor Green
      $options += [PSCustomObject]@{
        Index = $index
        Kind = "connected"
        Target = $target
      }
      $index++
    }
    Write-Host ""
  } elseif ($usbDevices.Count -gt 0) {
    Write-Host "Dispositivos USB conectados foram ignorados neste atalho." -ForegroundColor DarkYellow
    Write-Host ""
  }

  if (($TargetMode -eq "emulator" -or $TargetMode -eq "any") -and $stoppedEmulators.Count -gt 0) {
    Write-Host "Emuladores disponiveis para abrir:" -ForegroundColor Yellow
    foreach ($avd in $stoppedEmulators) {
      Write-Host " [$index] $avd" -ForegroundColor Magenta
      $options += [PSCustomObject]@{
        Index = $index
        Kind = "avd"
        Target = $avd
      }
      $index++
    }
    Write-Host ""
  }

  if ($options.Count -eq 0) {
    $missingMessage = switch ($TargetMode) {
      "emulator" { "Nenhum emulador aberto ou configurado foi encontrado." }
      "device" { "Nenhum celular Android conectado por USB foi encontrado." }
      default { "Nenhum device Android ou emulador configurado foi encontrado." }
    }
    throw $missingMessage
  }

  do {
    $choice = Read-Host "Escolha o numero do $selectionLabel"
    $choiceNumber = 0
    $isValidNumber = [int]::TryParse($choice, [ref]$choiceNumber)
    $selected = if ($isValidNumber) {
      $options | Where-Object { $_.Index -eq $choiceNumber } | Select-Object -First 1
    } else {
      $null
    }
  } while (-not $selected)

  return $selected
}

function Start-SelectedEmulator {
  param(
    [string]$AvdName
  )

  Write-Host ""
  Write-Host "Abrindo emulador $AvdName..." -ForegroundColor Cyan
  $knownSerials = @(Get-ConnectedAndroidTargets | ForEach-Object { $_.Serial })

  Start-Process -FilePath "emulator" -ArgumentList @(
    "-avd", $AvdName,
    "-gpu", "swiftshader_indirect",
    "-no-snapshot-load",
    "-no-snapshot-save",
    "-no-boot-anim"
  )

  $serial = Wait-ForNewEmulatorSerial -KnownSerials $knownSerials
  Write-Host "Emulador detectado: $serial" -ForegroundColor DarkCyan
  Write-Host "Aguardando boot completo do Android..." -ForegroundColor Yellow
  Wait-ForAndroidBoot -Serial $serial
  Move-EmulatorWindowToVisibleArea -AvdName $AvdName

  return [PSCustomObject]@{
    Type = "running-emulator"
    Serial = $serial
    Name = "$AvdName (Emulador)"
    DeviceArgument = $serial
  }
}

Set-Location $projectDir

if (-not (Test-Path "node_modules")) {
  Write-Host "Instalando dependencias..." -ForegroundColor Yellow
  npm install
  if ($LASTEXITCODE -ne 0) { throw "Falha no npm install." }
}

Assert-CommandAvailable -CommandName "adb" -HelpText "Abra o Android SDK Platform-Tools ou adicione o adb ao PATH."
Assert-CommandAvailable -CommandName "emulator" -HelpText "Abra o Android SDK Emulator ou adicione o emulator ao PATH."

$backendPort = if ($EnvName -eq "local") { Get-BackendPort } else { 3000 }
$port = 8081
Ensure-MetroPortAvailable -Port $port
if ($EnvName -eq "local") {
  Ensure-BackendRunning -Port $backendPort
}

$selectedOption = Select-Target

$target = if ($selectedOption.Kind -eq "connected") {
  $selectedOption.Target
} else {
  Start-SelectedEmulator -AvdName $selectedOption.Target
}

$ip = Configure-MetroAccess -Target $target -BackendPort $backendPort
Set-MetroEnvironment -MetroHost $ip -Port $port
$env:ANDROID_SERIAL = $target.Serial
Set-FrontendEnvironment -Target $target -MetroHost $ip -BackendPort $backendPort

Write-Host ""
Write-Host "Destino: $($target.Name)" -ForegroundColor Green
Write-Host "Serial adb: $($target.Serial)" -ForegroundColor Green
Write-Host "Host Metro: $ip" -ForegroundColor Green
Write-Host "REACT_NATIVE_PACKAGER_HOSTNAME: $($env:REACT_NATIVE_PACKAGER_HOSTNAME)" -ForegroundColor Green
Write-Host "Ambiente: $EnvName" -ForegroundColor Green
if ($EnvName -eq "local") {
  Write-Host "API local: $($env:EXPO_PUBLIC_API_URL)" -ForegroundColor Green
}
Write-Host ""

if ($OpenLogcat) {
  Start-LogcatWindow -Target $target
}

try {
  Start-AndroidApp -Target $target

  if ($LASTEXITCODE -ne 0) {
    throw "Falha ao abrir o app Android no destino escolhido."
  }
} finally {
  if ($transcriptStarted) {
    Stop-Transcript | Out-Null
  }
}
