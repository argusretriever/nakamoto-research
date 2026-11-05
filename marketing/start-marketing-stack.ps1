$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root ".env"
$ExampleFile = Join-Path $Root ".env.example"
$Docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"
$DockerDesktop = "C:\Program Files\Docker\Docker\Docker Desktop.exe"

if (-not (Test-Path -LiteralPath $DockerDesktop)) {
  throw "Docker Desktop is not installed."
}

if (-not (Test-Path -LiteralPath $EnvFile)) {
  Copy-Item -LiteralPath $ExampleFile -Destination $EnvFile
  Write-Host "Created marketing/.env from the example. Change the passwords before exposing anything publicly."
}

$env:PATH = "$DockerBin;$env:PATH"
Get-Content -LiteralPath $EnvFile | ForEach-Object {
  if ($_ -match "^\s*#" -or $_ -notmatch "=") { return }
  $name, $value = $_ -split "=", 2
  if ($name) {
    Set-Item -Path ("Env:" + $name.Trim()) -Value $value.Trim()
  }
}

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
  & $Docker compose --env-file ".env" -f "docker-compose.yml" up -d
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Marketing stack is starting:"
Write-Host "Matomo analytics: http://localhost:8081"
Write-Host "listmonk newsletter: http://localhost:9000"
Write-Host "n8n automation: http://localhost:5678"
Write-Host "Uptime Kuma: http://localhost:3001"
