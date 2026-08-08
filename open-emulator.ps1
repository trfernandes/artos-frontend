# Open Android Emulator and position the window on screen

$avdName = "Pixel_5_API_34"

# Load Win32 API for window positioning
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class EmulatorWindow {
    [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndAfter, int x, int y, int cx, int cy, int flags);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

# Start emulator in background
Write-Host "Iniciando emulador $avdName..." -ForegroundColor Cyan
Start-Process -FilePath "emulator" -ArgumentList "-avd $avdName -gpu swiftshader_indirect" -WindowStyle Hidden

# Wait for emulator window to appear
Write-Host "Aguardando janela do emulador..." -ForegroundColor Yellow
$hwnd = [IntPtr]::Zero
$timeout = 60
$elapsed = 0

while ($hwnd -eq [IntPtr]::Zero -and $elapsed -lt $timeout) {
    Start-Sleep -Seconds 2
    $elapsed += 2
    $proc = Get-Process | Where-Object { $_.MainWindowTitle -match "Android Emulator" }
    if ($proc) {
        $hwnd = $proc.MainWindowHandle
    }
}

if ($hwnd -eq [IntPtr]::Zero) {
    Write-Host "Timeout: emulador não encontrado." -ForegroundColor Red
    exit 1
}

# Restore and position window: x=100, y=50, width=420, height=860
[EmulatorWindow]::ShowWindow($hwnd, 9) | Out-Null   # SW_RESTORE = 9
Start-Sleep -Milliseconds 500
[EmulatorWindow]::SetWindowPos($hwnd, [IntPtr]::Zero, 100, 50, 420, 860, 0x0040) | Out-Null

Write-Host "Emulador posicionado!" -ForegroundColor Green
