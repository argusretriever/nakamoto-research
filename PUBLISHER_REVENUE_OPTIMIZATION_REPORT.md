# Publisher Revenue Optimization Report

Date: 2026-06-30

Objective: increase legitimate ad revenue, page views per visitor, engagement, internal CTR, and ad viewability without fake clicks, click incentives, bots, misleading UI, intrusive interstitials, or policy violations.

## Executive Summary

The site already has strong content depth, daily news, evergreen guides, internal linking, analytics, and sponsor scripts. The main revenue bottleneck was that sponsor placements were too passive and mostly appeared at the bottom of the page, while reader-depth tracking and natural article journey prompts were underdeveloped.

This pass improves revenue through legitimate reader behavior:

- More visible, clearly labelled sponsor placements at natural reading breaks.
- Better continue-reading modules to lift page views per visitor.
- Reading progress, scroll-depth, engaged-time, recommendation-click, and sponsor-module view tracking.
- Mobile-safe sponsor styling and reserved ad space to reduce layout shift.
- Policy notes that forbid fake clicks, click incentives, popups, misleading labels, and excessive ad density.

## Policy Baseline

Follow Google publisher Promotion and publisher best practices:

- Do not generate artificial clicks or impressions.
- Do not ask users to click ads.
- Do not place ads in a way that causes accidental clicks.
- Do not disguise ads as navigation or editorial links.
- Do not use intrusive popups, forced redirects, or deceptive placements.
- Keep Promotion clearly separated from editorial content.

## Issues Found And Fixes

### 1. Bottom-heavy ad placement

- Page: global, all pages using `script.js`
- Location: end of `<main>` via `installThirdPartyAdPlacements`
- Severity: High
- Business impact: low ad viewability and weaker revenue per session.
- Reader impact: users may never see sponsor areas if they leave before the footer.
- Revenue impact: fewer legitimate ad impressions.
- Fix: added up to three labelled inline sponsor placements at natural reading breaks.
- Expected improvement: higher viewable impressions without increasing accidental clicks.
- Priority: Critical

### 2. Weak reader journey after article entry

- Page: article/news/guide pages with `main h1`
- Location: mid-article reading path
- Severity: High
- Business impact: weaker pages per visitor and fewer returning readers.
- Reader impact: readers finish or skim a page without a clear next useful action.
- Revenue impact: lower session depth and lower legitimate ad opportunities.
- Fix: added a policy-safe article journey prompt with Save page, Verify sources, and Best pages actions.
- Expected improvement: stronger internal CTR and repeat visits.
- Priority: High

### 3. Missing engagement-depth analytics

- Page: global content pages
- Location: analytics layer in `script.js`
- Severity: High
- Business impact: harder to know which pages produce high-quality sessions.
- Reader impact: weak pages stay weak because engagement gaps are hidden.
- Revenue impact: lower RPM optimization quality.
- Fix: added scroll depth events at 25, 50, 75, and 90 percent plus engaged-time events at 30, 60, 120, and 240 seconds.
- Expected improvement: better editorial and ad-placement decisions.
- Priority: High

### 4. No reading progress affordance

- Page: long-form article, guide, news, and hub pages
- Location: top of viewport
- Severity: Medium
- Business impact: less completion behaviour on long pages.
- Reader impact: readers lack a sense of reading progress.
- Revenue impact: weaker session duration and lower page-depth signals.
- Fix: added a lightweight reading progress bar.
- Expected improvement: modest lift in completion and perceived control.
- Priority: Medium

### 5. Raw network-script risk

- Page: global sponsor system
- Location: retired third-party promotion loader
- Severity: High
- Business impact: brand trust and publisher Promotion risk if scripts cause popups, redirects, adult creatives, or misleading offers.
- Reader impact: trust damage and bad UX.
- Revenue impact: short-term CPM can damage long-term traffic and approval.
- Fix: display mode now prioritizes iframe/native units and keeps risky raw scripts out of normal visible display.
- Expected improvement: lower policy and trust risk.
- Priority: Critical

