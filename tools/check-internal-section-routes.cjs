const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pages = ['index.html', 'investing.html', 'sections.html', 'start.html', 'trading-academy.html', 'money-library/index.html', 'daily-section-dashboards.html', 'daily-operations.html', 'daily-operations-2026-09-21.html'];
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert(!html.includes('August 19 Daily Check'), `${page}: stale lead block`);
  assert(!html.includes('Today’s checklist · 17 September 2026'), `${page}: stale review label`);
  assert(!html.includes('Open Today’s Checklist'), `${page}: stale hero action`);
  if (page.startsWith('daily-')) {
    for (const link of html.matchAll(/href="([^"#]+\.html)"/g)) {
      if (/^https?:\/\//.test(link[1])) continue;
      assert(fs.existsSync(path.resolve(root, path.dirname(page), link[1])), `${page}: missing ${link[1]}`);
    }
  }
  if (html.includes('id="research-archive-title"')) {
    assert.equal(html.match(/id="research-archive-title"/g).length, 1, `${page}: duplicate archive heading`);
    for (const href of html.matchAll(/<section class="page-section daily-section-refresh" aria-labelledby="research-archive-title">[\s\S]*?<\/section>/g)) {
      for (const link of href[0].matchAll(/href="([^"]+)"/g)) {
        assert(fs.existsSync(path.resolve(root, path.dirname(page), link[1])), `${page}: missing ${link[1]}`);
      }
    }
  }
}
console.log(`Internal section routes verified on ${pages.length} representative pages.`);
