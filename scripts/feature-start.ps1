<#
Inicia feature nova na pasta dev. Roda de dentro de D:\artos\artos_frontend_dev.
Uso: .\feature-start.ps1 -Slug "nome-da-feature"
#>
param(
    [Parameter(Mandatory = $true)][string]$Slug
)
. "$PSScriptRoot\_common.ps1"

Assert-Cwd -Expected $DevPath -Papel "dev"

$branch = git branch --show-current
if ($branch -eq "master") {
    Write-Host "Pasta dev esta em master (regra: dev nunca master)." -ForegroundColor Red
    exit 1
}

Assert-Clean -Papel "dev"

Write-Host "Fetch origin..."
git fetch origin
if ($LASTEXITCODE -ne 0) {
    Write-Host "git fetch falhou. Sem rede? Abortando pra nao ramificar de base velha." -ForegroundColor Red
    exit 1
}

$featBranch = "feat/$Slug"
Write-Host "Criando $featBranch a partir de origin/master..."
git switch -c $featBranch origin/master
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao criar branch. Ela ja existe?" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "OK. $featBranch criada em $DevPath." -ForegroundColor Green
Write-Host "Se package.json/package-lock.json mudou desde o ultimo uso: rode npm install."
