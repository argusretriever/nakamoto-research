from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://nakamatoresearch.com/'
ITEMS = [
    ('16', 'Bank of England speech discusses dollar dominance and financial innovation', 'Bank of England', 'speech', 'https://www.bankofengland.co.uk/speech/2026/october/financial-innovation-dollar-dominance-and-their-uk-monetary-policy-implications', 'Catherine Mann spoke about financial innovation, dollar dominance and possible implications for UK monetary policy.', 'A policymaker speech explains an argument. It does not record a Monetary Policy Committee vote, change Bank Rate, or establish a market outcome.', 'Compare the speech date and speaker with an actual MPC decision before describing UK policy.'),
    ('17', 'IMF committee briefing reviews global challenges', 'International Monetary Fund', 'press briefing', 'https://mediacenter.imf.org/news/imf-imfc-press-briefing/s/6c812df6-f0e8-4a3b-b663-22c9e888b440', 'The IMF published an International Monetary and Financial Committee press briefing from its annual meetings in Bangkok. The committee chair discussed global challenges and resilience.', 'A briefing is a record of remarks, not a country-specific rate decision or a forecast for Bitcoin.', 'Check the speaker, meeting context and any accompanying statement before making a policy claim.'),
    ('18', 'World Bank signs agreement for 2029 annual meetings in Abu Dhabi', 'World Bank', 'press release', 'https://www.worldbank.org/en/news/press-release/2026/10/18/uae-signs-agreement-to-host-2029-world-bank-group-annual-meetings', 'The United Arab Emirates signed the agreement to host the 2029 World Bank Group and IMF annual meetings in Abu Dhabi.', 'The 18 October development was the formal host agreement. It was not the first selection of the host, which had already been announced earlier in 2026, and it is not an investment policy decision.', 'Separate a formal signing from the earlier selection announcement when building a chronology.'),
    ('19', 'Bank staff examine inflation in central sectors with rigid prices', 'Bank of England', 'staff analysis', 'https://www.bankofengland.co.uk/bank-insights/2026/inflation-in-central-sectors-with-rigid-prices', 'Bank of England staff published an analysis of inflation in sectors with relatively rigid prices and central positions in the production network.', 'The Bank labels Bank Insights articles as staff analysis that does not necessarily represent Monetary Policy Committee members’ views. This is not a rate announcement.', 'Read the method and reference period before comparing this measure with headline CPI or an MPC forecast.'),
    ('20', 'ONS labour release shows fewer vacancies across the latest three-month period', 'Office for National Statistics', 'statistical bulletin', 'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/employmentandemployeetypes/bulletins/uklabourmarket/october2026', 'The ONS estimated 691,000 UK vacancies in July to September 2026, down 21,000 from April to June. Its employment and unemployment estimates refer to June to August, a different period.', 'Vacancies are positions, not people. The ONS also publishes provisional early payroll estimates; mixing these measures or periods would overstate what the bulletin says.', 'Write each figure beside its geography, measurement period and revision status before comparing it with inflation or markets.'),
    ('22', 'ONS business survey reports turnover changes and fuel-price concern', 'Office for National Statistics', 'statistics in development', 'https://www.ons.gov.uk/businessindustryandtrade/business/businessservices/bulletins/businessinsightsandimpactontheukeconomy/22october2026', 'In the ONS Business Insights and Conditions Survey, 17% of trading businesses reported increased turnover in September from the previous month. In early October, 72% of businesses reported concern about fuel prices.', 'The bulletin is labelled statistics in development and reports survey responses. These percentages do not measure total national turnover or actual future fuel-price changes.', 'Keep the survey question, response group and collection window visible when quoting a percentage.'),
    ('23', 'ONS retail volumes fall in September while the quarter rises', 'Office for National Statistics', 'statistical bulletin', 'https://www.ons.gov.uk/businessindustryandtrade/retailindustry/bulletins/retailsales/september2026', 'ONS estimated Great Britain retail-sales volumes fell 0.4% in September from August, while July to September volumes rose 0.7% against April to June. August’s monthly rise was revised to 0.7% from 0.5%.', 'Monthly and quarterly comparisons answer different questions. Volume estimates remove price effects and do not equal cash spent; revisions can change earlier comparisons.', 'Record the comparison period and data vintage before relating retail activity to inflation or policy.'),
]

