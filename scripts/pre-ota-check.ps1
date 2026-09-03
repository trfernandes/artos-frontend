<#
Checagem obrigatoria antes de eas update / eas build / eas submit.
Roda de dentro de D:\artos\artos_frontend (pasta release).
#>
. "$PSScriptRoot\_common.ps1"

Assert-Cwd -Expected $ReleasePath -Papel "release"

$branch = git branch --show-current
Write-Host "Branch: $branch"

if ($branch -ne "master" -and $branch -notlike "hotfix/*") {
    Write-Host "BLOQUEADO: pasta release em '$branch'. OTA/build so a partir de master ou hotfix/*." -ForegroundColor Red
    exit 1
}

$dirty = git status --porcelain
if ($dirty) {
    Write-Host "BLOQUEADO: working tree sujo. eas update/build publica o disco, nao a branch." -ForegroundColor Red
    git status --short
    exit 1
}

$ahead = git rev-list --count "origin/$branch..$branch" 2>$null
if ($LASTEXITCODE -eq 0 -and $ahead -gt 0) {
    Write-Host "Aviso: $ahead commit(s) local nao pushed. OTA publica o disco mesmo assim; push antes evita divergencia." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "OK pra OTA/build. Branch $branch, tree limpo." -ForegroundColor Green
