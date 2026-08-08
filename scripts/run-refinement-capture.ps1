param(
  [Parameter(Mandatory = $true)]
  [string]$ReferenceImage,

  [string]$OutputDir = ".artifacts/refinement",

  [string]$Serial
)

$ErrorActionPreference = "Stop"

$projectDir = Split-Path -Parent $PSScriptRoot
$bundledPython = "C:\Users\thiag\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

if (-not (Test-Path $bundledPython)) {
  throw "Python bundled do Codex nao encontrado em $bundledPython"
}

$resolvedReference = Resolve-Path (Join-Path $projectDir $ReferenceImage) -ErrorAction SilentlyContinue
if (-not $resolvedReference) {
  $resolvedReference = Resolve-Path $ReferenceImage -ErrorAction SilentlyContinue
}

if (-not $resolvedReference) {
  throw "Imagem de referencia nao encontrada: $ReferenceImage"
}

$resolvedOutputDir = Join-Path $projectDir $OutputDir
New-Item -ItemType Directory -Force -Path $resolvedOutputDir | Out-Null

$actualPath = Join-Path $resolvedOutputDir "current.png"
$comparisonDir = Join-Path $resolvedOutputDir "comparison"

$screenshotArgs = @("scripts/take-screenshot.js", $actualPath)
if ($Serial) {
  $screenshotArgs += @("--serial", $Serial)
}

Write-Host "Capturando screenshot do device..." -ForegroundColor Cyan
node @screenshotArgs
if ($LASTEXITCODE -ne 0) {
  throw "Falha ao capturar screenshot via adb."
}

Write-Host "Comparando screenshot com a referencia..." -ForegroundColor Cyan
& $bundledPython "scripts/compare-refinement-images.py" $resolvedReference.Path $actualPath $comparisonDir
if ($LASTEXITCODE -ne 0) {
  throw "Falha ao comparar imagens."
}

Write-Host ""
Write-Host "Pronto." -ForegroundColor Green
Write-Host "Screenshot atual: $actualPath" -ForegroundColor Green
Write-Host "Comparacao: $(Join-Path $comparisonDir 'side-by-side.png')" -ForegroundColor Green
Write-Host "Metricas: $(Join-Path $comparisonDir 'metrics.json')" -ForegroundColor Green
