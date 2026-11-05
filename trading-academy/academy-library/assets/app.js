const toggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const downloadableExtensions = /\.(pdf|csv|xlsx?|docx?|pptx?|zip|txt)$/i;

const trackGrowthEvent = (eventName, detail = {}) => {
  const payload = {
    page_title: document.title,
    page_location: window.location.href,
    ...detail
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, payload);
  }

  if (typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }

  if (window.uetq && typeof window.uetq.push === "function") {
    window.uetq.push("event", eventName, {
      event_category: "trading_academy",
      event_label: payload.link_text || payload.button_text || payload.form_name || payload.search_term || document.title,
      page_location: payload.page_location
    });
  }
};

const describeTrackedLink = (link) => ({
  link_url: link.href,
  link_text: link.textContent.trim().slice(0, 120),
  link_domain: link.hostname || window.location.hostname
});

const installGrowthTracking = () => {
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    const button = event.target.closest?.("button");

    if (link) {
      const url = new URL(link.href, window.location.href);
      const detail = describeTrackedLink(link);

      if (url.hostname && url.hostname !== window.location.hostname) {
        trackGrowthEvent("outbound_link_click", detail);
      } else if (downloadableExtensions.test(url.pathname)) {
        trackGrowthEvent("file_download", {
          ...detail,
          file_extension: url.pathname.split(".").pop().toLowerCase()
        });
      } else if (link.closest("nav, .hero, .card, .level-card, .resource-item, .next-step-block, .footer-grid")) {
        trackGrowthEvent("navigation_click", detail);
      }
    }

    if (button) {
      trackGrowthEvent("button_click", {
        button_text: button.textContent.trim().slice(0, 120),
        button_type: button.type || "button"
      });
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    trackGrowthEvent("form_submit", {
      form_name: form.getAttribute("aria-label") || form.dataset.formName || form.id || "trading_academy_form"
    });
  });
};

installGrowthTracking();

if (toggle && navLinks) {
  toggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const main = document.querySelector("main");
if (main && !main.id) main.id = "main";

const siteHeader = document.querySelector(".site-header");
const updateHeaderState = () => {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 10);
};

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if (!document.querySelector(".skip-link")) {
  const skip = document.createElement("a");
  skip.href = "#main";
  skip.className = "skip-link";
  skip.textContent = "Skip to content";
  document.body.prepend(skip);
}

const forms = document.querySelectorAll("[data-lead-form]");

forms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.querySelector("input[type='email']");
    const message = form.querySelector("[data-form-message]");

    if (!email || !message) return;

    if (!email.value.includes("@")) {
      message.textContent = "Enter a valid email to get the free roadmap.";
      message.classList.add("has-message");
      return;
    }

    message.textContent = "You're on the list. Your roadmap preview is ready below.";
    message.classList.add("has-message");
    form.classList.add("submitted");
  });
});

const searchIndex = [
  {
    title: "Start Here",
    type: "Path",
    url: "start-here.html",
    summary: "Begin with markets, orders, risk, market structure, auction context, psychology, and professional process."
  },
  {
    title: "Curriculum",
    type: "Map",
    url: "courses.html",
    summary: "The full Level 0 to Level 9 NAKAMOTO Academy curriculum from foundations to professional trading."
  },
  {
    title: "Market Structure",
    type: "Pillar Lesson",
    url: "lesson-market-structure.html",
    summary: "Higher highs, higher lows, lower highs, lower lows, BOS, CHoCH, context, workflows, and practice."
  },
  {
    title: "Course Lesson Library",
    type: "Lesson Index",
    url: "lesson-library.html",
    summary: "Complete NAKAMOTO Academy lesson library with Level 0 and Level 1 course pages, quizzes, progress tracking, and study order."
  },
  {
    title: "Financial Markets",
    type: "Level 0 Lesson",
    url: "lesson-financial-markets.html",
    summary: "What markets are, why they exist, asset classes, participants, exchanges, liquidity, and risk-aware beginner context."
  },
  {
    title: "Trading Basics",
    type: "Level 0 Lesson",
    url: "lesson-trading-basics.html",
    summary: "Bid, ask, spread, order types, liquidity, volatility, leverage, margin, fees, and trading workflow basics."
  },
  {
    title: "Trends",
    type: "Level 1 Lesson",
    url: "lesson-trends.html",
    summary: "Uptrends, downtrends, sideways markets, continuation, pullbacks, trend failure, and multi-timeframe context."
  },
  {
    title: "Support and Resistance",
    type: "Level 1 Lesson",
    url: "lesson-support-resistance.html",
    summary: "Horizontal levels, zones, acceptance, rejection, retests, level quality, liquidity, and invalidation."
  },
  {
    title: "Price Action",
    type: "Level 1 Lesson",
    url: "lesson-price-action.html",
    summary: "Candlesticks, rejection, engulfing candles, pin bars, reaction zones, context, and confirmation without signal-chasing."
  },
  {
    title: "Student Dashboard",
    type: "Progress",
    url: "student-dashboard.html",
    summary: "Continue learning, track completed lessons, open drills, view weak areas, and follow the next recommended module."
  },
  {
    title: "Animated Explainers",
    type: "Interactive Visuals",
    url: "animated-explainers.html",
    summary: "Animated visual explainers for liquidity sweeps, volume profile, delta, footprint charts, and risk sizing."
  },
  {
    title: "Downloads",
    type: "Resources",
    url: "downloads.html",
    summary: "Download NAKAMOTO Academy PDFs: curriculum roadmap, worksheet pack, strategy checklist, and brand kit."
  },
  {
    title: "Interactive Chart Simulator",
    type: "Practice Tool",
    url: "chart-simulator.html",
    summary: "Practice marking structure, support and resistance, liquidity, entry, stop, and target zones on an interactive chart."
  },
  {
    title: "Level 2 Auction Theory Course",
    type: "Course",
    url: "auction-theory-course.html",
    summary: "Auction market theory course covering price discovery, balance, imbalance, acceptance, rejection, volume profile, and market profile."
  },
  {
    title: "Certification Path",
    type: "Credentials",
    url: "certification-path.html",
    summary: "NAKAMOTO Academy certificate paths for foundations, technical analysis, auction theory, risk management, and professional process."
  },
  {
    title: "Trading Tools Lab",
    type: "Calculator Suite",
    url: "trading-tools.html",
    summary: "Expectancy, drawdown recovery, risk stress testing, and position sizing calculators for trading education."
  },
  {
    title: "Market Scenario Trainer",
    type: "Decision Practice",
    url: "scenario-trainer.html",
    summary: "Practice trend pullbacks, liquidity sweeps, and range traps with evidence checks and risk-first feedback."
  },
  {
    title: "Practice Plan Builder",
    type: "Study Planner",
    url: "practice-planner.html",
    summary: "Generate a seven-day NAKAMOTO Academy practice plan based on level, goal, weak area, and study time."
  },
  {
    title: "Trading Skill Assessment",
    type: "Placement Test",
    url: "skill-assessment.html",
    summary: "Score foundations, structure, risk, execution, and review to identify a learner level and recommended path."
  },
  {
    title: "Performance Review Lab",
    type: "Review Tool",
    url: "performance-review.html",
    summary: "Calculate expectancy, rule-break rate, journal compliance, process score, weak area, and next review action."
  },
  {
    title: "Learning Path",
    type: "Learning Path",
    url: "start-here.html",
    summary: "Choose a NAKAMOTO Academy learning path path and save onboarding steps for starter, practice, or cohort access."
  },
  {
    title: "Study Setup",
    type: "Risk",
    url: "risk-disclosure.html",
    summary: "Auto-study plan setup flow for NAKAMOTO Academy resources with risk cycle, student email, consent, and onboarding next step."
  },
  {
    title: "Referral And Ambassador Program",
    type: "Growth",
    url: "referrals.html",
    summary: "Create a NAKAMOTO Academy referral code, track invite progress, and share education-first ambassador assets."
  },
  {
    title: "Creator Media Kit",
    type: "Partner Growth",
    url: "media-kit.html",
    summary: "Brand assets, approved talking points, audience fit, screenshots, and risk-safe creator language for NAKAMOTO Academy partners."
  },
  {
    title: "Partner Portal",
    type: "Partner Growth",
    url: "partner-portal.html",
    summary: "Affiliate, creator, education, community, and platform partner portal with saved partner profile and review checklist."
  },
  {
    title: "Student Wins",
    type: "Trust Proof",
    url: "student-wins.html",
    summary: "Process-based student proof for lessons completed, risk discipline, journaling, review quality, and consistency without profit screenshots."
  },
  {
    title: "Trust Wall",
    type: "Trust",
    url: "trust-wall.html",
    summary: "Credibility hub for editorial policy, source standards, research methodology, risk disclosure, student proof rules, and partner boundaries."
  },
  {
    title: "Sponsorship",
    type: "Partner Growth",
    url: "sponsorship.html",
    summary: "Education-first sponsorship rules, sponsor fit checker, disclosure standards, and trust review for external brands."
  },
  {
    title: "Student Onboarding Hub",
    type: "Onboarding",
    url: "onboarding-hub.html",
    summary: "First-week onboarding path with saved goal, checklist, launch plan, and next actions for new NAKAMOTO Academy students."
  },
  {
    title: "Retention Dashboard",
    type: "Retention",
    url: "retention-dashboard.html",
    summary: "Continuation dashboard showing learning progress, practice signals, learning path path, and next milestone."
  },
  {
    title: "Churn Rescue",
    type: "Retention",
    url: "churn-rescue.html",
    summary: "Repair paths for overwhelmed, stuck, inconsistent, or rule-breaking learners with small next actions."
  },
  {
    title: "Daily Updates",
    type: "Daily Learning",
    url: "daily-updates.html",
    summary: "A daily trading education desk with market concept, practice drill, glossary term, risk reminder, and student action."
  },
  {
    title: "NAKAMOTO Academy Blog",
    type: "Articles",
    url: "blog.html",
    summary: "Long-form educational posts for trading concepts, study systems, risk, psychology, market history, and student progress."
  },
  {
    title: "Market Education News",
    type: "News",
    url: "news.html",
    summary: "Education-first market news briefs that explain events, context, vocabulary, risk, and what students should study next."
  },
  {
    title: "Community Hub",
    type: "Community",
    url: "community-hub.html",
    summary: "Study prompts, chart questions, risk reflections, challenge updates, and process-based community activity."
  },
  {
    title: "Weekly Challenges",
    type: "Community Practice",
    url: "weekly-challenges.html",
    summary: "Process-based weekly challenge board for chart marking, scenarios, risk review, journaling, and planning."
  },
  {
    title: "Progress Wall",
    type: "Community Progress",
    url: "progress-wall.html",
    summary: "Progress wall for lessons, weekly challenges, planning, review, questions, and process score."
  },
  {
    title: "Cohorts",
    type: "Community Learning",
    url: "cohorts.html",
    summary: "Foundation, risk reset, market structure, and professional process cohorts for focused study."
  },
  {
    title: "Office Hours",
    type: "Community Support",
    url: "office-hours.html",
    summary: "Upcoming education sessions and a local question queue for structure, risk, behavior, and review."
  },
  {
    title: "Visual Lab",
    type: "Visual System",
    url: "resources.html",
    summary: "Original diagrams for structure, support and resistance, volume profile, footprint charts, delta, and risk."
  },
  {
    title: "NAKAMOTO Academy Design System",
    type: "Brand System",
    url: "design-system.html",
    summary: "Brand identity, typography, color, iconography, diagram language, editorial layout, and motion rules for NAKAMOTO Academy."
  },
  {
    title: "Chart Component Library",
    type: "Visual System",
    url: "chart-components.html",
    summary: "Reusable market diagrams for structure, volume profile, footprint, delta, liquidity, risk, timelines, and lesson visuals."
  },
  {
    title: "Motion Library",
    type: "Motion System",
    url: "motion-library.html",
    summary: "Production motion rules for chart drawing, candle builds, page reveals, state changes, scroll moments, and reduced-motion behavior."
  },
  {
    title: "Brand Kit",
    type: "Brand System",
    url: "brand-kit.html",
    summary: "NAKAMOTO Academy logo rules, colors, typography, icon badges, chart marks, print templates, and export-ready brand assets."
  },
  {
    title: "Resources",
    type: "Offer",
    url: "resources.html",
    summary: "Free roadmap, Core Study, guided cohort, and education-only product boundaries."
  },
  {
    title: "About NAKAMOTO Academy",
    type: "Trust",
    url: "about.html",
    summary: "Mission, education principles, risk-first philosophy, platform standards, and what NAKAMOTO Academy is not."
  },
  {
    title: "Editorial Policy",
    type: "Trust",
    url: "editorial-policy.html",
    summary: "How NAKAMOTO Academy resources, writes, reviews, updates, and governs educational content."
  },
  {
    title: "Research Methodology",
    type: "Trust",
    url: "research-methodology.html",
    summary: "Evidence standards, source review, research workflow, limitations, and update rules for NAKAMOTO Academy research."
  },
  {
    title: "Risk Disclosure",
    type: "Trust",
    url: "risk-disclosure.html",
    summary: "Education-only trading risk disclosure covering losses, leverage, margin, costs, uncertainty, and no guarantees."
  },
  {
    title: "Source Standards",
    type: "Trust",
    url: "source-standards.html",
    summary: "NAKAMOTO Academy source hierarchy, citation rules, evidence quality, and claim review standards."
  },
  {
    title: "Student Lab",
    type: "Learning System",
    url: "student-lab.html",
    summary: "Trading lessons, learning paths, assignments, quizzes, retention loops, and student experience systems."
  },
  {
    title: "Experience Lab",
    type: "Interactive Visuals",
    url: "experience-lab.html",
    summary: "Live trading education visuals for market structure, risk, auction cycles, liquidity, and order flow."
  },
  {
    title: "Research Institute",
    type: "Research",
    url: "research-institute.html",
    summary: "Original research system for surveys, benchmarks, source standards, fact checking, data collection, and publications."
  },
  {
    title: "Trading Strategy Lab",
    type: "Strategy System",
    url: "strategy-lab.html",
    summary: "Evidence-based trading strategy library, playbooks, validation framework, risk management, backtesting, journal, and performance review systems."
  },
  {
    title: "Financial History Institute",
    type: "History",
    url: "financial-history.html",
    summary: "Financial history curriculum, encyclopedia, timelines, crises, banking, markets, Bitcoin, investing, biographies, lessons, and research library."
  },
  {
    title: "Human Behavior Institute",
    type: "Behavior",
    url: "human-behavior.html",
    summary: "Cognitive biases, behavioral economics, decision-making frameworks, mental models, investor psychology, crowds, bubbles, incentives, and wealth behavior."
  },
  {
    title: "Mental Models and Systems Thinking",
    type: "Reality Framework",
    url: "mental-models.html",
    summary: "Mental models encyclopedia, systems thinking curriculum, decision framework library, wisdom database, learning roadmap, incentives, feedback loops, compounding, optionality, and risk."
  },
  {
    title: "Economic History and Civilization",
    type: "Civilization",
    url: "economic-civilization.html",
    summary: "Civilization timeline, economic history curriculum, wealth creation framework, global development, geopolitics, economic systems, trade, industrial revolutions, and historical lessons."
  },
  {
    title: "NAKAMOTO Academy Library",
    type: "Index",
    url: "library.html",
    summary: "Clean index of NAKAMOTO Academy learning paths, labs, research, strategy, financial history, behavior, mental models, and civilization pages."
  },
  {
    title: "Trading Glossary",
    type: "Reference",
    url: "glossary.html",
    summary: "Plain-English definitions for bid, ask, spread, liquidity, volatility, market structure, order flow, ICT, SMC, risk, and psychology."
  },
  {
    title: "Risk Calculator",
    type: "Tool",
    url: "risk-calculator.html",
    summary: "Position sizing, account risk, stop distance, drawdown awareness, and risk discipline calculator."
  },
  {
    title: "Chart Drill Library",
    type: "Practice",
    url: "chart-drills.html",
    summary: "Chart practice drills for market structure, support and resistance, liquidity, auction theory, order flow, and risk mapping."
  },
  {
    title: "Trading Mistake Library",
    type: "Psychology",
    url: "mistake-library.html",
    summary: "Common trading mistakes including chasing, revenge trading, over-sizing, moving stops, weak context, and missing review loops."
  },
  {
    title: "Learning Path Selector",
    type: "Path Tool",
    url: "path-selector.html",
    summary: "Interactive selector that recommends a NAKAMOTO Academy learning path based on experience, goals, and study time."
  },
  {
    title: "Trading Journal Template",
    type: "Template",
    url: "trading-journal.html",
    summary: "Trading journal system for trade planning, screenshots, emotions, mistakes, setup tags, and weekly review."
  },
  {
    title: "Strategy Validation Checklist",
    type: "Checklist",
    url: "strategy-checklist.html",
    summary: "Checklist for validating a strategy with setup rules, market conditions, entries, exits, stops, risk, testing evidence, and review."
  },
  {
    title: "Printable Trading Worksheets",
    type: "Worksheets",
    url: "worksheets.html",
    summary: "Print-ready worksheets for trade planning, post-trade review, strategy validation, and risk checks."
  },
  {
    title: "Failed Breakout Case Study",
    type: "Case Study",
    url: "case-study-failed-breakout.html",
    summary: "Educational case study on failed breakouts, liquidity traps, acceptance, invalidation, and trapped traders."
  },
  {
    title: "Trend Day Case Study",
    type: "Case Study",
    url: "case-study-trend-day.html",
    summary: "Educational case study on trend days, continuation, pullbacks, failed fades, and chase risk."
  },
  {
    title: "Range Day Case Study",
    type: "Case Study",
    url: "case-study-range-day.html",
    summary: "Educational case study on range days, balance, edges, failed continuation, and patience."
  },
  {
    title: "Liquidity Sweep Case Study",
    type: "Case Study",
    url: "case-study-liquidity-sweep.html",
    summary: "Educational case study on liquidity sweeps, stop hunts, trapped traders, confirmation, and invalidation."
  },
  {
    title: "Drawdown Review Case Study",
    type: "Case Study",
    url: "case-study-drawdown-review.html",
    summary: "Educational case study on drawdown review, emotional triggers, process errors, and recovery planning."
  }
];

