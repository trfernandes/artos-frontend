param(
  [switch]$FailOnLegacy
)

$targets = @('app', 'components', 'contexts', 'hooks')

$legacyPaletteImports = rg -n "import \{ Pallete \} from" $targets 2>$null
$hardcodedNeutralColors = rg -n '(#FFFFFF|#FFF|#fff|backgroundColor:\s*''white''|backgroundColor:\s*"white")' $targets 2>$null

$legacyCount = if ($legacyPaletteImports) { ($legacyPaletteImports | Measure-Object).Count } else { 0 }
$hardcodedCount = if ($hardcodedNeutralColors) { ($hardcodedNeutralColors | Measure-Object).Count } else { 0 }

Write-Output "Theme adoption report"
Write-Output " - Legacy Pallete imports: $legacyCount"
Write-Output " - Hardcoded neutral colors: $hardcodedCount"

if ($legacyPaletteImports) {
  Write-Output ""
  Write-Output "Legacy Pallete imports:"
  $legacyPaletteImports | Select-Object -First 100 | ForEach-Object { Write-Output "  $_" }
}

if ($hardcodedNeutralColors) {
  Write-Output ""
  Write-Output "Hardcoded neutral colors:"
  $hardcodedNeutralColors | Select-Object -First 100 | ForEach-Object { Write-Output "  $_" }
}

if ($FailOnLegacy -and ($legacyCount -gt 0 -or $hardcodedCount -gt 0)) {
  Write-Error "Theme adoption check failed."
  exit 1
}

exit 0
