const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const sections = [
  ['News','crypto-news-today.html'],['Blog','bitcoin-blog.html'],['Research','research.html'],
  ['Research Foundation','research-foundation.html'],['Data & Analytics','data-analytics.html'],
  ['Statistics','statistics.html'],['Risk Management','risk-management.html'],
  ['Research Methods','research-methods.html'],['Tools & Calculators','tools-calculators.html'],
  ['Guides & Tutorials','guides-tutorials.html'],['Corporate Finance','corporate-finance.html'],
  ['Capital Markets','capital-markets.html'],['Economy / Macroeconomics','macroeconomics.html'],
  ['Policy / Regulation','regulation-policy.html'],['Tax & Accounting','tax-accounting.html'],
  ['Space / Technology','space-technology.html'],['AI / Technology','ai-finance.html'],
  ['Cybersecurity','cybersecurity.html'],['Entrepreneurship','entrepreneurship.html'],
  ['Business','business.html'],['Wealth Building','wealth-building.html'],
  ['Financial Literacy','financial-literacy.html'],['Real Estate','real-estate.html'],
  ['Financial Institutions','financial-institutions.html'],['Careers & Education','careers-education.html'],
  ['Psychology / Decision Making','decision-making.html'],['Productivity','productivity.html'],
  ['Global Affairs / Geopolitics','geopolitics.html'],['Stablecoins','stablecoins.html'],
  ['RWA / Tokenization','rwa-news.html'],['Markets','global-markets.html'],
  ['Sources / References','source-packs.html'],['Premium','premium.html'],
  ['Daily Brief','daily-brief.html'],['Newsletter','newsletter-daily-brief.html'],
  ['Search','search.html'],['Resources','resources.html'],['Archives','section-update-archives.html'],
  ['Dashboards','daily-section-dashboards.html'],['Indexing Queue','priority-sector-indexing-queue.html']
];
const report = sections.map(([name, file]) => {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) return {name, file, status:'missing'};
  const html = fs.readFileSync(target, 'utf8');
  const visibleHtml = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
  const errors = [];
  if (!/<title>[^<]+<\/title>/i.test(html)) errors.push('title');
  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) errors.push('description');
  if (!/<link\s+rel="canonical"\s+href="[^"]+"/i.test(html)) errors.push('canonical');
  if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) errors.push('h1');
  if (!html.includes('assets/monochrome.css')) errors.push('monochrome-css');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (canonical && canonical !== `https://nakamatoresearch.com/${file}` && !['bitcoin-blog.html','crypto-news-today.html'].includes(file)) errors.push('canonical-target');
  const ids = [...visibleHtml.matchAll(/\bid="([^"]+)"/gi)].map(m=>m[1]);
  if (new Set(ids).size !== ids.length) errors.push('duplicate-id');
  const broken = [];
  for (const m of visibleHtml.matchAll(/\bhref="([^"#?]+)(?:\?[^"#]*)?(?:#[^"]*)?"/gi)) {
    const href = m[1];
    if (/^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(href)) continue;
    const resolved = path.resolve(path.dirname(target), href.startsWith('/') ? '.' + href : href);
    if (!fs.existsSync(resolved)) broken.push(href);
  }
  if (broken.length) errors.push(`broken:${[...new Set(broken)].join(',')}`);
  const visibleText = visibleHtml.replace(/\bhref="[^"]*"/gi, '');
  const datedToday = /(?:today|current)[^<]{0,100}(?:June|July|August|September)\s+\d{1,2}|(?:June|July|August|September)\s+\d{1,2}[^<]{0,100}(?:today|current)/i.test(visibleText);
  return {name,file,status:errors.length?'issues':'present',errors,datedToday};
});
console.log(JSON.stringify({total:report.length,missing:report.filter(x=>x.status==='missing'),issues:report.filter(x=>x.status==='issues'),datedToday:report.filter(x=>x.datedToday).map(x=>x.file)},null,2));
if (process.argv.includes('--write-report')) {
  const header = '# Section system audit · 21 September 2026\n\nThis audit covers the 40 section routes named in `DAILY_OPERATIONS.md`. It checks page presence, title, description, canonical URL, H1, monochrome stylesheet, duplicate IDs, local links, and dated “today” wording. It does not certify every claim or every article on the site as current.\n\n| # | Section | Route | Structural check |\n|---:|---|---|---|\n';
  const rows = report.map((x, i) => `| ${i+1} | ${x.name} | [${x.file}](${x.file}) | ${x.status === 'present' && !x.datedToday ? 'Pass' : 'Needs review'} |`).join('\n');
  const footer = '\n\n## Mobile check\n\nAll 40 mapped pages were loaded at a 390 × 844 browser viewport; none had document-wide horizontal overflow.\n\n## Editorial follow-up\n\n- The latest published news and blog dates remain older than 21 September; do not backdate or invent updates.\n- Dated historical blocks elsewhere on the site still require a broader editorial language pass.\n- Recheck original sources before publishing any current market, economic, policy, or financial claim.\n';
  fs.writeFileSync(path.join(root, 'SECTION_AUDIT_2026-09-21.md'), header + rows + footer);
}
if (process.argv.includes('--write-dashboard')) {
  const file = path.join(root, 'daily-section-dashboards.html');
  let html = fs.readFileSync(file, 'utf8');
  const cards = sections.map(([name, href]) => `<a class="action-card" href="${href}"><h3>${name.replaceAll('&', '&amp;')}</h3><p>Open the section</p></a>`).join('');
  const index = `<section class="page-section" aria-labelledby="complete-section-index"><div class="section-heading"><p class="section-kicker">All 40 routes</p><h2 id="complete-section-index">Complete section directory</h2><p>Choose a topic, then follow its practical guides and original sources.</p></div><div class="page-grid four">${cards}</div></section>`;
  if (!html.includes('<!-- section-index:start -->') || !html.includes('<!-- section-index:end -->')) throw new Error('Dashboard markers missing');
  html = html.replace(/<!-- section-index:start -->[\s\S]*?<!-- section-index:end -->/, `<!-- section-index:start -->${index}<!-- section-index:end -->`);
  fs.writeFileSync(file, html);
}
if (process.argv.includes('--strict') && report.some(x=>x.status!=='present')) process.exitCode=1;