const pageMap = new Map(searchIndex.map((item) => [item.url, item]));
const currentPage = location.pathname.split("/").pop() || "index.html";

const pageFamilies = {
  "index.html": "home",
  "resources.html": "visual",
  "design-system.html": "design",
  "chart-components.html": "visual",
  "motion-library.html": "design",
  "brand-kit.html": "design",
  "lesson-library.html": "learning",
  "lesson-financial-markets.html": "lesson",
  "lesson-trading-basics.html": "lesson",
  "lesson-trends.html": "lesson",
  "lesson-support-resistance.html": "lesson",
  "lesson-price-action.html": "lesson",
  "student-dashboard.html": "learning",
  "animated-explainers.html": "visual",
  "downloads.html": "practice",
  "chart-simulator.html": "practice",
  "auction-theory-course.html": "learning",
  "certification-path.html": "learning",
  "trading-tools.html": "risk",
  "scenario-trainer.html": "practice",
  "practice-planner.html": "practice",
  "skill-assessment.html": "learning",
  "performance-review.html": "strategy",
  "start-here.html": "learning",
  "risk-disclosure.html": "risk",
  "referrals.html": "offer",
  "media-kit.html": "offer",
  "partner-portal.html": "offer",
  "student-wins.html": "community",
  "trust-wall.html": "research",
  "sponsorship.html": "offer",
  "onboarding-hub.html": "learning",
  "retention-dashboard.html": "learning",
  "churn-rescue.html": "learning",
  "daily-updates.html": "reference",
  "blog.html": "reference",
  "news.html": "reference",
  "community-hub.html": "community",
  "weekly-challenges.html": "community",
  "progress-wall.html": "community",
  "cohorts.html": "community",
  "office-hours.html": "community",
  "about.html": "research",
  "editorial-policy.html": "research",
  "research-methodology.html": "research",
  "risk-disclosure.html": "risk",
  "source-standards.html": "research",
  "strategy-lab.html": "strategy",
  "strategy-checklist.html": "strategy",
  "trading-journal.html": "strategy",
  "risk-calculator.html": "risk",
  "research-institute.html": "research",
  "financial-history.html": "history",
  "economic-civilization.html": "history",
  "human-behavior.html": "behavior",
  "mental-models.html": "models",
  "student-lab.html": "learning",
  "courses.html": "learning",
  "start-here.html": "learning",
  "lesson-market-structure.html": "lesson",
  "glossary.html": "reference",
  "library.html": "reference",
  "chart-drills.html": "practice",
  "mistake-library.html": "practice",
  "worksheets.html": "practice",
  "path-selector.html": "practice",
  "case-study-failed-breakout.html": "case",
  "case-study-trend-day.html": "case",
  "case-study-range-day.html": "case",
  "case-study-liquidity-sweep.html": "case",
  "case-study-drawdown-review.html": "case",
  "resources.html": "reference"
};

document.body.dataset.pageFamily = pageFamilies[currentPage] || "core";

const artLabels = {
  home: "Visual curriculum",
  visual: "Diagram system",
  design: "Brand system",
  strategy: "Strategy desk",
  risk: "Risk control",
  research: "Research file",
  history: "Archive layer",
  behavior: "Mind layer",
  models: "Thinking tools",
  learning: "Student path",
  lesson: "Pillar lesson",
  reference: "Reference index",
  practice: "Practice lab",
  case: "Case file",
  offer: "Access layer",
  community: "Community layer",
  core: "Learning system"
};

const pageHero = document.querySelector(".page-hero");
pageHero?.setAttribute("data-art-label", artLabels[document.body.dataset.pageFamily] || "Learning system");

if (pageHero && currentPage !== "index.html" && !pageHero.querySelector(".page-hero-art")) {
  const heroArt = document.createElement("div");
  heroArt.className = "page-hero-art";
  heroArt.setAttribute("aria-hidden", "true");
  heroArt.innerHTML = `
    <span class="art-node art-node-one"></span>
    <span class="art-node art-node-two"></span>
    <span class="art-node art-node-three"></span>
    <i class="art-candle art-candle-one"></i>
    <i class="art-candle art-candle-two"></i>
    <i class="art-candle art-candle-three"></i>
    <svg viewBox="0 0 320 160" preserveAspectRatio="none">
      <path d="M12 128 C58 92 92 114 132 70 S210 82 248 40 S292 34 312 18"></path>
      <path class="ghost-path" d="M10 96 C58 112 96 76 138 92 S206 110 254 72 S292 78 314 52"></path>
    </svg>
  `;
  pageHero.appendChild(heroArt);
}

if (currentPage !== "index.html" && document.querySelector("main") && !document.querySelector(".breadcrumb")) {
  const current = pageMap.get(currentPage);
  const crumb = document.createElement("nav");
  crumb.className = "breadcrumb";
  crumb.setAttribute("aria-label", "Breadcrumb");
  crumb.innerHTML = `<a href="index.html">Home</a> / <a href="library.html">Library</a> / <span>${current?.title || document.title.replace(" | NAKAMOTO Academy", "")}</span>`;
  document.querySelector(".site-header")?.after(crumb);
}

function createSearchPanel() {
  const navActions = document.querySelector(".nav-actions");
  if (navActions && !document.querySelector("[data-search-open]")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn ghost";
    button.dataset.searchOpen = "true";
    button.textContent = "Search";
    navActions.prepend(button);
  }

  if (document.querySelector(".search-panel")) return;

  const panel = document.createElement("section");
  panel.className = "search-panel";
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <div class="search-dialog" role="dialog" aria-modal="true" aria-label="Search NAKAMOTO Academy">
      <div class="search-head">
        <input type="search" placeholder="Search lessons, tools, concepts..." aria-label="Search lessons, tools, concepts" data-search-input>
        <button class="btn icon-only" type="button" data-search-close aria-label="Close search">x</button>
      </div>
      <div class="search-results" data-search-results></div>
    </div>
  `;
  document.body.appendChild(panel);

  const input = panel.querySelector("[data-search-input]");
  const results = panel.querySelector("[data-search-results]");
  const close = panel.querySelector("[data-search-close]");

  function renderResults(query = "") {
    const q = query.toLowerCase().trim();
    const matches = searchIndex.filter((item) => {
      const blob = `${item.title} ${item.type} ${item.summary}`.toLowerCase();
      return !q || blob.includes(q);
    });

    results.innerHTML = matches.map((item) => `
      <a class="search-result" href="${item.url}">
        <span>${item.type}</span>
        <strong>${item.title}</strong>
        <p>${item.summary}</p>
      </a>
    `).join("") || `<p class="risk-note">No matching lesson yet. Try "risk", "structure", "profile", or "curriculum".</p>`;
  }

  function openSearch() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    renderResults("");
    setTimeout(() => input.focus(), 0);
  }

  function closeSearch() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll("[data-search-open]").forEach((button) => {
    button.addEventListener("click", openSearch);
  });

  close.addEventListener("click", closeSearch);
  panel.addEventListener("click", (event) => {
    if (event.target === panel) closeSearch();
  });
  let searchTrackingTimer;
  input.addEventListener("input", () => {
    renderResults(input.value);
    clearTimeout(searchTrackingTimer);
    const query = input.value.trim();
    if (query.length < 2) return;
    searchTrackingTimer = setTimeout(() => {
      trackGrowthEvent("site_search", {
        search_term: query.slice(0, 80),
        result_count: results.querySelectorAll(".search-result").length
      });
    }, 500);
  });
  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape") closeSearch();
  });
}

createSearchPanel();

const studyPreferences = {
  theme: localStorage.getItem("nakamoto.academy.theme") || "light",
  mode: localStorage.getItem("nakamoto.academy.studyMode") || "default"
};

function applyStudyPreferences() {
  document.body.dataset.theme = studyPreferences.theme;
  document.body.dataset.studyMode = studyPreferences.mode;
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.classList.toggle("active", button.dataset.themeChoice === studyPreferences.theme);
  });
  document.querySelectorAll("[data-study-choice]").forEach((button) => {
    button.classList.toggle("active", button.dataset.studyChoice === studyPreferences.mode);
  });
}

function createStudySettingsPanel() {
  const navActions = document.querySelector(".nav-actions");
  if (navActions && !document.querySelector("[data-study-open]")) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn ghost";
    button.dataset.studyOpen = "true";
    button.textContent = "Study";
    navActions.append(button);
  }

  if (document.querySelector(".study-panel")) {
    applyStudyPreferences();
    return;
  }

  const panel = document.createElement("section");
  panel.className = "study-panel";
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <div class="study-dialog" role="dialog" aria-modal="true" aria-label="Study display settings">
      <div class="study-head">
        <div>
          <span>Study settings</span>
          <strong>Choose how NAKAMOTO Academy feels while learning.</strong>
        </div>
        <button class="btn icon-only" type="button" data-study-close aria-label="Close study settings">x</button>
      </div>
      <div class="study-setting-group">
        <h3>Theme</h3>
        <div class="study-options">
          <button type="button" data-theme-choice="light">Light</button>
          <button type="button" data-theme-choice="dark">Dark</button>
          <button type="button" data-theme-choice="paper">Paper</button>
          <button type="button" data-theme-choice="contrast">Contrast</button>
        </div>
      </div>
      <div class="study-setting-group">
        <h3>Study mode</h3>
        <div class="study-options">
          <button type="button" data-study-choice="default">Default</button>
          <button type="button" data-study-choice="focus">Focus</button>
          <button type="button" data-study-choice="reading">Reading</button>
          <button type="button" data-study-choice="exam">Exam</button>
        </div>
      </div>
      <p class="risk-note">Focus mode calms visual noise. Reading mode improves long-form lessons. Exam mode hides helper docks and keeps quizzes prominent.</p>
    </div>
  `;
  document.body.appendChild(panel);

  const close = panel.querySelector("[data-study-close]");
  const openStudy = () => {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
  };
  const closeStudy = () => {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
  };

  document.querySelectorAll("[data-study-open]").forEach((button) => button.addEventListener("click", openStudy));
  close.addEventListener("click", closeStudy);
  panel.addEventListener("click", (event) => {
    if (event.target === panel) closeStudy();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeStudy();
  });

  panel.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      studyPreferences.theme = button.dataset.themeChoice;
      localStorage.setItem("nakamoto.academy.theme", studyPreferences.theme);
      applyStudyPreferences();
    });
  });
  panel.querySelectorAll("[data-study-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      studyPreferences.mode = button.dataset.studyChoice;
      localStorage.setItem("nakamoto.academy.studyMode", studyPreferences.mode);
      applyStudyPreferences();
    });
  });

  applyStudyPreferences();
}

createStudySettingsPanel();

const iconRules = [
  [/community|cohort|office|challenge|progress wall|referral|ambassador|partner|creator|media kit|student wins|sponsor/i, "CM"],
  [/onboarding|retention|rescue|churn|milestone/i, "LR"],
  [/risk|drawdown|stop|position/i, "RK"],
  [/research|source|survey|evidence|fact/i, "RS"],
  [/strategy|playbook|setup|validation|backtest/i, "ST"],
  [/history|civilization|crisis|money|banking/i, "HS"],
  [/behavior|psychology|mistake|emotion|bias/i, "BH"],
  [/model|system|decision|thinking|framework/i, "MD"],
  [/visual|diagram|profile|structure|chart|volume/i, "VG"],
  [/lesson|curriculum|student|learning|practice|worksheet|quiz/i, "LR"],
  [/glossary|library|reference/i, "RF"],
  [/price|resources|roadmap|access|learning path|enrollment/i, "AC"]
];

document.querySelectorAll(".studio-panel h3, .level-card h3, .concept-graphic h3, .card h3, .resource-item h3, .mastery-card h3, .lesson-section h2, .drill-card h3, .mistake-card h3, .worksheet-card h3, .checklist-card h3, .progress-card h3, .download-card h3, .explainer-card h3, .dashboard-side h3, .auction-module h3, .cert-card h3, .tool-card h3, .scenario-card h3, .planner-day h3, .assessment-panel h3, .review-checks h3, .community-card h3, .challenge-card h3, .cohort-card h3, .learning path-card h3, .referral-tier h3, .asset-card h3, .trust-card h3, .retention-card h3, .rescue-card h3").forEach((heading) => {
  if (heading.querySelector(".topic-icon")) return;
  const text = heading.textContent || "";
  const match = iconRules.find(([pattern]) => pattern.test(text));
  const icon = document.createElement("span");
  icon.className = "topic-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = match ? match[1] : "TC";
  heading.prepend(icon);
});

document.querySelectorAll(".glossary-term").forEach((term, index) => {
  if (term.querySelector(".mini-term-diagram")) return;
  const diagram = document.createElement("div");
  diagram.className = "mini-term-diagram";
  diagram.setAttribute("aria-hidden", "true");
  diagram.innerHTML = `
    <i style="--h:${28 + ((index + 1) % 4) * 8}px"></i>
    <i style="--h:${42 + ((index + 2) % 5) * 7}px"></i>
    <i style="--h:${34 + ((index + 3) % 4) * 9}px"></i>
    <span></span>
  `;
  term.appendChild(diagram);
});

const progress = document.createElement("div");
progress.className = "reading-progress";
progress.innerHTML = "<span></span>";
document.body.appendChild(progress);

const progressFill = progress.querySelector("span");
window.addEventListener("scroll", () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressFill.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
});

document.querySelectorAll("main > section, main > .band").forEach((section, index) => {
  section.classList.add("section-motion");
  section.style.setProperty("--section-index", index);
});

function slugifySectionLabel(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "section";
}

function createPageSectionOptions() {
  if (document.querySelector("[data-section-options]") || currentPage === "index.html") return;
  const mainElement = document.querySelector("main");
  if (!mainElement) return;

  const sections = Array.from(mainElement.querySelectorAll(":scope > section"))
    .filter((section) => !section.classList.contains("next-step-block"))
    .map((section, index) => {
      const heading = section.querySelector("h2, h1, h3");
      const headingClone = heading?.cloneNode(true);
      headingClone?.querySelectorAll(".topic-icon").forEach((icon) => icon.remove());
      const label = headingClone?.textContent?.trim();
      if (!label) return null;
      if (!section.id) {
        let base = slugifySectionLabel(label);
        let id = base;
        let suffix = 2;
        while (document.getElementById(id)) {
          id = `${base}-${suffix}`;
          suffix += 1;
        }
        section.id = id;
      }
      return { id: section.id, label: label.length > 28 ? `${label.slice(0, 25)}...` : label, index };
    })
    .filter(Boolean);

  if (sections.length < 3) return;

  const optionSection = document.createElement("section");
  optionSection.className = "section-options generated-section-options";
  optionSection.setAttribute("aria-label", "Page section options");
  optionSection.innerHTML = `
    <div class="wrap section-option-bar" data-section-options>
      ${sections.map((section) => `<a href="#${section.id}" data-section-option>${section.label}</a>`).join("")}
    </div>
  `;

  const breadcrumb = document.querySelector(".breadcrumb");
  const header = document.querySelector(".site-header");
  (breadcrumb || header)?.after(optionSection);
}

