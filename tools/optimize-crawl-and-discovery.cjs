const fs = require("fs");
const cp = require("child_process");

const files = cp.execSync('git ls-files "*.html"', { encoding: "utf8" })
  .trim().split(/\r?\n/).filter(Boolean);
const operational = [
  /^daily-operations(?:-\d{4}-\d{2}-\d{2})?\.html$/,
  /^daily-section-dashboards\.html$/,
  /^section-scorecards\.html$/,
  /^section-update-archives\.html$/,
  /^priority-sector-indexing-queue\.html$/,
  /^marketing-growth-operation\.html$/,
  /^growth-dashboard\.html$/,
  /^affiliate-performance-dashboard\.html$/
];
const isOperational = (file) => operational.some((pattern) => pattern.test(file));
let noindexed = 0;
let feeds = 0;
let imageHints = 0;

for (const file of files) {
  if (/^google[^/]+\.html$/i.test(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  let changed = false;
  if (isOperational(file) && !/<meta\s+name=["']robots["']/i.test(html)) {
    html = html.replace(/<\/head>/i, '    <meta name="robots" content="noindex,follow">\n  </head>');
    noindexed += 1;
    changed = true;
  }
  if (!isOperational(file) && !/<link\s+rel=["']alternate["'][^>]+application\/rss\+xml/i.test(html)) {
    const depth = file.split("/").length - 1;
    const feed = `${"../".repeat(depth)}feed.xml`;
    html = html.replace(/<\/head>/i, `    <link rel="alternate" type="application/rss+xml" title="NAKAMOTO updates" href="${feed}">\n  </head>`);
    feeds += 1;
    changed = true;
  }
  html = html.replace(/<img\b([^>]*?)>/gi, (tag, attrs) => {
    if (/\bloading=/i.test(attrs)) return tag;
    imageHints += 1;
    changed = true;
    return `<img${attrs} loading="lazy" decoding="async">`;
  });
  if (changed) fs.writeFileSync(file, html);
}

let sitemap = fs.readFileSync("sitemap.xml", "utf8");
let removed = 0;
for (const file of files.filter(isOperational)) {
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = new RegExp(`\\s*<url>\\s*<loc>https://nakamatoresearch\\.com/${escaped}</loc>[\\s\\S]*?</url>`, "g");
  sitemap = sitemap.replace(block, () => { removed += 1; return ""; });
}
fs.writeFileSync("sitemap.xml", sitemap);

console.log(JSON.stringify({ noindexed, rssLinksAdded: feeds, imageHintsAdded: imageHints, sitemapEntriesRemoved: removed }));
