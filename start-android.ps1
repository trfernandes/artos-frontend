# Start Expo for Android Emulator
# Configures adb reverse and sets the correct local IP

$projectPath = "D:\artos\artos_frontend"

# Get local IP
$ip = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.InterfaceAlias -notmatch "Loopback" -and
        $_.IPAddress -notmatch "^169\." -and
        $_.IPAddress -ne "127.0.0.1" -and
        $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object InterfaceMetric |
    Select-Object -First 1
).IPAddress

Write-Host "IP detectado: $ip" -ForegroundColor Green

# Configure adb reverse so emulator can reach Metro via localhost
Write-Host "Configurando adb reverse..." -ForegroundColor Yellow
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8082 tcp:8082

# Set hostname and start Expo
$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
Set-Location $projectPath

Write-Host "Iniciando Expo com .env.staging... (pressione 'a' para abrir no emulador)" -ForegroundColor Cyan
npx dotenv-cli -e .env.staging -- npx expo start --clear
