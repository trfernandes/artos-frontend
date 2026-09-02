<#
Helpers compartilhados dos scripts de fluxo worktree.
Dot-source no topo de cada script: . "$PSScriptRoot\_common.ps1"
#>

$ReleasePath = "D:\artos\artos_frontend"
$DevPath     = "D:\artos\artos_frontend_dev"

function Get-RepoTop {
    $top = git rev-parse --show-toplevel 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $top) { return $null }
    return ($top -replace '/', '\').TrimEnd('\')
}

function Assert-Cwd {
    param(
        [Parameter(Mandatory)][string]$Expected,
        [Parameter(Mandatory)][string]$Papel
    )
    $top = Get-RepoTop
    if (-not $top) {
        Write-Host "Nao esta dentro de um repo git." -ForegroundColor Red
        exit 1
    }
    if ($top.ToLower() -ne $Expected.TrimEnd('\').ToLower()) {
        Write-Host "Rode este script na pasta ${Papel}: $Expected" -ForegroundColor Red
        Write-Host "Voce esta em: $top" -ForegroundColor Red
        exit 1
    }
}

function Assert-Clean {
    param([string]$Papel = "atual")
    $dirty = git status --porcelain
    if ($dirty) {
        Write-Host "Working tree sujo na pasta $Papel. Resolva antes:" -ForegroundColor Red
        git status --short
        exit 1
    }
}

function Get-BranchCheckedOutElsewhere {
    <# Path do worktree (diferente do atual) onde $Branch esta em checkout, ou $null. #>
    param([Parameter(Mandatory)][string]$Branch)
    $curTop = Get-RepoTop
    $wtPath = $null
    foreach ($ln in (git worktree list --porcelain)) {
        if ($ln -like 'worktree *') {
            $wtPath = ($ln.Substring(9) -replace '/', '\').TrimEnd('\')
        }
        elseif ($ln -like 'branch refs/heads/*') {
            $b = $ln.Substring(18)
            if ($b -eq $Branch -and $wtPath -and $wtPath.ToLower() -ne $curTop.ToLower()) {
                return $wtPath
            }
        }
    }
    return $null
}
