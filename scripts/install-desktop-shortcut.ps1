$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot
$desktopDir = [Environment]::GetFolderPath("Desktop")

$iconBuilderPath = Join-Path $PSScriptRoot "build-shortcut-icons.ps1"
if (Test-Path $iconBuilderPath) {
  & $iconBuilderPath
}

function Install-Shortcut {
  param(
    [string]$ShortcutName,
    [string]$TargetName,
    [string]$Description,
    [string]$IconName
  )

  $shortcutPath = Join-Path $desktopDir $ShortcutName
  $targetPath = Join-Path $projectDir $TargetName
  $iconPath = Join-Path $projectDir ("shortcut-icons\" + $IconName)

  if (-not (Test-Path $targetPath)) {
    throw "Launcher nao encontrado em $targetPath"
  }

  $shell = New-Object -ComObject WScript.Shell
  $shortcut = $shell.CreateShortcut($shortcutPath)
  $shortcut.TargetPath = $targetPath
  $shortcut.WorkingDirectory = $projectDir
  $shortcut.WindowStyle = 1
  $shortcut.Description = $Description

  if (Test-Path $iconPath) {
    $shortcut.IconLocation = $iconPath
  }

  $shortcut.Save()
  Write-Host "Atalho criado em: $shortcutPath" -ForegroundColor Green
}

if (Test-Path (Join-Path $desktopDir "Artos Mobile - Android.lnk")) {
  Remove-Item (Join-Path $desktopDir "Artos Mobile - Android.lnk") -Force
}

Install-Shortcut `
  -ShortcutName "Diakonia no Emulador.lnk" `
  -TargetName "Diakonia no Emulador.cmd" `
  -Description "Abre o Diakonia no emulador Android usando o backend remoto." `
  -IconName "diakonia-emulator.ico"

Install-Shortcut `
  -ShortcutName "Diakonia no Celular.lnk" `
  -TargetName "Diakonia no Celular.cmd" `
  -Description "Abre o Diakonia no celular Android conectado por USB usando o backend remoto." `
  -IconName "diakonia-device.ico"

Install-Shortcut `
  -ShortcutName "Diakonia Android Debug.lnk" `
  -TargetName "Diakonia Android Debug.cmd" `
  -Description "Abre o Diakonia no emulador preferido com logcat automatico para capturar crashes." `
  -IconName "diakonia-emulator.ico"
