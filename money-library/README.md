# NAKAMOTO Money Library

NAKAMOTO Money Library is a static personal finance education platform focused on budgeting, saving, debt payoff, emergency funds, financial literacy, country-specific resources, calculators, challenges, newsletters, and long-term wealth-building paths.

## Open locally

Open `index.html` directly in a browser, or serve the folder with any static web server.

## Key pages

- `index.html` - homepage and primary user journey
- `explore.html` - complete site directory for guides, tools, calculators, dashboards, countries, research, and resources
- `tools.html` - six-calculator suite plus financial planning tools
- `dashboard.html` - interactive My Money Plan dashboard and confidence score
- `start-here.html` - money path quiz
- `content.html` - complete knowledge system and guide directory
- `budgeting.html` - budgeting knowledge hub
- `saving.html` - saving money knowledge hub
- `emergency-fund.html` - emergency fund knowledge hub
- `debt.html` - debt payoff knowledge hub
- `financial-literacy.html` - financial literacy knowledge hub
- `credit-banking.html` - credit and banking knowledge hub
- `investing-basics.html` - investing basics knowledge hub
- `retirement.html` - retirement planning knowledge hub
- `net-worth.html` - net worth knowledge hub
- `news.html` - Daily Money Brief workflow for source-backed, action-oriented personal finance news
- `financial-independence.html` - financial independence knowledge hub
- `career-income.html` - career and income knowledge hub
- `life-goals.html` - life goals and money knowledge hub
- `money-psychology.html` - money psychology knowledge hub
- `taxes-insurance.html` - taxes and insurance knowledge hub
- `audiences.html` - audience paths for students, young professionals, families, and debt rebuilders
- `success-stories.html` - realistic educational scenario stories
- `workshops.html` - workshop and lead-generation hub
- `money-personality-quiz.html` - shareable money personality quiz
- `account.html` - saved account and private money plan concept
- `goals.html` - goal trackers for savings, debt, net worth, and emergency funds
- `next-100.html` - next-dollar decision tool
- `money-coach.html` - guided money coach prompts
- `scenario-calculators.html` - what-if calculators
- `money-snapshot.html` - shareable money snapshot report
- `money-reset.html` - 7-Day Money Reset lead magnet
- `budget-kit.html` - printable budget kit lead magnet
- `academy.html` - financial literacy academy
- `life-events.html` - life event money hub
- `community-challenges.html` - social challenge concepts
- `scorecards.html` - transparent product scorecard system
- `email-courses.html` - path-specific email course hub
- `research-library.html` - official source and reference library
- `source-materials.html` - official source-material hub for budget worksheets, debt rights, banking, investing, privacy, and retirement
- `daily-tasks.html` - daily operating checklist for live checks, content updates, source links, internal links, SEO, conversion, design QA, tools, and deployment
- `quality-audit.html` - production readiness, growth, trust, SEO, accessibility, and analytics roadmap
- `marketing-engine.html` - website marketing, CRO, SEO, GEO, automation, and revenue roadmap
- `planning.html` - free, template pack, and Pro offer ladder
- `glossary.html` - plain-English financial literacy glossary
- `calculator-assumptions.html` - calculator input and limit explanations
- `evergreen-roadmap.html` - 10-year knowledge and topic cluster plan
- `content.html` - personal finance guide hub
- `countries.html` - country-specific finance hubs
- `comparisons.html` - comparison page hub
- `authors.html` - trust and editorial standards
- `newsletter.html` - newsletter and retention funnel
- `finance-app-privacy-checklist.html` - privacy checklist for finance apps and bank-linking
- `life-event-money-checklists.html` - move, first job, wedding, baby, car, home, job-loss, and career-break checklists
- `lifestyle-creep-calculator.html` - live calculator for recurring upgrades after income growth
- `rent-affordability-calculator.html` - live rent affordability calculator
- `template-monthly-review.html` - monthly money review template
- `template-net-worth-tracker.html` - net worth tracker template
- `template-debt-payoff-planner.html` - debt payoff planner template
- `template-sinking-fund-planner.html` - sinking fund planner template
- `template-household-money-meeting.html` - household money meeting template
- `template-semester-budget.html` - semester budget template
- `template-variable-income-planner.html` - variable income planner template
- `template-life-goal-bundle.html` - life goal template bundle

## Notes

Forms are static demo flows and should be connected to a form backend or email platform before production launch.

## GitLab Pages

The included `.gitlab-ci.yml` publishes the static site from the `main` branch through GitLab Pages.

## Netlify

The included `netlify.toml`, `_headers`, and `_redirects` files publish the static site from the repository root, support clean URLs such as `/tools`, apply basic security/cache headers, and route missing pages to `404.html`.

Production metadata, sitemap, robots, canonical URLs, and social URLs are configured for `https://nakamatoresearch.com/money-library/`. In Netlify, connect the GitLab repository to the site and add `nakamatoresearch.com/money-library` as the custom domain, then point the domain DNS records to Netlify.

## Production readiness

The site includes canonical URLs, social metadata, JSON-LD schema, sitemap/robots files, filtered search, visible breadcrumbs, reviewed-date trust signals, dark/light mode, and local analytics event hooks. Static demo forms and calculators do not transmit personal finance data.
