const fs = require("fs");

const trackerFiles = [
  "news-archive.html", "daily-operations-master.html", "daily-section-dashboards.html",
  "section-scorecards.html", "section-update-archives.html", "source-tracker.html",
  "priority-sector-indexing-queue.html", "sections.html", "search.html",
  "most-read-today.html", "newsletter-daily-brief.html", "weekly-review.html",
  "reader-center.html", "reader-dashboard.html", "return-tomorrow.html",
  "calendars.html", "macroeconomics.html"
];

const block = (home = false) => `<section class="page-section" data-review="2026-09-17"><div class="section-heading"><p class="section-kicker">Today’s checklist · 17 September 2026</p><h2${home ? ' id="latest-review-title"' : ""}>Verify the result before interpreting it.</h2><p>The Federal Reserve decision and UK inflation release are published. The Bank of England and US housing releases remain clearly labelled pending at the 08:29 London check.</p></div><div class="page-grid"><a class="action-card" href="today-source-pack-2026-09-17.html"><h3>Official-source checklist</h3><p>See published facts, pending releases, and retrieval times.</p><em>Open checklist</em></a><a class="action-card" href="macroeconomics.html"><h3>Compare rates and inflation</h3><p>Keep policy, prices, and interpretation in separate notes.</p><em>Open macro route</em></a><a class="action-card" href="calendars.html"><h3>Recheck after publication</h3><p>Use the original release page before recording an outcome.</p><em>Open calendar route</em></a></div></section>`;

function replaceReview(file, home = false) {
  let html = fs.readFileSync(file, "utf8");
  const pattern = /<section class="page-section" data-review="2026-09-14">[\s\S]*?<\/section>/;
  if (!pattern.test(html)) throw new Error(`Missing September 14 review block in ${file}`);
  html = html.replace(pattern, block(home));
  fs.writeFileSync(file, html);
}

trackerFiles.forEach((file) => replaceReview(file));
replaceReview("index.html", true);

let home = fs.readFileSync("index.html", "utf8");
home = home.replace('<a class="button primary" href="news-2026-09-14.html">Read the Latest Review</a>', '<a class="button primary" href="today-source-pack-2026-09-17.html">Open Today’s Checklist</a>');
fs.writeFileSync("index.html", home);

const datedOps = fs.readFileSync("daily-operations-2026-09-17.html", "utf8");
fs.writeFileSync("daily-operations.html", datedOps.replaceAll("daily-operations-2026-09-17.html", "daily-operations.html"));

let script = fs.readFileSync("script.js", "utf8");
const searchRow = '  { title: "September 17 Official Source Checklist", label: "Sources", href: "today-source-pack-2026-09-17.html", summary: "Federal Reserve decision, UK inflation, pending Bank of England and US housing releases, and a dated Bitcoin observation.", terms: "september 17 2026 federal reserve fomc uk inflation ons bank of england census housing bitcoin official sources checklist" },\n';
const marker = "const searchDestinations = [\n";
if (!script.includes(searchRow.trim())) script = script.replace(marker, marker + searchRow);
fs.writeFileSync("script.js", script);

let sitemap = fs.readFileSync("sitemap.xml", "utf8");
const sitemapRow = '  <url><loc>https://nakamatoresearch.com/today-source-pack-2026-09-17.html</loc><lastmod>2026-09-17</lastmod></url>\n';
if (!sitemap.includes("today-source-pack-2026-09-17.html")) sitemap = sitemap.replace("</urlset>", sitemapRow + "</urlset>");
fs.writeFileSync("sitemap.xml", sitemap);

let feed = fs.readFileSync("feed.xml", "utf8");
feed = feed.replace(/<lastBuildDate>.*?<\/lastBuildDate>/, "<lastBuildDate>Thu, 17 Sep 2026 07:29:58 GMT</lastBuildDate>");
if (!feed.includes("today-source-pack-2026-09-17.html")) {
  const item = '<item><title>September 17 official source checklist</title><link>https://nakamatoresearch.com/today-source-pack-2026-09-17.html</link><guid>https://nakamatoresearch.com/today-source-pack-2026-09-17.html</guid><pubDate>Thu, 17 Sep 2026 07:29:58 GMT</pubDate><description>Federal Reserve decision, UK inflation, pending Bank of England and US housing releases, and a dated Bitcoin observation.</description></item>';
  feed = feed.replace("<item>", item + "<item>");
}
fs.writeFileSync("feed.xml", feed);

fs.appendFileSync("DAILY_OPERATIONS_QUICK_LIST.md", "\n## September 17, 2026\n\n- Verified the September 16 Federal Reserve statement and August UK inflation bulletin at original sources.\n- Recorded Bank of England and US housing releases as pending at the 08:29 London check.\n- Published the dated source checklist and refreshed current checklist, homepage, trackers, search, sitemap, and RSS routes.\n- Final technical, Git, deployment, and live-page checks are required before completion.\n");

fs.appendFileSync("news-posted-log.md", "\n## September 17, 2026 — checklist update\n\nPublished a dated official-source checklist. Federal Reserve and ONS results are recorded from original releases; Bank of England and Census outcomes remain pending at the 08:29 London check. Technical and live verification are required before completion.\n");

console.log(JSON.stringify({ trackerFiles: trackerFiles.length, homepage: true, sourcePage: true, operationsPage: true }));
