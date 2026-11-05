const fs=require('fs');const path=require('path');const assert=require('assert');
const dates=Array.from({length:27},(_,i)=>new Date(Date.UTC(2026,8,18+i)).toISOString().slice(0,10));
const archive=fs.readFileSync('bitcoin-blog-archive.html','utf8');
const sitemap=fs.readFileSync('sitemap.xml','utf8');
const titles=new Set();
for(const date of dates){
 const file=`bitcoin-blog-${date}.html`,html=fs.readFileSync(file,'utf8');
 assert(html.includes(`datetime="${date}"`),`${file}: study date`);
 assert(html.includes('datePublished":"2026-10-15"'),`${file}: real publication date`);
 assert(html.includes('Retrospective exercise'),`${file}: archive label`);
 assert(html.includes('https://')&&html.includes('Start with the source'),`${file}: original source`);
 assert(archive.includes(`href="${file}"`),`${file}: archive link`);
 assert(sitemap.includes(`https://nakamatoresearch.com/${file}`),`${file}: sitemap`);
 const title=html.match(/<h1>([^<]+)<\/h1>/)?.[1];assert(title&&!titles.has(title),`${file}: duplicate or missing title`);titles.add(title);
 for(const match of html.matchAll(/href="([^"]+)"/g)){
  const href=match[1];if(/^(https?:|mailto:|#)/.test(href))continue;
  assert(fs.existsSync(path.resolve(path.dirname(file),href.split('#')[0])),`${file}: missing ${href}`);
 }
}
const catchUpDates=['2026-10-16','2026-10-17','2026-10-18','2026-10-19','2026-10-20','2026-10-22','2026-10-23'];
for(const date of catchUpDates){
 const file=`bitcoin-blog-${date}.html`,html=fs.readFileSync(file,'utf8');
 assert(html.includes(`Archive study date: <time datetime="${date}"`),`${file}: archive date`);
 assert(html.includes('datePublished":"2026-10-24"'),`${file}: actual publication date`);
 assert(html.includes('Retrospective exercise'),`${file}: retrospective label`);
 assert(html.includes('Original source</a>'),`${file}: source`);
 assert(archive.includes(`href="${file}"`),`${file}: archive link`);
 assert(sitemap.includes(`https://nakamatoresearch.com/${file}`),`${file}: sitemap`);
 const title=html.match(/<h1>([^<]+)<\/h1>/)?.[1];assert(title&&!titles.has(title),`${file}: duplicate or missing title`);titles.add(title);
 for(const [,href] of html.matchAll(/href="([^"]+)"/g)){
  if(/^(https?:|mailto:|#)/.test(href))continue;
  assert(fs.existsSync(path.resolve(path.dirname(file),href.split('#')[0])),`${file}: missing ${href}`);
 }
}
const october=archive.match(/<section id="month-2026-10">.*?<\/section>/)?.[0];
assert(october,'October archive section');
const octoberDates=[...october.matchAll(/<li><time datetime="(2026-10-\d{2})"/g)].map(m=>m[1]);
assert.deepStrictEqual(octoberDates,[...octoberDates].sort().reverse(),'October archive order');
console.log(`Verified ${dates.length+catchUpDates.length} distinct retrospective articles, labels, sources, links, archive, and sitemap.`);