createPageSectionOptions();

const sectionOptions = document.querySelectorAll("[data-section-option]");
const optionTargets = Array.from(sectionOptions)
  .map((option) => document.querySelector(option.getAttribute("href")))
  .filter(Boolean);

const setActiveSectionOption = (id) => {
  sectionOptions.forEach((option) => {
    option.classList.toggle("active", option.getAttribute("href") === `#${id}`);
  });
};

document.querySelectorAll(".card, .level-card, .concept-graphic, .lesson-section, .resource-item, .mastery-card, .studio-panel, .module-row, .metric, .compass-step, .glossary-term, .drill-card, .mistake-card, .print-sheet, .case-notes, .worksheet-card, .checklist-card, .progress-card, .download-card, .explainer-card, .dashboard-main, .dashboard-side, .auction-module, .cert-card, .tool-card, .scenario-card, .scenario-visual, .planner-day, .assessment-panel, .assessment-questions fieldset, .review-inputs, .review-checks, .review-output, .community-composer, .community-card, .challenge-card, .cohort-card, .cohort-status, .wall-stat-grid article, .wall-board article, .learning path-card, .learning path-status, .referral-panel, .referral-tier, .asset-card, .trust-card, .retention-card, .rescue-card, .launch-plan article, .onboarding-status").forEach((element) => {
  element.classList.add("reveal");
});

if ("IntersectionObserver" in window) {
  const revealItems = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  if (revealItems.length > 180 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealItems.forEach((element) => element.classList.add("visible"));
  } else {
    revealItems.forEach((element) => observer.observe(element));
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-current", entry.isIntersecting);
      if (entry.isIntersecting && entry.target.id) setActiveSectionOption(entry.target.id);
    });
  }, { threshold: 0.28 });

  document.querySelectorAll(".section-motion").forEach((section) => sectionObserver.observe(section));
  optionTargets.forEach((section) => sectionObserver.observe(section));
} else {
  document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
  document.querySelectorAll(".section-motion").forEach((section) => section.classList.add("is-current"));
}

const getAnchorOffset = () => {
  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const optionsHeight = document.querySelector(".section-options")?.offsetHeight || 0;
  return headerHeight + optionsHeight + 14;
};

const scrollToSectionTarget = (target) => {
  const top = target.getBoundingClientRect().top + window.scrollY - getAnchorOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
};

document.querySelectorAll('a[href^="#"]').forEach((option) => {
  option.addEventListener("click", (event) => {
    const href = option.getAttribute("href") || "";
    if (href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    if (target.id) setActiveSectionOption(target.id);
    scrollToSectionTarget(target);
    history.replaceState(null, "", `${location.pathname}${location.search}${href}`);
  });
});

window.addEventListener("load", () => {
  if (!location.hash || location.hash.length < 2) return;
  const target = document.querySelector(location.hash);
  if (!target) return;
  if (target.id) setActiveSectionOption(target.id);
  setTimeout(() => scrollToSectionTarget(target), 120);
});

const motionGroups = document.querySelectorAll(".institution-ribbon, .institute-grid, .curriculum-rail, .concept-board");
let motionGroupIndex = 0;
const activateMotionGroups = () => {
  motionGroups.forEach((group) => {
    const items = Array.from(group.children);
    items.forEach((item, index) => item.classList.toggle("is-active", index === motionGroupIndex % Math.max(1, items.length)));
  });
  motionGroupIndex += 1;
};

activateMotionGroups();
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(activateMotionGroups, 5200);
}

document.querySelectorAll("[data-home-experience]").forEach((home) => {
  const board = home.querySelector(".motion-board");
  const status = home.querySelector("[data-home-status]");
  const phase = home.querySelector("[data-home-phase]");
  const title = home.querySelector("[data-home-phase-title]");
  const noteOne = home.querySelector("[data-home-note-one]");
  const noteTwo = home.querySelector("[data-home-note-two]");
  const metricOne = home.querySelector("[data-home-metric-one]");
  const metricTwo = home.querySelector("[data-home-metric-two]");
  const metricThree = home.querySelector("[data-home-metric-three]");
  const compassSteps = document.querySelectorAll(".compass-step");
  const phases = [
    ["LIVE CURRICULUM / MARKET STRUCTURE", "Phase 01", "Structure forming", "HH / HL sequence", "Trend context", "10 levels", "42 topics", "Concept maps"],
    ["LIVE CURRICULUM / LIQUIDITY", "Phase 02", "Liquidity sweep", "Stops triggered", "Rejection check", "Risk first", "Chart drills", "Liquidity maps"],
    ["LIVE CURRICULUM / AUCTION", "Phase 03", "Acceptance test", "Balance edge", "Value migration", "Auction", "Volume profile", "Process graphics"],
    ["LIVE CURRICULUM / REVIEW", "Phase 04", "Practice loop", "Mark the chart", "Journal review", "Quizzes", "Worksheets", "Recall system"]
  ];
  let index = 0;

  const render = () => {
    const item = phases[index % phases.length];
    if (status) status.textContent = item[0];
    if (phase) phase.textContent = item[1];
    if (title) title.textContent = item[2];
    if (noteOne) noteOne.textContent = item[3];
    if (noteTwo) noteTwo.textContent = item[4];
    if (metricOne) metricOne.textContent = item[5];
    if (metricTwo) metricTwo.textContent = item[6];
    if (metricThree) metricThree.textContent = item[7];
    board?.classList.add("is-changing");
    setTimeout(() => board?.classList.remove("is-changing"), 380);
    compassSteps.forEach((step, stepIndex) => step.classList.toggle("is-active", stepIndex === index % Math.max(1, compassSteps.length)));
    index += 1;
  };

  render();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    setInterval(render, 6200);
  }
});

document.querySelectorAll("[data-strategy-library]").forEach((library) => {
  const sourceLinks = `
    <div class="source-list">
      <a href="https://www.finra.org/investors/insights/frequent-intraday-trading" target="_blank" rel="noopener">FINRA: frequent intraday trading risks</a>
      <a href="https://www.cftc.gov/LearnAndProtect/AdvisoriesAndArticles/fraudadv_forex.html" target="_blank" rel="noopener">CFTC: forex fraud and risk awareness</a>
      <a href="https://www.cmegroup.com/education" target="_blank" rel="noopener">CME Group: market education library</a>
    </div>
  `;

  const detailByTitle = {
    "Market Structure Continuation": {
      use: "Use this to study whether price is continuing an existing directional sequence instead of randomly chasing candles.",
      explain: "Students should first label higher highs and higher lows or lower highs and lower lows. The strategy is only a research template when the trend, pullback, invalidation, stop location, and target logic are written down.",
      related: [["Market Structure Lesson", "lesson-market-structure.html"], ["Trend Lesson", "lesson-trends.html"], ["Chart Drills", "chart-drills.html"]]
    },
    "Market Structure Reversal": {
      use: "Use this to study failed continuation, liquidity sweeps, and the moment a trend may be losing control.",
      explain: "A reversal model needs stricter proof than a continuation model because many pullbacks look like reversals before the trend resumes. Require a sweep or failed continuation, a structure shift, and a clear invalidation level.",
      related: [["Liquidity Sweep Case", "case-study-liquidity-sweep.html"], ["Market Structure Lesson", "lesson-market-structure.html"], ["Mistake Library", "mistake-library.html"]]
    },
    "Supply And Demand Retest": {
      use: "Use this to study why price may react at an origin zone after a strong move away from that area.",
      explain: "The zone is not useful because it is drawn on a chart. It is useful only when departure, freshness, return behavior, confirmation, and risk location are clear enough to test.",
      related: [["Support And Resistance", "lesson-support-resistance.html"], ["Chart Simulator", "chart-simulator.html"], ["Strategy Checklist", "strategy-checklist.html"]]
    },
    "Price Action Pullback": {
      use: "Use this to connect candle behavior to context, not to trade single candlestick shapes in isolation.",
      explain: "The candle is the final trigger, not the reason. Students must identify trend, level, volatility, invalidation, and risk before using rejection or engulfing behavior.",
      related: [["Price Action Lesson", "lesson-price-action.html"], ["Trend Lesson", "lesson-trends.html"], ["Mistake Library", "mistake-library.html"]]
    },
    "Auction Rejection Model": {
      use: "Use this to study failed acceptance beyond value, range edges, and responsive behavior near auction extremes.",
      explain: "Rejection means price tests an area and fails to build acceptance there. Students should separate a wick, a close, a rotation, and a true return into value.",
      related: [["Auction Theory Course", "auction-theory-course.html"], ["Range Day Case", "case-study-range-day.html"], ["Volume Profile Components", "chart-components.html"]]
    },
    "Auction Acceptance Model": {
      use: "Use this to study when price starts building value outside a prior range instead of instantly rejecting it.",
      explain: "Acceptance requires time, volume, or repeated holding beyond value. A single breakout candle is not enough. Track whether pullbacks hold outside the old value area.",
      related: [["Auction Theory Course", "auction-theory-course.html"], ["Chart Drills", "chart-drills.html"], ["Trading Journal", "trading-journal.html"]]
    },
    "Volume Profile Value Migration": {
      use: "Use this to study where trading activity is shifting and whether value is moving with price.",
      explain: "Volume profile is a context tool. It can help students locate high-volume nodes, low-volume nodes, value area boundaries, and POC movement, but it still needs risk and structure confirmation.",
      related: [["Chart Components", "chart-components.html"], ["Auction Theory Course", "auction-theory-course.html"], ["Animated Explainers", "animated-explainers.html"]]
    },
    "Order Flow Absorption": {
      use: "Use this to study moments when aggressive buying or selling does not create expected price movement.",
      explain: "Absorption needs reliable data and careful interpretation. Students should learn the concept before treating footprint or delta readings as entry signals.",
      related: [["Animated Explainers", "animated-explainers.html"], ["Experience Lab", "experience-lab.html"], ["Risk Calculator", "risk-calculator.html"]]
    },
    "Liquidity Sweep Reversal": {
      use: "Use this to study stop runs, failed breakouts, trapped traders, and reclaim behavior.",
      explain: "A sweep alone is not a strategy. The useful study sequence is: identify obvious liquidity, observe sweep, wait for reclaim or structure shift, define invalidation, then review the result.",
      related: [["Liquidity Sweep Case", "case-study-liquidity-sweep.html"], ["Scenario Trainer", "scenario-trainer.html"], ["Trading Journal", "trading-journal.html"]]
    },
    "ICT / SMC FVG Continuation": {
      use: "Use this to study imbalance only after liquidity, structure, premium/discount, and session context are understood.",
      explain: "A fair value gap is not automatically an entry. Students should connect it to displacement, structure shift, location, invalidation, and a reviewable hypothesis.",
      related: [["Strategy Checklist", "strategy-checklist.html"], ["Market Structure Lesson", "lesson-market-structure.html"], ["Risk Disclosure", "risk-disclosure.html"]]
    },
    "Elliott Wave Context Framework": {
      use: "Use this as a context and invalidation framework, not as a standalone trading signal.",
      explain: "Wave counts can become subjective. Require an alternate count, a clear invalidation level, and a separate trigger before using the framework in a playbook.",
      related: [["Mental Models", "mental-models.html"], ["Mistake Library", "mistake-library.html"], ["Performance Review", "performance-review.html"]]
    },
    "Quant Research Framework": {
      use: "Use this to turn a discretionary idea into measurable variables and testable rules.",
      explain: "The purpose is to remove vague pattern naming. Define the sample, market, timeframe, costs, slippage, inclusion rules, and pass/fail metrics before trusting any result.",
      related: [["Trading Tools", "trading-tools.html"], ["Performance Review", "performance-review.html"], ["Research Methodology", "research-methodology.html"]]
    }
  };

  library.querySelectorAll(".studio-panel").forEach((card, index) => {
    const title = card.querySelector("h3")?.textContent?.trim();
    const detail = detailByTitle[title];
    if (!detail || card.querySelector("[data-strategy-toggle]")) return;

    const id = `strategy-details-${index + 1}`;
    const relatedLinks = detail.related.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
    const controls = document.createElement("div");
    controls.className = "strategy-actions";
    controls.innerHTML = `
      <button class="btn ghost" type="button" data-strategy-toggle aria-expanded="false" aria-controls="${id}">Explain use</button>
      <a class="btn" href="strategy-checklist.html">Use checklist</a>
    `;

    const panel = document.createElement("div");
    panel.className = "strategy-details";
    panel.id = id;
    panel.hidden = true;
    panel.innerHTML = `
      <h4>What students use this for</h4>
      <p>${detail.use}</p>
      <h4>Plain explanation</h4>
      <p>${detail.explain}</p>
      <h4>Related study</h4>
      <div class="related-study">${relatedLinks}</div>
      <h4>External references</h4>
      ${sourceLinks}
    `;

    card.append(controls, panel);

    controls.querySelector("[data-strategy-toggle]")?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      button.setAttribute("aria-expanded", String(!isOpen));
      button.textContent = isOpen ? "Explain use" : "Hide details";
    });
  });
});

document.querySelectorAll("[data-filter-group]").forEach((group) => {
  const chips = group.querySelectorAll("[data-filter]");
  const items = document.querySelectorAll(`[data-filter-item="${group.dataset.filterGroup}"]`);

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      items.forEach((item) => {
        const tags = (item.dataset.tags || "").split(" ");
        item.hidden = value !== "all" && !tags.includes(value);
      });
    });
  });
});

document.querySelectorAll("[data-glossary-search]").forEach((input) => {
  const terms = document.querySelectorAll(".glossary-term");
  input.addEventListener("input", () => {
    const query = input.value.toLowerCase().trim();
    terms.forEach((term) => {
      term.hidden = query && !term.textContent.toLowerCase().includes(query);
    });
  });
});

document.querySelectorAll("[data-risk-lab]").forEach((lab) => {
  const balance = lab.querySelector("[data-risk-balance]");
  const percent = lab.querySelector("[data-risk-percent]");
  const stop = lab.querySelector("[data-risk-stop]");
  const output = lab.querySelector("[data-risk-output]");

  const update = () => {
    if (!balance || !percent || !stop || !output) return;
    const account = Math.max(0, Number(balance.value));
    const riskPct = Math.max(0, Number(percent.value));
    const stopPoints = Math.max(0.01, Number(stop.value));
    const riskAmount = account * (riskPct / 100);
    const units = riskAmount / stopPoints;
    output.innerHTML = `
      <strong>$${riskAmount.toFixed(2)}</strong>
      <span>risk amount</span>
      <strong>${units.toFixed(2)}</strong>
      <span>units per 1-point value</span>
    `;
  };

  [balance, percent, stop].forEach((input) => input?.addEventListener("input", update));
  update();
});

