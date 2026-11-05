$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$EnvFile = Join-Path $Root ".env"
$Docker = "C:\Program Files\Docker\Docker\resources\bin\docker.exe"
$DockerBin = "C:\Program Files\Docker\Docker\resources\bin"

$env:PATH = "$DockerBin;$env:PATH"

function New-Password {
  $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  -join (1..32 | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
}

if (-not (Test-Path -LiteralPath $EnvFile)) {
  throw "Run marketing/start-marketing-stack.ps1 first so marketing/.env exists."
}

$envLines = [System.Collections.Generic.List[string]]::new()
$envLines.AddRange([string[]](Get-Content -LiteralPath $EnvFile))
$envText = $envLines -join "`n"

if ($envText -notmatch "(?m)^PUBLIC_GATEWAY_USER=") {
  $envLines.Add("")
  $envLines.Add("PUBLIC_GATEWAY_USER=admin")
}

if ($envText -notmatch "(?m)^PUBLIC_GATEWAY_PASSWORD=") {
  $envLines.Add("PUBLIC_GATEWAY_PASSWORD=$(New-Password)")
}

[System.IO.File]::WriteAllLines($EnvFile, $envLines, [System.Text.Encoding]::ASCII)

Push-Location -LiteralPath $Root
try {
  & $Docker compose --profile public --env-file ".env" -f "docker-compose.yml" up -d
  Start-Sleep -Seconds 25

  $containers = @(
    "nakamoto-matomo-public-tunnel",
    "nakamoto-listmonk-public-tunnel",
    "nakamoto-n8n-public-tunnel",
    "nakamoto-uptime-public-tunnel"
  )

  $rows = foreach ($container in $containers) {
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
      $logs = & $Docker logs $container 2>&1
    } finally {
      $ErrorActionPreference = $oldPreference
    }
    $url = ($logs | Select-String -Pattern "https://[a-zA-Z0-9.-]+\.trycloudflare\.com" -AllMatches |
      ForEach-Object { $_.Matches.Value } | Select-Object -Last 1)
    [pscustomobject]@{
      Container = $container
      PublicUrl = $url
    }
  }
  $rows | Format-Table -AutoSize

  Write-Host ""
  Write-Host "Public login is stored in marketing/.env as PUBLIC_GATEWAY_USER and PUBLIC_GATEWAY_PASSWORD."
} finally {
  Pop-Location
}
