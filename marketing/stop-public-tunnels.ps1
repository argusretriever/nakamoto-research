$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root ".env"
$Docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"

$env:PATH = "$DockerBin;$env:PATH"

Push-Location -LiteralPath $Root
try {
  & $Docker compose --profile public --env-file $EnvFile -f "docker-compose.yml" stop `
    matomo-public-tunnel listmonk-public-tunnel n8n-public-tunnel uptime-public-tunnel `
    matomo-public-gateway listmonk-public-gateway n8n-public-gateway uptime-public-gateway
} finally {
  Pop-Location
}