def write(name, value):
    (ROOT / name).write_text(value, encoding='utf-8')

for day, headline, publisher, kind, source, finding, limit, method in ITEMS:
    slug = f'news-2026-10-{day}.html'
    url = BASE + slug
    schema = {'@context':'https://schema.org','@type':'NewsArticle','headline':headline,'datePublished':'2026-10-24','dateModified':'2026-10-24','author':{'@type':'Organization','name':'NAKAMOTO'},'mainEntityOfPage':url,'citation':source}
    html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{escape(headline)} | NAKAMOTO</title><meta name="description" content="Retrospective {day} October source review published 24 October 2026. Read the original {escape(publisher)} {escape(kind)} with its limits."><link rel="canonical" href="{url}"><meta property="og:type" content="article"><meta property="og:title" content="{escape(headline)}"><meta property="og:url" content="{url}"><meta name="twitter:card" content="summary"><link rel="stylesheet" href="assets/blog-archive.css"><link rel="stylesheet" href="assets/daily-review.css"><link rel="stylesheet" href="assets/monochrome.css" data-design-system="monochrome"><script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body><header class="archive-header"><a class="archive-brand" href="index.html">NAKAMOTO</a><nav aria-label="Primary navigation"><a href="crypto-news-today.html">News</a><a href="news-archive.html">Archive</a><a href="bitcoin-blog.html">Blog</a><a href="source-packs.html">Sources</a></nav></header><main><article><p class="eyebrow">Retrospective source review · {day} October 2026</p><h1>{escape(headline)}</h1><p class="lede">A dated original-source development, reviewed after its release. This article was written and published on <time datetime="2026-10-24">24 October 2026</time>; it was not live on {day} October.</p><p>Original source date: <time datetime="2026-10-{day}">{day} October 2026</time>. Publisher: {escape(publisher)}. Document type: {escape(kind)}.</p><section><h2>What the original source says</h2><p>{escape(finding)}</p><p>Read the <a href="{source}">original {escape(publisher)} {escape(kind)}</a> for the full wording, context and any subsequent correction.</p></section><section><h2>What this does not establish</h2><p>{escape(limit)}</p></section><section><h2>Reader check</h2><p>{escape(method)}</p><p>Continue with the <a href="bitcoin-blog-2026-10-{day}.html">{day} October learning note</a>, the <a href="news-archive.html">dated news archive</a>, or the <a href="today-source-pack-2026-10-24.html">24 October source pack</a>.</p></section><aside class="publication-note">Educational source review only. Original-source date and NAKAMOTO publication date are separate. No live quote, trading signal or personal recommendation is asserted.</aside><nav class="date-nav"><a href="news-archive.html">All news reviews</a><a href="crypto-news-today.html">Current news page</a><a href="daily-operations.html">Operations</a></nav></article></main><footer><p>NAKAMOTO · Source-led research.</p><a href="disclaimer.html">Disclaimer</a> · <a href="contact.html">Contact</a></footer></body></html>
