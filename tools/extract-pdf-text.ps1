param(
  [Parameter(Mandatory = $true)][string]$InputPdf,
  [string]$OutputText = "pdf-extracted-text.txt",
  [switch]$DumpDecodedStreams
)

$ErrorActionPreference = "Stop"

$bytes = [System.IO.File]::ReadAllBytes($InputPdf)
$latin1 = [System.Text.Encoding]::GetEncoding("ISO-8859-1")
$raw = $latin1.GetString($bytes)

function Decode-Ascii85([string]$Data) {
  $out = New-Object System.Collections.Generic.List[byte]
  $group = New-Object System.Collections.Generic.List[int]
  $started = $false

  for ($i = 0; $i -lt $Data.Length; $i++) {
    $ch = $Data[$i]
    if (-not $started -and $ch -eq '<' -and ($i + 1) -lt $Data.Length -and $Data[$i + 1] -eq '~') {
      $started = $true
      $i++
      continue
    }
    if ($ch -eq '~' -and ($i + 1) -lt $Data.Length -and $Data[$i + 1] -eq '>') { break }
    if ([char]::IsWhiteSpace($ch)) { continue }
    if ($ch -eq 'z' -and $group.Count -eq 0) {
      0,0,0,0 | ForEach-Object { $out.Add([byte]$_) }
      continue
    }
    $code = [int][char]$ch
    if ($code -lt 33 -or $code -gt 117) { continue }
    $group.Add($code - 33)
    if ($group.Count -eq 5) {
      [Int64]$value = 0
      foreach ($digit in $group) { $value = ($value * 85) + $digit }
      $out.Add([byte](($value -shr 24) -band 255))
      $out.Add([byte](($value -shr 16) -band 255))
      $out.Add([byte](($value -shr 8) -band 255))
      $out.Add([byte]($value -band 255))
      $group.Clear()
    }
  }

  if ($group.Count -gt 0) {
    $originalLength = $group.Count
    while ($group.Count -lt 5) { $group.Add(84) }
    [Int64]$value = 0
    foreach ($digit in $group) { $value = ($value * 85) + $digit }
    $chunk = @(
      [byte](($value -shr 24) -band 255),
      [byte](($value -shr 16) -band 255),
      [byte](($value -shr 8) -band 255),
      [byte]($value -band 255)
    )
    for ($j = 0; $j -lt ($originalLength - 1); $j++) { $out.Add($chunk[$j]) }
  }

  return $out.ToArray()
}

function Inflate-Flate([byte[]]$Data) {
  $memory = New-Object System.IO.MemoryStream(,$Data)
  try {
    $null = $memory.ReadByte()
    $null = $memory.ReadByte()
    $deflate = New-Object System.IO.Compression.DeflateStream($memory, [System.IO.Compression.CompressionMode]::Decompress)
    $output = New-Object System.IO.MemoryStream
    $deflate.CopyTo($output)
    $deflate.Dispose()
    return ,([byte[]]$output.ToArray())
  } catch {
    $memory.Dispose()
    $memory = New-Object System.IO.MemoryStream(,$Data)
    $deflate = New-Object System.IO.Compression.DeflateStream($memory, [System.IO.Compression.CompressionMode]::Decompress)
    $output = New-Object System.IO.MemoryStream
    $deflate.CopyTo($output)
    $deflate.Dispose()
    return ,([byte[]]$output.ToArray())
  }
}

function Decode-PdfString([string]$Value) {
  $builder = New-Object System.Text.StringBuilder
  for ($i = 0; $i -lt $Value.Length; $i++) {
    $ch = $Value[$i]
    if ($ch -ne '\') {
      [void]$builder.Append($ch)
      continue
    }
    $i++
    if ($i -ge $Value.Length) { break }
    $next = $Value[$i]
    switch ($next) {
      'n' { [void]$builder.Append("`n") }
      'r' { [void]$builder.Append("`r") }
      't' { [void]$builder.Append("`t") }
      'b' { [void]$builder.Append("`b") }
      'f' { [void]$builder.Append("`f") }
      '(' { [void]$builder.Append('(') }
      ')' { [void]$builder.Append(')') }
      '\' { [void]$builder.Append('\') }
      default {
        if ($next -match '[0-7]') {
          $oct = [string]$next
          for ($j = 0; $j -lt 2 -and ($i + 1) -lt $Value.Length -and $Value[$i + 1] -match '[0-7]'; $j++) {
            $i++
            $oct += [string]$Value[$i]
          }
          [void]$builder.Append([char][Convert]::ToInt32($oct, 8))
        } else {
          [void]$builder.Append($next)
        }
      }
    }
  }
  return $builder.ToString()
}

