$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public static class IconReleaser {
  [DllImport("user32.dll", CharSet = CharSet.Auto)]
  public static extern bool DestroyIcon(IntPtr handle);
}
"@

$projectDir = Split-Path -Parent $PSScriptRoot
$iconDir = Join-Path $projectDir "shortcut-icons"

if (-not (Test-Path $iconDir)) {
  New-Item -ItemType Directory -Path $iconDir | Out-Null
}

function Save-IconFromBitmap {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$OutputPath
  )

  $iconHandle = $Bitmap.GetHicon()
  try {
    $icon = [System.Drawing.Icon]::FromHandle($iconHandle)
    $fileStream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::Create)
    try {
      $icon.Save($fileStream)
    } finally {
      $fileStream.Close()
      $icon.Dispose()
    }
  } finally {
    [IconReleaser]::DestroyIcon($iconHandle) | Out-Null
    $Bitmap.Dispose()
  }
}

function New-RoundedRectanglePath {
  param(
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height,
    [int]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRectangle {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Brush]$Brush,
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height,
    [int]$Radius
  )

  $path = New-RoundedRectanglePath -X $X -Y $Y -Width $Width -Height $Height -Radius $Radius
  try {
    $Graphics.FillPath($Brush, $path)
  } finally {
    $path.Dispose()
  }
}

function New-Canvas {
  $bitmap = New-Object System.Drawing.Bitmap 256, 256
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)
  return [PSCustomObject]@{
    Bitmap = $bitmap
    Graphics = $graphics
  }
}

function Build-EmulatorIcon {
  param(
    [string]$OutputPath
  )

  $canvas = New-Canvas
  $g = $canvas.Graphics

  try {
    $greenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 22, 163, 74))
    $darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $lightBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 147, 197, 253))
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $accentBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 34, 197, 94))

    $g.FillEllipse($greenBrush, 18, 18, 220, 220)
    Fill-RoundedRectangle -Graphics $g -Brush $darkBrush -X 46 -Y 56 -Width 164 -Height 108 -Radius 18
    Fill-RoundedRectangle -Graphics $g -Brush $lightBrush -X 58 -Y 68 -Width 140 -Height 84 -Radius 12
    $g.FillRectangle($darkBrush, 106, 164, 44, 16)
    Fill-RoundedRectangle -Graphics $g -Brush $darkBrush -X 82 -Y 180 -Width 92 -Height 18 -Radius 8
    Fill-RoundedRectangle -Graphics $g -Brush $whiteBrush -X 146 -Y 110 -Width 56 -Height 98 -Radius 18
    Fill-RoundedRectangle -Graphics $g -Brush $accentBrush -X 154 -Y 122 -Width 40 -Height 74 -Radius 12
    $g.FillEllipse($darkBrush, 170, 127, 8, 8)

    $greenBrush.Dispose()
    $darkBrush.Dispose()
    $lightBrush.Dispose()
    $whiteBrush.Dispose()
    $accentBrush.Dispose()
  } finally {
    $g.Dispose()
  }

  Save-IconFromBitmap -Bitmap $canvas.Bitmap -OutputPath $OutputPath
}

function Build-PhoneIcon {
  param(
    [string]$OutputPath
  )

  $canvas = New-Canvas
  $g = $canvas.Graphics

  try {
    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 2, 132, 199))
    $darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $screenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 224, 242, 254))
    $greenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 34, 197, 94))
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
    $orangeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 249, 115, 22))

    $g.FillEllipse($blueBrush, 18, 18, 220, 220)
    Fill-RoundedRectangle -Graphics $g -Brush $darkBrush -X 74 -Y 38 -Width 108 -Height 180 -Radius 28
    Fill-RoundedRectangle -Graphics $g -Brush $screenBrush -X 84 -Y 56 -Width 88 -Height 138 -Radius 18
    $g.FillRectangle($greenBrush, 94, 72, 68, 84)
    $g.FillEllipse($whiteBrush, 122, 170, 12, 12)
    $g.FillRectangle($whiteBrush, 114, 84, 28, 8)
    $g.FillRectangle($whiteBrush, 114, 110, 28, 8)
    $g.FillRectangle($whiteBrush, 114, 136, 28, 8)
    Fill-RoundedRectangle -Graphics $g -Brush $orangeBrush -X 144 -Y 156 -Width 54 -Height 36 -Radius 12
    $g.FillEllipse($whiteBrush, 154, 166, 8, 8)
    $g.FillRectangle($whiteBrush, 166, 168, 18, 4)

    $blueBrush.Dispose()
    $darkBrush.Dispose()
    $screenBrush.Dispose()
    $greenBrush.Dispose()
    $whiteBrush.Dispose()
    $orangeBrush.Dispose()
  } finally {
    $g.Dispose()
  }

  Save-IconFromBitmap -Bitmap $canvas.Bitmap -OutputPath $OutputPath
}

Build-EmulatorIcon -OutputPath (Join-Path $iconDir "diakonia-emulator.ico")
Build-PhoneIcon -OutputPath (Join-Path $iconDir "diakonia-device.ico")

Write-Host "Icones gerados em $iconDir" -ForegroundColor Green
