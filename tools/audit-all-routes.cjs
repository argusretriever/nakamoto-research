#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const ignored = new Set(['.git', 'node_modules', '.netlify']);
const pages = [];
function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const file = path.join(dir, item.name);
    if (item.isDirectory()) walk(file);
    else if (item.name.endsWith('.html')) pages.push(file);
  }
}
walk(root);

const issues = [];
let checked = 0;
const archive = fs.readFileSync(path.join(root, 'news-archive.html'), 'utf8');
const latestReview = archive.match(/href=["']news-(\d{4}-\d{2}-\d{2})\.html["']/)?.[1];
if (!latestReview) issues.push('news-archive.html: latest dated review link missing');
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\', '/');
  if (latestReview && !/\d{4}-\d{2}-\d{2}\.html$/.test(relative)) {
    // data-review dates identify historical source cards; age alone is not an error.
    // Only links explicitly labelled current must point at the latest review.
    for (const [, date] of html.matchAll(/href=["'](?:\.\.\/)?news-(\d{4}-\d{2}-\d{2})\.html["'][^>]*>\s*Current source review\s*<\/a>/gi)) {
      if (date !== latestReview) issues.push(`${relative}: current review link points to ${date}`);
    }
  }
  const ids = new Set();
  for (const [, id] of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    if (ids.has(id)) issues.push(`${relative}: duplicate id #${id}`);
    ids.add(id);
  }
  for (const [, attribute, raw] of html.matchAll(/\b(href|src)\s*=\s*["']([^"']+)["']/gi)) {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\{|<)/i.test(raw)) continue;
    const [route] = raw.split(/[?#]/, 1);
    if (!route || route.includes('${')) continue;
    let decoded;
    try { decoded = decodeURIComponent(route); } catch { issues.push(`${relative}: invalid URL encoding ${raw}`); continue; }
    const target = decoded.startsWith('/') ? path.join(root, decoded) : path.resolve(path.dirname(file), decoded);
    checked++;
    if (!target.startsWith(root + path.sep) && target !== root) {
      issues.push(`${relative}: route escapes site ${raw}`);
    } else if (!fs.existsSync(target)) {
      issues.push(`${relative}: missing ${attribute} ${raw}`);
    }
  }
}
let sitemapRoutes = 0;
for (const map of ['sitemap.xml', 'finance-library/sitemap.xml', 'trading-academy/academy-library/sitemap.xml']) {
  const sitemapFile = path.join(root, map);
  if (!fs.existsSync(sitemapFile)) continue;
  const sitemap = fs.readFileSync(sitemapFile, 'utf8');
  const seen = new Set();
  for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const parsed = new URL(url);
    if (parsed.hostname !== 'nakamatoresearch.com') continue;
    const route = decodeURIComponent(parsed.pathname);
    const target = path.join(root, route.endsWith('/') ? `${route}index.html` : route);
    sitemapRoutes++;
    if (seen.has(url)) issues.push(`${map}: duplicate ${url}`);
    seen.add(url);
    if (!fs.existsSync(target)) {
      issues.push(`${map}: missing ${route}`);
      continue;
    }
    if (!target.endsWith('.html')) continue;
    const html = fs.readFileSync(target, 'utf8');
    if (/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html)) {
      issues.push(`${map}: noindex page ${url}`);
    }
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1];
    if (canonical && canonical !== url) issues.push(`${map}: canonical mismatch ${url} -> ${canonical}`);
  }
}
console.log(`Audited ${pages.length} HTML files, ${checked} local routes, and ${sitemapRoutes} sitemap entries.`);
if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
}
