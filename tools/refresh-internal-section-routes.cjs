const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

let hubCount = 0;
let reviewCount = 0;
let practiceCount = 0;
for (const file of walk(process.cwd()).filter(file => file.endsWith('.html'))) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;
  const prefix = path.relative(path.dirname(file), process.cwd()).replaceAll('\\', '/');
  const root = prefix ? `${prefix}/` : '';

  html = html.replace(/<section class="page-section daily-section-refresh">[\s\S]*?<\/section>/, match => {
    if (!match.includes('August 19 Daily Check')) return match;
    hubCount++;
    return `<section class="page-section daily-section-refresh" aria-labelledby="research-archive-title"><div class="section-heading"><p class="section-kicker">Research archive</p><h2 id="research-archive-title">Start with a verified source or a practical guide.</h2><p>Browse the dated research archive, then use the current source page to check what has changed since publication.</p></div><div class="page-grid"><a class="action-card" href="${root}news-archive.html"><span>News</span><h3>Browse dated source reviews.</h3><p>Read each edition with its publication date and original sources.</p><em>Open news archive</em></a><a class="action-card" href="${root}source-packs.html"><span>Sources</span><h3>Check the evidence trail.</h3><p>Find source packs and verify current information at the publisher.</p><em>Open source packs</em></a><a class="action-card" href="${root}bitcoin-blog-archive.html"><span>Learning</span><h3>Explore the blog archive.</h3><p>Choose a dated exercise or evergreen explanation.</p><em>Browse blogs</em></a></div></section>`;
  });

  if (html.includes('data-review="2026-09-17"')) {
    html = html.replaceAll('Today’s checklist · 17 September 2026', 'Source review · 17 September 2026');
    html = html.replaceAll('The Federal Reserve decision and UK inflation release are published. The Bank of England and US housing releases remain clearly labelled pending at the 08:29 London check.', 'At the 08:29 London check on 17 September, the Federal Reserve decision and UK inflation release were published; the Bank of England and US housing releases had not yet appeared on their official pages.');
    html = html.replaceAll('See published facts, pending releases, and retrieval times.', 'Read the timestamped facts, pending-at-check labels, and original sources.');
    reviewCount++;
  }

  if (path.basename(file) === 'index.html') {
    html = html.replace('Open Today’s Checklist', 'Open 17 September Source Review');
  }

  if (html.includes('daily-practice-2026-09-14')) {
    html = html.replaceAll('This week\'s evidence calendar', '14 September evidence calendar');
    practiceCount++;
  }

  if (html !== original) fs.writeFileSync(file, html);
}

console.log(JSON.stringify({hubsRefreshed: hubCount, datedReviewsCorrected: reviewCount, practiceLinksRelabeled: practiceCount}));
