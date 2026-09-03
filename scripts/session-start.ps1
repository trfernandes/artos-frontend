<#
Ritual de inicio de sessao: reporta estado das duas worktrees do frontend.
Roda de qualquer lugar dentro do repo (release ou dev).
#>
. "$PSScriptRoot\_common.ps1"

if (-not (Test-Path $ReleasePath)) {
    Write-Host "Pasta release nao existe: $ReleasePath" -ForegroundColor Red
    exit 1
}

Push-Location $ReleasePath
Write-Host "=== worktrees ===" -ForegroundColor Cyan
git worktree list
Pop-Location

foreach ($pair in @(
    @{ Path = $ReleasePath; Papel = "release" },
    @{ Path = $DevPath;     Papel = "dev" }
)) {
    Write-Host ""
    Write-Host "=== $($pair.Papel): $($pair.Path) ===" -ForegroundColor Cyan
    if (-not (Test-Path $pair.Path)) {
        Write-Host "Pasta nao existe (ok se a dev ainda nao foi criada)." -ForegroundColor Yellow
        continue
    }
    Push-Location $pair.Path
    try {
        $branch = git branch --show-current
        if (-not $branch) {
            Write-Host "Branch: (detached HEAD)" -ForegroundColor Yellow
        } else {
            Write-Host "Branch: $branch"
        }

        if ($pair.Papel -eq "release" -and $branch -like "feat/*") {
            Write-Host "AVISO: release em feat/* - nao deveria." -ForegroundColor Red
        }
        if ($pair.Papel -eq "dev" -and $branch -eq "master") {
            Write-Host "AVISO: dev em master - nao deveria." -ForegroundColor Red
        }

        $dirty = git status --porcelain
        if ($dirty) {
            Write-Host "Working tree sujo:" -ForegroundColor Yellow
            git status --short
        } else {
            Write-Host "Working tree limpo."
        }

        $gone = git status --branch --porcelain=v2 2>$null | Select-String "gone"
        if ($gone) {
            Write-Host "Branch remota apagada (gone) - provavelmente ja mergeada. Bom trocar de base." -ForegroundColor Yellow
        }
    } finally {
        Pop-Location
    }
}
