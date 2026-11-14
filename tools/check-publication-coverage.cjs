const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = n => fs.readFileSync(path.join(root, n), 'utf8');
const archive = read('bitcoin-blog-archive.html'), news = read('news-archive.html');
const sitemap = read('sitemap.xml'), feed = read('feed.xml'), search = read('script.js');
let count = 0;
for (let date = new Date('2026-06-11T00:00:00Z'); date <= new Date('2026-11-14T00:00:00Z'); date.setUTCDate(date.getUTCDate() + 1)) {
  const file = `bitcoin-blog-${date.toISOString().slice(0, 10)}.html`;
  assert(fs.existsSync(path.join(root, file)), `${file}: missing study`);
  assert(archive.includes(`href="${file}"`), `${file}: absent from archive`);
  count++;
}
assert(archive.includes(`${count} archive studies`), 'visible archive count is stale');
for (const day of ['06', '08', '09', '10', '11', '12']) {
  const slot = `2026-11-${day}`;
  for (const [prefix, index] of [['news', news], ['bitcoin-blog', archive]]) {
    const file = `${prefix}-${slot}.html`;
    const html = read(file);
    assert(html.includes('Published <time datetime="2026-11-12">12 November 2026</time>'), `${file}: incorrect publication date`);
    if (day !== '12') assert(html.includes(`Retrospective archive slot <time datetime="${slot}">`));
    for (const content of [index, sitemap, feed, search]) assert(content.includes(file), `${file}: missing discovery link`);
    const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.datePublished, '2026-11-12');
    assert.equal(schema.mainEntityOfPage, `https://nakamatoresearch.com/${file}`);
    assert(schema.citation.length);
  }
}
for (const prefix of ['news', 'bitcoin-blog', 'today-source-pack']) {
  const file = `${prefix}-2026-11-07.html`, html = read(file);
  assert(html.includes('Published <time datetime="2026-11-07">7 November 2026</time>'), `${file}: publication date absent`);
  for (const content of [sitemap, search]) assert(content.includes(file), `${file}: missing discovery`);
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    assert.equal(JSON.parse(json).datePublished, '2026-11-07');
  }
}
assert(read('news-2026-11-05.html').includes('Later update'), 'pre-release guide needs a result link');
const titles = new Set();
for (const date of ['2026-10-31', '2026-11-01', '2026-11-02', '2026-11-03']) {
  for (const prefix of ['news', 'bitcoin-blog']) {
    const file = `${prefix}-${date}.html`, html = read(file);
    const title = html.match(/<h1>([^<]+)<\/h1>/)?.[1];
    assert(title && !titles.has(title), `${file}: missing/duplicate headline`); titles.add(title);
    assert(html.includes('Written 3 November 2026'), `${file}: actual writing date absent`);
    assert(html.includes(`datetime="${date}"`), `${file}: archive slot absent`);
    if (date !== '2026-11-03') assert(html.includes('Retrospective archive slot'), `${file}: retrospective label absent`);
    assert((prefix === 'news' ? news : archive).includes(`href="${file}"`), `${file}: archive entry absent`);
    for (const [name, content] of [['sitemap', sitemap], ['feed', feed], ['search', search]]) assert(content.includes(file), `${file}: absent from ${name}`);
    assert(/https:\/\/(www\.ons\.gov\.uk|www\.bankofengland\.co\.uk)\//.test(html), `${file}: primary source absent`);
    for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      const schema = JSON.parse(json);
      assert.equal(schema.datePublished, '2026-11-03');
      assert.equal(schema.mainEntityOfPage, `https://nakamatoresearch.com/${file}`);
    }
  }
}
assert(!/5 November[^<]*\b(decided|cut|raised|held)\b/i.test(read('news-2026-11-03.html')), 'upcoming event presented as an outcome');
console.log(`Verified ${count} Blog slots and 8 new articles: unique headlines, actual dates, sources and discovery.`);
