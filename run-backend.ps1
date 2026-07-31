# Run FastAPI using repo-root .venv (no activate needed)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$venvPy = Join-Path $PSScriptRoot "subvenv\Scripts\python.exe"
if (-not (Test-Path $venvPy)) {
    Write-Host ".venv not found. Run setup first:"
    Write-Host "  .\setup.ps1"
    exit 1
}

Write-Host "Starting Donor Retain ML API on http://127.0.0.1:8000 ..."
Write-Host "Docs: http://127.0.0.1:8000/docs"
Set-Location (Join-Path $PSScriptRoot "ml-backend")
& $venvPy -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
