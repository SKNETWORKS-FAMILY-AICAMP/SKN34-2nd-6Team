# Create repo-root .venv and install requirements (Windows PowerShell)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$py = $null
foreach ($cmd in @("python", "py")) {
    $found = Get-Command $cmd -ErrorAction SilentlyContinue
    if ($found) {
        $py = $found.Source
        break
    }
}

if (-not $py) {
    Write-Error "Python not found. Install Python 3.10+ and retry."
    exit 1
}

Write-Host "Using: $py"
& $py --version

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "Creating .venv ..."
    & $py -m venv .venv
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host ".venv already exists - reusing"
}

$venvPy = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
Write-Host "Upgrading pip ..."
& $venvPy -m pip install --upgrade pip
Write-Host "Installing requirements ..."
& $venvPy -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example - fill in secrets if needed."
}

Write-Host ""
Write-Host "Setup complete. Start the API with:"
Write-Host "  .\run-backend.ps1"
