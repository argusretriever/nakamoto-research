const fs = require('fs');

const posts = [
  {
    date: '2026-09-15', human: '15 September 2026', label: 'Retrospective · published 17 Sep',
    title: 'Separate the scheduled event from the published evidence',
    description: 'A retrospective September 15 research exercise for keeping calendar expectations separate from verified results.',
    sections: [
      ['A calendar is a prompt, not evidence', 'A scheduled release tells you when to look, not what the result will be. Record the event, its official publisher, and the expected publication time in one field. Leave the result field empty until the source document is available. This prevents a forecast, headline, or social post from being mistaken for a published fact.'],
      ['Keep three timestamps', 'For each event, record the scheduled time, the time the original source became available, and the time you retrieved it. These timestamps make later reviews reproducible. They also expose stale commentary that appeared before the underlying release.'],
      ['Apply the rule to Bitcoin research', 'A macro calendar can affect the environment around Bitcoin without proving a price direction. Write the mechanism you are testing—liquidity, risk appetite, borrowing costs, or household capacity—and then identify the observation that would support or weaken it. Price alone does not explain the mechanism.'],
      ['Practice', 'Choose one event from the official calendar. Write one expected scenario and one contrary scenario, then leave the outcome blank. After publication, copy only the verified result into the evidence field and write your interpretation separately.']
    ]
  },
  {
    date: '2026-09-16', human: '16 September 2026', label: 'Retrospective · published 17 Sep',
    title: 'Read a policy decision before reading the market reaction',
    description: 'A retrospective September 16 exercise using the official Federal Reserve statement to separate policy facts from market interpretation.',
    sections: [
      ['Start with the decision', 'The Federal Reserve statement published on 16 September recorded a unanimous vote to raise the federal funds target range by 0.25 percentage point to 3.75%–4.00%. Those are source facts. Whether the decision was surprising, restrictive, or positive for Bitcoin is an interpretation that needs additional evidence.'],
      ['Preserve the unit and comparison', 'Write both the size of the change and the resulting range. A 0.25 percentage-point move is 25 basis points; it is not a 25% increase. Clear units prevent a small transcription error from becoming a large analytical error.'],
      ['Observe reaction in a defined window', 'If you study market response, choose the window before looking at the chart: for example, the first hour, the close, or the next 24 hours. Record the Bitcoin price source and retrieval time. A different window may support a different description, so never switch windows silently.'],
      ['Practice', 'Build a two-column note. Put the policy rate, vote, publication date, and official link under “verified facts.” Put your proposed liquidity mechanism and the chosen price-response window under “interpretation to test.”']
    ]
  },
  {
    date: '2026-09-17', human: '17 September 2026', label: 'Published 17 September',
    title: 'Keep published facts and pending releases on separate lines',
    description: 'A September 17 research note on preserving a clean boundary between verified releases, pending events, and Bitcoin observations.',
    sections: [
      ['Use explicit status labels', 'At the 08:29 London check, the Federal Reserve decision and the UK August inflation bulletin were published. The Bank of England decision and US housing release were still pending on their official pages. A good daily note says “published,” “pending,” or “not retrieved”; it does not fill a gap with an expectation.'],
      ['Record the UK inflation result precisely', 'The Office for National Statistics reported August CPI inflation of 3.1% year over year, up from 2.9%, and CPIH of 3.3%, up from 3.1%. Transport, particularly motor fuels, made the largest upward contribution. These figures describe the release; they do not by themselves establish a Bitcoin signal.'],
      ['Timestamp the Bitcoin observation', 'The dated source check recorded a Bitcoin quote of $76,482. A quote without its retrieval time and source is not a durable research observation. Preserve both, and avoid presenting one snapshot as a daily high, low, close, or fair value.'],
      ['Practice', 'Open today’s official-source checklist and create three rows: verified release, pending release, and market observation. Add source and retrieval-time columns. Write any interpretation in a separate paragraph only after every factual row has a status.']
    ]
  }
];

