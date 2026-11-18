# Post-deployment inspection

<!-- current-daily-status:start -->
## Current daily task status · 18 November 2026

The 18 November package includes seven source reviews, two learning exercises and two learning-page revisions. The published October inflation releases are now reflected in the prepared homepage, News, section panels, Reader Brief, calendar and Finance Library briefing. There are 67 remaining historical News gaps. Website publishing is blocked by exhausted Netlify credits; migration is paused after replacement-host sign-in was skipped.

Daily article target · 5–10 source-checked articles or substantive revisions across the website.

Local checks passed for the repair batch. The website still serves commit 6b08414. Run the after-publishing checks once the pending source changes reach production.

[All 71 task results](DAILY_OPERATIONS_STATUS_2026-11-18.md) · [Dated website task record](daily-operations-2026-11-18.html)

<!-- current-daily-status:end -->

Run this checklist after each completed publication. Record the commit, date, routes checked, failures, fixes, live verification and remaining limits. An HTTP 200 response alone does not prove a page is correct.

## Before publishing

1. Review the diff and preserve historical publication dates.
2. Run the local route, section, archive, publication-coverage and functional checks in `tools/`.
3. Parse sitemap/feed XML and JSON-LD. Check titles, descriptions, canonicals, duplicate IDs and fragment targets.
4. Verify original sources for changed factual claims. Label retrospective work and scheduled releases honestly.
5. Inspect changed pages on mobile and desktop, including image loading, layout, keyboard access and dark/light themes.

## After publishing

1. Confirm local and remote revisions match, and the deployed pages show the intended content.
2. Fetch the sitemap URLs, follow redirects and record failures, metadata, noindex/canonical conflicts and response headers.
3. Check homepage, News, Blog, all new articles, sources, archives, all priority hubs and changed assets.
4. Check the 40 mapped section pages at mobile and desktop widths after styles load. Exclude intentionally hidden analytics pixels from content-image failures, but record measurement failures separately.
5. Test search for a newly published topic, empty/no-result queries, and shortcut filters. Check the default discovery view.
6. Exercise calculators with normal, empty, negative, zero-denominator, boundary and overflow inputs. Invalid inputs need a useful message rather than NaN or Infinity.
7. Check keyboard skip navigation, visible focus, form labels and image alternatives. Use a full accessibility audit when needed; these checks are not a WCAG certification.
8. Inspect form configuration and validation. Do not send test messages or subscribe real addresses without explicit authorisation. Mark delivery as untested if it was not checked.
9. Inspect console failures and distinguish site defects, third-party service failures and blocked tracking.
10. Retest confirmed fixes, deploy them when authorised, and verify the affected live pages again.

## Completion record

- Commit and deployment status.
- Number of pages/routes checked and representative viewports.
- Confirmed issues and fixes, with evidence.
- Checks passed and checks not performed.
- Remaining editorial, analytics, accessibility, security or delivery work.

Do not report a penetration test, full historical source audit, analytics audit, email-delivery test or accessibility certification unless that work actually occurred.
