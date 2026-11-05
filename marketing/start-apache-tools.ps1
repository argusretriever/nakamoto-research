$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root ".env"
$Docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"
$DockerDesktop = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (-not (Test-Path -LiteralPath $DockerDesktop)) {
  throw "Docker Desktop is not installed."
}

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "Run marketing/start-marketing-stack.ps1 first so marketing/.env exists."
}

function New-Secret {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  return [Convert]::ToBase64String($bytes).Replace("+", "").Replace("/", "").Replace("=", "")
}

$envText = Get-Content -LiteralPath $EnvFile -Raw
$envLines = New-Object System.Collections.Generic.List[string]
$envLines.AddRange([string[]](Get-Content -LiteralPath $EnvFile))

if ($envText -notmatch "(?m)^SUPERSET_SECRET_KEY=") {
  $envLines.Add("SUPERSET_SECRET_KEY=$(New-Secret)")
}
if ($envText -notmatch "(?m)^SUPERSET_ADMIN_EMAIL=") {
  $envLines.Add("SUPERSET_ADMIN_EMAIL=admin@example.com")
}
if ($envText -notmatch "(?m)^SUPERSET_ADMIN_PASSWORD=") {
  $envLines.Add("SUPERSET_ADMIN_PASSWORD=$(New-Secret)")
}

Set-Content -LiteralPath $EnvFile -Encoding ascii -Value $envLines

$env:PATH = "$DockerBin;$env:PATH"
Start-Process -FilePath $DockerDesktop -WindowStyle Hidden

Write-Host "Waiting for Docker to start..."
for ($i = 0; $i -lt 60; $i++) {
  try {
    & $Docker info *> $null
    if ($LASTEXITCODE -eq 0) { break }
  } catch {}
  Start-Sleep -Seconds 5
}

Push-Location -LiteralPath $Root
try {
  & $Docker compose --profile apache --env-file ".env" -f "docker-compose.yml" up -d
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Apache Foundation tools:"
Write-Host "Apache Superset dashboards: http://localhost:8088"
Write-Host "Apache Airflow workflows: http://localhost:8086"
Write-Host "Apache Solr search: http://localhost:8983"
Write-Host "Apache Answer Q&A: http://localhost:9080"
