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

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
Write-Host "  IP: $ip" -ForegroundColor Green

Set-Location "D:\Development Projects\artos\artos_frontend"
npx expo start --clear