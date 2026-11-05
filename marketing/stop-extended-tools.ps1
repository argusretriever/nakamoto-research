$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root ".env"
$Docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"

$env:PATH = "$DockerBin;$env:PATH"

Push-Location -LiteralPath $Root
try {
  & $Docker compose --profile extended --env-file $EnvFile -f "docker-compose.yml" stop `
    umami umami-db goaccess metabase baserow directus ghost keila keila-db `
    limesurvey limesurvey-db docmost docmost-db docmost-redis bookstack `
    bookstack-db rallly rallly-db gotosocial shlink shlink-web
} finally {
  Pop-Location
}
