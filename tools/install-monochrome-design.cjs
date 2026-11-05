const fs = require('fs');
const path = require('path');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const root = process.cwd();
const pages = walk(root).filter((file) => file.endsWith('.html'));
let changed = 0;
let skippedVerification = 0;

for (const file of pages) {
  if (/google[a-z0-9]+\.html$/i.test(path.basename(file))) {
    skippedVerification++;
    continue;
  }
  let html = fs.readFileSync(file, 'utf8');
  if (/data-design-system="monochrome"/i.test(html)) continue;
  const relative = path.relative(path.dirname(file), path.join(root, 'assets', 'monochrome.css')).replaceAll(path.sep, '/');
  const link = `<link rel="stylesheet" href="${relative}" data-design-system="monochrome">`;
  if (!/<\/head>/i.test(html)) throw new Error(`Missing </head>: ${path.relative(root, file)}`);
  html = html.replace(/<\/head>/i, `${link}</head>`);
  fs.writeFileSync(file, html);
  changed++;
}

console.log(JSON.stringify({ pagesFound: pages.length, pagesChanged: changed, verificationFilesPreserved: skippedVerification }));

const homepagePath = path.join(root, 'index.html');
let homepage = fs.readFileSync(homepagePath, 'utf8');
homepage = homepage
  .replaceAll('all 96 blog dates', 'all 99 blog dates')
  .replaceAll('96 dates', '99 dates')
  .replaceAll('All 96 blog dates', 'All 99 blog dates')
  .replaceAll('June 11–September 14, including 56 retrospective learning notes published September 13.', 'June 11–September 17, with retrospective publication labels shown clearly.')
  .replaceAll('Blog archive · complete through 14 September', 'Blog archive · complete through 17 September')
  .replaceAll('Archive slots run from June 11 to September 14. The new notes are clearly labelled as educational retrospectives published September 13, rather than reports written on those earlier dates.', 'Archive slots run from June 11 to September 17. Retrospective notes are clearly labelled with their actual publication date.')
  .replaceAll('Find all 96 dated pages and distinguish original posts from retrospective additions.', 'Find all 99 dated pages and distinguish original posts from retrospective additions.');
fs.writeFileSync(homepagePath, homepage);

const missingLinks = [];
for (const file of pages) {
  if (/google[a-z0-9]+\.html$/i.test(path.basename(file))) continue;
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/<link rel="stylesheet" href="([^"]+)" data-design-system="monochrome">/i);
  if (!match || !fs.existsSync(path.resolve(path.dirname(file), match[1]))) {
    missingLinks.push(path.relative(root, file));
  }
}
if (missingLinks.length) throw new Error(`Broken monochrome stylesheet links: ${missingLinks.join(', ')}`);
console.log(JSON.stringify({ styledPagesVerified: pages.length - skippedVerification, brokenMonochromeLinks: 0 }));