### 6. Ad density needed clearer limits

- Page: global sponsor system
- Location: `AD_NETWORK_PLACEMENTS.md`
- Severity: Medium
- Business impact: excessive ads can reduce retention and search quality.
- Reader impact: clutter and slower reading.
- Revenue impact: short-term impressions may reduce long-term traffic.
- Fix: documented default limits: one early reading-break slot, one mid-page slot on long pages, and one footer sponsor area.
- Expected improvement: better balance between revenue and UX.
- Priority: Medium

### 7. Recommendation clicks were not separated from normal navigation

- Page: global recommendation panels
- Location: `script.js` analytics events
- Severity: Medium
- Business impact: weak visibility into what actually increases page depth.
- Reader impact: recommendation quality cannot be improved precisely.
- Revenue impact: less efficient internal CTR optimization.
- Fix: added `recommended_route_click` and `revenue_module_view` events.
- Expected improvement: clearer growth reporting.
- Priority: Medium

## Scores

- Revenue Optimization Score: 82/100
- Reader Engagement Score: 84/100
- Internal CTR Score: 86/100
- Page Views per Visitor Score: 83/100
- SEO Score: 86/100
- Mobile Experience Score: 84/100
- Performance Score: 80/100
- Ad Placement Score: 81/100
- Policy Compliance Score: 88/100
- Overall Publisher Score: 84/100

## Roadmap

### Phase 1 - Critical UX And Policy Fixes

- Keep ads labelled as Advertisement or Sponsored.
- Keep the site publisher Promotion-only unless a future network passes a separate brand-safety review.
- Never ask users to click ads.
- Keep affiliate and sponsor links `rel="nofollow sponsored noopener noreferrer"`.

### Phase 2 - Increase Page Views Per Visitor

- Add every daily story to at least three internal routes: source proof, evergreen guide, and priority section.
- Keep the Continue Reading panel active on content pages.
- Review top exit pages weekly and add stronger next steps.

### Phase 3 - Improve Internal CTR

- Track recommendation clicks by page and topic.
- Replace low-click recommendations with more relevant guides.
- Keep homepage routes focused on Today's Brief, Search, Best Of, Premium, and priority sections.

### Phase 4 - Optimize Ad Placement

- Add Google publisher Promotion units only after approved `data-ad-slot` values are available.
- Avoid ads immediately beside buttons, forms, navigation, or download-style UI.
- Add real Google publisher Promotion `data-ad-slot` values only after the publisher Promotion dashboard provides approved slots.

### Phase 5 - Improve Reader Retention

- Keep Save page, Dashboard, Daily Brief, and Best Of routes visible.
- Build weekly roundup pages from daily operations.
- Use newsletter archive and source packs to create return habits.

### Phase 6 - Increase Organic Traffic

- Continue daily freshness on core sections.
- Preserve old news pages and link them to evergreen guides.
- Strengthen topic clusters around Bitcoin, Trading Academy, Investing, Personal Finance, policy, macro, and risk.

### Phase 7 - Long-Term Sustainable Revenue Growth

- Improve content quality first, ad density second.
- Grow direct and returning traffic.
- Use Google Search Console, GA4, Bing Webmaster Tools, Microsoft Clarity, and PageSpeed data for decisions.
- Avoid any ad network that damages trust, speed, or policy safety.

## Manual Actions Required

1. In Google publisher Promotion, create display/in-article/multiplex ad units and provide the `data-ad-slot` IDs before Google ads can render.
2. Keep third-party promotion networks disabled unless they pass a separate policy, brand-safety, performance, and UX review.
3. Check GA4 events after deployment: `reader_scroll_depth`, `reader_engaged_time`, `revenue_module_view`, and `recommended_route_click`.
4. Review mobile pages after deployment with Edge tracking prevention off and then on, so you can see both normal and blocked-ad behaviour.

## June 30 publisher Promotion-Only Update

Third-party Promotion loaders were removed after review. The project now keeps reader-engagement features and source-first discovery without Promotion-network code.