function Read-Literal([string]$Content, [int]$Start) {
  $depth = 1
  $builder = New-Object System.Text.StringBuilder
  for ($i = $Start + 1; $i -lt $Content.Length; $i++) {
    $ch = $Content[$i]
    if ($ch -eq '\') {
      [void]$builder.Append($ch)
      if (($i + 1) -lt $Content.Length) {
        $i++
        [void]$builder.Append($Content[$i])
      }
      continue
    }
    if ($ch -eq '(') { $depth++ }
    if ($ch -eq ')') { $depth-- }
    if ($depth -eq 0) {
      return @{ Text = (Decode-PdfString $builder.ToString()); End = $i }
    }
    [void]$builder.Append($ch)
  }
  return @{ Text = (Decode-PdfString $builder.ToString()); End = $Content.Length - 1 }
}

function Extract-Text([string]$Content) {
  $pieces = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $Content.Length; $i++) {
    if ($Content[$i] -eq '(') {
      $literal = Read-Literal $Content $i
      $afterLength = [Math]::Min(25, $Content.Length - ($literal.End + 1))
      $after = if ($afterLength -gt 0) { $Content.Substring($literal.End + 1, $afterLength) } else { "" }
      if ($after -match '\b(Tj|TJ)\b|''|"|\]') {
        $pieces.Add($literal.Text)
      }
      $i = $literal.End
    } elseif ($Content[$i] -eq '[' -or $Content[$i] -eq ']' -or $Content[$i] -eq "`n") {
      $pieces.Add("`n")
    }
  }
  return (($pieces -join ' ') -replace "[ `t]+`n", "`n" -replace "`n{3,}", "`n`n").Trim()
}

$pages = New-Object System.Collections.Generic.List[string]
$count = 0
$streamNumber = 0
$failures = New-Object System.Collections.Generic.List[string]

$position = 0
while ($true) {
  $streamIndex = $raw.IndexOf('stream', $position)
  if ($streamIndex -lt 0) { break }
  $streamNumber++
  $dictStart = $raw.LastIndexOf('<<', $streamIndex)
  if ($dictStart -lt 0) { continue }
  $dict = $raw.Substring($dictStart, $streamIndex - $dictStart)
  $lengthMatch = [regex]::Match($dict, '/Length\s+(\d+)')
  if (-not $lengthMatch.Success) {
    $position = $streamIndex + 6
    continue
  }
  $plannedDataStart = $streamIndex + 6
  if ($plannedDataStart -lt $raw.Length -and $raw[$plannedDataStart] -eq "`r") { $plannedDataStart++ }
  if ($plannedDataStart -lt $raw.Length -and $raw[$plannedDataStart] -eq "`n") { $plannedDataStart++ }
  $plannedDataEnd = $plannedDataStart + [int]$lengthMatch.Groups[1].Value
  $realEndMarker = $raw.IndexOf('endstream', $plannedDataEnd)
  $position = if ($realEndMarker -ge 0) { $realEndMarker + 9 } else { $plannedDataEnd }
  if ($dict -notmatch '/FlateDecode') { continue }

  try {
    $dataStart = $plannedDataStart
    $dataEnd = $dataStart + [int]$lengthMatch.Groups[1].Value
    if ($dataEnd -gt $raw.Length) { $dataEnd = $raw.Length }
    $stream = $raw.Substring($dataStart, $dataEnd - $dataStart)
    $streamBytes = if ($dict -match '/ASCII85Decode') { Decode-Ascii85 $stream } else { $latin1.GetBytes($stream) }
    $inflatedBytes = Inflate-Flate $streamBytes
    $content = $latin1.GetString($inflatedBytes)
    if ($DumpDecodedStreams) {
      $dumpDir = "pdf-decoded-streams"
      if (-not (Test-Path $dumpDir)) { New-Item -ItemType Directory -Path $dumpDir | Out-Null }
      $dumpName = Join-Path $dumpDir ("stream-{0:D4}.txt" -f $streamNumber)
      [System.IO.File]::WriteAllText($dumpName, $content, [System.Text.Encoding]::UTF8)
    }
    $text = Extract-Text $content
    if ($text.Length -gt 0) {
      $count++
      $pages.Add("`n`n--- PAGE $count ---`n$text")
    }
  } catch {
    $failures.Add(("stream {0}: {1}" -f $streamNumber, $_.Exception.Message))
    continue
  }
}

[System.IO.File]::WriteAllText($OutputText, ($pages -join "`n"), [System.Text.Encoding]::UTF8)
Write-Output "Extracted $count text streams to $OutputText"
if ($failures.Count -gt 0) {
  [System.IO.File]::WriteAllText("pdf-extraction-failures.txt", ($failures -join "`n"), [System.Text.Encoding]::UTF8)
  Write-Output "Failures: $($failures.Count). See pdf-extraction-failures.txt"
}
