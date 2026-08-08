# prepare-device.ps1
# Deixa o emulador pronto para capturas/testes Maestro com dev build + Metro.
#
# O que faz (idempotente — pode rodar quantas vezes quiser):
#   1. Garante que o Metro está no ar (sobe em background se não estiver)
#   2. Configura adb reverse tcp:8081 (emulador -> Metro via localhost, confiável)
#   3. Abre o bundle no dev client via deep link (localhost, não 10.0.2.2)
#   4. Espera o React Native sinalizar "Running application" no logcat
#
# Uso:
#   cd artos_frontend
#   ./flows/prepare-device.ps1
#   # depois: maestro test flows/<algum-flow>.yaml
#
# Parâmetros opcionais:
#   -Device   serial do adb (default: emulator-5554)
#   -Port     porta do Metro (default: 8081)

param(
    [string]$Device = "emulator-5554",
    [int]$Port = 8081
)

$ErrorActionPreference = "Stop"
$appId = "com.church.artos"
$scheme = "diakonia"
$projectDir = Split-Path $PSScriptRoot -Parent  # artos_frontend

function Test-Metro {
    try {
        $r = Invoke-WebRequest "http://localhost:$Port/status" -TimeoutSec 3 -ErrorAction Stop
        return ($r.Content -match "packager-status:running")
    } catch { return $false }
}

# 1. Metro
if (Test-Metro) {
    Write-Host "[1/4] Metro ja esta rodando em :$Port" -ForegroundColor Green
} else {
    Write-Host "[1/4] Subindo Metro em background..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c npx expo start --port $Port > `"$env:TEMP\metro.log`" 2>&1" `
        -WorkingDirectory $projectDir -WindowStyle Minimized
    $waited = 0
    while (-not (Test-Metro) -and $waited -lt 90) {
        Start-Sleep -Seconds 3; $waited += 3
        Write-Host "      aguardando Metro... ${waited}s"
    }
    if (Test-Metro) { Write-Host "      Metro pronto!" -ForegroundColor Green }
    else { throw "Metro nao subiu em 90s. Veja $env:TEMP\metro.log" }
}

# 2. adb reverse
Write-Host "[2/4] Configurando adb reverse tcp:$Port..." -ForegroundColor Yellow
adb -s $Device reverse "tcp:$Port" "tcp:$Port" | Out-Null
Write-Host "      OK" -ForegroundColor Green

# 3. Deep link para carregar o bundle (localhost, URL-encoded)
# IMPORTANTE: o valor de ?url= PRECISA ser URL-encoded, senao o am start corta
# no primeiro ":" e o DevLauncher cai no modo asset (bundle embutido) -> "Unable to load script".
Write-Host "[3/4] Abrindo bundle no dev client (localhost:$Port)..." -ForegroundColor Yellow
adb -s $Device shell am force-stop $appId
adb -s $Device logcat -c
$metroUrl = [System.Uri]::EscapeDataString("http://localhost:$Port")  # http%3A%2F%2Flocalhost%3A8081
$url = "${scheme}://expo-development-client/?url=$metroUrl"
adb -s $Device shell am start -a android.intent.action.VIEW -d "`"$url`"" | Out-Null

# 4. Esperar o RN sinalizar que carregou
Write-Host "[4/4] Esperando React Native carregar..." -ForegroundColor Yellow
$loaded = $false
$deadline = (Get-Date).AddSeconds(90)
$job = Start-Job -ScriptBlock {
    param($dev)
    & adb -s $dev logcat -v brief -t 9999 ReactNativeJS:* ReactNative:* "*:S" 2>&1
} -ArgumentList $Device

while ((Get-Date) -lt $deadline) {
    Start-Sleep -Seconds 2
    $log = & adb -s $Device logcat -d -v brief 2>&1 | Select-String "Running application|Unable to load script|Could not connect"
    if ($log -match "Running application") { $loaded = $true; break }
    if ($log -match "Unable to load script|Could not connect") {
        Write-Host "      ERRO: bundle nao carregou (Metro inacessivel?)" -ForegroundColor Red
        break
    }
}
Remove-Job $job -Force -ErrorAction SilentlyContinue

if ($loaded) {
    Write-Host "`nPRONTO! App carregado e conectado ao Metro." -ForegroundColor Green
    Write-Host "Agora rode:  maestro test flows/<flow>.yaml" -ForegroundColor Cyan
} else {
    Write-Host "`nApp pode nao ter carregado. Verifique a tela do emulador." -ForegroundColor Yellow
}
