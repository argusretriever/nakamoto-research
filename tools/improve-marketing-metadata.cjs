const fs = require("fs");
const cp = require("child_process");

const files = cp.execSync('git ls-files "*.html"', { encoding: "utf8" })
  .trim().split(/\r?\n/).filter(Boolean);
const site = "https://nakamatoresearch.com/";
let social = 0;
let structured = 0;

for (const file of files) {
  if (/^google[^/]+\.html$/i.test(file)) continue;
  let html = fs.readFileSync(file, "utf8");
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)/i)?.[1];
  const title = html.match(/<title>(.*?)<\/title>/is)?.[1]?.replace(/\s+/g, " ").trim();
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)/i)?.[1];
  if (!canonical || !title || !description) continue;

  let tags = "";
  if (!/<meta\s+property=["']og:site_name["']/i.test(html)) tags += `\n    <meta property="og:site_name" content="NAKAMOTO">`;
  if (!/<meta\s+property=["']og:type["']/i.test(html)) tags += `\n    <meta property="og:type" content="website">`;
  if (!/<meta\s+property=["']og:title["']/i.test(html)) tags += `\n    <meta property="og:title" content="${title.replace(/"/g, "&quot;")}">`;
  if (!/<meta\s+property=["']og:description["']/i.test(html)) tags += `\n    <meta property="og:description" content="${description.replace(/"/g, "&quot;")}">`;
  if (!/<meta\s+property=["']og:url["']/i.test(html)) tags += `\n    <meta property="og:url" content="${canonical}">`;
  if (!/<meta\s+property=["']og:image["']/i.test(html)) {
    tags += `\n    <meta property="og:image" content="${site}assets/nakamoto-hero.png">`;
    tags += `\n    <meta property="og:image:alt" content="NAKAMOTO Bitcoin research and financial education">`;
    social += 1;
  }
  if (!/<meta\s+name=["']twitter:card["']/i.test(html)) tags += `\n    <meta name="twitter:card" content="summary_large_image">`;
  if (!/<meta\s+name=["']twitter:title["']/i.test(html)) tags += `\n    <meta name="twitter:title" content="${title.replace(/"/g, "&quot;")}">`;
  if (!/<meta\s+name=["']twitter:description["']/i.test(html)) tags += `\n    <meta name="twitter:description" content="${description.replace(/"/g, "&quot;")}">`;
  if (!/<meta\s+name=["']twitter:image["']/i.test(html)) tags += `\n    <meta name="twitter:image" content="${site}assets/nakamoto-hero.png">`;
  if (!/application\/ld\+json/i.test(html)) {
    const data = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebPage", "@id": `${canonical}#webpage`, url: canonical, name: title, description,
          isPartOf: { "@type": "WebSite", "@id": `${site}#website`, name: "NAKAMOTO", url: site },
          publisher: { "@type": "Organization", "@id": `${site}#organization`, name: "NAKAMOTO", url: site } },
        { "@type": "BreadcrumbList", itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site },
          { "@type": "ListItem", position: 2, name: title.replace(/\s*\|\s*NAKAMOTO.*$/i, ""), item: canonical }
        ] }
      ]
    };
    tags += `\n    <script type="application/ld+json">${JSON.stringify(data)}</script>`;
    structured += 1;
  }
  if (tags) {
    html = html.replace(/<\/head>/i, `${tags}\n  </head>`);
    fs.writeFileSync(file, html);
  }
}

console.log(JSON.stringify({ pages: files.length, socialPreviewsAdded: social, structuredDataAdded: structured }));
