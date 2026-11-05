param(
  [Parameter(Mandatory = $true)][string]$InputPdf,
  [string]$OutputText = "pdf-extracted-text.txt"
)

$ErrorActionPreference = "Stop"

$code = @"
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Text.RegularExpressions;
using System.Collections.Generic;

public static class PdfTextExtractor {
  static readonly Encoding Latin1 = Encoding.GetEncoding("ISO-8859-1");

  public static string Extract(string input) {
    byte[] bytes = File.ReadAllBytes(input);
    string raw = Latin1.GetString(bytes);
    var pages = new List<string>();
    int pos = 0, streamNo = 0, textNo = 0, failures = 0;

    while (true) {
      int s = raw.IndexOf("stream", pos, StringComparison.Ordinal);
      if (s < 0) break;
      streamNo++;
      int dictStart = raw.LastIndexOf("<<", s, StringComparison.Ordinal);
      if (dictStart < 0) { pos = s + 6; continue; }
      string dict = raw.Substring(dictStart, s - dictStart);
      Match lenMatch = Regex.Match(dict, @"/Length\s+(\d+)");
      if (!lenMatch.Success) { pos = s + 6; continue; }
      int dataStart = s + 6;
      if (dataStart < raw.Length && raw[dataStart] == '\r') dataStart++;
      if (dataStart < raw.Length && raw[dataStart] == '\n') dataStart++;
      int length = Int32.Parse(lenMatch.Groups[1].Value);
      int dataEnd = Math.Min(raw.Length, dataStart + length);
      int marker = raw.IndexOf("endstream", dataEnd, StringComparison.Ordinal);
      pos = marker >= 0 ? marker + 9 : dataEnd;
      if (!dict.Contains("/FlateDecode")) continue;

      try {
        string encoded = raw.Substring(dataStart, dataEnd - dataStart);
        byte[] compressed = dict.Contains("/ASCII85Decode") ? Ascii85(encoded) : Latin1.GetBytes(encoded);
        byte[] inflated = Inflate(compressed);
        string content = Latin1.GetString(inflated);
        string text = ExtractText(content).Trim();
        if (text.Length > 0) {
          textNo++;
          pages.Add("\n\n--- PAGE " + textNo + " / STREAM " + streamNo + " ---\n" + text);
        }
      } catch {
        failures++;
      }
    }

    return String.Join("\n", pages) + "\n\nExtraction summary: streams=" + streamNo + " text_streams=" + textNo + " failures=" + failures + "\n";
  }

  static byte[] Ascii85(string data) {
    var output = new List<byte>();
    var group = new List<int>();
    for (int i = 0; i < data.Length; i++) {
      char ch = data[i];
      if (ch == '<' && i + 1 < data.Length && data[i + 1] == '~') { i++; continue; }
      if (ch == '~' && i + 1 < data.Length && data[i + 1] == '>') break;
      if (Char.IsWhiteSpace(ch)) continue;
      if (ch == 'z' && group.Count == 0) { output.AddRange(new byte[] {0,0,0,0}); continue; }
      int code = (int)ch;
      if (code < 33 || code > 117) continue;
      group.Add(code - 33);
      if (group.Count == 5) {
        long value = 0;
        foreach (int digit in group) value = value * 85 + digit;
        output.Add((byte)((value >> 24) & 255));
        output.Add((byte)((value >> 16) & 255));
        output.Add((byte)((value >> 8) & 255));
        output.Add((byte)(value & 255));
        group.Clear();
      }
    }
    if (group.Count > 0) {
      int original = group.Count;
      while (group.Count < 5) group.Add(84);
      long value = 0;
      foreach (int digit in group) value = value * 85 + digit;
      byte[] chunk = new byte[] {
        (byte)((value >> 24) & 255),
        (byte)((value >> 16) & 255),
        (byte)((value >> 8) & 255),
        (byte)(value & 255)
      };
      for (int i = 0; i < original - 1; i++) output.Add(chunk[i]);
    }
    return output.ToArray();
  }

  static byte[] Inflate(byte[] data) {
    using (var input = new MemoryStream(data)) {
      input.ReadByte();
      input.ReadByte();
      using (var deflate = new DeflateStream(input, CompressionMode.Decompress))
      using (var output = new MemoryStream()) {
        deflate.CopyTo(output);
        return output.ToArray();
      }
    }
  }

  static string ExtractText(string content) {
    var pieces = new List<string>();
    var re = new Regex(@"\((?:\\.|[^\\)])*\)\s*Tj");
    foreach (Match m in re.Matches(content)) {
      string s = m.Value;
      s = s.Substring(1, s.LastIndexOf(")") - 1);
      s = DecodePdfString(s);
      if (Regex.IsMatch(s, "[A-Za-z0-9]")) pieces.Add(s);
    }
    return String.Join("\n", pieces)
      .Replace("\u007f", "-")
      .Replace("\0", "");
  }

  static string DecodePdfString(string value) {
    var sb = new StringBuilder();
    for (int i = 0; i < value.Length; i++) {
      char ch = value[i];
      if (ch != '\\') { sb.Append(ch); continue; }
      if (++i >= value.Length) break;
      char n = value[i];
      if (n == 'n') sb.Append('\n');
      else if (n == 'r') sb.Append('\r');
      else if (n == 't') sb.Append('\t');
      else if (n == 'b') sb.Append('\b');
      else if (n == 'f') sb.Append('\f');
      else if (n == '(' || n == ')' || n == '\\') sb.Append(n);
      else if (n >= '0' && n <= '7') {
        string oct = "" + n;
        for (int j = 0; j < 2 && i + 1 < value.Length && value[i + 1] >= '0' && value[i + 1] <= '7'; j++) oct += value[++i];
        sb.Append((char)Convert.ToInt32(oct, 8));
      } else sb.Append(n);
    }
    return sb.ToString();
  }
}
"@

Add-Type -TypeDefinition $code
$text = [PdfTextExtractor]::Extract($InputPdf)
[System.IO.File]::WriteAllText($OutputText, $text, [System.Text.Encoding]::UTF8)
Write-Output (($text -split "`n")[-2])
