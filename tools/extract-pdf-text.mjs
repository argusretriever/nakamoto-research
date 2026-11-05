import fs from 'node:fs';
import zlib from 'node:zlib';

const input = process.argv[2];
const output = process.argv[3] || 'pdf-extracted-text.txt';

if (!input) {
  console.error('Usage: node tools/extract-pdf-text.mjs <input.pdf> [output.txt]');
  process.exit(1);
}

const bytes = fs.readFileSync(input);
const raw = bytes.toString('binary');

function ascii85Decode(data) {
  let out = [];
  let group = [];
  let started = false;

  for (let i = 0; i < data.length; i++) {
    const ch = data[i];
    if (!started && ch === '<' && data[i + 1] === '~') {
      started = true;
      i++;
      continue;
    }
    if (started && ch === '~' && data[i + 1] === '>') break;
    if (/\s/.test(ch)) continue;
    if (ch === 'z' && group.length === 0) {
      out.push(0, 0, 0, 0);
      continue;
    }
    const code = ch.charCodeAt(0);
    if (code < 33 || code > 117) continue;
    group.push(code - 33);
    if (group.length === 5) {
      let value = 0;
      for (const digit of group) value = value * 85 + digit;
      out.push((value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255);
      group = [];
    }
  }

  if (group.length > 0) {
    const originalLength = group.length;
    while (group.length < 5) group.push(84);
    let value = 0;
    for (const digit of group) value = value * 85 + digit;
    const chunk = [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
    out.push(...chunk.slice(0, originalLength - 1));
  }

  return Buffer.from(out);
}

function decodePdfString(str) {
  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch !== '\\') {
      out += ch;
      continue;
    }
    const next = str[++i];
    if (next === 'n') out += '\n';
    else if (next === 'r') out += '\r';
    else if (next === 't') out += '\t';
    else if (next === 'b') out += '\b';
    else if (next === 'f') out += '\f';
    else if (next === '(' || next === ')' || next === '\\') out += next;
    else if (/[0-7]/.test(next || '')) {
      let oct = next;
      for (let j = 0; j < 2 && /[0-7]/.test(str[i + 1] || ''); j++) oct += str[++i];
      out += String.fromCharCode(parseInt(oct, 8));
    } else if (next) {
      out += next;
    }
  }
  return out;
}

function readLiteral(content, start) {
  let depth = 1;
  let value = '';
  for (let i = start + 1; i < content.length; i++) {
    const ch = content[i];
    if (ch === '\\') {
      value += ch + (content[i + 1] || '');
      i++;
      continue;
    }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0) return { value: decodePdfString(value), end: i };
    value += ch;
  }
  return { value: decodePdfString(value), end: content.length - 1 };
}

function extractTextFromContent(content) {
  const pieces = [];
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '(') {
      const literal = readLiteral(content, i);
      const after = content.slice(literal.end + 1, literal.end + 25);
      if (/\b(Tj|TJ|'|")\b/.test(after) || /\]/.test(after)) {
        pieces.push(literal.value);
      }
      i = literal.end;
    }
    if (content[i] === '<' && /[0-9A-Fa-f]/.test(content[i + 1] || '')) {
      const end = content.indexOf('>', i + 1);
      if (end !== -1) {
        const hex = content.slice(i + 1, end).replace(/\s+/g, '');
        const after = content.slice(end + 1, end + 25);
        if (hex.length >= 2 && /\b(Tj|TJ|'|")\b/.test(after)) {
          const buf = Buffer.from(hex, 'hex');
          pieces.push(buf.toString('utf16be').replace(/\0/g, '') || buf.toString('latin1'));
        }
        i = end;
      }
    }
    if (content[i] === '\n' || /T\*|Td|TD/.test(content.slice(i, i + 3))) pieces.push('\n');
  }
  return pieces.join(' ');
}

const streamRegex = /<<(?:.|\r|\n)*?>>\s*stream\r?\n([\s\S]*?)\r?\nendstream/g;
let match;
let page = 0;
const pages = [];

while ((match = streamRegex.exec(raw))) {
  const dictStart = raw.lastIndexOf('<<', match.index);
  const dict = raw.slice(dictStart, match.index);
  if (!dict.includes('/FlateDecode')) continue;
  let data = match[1];
  try {
    let buf = Buffer.from(data, 'binary');
    if (dict.includes('/ASCII85Decode')) buf = ascii85Decode(data);
    const inflated = zlib.inflateSync(buf).toString('latin1');
    const text = extractTextFromContent(inflated)
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    if (text) {
      page += 1;
      pages.push(`\n\n--- PAGE ${page} ---\n${text}`);
    }
  } catch {
    continue;
  }
}

fs.writeFileSync(output, pages.join('\n'), 'utf8');
console.log(`Extracted ${page} text streams to ${output}`);
