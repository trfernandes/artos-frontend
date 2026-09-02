<#
Mergeia feature terminada na pasta release. Roda de dentro de D:\artos\artos_frontend.
Uso: .\feature-merge.ps1 -Slug "nome-da-feature" [-Next "proxima-feature"]
Sem -Next: dev fica na branch mergeada (trocar de base manualmente antes de commitar).
Com -Next: ja cria feat/<Next> na pasta dev.
Pre-requisito: a feat branch NAO pode estar em checkout na pasta dev
(rode la: git switch --detach origin/master).
#>
param(
    [Parameter(Mandatory = $true)][string]$Slug,
    [string]$Next
)
. "$PSScriptRoot\_common.ps1"

Assert-Cwd -Expected $ReleasePath -Papel "release"

$branch = git branch --show-current
if ($branch -like "feat/*") {
    Write-Host "Pasta release esta em $branch. Regra: release nunca em feat/*." -ForegroundColor Red
    exit 1
}

Assert-Clean -Papel "release"

$featBranch = "feat/$Slug"

$elsewhere = Get-BranchCheckedOutElsewhere -Branch $featBranch
if ($elsewhere) {
    Write-Host "$featBranch esta em checkout em: $elsewhere" -ForegroundColor Red
    Write-Host "git branch -d vai falhar. Naquela pasta rode antes: git switch --detach origin/master" -ForegroundColor Yellow
    exit 1
}

Write-Host "Checkout master..."
git checkout master
if ($LASTEXITCODE -ne 0) { Write-Host "Falha no checkout master." -ForegroundColor Red; exit 1 }

Write-Host "Pull..."
git pull
if ($LASTEXITCODE -ne 0) { Write-Host "Falha no pull." -ForegroundColor Red; exit 1 }

Write-Host "Merge --no-ff $featBranch..."
git merge --no-ff $featBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Merge com conflito ou falha. Resolva manualmente." -ForegroundColor Red
    exit 1
}

Write-Host "Push master..."
git push
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha no push. Merge feito local; resolva antes de apagar a branch." -ForegroundColor Red
    exit 1
}

Write-Host "Apagando $featBranch local..."
git branch -d $featBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao apagar branch local (nao mergeada? em uso?). Branch remota preservada." -ForegroundColor Red
    exit 1
}

Write-Host "Apagando $featBranch remoto..."
git push origin --delete $featBranch
if ($LASTEXITCODE -ne 0) {
    Write-Host "Falha ao apagar branch remota. Manual: git push origin --delete $featBranch" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Merge feito. master atualizada e pushed." -ForegroundColor Green

if ($Next) {
    Write-Host ""
    Write-Host "Preparando feat/$Next na pasta dev..."
    if (-not (Test-Path $DevPath)) {
        Write-Host "Pasta dev nao existe: $DevPath" -ForegroundColor Red
        exit 1
    }
    Push-Location $DevPath
    try {
        $devDirty = git status --porcelain
        if ($devDirty) {
            Write-Host "Pasta dev com working tree sujo. Nao vou trocar de branch la:" -ForegroundColor Red
            git status --short
            exit 1
        }
        git fetch origin
        if ($LASTEXITCODE -ne 0) { Write-Host "git fetch falhou na dev." -ForegroundColor Red; exit 1 }
        git switch -c "feat/$Next" origin/master
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Falha ao criar feat/$Next na dev (ja existe?)." -ForegroundColor Red
            exit 1
        }
        Write-Host "feat/$Next criada em $DevPath." -ForegroundColor Green
    } finally {
        Pop-Location
    }
} else {
    Write-Host ""
    Write-Host "Pasta dev ($DevPath) ainda esta em $featBranch (agora mergeada/apagada)." -ForegroundColor Yellow
    Write-Host "Antes de commitar la: git fetch origin && git switch --detach origin/master"
    Write-Host "Ou direto a proxima: .\feature-start.ps1 -Slug <nome>"
}
