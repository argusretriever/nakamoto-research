$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"
$EnvFile = Join-Path $Root ".env"

$env:PATH = "$DockerBin;$env:PATH"

Push-Location -LiteralPath $Root
try {
  & $Docker compose --env-file $EnvFile -f "docker-compose.yml" down
} finally {
  Pop-Location
}
