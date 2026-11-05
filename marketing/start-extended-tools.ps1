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

New-Item -ItemType Directory -Force -Path (Join-Path $Root "data\goaccess\logs") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $Root "data\goaccess\report") | Out-Null
$AccessLog = Join-Path $Root "data\goaccess\logs\access.log"
if (-not (Test-Path -LiteralPath $AccessLog)) {
  Set-Content -LiteralPath $AccessLog -Encoding ascii -Value '127.0.0.1 - - [18/Jun/2026:00:00:00 +0100] "GET / HTTP/1.1" 200 1024 "-" "NAKAMOTO local seed"'
}

Push-Location -LiteralPath $Root
try {
  & $Docker compose --profile extended --env-file ".env" -f "docker-compose.yml" up -d
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Extended marketing tools:"
Write-Host "Umami analytics: http://localhost:3002"
Write-Host "GoAccess logs: http://localhost:7890"
Write-Host "Metabase dashboard: http://localhost:3003"
Write-Host "Baserow content calendar: http://localhost:3004"
Write-Host "Directus CMS/API: http://localhost:8055"
Write-Host "Ghost publishing: http://localhost:2368"
Write-Host "Keila email: http://localhost:4000"
Write-Host "LimeSurvey feedback: http://localhost:8082"
Write-Host "Docmost wiki: http://localhost:3005"
Write-Host "BookStack wiki: http://localhost:6875"
Write-Host "Rallly scheduling: http://localhost:3006"
Write-Host "GoToSocial community: http://localhost:8083"
Write-Host "Shlink API: http://localhost:8084"
Write-Host "Shlink web: http://localhost:8085"
