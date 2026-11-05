param(
  [string]$Repository = "OUIOUIyy/Nakamotoresearch",
  [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "NAKAMOTO GitHub uploader"
Write-Host "Repository: $Repository"
Write-Host "Branch: $Branch"
Write-Host ""
Write-Host "Paste a GitHub fine-grained token with Contents: Read and write."
$secureToken = Read-Host "GitHub token" -AsSecureString
$token = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
  [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
)

$headers = @{
  Authorization = "Bearer $token"
  Accept = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
}

$files = @(
  "index.html",
  "styles.css",
  "script.js",
  "netlify.toml",
  "crypto-news-today.html",
  "news-2026-06-11.html",
  "news-archive.html",
  "bitcoin-blog.html",
  "encyclopedia.html",
  "seo.html",
  "news-posted-log.md",
  "assets/bitcoin-logo-bw.svg"
)

function Convert-ToBase64Utf8([string]$Text) {
  return [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($Text))
}

foreach ($path in $files) {
  $localPath = Join-Path $Root ($path -replace "/", [IO.Path]::DirectorySeparatorChar)
  if (-not (Test-Path -LiteralPath $localPath)) {
    Write-Warning "Missing locally, skipped: $path"
    continue
  }

  $apiPath = [Uri]::EscapeDataString($path).Replace("%2F", "/")
  $url = "https://api.github.com/repos/$Repository/contents/$apiPath?ref=$Branch"
  $sha = $null

  try {
    $current = Invoke-RestMethod -Method Get -Uri $url -Headers $headers
    $sha = $current.sha
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -ne 404) {
      throw
    }
  }

  $content = Get-Content -Raw -LiteralPath $localPath
  $body = @{
    message = "Update $path"
    content = Convert-ToBase64Utf8 $content
    branch = $Branch
  }

  if ($sha) {
    $body.sha = $sha
  }

  $json = $body | ConvertTo-Json -Depth 5
  $result = Invoke-RestMethod -Method Put -Uri "https://api.github.com/repos/$Repository/contents/$apiPath" -Headers $headers -Body $json -ContentType "application/json"
  Write-Host "Updated: $path -> $($result.commit.sha.Substring(0,7))"
}

Write-Host ""
Write-Host "Done. Netlify should start a new deploy after GitHub receives these commits."