document.querySelectorAll("[data-tools-lab]").forEach((lab) => {
  const value = (selector, fallback = 0.01) => {
    const input = lab.querySelector(selector);
    const number = Number(input?.value);
    return Number.isFinite(number) ? Math.max(0, number) : fallback;
  };
  const output = (name, html) => {
    const target = lab.querySelector(`[data-tool-output="${name}"]`);
    if (target) target.innerHTML = html;
  };
  const percent = (number) => `${number.toFixed(2)}%`;
  const money = (number) => `$${number.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;

  const updateExpectancy = () => {
    const winRate = Math.min(100, value("[data-exp-winrate]")) / 100;
    const averageWin = value("[data-exp-win]");
    const averageLoss = value("[data-exp-loss]");
    const trades = value("[data-exp-trades]", 0);
    const expectancy = (winRate * averageWin) - ((1 - winRate) * averageLoss);
    const monthly = expectancy * trades;
    const label = expectancy > 0 ? "Positive sample edge" : expectancy === 0 ? "Flat sample" : "Negative sample edge";
    output("expectancy", `
      <strong>${expectancy.toFixed(2)}R</strong>
      <span>expectancy per trade</span>
      <strong>${monthly.toFixed(2)}R</strong>
      <span>estimated monthly expectancy across ${Math.round(trades)} trades</span>
      <em>${label}. Include fees, slippage, and a larger sample before trusting the number.</em>
    `);
  };

  const updateDrawdown = () => {
    const drawdown = Math.min(99.9, value("[data-dd-percent]")) / 100;
    const monthlyReturn = value("[data-dd-return]", 0) / 100;
    const required = drawdown / Math.max(0.001, 1 - drawdown);
    const months = monthlyReturn > 0 ? Math.ceil(Math.log(1 + required) / Math.log(1 + monthlyReturn)) : null;
    output("drawdown", `
      <strong>${percent(required * 100)}</strong>
      <span>return required to recover</span>
      <strong>${months ? `${months} months` : "No estimate"}</strong>
      <span>${months ? `at ${percent(monthlyReturn * 100)} planned monthly return` : "enter a monthly return above zero"}</span>
      <em>Drawdowns become nonlinear. The deeper the loss, the more defensive the process must become.</em>
    `);
  };

  const updateRuin = () => {
    const winRate = Math.min(100, value("[data-ruin-winrate]")) / 100;
    const averageWin = value("[data-ruin-win]");
    const averageLoss = value("[data-ruin-loss]");
    const risk = Math.max(0.01, value("[data-ruin-risk]"));
    const maxDrawdown = value("[data-ruin-dd]");
    const expectancy = (winRate * averageWin) - ((1 - winRate) * averageLoss);
    const lossUnits = maxDrawdown / risk;
    let label = "Controlled stress";
    if (expectancy <= 0) label = "High danger";
    else if (risk > 2) label = "Aggressive risk";
    else if (lossUnits < 10) label = "Thin buffer";
    output("ruin", `
      <strong>${label}</strong>
      <span>educational stress reading</span>
      <strong>${expectancy.toFixed(2)}R</strong>
      <span>edge estimate per trade</span>
      <strong>${lossUnits.toFixed(1)}</strong>
      <span>full-risk losses before the drawdown limit is reached</span>
      <em>This is a simplified stress test, not a precise risk-of-ruin model. Validate with backtesting and forward testing.</em>
    `);
  };

  const updateSizing = () => {
    const balance = value("[data-size-balance]");
    const risk = value("[data-size-risk]");
    const stop = Math.max(0.01, value("[data-size-stop]"));
    const unitValue = Math.max(0.01, value("[data-size-unit]"));
    const asset = lab.querySelector("[data-size-asset]")?.value || "shares";
    const riskAmount = balance * (risk / 100);
    const units = riskAmount / (stop * unitValue);
    const unitLabel = {
      shares: "estimated shares",
      forex: "estimated lots or units",
      futures: "estimated contracts",
      crypto: "estimated coins or units",
      options: "estimated contracts"
    }[asset] || "estimated units";
    output("sizing", `
      <strong>${money(riskAmount)}</strong>
      <span>maximum planned risk</span>
      <strong>${units.toFixed(2)}</strong>
      <span>${unitLabel}</span>
      <em>Confirm the asset's tick value, pip value, contract multiplier, fees, and liquidity before using real capital.</em>
    `);
  };

  const updateAll = () => {
    updateExpectancy();
    updateDrawdown();
    updateRuin();
    updateSizing();
  };

  lab.querySelectorAll("input, select").forEach((input) => input.addEventListener("input", updateAll));
  lab.querySelectorAll("select").forEach((input) => input.addEventListener("change", updateAll));
  updateAll();
});

document.querySelectorAll("[data-scenario-trainer]").forEach((trainer) => {
  const scenarios = {
    trend: {
      label: "Scenario 01",
      title: "Trend pullback at prior resistance",
      context: "The market is making higher highs and higher lows. Price pulls back into a prior breakout area while volatility compresses.",
      facts: ["Structure: higher high, higher low sequence", "Location: prior resistance acting as support", "Risk: stop must sit below invalidation, not inside noise"],
      evidence: ["Trend remains intact", "Pullback holds above prior structure", "Risk/reward is at least 1.5R", "No major news event is scheduled"],
      answer: "long",
      idealEvidence: 3,
      feedback: {
        long: "Correct bias. A long is acceptable only after the pullback holds and the stop can sit beyond invalidation.",
        short: "Weak decision. Shorting into an intact higher-low structure is fighting context unless structure fails first.",
        wait: "Acceptable if confirmation is missing. Waiting is better than forcing an entry inside unclear compression.",
        reduce: "Professional if volatility or news risk is elevated. Size should follow evidence quality."
      },
      chart: "trend"
    },
    sweep: {
      label: "Scenario 02",
      title: "Liquidity sweep above range high",
      context: "Price trades above an obvious range high, triggers breakout buyers, then quickly closes back inside the range.",
      facts: ["Structure: range-bound auction", "Location: external buy-side liquidity", "Risk: failed breakout can reverse sharply"],
      evidence: ["Sweep returns inside the range", "Breakout volume fails to continue", "Invalidation is above the sweep high", "Target is the range midpoint or opposite side"],
      answer: "short",
      idealEvidence: 3,
      feedback: {
        long: "Weak decision. Buying after a failed breakout means chasing the traders who may now be trapped.",
        short: "Correct bias. The short is valid only if price reaccepts inside the range and risk is defined above the sweep.",
        wait: "Acceptable. Waiting for a retest often improves risk and reduces emotional execution.",
        reduce: "Good defensive choice if the rejection is visible but the stop is wide."
      },
      chart: "sweep"
    },
    range: {
      label: "Scenario 03",
      title: "Middle of range with no edge",
      context: "Price is trading near the center of a sideways market. Both support and resistance are far away, and recent candles overlap.",
      facts: ["Structure: balance and rotation", "Location: poor middle-of-range area", "Risk: reward is unclear because the trade is not near an edge"],
      evidence: ["No clean support or resistance edge", "Candles overlap with weak direction", "Reward to risk is below 1.5R", "Best plan is to wait for range edge"],
      answer: "wait",
      idealEvidence: 3,
      feedback: {
        long: "Poor decision. Buying the middle of a range gives weak location and unclear invalidation.",
        short: "Poor decision. Shorting the middle of a range has the same problem: no clean edge.",
        wait: "Correct. Professional traders often protect capital by waiting for price to reach a meaningful location.",
        reduce: "Better than full size, but the cleaner answer is no trade until location improves."
      },
      chart: "range"
    }
  };

  const tabs = trainer.querySelectorAll("[data-scenario-tab]");
  const stage = trainer.querySelector("[data-scenario-stage]");
  const label = trainer.querySelector("[data-scenario-label]");
  const title = trainer.querySelector("[data-scenario-title]");
  const context = trainer.querySelector("[data-scenario-context]");
  const facts = trainer.querySelector("[data-scenario-facts]");
  const evidence = trainer.querySelector("[data-scenario-evidence]");
  const result = trainer.querySelector("[data-scenario-result]");
  const choices = trainer.querySelectorAll("[data-scenario-choice]");
  let currentKey = "trend";

  function chartSvg(type) {
    const paths = {
      trend: ["M18 180 C72 130 108 154 154 112 S246 112 292 72 S384 74 436 34", "M78 148 L172 148", "M248 88 L356 88"],
      sweep: ["M18 138 C70 112 126 152 178 128 S278 152 326 76 S382 132 438 118", "M52 130 L400 130", "M314 74 L416 74"],
      range: ["M18 126 C70 94 118 154 172 120 S260 146 310 110 S382 154 438 122", "M34 82 L424 82", "M34 164 L424 164"]
    }[type] || [];
    return `
      <svg viewBox="0 0 456 220" preserveAspectRatio="none" aria-hidden="true">
        <path class="scenario-path" d="${paths[0]}"></path>
        <path class="scenario-level" d="${paths[1]}"></path>
        <path class="scenario-level accent" d="${paths[2]}"></path>
      </svg>
      <span class="scenario-zone zone-one">${type === "range" ? "Resistance" : "Liquidity"}</span>
      <span class="scenario-zone zone-two">${type === "sweep" ? "Reacceptance" : "Support"}</span>
      <span class="scenario-pulse"></span>
    `;
  }

  function checkedEvidence() {
    return Array.from(evidence?.querySelectorAll("input:checked") || []).length;
  }

  function renderScenario(key) {
    const scenario = scenarios[key] || scenarios.trend;
    currentKey = key;
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.scenarioTab === key));
    if (stage) stage.innerHTML = chartSvg(scenario.chart);
    if (label) label.textContent = scenario.label;
    if (title) title.textContent = scenario.title;
    if (context) context.textContent = scenario.context;
    if (facts) facts.innerHTML = scenario.facts.map((item) => `<span>${item}</span>`).join("");
    if (evidence) {
      evidence.innerHTML = scenario.evidence.map((item, index) => `
        <label>
          <input type="checkbox" data-scenario-check="${index}">
          <span>${item}</span>
        </label>
      `).join("");
    }
    choices.forEach((choice) => choice.classList.remove("active", "correct", "wrong"));
    if (result) result.textContent = "Select evidence, then choose an action.";
  }

  function choose(action) {
    const scenario = scenarios[currentKey] || scenarios.trend;
    const evidenceCount = checkedEvidence();
    const enoughEvidence = evidenceCount >= scenario.idealEvidence;
    const correct = action === scenario.answer;
    const processScore = (correct ? 60 : 15) + Math.min(40, evidenceCount * 10);
    choices.forEach((choice) => {
      const isActive = choice.dataset.scenarioChoice === action;
      choice.classList.toggle("active", isActive);
      choice.classList.toggle("correct", isActive && correct);
      choice.classList.toggle("wrong", isActive && !correct);
    });
    if (result) {
      result.innerHTML = `
        <strong>${processScore}/100 process score</strong>
        <span>${scenario.feedback[action] || "Review the scenario before choosing."}</span>
        <em>${enoughEvidence ? "Evidence check passed." : "Evidence is thin. Slow down and prove the setup before acting."}</em>
      `;
    }
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => renderScenario(tab.dataset.scenarioTab)));
  choices.forEach((choice) => choice.addEventListener("click", () => choose(choice.dataset.scenarioChoice)));
  renderScenario(currentKey);
});

document.querySelectorAll("[data-practice-planner]").forEach((planner) => {
  const form = planner.querySelector("[data-planner-controls]");
  const level = planner.querySelector("[data-plan-level]");
  const goal = planner.querySelector("[data-plan-goal]");
  const time = planner.querySelector("[data-plan-time]");
  const weakness = planner.querySelector("[data-plan-weakness]");
  const summary = planner.querySelector("[data-plan-summary]");
  const days = planner.querySelector("[data-plan-days]");
  const reset = planner.querySelector("[data-plan-reset]");
  const storageKey = "nakamoto.academy.practicePlanner";

  const lessonByLevel = {
    beginner: ["Foundations", "lesson-financial-markets.html", "Learn the market, participants, order types, and the first risk rules."],
    intermediate: ["Technical Analysis", "lesson-market-structure.html", "Study structure, trends, zones, reactions, and invalidation."],
    advanced: ["Professional Process", "strategy-lab.html", "Connect setups, evidence, risk, backtesting, and review."]
  };

  const goalBlocks = {
    structure: ["Structure reading", "chart-drills.html", "Mark HH, HL, LH, LL, BOS, CHoCH, and failed structure on three charts."],
    risk: ["Risk control", "trading-tools.html", "Calculate position size, drawdown recovery, and the risk pressure before every sample trade."],
    execution: ["Execution quality", "scenario-trainer.html", "Choose trade, wait, or reduce-size decisions from scenario pressure."],
    psychology: ["Behavior repair", "mistake-library.html", "Identify the mistake pattern, write the trigger, and define one prevention rule."]
  };

  const weaknessBlocks = {
    terms: ["Vocabulary", "glossary.html", "Review ten terms, then explain them without looking."],
    charts: ["Chart reading", "chart-simulator.html", "Draw levels, liquidity, entry, stop, target, and invalidation on one practice chart."],
    setups: ["Setup selection", "strategy-checklist.html", "Compare one setup against market condition, entry, stop, exit, and validation rules."],
    review: ["Review discipline", "trading-journal.html", "Journal one decision, one emotion, one mistake, and one improvement rule."]
  };

  const timeBlocks = {
    short: ["20-minute sprint", "one focused task and one recall note"],
    medium: ["45-minute session", "lesson, drill, and short journal review"],
    deep: ["90-minute deep work", "lesson, drill, scenario, journal, and checklist review"]
  };

  function readPlannerState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function writePlannerState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function currentConfig() {
    return {
      level: level?.value || "beginner",
      goal: goal?.value || "structure",
      time: time?.value || "short",
      weakness: weakness?.value || "terms"
    };
  }

  function configKey(config) {
    return `${config.level}-${config.goal}-${config.time}-${config.weakness}`;
  }

  function createPlan(config) {
    const lesson = lessonByLevel[config.level] || lessonByLevel.beginner;
    const goalBlock = goalBlocks[config.goal] || goalBlocks.structure;
    const weakBlock = weaknessBlocks[config.weakness] || weaknessBlocks.terms;
    const timeBlock = timeBlocks[config.time] || timeBlocks.short;
    return [
      ["Day 1", "Orientation", lesson[1], lesson[2]],
      ["Day 2", goalBlock[0], goalBlock[1], goalBlock[2]],
      ["Day 3", weakBlock[0], weakBlock[1], weakBlock[2]],
      ["Day 4", "Visual practice", "resources.html", "Use the visual lab to redraw the concept from memory, then compare it to the original."],
      ["Day 5", "Decision rehearsal", "scenario-trainer.html", "Complete two scenarios and write why the best answer was trade, wait, or reduce size."],
      ["Day 6", "Risk and review", "trading-tools.html", "Run the numbers for one sample setup, then record the mistake it is designed to prevent."],
      ["Day 7", "Weekly review", "student-dashboard.html", `Review the week, mark progress, and prepare the next ${timeBlock[0]} plan with ${timeBlock[1]}.`]
    ];
  }

  function renderPlan() {
    if (!summary || !days) return;
    const config = currentConfig();
    const state = readPlannerState();
    state._lastConfig = config;
    writePlannerState(state);
    const key = configKey(config);
    const checked = state[key] || [];
    const plan = createPlan(config);
    const complete = checked.length;
    const levelName = lessonByLevel[config.level]?.[0] || "Foundations";
    const goalName = goalBlocks[config.goal]?.[0] || "Structure reading";
    const weakName = weaknessBlocks[config.weakness]?.[0] || "Vocabulary";
    const timeName = timeBlocks[config.time]?.[0] || "20-minute sprint";

    summary.innerHTML = `
      <strong>${complete}/${plan.length} days complete</strong>
      <span>${levelName} / ${goalName} / ${weakName} / ${timeName}</span>
      <i style="--planner-progress:${Math.round((complete / plan.length) * 100)}%"></i>
    `;

    days.innerHTML = plan.map((item, index) => {
      const id = `${key}-${index}`;
      const done = checked.includes(id);
      return `
        <article class="planner-day ${done ? "is-complete" : ""}">
          <label>
            <input type="checkbox" data-plan-check="${id}" ${done ? "checked" : ""}>
            <span>${item[0]}</span>
          </label>
          <h3>${item[1]}</h3>
          <p>${item[3]}</p>
          <a href="${item[2]}">Open task</a>
        </article>
      `;
    }).join("");

    days.querySelectorAll("[data-plan-check]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const nextState = readPlannerState();
        const nextChecked = new Set(nextState[key] || []);
        if (checkbox.checked) nextChecked.add(checkbox.dataset.planCheck);
        else nextChecked.delete(checkbox.dataset.planCheck);
        nextState[key] = Array.from(nextChecked);
        writePlannerState(nextState);
        renderPlan();
      });
    });
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    renderPlan();
  });

  [level, goal, time, weakness].forEach((input) => input?.addEventListener("change", renderPlan));
  reset?.addEventListener("click", () => {
    const state = readPlannerState();
    delete state[configKey(currentConfig())];
    writePlannerState(state);
    renderPlan();
  });

  const savedConfig = readPlannerState()._lastConfig;
  if (savedConfig) {
    if (level && savedConfig.level) level.value = savedConfig.level;
    if (goal && savedConfig.goal) goal.value = savedConfig.goal;
    if (time && savedConfig.time) time.value = savedConfig.time;
    if (weakness && savedConfig.weakness) weakness.value = savedConfig.weakness;
  }
  renderPlan();
});

document.querySelectorAll("[data-skill-assessment]").forEach((assessment) => {
  const form = assessment.querySelector("[data-assessment-form]");
  const questions = Array.from(assessment.querySelectorAll("[data-assessment-question]"));
  const result = assessment.querySelector("[data-assessment-result]");
  const reset = assessment.querySelector("[data-assessment-reset]");
  const storageKey = "nakamoto.academy.skillAssessment";
  const paths = {
    foundations: ["Foundation path", "Start with terms, orders, market participants, and risk basics.", "start-here.html", "Start Here"],
    structure: ["Chart-reading path", "Focus on market structure, trends, support, resistance, and scenario practice.", "lesson-market-structure.html", "Study Structure"],
    risk: ["Risk-control path", "Use position sizing, drawdown recovery, and risk-first checklists before advanced strategy work.", "trading-tools.html", "Open Tools"],
    execution: ["Execution path", "Practice trade/no-trade decisions, evidence checks, and simulator planning.", "scenario-trainer.html", "Open Trainer"],
    review: ["Review discipline path", "Build journal habits, weekly review, mistake tagging, and practice planning.", "practice-planner.html", "Build Plan"]
  };

  function readSavedResult() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  }

  function writeSavedResult(payload) {
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  function renderResult(payload) {
    if (!result || !payload) return;
    const path = paths[payload.weakest] || paths.foundations;
    result.innerHTML = `
      <strong>${payload.score}/${payload.total} correct</strong>
      <span>${payload.level}</span>
      <p>Weak area: ${payload.weakLabel}. ${path[1]}</p>
      <div class="assessment-meter"><i style="--assessment-score:${payload.percent}%"></i></div>
      <a class="btn primary" href="${path[2]}">${path[3]}</a>
      <a class="btn" href="practice-planner.html">Build Weekly Plan</a>
    `;
  }

  function scoreAssessment() {
    const categoryScores = {};
    let score = 0;
    let answered = 0;
    questions.forEach((question) => {
      const checked = question.querySelector("input[type='radio']:checked");
      const category = question.dataset.category || "foundations";
      categoryScores[category] ||= { correct: 0, total: 0 };
      categoryScores[category].total += 1;
      question.classList.toggle("is-missing", !checked);
      if (checked) {
        answered += 1;
        const correct = checked.value === "1";
        if (correct) {
          score += 1;
          categoryScores[category].correct += 1;
        }
        question.classList.toggle("is-correct", correct);
        question.classList.toggle("is-wrong", !correct);
      } else {
        question.classList.remove("is-correct", "is-wrong");
      }
    });

    if (answered < questions.length) {
      if (result) {
        result.innerHTML = `
          <strong>${answered}/${questions.length} answered</strong>
          <span>Finish every question to receive a placement path.</span>
        `;
      }
      return;
    }

    const weakest = Object.entries(categoryScores)
      .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))[0]?.[0] || "foundations";
    const percentScore = Math.round((score / questions.length) * 100);
    const level = percentScore < 50
      ? "Foundation learner"
      : percentScore < 75
        ? "Developing chart reader"
        : "Process-ready learner";
    const weakLabel = {
      foundations: "market mechanics",
      structure: "chart structure",
      risk: "risk control",
      execution: "execution decisions",
      review: "review discipline"
    }[weakest] || "foundations";
    const payload = {
      score,
      total: questions.length,
      percent: percentScore,
      level,
      weakest,
      weakLabel,
      savedAt: new Date().toISOString()
    };
    writeSavedResult(payload);
    renderResult(payload);
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    scoreAssessment();
  });

  reset?.addEventListener("click", () => {
    form?.reset();
    localStorage.removeItem(storageKey);
    questions.forEach((question) => question.classList.remove("is-correct", "is-wrong", "is-missing"));
    if (result) {
      result.innerHTML = `
        <strong>Not scored yet</strong>
        <span>Answer all questions to receive a placement path.</span>
      `;
    }
  });

  const saved = readSavedResult();
  if (saved) renderResult(saved);
});

document.querySelectorAll("[data-performance-review]").forEach((review) => {
  const form = review.querySelector("[data-review-form]");
  const output = review.querySelector("[data-review-output]");
  const reset = review.querySelector("[data-review-reset]");
  const fields = {
    trades: review.querySelector("[data-review-trades]"),
    wins: review.querySelector("[data-review-wins]"),
    avgWin: review.querySelector("[data-review-avg-win]"),
    avgLoss: review.querySelector("[data-review-avg-loss]"),
    ruleBreaks: review.querySelector("[data-review-rule-breaks]"),
    riskViolations: review.querySelector("[data-review-risk-violations]"),
    journaled: review.querySelector("[data-review-journaled]"),
    revenge: review.querySelector("[data-review-revenge]")
  };

  const number = (input, fallback = 0) => {
    const value = Number(input?.value);
    return Number.isFinite(value) ? Math.max(0, value) : fallback;
  };

  function calculateReview() {
    if (!output) return;
    const trades = Math.max(1, number(fields.trades, 1));
    const wins = Math.min(trades, number(fields.wins));
    const losses = Math.max(0, trades - wins);
    const avgWin = number(fields.avgWin);
    const avgLoss = number(fields.avgLoss);
    const ruleBreaks = Math.min(trades, number(fields.ruleBreaks));
    const riskViolations = Math.min(trades, number(fields.riskViolations));
    const journaled = Math.min(trades, number(fields.journaled));
    const revenge = Math.min(trades, number(fields.revenge));
    const checks = Array.from(review.querySelectorAll("[data-review-check]"));
    const completedChecks = checks.filter((item) => item.checked).length;
    const winRate = wins / trades;
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);
    const journalRate = journaled / trades;
    const ruleRate = ruleBreaks / trades;
    const riskRate = riskViolations / trades;
    const revengeRate = revenge / trades;
    const checklistRate = checks.length ? completedChecks / checks.length : 0;
    const processScore = Math.max(0, Math.min(100, Math.round(
      35 * journalRate +
      25 * checklistRate +
      20 * (1 - ruleRate) +
      15 * (1 - riskRate) +
      5 * (1 - revengeRate)
    )));
    const weakArea = [
      ["Journal discipline", journalRate, "trading-journal.html", "Open Journal"],
      ["Rule following", 1 - ruleRate, "mistake-library.html", "Review Mistakes"],
      ["Risk control", 1 - riskRate, "trading-tools.html", "Open Risk Tools"],
      ["Emotional control", 1 - revengeRate, "human-behavior.html", "Study Behavior"],
      ["Process checklist", checklistRate, "strategy-checklist.html", "Open Checklist"]
    ].sort((a, b) => a[1] - b[1])[0];
    const status = processScore >= 80 ? "Process stable" : processScore >= 60 ? "Process developing" : "Process needs repair";
    const edgeStatus = expectancy > 0 ? "Positive sample expectancy" : expectancy === 0 ? "Flat sample expectancy" : "Negative sample expectancy";
    output.innerHTML = `
      <div class="review-stat-grid">
        <article><strong>${(winRate * 100).toFixed(1)}%</strong><span>win rate</span></article>
        <article><strong>${expectancy.toFixed(2)}R</strong><span>expectancy</span></article>
        <article><strong>${(journalRate * 100).toFixed(0)}%</strong><span>journal compliance</span></article>
        <article><strong>${processScore}/100</strong><span>process score</span></article>
      </div>
      <div class="review-diagnosis">
        <strong>${status}</strong>
        <p>${edgeStatus}. Weak area: ${weakArea[0]}. Review ${trades} trades as a batch before changing the strategy.</p>
        <div class="assessment-meter"><i style="--assessment-score:${processScore}%"></i></div>
        <a class="btn primary" href="${weakArea[2]}">${weakArea[3]}</a>
        <a class="btn" href="practice-planner.html">Build Repair Plan</a>
      </div>
    `;
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateReview();
  });

  Object.values(fields).forEach((input) => input?.addEventListener("input", calculateReview));
  review.querySelectorAll("[data-review-check]").forEach((input) => input.addEventListener("change", calculateReview));
  reset?.addEventListener("click", () => {
    if (fields.trades) fields.trades.value = "20";
    if (fields.wins) fields.wins.value = "9";
    if (fields.avgWin) fields.avgWin.value = "1.7";
    if (fields.avgLoss) fields.avgLoss.value = "1";
    if (fields.ruleBreaks) fields.ruleBreaks.value = "3";
    if (fields.riskViolations) fields.riskViolations.value = "1";
    if (fields.journaled) fields.journaled.value = "14";
    if (fields.revenge) fields.revenge.value = "1";
    review.querySelectorAll("[data-review-check]").forEach((input, index) => {
      input.checked = [0, 1, 4].includes(index);
    });
    calculateReview();
  });
  calculateReview();
});

document.querySelectorAll("[data-community-hub]").forEach((hub) => {
  const key = "nakamoto.academy.communityPosts";
  const form = hub.querySelector("[data-community-form]");
  const feed = hub.querySelector("[data-community-feed]");
  const clear = hub.querySelector("[data-community-clear]");
  const starterPosts = [
    { type: "Study Win", title: "Completed my first risk review", note: "I found two oversized trades and added a pre-entry sizing rule.", date: "Pinned" },
    { type: "Chart Question", title: "Range middle problem", note: "I keep seeing entries in the middle of a range. This week I am waiting for edges only.", date: "Pinned" },
    { type: "Challenge Update", title: "Weekly process board", note: "Finished chart marks and scenarios. Still need the review lab before Friday.", date: "Pinned" }
  ];

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const write = (items) => localStorage.setItem(key, JSON.stringify(items));
  const render = () => {
    if (!feed) return;
    const posts = [...read(), ...starterPosts];
    feed.innerHTML = posts.map((post) => `
      <article class="community-card">
        <span>${post.type} / ${post.date}</span>
        <h3>${post.title}</h3>
        <p>${post.note}</p>
      </article>
    `).join("");
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const type = hub.querySelector("[data-community-type]")?.value || "Study Win";
    const title = hub.querySelector("[data-community-title]")?.value || "Untitled post";
    const note = hub.querySelector("[data-community-note]")?.value || "No note added.";
    write([{ type, title, note, date: "Saved locally" }, ...read()].slice(0, 12));
    render();
  });
  clear?.addEventListener("click", () => {
    localStorage.removeItem(key);
    render();
  });
  render();
});

document.querySelectorAll("[data-weekly-challenges]").forEach((board) => {
  const key = "nakamoto.academy.weeklyChallenges";
  const checks = Array.from(board.querySelectorAll("[data-challenge-check]"));
  const summary = board.querySelector("[data-challenge-summary]");
  const reset = board.querySelector("[data-challenge-reset]");
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const write = (items) => localStorage.setItem(key, JSON.stringify([...new Set(items)]));
  const render = () => {
    const done = read();
    checks.forEach((check) => {
      check.checked = done.includes(check.dataset.challengeCheck);
      check.closest(".challenge-card")?.classList.toggle("is-complete", check.checked);
    });
    const score = Math.round((done.length / Math.max(1, checks.length)) * 100);
    if (summary) {
      summary.innerHTML = `
        <strong>${done.length}/${checks.length} complete</strong>
        <span>${score}% weekly process score</span>
        <div class="assessment-meter"><i style="--assessment-score:${score}%"></i></div>
      `;
    }
  };
  checks.forEach((check) => {
    check.addEventListener("change", () => {
      const done = new Set(read());
      if (check.checked) done.add(check.dataset.challengeCheck);
      else done.delete(check.dataset.challengeCheck);
      write(Array.from(done));
      render();
    });
  });
  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    render();
  });
  render();
});

document.querySelectorAll("[data-progress-wall]").forEach((wall) => {
  const stats = wall.querySelector("[data-wall-stats]");
  const board = wall.querySelector("[data-wall-board]");
  const parse = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) || fallback);
    } catch {
      return JSON.parse(fallback);
    }
  };
  const lessons = parse("nakamoto.academy.completedLessons", "[]").length;
  const challenges = parse("nakamoto.academy.weeklyChallenges", "[]").length;
  const posts = parse("nakamoto.academy.communityPosts", "[]").length;
  const questions = parse("nakamoto.academy.officeQuestions", "[]").length;
  const cohortLabels = {
    foundation: "Foundation Cohort",
    risk: "Risk Reset Cohort",
    structure: "Market Structure Cohort",
    professional: "Professional Process Cohort"
  };
  const cohortKey = localStorage.getItem("nakamoto.academy.cohort");
  const cohort = cohortLabels[cohortKey] || "No cohort selected";
  const planner = parse("nakamoto.academy.practicePlanner", "{}");
  const resources = Object.keys(planner).filter((item) => !item.startsWith("_")).length;
  const score = Math.min(100, lessons * 10 + challenges * 8 + resources * 8 + posts * 4 + questions * 4 + (cohort.includes("No cohort") ? 0 : 12));
  if (stats) {
    stats.innerHTML = `
      <article><strong>${score}</strong><span>process score</span></article>
      <article><strong>${lessons}</strong><span>lessons complete</span></article>
      <article><strong>${challenges}/6</strong><span>weekly challenges</span></article>
      <article><strong>${cohort}</strong><span>active cohort</span></article>
    `;
  }
  if (board) {
    board.innerHTML = `
      <article><h3>Your process wall</h3><p>Local signal: ${score >= 70 ? "strong consistency" : score >= 35 ? "building consistency" : "needs a first weekly rhythm"}.</p><a href="weekly-challenges.html">Open Weekly Challenges</a></article>
      <article><h3>Community actions</h3><p>${posts} saved posts and ${questions} office-hours questions. Add one useful reflection after each study block.</p><a href="community-hub.html">Open Community Hub</a></article>
      <article><h3>Next growth move</h3><p>${challenges < 6 ? "Finish this week's process board before adding new tasks." : "Review your performance sample and choose the next weak area."}</p><a href="performance-review.html">Open Review Lab</a></article>
    `;
  }
});

document.querySelectorAll("[data-cohorts]").forEach((cohorts) => {
  const key = "nakamoto.academy.cohort";
  const status = cohorts.querySelector("[data-cohort-status]");
  const labels = {
    foundation: "Foundation Cohort",
    risk: "Risk Reset Cohort",
    structure: "Market Structure Cohort",
    professional: "Professional Process Cohort"
  };
  const render = () => {
    const selected = localStorage.getItem(key);
    cohorts.querySelectorAll("[data-cohort-card]").forEach((card) => {
      card.classList.toggle("is-complete", card.dataset.cohortCard === selected);
    });
    if (status) {
      status.innerHTML = selected
        ? `<strong>${labels[selected]}</strong><span>Active cohort saved locally. Start with the weekly challenge and office-hours question queue.</span>`
        : `<strong>No cohort selected</strong><span>Pick one cohort to focus the next study cycle.</span>`;
    }
  };
  cohorts.querySelectorAll("[data-cohort-join]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(key, button.dataset.cohortJoin);
      render();
    });
  });
  render();
});

document.querySelectorAll("[data-office-hours]").forEach((office) => {
  const key = "nakamoto.academy.officeQuestions";
  const form = office.querySelector("[data-office-form]");
  const queue = office.querySelector("[data-office-queue]");
  const clear = office.querySelector("[data-office-clear]");
  const starter = [
    { session: "Monday Structure Lab", question: "How do I separate a real break of structure from a liquidity sweep?", context: "Focus: structure and location.", date: "Pinned" },
    { session: "Wednesday Risk Clinic", question: "When should I reduce size after a drawdown?", context: "Focus: process score and rule breaks.", date: "Pinned" }
  ];
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const write = (items) => localStorage.setItem(key, JSON.stringify(items));
  const render = () => {
    if (!queue) return;
    const questions = [...read(), ...starter];
    queue.innerHTML = questions.map((item) => `
      <article class="community-card">
        <span>${item.session} / ${item.date}</span>
        <h3>${item.question}</h3>
        <p>${item.context}</p>
      </article>
    `).join("");
  };
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const session = office.querySelector("[data-office-session]")?.value || "Office Hours";
    const question = office.querySelector("[data-office-question]")?.value || "Untitled question";
    const context = office.querySelector("[data-office-context]")?.value || "No context added.";
    write([{ session, question, context, date: "Saved locally" }, ...read()].slice(0, 12));
    render();
  });
  clear?.addEventListener("click", () => {
    localStorage.removeItem(key);
    render();
  });
  render();
});

document.querySelectorAll("[data-learning-path]").forEach((member) => {
  const key = "nakamoto.academy.learning-path";
  const resources = {
    starter: ["Free Starter", "Start with assessment, first lessons, glossary, and roadmap.", "skill-assessment.html", "Take Assessment"],
    practice: ["Core Study", "Use tools, trainer, planner, weekly challenges, and review lab.", "weekly-challenges.html", "Open Challenges"],
    cohort: ["Guided Cohort", "Join cohort, office hours, progress wall, certification path, and community rhythm.", "cohorts.html", "View Cohorts"]
  };
  const status = member.querySelector("[data-learning-path-status]");
  const allChecks = Array.from(document.querySelectorAll("[data-learning-path-check]"));

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"plan":"starter","checks":[]}');
    } catch {
      return { plan: "starter", checks: [] };
    }
  };

  const write = (state) => localStorage.setItem(key, JSON.stringify(state));

  const render = () => {
    const state = read();
    const selectedPlan = resources[state.plan] || resources.starter;
    member.querySelectorAll("[data-learning-path-plan]").forEach((card) => {
      card.classList.toggle("is-active", card.dataset.learningPathPlan === state.plan);
    });
    allChecks.forEach((check) => {
      check.checked = state.checks.includes(check.dataset.learningPathCheck);
    });
    const complete = state.checks.length;
    if (status) {
      status.innerHTML = `
        <div>
          <span>Saved path</span>
          <strong>${selectedPlan[0]}</strong>
          <p>${selectedPlan[1]}</p>
          <em>${complete}/5 onboarding steps complete</em>
        </div>
        <a class="btn primary" href="${selectedPlan[2]}">${selectedPlan[3]}</a>
      `;
    }
  };

  member.querySelectorAll("[data-learning-path-select]").forEach((button) => {
    button.addEventListener("click", () => {
      const state = read();
      state.plan = button.dataset.learningPathSelect || "starter";
      write(state);
      render();
    });
  });

  allChecks.forEach((check) => {
    check.addEventListener("change", () => {
      const state = read();
      const checks = new Set(state.checks);
      if (check.checked) {
        checks.add(check.dataset.learningPathCheck);
      } else {
        checks.delete(check.dataset.learningPathCheck);
      }
      state.checks = Array.from(checks);
      write(state);
      render();
    });
  });

  document.querySelectorAll("[data-learning-path-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.removeItem(key);
      render();
    });
  });

  if (!localStorage.getItem(key)) write({ plan: "starter", checks: [] });
  render();
});

document.querySelectorAll("[data-referrals]").forEach((referrals) => {
  const key = "nakamoto.academy.referrals";
  const form = referrals.querySelector("[data-referral-form]");
  const nameInput = referrals.querySelector("[data-referral-name]");
  const output = referrals.querySelector("[data-referral-output]");
  const meter = referrals.querySelector("[data-referral-meter]");
  const stats = referrals.querySelector("[data-referral-stats]");
  const checks = Array.from(referrals.querySelectorAll("[data-referral-check]"));
  const reset = referrals.querySelector("[data-referral-reset]");

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"name":"","code":"NAKAMOTO","checks":[]}');
    } catch {
      return { name: "", code: "NAKAMOTO", checks: [] };
    }
  };
  const write = (state) => localStorage.setItem(key, JSON.stringify(state));
  const makeCode = (value) => {
    const clean = (value || "NAKAMOTO Academy").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 18);
    return clean ? `TC-${clean}` : "TC-STUDENT";
  };
  const tierFor = (count) => count >= 15 ? "Cohort Builder" : count >= 5 ? "Practice Partner" : count >= 1 ? "Study Advocate" : "Pre-launch";

  const render = () => {
    const state = read();
    const complete = state.checks.length;
    checks.forEach((check) => {
      check.checked = state.checks.includes(check.dataset.referralCheck);
    });
    if (nameInput && !nameInput.value) nameInput.value = state.name || "";
    if (meter) meter.style.width = `${Math.min(100, complete * 20)}%`;
    if (stats) {
      const plannedInvites = complete * 3;
      stats.innerHTML = `
        <article><strong>${plannedInvites}</strong><span>planned invites</span></article>
        <article><strong>${tierFor(plannedInvites)}</strong><span>current status</span></article>
      `;
    }
    if (output) {
      output.innerHTML = `
        <span>Saved ambassador code</span>
        <strong>${state.code}</strong>
        <p>https://nakamatoresearch.com/trading-academy/academy-library/start-here.html?ref=${encodeURIComponent(state.code)}</p>
        <em>Share the roadmap, lesson library, visual lab, and risk disclosure first.</em>
      `;
    }
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = read();
    state.name = nameInput?.value || "NAKAMOTO Academy Student";
    state.code = makeCode(state.name);
    write(state);
    render();
  });

  checks.forEach((check) => {
    check.addEventListener("change", () => {
      const state = read();
      const selected = new Set(state.checks);
      if (check.checked) {
        selected.add(check.dataset.referralCheck);
      } else {
        selected.delete(check.dataset.referralCheck);
      }
      state.checks = Array.from(selected);
      write(state);
      render();
    });
  });

  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    if (nameInput) nameInput.value = "";
    render();
  });

  if (!localStorage.getItem(key)) write({ name: "", code: "TC-STUDENT", checks: [] });
  render();
});

document.querySelectorAll("[data-partner-portal]").forEach((portal) => {
  const key = "nakamoto.academy.partnerProfile";
  const form = portal.querySelector("[data-partner-form]");
  const status = portal.querySelector("[data-partner-status]");
  const checks = Array.from(portal.querySelectorAll("[data-partner-check]"));
  const reset = portal.querySelector("[data-partner-reset]");
  const fields = {
    name: portal.querySelector("[data-partner-name]"),
    type: portal.querySelector("[data-partner-type]"),
    audience: portal.querySelector("[data-partner-audience]"),
    channel: portal.querySelector("[data-partner-channel]"),
    fit: portal.querySelector("[data-partner-fit]")
  };

  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"name":"","type":"Creator Affiliate","audience":"","channel":"","fit":"","checks":[]}');
    } catch {
      return { name: "", type: "Creator Affiliate", audience: "", channel: "", fit: "", checks: [] };
    }
  };
  const write = (state) => localStorage.setItem(key, JSON.stringify(state));
  const stageFor = (complete, hasProfile) => {
    if (!hasProfile) return "Draft profile";
    if (complete >= 5) return "Ready for manual review";
    if (complete >= 3) return "Partner fit in progress";
    return "Needs compliance review";
  };

  const render = () => {
    const state = read();
    Object.entries(fields).forEach(([name, field]) => {
      if (field && !field.value) field.value = state[name] || "";
    });
    checks.forEach((check) => {
      check.checked = state.checks.includes(check.dataset.partnerCheck);
    });
    const complete = state.checks.length;
    const hasProfile = Boolean(state.name);
    if (status) {
      status.innerHTML = `
        <article><strong>${hasProfile ? state.name : "No profile saved"}</strong><span>${state.type || "Creator Affiliate"}</span></article>
        <article><strong>${stageFor(complete, hasProfile)}</strong><span>${complete}/5 partner steps complete</span></article>
        <article><strong>${state.audience || "0"}</strong><span>reported audience</span></article>
        <article><strong>${state.channel || "No channel yet"}</strong><span>primary channel</span></article>
      `;
    }
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = read();
    state.name = fields.name?.value || "";
    state.type = fields.type?.value || "Creator Affiliate";
    state.audience = fields.audience?.value || "0";
    state.channel = fields.channel?.value || "No channel yet";
    state.fit = fields.fit?.value || "";
    write(state);
    render();
  });

  checks.forEach((check) => {
    check.addEventListener("change", () => {
      const state = read();
      const selected = new Set(state.checks);
      if (check.checked) {
        selected.add(check.dataset.partnerCheck);
      } else {
        selected.delete(check.dataset.partnerCheck);
      }
      state.checks = Array.from(selected);
      write(state);
      render();
    });
  });

  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    Object.values(fields).forEach((field) => {
      if (field) field.value = "";
    });
    render();
  });

  if (!localStorage.getItem(key)) write({ name: "", type: "Creator Affiliate", audience: "", channel: "", fit: "", checks: [] });
  render();
});

document.querySelectorAll("[data-student-wins]").forEach((wins) => {
  const key = "nakamoto.academy.studentWins";
  const form = wins.querySelector("[data-win-form]");
  const feed = wins.querySelector("[data-wins-feed]");
  const reset = wins.querySelector("[data-wins-reset]");
  const starter = [
    { name: "Foundation learner", type: "Completed lessons", text: "Finished Level 0 before moving into chart structure." },
    { name: "Risk reset student", type: "Risk discipline", text: "Built a written position-sizing rule before practicing setups." }
  ];
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  };
  const write = (items) => localStorage.setItem(key, JSON.stringify(items));
  const render = () => {
    if (!feed) return;
    const items = [...read(), ...starter].slice(0, 8);
    feed.innerHTML = items.map((item) => `
      <article class="wins-card">
        <span>${item.type}</span>
        <h3>${item.name}</h3>
        <p>${item.text}</p>
      </article>
    `).join("");
  };
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = wins.querySelector("[data-win-name]")?.value || "NAKAMOTO Academy student";
    const type = wins.querySelector("[data-win-type]")?.value || "Process win";
    const text = wins.querySelector("[data-win-text]")?.value || "Saved a process improvement.";
    write([{ name, type, text }, ...read()].slice(0, 6));
    form.reset();
    render();
  });
  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    render();
  });
  render();
});

document.querySelectorAll("[data-sponsorship]").forEach((sponsor) => {
  const key = "nakamoto.academy.sponsorProfile";
  const form = sponsor.querySelector("[data-sponsor-form]");
  const status = sponsor.querySelector("[data-sponsor-status]");
  const reset = sponsor.querySelector("[data-sponsor-reset]");
  const checks = Array.from(sponsor.querySelectorAll("[data-sponsor-check]"));
  const fields = {
    name: sponsor.querySelector("[data-sponsor-name]"),
    type: sponsor.querySelector("[data-sponsor-type]"),
    fit: sponsor.querySelector("[data-sponsor-fit]")
  };
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"name":"","type":"Tool Sponsor","fit":"","checks":[]}');
    } catch {
      return { name: "", type: "Tool Sponsor", fit: "", checks: [] };
    }
  };
  const write = (state) => localStorage.setItem(key, JSON.stringify(state));
  const verdict = (complete, hasProfile) => {
    if (!hasProfile) return "Draft sponsor";
    if (complete >= 5) return "Ready for trust review";
    if (complete >= 3) return "Needs disclosure detail";
    return "Not sponsor-ready";
  };
  const render = () => {
    const state = read();
    Object.entries(fields).forEach(([name, field]) => {
      if (field && !field.value) field.value = state[name] || "";
    });
    checks.forEach((check) => {
      check.checked = state.checks.includes(check.dataset.sponsorCheck);
    });
    if (status) {
      const complete = state.checks.length;
      status.innerHTML = `
        <article><strong>${state.name || "No sponsor saved"}</strong><span>${state.type || "Tool Sponsor"}</span></article>
        <article><strong>${verdict(complete, Boolean(state.name))}</strong><span>${complete}/5 trust checks complete</span></article>
        <article><strong>${state.fit ? "Fit noted" : "No fit note"}</strong><span>education alignment</span></article>
        <article><strong>${complete >= 5 ? "High" : complete >= 3 ? "Medium" : "Low"}</strong><span>readiness score</span></article>
      `;
    }
  };
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = read();
    state.name = fields.name?.value || "";
    state.type = fields.type?.value || "Tool Sponsor";
    state.fit = fields.fit?.value || "";
    write(state);
    render();
  });
  checks.forEach((check) => {
    check.addEventListener("change", () => {
      const state = read();
      const selected = new Set(state.checks);
      if (check.checked) {
        selected.add(check.dataset.sponsorCheck);
      } else {
        selected.delete(check.dataset.sponsorCheck);
      }
      state.checks = Array.from(selected);
      write(state);
      render();
    });
  });
  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    Object.values(fields).forEach((field) => {
      if (field) field.value = "";
    });
    render();
  });
  if (!localStorage.getItem(key)) write({ name: "", type: "Tool Sponsor", fit: "", checks: [] });
  render();
});

document.querySelectorAll("[data-onboarding]").forEach((hub) => {
  const key = "nakamoto.academy.onboarding";
  const form = hub.querySelector("[data-onboarding-form]");
  const status = hub.querySelector("[data-onboarding-status]");
  const reset = hub.querySelector("[data-onboarding-reset]");
  const checks = Array.from(hub.querySelectorAll("[data-onboarding-check]"));
  const fields = {
    goal: hub.querySelector("[data-onboarding-goal]"),
    time: hub.querySelector("[data-onboarding-time]"),
    weak: hub.querySelector("[data-onboarding-weak]")
  };
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"goal":"Foundations","time":"30 min","weak":"","checks":[]}');
    } catch {
      return { goal: "Foundations", time: "30 min", weak: "", checks: [] };
    }
  };
  const write = (state) => localStorage.setItem(key, JSON.stringify(state));
  const nextFor = (goal) => {
    const normalized = String(goal || "").toLowerCase();
    if (normalized.includes("chart")) return ["lesson-market-structure.html", "Start Market Structure"];
    if (normalized.includes("risk")) return ["risk-calculator.html", "Open Risk Reset"];
    if (normalized.includes("professional")) return ["strategy-lab.html", "Open Strategy Lab"];
    return ["lesson-library.html", "Open Foundation Lessons"];
  };
  const render = () => {
    const state = read();
    Object.entries(fields).forEach(([name, field]) => {
      if (field && !field.value) field.value = state[name] || "";
    });
    checks.forEach((check) => {
      check.checked = state.checks.includes(check.dataset.onboardingCheck);
    });
    const complete = state.checks.length;
    const [url, label] = nextFor(state.goal);
    if (status) {
      status.innerHTML = `
        <div>
          <span>Saved path</span>
          <strong>${state.goal || "Foundations"}</strong>
          <p>${state.time || "30 min"} study block. Weak area: ${state.weak || "not set yet"}.</p>
        </div>
        <div>
          <span>Launch progress</span>
          <strong>${complete}/5</strong>
          <p>${complete >= 5 ? "Ready for weekly rhythm." : "Complete the next small onboarding action."}</p>
        </div>
        <a class="btn primary" href="${url}">${label}</a>
      `;
    }
  };
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = read();
    state.goal = fields.goal?.value || "Foundations";
    state.time = fields.time?.value || "30 min";
    state.weak = fields.weak?.value || "";
    write(state);
    render();
  });
  checks.forEach((check) => {
    check.addEventListener("change", () => {
      const state = read();
      const selected = new Set(state.checks);
      if (check.checked) {
        selected.add(check.dataset.onboardingCheck);
      } else {
        selected.delete(check.dataset.onboardingCheck);
      }
      state.checks = Array.from(selected);
      write(state);
      render();
    });
  });
  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    Object.values(fields).forEach((field) => {
      if (field) field.value = "";
    });
    render();
  });
  if (!localStorage.getItem(key)) write({ goal: "Foundations", time: "30 min", weak: "", checks: [] });
  render();
});

document.querySelectorAll("[data-retention-dashboard]").forEach((dashboard) => {
  const stats = dashboard.querySelector("[data-retention-stats]");
  const next = dashboard.querySelector("[data-retention-next]");
  const readJson = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  };
  const completedLessons = readJson("nakamoto.academy.completedLessons", []);
  const weeklyChallenges = readJson("nakamoto.academy.weeklyChallenges", []);
  const communityPosts = readJson("nakamoto.academy.communityPosts", []);
  const officeQuestions = readJson("nakamoto.academy.officeQuestions", []);
  const onboarding = readJson("nakamoto.academy.onboarding", { checks: [] });
  const learningPath = readJson("nakamoto.academy.learning-path", { plan: "Not selected", checks: [] });
  const statItems = [
    ["Lessons", completedLessons.length, "completed course lessons"],
    ["Challenges", weeklyChallenges.length, "weekly challenge actions"],
    ["Community", communityPosts.length, "saved community reflections"],
    ["Questions", officeQuestions.length, "office-hours questions"],
    ["Onboarding", onboarding.checks?.length || 0, "first-week steps complete"],
    ["Learning Path", learningPath.plan || "Not selected", "saved access path"]
  ];
  if (stats) {
    stats.innerHTML = statItems.map(([label, value, text]) => `
      <article class="retention-card">
        <span>${label}</span>
        <h3>${value}</h3>
        <p>${text}</p>
      </article>
    `).join("");
  }
  let recommendation = ["Restart onboarding", "No onboarding path is complete yet. Save the first-week route before adding more complexity.", "onboarding-hub.html", "Open Onboarding"];
  if ((onboarding.checks?.length || 0) >= 3 && completedLessons.length < 2) {
    recommendation = ["Continue lessons", "You have onboarding momentum. Finish the foundation lessons so practice has language behind it.", "lesson-library.html", "Open Lessons"];
  } else if (completedLessons.length >= 2 && weeklyChallenges.length < 1) {
    recommendation = ["Start a challenge", "You have study activity. Add one weekly challenge so the knowledge becomes visible practice.", "weekly-challenges.html", "Open Challenges"];
  } else if (weeklyChallenges.length >= 1 && communityPosts.length < 1) {
    recommendation = ["Post a reflection", "Turn practice into memory by writing one reflection, confusion point, or review note.", "community-hub.html", "Open Community"];
  } else if (completedLessons.length >= 4 && weeklyChallenges.length >= 2) {
    recommendation = ["Open certification path", "The learning loop is active. Turn the progress into a visible milestone path.", "certification-path.html", "Open Certificates"];
  }
  if (next) {
    next.innerHTML = `
      <span>Recommended next action</span>
      <h3>${recommendation[0]}</h3>
      <p>${recommendation[1]}</p>
      <a class="btn primary" href="${recommendation[2]}">${recommendation[3]}</a>
    `;
  }
});

document.querySelectorAll("[data-churn-rescue]").forEach((rescue) => {
  const key = "nakamoto.academy.churnRescue";
  const buttons = Array.from(rescue.querySelectorAll("[data-churn-issue]"));
  const checks = Array.from(rescue.querySelectorAll("[data-churn-check]"));
  const output = rescue.querySelector("[data-churn-output]");
  const reset = rescue.querySelector("[data-churn-reset]");
  const resources = {
    overwhelmed: ["Shrink the scope", "Restart with one goal, one lesson, one drill, and one review note. Ignore advanced topics for seven days.", "onboarding-hub.html", "Restart Onboarding"],
    "not-practicing": ["Use a 15-minute practice loop", "Pick one concept, mark one chart, write one sentence, and stop before the session becomes vague.", "practice-planner.html", "Build Practice Plan"],
    "breaking-rules": ["Return to risk and review", "Use position sizing, drawdown limits, and a written pre-trade checklist before studying another setup.", "risk-calculator.html", "Open Risk Tool"],
    "lost-path": ["Take the assessment again", "Let the current weakness choose the next lesson instead of guessing from the whole platform.", "skill-assessment.html", "Take Assessment"],
    "no-progress": ["Review the process sample", "Progress is usually hidden in review quality. Score rules, emotions, expectancy, and mistakes before changing topics.", "performance-review.html", "Open Review Lab"]
  };
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"issue":"overwhelmed","checks":[]}');
    } catch {
      return { issue: "overwhelmed", checks: [] };
    }
  };
  const write = (state) => localStorage.setItem(key, JSON.stringify(state));
  const render = () => {
    const state = read();
    const plan = resources[state.issue] || resources.overwhelmed;
    buttons.forEach((button) => button.classList.toggle("is-active", button.dataset.churnIssue === state.issue));
    checks.forEach((check) => {
      check.checked = state.checks.includes(check.dataset.churnCheck);
    });
    if (output) {
      output.innerHTML = `
        <span>Current repair path</span>
        <h3>${plan[0]}</h3>
        <p>${plan[1]}</p>
        <p><strong>${state.checks.length}/5</strong> rescue steps complete.</p>
        <a class="btn primary" href="${plan[2]}">${plan[3]}</a>
      `;
    }
  };
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const state = read();
      state.issue = button.dataset.churnIssue || "overwhelmed";
      write(state);
      render();
    });
  });
  checks.forEach((check) => {
    check.addEventListener("change", () => {
      const state = read();
      const selected = new Set(state.checks);
      if (check.checked) {
        selected.add(check.dataset.churnCheck);
      } else {
        selected.delete(check.dataset.churnCheck);
      }
      state.checks = Array.from(selected);
      write(state);
      render();
    });
  });
  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    render();
  });
  if (!localStorage.getItem(key)) write({ issue: "overwhelmed", checks: [] });
  render();
});

document.querySelectorAll("[data-risk]").forEach((risk) => {
  const key = "nakamoto.academy.risk";
  const form = risk.querySelector("[data-risk-form]");
  const status = risk.querySelector("[data-risk-status]");
  const reset = risk.querySelector("[data-risk-reset]");
  const fields = {
    plan: risk.querySelector("[data-risk-plan]"),
    cycle: risk.querySelector("[data-risk-cycle]"),
    discount: risk.querySelector("[data-risk-discount]"),
    provider: risk.querySelector("[data-risk-provider]"),
    link: risk.querySelector("[data-risk-link]"),
    email: risk.querySelector("[data-risk-email]"),
    consent: risk.querySelector("[data-risk-consent]")
  };
  const prices = {
    starter: 0,
    practice: 9,
    cohort: 49
  };
  const labels = {
    starter: "Free Starter",
    practice: "Core Study",
    cohort: "Guided Cohort"
  };
  const providers = {
    sumup: "SumUp Business",
    stripe: "Stripe Resource",
    paypal: "PayPal Study Plans",
    gocardless: "GoCardless"
  };
  const discounts = {
    EARLY25: 0.25,
    STUDENT15: 0.15,
    COHORT10: 0.10
  };
  const read = () => {
    try {
      return JSON.parse(localStorage.getItem(key) || '{"plan":"practice","cycle":"monthly","discount":"","provider":"sumup","link":"","email":"","consent":false}');
    } catch {
      return { plan: "practice", cycle: "monthly", discount: "", provider: "sumup", link: "", email: "", consent: false };
    }
  };
  const write = (state) => localStorage.setItem(key, JSON.stringify(state));
  const estimate = (state) => {
    const base = prices[state.plan] ?? prices.practice;
    const annualBase = state.cycle === "annual" ? base * 10 : base;
    const code = String(state.discount || "").trim().toUpperCase();
    const discount = discounts[code] || 0;
    const total = Math.max(0, annualBase * (1 - discount));
    return { base, code, discount, total };
  };
  const render = () => {
    const state = read();
    Object.entries(fields).forEach(([name, field]) => {
      if (!field) return;
      if (name === "consent") {
        field.checked = Boolean(state.consent);
      } else if (!field.value) {
        field.value = state[name] || "";
      }
    });
    const price = estimate(state);
    if (status) {
      status.innerHTML = `
        <article><strong>${labels[state.plan] || "Core Study"}</strong><span>selected plan</span></article>
        <article><strong>${state.cycle === "annual" ? "Annual" : "Monthly"}</strong><span>recurring cycle</span></article>
        <article><strong>${price.code || "No code"}</strong><span>${price.discount ? `${Math.round(price.discount * 100)}% discount applied` : "discount status"}</span></article>
        <article><strong>${price.total === 0 ? "Free" : `$${price.total.toFixed(2)}`}</strong><span>${state.cycle === "annual" ? "estimated annual renewal" : "estimated monthly renewal"}</span></article>
        <article><strong>${providers[state.provider] || "SumUp Business"}</strong><span>resource provider</span></article>
        <article><strong>${state.link ? "Resource link saved" : "No hosted link yet"}</strong><span>${state.link ? "ready to connect button" : "paste SumUp link when ready"}</span></article>
        <article><strong>${state.email || "No email saved"}</strong><span>student account email</span></article>
        <article><strong>${state.consent ? "Ready for processor resource" : "Consent required"}</strong><span>setup status</span></article>
      `;
    }
  };
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const state = {
      plan: fields.plan?.value || "practice",
      cycle: fields.cycle?.value || "monthly",
      discount: fields.discount?.value || "",
      provider: fields.provider?.value || "sumup",
      link: fields.link?.value || "",
      email: fields.email?.value || "",
      consent: Boolean(fields.consent?.checked)
    };
    write(state);
    render();
  });
  [fields.plan, fields.cycle, fields.discount, fields.provider, fields.link].forEach((field) => {
    field?.addEventListener("input", () => {
      const state = read();
      state.plan = fields.plan?.value || "practice";
      state.cycle = fields.cycle?.value || "monthly";
      state.discount = fields.discount?.value || "";
      state.provider = fields.provider?.value || "sumup";
      state.link = fields.link?.value || "";
      write(state);
      render();
    });
    field?.addEventListener("change", () => {
      const state = read();
      state.plan = fields.plan?.value || "practice";
      state.cycle = fields.cycle?.value || "monthly";
      state.discount = fields.discount?.value || "";
      state.provider = fields.provider?.value || "sumup";
      state.link = fields.link?.value || "";
      write(state);
      render();
    });
  });
  reset?.addEventListener("click", () => {
    localStorage.removeItem(key);
    Object.values(fields).forEach((field) => {
      if (!field) return;
      if (field.type === "checkbox") field.checked = false;
      else field.value = "";
    });
    render();
  });
  if (!localStorage.getItem(key)) write({ plan: "practice", cycle: "monthly", discount: "", provider: "sumup", link: "", email: "", consent: false });
  render();
});

document.querySelectorAll("[data-mode-control]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest("[data-mode-group]");
    const output = document.querySelector(group?.dataset.modeTarget || "");
    if (!group || !output) return;
    group.querySelectorAll("[data-mode-control]").forEach((item) => item.classList.toggle("active", item === button));
    output.textContent = button.dataset.modeText || "";
  });
});

document.querySelectorAll("[data-path-selector]").forEach((selector) => {
  const level = selector.querySelector("[data-path-level]");
  const goal = selector.querySelector("[data-path-goal]");
  const time = selector.querySelector("[data-path-time]");
  const result = selector.querySelector("[data-path-result]");

  const recommendations = {
    beginner: {
      title: "Start with foundations",
      summary: "Begin with market terms, order types, risk, and the 10-level curriculum map before advanced chart concepts.",
      study: ["lesson-library.html", "Open Foundation Lessons"],
      practice: ["onboarding-hub.html", "Save Onboarding Path"],
      review: ["retention-dashboard.html", "Check Progress"],
      research: ["source-standards.html", "Source Standards"]
    },
    technical: {
      title: "Build chart-reading skill",
      summary: "Study market structure, then practice HH, HL, BOS, CHoCH, zones, invalidation, and reaction quality.",
      study: ["lesson-market-structure.html", "Study Market Structure"],
      practice: ["chart-drills.html", "Open Chart Drills"],
      review: ["case-study-failed-breakout.html", "Review Case Study"],
      research: ["resources.html", "Visual Lab"]
    },
    advanced: {
      title: "Connect context and execution",
      summary: "Use auction theory, order flow, strategy validation, and research together: concept, condition, evidence, review.",
      study: ["auction-theory-course.html", "Open Auction Course"],
      practice: ["strategy-lab.html", "Open Strategy Lab"],
      review: ["performance-review.html", "Review Sample"],
      research: ["research-institute.html", "Research Institute"]
    },
    risk: {
      title: "Stabilize risk and behavior",
      summary: "Use position sizing, mistake review, journaling, and behavior frameworks before adding more setups.",
      study: ["risk-disclosure.html", "Read Risk Disclosure"],
      practice: ["risk-calculator.html", "Open Risk Calculator"],
      review: ["mistake-library.html", "Open Mistake Library"],
      research: ["human-behavior.html", "Study Behavior"]
    }
  };

  const update = () => {
    if (!level || !goal || !time || !result) return;
    const base = recommendations[level.value] || recommendations.beginner;
    const goalNote = {
      structure: "Focus keyword: structure.",
      flow: "Focus keyword: liquidity and participation.",
      system: "Focus keyword: rules and validation.",
      mind: "Focus keyword: behavior and review."
    }[goal.value];
    const timeNote = {
      short: "Study block: one drill or one glossary cluster.",
      medium: "Study block: one lesson plus one practice task.",
      deep: "Study block: lesson, drill, journal review, and checklist."
    }[time.value];
    result.innerHTML = `
      <h3>${base.title}</h3>
      <p>${base.summary}</p>
      <p>${goalNote} ${timeNote}</p>
      <div class="link-stack">
        <a href="${base.study[0]}">Study: ${base.study[1]}</a>
        <a href="${base.practice[0]}">Practice: ${base.practice[1]}</a>
        <a href="${base.review[0]}">Review: ${base.review[1]}</a>
        <a href="${base.research[0]}">Research: ${base.research[1]}</a>
      </div>
      <a class="btn primary" href="${base.practice[0]}">Start This Path</a>
    `;
  };

  [level, goal, time].forEach((input) => input?.addEventListener("change", update));
  update();
});

const progressKey = "nakamoto.academy.completedLessons";
const readCompletedLessons = () => {
  try {
    return JSON.parse(localStorage.getItem(progressKey) || "[]");
  } catch {
    return [];
  }
};
const writeCompletedLessons = (items) => localStorage.setItem(progressKey, JSON.stringify([...new Set(items)]));
const lessonTitles = {
  "financial-markets": "Financial Markets",
  "trading-basics": "Trading Basics",
  "market-structure": "Market Structure",
  trends: "Trends",
  "support-resistance": "Support and Resistance",
  "price-action": "Price Action"
};

function updateProgressUI() {
  const completed = readCompletedLessons();
  const total = Object.keys(lessonTitles).length;
  document.querySelectorAll("[data-complete-lesson]").forEach((button) => {
    const id = button.dataset.completeLesson;
    const done = completed.includes(id);
    button.classList.toggle("is-complete", done);
    button.textContent = done ? "Completed" : "Mark Complete";
    button.setAttribute("aria-pressed", String(done));
  });
  document.querySelectorAll("[data-progress-card]").forEach((card) => {
    const id = card.dataset.progressCard;
    const done = completed.includes(id);
    card.classList.toggle("is-complete", done);
    const status = card.querySelector("[data-progress-status]");
    if (status) status.textContent = done ? "Complete" : "Not started";
  });
  document.querySelectorAll("[data-progress-summary]").forEach((summary) => {
    summary.innerHTML = `
      <strong>${completed.length}/${total}</strong>
      <span>lessons complete</span>
      <p>${completed.length ? `Last saved: ${lessonTitles[completed[completed.length - 1]] || "NAKAMOTO Academy lesson"}.` : "Start with Financial Markets, then move through Trading Basics and Level 1."}</p>
    `;
  });
  document.querySelectorAll("[data-progress-meter]").forEach((meter) => {
    meter.style.setProperty("--progress", `${Math.round((completed.length / total) * 100)}%`);
  });
}

document.querySelectorAll("[data-complete-lesson]").forEach((button) => {
  button.addEventListener("click", () => {
    const id = button.dataset.completeLesson;
    const completed = readCompletedLessons();
    const next = completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id];
    writeCompletedLessons(next);
    updateProgressUI();
  });
});

document.querySelectorAll("[data-reset-progress]").forEach((button) => {
  button.addEventListener("click", () => {
    writeCompletedLessons([]);
    updateProgressUI();
  });
});

document.querySelectorAll("[data-quiz]").forEach((quiz) => {
  const output = quiz.querySelector("[data-quiz-result]");
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();
    const questions = Array.from(quiz.querySelectorAll("[data-quiz-question]"));
    let score = 0;
    questions.forEach((question) => {
      const checked = question.querySelector("input[type='radio']:checked");
      const correct = checked?.value === "true";
      question.classList.toggle("is-correct", correct);
      question.classList.toggle("is-missing", !checked);
      question.classList.toggle("is-wrong", Boolean(checked) && !correct);
      if (correct) score += 1;
    });
    if (output) {
      output.innerHTML = `<strong>${score}/${questions.length}</strong><span>${score === questions.length ? "Mastery check passed." : "Review the highlighted answers, then try again."}</span>`;
    }
  });
});

updateProgressUI();

document.querySelectorAll("[data-chart-simulator]").forEach((simulator) => {
  const chart = simulator.querySelector("[data-sim-chart]");
  const toolButtons = simulator.querySelectorAll("[data-sim-tool]");
  const scenarioButtons = simulator.querySelectorAll("[data-sim-scenario]");
  const reset = simulator.querySelector("[data-sim-reset]");
  const save = simulator.querySelector("[data-sim-save]");
  const score = simulator.querySelector("[data-sim-score]");
  const output = simulator.querySelector("[data-sim-output]");
  const scenarioTitle = simulator.querySelector("[data-sim-title]");
  const scenarioText = simulator.querySelector("[data-sim-text]");
  const storageKey = "nakamoto.academy.chartSimulator";
  let activeTool = simulator.querySelector("[data-sim-tool].active")?.dataset.simTool || "structure";
  const scenarios = {
    trend: ["Trend continuation", "Mark the higher low, the break of structure, a clean entry area, stop, and target."],
    range: ["Range rotation", "Mark support, resistance, liquidity above the range, liquidity below the range, and the no-trade middle."],
    sweep: ["Liquidity sweep", "Mark the swept high or low, rejection area, invalidation, entry idea, and risk target."]
  };

  const labels = {
    structure: "BOS",
    level: "S/R",
    liquidity: "LQ",
    entry: "Entry",
    stop: "Stop",
    target: "Target"
  };

  function setTool(tool) {
    activeTool = tool;
    toolButtons.forEach((button) => button.classList.toggle("active", button.dataset.simTool === tool));
  }

  function markerData() {
    return Array.from(chart?.querySelectorAll(".sim-marker") || []).map((marker) => ({
      tool: marker.dataset.tool,
      x: marker.style.left,
      y: marker.style.top
    }));
  }

  function renderMarkers(markers = []) {
    chart?.querySelectorAll(".sim-marker").forEach((marker) => marker.remove());
    markers.forEach((item) => {
      const marker = document.createElement("button");
      marker.type = "button";
      marker.className = `sim-marker ${item.tool}`;
      marker.dataset.tool = item.tool;
      marker.style.left = item.x;
      marker.style.top = item.y;
      marker.textContent = labels[item.tool] || "Mark";
      marker.setAttribute("aria-label", `${labels[item.tool] || item.tool} marker`);
      marker.addEventListener("click", (event) => {
        event.stopPropagation();
        marker.remove();
        updateSimulatorScore();
      });
      chart?.appendChild(marker);
    });
    updateSimulatorScore();
  }

  function updateSimulatorScore() {
    const tools = new Set(markerData().map((item) => item.tool));
    const required = ["structure", "level", "liquidity", "entry", "stop", "target"];
    const complete = required.filter((tool) => tools.has(tool)).length;
    if (score) score.textContent = `${complete}/${required.length}`;
    if (output) {
      output.textContent = complete === required.length
        ? "Complete map: you marked context, risk, execution, and target."
        : "Add the missing context, liquidity, entry, stop, and target marks.";
    }
  }

  toolButtons.forEach((button) => button.addEventListener("click", () => setTool(button.dataset.simTool)));
  scenarioButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const scenario = scenarios[button.dataset.simScenario] || scenarios.trend;
      scenarioButtons.forEach((item) => item.classList.toggle("active", item === button));
      if (scenarioTitle) scenarioTitle.textContent = scenario[0];
      if (scenarioText) scenarioText.textContent = scenario[1];
    });
  });

  chart?.addEventListener("click", (event) => {
    const rect = chart.getBoundingClientRect();
    const x = `${((event.clientX - rect.left) / rect.width) * 100}%`;
    const y = `${((event.clientY - rect.top) / rect.height) * 100}%`;
    renderMarkers([...markerData(), { tool: activeTool, x, y }]);
  });

  reset?.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    renderMarkers([]);
  });
  save?.addEventListener("click", () => {
    localStorage.setItem(storageKey, JSON.stringify(markerData()));
    if (output) output.textContent = "Saved in this browser. Open the simulator later and your marks will return.";
  });

  try {
    renderMarkers(JSON.parse(localStorage.getItem(storageKey) || "[]"));
  } catch {
    renderMarkers([]);
  }
  setTool(activeTool);
});

document.querySelectorAll("[data-cert-card]").forEach((card) => {
  const required = (card.dataset.certRequired || "").split(" ").filter(Boolean);
  const completed = readCompletedLessons();
  const done = required.filter((item) => completed.includes(item)).length;
  const percent = required.length ? Math.round((done / required.length) * 100) : 0;
  card.style.setProperty("--cert-progress", `${percent}%`);
  const status = card.querySelector("[data-cert-status]");
  if (status) status.textContent = `${done}/${required.length} complete`;
  card.classList.toggle("is-complete", required.length > 0 && done === required.length);
});

const docklessPages = new Set(["chart-simulator.html", "auction-theory-course.html", "certification-path.html", "downloads.html", "student-dashboard.html", "lesson-library.html"]);
if (currentPage !== "index.html" && !docklessPages.has(currentPage) && !document.querySelector(".lesson-dock")) {
  const dock = document.createElement("aside");
  dock.className = "lesson-dock";
  dock.innerHTML = `
    <strong>Keep learning</strong>
    <p>Use the curriculum map, visual lab, and pillar lesson together: concept, picture, practice, review.</p>
    <div class="lesson-dock-actions">
      <a href="courses.html">Map</a>
      <a href="lesson-market-structure.html">Lesson</a>
      <button type="button" data-dock-close>Hide</button>
    </div>
  `;
  document.body.appendChild(dock);
  dock.querySelector("[data-dock-close]").addEventListener("click", () => dock.remove());
}

const nextSteps = {
  "index.html": ["Take the skill assessment", "Score your current foundation, structure, risk, execution, and review skills before choosing a path.", "skill-assessment.html", "Take Assessment"],
  "library.html": ["Practice with a case study", "Move from browsing to applied chart reading with a guided case study.", "case-study-failed-breakout.html", "Open Case Study"],
  "lesson-library.html": ["Open your dashboard", "Track completed lessons and continue the course without losing your place.", "student-dashboard.html", "Open Dashboard"],
  "student-dashboard.html": ["Start the first lesson", "Begin with the foundation layer before moving into chart structure.", "lesson-financial-markets.html", "Start Lesson"],
  "lesson-financial-markets.html": ["Learn trading mechanics", "Now study bid, ask, spread, order types, volatility, and execution basics.", "lesson-trading-basics.html", "Next Lesson"],
  "lesson-trading-basics.html": ["Study market structure", "Move from market mechanics into the visual language of price movement.", "lesson-market-structure.html", "Next Lesson"],
  "lesson-market-structure.html": ["Study trends", "Use structure to understand directional progress, pullbacks, and failed continuation.", "lesson-trends.html", "Next Lesson"],
  "lesson-trends.html": ["Study levels", "Connect trend context to support, resistance, zones, retests, and rejection.", "lesson-support-resistance.html", "Next Lesson"],
  "lesson-support-resistance.html": ["Study price action", "Now learn how candles and reactions behave around meaningful areas.", "lesson-price-action.html", "Next Lesson"],
  "lesson-price-action.html": ["Practice with explainers", "Use animated explainers and chart drills to move from reading to active recall.", "animated-explainers.html", "Open Explainers"],
  "animated-explainers.html": ["Download the study pack", "Take the roadmap, worksheets, strategy checklist, and brand kit offline.", "downloads.html", "Open Downloads"],
  "downloads.html": ["Return to your dashboard", "Use the PDFs with the course tracker, drills, and review loop.", "student-dashboard.html", "Open Dashboard"],
  "chart-simulator.html": ["Study auction theory", "Move from marking chart structure to understanding balance, imbalance, acceptance, and rejection.", "auction-theory-course.html", "Open Auction Course"],
  "auction-theory-course.html": ["Choose a certificate path", "Turn the course into a visible learning milestone with NAKAMOTO Academy certificates.", "certification-path.html", "Open Certificates"],
  "certification-path.html": ["Practice on the simulator", "Use the chart simulator to make certificate work practical, visual, and reviewable.", "chart-simulator.html", "Open Simulator"],
  "about.html": ["Read the editorial policy", "See how NAKAMOTO Academy content is planned, reviewed, updated, and governed.", "editorial-policy.html", "Open Policy"],
  "editorial-policy.html": ["Review methodology", "See how research claims, evidence, caveats, and source quality are handled.", "research-methodology.html", "Open Methodology"],
  "research-methodology.html": ["Review source standards", "See which sources are treated as strong, useful, weak, or unsupported.", "source-standards.html", "Open Sources"],
  "source-standards.html": ["Read risk disclosure", "Review the education-only boundaries and trading risk caveats.", "risk-disclosure.html", "Open Disclosure"],
  "risk-disclosure.html": ["Use the risk tool", "Turn risk awareness into position sizing and drawdown discipline.", "risk-calculator.html", "Open Risk Tool"],
  "glossary.html": ["Apply the terms", "Use the chart drills to turn vocabulary into chart-reading skill.", "chart-drills.html", "Open Drills"],
  "risk-calculator.html": ["Open the full tools lab", "Move from basic position sizing into expectancy, drawdown recovery, stress testing, and asset sizing.", "trading-tools.html", "Open Tools Lab"],
  "trading-tools.html": ["Train the decision", "Use the numbers, then practice whether the setup deserves action, patience, or smaller risk.", "scenario-trainer.html", "Open Trainer"],
  "scenario-trainer.html": ["Build the practice week", "Turn scenario feedback into a seven-day plan so weak areas get trained deliberately.", "practice-planner.html", "Build Plan"],
  "practice-planner.html": ["Review your sample", "After completing a week, calculate process score, expectancy, and weak area from a trade batch.", "performance-review.html", "Review Sample"],
  "skill-assessment.html": ["Build your plan", "Use the assessment result to generate a seven-day practice plan for your weak area.", "practice-planner.html", "Build Plan"],
  "chart-drills.html": ["Review mistakes", "Use the mistake library to understand what each drill is protecting you from.", "mistake-library.html", "Open Mistakes"],
  "mistake-library.html": ["Journal the pattern", "Turn the mistake into a tag you can review each week.", "trading-journal.html", "Open Journal"],
  "trading-journal.html": ["Review the sample", "Turn journal notes into expectancy, rule-break rate, process score, and next repair action.", "performance-review.html", "Open Review Lab"],
  "performance-review.html": ["Choose the learning path path", "Turn review into a clear access path for practice tools, cohort rhythm, and guided onboarding.", "start-here.html", "Choose Path"],
  "resources.html": ["Choose the learning path path", "Move from the resource library into a safer study path with onboarding steps and next actions.", "start-here.html", "Choose Path"],
  "start-here.html": ["Set up recurring access", "Turn the selected education path into a monthly or annual study plan setup before onboarding.", "risk.html", "Open Risk"],
  "risk.html": ["Start onboarding", "After recurring setup, move directly into the first-week path so access leads to learning.", "onboarding-hub.html", "Start Onboarding"],
  "onboarding-hub.html": ["Open retention dashboard", "After first-week setup, check learning health and choose the next useful action.", "retention-dashboard.html", "Open Dashboard"],
  "retention-dashboard.html": ["Use churn rescue if stuck", "If progress slows, shrink the next action before adding more topics.", "churn-rescue.html", "Open Rescue"],
  "churn-rescue.html": ["Restart onboarding", "Turn the rescue action back into a simple first-week route.", "onboarding-hub.html", "Restart Onboarding"],
  "daily-updates.html": ["Read the education news desk", "Use the daily prompt with market context and then read the news brief for vocabulary, risk, and study direction.", "news.html", "Open News"],
  "blog.html": ["Open daily updates", "Turn long-form reading into a daily study action with a short concept, drill, and review prompt.", "daily-updates.html", "Open Daily Desk"],
  "news.html": ["Read the blog", "Move from daily news context into deeper articles that explain the concept behind the headline.", "blog.html", "Open Blog"],
  "referrals.html": ["Open the creator media kit", "Move from personal referrals into polished creator assets, approved language, and partner-ready positioning.", "media-kit.html", "Open Media Kit"],
  "media-kit.html": ["Apply as a partner", "Turn creator interest into a structured partner profile with audience fit, compliance review, and offer path.", "partner-portal.html", "Open Partner Portal"],
  "partner-portal.html": ["Build partner trust", "Review the trust wall before any affiliate, creator, sponsor, or platform partnership goes live.", "trust-wall.html", "Open Trust Wall"],
  "student-wins.html": ["Open the trust wall", "Place student proof beside editorial rules, risk boundaries, source standards, and partner policies.", "trust-wall.html", "Open Trust Wall"],
  "trust-wall.html": ["Review sponsorship rules", "See how external brands can support education without controlling lessons, claims, or conclusions.", "sponsorship.html", "Open Sponsorship"],
  "sponsorship.html": ["Prepare partner profile", "Use the partner portal to keep sponsorship, affiliate, and creator relationships reviewed before launch.", "partner-portal.html", "Open Partner Portal"],
  "community-hub.html": ["Complete the weekly challenge", "Move from community reflection into a process-based weekly challenge board.", "weekly-challenges.html", "Open Challenges"],
  "weekly-challenges.html": ["Check the progress wall", "See how weekly practice, lessons, resources, questions, and cohort participation add up.", "progress-wall.html", "Open Progress Wall"],
  "progress-wall.html": ["Choose a cohort", "Focus the next study cycle with a cohort built around your weakest skill.", "cohorts.html", "View Cohorts"],
  "cohorts.html": ["Ask office hours", "Turn cohort work into a focused education-only question for the next session.", "office-hours.html", "Open Office Hours"],
  "office-hours.html": ["Validate the strategy", "Use the checklist to connect community questions and review evidence to a repeatable playbook.", "strategy-checklist.html", "Open Checklist"],
  "strategy-checklist.html": ["Study playbooks", "Compare your checklist with the Strategy Lab playbooks.", "strategy-lab.html", "Open Strategy Lab"],
  "design-system.html": ["Open the visual components", "Use the chart component library to turn the design system into reusable teaching graphics.", "chart-components.html", "Open Components"],
  "chart-components.html": ["Add motion rules", "Pair each visual component with a motion pattern that clarifies sequence and feedback.", "motion-library.html", "Open Motion"],
  "motion-library.html": ["Package the brand system", "Use the brand kit to keep motion, print, diagrams, and lesson assets visually consistent.", "brand-kit.html", "Open Brand Kit"],
  "brand-kit.html": ["Build with the system", "Return to the design system to apply the brand kit across pages, lessons, visuals, and tools.", "design-system.html", "Open Design System"],
  "case-study-failed-breakout.html": ["Practice similar charts", "Use the drill library to find failed breaks, traps, and invalidation levels.", "chart-drills.html", "Open Drills"],
  "case-study-trend-day.html": ["Check your risk", "Use the risk calculator before practicing continuation setups.", "risk-calculator.html", "Open Risk Tool"],
  "case-study-range-day.html": ["Review structure", "Use the pillar lesson to separate range behavior from trend continuation.", "lesson-market-structure.html", "Read Lesson"],
  "case-study-liquidity-sweep.html": ["Study behavior", "Connect liquidity sweeps to crowd behavior and trader psychology.", "human-behavior.html", "Open Behavior"],
  "case-study-drawdown-review.html": ["Print recovery sheets", "Use the worksheets to rebuild process before increasing risk.", "worksheets.html", "Open Worksheets"]
};

if (document.querySelector("main") && !document.querySelector(".next-step-block")) {
  const step = nextSteps[currentPage] || ["Browse the library", "Choose the next lesson, tool, or case study from the full NAKAMOTO Academy index.", "library.html", "Open Library"];
  const block = document.createElement("section");
  block.className = "next-step-block";
  block.innerHTML = `
    <div class="wrap next-step-panel">
      <div>
        <p class="eyebrow"><span class="dot" aria-hidden="true"></span>Next step</p>
        <h2>${step[0]}</h2>
        <p>${step[1]}</p>
      </div>
      <a class="btn primary" href="${step[2]}">${step[3]}</a>
    </div>
  `;
  document.querySelector("main").appendChild(block);
}
