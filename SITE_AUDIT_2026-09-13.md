# Site audit and repairs — 13 September 2026

## Coverage

- All 783 tracked HTML pages: 30,861 HTML links and asset references examined.
- All eight JavaScript files and 2,289 inline scripts parsed successfully.
- XML documents parse; CSS asset references resolve; sitemap coverage includes every indexable HTML page.
- Desktop browser checks across 12 main routes; six representative mobile layouts checked for horizontal overflow.
- Live form submissions, real account authentication, payments, and a claim-by-claim review of all historical articles are outside this technical audit. Reader accounts remain explicitly described as requests awaiting an authentication provider.

## Repairs

- Repaired 33 invalid section links, routing removed homepage references to maintained guides, tools, or source directories.
- Removed two nonexistent academy URLs from its sitemap; their maintained learning and risk routes are already indexed.
- Search now includes the curated title and content index, including all 56 retrospective blog notes. A title query previously returned no results because search only indexed the dated filenames.
- Replaced the hardcoded Bitcoin quote with an independently fetched, validated, timestamped quote for the tools page. Missing quotes show unavailable; BTC/satoshi conversion remains usable.
- Allowed the two existing public market-data providers in the connection policy; all other policy directives remain intact.
- Added request timeouts, rejected malformed data, and prevented earlier chart responses from overwriting the latest selected range. Failed charts no longer display a sample series as market data.
- Corrected comparison compounding to reflect each monthly contribution's actual time in the model. Clearly labelled the BTC simulator's approximate price assumptions and exclusions.
- Fixed zero-balance and 600-month boundary handling in the debt calculator; checked zero, negative, and excessive converter inputs.
- Updated 14 current archive notices following the retrospective blog completion.
- Repaired four external destination URLs and six failed favicon sources; used a local neutral resource icon.
- Added spacing and responsive styling to the academy's parent-library navigation bar.

## External-link verification limits

676 distinct HTTPS references were requested. Initial results: 380 returned 200, 24 required authentication, 99 denied automated access, 158 rate-limited requests, and four timed out or returned transport/server errors. Eleven returned 404: four content destinations, six favicon requests, and one preconnect origin (which is not a reader destination). The content and icon references were repaired. Access-denied or rate-limited links are not classified as broken without further evidence.

## Functional verification

- Search for “wallet balance separate pieces” returns the June 13 retrospective note; an unmatched query shows zero results.
- Browser received a live mempool.space quote on the tools page and displayed its check time.
- Unit checks cover missing quotes, zero conversion, USD conversion, invalid inputs, contribution timing, and debt payoff boundaries.
- Main route browser checks found no application errors. Third-party data availability remains dependent on those services; unavailable states are intentional.

The Google verification HTML file intentionally lacks normal page metadata and has been preserved.