function page(post) {
  const url = `https://nakamatoresearch.com/bitcoin-blog-${post.date}.html`;
  const sectionHtml = post.sections.map(([heading, text]) => `<section><h2>${heading}</h2><p>${text}</p></section>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${post.title} | NAKAMOTO</title><meta name="description" content="${post.description}"><link rel="canonical" href="${url}"><meta property="og:title" content="${post.title}"><meta property="og:description" content="${post.description}"><meta property="og:url" content="${url}"><meta property="og:type" content="article"><meta property="og:site_name" content="NAKAMOTO"><meta property="og:image" content="https://nakamatoresearch.com/assets/nakamoto-hero.png"><meta property="og:image:alt" content="NAKAMOTO Bitcoin research and financial education"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${post.title} | NAKAMOTO"><meta name="twitter:description" content="${post.description}"><meta name="twitter:image" content="https://nakamatoresearch.com/assets/nakamoto-hero.png"><link rel="stylesheet" href="assets/blog-archive.css"><link rel="stylesheet" href="assets/daily-review.css"><link rel="stylesheet" href="assets/share-tools.css"><link rel="alternate" type="application/rss+xml" href="feed.xml" title="NAKAMOTO updates"><script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@type':'BlogPosting',headline:post.title,datePublished:post.date,dateModified:'2026-09-17',author:{'@type':'Organization',name:'NAKAMOTO'},mainEntityOfPage:url,image:'https://nakamatoresearch.com/assets/nakamoto-hero.png',publisher:{'@type':'Organization',name:'NAKAMOTO',url:'https://nakamatoresearch.com/',logo:{'@type':'ImageObject',url:'https://nakamatoresearch.com/assets/bitcoin-logo-bw.svg'}}})}</script><script defer src="assets/share-tools.js"></script></head><body><header class="archive-header"><a class="archive-brand" href="index.html">NAKAMOTO</a><nav aria-label="Primary navigation"><a href="crypto-news-today.html">News</a><a href="bitcoin-blog.html">Blog</a><a href="bitcoin-blog-archive.html">Archive</a><a href="search.html">Search</a></nav></header><main><article><p class="eyebrow">Daily desk · ${post.human}</p><h1>${post.title}</h1><p class="lede">${post.description}</p><p>${post.date === '2026-09-17' ? 'Published' : 'Archive date'} <time datetime="${post.date}">${post.human}</time>.${post.date === '2026-09-17' ? '' : ' Retrospective note published 17 September 2026.'}</p>${sectionHtml}<section><h2>Continue the review</h2><p><a href="today-source-pack-2026-09-17.html">Open the September 17 official-source checklist</a> or <a href="bitcoin-blog-archive.html">browse all 99 blog dates</a>.</p></section><aside class="publication-note">Educational research, not a trading signal or personal recommendation. Verify dates, figures, and current information at the original source.</aside><nav class="date-nav"><a href="bitcoin-blog-${post.date === '2026-09-15' ? '2026-09-14' : post.date === '2026-09-16' ? '2026-09-15' : '2026-09-16'}.html">Previous blog</a><a href="today-source-pack-2026-09-17.html">Official sources</a><a href="daily-operations-2026-09-17.html">Update record</a></nav></article></main><footer><p>NAKAMOTO · Source-led learning without hype.</p><a href="resources.html">Source library</a> · <a href="disclaimer.html">Disclaimer</a> · <a href="contact.html">Contact</a></footer></body></html>`;
}

for (const post of posts) fs.writeFileSync(`bitcoin-blog-${post.date}.html`, page(post));
fs.writeFileSync('bitcoin-blog.html', page(posts[2]));

let archive = fs.readFileSync('bitcoin-blog-archive.html', 'utf8');
archive = archive.replace('96 daily archive slots from 11 June through 14 September 2026.', '99 daily archive slots from 11 June through 17 September 2026.');
archive = archive.replace('Updated 13 September 2026: 56 missing slots now contain clearly labelled retrospective learning notes. The 39 pre-existing dated pages are preserved. Archive dates organize this collection; the new notes were all published on 13 September.', 'Updated 17 September 2026: the archive now covers every date through today. The September 15 and 16 editions are clearly labelled retrospective notes published on September 17; historical pages remain preserved.');
const items = posts.slice().reverse().map(p => `<li><time datetime="${p.date}">${p.human}</time> <span class="badge">${p.label}</span><a href="bitcoin-blog-${p.date}.html">${p.title}</a></li>`).join('');
archive = archive.replace('<ul class="archive-list"><li><time datetime="2026-09-14">', `<ul class="archive-list">${items}<li><time datetime="2026-09-14">`);
fs.writeFileSync('bitcoin-blog-archive.html', archive);

let newsArchive = fs.readFileSync('news-archive.html', 'utf8').replace('Browse all 95 blog dates', 'Browse all 99 blog dates');
fs.writeFileSync('news-archive.html', newsArchive);

let search = fs.readFileSync('search.html', 'utf8');
const searchCards = posts.slice().reverse().map(p => `<a class="action-card" href="bitcoin-blog-${p.date}.html" data-tags="bitcoin blog ${p.date} September research evidence official sources"><span>Bitcoin blog</span><h3>${p.title}</h3><p>${p.description}</p><em>Read blog</em></a>`).join('');
search = search.replace('<div class="page-grid">', `<div class="page-grid">${searchCards}`);
fs.writeFileSync('search.html', search);

let feed = fs.readFileSync('feed.xml', 'utf8');
const feedItems = posts.slice().reverse().map(p => `<item><title>${p.title}</title><link>https://nakamatoresearch.com/bitcoin-blog-${p.date}.html</link><guid>https://nakamatoresearch.com/bitcoin-blog-${p.date}.html</guid><pubDate>Thu, 17 Sep 2026 09:00:00 GMT</pubDate><description>${p.description}</description></item>`).join('');
feed = feed.replace('<item><title>September 17 official source checklist', `${feedItems}<item><title>September 17 official source checklist`);
fs.writeFileSync('feed.xml', feed);

let sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const sitemapItems = posts.map(p => `  <url><loc>https://nakamatoresearch.com/bitcoin-blog-${p.date}.html</loc><lastmod>2026-09-17</lastmod></url>`).join('\n');
sitemap = sitemap.replace('</urlset>', `${sitemapItems}\n</urlset>`);
fs.writeFileSync('sitemap.xml', sitemap);

let log = fs.readFileSync('news-posted-log.md', 'utf8');
log += '\n\n### Missing blog closure\n\nAdded the September 15 and 16 retrospective learning notes and the September 17 daily blog. The continuous archive now contains 99 dates from June 11 through September 17, with retrospective publication labels preserved.\n';
fs.writeFileSync('news-posted-log.md', log);

console.log('Published three blog editions and refreshed discovery routes.');
