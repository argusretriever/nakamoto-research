$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root ".env"
$Docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"

$env:PATH = "$DockerBin;$env:PATH"

Push-Location -LiteralPath $Root
try {
  & $Docker compose --profile apache --env-file $EnvFile -f "docker-compose.yml" stop `
    apache-superset apache-airflow apache-solr apache-answer
} finally {
  Pop-Location
}