'''
    write(slug, html)

archive = ROOT / 'news-archive.html'
html = archive.read_text(encoding='utf-8')
html = html.replace('Browse all 99 blog dates', 'Browse all 136 blog studies')
cards = ''.join(f'<a class="action-card" href="news-2026-10-{day}.html"><h3>{day} October: {escape(headline)}</h3><p>{escape(publisher)} {escape(kind)} · reviewed and published 24 October 2026.</p><em>Read source review</em></a>' for day, headline, publisher, kind, *_ in reversed(ITEMS))
section = '<section class="page-section" id="october-2026-retrospective-news"><div class="section-heading"><p class="section-kicker">16–23 October original sources · articles published 24 October</p><h2>Retrospective October source reviews</h2><p>Seven source-date gaps now have individual reviews. These articles were published on 24 October, not on the dates in their URLs.</p></div><div class="page-grid">' + cards + '</div></section>'
needle = '<section class="page-section"><div class="section-heading"><p class="section-kicker">21 October 2026</p>'
assert needle in html
if 'id="october-2026-retrospective-news"' not in html:
    html = html.replace(needle, section + needle, 1)
write('news-archive.html', html)

sitemap = ROOT / 'sitemap.xml'
xml = sitemap.read_text(encoding='utf-8')
rows = ''.join(f'  <url><loc>{BASE}news-2026-10-{day}.html</loc><lastmod>2026-10-24</lastmod></url>\n' for day, *_ in ITEMS)
if 'news-2026-10-16.html' not in xml:
    write('sitemap.xml', xml.replace('  <url><loc>https://nakamatoresearch.com/news-2026-10-24.html', rows + '  <url><loc>https://nakamatoresearch.com/news-2026-10-24.html', 1))

feed = ROOT / 'feed.xml'
xml = feed.read_text(encoding='utf-8')
rows = ''.join(f'<item><title>{escape(headline)}</title><link>{BASE}news-2026-10-{day}.html</link><guid>{BASE}news-2026-10-{day}.html</guid><pubDate>Sat, 24 Oct 2026 12:00:00 GMT</pubDate><description>Retrospective review of a {day} October {escape(publisher)} {escape(kind)}. Published 24 October 2026, not on the source date.</description></item>' for day, headline, publisher, kind, *_ in reversed(ITEMS))
if 'news-2026-10-16.html' not in xml:
    write('feed.xml', xml.replace('<lastBuildDate>Sat, 24 Oct 2026 01:22:00 GMT</lastBuildDate>', '<lastBuildDate>Sat, 24 Oct 2026 12:00:00 GMT</lastBuildDate>\n    ' + rows, 1))

pack = ROOT / 'today-source-pack-2026-10-24.html'
html = pack.read_text(encoding='utf-8')
source_links = ''.join(f'<li><a href="{source}">{day} October — {escape(publisher)} {escape(kind)}</a>; <a href="news-2026-10-{day}.html">retrospective review</a>, published 24 October.</li>' for day, _, publisher, kind, source, *_ in ITEMS)
section = '<section><h2>Original sources for seven retrospective news reviews</h2><p>The dates below are original-source dates. All seven NAKAMOTO reviews were written and published on 24 October 2026.</p><ul>' + source_links + '</ul></section>'
if 'Original sources for seven retrospective news reviews' not in html:
    write('today-source-pack-2026-10-24.html', html.replace('<aside class="publication-note">', section + '<aside class="publication-note">', 1))

for name in ['daily-operations.html', 'daily-operations-2026-10-24.html']:
    html = (ROOT / name).read_text(encoding='utf-8')
    html = html.replace('Separate daily news reports for those dates were not published.', 'Seven distinct original-source developments support <a href="news-archive.html#october-2026-retrospective-news">retrospective news reviews</a> for those dates; each was published 24 October, not on its source date.')
    html = html.replace('No daily news reports were published for those seven dates.', 'The seven retrospective reviews show their actual 24 October publication date.')
    html = html.replace('Add separate retrospective news only when a distinct original source warrants it, with the real publication date shown.', 'Retrospective news requires a distinct original source and its real publication date.')
    html = html.replace('Continue visual and accessibility review on representative mobile and desktop layouts; route tests alone cannot prove a page renders well.', 'Check representative mobile and desktop layouts after each visual change; route tests alone cannot prove a page renders well.')
    html = html.replace('Inspect mobile and desktop layout and accessibility on the homepage, News, Blog, and four priority hubs.', 'Repeat mobile and desktop layout checks after visual changes to the homepage, News, Blog, and four priority hubs.')
    write(name, html)

for name in ['DAILY_OPERATIONS.md', 'DAILY_OPERATIONS_QUICK_LIST.md']:
    text = (ROOT / name).read_text(encoding='utf-8')
    text = text.replace('Open: there are no separate daily news reports for those seven dates. Add a retrospective news review only if a distinct original-source development warrants one, and show its real publication date. Do not manufacture a daily headline to close a calendar gap.', 'Done: seven original-source developments support retrospective news reviews for 16–20 and 22–23 October. Each was written and published 24 October; source dates are not publication claims.')
    text = text.replace('- [ ] Publish separate retrospective news only where a distinct original source justifies an article; keep the real publication date visible.', '- [x] Publish seven distinct original-source retrospective news reviews for 16–20 and 22–23 October, each labelled as published 24 October.')
    text = text.replace('Separate daily news reports were not published for those dates.', 'Seven source-led retrospective news reviews were then published on 24 October, with their original-source dates clearly separated.')
    write(name, text)
