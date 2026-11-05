const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const dates = ['16', '17', '18', '19', '20', '22', '23'];
const archive = read('news-archive.html');
const sitemap = read('sitemap.xml');
const feed = read('feed.xml');
const pack = read('today-source-pack-2026-10-24.html');
const tracker = read('source-tracker.html');
const search = read('search.html');
for (const day of dates) {
  const name = `news-2026-10-${day}.html`;
  const html = read(name);
  const schemaText = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1];
  assert.ok(schemaText, `${name}: missing structured data`);
  const schema = JSON.parse(schemaText);
  assert.equal(schema.datePublished, '2026-10-24', `${name}: publication date must be actual date`);
  assert.equal(schema.dateModified, '2026-10-24');
  assert.ok(schema.citation?.startsWith('https://'), `${name}: missing original-source citation`);
  assert.ok(html.includes(`href="${schema.citation}"`), `${name}: citation not linked in article`);
  assert.ok(pack.includes(`href="${schema.citation}"`), `${name}: source missing from dated pack`);
  assert.ok(tracker.includes(`href="${schema.citation}"`), `${name}: source missing from tracker`);
  assert.ok(html.includes(`datetime="2026-10-${day}"`), `${name}: missing original-source date`);
  assert.ok(html.includes('it was not live on'), `${name}: missing retrospective disclosure`);
  assert.ok(html.includes('https://') && html.includes('original'), `${name}: missing original source`);
  for (const [label, text] of [['archive', archive], ['sitemap', sitemap], ['feed', feed], ['source pack', pack], ['tracker', tracker], ['search', search]]) {
    assert.ok(text.includes(name), `${label}: missing ${name}`);
  }
}
console.log(`Verified ${dates.length} retrospective news pages, actual publication dates, sources, and discovery links.`);
