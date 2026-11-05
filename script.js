const searchInput = document.querySelector("#site-search");
const filterButtons = document.querySelectorAll("[data-filter]");
const searchableItems = document.querySelectorAll("[data-search], [data-tags]");
const siteSearchResults = document.querySelector("[data-site-search-results]");
const siteSearchSummary = document.querySelector("[data-search-summary]");
const chapterParts = document.querySelectorAll(".chapter-part");
const rootElement = document.documentElement;
const normalizedCurrentPath = window.location.pathname.replace(/\/index\.html$/, "/").replace(/^\//, "") || "index.html";
const downloadableExtensions = /\.(pdf|csv|xlsx?|docx?|pptx?|zip|txt)$/i;
const analyticsConfig = {
  ga4: "G-WLL3RRGXCK",
  clarity: "x97vtsxof3",
  uet: "97252882"
};

function loadExternalScript(src, attributes = {}) {
  if ([...document.scripts].some((script) => script.src === src)) return null;

  const script = document.createElement("script");
  script.src = src;
  script.async = true;
  Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.append(script);
  return script;
}

function installAnalyticsIntegrations() {
  if (analyticsConfig.ga4 && typeof window.gtag !== "function") {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", analyticsConfig.ga4);
    loadExternalScript(`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga4}`);
  }

  if (analyticsConfig.clarity && typeof window.clarity !== "function") {
    window.clarity = function clarity(){ (window.clarity.q = window.clarity.q || []).push(arguments); };
    loadExternalScript(`https://www.clarity.ms/tag/${analyticsConfig.clarity}`);
  }

  if (analyticsConfig.uet && !window.uetq) {
    window.uetq = window.uetq || [];
    const uetScript = loadExternalScript(`https://bat.bing.net/bat.js?ti=${analyticsConfig.uet}`);
    uetScript?.addEventListener("load", () => {
      if (typeof window.UET === "function") {
        const queue = window.uetq;
        window.uetq = new window.UET({ ti: analyticsConfig.uet, q: queue });
        window.uetq.push("pageLoad");
      }
    }, { once: true });
  }
}

installAnalyticsIntegrations();

function sendAnalyticsEvent(eventName, parameters = {}) {
  const eventPayload = {
    page_title: document.title,
    page_location: window.location.href,
    ...parameters
  };

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, eventPayload);
  }

  if (typeof window.clarity === "function") {
    window.clarity("event", eventName);
  }

  if (window.uetq && typeof window.uetq.push === "function") {
    window.uetq.push("event", eventName, {
      event_category: "site_engagement",
      event_label: eventPayload.link_text || eventPayload.button_text || eventPayload.form_name || eventPayload.search_term || document.title,
      page_location: eventPayload.page_location
    });
  }
}

function describeLink(link) {
  return {
    link_url: link.href,
    link_text: link.textContent.trim().slice(0, 120),
    link_domain: link.hostname || window.location.hostname
  };
}

function isOutboundLink(link) {
  return link.hostname && link.hostname !== window.location.hostname;
}

function isAffiliateLink(link) {
  const rel = (link.getAttribute("rel") || "").toLowerCase();
  return rel.includes("sponsored") || Boolean(link.closest("[data-affiliate-section]"));
}

function getAffiliateMerchant(link) {
  const label = link.querySelector("h3")?.textContent || link.textContent || link.hostname || "affiliate";
  return label
    .replace(/\s+referral\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

function installGrowthEventTracking() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    const button = event.target.closest?.("button");

    if (link) {
      const details = describeLink(link);
      const url = new URL(link.href, window.location.href);

      if (isAffiliateLink(link)) {
        sendAnalyticsEvent("affiliate_link_click", {
          ...details,
          affiliate_merchant: getAffiliateMerchant(link),
          affiliate_context: link.closest("section")?.querySelector("h2")?.textContent?.trim().slice(0, 120) || "affiliate"
        });
      }

      if (isOutboundLink(url)) {
        sendAnalyticsEvent("outbound_link_click", details);
      } else if (downloadableExtensions.test(url.pathname)) {
        sendAnalyticsEvent("file_download", {
          ...details,
          file_extension: url.pathname.split(".").pop().toLowerCase()
        });
      } else if (url.pathname.endsWith("/premium.html") || url.pathname.endsWith("premium.html") || url.hash === "#plans" || url.hash === "#interest") {
        sendAnalyticsEvent("premium_interest_click", {
          ...details,
          premium_target: url.hash || url.pathname
        });
      } else if (link.closest(".action-card, .hero-actions, .top-nav, .archive-quick-links, .source-link-grid")) {
        sendAnalyticsEvent("navigation_click", {
          ...details,
          click_area: link.closest("section")?.className || link.closest("nav")?.className || "site"
        });
      }
    }

    if (button) {
      sendAnalyticsEvent("button_click", {
        button_text: button.textContent.trim().slice(0, 120),
        button_type: button.type || "button"
      });
    }
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;

    sendAnalyticsEvent("form_submit", {
      form_name: form.getAttribute("name") || form.id || "unknown_form",
      form_action: form.getAttribute("action") || window.location.pathname
    });

    if (form.getAttribute("name") === "nakamoto-premium-interest") {
      sendAnalyticsEvent("premium_waitlist_submit", {
        form_name: "nakamoto-premium-interest",
        premium_plan: form.elements.plan?.value || "",
        premium_topic: form.elements.topic?.value || ""
      });
    }
  });

  document.addEventListener("search", (event) => {
    if (event.target === searchInput) {
      sendAnalyticsEvent("site_search", {
        search_term: searchInput.value.trim().slice(0, 120)
      });
    }
  });
}

installGrowthEventTracking();

const searchDestinations = [
  {"href":"news-2026-11-05.html","title":"How to read the November Bank of England decision","summary":"The Bank of England scheduled its November decision and Monetary Policy Report for noon London time on 5 November. Both official pages still showed release notices at the 02:00 London source check.","label":"Published 5 November","terms":"uk bank rate mpc decision votes forecast policy november 2026"},
  {"href":"bitcoin-blog-2026-11-05.html","title":"Separate the policy decision, votes and forecast","summary":"Create a three-row evidence log for a central bank announcement.","label":"Published 5 November","terms":"uk bank rate mpc decision votes forecast policy november 2026"},
  {"href":"today-source-pack-2026-11-05.html","title":"5 November original-source pack","summary":"Official publication pages for the November decision and Monetary Policy Report.","label":"Published 5 November","terms":"uk bank rate mpc decision votes forecast policy november 2026"},
  {"href":"news-2026-11-04.html","title":"UK international reserves: what to check in the October release","summary":"The Bank of England scheduled its October reserves release for 4 November. The release page reviewed for this edition still showed a publication notice. Check the original page for the tables and any revisions before recording a figure.","label":"Published 4 November","terms":"uk october reserves liquidity valuation policy november 2026"},
  {"href":"bitcoin-blog-2026-11-04.html","title":"Separate reserve stocks, transactions and valuation changes","summary":"Build a worksheet that distinguishes a change in reported reserves from a transaction.","label":"Published 4 November","terms":"uk october reserves liquidity valuation policy november 2026"},
  {"href":"today-source-pack-2026-11-04.html","title":"4 November original-source pack","summary":"Primary references for the October reserves release and the 5 November policy calendar.","label":"Published 4 November","terms":"uk october reserves liquidity valuation policy november 2026"},
  {"title":"Blue Book 2026: separate publication access from the data release","label":"Published 3 November","href":"news-2026-10-31.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-10-31 Blue Book 2026: separate publication access from the data release Build a data-vintage record before comparing national accounts"},
  {"title":"Build a data-vintage record before comparing national accounts","label":"Published 3 November","href":"bitcoin-blog-2026-10-31.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-10-31 Blue Book 2026: separate publication access from the data release Build a data-vintage record before comparing national accounts"},
  {"title":"Pink Book 2026 puts the UK current-account deficit at 3.0% of GDP in 2025","label":"Published 3 November","href":"news-2026-11-01.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-11-01 Pink Book 2026 puts the UK current-account deficit at 3.0% of GDP in 2025 Keep cross-border flows separate from investment positions"},
  {"title":"Keep cross-border flows separate from investment positions","label":"Published 3 November","href":"bitcoin-blog-2026-11-01.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-11-01 Pink Book 2026 puts the UK current-account deficit at 3.0% of GDP in 2025 Keep cross-border flows separate from investment positions"},
  {"title":"ONS supply-and-use release separates industry output from value added","label":"Published 3 November","href":"news-2026-11-02.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-11-02 ONS supply-and-use release separates industry output from value added Check the unit and statistical status before building a sector comparison"},
  {"title":"Check the unit and statistical status before building a sector comparison","label":"Published 3 November","href":"bitcoin-blog-2026-11-02.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-11-02 ONS supply-and-use release separates industry output from value added Check the unit and statistical status before building a sector comparison"},
  {"title":"Bank of England schedules its November policy publications for 5 November","label":"Published 3 November","href":"news-2026-11-03.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-11-03 Bank of England schedules its November policy publications for 5 November Write a policy-release checklist before the decision arrives"},
  {"title":"Write a policy-release checklist before the decision arrives","label":"Published 3 November","href":"bitcoin-blog-2026-11-03.html","summary":"Original sources, dates, definitions and limitations.","terms":"2026-11-03 Bank of England schedules its November policy publications for 5 November Write a policy-release checklist before the decision arrives"},
  {"title":"Research evidence worksheet","label":"Research tool","href":"research-evidence-worksheet.html","summary":"Record claims, source dates, units, revision status and uncertainty.","terms":"evidence worksheet research checklist sources data vintage"},
  {"title":"3 November source pack","label":"Original sources","href":"today-source-pack-2026-11-03.html","summary":"ONS accounts and Bank of England publication calendar.","terms":"November 2026 source pack ONS Blue Book Pink Book supply use Bank England"},
  { title: "Bank and FCA survey maps AI use and dependency in finance", label: "30 October news", href: "news-2026-10-30.html", summary: "Original-source review of AI adoption, third-party dependencies, and survey limits in UK finance.", terms: "2026-10-30 bank of england fca artificial intelligence ai adoption survey finance third party dependency denominator" },
  { title: "Read an AI adoption survey without losing the denominator", label: "30 October blog", href: "bitcoin-blog-2026-10-30.html", summary: "A reader exercise for checking survey populations, percentages, and limits.", terms: "2026-10-30 bank fca ai adoption survey denominator sample percentages finance" },
  { title: "Bank consults on tokenised collateral for central clearing", label: "29 October news", href: "news-2026-10-29.html", summary: "Source review of the Bank of England consultation on tokenised collateral.", terms: "2026-10-29 bank of england tokenised tokenized collateral central clearing consultation" },
  { title: "Test a tokenised collateral claim against the asset and the rails", label: "29 October blog", href: "bitcoin-blog-2026-10-29.html", summary: "A reader exercise on the underlying asset and settlement infrastructure.", terms: "2026-10-29 tokenised tokenized collateral asset rails clearing settlement" },
  { title: "The October MPC remit reaffirms the UK inflation target", label: "28 October news", href: "news-2026-10-28.html", summary: "The Treasury remit sets the policy framework; it is not a new rate decision.", terms: "2026-10-28 bank of england treasury mpc remit inflation target cpi bank rate" },
  { title: "Separate an inflation target from a rate decision", label: "28 October blog", href: "bitcoin-blog-2026-10-28.html", summary: "A reader exercise for distinguishing the MPC remit from a meeting decision.", terms: "2026-10-28 mpc remit inflation target bank rate decision" },
  { title: "30 October original-source pack", label: "Original sources", href: "today-source-pack-2026-10-30.html", summary: "Publisher links and reading notes behind the 30 October source reviews.", terms: "2026-10-30 original sources source pack bank of england fca ai survey tokenised collateral mpc remit" },
  { title: "September 17 Official Source Checklist", label: "Sources", href: "today-source-pack-2026-09-17.html", summary: "Federal Reserve decision, UK inflation, pending Bank of England and US housing releases, and a dated Bitcoin observation.", terms: "september 17 2026 federal reserve fomc uk inflation ons bank of england census housing bitcoin official sources checklist" },
  {"href":"news-2026-09-14.html","title":"September 14: prepare for a crowded policy and data week","label":"September 14 update","summary":"Official-source week-ahead review and evidence-log practice.","terms":"2026-09-14 September 14 Fed FOMC ONS inflation retail sales Bank of England calendar evidence log"},
  {"href":"bitcoin-blog-2026-09-14.html","title":"Before the release, write down what would change your mind","label":"September 14 update","summary":"Official-source week-ahead review and evidence-log practice.","terms":"2026-09-14 September 14 Fed FOMC ONS inflation retail sales Bank of England calendar evidence log"},
  {"href":"today-source-pack-2026-09-14.html","title":"September 14 source pack","label":"September 14 update","summary":"Official-source week-ahead review and evidence-log practice.","terms":"2026-09-14 September 14 Fed FOMC ONS inflation retail sales Bank of England calendar evidence log"},
  {"href":"daily-operations-2026-09-14.html","title":"September 14 daily operation record","label":"September 14 update","summary":"Official-source week-ahead review and evidence-log practice.","terms":"2026-09-14 September 14 Fed FOMC ONS inflation retail sales Bank of England calendar evidence log"},
  {"title":"Complete Bitcoin blog archive","label":"Blog archive","href":"bitcoin-blog-archive.html","summary":"Browse the dated Bitcoin blog archive and clearly labelled retrospective articles.","terms":"bitcoin blog archive missing dates retrospective"},
  {"title":"A wallet balance has separate pieces","label":"Retrospective blog","href":"bitcoin-blog-2026-06-13.html","summary":"Archive slot 2026-06-13; published 2026-09-13. Draw the pieces behind a displayed balance before deciding what can be spent.","terms":"bitcoin blog retrospective 2026-06-13 A wallet balance has separate pieces"},
  {"title":"Read change before approving a payment","label":"Retrospective blog","href":"bitcoin-blog-2026-06-14.html","summary":"Archive slot 2026-06-14; published 2026-09-13. Separate the recipient amount from money returning to your wallet.","terms":"bitcoin blog retrospective 2026-06-14 Read change before approving a payment"},
  {"title":"Why a transaction identifier needs an output index","label":"Retrospective blog","href":"bitcoin-blog-2026-06-21.html","summary":"Archive slot 2026-06-21; published 2026-09-13. Treat an identifier as a reference that must be specific enough to resolve.","terms":"bitcoin blog retrospective 2026-06-21 Why a transaction identifier needs an output index"},
  {"title":"Reconcile a payment in satoshis","label":"Retrospective blog","href":"bitcoin-blog-2026-07-17.html","summary":"Archive slot 2026-07-17; published 2026-09-13. Use integer units to make an audit easy to follow.","terms":"bitcoin blog retrospective 2026-07-17 Reconcile a payment in satoshis"},
  {"title":"Write a recovery plan before an emergency","label":"Retrospective blog","href":"bitcoin-blog-2026-07-20.html","summary":"Archive slot 2026-07-20; published 2026-09-13. Describe recovery as a sequence that another authorized person could understand.","terms":"bitcoin blog retrospective 2026-07-20 Write a recovery plan before an emergency"},
  {"title":"Separate backup availability from secrecy","label":"Retrospective blog","href":"bitcoin-blog-2026-07-21.html","summary":"Archive slot 2026-07-21; published 2026-09-13. Ask two different questions about the same backup.","terms":"bitcoin blog retrospective 2026-07-21 Separate backup availability from secrecy"},
  {"title":"Build a wallet change log","label":"Retrospective blog","href":"bitcoin-blog-2026-07-22.html","summary":"Archive slot 2026-07-22; published 2026-09-13. Make changes understandable to your future self.","terms":"bitcoin blog retrospective 2026-07-22 Build a wallet change log"},
  {"title":"Practice recovery without risking savings","label":"Retrospective blog","href":"bitcoin-blog-2026-07-23.html","summary":"Archive slot 2026-07-23; published 2026-09-13. Use a rehearsal to find confusing instructions early.","terms":"bitcoin blog retrospective 2026-07-23 Practice recovery without risking savings"},
  {"title":"Public records need careful sharing","label":"Retrospective blog","href":"bitcoin-blog-2026-07-24.html","summary":"Archive slot 2026-07-24; published 2026-09-13. Think about what a published transaction reference may reveal when combined with other information.","terms":"bitcoin blog retrospective 2026-07-24 Public records need careful sharing"},
  {"title":"Keep a private ledger and a public explanation","label":"Retrospective blog","href":"bitcoin-blog-2026-07-25.html","summary":"Archive slot 2026-07-25; published 2026-09-13. Give each document only the detail its audience needs.","terms":"bitcoin blog retrospective 2026-07-25 Keep a private ledger and a public explanation"},
  {"title":"Map the audience before sharing wallet information","label":"Retrospective blog","href":"bitcoin-blog-2026-07-26.html","summary":"Archive slot 2026-07-26; published 2026-09-13. Decide who needs each piece of information and why.","terms":"bitcoin blog retrospective 2026-07-26 Map the audience before sharing wallet information"},
  {"title":"Remove identifying context from teaching examples","label":"Retrospective blog","href":"bitcoin-blog-2026-07-27.html","summary":"Archive slot 2026-07-27; published 2026-09-13. Check the surrounding story as well as the numbers.","terms":"bitcoin blog retrospective 2026-07-27 Remove identifying context from teaching examples"},
  {"title":"Define what verified means","label":"Retrospective blog","href":"bitcoin-blog-2026-07-28.html","summary":"Archive slot 2026-07-28; published 2026-09-13. Attach a claim to the check that actually supports it.","terms":"bitcoin blog retrospective 2026-07-28 Define what verified means"},
  {"title":"Write a trust dependency map","label":"Retrospective blog","href":"bitcoin-blog-2026-07-29.html","summary":"Archive slot 2026-07-29; published 2026-09-13. Identify where an answer comes from before relying on it.","terms":"bitcoin blog retrospective 2026-07-29 Write a trust dependency map"},
  {"title":"Treat an unavailable service as an observation gap","label":"Retrospective blog","href":"bitcoin-blog-2026-07-30.html","summary":"Archive slot 2026-07-30; published 2026-09-13. Avoid turning a missing response into a conclusion about funds.","terms":"bitcoin blog retrospective 2026-07-30 Treat an unavailable service as an observation gap"},
  {"title":"Compare verification methods by the question","label":"Retrospective blog","href":"bitcoin-blog-2026-07-31.html","summary":"Archive slot 2026-07-31; published 2026-09-13. Start with the decision the evidence must support.","terms":"bitcoin blog retrospective 2026-07-31 Compare verification methods by the question"},
  {"title":"Mining averages are not a daily schedule","label":"Retrospective blog","href":"bitcoin-blog-2026-08-01.html","summary":"Archive slot 2026-08-01; published 2026-09-13. Separate a long-run expectation from a guaranteed sequence.","terms":"bitcoin blog retrospective 2026-08-01 Mining averages are not a daily schedule"},
  {"title":"Calculate costs before telling a mining story","label":"Retrospective blog","href":"bitcoin-blog-2026-08-03.html","summary":"Archive slot 2026-08-03; published 2026-09-13. Make the assumed cost structure visible.","terms":"bitcoin blog retrospective 2026-08-03 Calculate costs before telling a mining story"},
  {"title":"Separate payout variability from profitability","label":"Retrospective blog","href":"bitcoin-blog-2026-08-04.html","summary":"Archive slot 2026-08-04; published 2026-09-13. Ask what a smoother cash-flow line actually tells you.","terms":"bitcoin blog retrospective 2026-08-04 Separate payout variability from profitability"},
  {"title":"Stress-test a mining spreadsheet","label":"Retrospective blog","href":"bitcoin-blog-2026-08-05.html","summary":"Archive slot 2026-08-05; published 2026-09-13. Vary assumptions independently so the weak point is visible.","terms":"bitcoin blog retrospective 2026-08-05 Stress-test a mining spreadsheet"},
  {"title":"Keep experiments separate from real balances","label":"Retrospective blog","href":"bitcoin-blog-2026-08-06.html","summary":"Archive slot 2026-08-06; published 2026-09-13. Give a learning environment an unmistakable identity.","terms":"bitcoin blog retrospective 2026-08-06 Keep experiments separate from real balances"},
  {"title":"Change one variable in a transaction experiment","label":"Retrospective blog","href":"bitcoin-blog-2026-08-07.html","summary":"Archive slot 2026-08-07; published 2026-09-13. Make the cause of an observed difference easier to identify.","terms":"bitcoin blog retrospective 2026-08-07 Change one variable in a transaction experiment"},
  {"title":"Record expected results before testing","label":"Retrospective blog","href":"bitcoin-blog-2026-08-08.html","summary":"Archive slot 2026-08-08; published 2026-09-13. Prevent a successful-looking result from rewriting the original question.","terms":"bitcoin blog retrospective 2026-08-08 Record expected results before testing"},
  {"title":"Preserve a reproducible practice notebook","label":"Retrospective blog","href":"bitcoin-blog-2026-08-09.html","summary":"Archive slot 2026-08-09; published 2026-09-13. Leave enough context to repeat a learning exercise.","terms":"bitcoin blog retrospective 2026-08-09 Preserve a reproducible practice notebook"},
  {"title":"Count underlying exposures, not fund names","label":"Retrospective blog","href":"bitcoin-blog-2026-08-10.html","summary":"Archive slot 2026-08-10; published 2026-09-13. Inspect what different labels actually contain.","terms":"bitcoin blog retrospective 2026-08-10 Count underlying exposures, not fund names"},
  {"title":"Measure a position in the whole portfolio","label":"Retrospective blog","href":"bitcoin-blog-2026-08-11.html","summary":"Archive slot 2026-08-11; published 2026-09-13. Use a consistent denominator when describing concentration.","terms":"bitcoin blog retrospective 2026-08-11 Measure a position in the whole portfolio"},
  {"title":"Check allocation drift with simple arithmetic","label":"Retrospective blog","href":"bitcoin-blog-2026-08-12.html","summary":"Archive slot 2026-08-12; published 2026-09-13. Compare current weights with the original plan.","terms":"bitcoin blog retrospective 2026-08-12 Check allocation drift with simple arithmetic"},
  {"title":"Describe a rebalancing rule before the trigger","label":"Retrospective blog","href":"bitcoin-blog-2026-08-13.html","summary":"Archive slot 2026-08-13; published 2026-09-13. Make a hypothetical policy inspectable before emotions enter.","terms":"bitcoin blog retrospective 2026-08-13 Describe a rebalancing rule before the trigger"},
  {"title":"Translate a fee percentage into money","label":"Retrospective blog","href":"bitcoin-blog-2026-08-14.html","summary":"Archive slot 2026-08-14; published 2026-09-13. Convert a small-looking percentage into an explicit cost assumption.","terms":"bitcoin blog retrospective 2026-08-14 Translate a fee percentage into money"},
  {"title":"Compare total costs on one basis","label":"Retrospective blog","href":"bitcoin-blog-2026-08-15.html","summary":"Archive slot 2026-08-15; published 2026-09-13. Avoid comparing a partial quote with a complete one.","terms":"bitcoin blog retrospective 2026-08-15 Compare total costs on one basis"},
  {"title":"Distinguish a one-time charge from a recurring cost","label":"Retrospective blog","href":"bitcoin-blog-2026-08-16.html","summary":"Archive slot 2026-08-16; published 2026-09-13. Put the time horizon into the comparison.","terms":"bitcoin blog retrospective 2026-08-16 Distinguish a one-time charge from a recurring cost"},
  {"title":"Make fee assumptions visible in a projection","label":"Retrospective blog","href":"bitcoin-blog-2026-08-17.html","summary":"Archive slot 2026-08-17; published 2026-09-13. Show the calculation without implying a return forecast.","terms":"bitcoin blog retrospective 2026-08-17 Make fee assumptions visible in a projection"},
  {"title":"Separate a cash buffer from a market thesis","label":"Retrospective blog","href":"bitcoin-blog-2026-08-18.html","summary":"Archive slot 2026-08-18; published 2026-09-13. Give near-term spending its own worksheet.","terms":"bitcoin blog retrospective 2026-08-18 Separate a cash buffer from a market thesis"},
  {"title":"Plan for an irregular bill explicitly","label":"Retrospective blog","href":"bitcoin-blog-2026-08-20.html","summary":"Archive slot 2026-08-20; published 2026-09-13. Spread a known future expense across the available time.","terms":"bitcoin blog retrospective 2026-08-20 Plan for an irregular bill explicitly"},
  {"title":"Test a budget against delayed income","label":"Retrospective blog","href":"bitcoin-blog-2026-08-22.html","summary":"Archive slot 2026-08-22; published 2026-09-13. Model timing as well as the monthly total.","terms":"bitcoin blog retrospective 2026-08-22 Test a budget against delayed income"},
  {"title":"Review a buffer after a withdrawal","label":"Retrospective blog","href":"bitcoin-blog-2026-08-23.html","summary":"Archive slot 2026-08-23; published 2026-09-13. Turn an emergency expense into a revised plan.","terms":"bitcoin blog retrospective 2026-08-23 Review a buffer after a withdrawal"},
  {"title":"Separate a price level from its growth rate","label":"Retrospective blog","href":"bitcoin-blog-2026-08-24.html","summary":"Archive slot 2026-08-24; published 2026-09-13. Read the units before interpreting a headline.","terms":"bitcoin blog retrospective 2026-08-24 Separate a price level from its growth rate"},
  {"title":"Calculate a change from the correct base","label":"Retrospective blog","href":"bitcoin-blog-2026-08-25.html","summary":"Archive slot 2026-08-25; published 2026-09-13. Check which observation belongs in the denominator.","terms":"bitcoin blog retrospective 2026-08-25 Calculate a change from the correct base"},
  {"title":"Keep a household basket distinct from a broad index","label":"Retrospective blog","href":"bitcoin-blog-2026-08-26.html","summary":"Archive slot 2026-08-26; published 2026-09-13. Compare spending weights before comparing experiences.","terms":"bitcoin blog retrospective 2026-08-26 Keep a household basket distinct from a broad index"},
  {"title":"Do not add monthly percentages mechanically","label":"Retrospective blog","href":"bitcoin-blog-2026-08-27.html","summary":"Archive slot 2026-08-27; published 2026-09-13. Use multiplication when a change applies to a new base.","terms":"bitcoin blog retrospective 2026-08-27 Do not add monthly percentages mechanically"},
  {"title":"Label the adjustment basis of a chart","label":"Retrospective blog","href":"bitcoin-blog-2026-08-28.html","summary":"Archive slot 2026-08-28; published 2026-09-13. Keep comparable series together and mark differences.","terms":"bitcoin blog retrospective 2026-08-28 Label the adjustment basis of a chart"},
  {"title":"Do not compare unlike time windows silently","label":"Retrospective blog","href":"bitcoin-blog-2026-08-29.html","summary":"Archive slot 2026-08-29; published 2026-09-13. State which period each number describes.","terms":"bitcoin blog retrospective 2026-08-29 Do not compare unlike time windows silently"},
  {"title":"Keep revisions visible in a research log","label":"Retrospective blog","href":"bitcoin-blog-2026-08-30.html","summary":"Archive slot 2026-08-30; published 2026-09-13. Preserve what changed between releases.","terms":"bitcoin blog retrospective 2026-08-30 Keep revisions visible in a research log"},
  {"title":"Write a release note with a reference period","label":"Retrospective blog","href":"bitcoin-blog-2026-08-31.html","summary":"Archive slot 2026-08-31; published 2026-09-13. Separate when information was released from what it measures.","terms":"bitcoin blog retrospective 2026-08-31 Write a release note with a reference period"},
  {"title":"Translate a drawdown into a recovery hurdle","label":"Retrospective blog","href":"bitcoin-blog-2026-09-01.html","summary":"Archive slot 2026-09-01; published 2026-09-13. Calculate the gain needed from the lower balance.","terms":"bitcoin blog retrospective 2026-09-01 Translate a drawdown into a recovery hurdle"},
  {"title":"Measure risk in spending terms","label":"Retrospective blog","href":"bitcoin-blog-2026-09-02.html","summary":"Archive slot 2026-09-02; published 2026-09-13. Connect an abstract loss to a concrete obligation.","terms":"bitcoin blog retrospective 2026-09-02 Measure risk in spending terms"},
  {"title":"Separate willingness from capacity to take risk","label":"Retrospective blog","href":"bitcoin-blog-2026-09-03.html","summary":"Archive slot 2026-09-03; published 2026-09-13. Write down emotional comfort and financial constraints independently.","terms":"bitcoin blog retrospective 2026-09-03 Separate willingness from capacity to take risk"},
  {"title":"Use scenarios without assigning invented probabilities","label":"Retrospective blog","href":"bitcoin-blog-2026-09-04.html","summary":"Archive slot 2026-09-04; published 2026-09-13. Show possible outcomes while preserving uncertainty.","terms":"bitcoin blog retrospective 2026-09-04 Use scenarios without assigning invented probabilities"},
  {"title":"Give a payment workflow distinct states","label":"Retrospective blog","href":"bitcoin-blog-2026-09-05.html","summary":"Archive slot 2026-09-05; published 2026-09-13. Use status words that describe observable steps.","terms":"bitcoin blog retrospective 2026-09-05 Give a payment workflow distinct states"},
  {"title":"Reconcile the invoice and payment separately","label":"Retrospective blog","href":"bitcoin-blog-2026-09-06.html","summary":"Archive slot 2026-09-06; published 2026-09-13. Keep the requested amount beside the observed amount.","terms":"bitcoin blog retrospective 2026-09-06 Reconcile the invoice and payment separately"},
  {"title":"Timestamp payment observations","label":"Retrospective blog","href":"bitcoin-blog-2026-09-07.html","summary":"Archive slot 2026-09-07; published 2026-09-13. Distinguish a snapshot from a continuously monitored state.","terms":"bitcoin blog retrospective 2026-09-07 Timestamp payment observations"},
  {"title":"Document exceptions instead of forcing success","label":"Retrospective blog","href":"bitcoin-blog-2026-09-08.html","summary":"Archive slot 2026-09-08; published 2026-09-13. Provide a clear path when the normal payment sequence breaks.","terms":"bitcoin blog retrospective 2026-09-08 Document exceptions instead of forcing success"},
  {"title":"Separate a research claim from an opinion","label":"Retrospective blog","href":"bitcoin-blog-2026-09-09.html","summary":"Archive slot 2026-09-09; published 2026-09-13. Make the evidence chain visible in the paragraph.","terms":"bitcoin blog retrospective 2026-09-09 Separate a research claim from an opinion"},
  {"title":"Write down what would change your mind","label":"Retrospective blog","href":"bitcoin-blog-2026-09-10.html","summary":"Archive slot 2026-09-10; published 2026-09-13. Give a thesis a testable boundary.","terms":"bitcoin blog retrospective 2026-09-10 Write down what would change your mind"},
  {"title":"Keep missing evidence visible","label":"Retrospective blog","href":"bitcoin-blog-2026-09-11.html","summary":"Archive slot 2026-09-11; published 2026-09-13. Do not fill an empty data cell with a confident narrative.","terms":"bitcoin blog retrospective 2026-09-11 Keep missing evidence visible"},
  {"title":"Close a research session with a decision log","label":"Retrospective blog","href":"bitcoin-blog-2026-09-12.html","summary":"Archive slot 2026-09-12; published 2026-09-13. Record the result and the next evidence check.","terms":"bitcoin blog retrospective 2026-09-12 Close a research session with a decision log"},
  { title: "Bitcoin Wallet Beginner Guide", label: "Wallets", href: "guides.html#wallet-beginners", summary: "Hot wallets, hardware wallets, seed phrases, backups, and self-custody basics.", terms: "wallet wallets seed phrase recovery phrase private key hardware wallet self custody backup keys beginner safety" },
  { title: "Buy Bitcoin Safely", label: "Buying", href: "guides.html#buy-bitcoin-safely", summary: "Exchange checks, fees, account security, withdrawals, and first-purchase mistakes.", terms: "buy buying bitcoin safely exchange fees kyc withdrawal account security dca beginner" },
  { title: "Finance and Trading Referral Resources", label: "Referrals", href: "finance-referral-resources.html", summary: "Disclosure-first referral routes for Revolut, InvestEngine, Freetrade, FP Trading, Audacity Capital, SumUp, and Capital on Tap with suitability, fee, risk, drawdown, payout, payment, business-card, and record checks.", terms: "finance trading referral resources revolut investengine freetrade fp trading audacity capital sumup capital on tap funded trading prop firm evaluation investing app money app etf platform payment processor business card affiliate disclosure capital at risk drawdown payout rules terms fees records chargebacks repayments" },
  { title: "Payment Processors Comparison", label: "Business", href: "payment-processors-comparison.html", summary: "Compare payment processors for small businesses by fees, hardware, settlement timing, refunds, chargebacks, accounting records, and business fit.", terms: "payment processor comparison small business sumup card reader terminal fees hardware settlement timing refunds chargebacks accounting records merchant payments" },
  { title: "Business Credit Cards Comparison", label: "Business", href: "business-credit-cards-comparison.html", summary: "Compare business credit cards by fees, interest, credit checks, rewards, repayment duties, accounting exports, and cash-flow discipline.", terms: "business credit card comparison capital on tap fees interest credit check rewards repayment cash flow accounting exports business finance" },
  { title: "Funded Trading Accounts Comparison", label: "Trading", href: "funded-trading-accounts-comparison.html", summary: "Compare funded trading accounts by evaluation fees, drawdown rules, payout conditions, scaling plans, prohibited strategies, and trader readiness.", terms: "funded trading accounts comparison fp trading audacity capital prop firm evaluation fee drawdown payout scaling rules prohibited strategies trader readiness" },
  { title: "Investing Apps Comparison", label: "Investing", href: "investing-apps-comparison.html", summary: "Compare investing apps by fees, account types, investment range, tax wrappers, records, risk warnings, and investor fit.", terms: "investing apps comparison investengine freetrade etf platform stocks fees account types isa sipp tax wrapper records capital at risk" },
  { title: "Money Apps Comparison", label: "Money", href: "money-apps-comparison.html", summary: "Compare money apps by fees, FX costs, card features, budgeting tools, savings features, protections, records, and country availability.", terms: "money apps comparison revolut banking app fees fx costs card budgeting savings protections records country availability travel spending" },
  { title: "Affiliate Review Methodology", label: "Trust", href: "affiliate-review-methodology.html", summary: "How NAKAMOTO evaluates affiliate products by reader fit, risk, cost, records, disclosures, official terms, and editorial independence.", terms: "affiliate review methodology disclosure editorial independence product testing trust compliance sponsored links official terms reader fit risk cost records" },
  { title: "Affiliate Performance Dashboard", label: "Dashboard", href: "affiliate-performance-dashboard.html", summary: "Internal affiliate dashboard for live links, disclosure checks, comparison pages, GA4 affiliate_link_click events, and weekly review tasks.", terms: "affiliate performance dashboard affiliate_link_click ga4 microsoft clarity uet sponsored links weekly review disclosure checks revenue dashboard" },
  { title: "How to Choose a Payment Processor", label: "Guide", href: "how-to-choose-payment-processor.html", summary: "Buyer guide for choosing a payment processor by sales channel, fees, settlement, chargebacks, records, and support.", terms: "how to choose payment processor small business card reader terminal fees settlement chargebacks refunds records support sumup" },
  { title: "How to Choose a Funded Trading Account", label: "Guide", href: "how-to-choose-funded-trading-account.html", summary: "Buyer guide for choosing a funded trading account by evaluation fees, drawdown rules, payout rules, prohibited strategies, and trader readiness.", terms: "how to choose funded trading account prop firm evaluation fee drawdown payout prohibited strategies fp trading audacity capital" },
  { title: "How to Choose an Investing App", label: "Guide", href: "how-to-choose-investing-app.html", summary: "Buyer guide for choosing an investing app by account type, fees, investment range, tax wrappers, records, transfers, and behavior risk.", terms: "how to choose investing app investengine freetrade etf stocks isa sipp fees records tax wrapper capital at risk" },
  { title: "How to Choose a Business Credit Card", label: "Guide", href: "how-to-choose-business-credit-card.html", summary: "Buyer guide for choosing a business credit card by repayment capacity, interest, fees, controls, rewards, and records.", terms: "how to choose business credit card capital on tap rewards repayment interest fees business finance records cash flow" },
  { title: "How to Choose a Money App", label: "Guide", href: "how-to-choose-money-app.html", summary: "Buyer guide for choosing a money app by fees, FX costs, card features, transfers, protections, savings tools, and records.", terms: "how to choose money app revolut fees fx card budgeting savings protections records travel transfer" },
  { title: "FP Trading Referral Route", label: "Trading", href: "trading-platforms-comparison.html", summary: "Funded-trading referral route with risk-first checks for evaluation fees, drawdowns, payout rules, prohibited strategies, and process fit.", terms: "fp trading funded account funded trading prop firm evaluation referral drawdown payout rules prohibited strategies trading risk disclosure" },
  { title: "Nakamoto Premium Bundle", label: "Premium", href: "premium.html", summary: "Starter, Nakamoto Pro, and Research Plus subscription preview for Bitcoin research, Trading Academy Pro, investing education, personal finance systems, dashboards, templates, reports, and checklists.", terms: "premium subscription membership starter nakamoto pro research plus bitcoin research trading academy investing personal finance dashboards templates reports checklists waitlist" },
  { title: "Sample Pro Brief", label: "Premium", href: "sample-pro-brief.html", summary: "Preview of the weekly Nakamoto Pro Brief structure for Bitcoin, ETF flows, macro context, investing discipline, trading risk, safety, and source links.", terms: "sample pro brief premium weekly bitcoin etf flows macro investing trading safety source links research brief" },
  { title: "Sample Monthly Wealth Plan", label: "Premium", href: "sample-monthly-wealth-plan.html", summary: "Preview of the Monthly Wealth Plan for cash buffer, debt, investing education, Bitcoin safety, income growth, and monthly review habits.", terms: "sample monthly wealth plan premium cash buffer debt investing bitcoin safety income monthly review money" },
  { title: "Sample Trading Journal", label: "Premium", href: "sample-trading-journal.html", summary: "Preview of the no-signal trading journal for setup quality, position sizing, drawdown rules, emotional state, and review discipline.", terms: "sample trading journal premium no signals risk management position sizing drawdown psychology review discipline" },
  { title: "Sample Bitcoin Safety Checklist", label: "Premium", href: "sample-bitcoin-safety-checklist.html", summary: "Preview of the Bitcoin Safety Checklist for wallet setup, seed phrase backup, exchange withdrawal, test transactions, scams, and recovery planning.", terms: "sample bitcoin safety checklist premium wallet seed phrase backup exchange withdrawal test transaction scams custody" },
  { title: "Entrepreneurship Hub", label: "Business", href: "entrepreneurship.html", summary: "Idea validation, business models, pricing, customer research, MVP planning, founder finance, and startup systems.", terms: "entrepreneurship startup founder business idea validation market research customer research mvp pricing business model cash flow bootstrapping" },
  { title: "Business Hub", label: "Business", href: "business.html", summary: "Strategy, sales, operations, marketing, support, hiring, processes, margins, partnerships, and business risk.", terms: "business operations strategy sales marketing support hiring partnerships sop process profit margin risk company" },
  { title: "Macroeconomics Hub", label: "Macro", href: "macroeconomics.html", summary: "Inflation, rates, central banks, jobs, GDP, liquidity, dollar strength, bonds, commodities, and recession signals.", terms: "macroeconomics macro inflation rates central banks jobs gdp liquidity dollar strength bonds commodities recession signals" },
  { title: "Regulation and Policy Hub", label: "Policy", href: "regulation-policy.html", summary: "Crypto rules, tax policy, stablecoins, ETF rules, banking, securities law, consumer protection, and compliance basics.", terms: "regulation policy crypto rules tax policy stablecoin rules etf rules banking securities law consumer protection compliance sec fca cftc" },
  { title: "Decision-Making and Psychology Hub", label: "Psychology", href: "decision-making.html", summary: "Biases, loss aversion, FOMO, overconfidence, risk tolerance, decision journals, emotional discipline, habits, and long-term thinking.", terms: "psychology decision making bias biases loss aversion fomo overconfidence risk tolerance decision journal habits discipline long term thinking" },
  { title: "Global Affairs Hub", label: "World", href: "global-affairs.html", summary: "Geopolitics, trade, energy security, sanctions, currencies, supply chains, elections, war risk, emerging markets, and capital flows.", terms: "global affairs geopolitics trade energy security sanctions currencies supply chains elections war risk emerging markets capital flows" },
  { title: "Wealth Building Hub", label: "Wealth", href: "wealth-building.html", summary: "Income growth, saving rate, investing habits, asset allocation, compounding, tax efficiency, retirement, property, business ownership, and generational wealth.", terms: "wealth building income growth saving rate investing habits asset allocation compounding tax efficiency retirement property business ownership generational wealth" },
  { title: "Financial Literacy Hub", label: "Money", href: "financial-literacy.html", summary: "Budgeting, saving, debt, credit scores, interest, insurance, taxes, investing basics, retirement accounts, and fraud prevention.", terms: "financial literacy budgeting saving debt credit score interest insurance taxes investing basics retirement accounts fraud prevention money basics" },
  { title: "Productivity Hub", label: "Systems", href: "productivity.html", summary: "Time blocking, deep work, weekly planning, habit tracking, focus systems, decision fatigue, energy management, notes, projects, and review cycles.", terms: "productivity time blocking deep work weekly planning habit tracking focus systems decision fatigue energy management notes projects review cycles" },
  { title: "Real Estate Hub", label: "Property", href: "real-estate.html", summary: "Renting vs buying, mortgage basics, deposit planning, rates, rental yield, property taxes, maintenance costs, REITs, and housing cycles.", terms: "real estate property renting buying mortgage deposit interest rates rental yield property taxes maintenance reits housing market cycles" },
  { title: "Financial Institutions Hub", label: "Finance", href: "financial-institutions.html", summary: "Banks, brokerages, asset managers, exchanges, payment companies, insurers, pension funds, central banks, fintechs, and custodians.", terms: "financial institutions banks brokerages asset managers exchanges payment companies insurers pension funds central banks fintech custodians" },
  { title: "Careers and Education Hub", label: "Career", href: "careers-education.html", summary: "Career planning, skills roadmaps, certifications, CVs, interviews, salary negotiation, career switching, online learning, finance careers, and tech careers.", terms: "careers education career planning skills roadmap certifications cv resume interviews salary negotiation career switching online learning finance careers tech careers" },
  { title: "Data and Analytics Hub", label: "Data", href: "data-analytics.html", summary: "Market metrics, Bitcoin network data, dashboards, source quality, analytics workflows, and reader-friendly data interpretation.", terms: "data analytics market metrics bitcoin network dashboard source quality interpretation official data metrics" },
  { title: "Statistics Hub", label: "Stats", href: "statistics.html", summary: "Probability, averages, volatility, correlation, sample size, base rates, backtests, and common data mistakes.", terms: "statistics probability averages volatility correlation sample size base rates backtest data mistakes finance risk" },
  { title: "Risk Management Hub", label: "Risk", href: "risk-management.html", summary: "Position sizing, drawdown, diversification, custody risk, leverage risk, liquidity, emergency funds, and decision boundaries.", terms: "risk management position sizing drawdown diversification custody leverage liquidity emergency fund trading investing bitcoin" },
  { title: "Economic History Hub", label: "History", href: "economic-history.html", summary: "Monetary systems, inflation episodes, banking crises, bubbles, debt cycles, gold, Bitcoin context, and past market lessons.", terms: "economic history monetary systems inflation banking crisis bubbles debt cycles gold bitcoin history markets" },
  { title: "Geopolitics Hub", label: "World", href: "geopolitics.html", summary: "Trade, energy security, sanctions, currencies, capital flows, supply chains, elections, conflict risk, and market impact.", terms: "geopolitics trade energy security sanctions currencies capital flows supply chains elections conflict markets" },
  { title: "Research Methods Hub", label: "Research", href: "research-methods.html", summary: "Source quality, primary documents, evidence levels, bias checks, note-taking, data interpretation, and decision frameworks.", terms: "research methods source quality primary documents evidence bias notes data interpretation decision framework" },
  { title: "October 15 official-source review", label: "News", href: "news-2026-10-15.html", summary: "Dated Fed survey, FOMC minutes, and stablecoin proposals with original sources.", terms: "october 2026 federal reserve survey fomc minutes stablecoin proposal news" },
  { title: "October 15 research: household data and market claims", label: "Blog", href: "bitcoin-blog-2026-10-15.html", summary: "Read the Federal Reserve household finance survey without turning it into a Bitcoin price signal.", terms: "2026 october survey consumer finances household income debt bitcoin research" },
  { title: "Research Foundation", label: "Research", href: "research-foundation.html", summary: "A learning path through original sources, data, statistics, risk, history, geopolitics, and practical checks.", terms: "research foundation evidence uncertainty statistics risk history geopolitics sources learning path" },
  { title: "Tools and Calculators Hub", label: "Tools", href: "tools-calculators.html", summary: "Bitcoin, investing, trading, personal finance, business planning, mortgage pressure, debt payoff, and research checklist tools.", terms: "tools calculators bitcoin investing trading personal finance business planning mortgage debt payoff checklist" },
  { title: "Guides and Tutorials Hub", label: "Guides", href: "guides-tutorials.html", summary: "Step-by-step guides for Bitcoin, investing, trading, personal finance, business, tax records, tools, and beginner paths.", terms: "guides tutorials bitcoin investing trading personal finance business tax beginner course learning path" },
  { title: "Corporate Finance Hub", label: "Business", href: "corporate-finance.html", summary: "Cash flow, capital allocation, debt, equity, valuation basics, margins, treasury policy, Bitcoin treasuries, and business finance.", terms: "corporate finance cash flow capital allocation debt equity valuation margins treasury bitcoin business finance" },
  { title: "Capital Markets Hub", label: "Markets", href: "capital-markets.html", summary: "Stocks, bonds, ETFs, credit, liquidity, primary and secondary markets, issuers, investors, market structure, and Bitcoin products.", terms: "capital markets stocks bonds etfs credit liquidity issuers investors market structure bitcoin products" },
  { title: "All Nakamoto Sections", label: "Map", href: "sections.html", summary: "A complete map of Nakamoto sections across Bitcoin, trading, investing, money, business, wealth, macro, policy, careers, tools, and sources.", terms: "sections map all sections site map bitcoin trading investing money entrepreneurship business wealth macro policy careers tools sources" },
  { title: "Nakamoto University", label: "Learning", href: "nakamoto-university.html", summary: "Structured learning paths for Bitcoin, trading, investing, money, entrepreneurship, macro, wealth, and careers.", terms: "nakamoto university learning paths course curriculum bitcoin trading investing money entrepreneurship macro wealth careers education" },
  { title: "Templates Library", label: "Templates", href: "templates-library.html", summary: "Checklists and templates for budget resets, trading journals, business validation, ETF research, mortgage readiness, custody, source review, and weekly planning.", terms: "templates library checklist budget reset trading journal business validation etf research mortgage readiness custody source review weekly planner" },
  { title: "Planning Calculators", label: "Tools", href: "planning-calculators.html", summary: "Educational calculators for business break-even, savings rate, mortgage pressure, compound growth, and emergency fund targets.", terms: "planning calculators business break even savings rate mortgage affordability compound growth emergency fund calculator wealth money property" },
  { title: "Mini Courses", label: "Courses", href: "mini-courses.html", summary: "Seven-day learning paths for money reset, Bitcoin safety, and business validation.", terms: "mini courses seven day course money reset bitcoin safety business validation learning path retention beginner" },
  { title: "7-Day Money Reset", label: "Course", href: "7-day-money-reset.html", summary: "Seven-day personal finance course for cash flow, bills, debt, emergency funds, subscriptions, savings rate, and weekly review.", terms: "7 day money reset personal finance budget bills debt emergency fund subscriptions savings rate weekly review course" },
  { title: "7-Day Bitcoin Safety", label: "Course", href: "7-day-bitcoin-safety.html", summary: "Seven-day Bitcoin safety course for wallets, seed phrases, exchange security, test transactions, scams, and custody planning.", terms: "7 day bitcoin safety wallet seed phrase exchange security test transaction scams custody planning course" },
  { title: "7-Day Business Validation", label: "Course", href: "7-day-business-validation.html", summary: "Seven-day entrepreneurship course for customer pain, interviews, offers, pricing, break-even, proof of demand, and next experiments.", terms: "7 day business validation entrepreneurship startup customer interviews offer pricing break even proof demand course" },
  { title: "Country Guides", label: "Countries", href: "country-guides.html", summary: "Country-specific routes for records, tax checks, investing, Bitcoin, property, business, and official sources.", terms: "country guides uk usa canada australia money tax investing bitcoin crypto property records official sources" },
  { title: "UK Money and Tax Guide", label: "UK", href: "uk-money-tax-guide.html", summary: "UK-first records, HMRC checks, investing account questions, Bitcoin and crypto records, property costs, and business paperwork.", terms: "uk money tax guide hmrc investing bitcoin crypto records property business fca gov uk" },
  { title: "USA Money and Tax Guide", label: "USA", href: "usa-money-tax-guide.html", summary: "USA-first records, IRS checks, investing account questions, digital asset records, property costs, and business paperwork.", terms: "usa money tax guide irs investing digital assets crypto records property business sec finra cfpb" },
  { title: "Canada Money and Tax Guide", label: "Canada", href: "canada-money-tax-guide.html", summary: "Canada-first records, CRA checks, investing account questions, crypto records, property costs, and business paperwork.", terms: "canada money tax guide cra investing crypto records property business bank of canada" },
  { title: "Australia Money and Tax Guide", label: "Australia", href: "australia-money-tax-guide.html", summary: "Australia-first records, ATO checks, investing, superannuation, crypto records, property costs, and business paperwork.", terms: "australia money tax guide ato investing superannuation crypto records property business asic moneysmart" },
  { title: "Growth Dashboard", label: "Growth", href: "growth-dashboard.html", summary: "Google and Microsoft review system for Search Console, GA4, Trends, PageSpeed, Bing Webmaster Tools, Clarity, and UET.", terms: "growth dashboard google search console ga4 google trends pagespeed lighthouse bing webmaster tools microsoft clarity Promotion uet analytics" },
  { title: "Daily Market Brief", label: "Daily", href: "daily-market-brief.html", summary: "Repeat-visit market route for Bitcoin, ETFs, stocks, rates, gold, oil, dollar strength, and risk.", terms: "daily market brief bitcoin etf stocks rates gold oil dollar strength market risk macro" },
  { title: "Economic Calendar", label: "Calendar", href: "economic-calendar.html", summary: "CPI, PCE, jobs, GDP, central banks, rates, bond auctions, and liquidity events.", terms: "economic calendar cpi pce jobs gdp central banks rates bond auctions liquidity macro events" },
  { title: "Crypto Regulation Tracker", label: "Policy", href: "crypto-regulation-tracker.html", summary: "Policy tracker for crypto rules, stablecoins, exchanges, ETFs, tax, custody, and enforcement.", terms: "crypto regulation tracker policy sec fca mica stablecoins exchanges etf tax custody enforcement rules" },
  { title: "Personal Finance Daily", label: "Money", href: "personal-finance-daily.html", summary: "Daily route for budgets, debt, savings, credit, mortgage pressure, tax records, and monthly review.", terms: "personal finance daily budget debt savings credit mortgage tax records monthly review money habits" },
  { title: "Real Estate and Mortgage Watch", label: "Property", href: "real-estate-mortgage-watch.html", summary: "Property route for rates, affordability, rent vs buy, deposits, maintenance, yields, and housing cycles.", terms: "real estate mortgage watch rates affordability rent buy deposit maintenance yield reit housing cycles" },
  { title: "Beginner Explainers", label: "Beginner", href: "beginner-explainers.html", summary: "Plain-English explainers for Bitcoin, money, investing, macro, business, tax, and property basics.", terms: "beginner explainers bitcoin money investing macro business tax property basics what is guide" },
  { title: "Scam and Safety Alerts", label: "Safety", href: "scam-safety-alerts.html", summary: "Safety hub for phishing, fake wallets, fake brokers, wallet drainers, recovery scams, and prevention.", terms: "scam safety alerts phishing fake wallets fake brokers wallet drainers recovery scams prevention fraud" },
  { title: "Broker and Platform Education", label: "Platforms", href: "broker-platform-education.html", summary: "Education-first broker and platform checks for fees, regulation, custody, records, and suitability.", terms: "broker platform education fees regulation custody records suitability trading investing apps brokers" },
  { title: "Exchange Education", label: "Exchange", href: "exchange-education.html", summary: "Crypto exchange education for spot, futures, fees, custody, withdrawals, records, and platform risk.", terms: "exchange education crypto spot futures fees custody withdrawals records leverage liquidation order types" },
  { title: "Funded Trading Education", label: "Trading", href: "funded-trading-education.html", summary: "Funded trading education for evaluation rules, drawdowns, payout conditions, fees, and risk.", terms: "funded trading education prop firm evaluation rules drawdown payout fees risk trading academy" },
  { title: "AI and Finance", label: "AI", href: "ai-finance.html", summary: "AI and finance route for automation, agents, investing tools, productivity, payments, and risk.", terms: "ai finance automation agents investing tools productivity payments risk ai stocks cybersecurity" },
  { title: "Interest Rates", label: "Rates", href: "interest-rates.html", summary: "Interest-rate hub for central banks, mortgages, savings, bonds, investing, Bitcoin, and risk appetite.", terms: "interest rates central banks mortgages savings bonds investing bitcoin risk appetite" },
  { title: "Inflation", label: "Inflation", href: "inflation.html", summary: "Inflation hub for CPI, PCE, wages, purchasing power, interest rates, Bitcoin, and household costs.", terms: "inflation cpi pce wages purchasing power rates bitcoin household costs macro" },
  { title: "Central Banks", label: "Macro", href: "central-banks.html", summary: "Central bank education for Fed, BOE, ECB, rates, inflation, liquidity, balance sheets, and currencies.", terms: "central banks fed boe ecb rates inflation liquidity balance sheets currencies cbdc" },
  { title: "Bonds and Yields", label: "Yields", href: "bonds-yields.html", summary: "Bond and yield education for yield curves, duration, real yields, credit risk, and valuation pressure.", terms: "bonds yields yield curve duration real yields credit risk valuation rates macro" },
  { title: "Stocks and ETFs", label: "Investing", href: "stocks-etfs.html", summary: "Stocks and ETFs hub for index funds, sectors, dividends, fees, valuation, risk, and portfolio policy.", terms: "stocks etfs index funds sectors dividends fees valuation risk portfolio investing" },
  { title: "Commodities", label: "Markets", href: "commodities.html", summary: "Commodities hub for gold, oil, energy, copper, food prices, inflation, and market cycles.", terms: "commodities gold oil energy copper food prices inflation market cycles supply demand" },
  { title: "Gold and Bitcoin", label: "Compare", href: "gold-bitcoin.html", summary: "Gold and Bitcoin comparison hub for scarcity, custody, liquidity, volatility, history, and portfolio role.", terms: "gold bitcoin comparison scarcity custody liquidity volatility history inflation portfolio" },
  { title: "Forex and Currencies", label: "FX", href: "forex-currencies.html", summary: "Currency education for dollar strength, exchange rates, central banks, inflation, trade, and capital flows.", terms: "forex currencies dollar strength exchange rates central banks inflation trade capital flows fx" },
  { title: "Stablecoins", label: "Stablecoins", href: "stablecoins.html", summary: "Stablecoin hub for USDT, USDC, reserves, attestations, redemption, depegs, payments, and regulation.", terms: "stablecoins usdt usdc reserves attestations redemption depegs payments regulation issuer risk" },
  { title: "Cybersecurity", label: "Security", href: "cybersecurity.html", summary: "Cybersecurity hub for wallet safety, phishing, fake apps, malware, exchange risk, AI fraud, and recovery scams.", terms: "cybersecurity wallet safety phishing fake apps malware exchange risk ai fraud recovery scams" },
  { title: "Space and Technology", label: "Technology", href: "space-technology.html", summary: "Space and technology hub for SpaceX, satellites, AI infrastructure, chips, energy, and private markets.", terms: "space technology spacex satellites ai infrastructure chips energy private markets tokenized access" },
  { title: "Income Growth", label: "Income", href: "income-growth.html", summary: "Income growth hub for skills, salary, freelancing, side hustles, business income, and wealth building.", terms: "income growth skills salary freelancing side hustles business income wealth career earning power" },
  { title: "Side Hustles", label: "Income", href: "side-hustles.html", summary: "Side hustle education for beginner income ideas, validation, time limits, pricing, cash flow, and records.", terms: "side hustles beginner income ideas validation pricing cash flow records tax small business" },
  { title: "Freelancing", label: "Income", href: "freelancing.html", summary: "Freelancing education for offers, pricing, outreach, delivery, client retention, invoices, and records.", terms: "freelancing offers pricing outreach clients proposals delivery invoices records income" },
  { title: "Small Business Guides", label: "Business", href: "small-business-guides.html", summary: "Small business guides for validation, pricing, cash flow, break-even, records, operations, and retention.", terms: "small business guides validation pricing cash flow break even records operations marketing retention" },
  { title: "Banks", label: "Institutions", href: "banks.html", summary: "Banks hub for deposits, lending, payments, interest margins, regulation, liquidity risk, and consumer protection.", terms: "banks deposits lending payments interest margins regulation liquidity risk consumer protection" },
  { title: "Brokerages", label: "Institutions", href: "brokerages.html", summary: "Brokerages hub for custody, fees, order routing, investor protection, records, ETFs, and trading access.", terms: "brokerages custody fees order routing investor protection records etfs trading access" },
  { title: "Asset Managers", label: "Institutions", href: "asset-managers.html", summary: "Asset managers hub for ETFs, funds, fees, custody, issuers, mandates, and Bitcoin products.", terms: "asset managers etfs funds fees custody issuers mandates bitcoin products investment companies" },
  { title: "Payment Companies", label: "Institutions", href: "payment-companies.html", summary: "Payment companies hub for cards, fintech, settlement, stablecoins, remittances, fees, and fraud.", terms: "payment companies cards fintech settlement stablecoins remittances fees fraud payments" },
  { title: "Insurance", label: "Institutions", href: "insurance.html", summary: "Insurance hub for protection planning, claims, premiums, deductibles, property, life, business, and risk transfer.", terms: "insurance protection planning claims premiums deductibles property life business risk transfer" },
  { title: "Pension Funds", label: "Institutions", href: "pension-funds.html", summary: "Pension funds hub for retirement accounts, long-term investing, asset allocation, fees, country rules, and records.", terms: "pension funds retirement accounts long term investing asset allocation fees country rules records" },
  { title: "Official Data Hub", label: "Sources", href: "official-data-hub.html", summary: "Official data hub for regulators, central banks, tax authorities, ETF issuers, economic data, and source-first research.", terms: "official data hub regulators central banks tax authorities etf issuers economic data sources" },
  { title: "Monthly Wealth Plan", label: "Wealth", href: "monthly-wealth-plan.html", summary: "Monthly wealth plan for budget review, savings, debt, investing, retirement, insurance, tax records, and learning goals.", terms: "monthly wealth plan budget savings debt investing retirement insurance tax records review" },
  { title: "Newsletter Daily Brief", label: "Brief", href: "newsletter-daily-brief.html", summary: "Daily brief hub for Bitcoin, markets, investing, personal finance, business, source checks, and return routes.", terms: "newsletter daily brief bitcoin markets investing personal finance business source checks return routes" },
  { title: "Common Mistakes Library", label: "Mistakes", href: "common-mistakes.html", summary: "Mistake prevention routes for Bitcoin, trading, investing, personal finance, entrepreneurship, real estate, productivity, and decision-making.", terms: "common mistakes library bitcoin trading investing personal finance entrepreneurship real estate productivity decision making prevention" },
  { title: "Nakamoto Case Studies", label: "Cases", href: "case-studies.html", summary: "Practical case studies for debt payoff, emergency funds, trading drawdowns, business validation, ETF choice, wallet safety, property affordability, and careers.", terms: "case studies debt payoff emergency fund trading drawdown business validation etf choice wallet safety property affordability careers examples" },
  { title: "Source Packs", label: "Sources", href: "source-packs.html", summary: "Official-source routes for Bitcoin, ETFs, stablecoins, tax, policy, macro, real estate, business, security, and markets.", terms: "source packs official sources bitcoin etf stablecoin tax policy macro real estate business security markets verification" },
  { title: "Weekly Review", label: "Review", href: "weekly-review.html", summary: "Weekly quality-control page for tracking section updates, content discovery, source discipline, templates, tools, and growth signals.", terms: "weekly review section updates quality control content discovery sources templates tools growth analytics checklist" },
  { title: "How to Validate a Business Idea", label: "Entrepreneurship", href: "business-idea-validation.html", summary: "Customer pain, proof of demand, MVPs, pricing, and next experiments before building too much.", terms: "business idea validation validate startup customer research market research mvp pricing waitlist deposits proof demand founder entrepreneurship" },
  { title: "Business Break-Even Explained", label: "Business", href: "business-break-even-explained.html", summary: "Fixed costs, variable costs, gross margin, contribution margin, sales targets, and cash-flow pressure.", terms: "business break even fixed costs variable costs gross margin contribution margin sales target cash flow runway pricing" },
  { title: "How Inflation Affects Bitcoin", label: "Macro", href: "inflation-bitcoin-explained.html", summary: "Purchasing power, rates, liquidity, risk appetite, dollar strength, ETF flows, and Bitcoin's inflation narrative.", terms: "inflation bitcoin cpi pce purchasing power liquidity dollar strength rates etf flows macro crypto" },
  { title: "Beginner Guide to Interest Rates", label: "Macro", href: "interest-rates-beginner-guide.html", summary: "Central banks, bond yields, savings, mortgages, business costs, investing, Bitcoin, and risk appetite.", terms: "interest rates beginner guide central banks bond yields mortgages savings investing bitcoin risk appetite real estate macro" },
  { title: "Budget Reset Checklist", label: "Money", href: "budget-reset-checklist.html", summary: "Income, bills, debt, emergency fund, subscriptions, irregular expenses, savings, and monthly money review.", terms: "budget reset checklist income bills debt emergency fund subscriptions savings monthly review personal finance money" },
  { title: "ETF Research Checklist", label: "Investing", href: "etf-research-checklist.html", summary: "Fees, liquidity, issuer, custody, holdings, overlap, tax, tracking, premium or discount, and portfolio role.", terms: "etf research checklist fees liquidity issuer custody holdings overlap tax tracking premium discount portfolio role investing" },
  { title: "Rent vs Buy Checklist", label: "Real Estate", href: "rent-vs-buy-checklist.html", summary: "Total housing cost, deposit, mortgage payments, rates, maintenance, taxes, mobility, opportunity cost, and risk.", terms: "rent vs buy checklist housing cost deposit mortgage rates maintenance property taxes mobility opportunity cost real estate" },
  { title: "Common Investing Mistakes", label: "Investing", href: "common-investing-mistakes.html", summary: "No plan, chasing performance, ignoring fees, overconcentration, panic selling, tax neglect, product confusion, and weak records.", terms: "common investing mistakes no plan chasing performance fees overconcentration panic selling tax records portfolio policy" },
  { title: "Decision Journal Template", label: "Psychology", href: "decision-journal-template.html", summary: "Thesis, alternatives, risks, emotions, evidence, and review date for investing, trading, business, money, and career decisions.", terms: "decision journal template thesis alternatives risks emotions evidence review date bias fomo investing trading business money career" },
  { title: "How to Build Earning Power", label: "Career", href: "earning-power-guide.html", summary: "Skills, proof of work, portfolio projects, CVs, interviews, negotiation, career switching, freelancing, and business income.", terms: "earning power career skills proof portfolio cv resume interviews negotiation career switching freelancing business income wealth" },
  { title: "Beginner Hub", label: "Start", href: "beginner-hub.html", summary: "A calm starting route for readers who feel lost and want to learn money, Bitcoin, investing, business, macro, and decisions in the right order.", terms: "beginner hub start here money bitcoin investing business macro decision making learning path first route" },
  { title: "Business Idea Validation Worksheet", label: "Worksheet", href: "business-idea-validation-worksheet.html", summary: "Printable-style worksheet for customer pain, current workaround, offer, price, proof of demand, and next experiment.", terms: "business idea validation worksheet customer pain workaround offer price proof demand experiment printable founder startup" },
  { title: "Budget Reset Worksheet", label: "Worksheet", href: "budget-reset-worksheet.html", summary: "Printable-style worksheet for income, bills, debt, subscriptions, savings, emergency fund, irregular costs, and monthly review.", terms: "budget reset worksheet income bills debt subscriptions savings emergency fund irregular costs monthly review money" },
  { title: "ETF Checklist Worksheet", label: "Worksheet", href: "etf-checklist-worksheet.html", summary: "Printable-style ETF worksheet for fees, issuer, holdings, liquidity, overlap, tax notes, tracking, and portfolio role.", terms: "etf checklist worksheet fees issuer holdings liquidity overlap tax tracking portfolio role investing printable" },
  { title: "Decision Journal Worksheet", label: "Worksheet", href: "decision-journal-worksheet.html", summary: "Printable-style decision worksheet for thesis, evidence, alternatives, risks, emotion, limits, review date, and process score.", terms: "decision journal worksheet thesis evidence alternatives risks emotion limits review process score bias fomo" },
  { title: "Inflation and Bitcoin FAQ", label: "FAQ", href: "inflation-bitcoin-faq.html", summary: "Short answers about inflation hedge narratives, rates, liquidity, dollar strength, ETF flows, and timeframe differences.", terms: "inflation bitcoin faq inflation hedge rates liquidity dollar strength etf flows timeframe macro crypto" },
  { title: "Interest Rates FAQ", label: "FAQ", href: "interest-rates-faq.html", summary: "Short answers about central banks, bond yields, mortgages, savings, investing, business borrowing, and Bitcoin risk appetite.", terms: "interest rates faq central banks bond yields mortgages savings investing business borrowing bitcoin risk appetite" },
  { title: "Rent vs Buy FAQ", label: "FAQ", href: "rent-vs-buy-faq.html", summary: "Short answers about total cost, deposit, mortgage pressure, maintenance, mobility, opportunity cost, and property risk.", terms: "rent vs buy faq total cost deposit mortgage pressure maintenance mobility opportunity cost property real estate" },
  { title: "ETF Research FAQ", label: "FAQ", href: "etf-research-faq.html", summary: "Short answers about expense ratios, liquidity, issuer risk, holdings, overlap, tracking, taxes, and portfolio role.", terms: "etf research faq expense ratio liquidity issuer risk holdings overlap tracking taxes portfolio role" },
  { title: "Business Validation FAQ", label: "FAQ", href: "business-validation-faq.html", summary: "Short answers about customer interviews, landing pages, MVPs, proof of demand, deposits, pricing, and when to build.", terms: "business validation faq customer interviews landing pages mvp proof demand deposits pricing build startup founder" },
  { title: "Business Income vs Job Income", label: "Compare", href: "business-vs-job-income.html", summary: "Comparison of stability, upside, risk, taxes, cash flow, skills, time, and wealth-building role.", terms: "business income vs job income stability upside risk taxes cash flow skills time wealth career entrepreneurship" },
  { title: "ETF vs Mutual Fund", label: "Compare", href: "etf-vs-mutual-fund.html", summary: "Comparison of trading, pricing, fees, liquidity, tax, minimums, transparency, and portfolio use.", terms: "etf vs mutual fund trading pricing fees liquidity tax minimums transparency portfolio investing" },
  { title: "Fixed vs Variable Mortgage", label: "Compare", href: "fixed-vs-variable-mortgage.html", summary: "Comparison of payment certainty, rate risk, refinancing, stress tests, flexibility, and household cash-flow pressure.", terms: "fixed vs variable mortgage payment certainty rate risk refinancing stress test flexibility household cash flow property" },
  { title: "Inflation vs Deflation", label: "Compare", href: "inflation-vs-deflation.html", summary: "Purchasing power, wages, debt, asset prices, central banks, Bitcoin narratives, and household planning.", terms: "inflation vs deflation purchasing power wages debt asset prices central banks bitcoin narratives household planning macro" },
  { title: "Saving vs Investing", label: "Compare", href: "saving-vs-investing.html", summary: "Emergency funds, time horizon, risk, inflation, liquidity, goals, and when cash matters more than returns.", terms: "saving vs investing emergency fund time horizon risk inflation liquidity goals cash returns personal finance wealth" },
  { title: "Business and Finance Glossary", label: "Glossary", href: "business-finance-glossary.html", summary: "Plain-English definitions for break-even, contribution margin, liquidity, discount rate, expense ratio, opportunity cost, decision journal, runway, and mortgage stress test.", terms: "business finance glossary break even contribution margin liquidity discount rate etf expense ratio opportunity cost decision journal runway mortgage stress test definitions" },
  { title: "MEXC Exchange Resource", label: "Exchange", href: "mexc-exchange-resource.html", summary: "MEXC referral destinations by use case with exchange-risk, custody, spot, futures, and card checks.", terms: "mexc exchange crypto exchange referral sign up spot btc usdt futures card leverage custody withdrawal fees kyc affiliate" },
  { title: "Tax and Accounting Roadmap", label: "Tax", href: "tax-accounting-roadmap.html", summary: "Official-source roadmap for crypto tax, investing tax, trading records, country pages, and accountant checklists.", terms: "tax accounting crypto tax capital gains trading records country tax uk usa canada australia official sources accountant checklist" },
  { title: "Tax and Accounting Hub", label: "Tax", href: "tax-accounting.html", summary: "Main hub for crypto tax, investing tax, trading records, official sources, and accountant questions.", terms: "tax accounting hub crypto tax bitcoin investing trading records capital gains official sources accountant questions" },
  { title: "UK Crypto Tax Guide", label: "UK Tax", href: "uk-crypto-tax-guide.html", summary: "HMRC-first UK crypto tax education for records, capital gains, income, wallet transfers, and accountant questions.", terms: "uk crypto tax hmrc cryptoassets capital gains income records accountant wallet transfers losses staking" },
  { title: "USA Digital Assets Tax Guide", label: "USA Tax", href: "usa-digital-assets-tax-guide.html", summary: "IRS-first US digital asset tax education for records, taxable event questions, capital gains, income, and losses.", terms: "usa us digital assets tax irs crypto records taxable events capital gains income losses accountant" },
  { title: "Crypto Tax Checklist", label: "Checklist", href: "crypto-tax-checklist.html", summary: "Collect exchange exports, wallet records, fees, income, disposals, losses, valuation evidence, and accountant questions.", terms: "crypto tax checklist records exchange wallet fees income staking mining losses disposals accountant" },
  { title: "Trading Record Keeping Guide", label: "Trading", href: "trading-record-keeping-guide.html", summary: "Broker, exchange, futures, forex, prop firm, P&L, fee, journal, and accountant record checklist.", terms: "trading records tax accounting broker exchange futures forex prop firm pnl journal fees" },
  { title: "Capital Gains Tax Basics", label: "Gains", href: "capital-gains-tax-basics.html", summary: "Plain-English capital gains vocabulary for disposals, proceeds, cost basis, gains, losses, and country rules.", terms: "capital gains tax basics disposals cost basis proceeds losses investing crypto" },
  { title: "Spot vs Futures Crypto Trading", label: "Compare", href: "spot-vs-futures-crypto-trading.html", summary: "Spot and futures explained through ownership, leverage, liquidation, funding, custody, tax records, and risk.", terms: "spot vs futures crypto trading leverage liquidation funding margin exchange risk tax records" },
  { title: "Daily Operations Master Checklist", label: "Ops", href: "daily-operations-master.html", summary: "The complete Nakamoto daily operating system for news, sections, SEO, analytics, design, affiliate checks, publisher Promotion quality, trust, verification, and sync discipline.", terms: "daily operations master checklist all tasks news sections seo analytics google microsoft design affiliate publisher Promotion trust verification sync gitlab" },
  { title: "Source Review September 13", label: "News", href: "news-2026-09-13.html", summary: "BLS August inflation, producer prices, jobs, SEC proposal, and Bitcoin Core source checks.", terms: "september 13 2026 source review cpi ppi jobs sec bitcoin" },
  { title: "Bitcoin Note September 13", label: "Blog", href: "bitcoin-blog-2026-09-13.html", summary: "Macro data are context, not a Bitcoin signal; verify demand and risk separately.", terms: "september 13 2026 bitcoin macro cpi risk blog" },
  { title: "Source Pack September 13", label: "Sources", href: "today-source-pack-2026-09-13.html", summary: "Original BLS, SEC, and Bitcoin Core sources.", terms: "september 13 2026 sources bls sec bitcoin core" },
  { title: "Daily Operations September 13", label: "Ops", href: "daily-operations-2026-09-13.html", summary: "September 13 catch-up operation and verification record.", terms: "september 13 2026 daily operations" },
  { title: "Daily Operations August 19", label: "Ops", href: "daily-operations-2026-08-19.html", summary: "August 19 missing-news catch-up covering Maya Protocol exploit, bitcoin near $64K, Solana risk rotation, CLARITY Act politics, Robinhood tokenized stocks, stablecoin accounting, SEC Reg Crypto, Wyoming stablecoin bridges, low Bitcoin volatility, Kraken equities expansion, bond-yield pressure, ETH ETF/staking developments, ETF positioning, tokenized derivatives, and the August catch-up route, source pack, core hubs, traffic-rally routes, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations august 19 missing news catch up maya exploit bitcoin solana clarity act robinhood tokenized stocks stablecoin fasb sec reg crypto layerzero kraken etf source pack sitemap feed archive verification" },
  { title: "Crypto News Today August 19", label: "News", href: "news-2026-08-19.html", summary: "August 19 source desk and August 3-19 catch-up covering Maya Protocol exploit, bitcoin near $64K, Solana risk rotation, CLARITY Act politics, Robinhood tokenized stocks, stablecoin accounting, SEC Reg Crypto, Wyoming stablecoin bridges, low Bitcoin volatility, Kraken equities expansion, bond-yield pressure, ETH ETF/staking developments, ETF positioning, tokenized derivatives, and the August catch-up route.", terms: "august 19 crypto news missing catch up maya bitcoin solana clarity robinhood tokenized stocks stablecoin fasb sec crypto kraken etf" },
  { title: "Bitcoin Blog August 19", label: "Blog", href: "bitcoin-blog-2026-08-19.html", summary: "August 19 Bitcoin editor note on catching up the missing August window honestly.", terms: "august 19 bitcoin blog missing news catch up maya volatility stablecoin policy etf" },
  { title: "Today Source Pack August 19", label: "Sources", href: "today-source-pack-2026-08-19.html", summary: "Source pack for CoinDesk, The Block, and internal reader routes.", terms: "august 19 source pack coindesk the block maya clarity fasb stablecoin sources" },
  { title: "Daily Operations August 2", label: "Ops", href: "daily-operations-2026-08-02.html", summary: "August 2 operation record covering Coldcard exploit escalation, bitcoin exchange-custody flows, Trump Media's bitcoin transfer, SEC Nasdaq bitcoin options review, $60K put hedging, choppy August market setup, reverse-bridge perps, invisible crypto payments, tokenized-stock concentration, stablecoin remittance costs, Tether reserve cushion, and AI security risk, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations august 2 coldcard bitcoin custody trump media sec nasdaq options perps payments tokenized stocks stablecoins tether ai security source pack sitemap feed archive verification" },
  { title: "Crypto News Today August 2", label: "News", href: "news-2026-08-02.html", summary: "August 2 source desk covering Coldcard exploit escalation, bitcoin exchange-custody flows, Trump Media's bitcoin transfer, SEC Nasdaq bitcoin options review, $60K put hedging, choppy August market setup, reverse-bridge perps, invisible crypto payments, tokenized-stock concentration, stablecoin remittance costs, Tether reserve cushion, and AI security risk.", terms: "august 2 crypto news coldcard custody trump media nasdaq options perps payments tokenized stocks stablecoins tether ai security" },
  { title: "Bitcoin Blog August 2", label: "Blog", href: "bitcoin-blog-2026-08-02.html", summary: "August 2 Bitcoin editor note on Coldcard custody risk, exchange flows, options jurisdiction, stablecoin evidence, and security discipline.", terms: "august 2 bitcoin blog coldcard custody exchange flows options stablecoin security discipline" },
  { title: "Today Source Pack August 2", label: "Sources", href: "today-source-pack-2026-08-02.html", summary: "Source pack for CoinDesk, The Block, and internal reader routes.", terms: "august 2 source pack coindesk the block coldcard options stablecoins sources" },
  { title: "Daily Operations July 19", label: "Ops", href: "daily-operations-2026-07-19.html", summary: "July 19 operation record covering USDT GENIUS countdown, Kraken BTC/ETH options, Bitcoin quantum recovery proofs, Zcash Zakura, France Polymarket block, DOG Mode relay policy, $72K call spreads, Brazil Pix/stablecoins, digital-wallet banking, DeFi idle liquidity, BTC/ETH market context, and Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 19 usdt genius kraken bitcoin options quantum zcash polymarket dog mode pix stablecoins defi source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 19", label: "News", href: "news-2026-07-19.html", summary: "July 19 source desk covering USDT GENIUS countdown, Kraken BTC/ETH options, Bitcoin quantum recovery proofs, Zcash Zakura, France Polymarket block, DOG Mode relay policy, $72K call spreads, Brazil Pix/stablecoins, digital-wallet banking, DeFi idle liquidity, BTC/ETH market context, and Bitcoin Core.", terms: "july 19 crypto news usdt genius kraken options quantum zcash polymarket dog mode pix stablecoins defi" },
  { title: "Bitcoin Blog July 19", label: "Blog", href: "bitcoin-blog-2026-07-19.html", summary: "July 19 Bitcoin editor note on options, quantum recovery, relay policy, stablecoin controls, and source discipline.", terms: "july 19 bitcoin blog options quantum dog mode stablecoin source discipline" },
  { title: "Today Source Pack July 19", label: "Sources", href: "today-source-pack-2026-07-19.html", summary: "Source pack for CoinDesk, The Block, Bitcoin Core, and internal reader routes.", terms: "july 19 source pack coindesk the block bitcoin core sources" },
  { title: "Daily Operations July 18", label: "Ops", href: "daily-operations-2026-07-18.html", summary: "July 18 operation record covering Bitcoin options range, T. Rowe Price active crypto ETF, Ledger AI-agent wallets, ETF rotation, stablecoin controls, x402, Galaxy vaults, FTX policy, CPI/PPI, and Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 18 bitcoin options t rowe price active crypto etf ledger ai agents tether ofac x402 galaxy sbf bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 18", label: "News", href: "news-2026-07-18.html", summary: "July 18 source desk covering Bitcoin options range, T. Rowe Price active crypto ETF, Ledger AI-agent wallets, ETF rotation, stablecoin controls, x402, Galaxy vaults, FTX policy, CPI/PPI, and Bitcoin Core.", terms: "july 18 crypto news bitcoin options active etf ledger ai agents tether ofac x402 galaxy sbf bitcoin core" },
  { title: "Bitcoin Blog July 18", label: "Blog", href: "bitcoin-blog-2026-07-18.html", summary: "July 18 Bitcoin editor note on weekend verification, options range, active ETF structure, AI wallet approvals, stablecoin controls, x402, and source discipline.", terms: "july 18 bitcoin blog options active etf ledger ai wallet stablecoin controls x402 source discipline" },
  { title: "Today Source Pack July 18", label: "Sources", href: "today-source-pack-2026-07-18.html", summary: "Source pack for CoinDesk, BLS, Bitcoin Core, and internal reader routes.", terms: "july 18 source pack coindesk bls bitcoin core sources" },
  { title: "Daily Operations July 16", label: "Ops", href: "daily-operations-2026-07-16.html", summary: "July 16 operation record covering Bitcoin $64K pullback, $65.5K monthly high, ether ETF inflows, $70K options ceiling, South Korea rate hike, dormant wallet movement, Tether/Uala, OFAC/Tether freeze, x402 AI payments, Galaxy vaults, FTX clemency, CPI/PPI, and Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 16 bitcoin ether etf options korea tether ofac x402 galaxy sbf bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 16", label: "News", href: "news-2026-07-16.html", summary: "July 16 source desk covering Bitcoin $64K pullback, $65.5K monthly high, ether ETF inflows, $70K options ceiling, South Korea rate hike, dormant wallet movement, Tether/Uala, OFAC/Tether freeze, x402 AI payments, Galaxy vaults, FTX clemency, CPI/PPI, and Bitcoin Core.", terms: "july 16 crypto news bitcoin 64000 ether etf options korea tether ofac x402 galaxy sbf bitcoin core" },
  { title: "Bitcoin Blog July 16", label: "Blog", href: "bitcoin-blog-2026-07-16.html", summary: "July 16 Bitcoin editor note on range discipline, ETF flow confirmation, options positioning, stablecoin controls, x402, sanctions, and wallet safety.", terms: "july 16 bitcoin blog range discipline etf flows options tether ofac x402 wallet safety" },
  { title: "Today Source Pack July 16", label: "Sources", href: "today-source-pack-2026-07-16.html", summary: "Source pack for CoinDesk, BLS, OFAC route, Bitcoin Core, and internal reader routes.", terms: "july 16 source pack coindesk bls ofac bitcoin core sources" },
  { title: "Daily Operations July 15", label: "Ops", href: "daily-operations-2026-07-15.html", summary: "July 15 operation record covering Bitcoin near $65K, CPI, PPI, ETF inflows, oil risk, RWA bonds, x402 payments, Japan policy, BlackRock, Strategy, Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 15 bitcoin cpi ppi etf inflows oil risk rwa digital gilt x402 japan blackrock strategy bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 15", label: "News", href: "news-2026-07-15.html", summary: "July 15 source desk covering Bitcoin near $65K, CPI/PPI relief, ETF inflows, oil risk, U.K. digital gilts, x402 payments, Japan policy, BlackRock, Strategy, and Bitcoin Core.", terms: "july 15 crypto news bitcoin 65000 cpi ppi etf inflows oil digital gilt x402 japan blackrock strategy bitcoin core" },
  { title: "Bitcoin Blog July 15", label: "Blog", href: "bitcoin-blog-2026-07-15.html", summary: "July 15 Bitcoin editor note on inflation relief discipline, ETF flow confirmation, oil risk, RWA bonds, x402, Japan policy, BlackRock AUM, and Strategy reserves.", terms: "july 15 bitcoin blog inflation cpi ppi etf flows oil rwa x402 japan blackrock strategy" },
  { title: "Today Source Pack July 15", label: "Sources", href: "today-source-pack-2026-07-15.html", summary: "Source pack for CoinDesk, BLS, Bitcoin Core, and internal reader routes.", terms: "july 15 source pack coindesk bls bitcoin core sources" },
  { title: "Daily Operations July 14", label: "Ops", href: "daily-operations-2026-07-14.html", summary: "July 14 operation record covering Bitcoin near $62.6K, CPI, Warsh testimony, Iran oil risk, government wallet movement, mining, stablecoins, policy, Strategy, Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 14 bitcoin cpi warsh iran oil government wallet mining stablecoins circle clarity act strategy bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 14", label: "News", href: "news-2026-07-14.html", summary: "July 14 source desk covering Bitcoin near $62.6K, CPI, Warsh testimony, Iran/oil risk, government wallet movement, mining, stablecoins, policy, Strategy, and Bitcoin Core.", terms: "july 14 crypto news bitcoin 62600 cpi warsh iran oil government wallet mining stablecoins policy strategy bitcoin core" },
  { title: "Bitcoin Blog July 14", label: "Blog", href: "bitcoin-blog-2026-07-14.html", summary: "July 14 Bitcoin editor note on source-clock discipline, CPI, Warsh testimony, custody movement, mining luck, stablecoin competition, and treasury process.", terms: "july 14 bitcoin blog cpi warsh custody mining stablecoin competition treasury discipline" },
  { title: "Today Source Pack July 14", label: "Sources", href: "today-source-pack-2026-07-14.html", summary: "Source pack for CoinDesk, BLS, Federal Reserve, House Financial Services, Senate Banking, Circle, Bitcoin Core, and internal reader routes.", terms: "july 14 source pack coindesk bls federal reserve house senate circle bitcoin core sources" },
  { title: "Daily Operations July 13", label: "Ops", href: "daily-operations-2026-07-13.html", summary: "July 13 operation record covering U.S.-Iran risk, Bitcoin near $63K, ETF demand, Circle stablecoin infrastructure, Fed, CPI, PPI, PCE, SEC, CFTC, Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 13 bitcoin iran etf demand circle stablecoin fed cpi ppi pce sec cftc bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 13", label: "News", href: "news-2026-07-13.html", summary: "July 13 source desk covering U.S.-Iran risk, Bitcoin near $63K, ETF demand, Circle stablecoin infrastructure, Fed, CPI, PPI, SEC, CFTC, and Bitcoin Core.", terms: "july 13 crypto news bitcoin 63000 iran etf demand circle stablecoin fed cpi ppi sec cftc bitcoin core" },
  { title: "Bitcoin Blog July 13", label: "Blog", href: "bitcoin-blog-2026-07-13.html", summary: "July 13 Bitcoin editor note on risk-off discipline, ETF flows, inflation calendars, policy routes, stablecoin infrastructure, and risk process.", terms: "july 13 bitcoin blog risk off discipline etf demand stablecoin infrastructure cpi ppi policy risk" },
  { title: "Today Source Pack July 13", label: "Sources", href: "today-source-pack-2026-07-13.html", summary: "Source pack for CoinDesk, Economic Times, Circle, AP, Federal Reserve, BLS, BEA, SEC, CFTC, Bitcoin Core, and internal reader routes.", terms: "july 13 source pack coindesk economic times circle ap federal reserve bls bea sec cftc bitcoin core sources" },
  { title: "Daily Operations July 12", label: "Ops", href: "daily-operations-2026-07-12.html", summary: "July 12 operation record covering Sunday source review, Bitcoin near $64K, ETF outflows, Circle stablecoin infrastructure, Fed, CPI, PPI, PCE, SEC, CFTC, Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 12 sunday bitcoin etf outflows circle stablecoin fed cpi ppi pce sec cftc bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 12", label: "News", href: "news-2026-07-12.html", summary: "July 12 source desk covering Bitcoin near $64K, ETF outflows, Circle stablecoin infrastructure, Fed, CPI, PPI, SEC, CFTC, and Bitcoin Core.", terms: "july 12 crypto news bitcoin 64000 etf outflows circle stablecoin fed cpi ppi sec cftc bitcoin core" },
  { title: "Bitcoin Blog July 12", label: "Blog", href: "bitcoin-blog-2026-07-12.html", summary: "July 12 Bitcoin editor note on Sunday source discipline, ETF flows, stablecoin infrastructure, inflation calendars, policy routes, and risk process.", terms: "july 12 bitcoin blog sunday discipline etf outflows stablecoin infrastructure cpi ppi policy risk" },
  { title: "Today Source Pack July 12", label: "Sources", href: "today-source-pack-2026-07-12.html", summary: "Source pack for Economic Times, CoinDesk, Circle, AP, Federal Reserve, BLS, BEA, SEC, CFTC, Bitcoin Core, and internal reader routes.", terms: "july 12 source pack economic times coindesk circle ap federal reserve bls bea sec cftc bitcoin core sources" },
  { title: "Daily Operations July 11", label: "Ops", href: "daily-operations-2026-07-11.html", summary: "July 11 operation record covering Bitcoin near $64K, ETF outflows, Circle stablecoin infrastructure, Fed, CPI, PPI, PCE, SEC, CFTC, Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 11 bitcoin etf outflows circle stablecoin fed cpi ppi pce sec cftc bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 11", label: "News", href: "news-2026-07-11.html", summary: "July 11 source desk covering Bitcoin near $64K, ETF outflows, Circle stablecoin infrastructure, Fed, CPI, PPI, SEC, CFTC, and Bitcoin Core.", terms: "july 11 crypto news bitcoin 64000 etf outflows circle stablecoin fed cpi ppi sec cftc bitcoin core" },
  { title: "Bitcoin Blog July 11", label: "Blog", href: "bitcoin-blog-2026-07-11.html", summary: "July 11 Bitcoin editor note on weekend price discipline, ETF flows, stablecoin infrastructure, inflation calendars, policy routes, and risk process.", terms: "july 11 bitcoin blog weekend discipline etf outflows stablecoin infrastructure cpi ppi policy risk" },
  { title: "Today Source Pack July 11", label: "Sources", href: "today-source-pack-2026-07-11.html", summary: "Source pack for Economic Times, CoinDesk, Circle, AP, Federal Reserve, BLS, BEA, SEC, CFTC, Bitcoin Core, and internal reader routes.", terms: "july 11 source pack economic times coindesk circle ap federal reserve bls bea sec cftc bitcoin core sources" },
  { title: "Daily Operations July 10", label: "Ops", href: "daily-operations-2026-07-10.html", summary: "July 10 operation record covering Bitcoin above $63K, ETF outflows, options expiry, Circle stablecoin infrastructure, Fed, CPI, PPI, PCE, SEC, CFTC, Bitcoin Core, source pack, core hubs, desks, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 10 bitcoin etf outflows options expiry circle stablecoin occ fed cpi ppi pce sec cftc bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 10", label: "News", href: "news-2026-07-10.html", summary: "July 10 source desk covering Bitcoin above $63K, ETF outflows, options expiry, Circle/OCC stablecoin infrastructure, Fed, CPI, PPI, SEC, CFTC, and Bitcoin Core.", terms: "july 10 crypto news bitcoin 63000 etf outflows options expiry circle occ stablecoin fed cpi ppi sec cftc bitcoin core" },
  { title: "Bitcoin Blog July 10", label: "Blog", href: "bitcoin-blog-2026-07-10.html", summary: "July 10 Bitcoin editor note on price discipline, ETF flows, options expiry, stablecoin infrastructure, inflation calendars, policy routes, and risk process.", terms: "july 10 bitcoin blog flow discipline etf outflows options expiry stablecoin infrastructure cpi ppi policy risk" },
  { title: "Today Source Pack July 10", label: "Sources", href: "today-source-pack-2026-07-10.html", summary: "Source pack for Economic Times, CoinDesk, Barron's, WSJ, AP, Federal Reserve, BLS, BEA, SEC, CFTC, Bitcoin Core, and internal reader routes.", terms: "july 10 source pack economic times coindesk barrons wsj ap federal reserve bls bea sec cftc bitcoin core sources" },
  { title: "Daily Operations July 9", label: "Ops", href: "daily-operations-2026-07-09.html", summary: "July 9 operation record covering Bitcoin, Fed minutes, Iran risk, ETF inflows, SEC activity, Lightning, Bitcoin Core, source pack, core hubs, sitemap, feed, archive, indexing queue, and verification.", terms: "daily operations july 9 bitcoin fed minutes iran etf inflows sec lightning bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 9", label: "News", href: "news-2026-07-09.html", summary: "July 9 source desk covering Bitcoin stabilization, Fed minutes, Iran risk, ETF inflows, SEC activity, Lightning, and Bitcoin Core.", terms: "july 9 crypto news bitcoin fed minutes iran risk etf inflows sec lightning bitcoin core" },
  { title: "Bitcoin Blog July 9", label: "Blog", href: "bitcoin-blog-2026-07-09.html", summary: "July 9 Bitcoin editor note on source discipline, Fed minutes, Iran uncertainty, ETF demand, SEC product activity, Lightning, Bitcoin Core, and risk process.", terms: "july 9 bitcoin blog source discipline fed minutes iran etf demand sec lightning bitcoin core" },
  { title: "Today Source Pack July 9", label: "Sources", href: "today-source-pack-2026-07-09.html", summary: "Source pack for Barron's, AP, Economic Times, CoinDesk, Federal Reserve, SEC, Bitcoin Foundation, Bitcoin Core, and ETF flow routes.", terms: "july 9 source pack barrons ap economic times coindesk federal reserve sec bitcoin foundation bitcoin core sources" },
  { title: "Daily Operations July 8", label: "Ops", href: "daily-operations-2026-07-08.html", summary: "July 8 operation record covering Bitcoin, U.S.-Iran risk, ETF inflows, Fed timing, regulation, Lightning, Bitcoin Core, source pack, search, feed, sitemap, archive, and verification.", terms: "daily operations july 8 bitcoin iran etf inflows fed regulation lightning bitcoin core source pack sitemap feed archive verification" },
  { title: "Crypto News Today July 8", label: "News", href: "news-2026-07-08.html", summary: "July 8 source desk covering Bitcoin pressure, U.S.-Iran risk, ETF inflows, Fed timing, Indian regulation, SEC ETF activity, Lightning, and Bitcoin Core.", terms: "july 8 crypto news bitcoin iran risk etf inflows fed india regulation sec etf lightning bitcoin core" },
  { title: "Bitcoin Blog July 8", label: "Blog", href: "bitcoin-blog-2026-07-08.html", summary: "July 8 Bitcoin editor note on risk-off discipline, ETF demand, Fed timing, regulation, Lightning, Bitcoin Core, and source-first publishing.", terms: "july 8 bitcoin blog risk off discipline etf demand fed regulation lightning bitcoin core source first" },
  { title: "Today Source Pack July 8", label: "Sources", href: "today-source-pack-2026-07-08.html", summary: "Source pack for Barron's, Investopedia, CoinDesk, Federal Reserve, SEC, Bitcoin Foundation, Bitcoin Core, and internal reader routes.", terms: "july 8 source pack barrons investopedia coindesk federal reserve sec bitcoin foundation bitcoin core sources" },
  { title: "Daily Operations July 7", label: "Ops", href: "daily-operations-2026-07-07.html", summary: "July 7 operation record covering SpaceX Transporter-17, FCA crypto gateway timing, Bank/FCA stablecoins, SEC ETF consultation, CFTC derivatives, Fed timing, BEA PCE, BLS jobs, NASA events, search, feed, sitemap, archive, and verification.", terms: "daily operations july 7 spacex transporter 17 fca crypto gateway bank england stablecoin sec etf cftc derivatives fed bea pce bls nasa" },
  { title: "Crypto News Today July 7", label: "News", href: "news-2026-07-07.html", summary: "July 7 source desk covering SpaceX Transporter-17, FCA crypto gateway timing, Bank/FCA stablecoins, SEC ETF consultation, CFTC derivatives, Fed timing, BEA PCE, BLS jobs, NASA events, and reader routes.", terms: "july 7 crypto news spacex transporter 17 fca gateway bank england stablecoin sec etf cftc derivatives fed bea bls nasa" },
  { title: "Bitcoin Blog July 7", label: "Blog", href: "bitcoin-blog-2026-07-07.html", summary: "July 7 Bitcoin editor note on gateway discipline, product wrappers, calendars, stablecoin supervision, derivatives, space infrastructure, and household risk capacity.", terms: "july 7 bitcoin blog gateway discipline product wrappers calendars stablecoins derivatives space infrastructure household risk capacity" },
  { title: "Today Source Pack July 7", label: "Sources", href: "today-source-pack-2026-07-07.html", summary: "Source pack for SpaceX Transporter-17, FCA gateway, Bank/FCA stablecoins, SEC ETF consultation, CFTC derivatives, Fed, BEA, BLS, NASA, and internal reader routes.", terms: "july 7 source pack spacex transporter fca gateway bank england stablecoin sec etf cftc fed bea bls nasa sources" },
  { title: "Daily Operations July 6", label: "Ops", href: "daily-operations-2026-07-06.html", summary: "July 6 operation record covering source review, blog, source pack, four core sections, supporting sections, Google/Microsoft growth review, search, feed, sitemap, archive, and verification.", terms: "daily operations july 6 fca crypto authorisation bank england stablecoin sec etf cftc derivatives fed inflation bls bea nasa spacex google microsoft" },
  { title: "Crypto News Today July 6", label: "News", href: "news-2026-07-06.html", summary: "July 6 source desk covering FCA crypto authorisation, Bank of England stablecoins, SEC ETF consultation, CFTC derivatives, Fed timing, inflation nowcasts, BLS jobs, BEA PCE, NASA/SpaceX infrastructure, and reader routes.", terms: "july 6 crypto news fca authorisation bank england stablecoin sec etf cftc derivatives fed inflation bls bea nasa spacex" },
  { title: "Bitcoin Blog July 6", label: "Blog", href: "bitcoin-blog-2026-07-06.html", summary: "July 6 Bitcoin editor note on rulebook risk, product wrappers, calendars, stablecoin supervision, derivatives, and household risk capacity.", terms: "july 6 bitcoin blog rulebook risk product wrappers calendars stablecoins derivatives household risk capacity" },
  { title: "Today Source Pack July 6", label: "Sources", href: "today-source-pack-2026-07-06.html", summary: "Source pack for FCA crypto rules, Bank of England stablecoins, SEC ETF consultation, CFTC derivatives, Fed, Cleveland Fed, BLS, BEA, NASA, SpaceX, and internal reader routes.", terms: "july 6 source pack fca crypto bank england stablecoin sec etf cftc fed cleveland bls bea nasa spacex sources" },
  { title: "Daily Operations July 5", label: "Ops", href: "daily-operations-2026-07-05.html", summary: "July 5 operation record covering Sunday source review, blog, source pack, four core sections, supporting sections, Google/Microsoft growth review, search, feed, sitemap, archive, and verification.", terms: "daily operations july 5 sunday source review fca crypto rules bank england stablecoin sec etf cftc bitcoin etf flows bls bea fed nasa spacex google microsoft" },
  { title: "Crypto News Today July 5", label: "News", href: "news-2026-07-05.html", summary: "July 5 Sunday source desk covering FCA crypto rules, Bank of England stablecoin supervision, SEC ETF consultation, CFTC market structure, Bitcoin ETF flows, BLS jobs, BEA PCE, Fed timing, Bank of England events, NASA/SpaceX infrastructure, and reader routes.", terms: "july 5 crypto news fca crypto rules bank england stablecoin sec etf cftc market structure bitcoin etf flows bls jobs bea pce fed bank england events nasa spacex" },
  { title: "Bitcoin Blog July 5", label: "Blog", href: "bitcoin-blog-2026-07-05.html", summary: "July 5 Bitcoin editor note on source discipline, rulebook risk, product wrappers, calendars, stablecoin supervision, ETF flows, and household risk capacity.", terms: "july 5 bitcoin blog source discipline rulebook risk product wrappers calendars stablecoins etf flows household risk capacity" },
  { title: "Today Source Pack July 5", label: "Sources", href: "today-source-pack-2026-07-05.html", summary: "Source pack for FCA crypto rules, Bank of England stablecoins, SEC ETF consultation, CFTC market structure, CoinGlass ETF flows, BLS, BEA, Fed, NASA, SpaceX, and internal reader routes.", terms: "july 5 source pack fca crypto bank england stablecoin sec etf cftc coinglass bitcoin etf bls bea fed nasa spacex sources" },
  { title: "Daily Operations July 4", label: "Ops", href: "daily-operations-2026-07-04.html", summary: "July 4 operation record covering fresh daily news, blog, source pack, four core sections, supporting sections, search, feed, sitemap, archive, and verification.", terms: "daily operations july 4 bls jobs bea pce inflation fca crypto regime bank england stablecoin rules bitcoin etf flows fed sec cftc nasa spacex source pack search feed sitemap full sections" },
  { title: "Crypto News Today July 4", label: "News", href: "news-2026-07-04.html", summary: "July 4 source desk covering BLS jobs data, BEA PCE/inflation pressure, FCA crypto regime, Bank of England stablecoin rules, Bitcoin ETF flows, Fed timing, SEC ETF consultation, CFTC futures rules, NASA/SpaceX infrastructure, and reader routes.", terms: "july 4 crypto news bls jobs bea pce inflation fca crypto regime bank england stablecoin rules bitcoin etf flows fed calendar sec etf cftc futures nasa spacex risk management" },
  { title: "Bitcoin Blog July 4", label: "Blog", href: "bitcoin-blog-2026-07-04.html", summary: "July 4 Bitcoin editor note on jobs data, inflation pressure, rulebook risk, regulation, stablecoins, ETF wrappers, futures rules, custody, and household risk capacity.", terms: "july 4 bitcoin blog jobs inflation rulebook risk regulation stablecoins etf wrappers futures custody household risk capacity" },
  { title: "Today Source Pack July 4", label: "Sources", href: "today-source-pack-2026-07-04.html", summary: "Source pack for BLS jobs data, BEA PCE, FCA crypto regime, Bank of England stablecoins, CoinGlass ETF flows, Fed calendar, SEC, CFTC, NASA, SpaceX, and internal reader routes.", terms: "july 4 source pack bls jobs bea pce fca crypto regime bank england stablecoin coinglass bitcoin etf fed sec cftc nasa spacex sources" },
  { title: "Daily Operations July 3", label: "Ops", href: "daily-operations-2026-07-03.html", summary: "July 3 operation record covering fresh daily news, blog, source pack, four core sections, supporting sections, search, feed, sitemap, archive, and verification.", terms: "daily operations july 3 fca crypto regime bank england stablecoin rules bitcoin etf flows fed inflation nowcast sec cftc nasa spacex source pack search feed sitemap full sections" },
  { title: "Crypto News Today July 3", label: "News", href: "news-2026-07-03.html", summary: "July 3 source desk covering FCA crypto regime, Bank of England stablecoin rules, Bitcoin ETF flows, Fed timing, inflation nowcasts, SEC ETF consultation, CFTC futures rules, NASA/SpaceX infrastructure, and reader routes.", terms: "july 3 crypto news fca crypto regime bank england stablecoin rules bitcoin etf flows fed calendar cleveland fed inflation nowcasting sec etf cftc futures nasa spacex risk management" },
  { title: "Bitcoin Blog July 3", label: "Blog", href: "bitcoin-blog-2026-07-03.html", summary: "July 3 Bitcoin editor note on rulebook risk, regulation, stablecoins, ETF wrappers, inflation timing, futures rules, custody, and household risk capacity.", terms: "july 3 bitcoin blog rulebook risk regulation stablecoins etf wrappers inflation timing futures custody household risk capacity" },
  { title: "Today Source Pack July 3", label: "Sources", href: "today-source-pack-2026-07-03.html", summary: "Source pack for FCA crypto regime, Bank of England stablecoins, CoinGlass ETF flows, Fed calendar, Cleveland Fed nowcasts, SEC, CFTC, NASA, SpaceX, and internal reader routes.", terms: "july 3 source pack fca crypto regime bank england stablecoin coinglass bitcoin etf fed cleveland inflation nowcasting sec cftc nasa spacex sources" },
  { title: "Daily Operations July 2", label: "Ops", href: "daily-operations-2026-07-02.html", summary: "July 2 operation record covering fresh daily news, blog, source pack, four core sections, supporting sections, search, feed, sitemap, archive, and verification.", terms: "daily operations july 2 fca crypto rules stablecoin supervision etf flows pce fed treasury nasa spacex source pack search feed sitemap full sections" },
  { title: "Crypto News Today July 2", label: "News", href: "news-2026-07-02.html", summary: "July 2 source desk covering FCA crypto rules, stablecoin supervision, ETF-flow pressure, PCE inflation, Fed calendar, Treasury stablecoin AML rules, NASA/SpaceX infrastructure, and reader routes.", terms: "july 2 crypto news fca crypto rules stablecoin supervision etf flows pce inflation fed calendar treasury stablecoin aml nasa spacex risk management" },
  { title: "Bitcoin Blog July 2", label: "Blog", href: "bitcoin-blog-2026-07-02.html", summary: "July 2 Bitcoin editor note on ETF outflows, wrappers, custody, regulation, stablecoins, inflation, and personal risk capacity.", terms: "july 2 bitcoin blog wrapper risk etf outflows custody regulation stablecoins inflation personal risk capacity" },
  { title: "Today Source Pack July 2", label: "Sources", href: "today-source-pack-2026-07-02.html", summary: "Source pack for FCA crypto rules, Bank of England/FCA stablecoins, CoinGlass ETF flows, BEA PCE, Fed calendar, Treasury stablecoin AML rules, NASA, and internal reader routes.", terms: "july 2 source pack fca crypto rules bank england fca stablecoin coinglass bitcoin etf bea pce fed treasury nasa spacex sources" },
  { title: "Daily Operations July 1", label: "Ops", href: "daily-operations-2026-07-01.html", summary: "July 1 operation record covering fresh daily news, blog, source pack, four priority hubs, homepage routing, search, feed, sitemap, archive, and verification.", terms: "daily operations july 1 uk crypto regulation stablecoin policy bitcoin market structure strategy macro calendar source pack search feed sitemap four sections" },
  { title: "Crypto News Today July 1", label: "News", href: "news-2026-07-01.html", summary: "July 1 source desk covering UK crypto regulation, stablecoin policy, Bitcoin market structure, Strategy treasury risk, macro calendars, space infrastructure, and reader routes.", terms: "july 1 crypto news uk crypto regulation stablecoin policy bitcoin market structure strategy treasury risk macro calendar space infrastructure risk management" },
  { title: "Bitcoin Blog July 1", label: "Blog", href: "bitcoin-blog-2026-07-01.html", summary: "July 1 Bitcoin editor note on source discipline, regulation, stablecoins, treasury wrappers, macro calendars, custody, and personal risk capacity.", terms: "july 1 bitcoin blog source discipline regulation stablecoins treasury wrappers macro calendar custody personal risk capacity" },
  { title: "Today Source Pack July 1", label: "Sources", href: "today-source-pack-2026-07-01.html", summary: "Source pack for FCA crypto regulation, Bank of England stablecoin policy, Strategy, Fed calendar, BEA PCE, NASA, and internal reader routes.", terms: "july 1 source pack fca crypto regulation bank of england stablecoin strategy fed bea pce nasa sources" },
  { title: "Daily Operations June 30", label: "Ops", href: "daily-operations-2026-06-30.html", summary: "June 30 operation record covering fresh daily news, blog, source pack, four priority hubs, search, feed, sitemap, archive, and verification.", terms: "daily operations june 30 fca crypto rules bitcoin below 60000 strategy pce fed stablecoin nasa source pack search feed sitemap four sections" },
  { title: "Crypto News Today June 30", label: "News", href: "news-2026-06-30.html", summary: "June 30 source desk covering FCA crypto rules, Bitcoin below $60K, Strategy capital framework, PCE and Fed context, stablecoin policy, NASA spacewalk, and reader routes.", terms: "june 30 crypto news fca crypto rules bitcoin below 60000 strategy capital framework pce fed stablecoin nasa spacewalk risk management" },
  { title: "Bitcoin Blog June 30", label: "Blog", href: "bitcoin-blog-2026-06-30.html", summary: "June 30 Bitcoin editor note on price stress, Strategy capital framework, custody, wrappers, liquidity, and risk structure.", terms: "june 30 bitcoin blog risk structure strategy bitcoin below 60000 custody treasury wrappers liquidity regulation" },
  { title: "Today Source Pack June 30", label: "Sources", href: "today-source-pack-2026-06-30.html", summary: "Source pack for FCA crypto rules, Bitcoin below $60K, Strategy capital framework, PCE, Fed calendar, stablecoin policy, and NASA spacewalk.", terms: "june 30 source pack fca bitcoin strategy pce fed stablecoin nasa spacewalk sources" },
  { title: "Daily Operations June 29", label: "Ops", href: "daily-operations-2026-06-29.html", summary: "June 29 operation record covering fresh daily news, blog, source pack, four priority hubs, search, feed, sitemap, archive, and verification.", terms: "daily operations june 29 bitcoin etf pce fed spacex roman source pack search feed sitemap four sections" },
  { title: "Crypto News Today June 29", label: "News", href: "news-2026-06-29.html", summary: "June 29 source desk covering Bitcoin drawdown context, ETF outflows, PCE inflation, Fed calendar risk, SpaceX Starfall, Roman telescope, and reader routes.", terms: "june 29 crypto news bitcoin drawdown etf outflows pce inflation fed calendar spacex starfall roman telescope risk management" },
  { title: "Bitcoin Blog June 29", label: "Blog", href: "bitcoin-blog-2026-06-29.html", summary: "June 29 Bitcoin editor note on source checks, risk rules, ETF outflows, PCE inflation, and calmer reader routes.", terms: "june 29 bitcoin blog source checks risk rules etf outflows pce inflation fed bitcoin drawdown" },
  { title: "Today Source Pack June 29", label: "Sources", href: "today-source-pack-2026-06-29.html", summary: "Source pack for Bitcoin drawdown context, ETF outflows, PCE, Fed calendar, SpaceX Starfall, Roman telescope, and priority routes.", terms: "june 29 source pack bitcoin etf outflows pce fed spacex starfall roman telescope risk sources" },
  { title: "Daily Operations June 28", label: "Ops", href: "daily-operations-2026-06-28.html", summary: "June 28 operation record covering fresh daily news, blog, source pack, Research Foundation, premium bundle, search, feed, sitemap, and verification.", terms: "daily operations june 28 research foundation premium news blog source pack search feed sitemap verification four sections" },
  { title: "Crypto News Today June 28", label: "News", href: "news-2026-06-28.html", summary: "June 28 source desk covering Bitcoin drawdown context, ETF flows, SpaceX Starfall, Roman telescope, data, statistics, risk, and research routes.", terms: "june 28 crypto news bitcoin drawdown etf flows spacex starfall roman telescope data analytics statistics risk management research methods" },
  { title: "Bitcoin Blog June 28", label: "Blog", href: "bitcoin-blog-2026-06-28.html", summary: "June 28 Bitcoin editor note on source discipline, risk, data, statistics, and research methods.", terms: "june 28 bitcoin blog source discipline risk data statistics research methods etf flows bitcoin drawdown" },
  { title: "Today Source Pack June 28", label: "Sources", href: "today-source-pack-2026-06-28.html", summary: "Source pack for Bitcoin drawdown context, ETF flows, SpaceX Starfall, Roman telescope, and Research Foundation routes.", terms: "june 28 source pack bitcoin etf flows spacex starfall roman telescope research foundation data statistics risk sources" },
  { title: "Daily Operations June 27", label: "Ops", href: "daily-operations-2026-06-27.html", summary: "June 27 operation record covering four-section quality, reader growth, MEXC resource routing, tax roadmap, search, and sitemap.", terms: "daily operations june 27 tax roadmap mexc exchange reader growth four sections sitemap verification" },
  { title: "Crypto News Today June 27", label: "News", href: "news-2026-06-27.html", summary: "June 27 source-checked news desk covering Bitcoin drawdown, ETF outflows, AI rotation, SpaceX Starfall, Roman telescope, and reader routes.", terms: "june 27 crypto news bitcoin drawdown etf outflows ai rotation spacex starfall roman telescope space investing money trading custody" },
  { title: "Bitcoin Blog June 27", label: "Blog", href: "bitcoin-blog-2026-06-27.html", summary: "June 27 Bitcoin editor note framing the drawdown as a systems test for risk, flows, cash buffers, and custody.", terms: "june 27 bitcoin blog drawdown etf flows cash buffer custody risk trading investing money" },
  { title: "Today Source Pack June 27", label: "Sources", href: "today-source-pack-2026-06-27.html", summary: "Source pack for Bitcoin drawdown, ETF outflows, SpaceX Starfall, Roman telescope, and internal reader routes.", terms: "june 27 source pack bitcoin etf outflows spacex starfall roman telescope sources" },
  { title: "Crypto News Today", label: "News", href: "crypto-news-today.html", summary: "Daily verified brief covering Bitcoin, ETF flows, mining, policy, markets, x402 security, and RWA.", terms: "news today latest bitcoin crypto ethereum solana xrp mining difficulty spacex policy stablecoin etf flows daily brief x402 ai payments" },
  { title: "Daily Crypto News Archive", label: "Archive", href: "news-archive.html", summary: "Browse preserved daily briefs by date and compare how stories changed over time.", terms: "archive old news previous daily history june 15 june 14 june 13 crypto news date" },
  { title: "Nakamoto News Desks", label: "Desks", href: "news-desks.html", summary: "Priority desks for Bitcoin, ETF, Economy, Finance, Security, Stablecoins, RWA, and Policy plus the full editorial category map.", terms: "news desks categories editorial bitcoin etf economy finance security stablecoins rwa policy markets technology ai startups companies economics investing energy space cybersecurity publication" },
  { title: "Bitcoin News Desk", label: "Bitcoin", href: "news-bitcoin.html", summary: "Bitcoin price context, ETF demand, mining, custody, treasury adoption, macro liquidity, and network security.", terms: "bitcoin news desk btc price etf demand mining custody treasury adoption macro liquidity network security hashrate wallet self custody" },
  { title: "Bitcoin ETF News Desk", label: "ETF", href: "news-etf.html", summary: "ETF flows, issuers, fees, custody, SEC filings, market impact, and fund structure.", terms: "bitcoin etf news desk spot etf flows issuer fees custody sec filings fund structure premium discount ibit fbtc gbtc bitb" },
  { title: "Finance News Desk", label: "Finance", href: "news-finance.html", summary: "ETFs, banks, payments, public companies, institutional adoption, personal finance, and market structure.", terms: "finance news desk banks payments etf funds public companies institutional adoption products market structure treasury fintech brokerages" },
  { title: "Stablecoin News Desk", label: "Stablecoins", href: "news-stablecoins.html", summary: "Reserves, attestations, redemption, payments, regulation, depegs, issuer risk, and wallet safety.", terms: "stablecoin stablecoins news desk usdt usdc reserves attestations redemption payments regulation depeg issuer risk tether circle paxos pyusd fdusd" },
  { title: "Markets News Desk", label: "Markets", href: "news-markets.html", summary: "Bitcoin, ETF flows, liquidity, rates, commodities, dollar strength, and market breadth.", terms: "markets market news bitcoin etf flows liquidity rates commodities dollar breadth price macro" },
  { title: "Technology News Desk", label: "Technology", href: "news-technology.html", summary: "Bitcoin infrastructure, wallets, custody, mining, developer systems, and protocol context.", terms: "technology tech wallets custody mining bitcoin infrastructure protocol developers nodes mempool" },
  { title: "AI News Desk", label: "AI", href: "news-ai.html", summary: "AI agents, crypto payments, x402, A402, wallet automation, and safety boundaries.", terms: "ai artificial intelligence agent agents crypto payments x402 a402 wallet automation security identity" },
  { title: "Startups News Desk", label: "Startups", href: "news-startups.html", summary: "Crypto startup funding, launches, product risk, infrastructure, and founder context.", terms: "startups startup funding venture launch product infrastructure crypto founders seed round" },
  { title: "Companies News Desk", label: "Companies", href: "news-companies.html", summary: "Corporate Bitcoin exposure, treasury strategy, miners, exchanges, and public-company wrappers.", terms: "companies company corporate bitcoin treasury strategy miners exchanges strategy spacex stocks public company" },
  { title: "Economics News Desk", label: "Economics", href: "news-economics.html", summary: "Inflation, jobs, rates, dollar liquidity, macro releases, and Bitcoin economic context.", terms: "economics economy inflation jobs cpi pce rates fed dollar liquidity macro bitcoin" },
  { title: "Investing News Desk", label: "Investing", href: "news-investing.html", summary: "Risk frameworks, allocation debates, ETFs, portfolios, and investor psychology.", terms: "investing investment portfolio allocation risk etf dca investors psychology bitcoin exposure" },
  { title: "Policy News Desk", label: "Policy", href: "news-policy.html", summary: "Rules, courts, enforcement, stablecoins, derivatives, custody, and market structure.", terms: "policy regulation legal court enforcement sec cftc stablecoin derivatives custody market structure" },
  { title: "Energy News Desk", label: "Energy", href: "news-energy.html", summary: "Bitcoin mining, power markets, grid demand, hardware cycles, and infrastructure economics.", terms: "energy mining power grid demand response hashrate difficulty miners electricity infrastructure" },
  { title: "Space News Desk", label: "Space", href: "news-space.html", summary: "SpaceX, satellite infrastructure, private-market wrappers, tokenized access, and risk appetite.", terms: "space spacex satellite private markets tokenized stocks pre ipo risk appetite wrappers" },
  { title: "Cybersecurity News Desk", label: "Cybersecurity", href: "news-cybersecurity.html", summary: "Wallet drainers, exploits, phishing, malware, exchange risk, and recovery scams.", terms: "cybersecurity security wallet drainer exploit phishing malware exchange risk scam recovery seed phrase" },
  { title: "Bitcoin Mining Guide", label: "Mining", href: "guides.html#mining", summary: "How miners, blocks, difficulty adjustments, energy, and fees keep Bitcoin running.", terms: "mining miner miners hashrate hash rate difficulty adjustment proof of work blocks fees energy" },
  { title: "RWA News and Tokenized Assets", label: "RWA", href: "rwa-news.html", summary: "Tokenized stock access, custody, redemption rights, issuer checks, and real-world asset risks.", terms: "rwa real world assets tokenized stock tokenization spacex custody redemption issuer allocation securities" },
  { title: "Security Alerts", label: "Security", href: "security-alerts.html", summary: "Phishing, fake wallets, x402 payment risks, malware, recovery scams, and wallet safety.", terms: "security safety scam phishing malware fake wallet recovery scam seed phrase private key alerts x402 ai agent payments payment rails" },
  { title: "Bitcoin ETF Center", label: "ETF", href: "etf.html", summary: "Spot Bitcoin ETF basics, flows, issuers, custody structure, fees, and market impact.", terms: "etf bitcoin etf spot etf flows blackrock fidelity grayscale issuer custody inflow outflow" },
  { title: "Bitcoin ETF Flow Tracker", label: "ETF", href: "bitcoin-etf-flow-tracker.html", summary: "Source-first ETF tracker for issuers, fees, custody, flows, premium or discount, and official documents.", terms: "bitcoin etf flow tracker ibit fbtc bitb gbtc flows issuer custody fees nav premium discount sec edgar blackrock fidelity bitwise grayscale" },
  { title: "Stablecoin Risk Dashboard", label: "Stablecoins", href: "stablecoin-risk-dashboard.html", summary: "Reserve, redemption, issuer, chain, and depeg checks for USDT, USDC, PYUSD, FDUSD, and other dollar tokens.", terms: "stablecoin risk dashboard usdt usdc pyusd fdusd reserves transparency attestation redemption depeg issuer tether circle paxos first digital" },
  { title: "RWA Issuer Risk Database", label: "RWA", href: "rwa-issuer-risk-database.html", summary: "A checklist database for tokenized asset issuers, legal title, custody, redemption, securities status, and source proof.", terms: "rwa issuer risk database tokenized assets legal title custody redemption securities issuer sec finra fca tokenized stocks real world assets" },
  { title: "Crypto Security Incident Timeline", label: "Security", href: "crypto-security-incident-timeline.html", summary: "Track wallet drainers, phishing, fake apps, exchange incidents, bridge exploits, malware, and prevention lessons.", terms: "crypto security incident timeline wallet drainer phishing fake wallet exploit malware exchange bridge cisa fbi ftc sec scam alerts" },
  { title: "Weekly Nakamoto Report", label: "Report", href: "weekly-nakamoto-report.html", summary: "A recurring weekly Bitcoin research briefing for markets, ETFs, RWA, stablecoins, policy, security, and source checks.", terms: "weekly nakamoto report bitcoin weekly report briefing market review etf rwa stablecoin policy security source checks weekly brief" },
  { title: "Today's Nakamoto Brief", label: "Brief", href: "today-nakamoto-brief.html", summary: "Five important stories, five sources, five next reads, and one return action for daily readers.", terms: "today nakamoto brief daily five stories sources next reads return newsletter retention" },
  { title: "Marketing Campaigns", label: "Growth", href: "marketing-campaigns.html", summary: "Campaign hub for Bitcoin basics, trading discipline, personal finance, ETF education, scam watch, stablecoin risk, and RWA reality checks.", terms: "marketing campaigns growth bitcoin basics trading discipline personal finance etf education scam stablecoin rwa" },
  { title: "Social Share Kit", label: "Growth", href: "social-share-kit.html", summary: "Reusable no-hype distribution copy for daily briefs, source threads, weekly recaps, and checklist posts.", terms: "social share kit distribution copy daily brief source thread weekly recap no hype marketing" },
  { title: "Newsletter Archive", label: "Brief", href: "newsletter-archive.html", summary: "Retention archive for daily briefs, weekly reports, source packs, and returning-reader routes.", terms: "newsletter archive retention daily brief weekly report source packs returning readers" },
  { title: "Most Read Today", label: "Daily", href: "most-read-today.html", summary: "Curated high-value reading desk for today's strongest news, safety, trading, investing, money, source, and series routes.", terms: "most read today popular useful daily reading desk internal ctr page views retention ads revenue" },
  { title: "Best of Nakamoto", label: "Start", href: "best-of-nakamoto.html", summary: "A curated route to the strongest Nakamoto pages for new visitors.", terms: "best of nakamoto curated route strongest pages start bitcoin trading investing money sources" },
  { title: "30-Day Growth Sprints", label: "Growth", href: "30-day-growth-sprints.html", summary: "One campaign, thirty useful days, and a proof trail for compounding website growth.", terms: "30 day growth sprints campaign daily improvement proof trail bitcoin trading money investing" },
  { title: "Nakamoto Source Tracker", label: "Sources", href: "source-tracker.html", summary: "Official source links for Bitcoin, ETF issuers, stablecoins, RWA regulators, security alerts, market data, and filings.", terms: "source tracker official sources bitcoin etf stablecoin rwa regulators security alerts market data filings verification source map" },
  { title: "Live Bitcoin Data", label: "Data", href: "data.html#live-chart", summary: "Use price, network, block, and fee context beside daily headlines.", terms: "data live chart price block height mempool fees market network" },
  { title: "Bitcoin Glossary", label: "Glossary", href: "growth-library.html#glossary-az", summary: "Definitions for Bitcoin, custody, mining, ETFs, markets, and research terms.", terms: "glossary dictionary terms definition beginner learn explain meaning" },
  { title: "Trading Academy", label: "Academy", href: "trading-academy.html", summary: "Risk-first market education for structure, risk, psychology, glossary terms, and trading process.", terms: "trading academy tickercamp market structure technical analysis risk management psychology charts education no signals" },
  { title: "Trading Curriculum", label: "Academy", href: "trading-curriculum.html", summary: "A structured path from market foundations to risk management and professional review process.", terms: "trading curriculum course levels foundations technical analysis auction order flow risk psychology professional process" },
  { title: "Market Structure Lesson", label: "Academy", href: "trading-market-structure.html", summary: "Learn higher highs, higher lows, breaks of structure, ranges, invalidation, and context.", terms: "market structure higher high higher low lower high lower low bos choch range breakout invalidation chart lesson" },
  { title: "Trading Risk Lab", label: "Academy", href: "trading-risk-lab.html", summary: "Educational risk checks for expectancy, drawdown recovery, risk pressure, and position sizing.", terms: "trading risk lab expectancy drawdown position sizing risk per trade recovery calculator education" },
  { title: "Trading Glossary", label: "Academy", href: "trading-glossary.html", summary: "Plain-English trading definitions for bid, ask, spread, liquidity, volatility, BOS, CHoCH, drawdown, and expectancy.", terms: "trading glossary bid ask spread liquidity volatility market order limit order bos choch drawdown expectancy" },
  { title: "Trading Lesson Library", label: "Academy", href: "trading-lesson-library.html", summary: "Financial markets, trading basics, price action, support and resistance, trends, and auction theory.", terms: "trading lesson library financial markets basics price action support resistance trends auction theory" },
  { title: "Trading Practice System", label: "Academy", href: "trading-chart-drills.html", summary: "Chart drills, simulator practice, scenario trainer, worksheets, and journaling for risk-first learning.", terms: "trading practice chart drills simulator scenarios worksheets journal practice planner" },
  { title: "Trading Mistake Library", label: "Academy", href: "trading-mistake-library.html", summary: "Chasing, oversizing, revenge trading, moving stops, outcome bias, and other process mistakes.", terms: "trading mistakes chasing oversizing revenge trading moving stops outcome bias loss behavior psychology" },
  { title: "Trading Psychology", label: "Academy", href: "trading-human-behavior.html", summary: "Fear, greed, revenge trading, loss aversion, recency bias, and behavior under uncertainty.", terms: "trading psychology human behavior fear greed revenge trading loss aversion recency bias discipline" },
  { title: "Trading Source Standards and Risk Disclosure", label: "Academy", href: "trading-risk-disclosure.html", summary: "Risk disclosure, source standards, methodology, no signals, and no personal financial advice.", terms: "trading risk disclosure source standards methodology no signals no advice leverage losses volatility" },
  { title: "Reader Center", label: "Readers", href: "reader-center.html", summary: "Mistake guides, myths, visual explainers, practical safety, and simple Bitcoin help.", terms: "reader center mistakes myths beginner simple help practical checklist learn" },
  { title: "Tools and Calculators", label: "Tools", href: "tools.html", summary: "Wallet selector, exchange selector, DCA calculator, risk tools, and checklists.", terms: "tools calculator dca risk selector wallet exchange checklist portfolio allocation" },
  { title: "Primary Sources", label: "Sources", href: "resources.html", summary: "Source pages for Bitcoin, markets, policy, filings, research, and verification.", terms: "sources resources primary source citation verification filings sec research proof" },
  { title: "Global Markets", label: "Markets", href: "global-markets.html", summary: "Macro context for Bitcoin, equities, rates, oil, policy, and risk appetite.", terms: "markets macro global markets stocks rates fed oil spacex risk appetite" },
  { title: "About, Editorial Standards and Contact", label: "Standards", href: "about.html", summary: "Source policy, corrections, contact form, disclosure, and how NAKAMOTO verifies crypto news.", terms: "about contact correction corrections editorial standards methodology disclosure sources citations trust who runs site missing citation partnership" }
];

function readStoredValue(key) {
  try {
    return window.localStorage?.getItem(key) || null;
  } catch (error) {
    return null;
  }
}

function writeStoredValue(key, value) {
  try {
    window.localStorage?.setItem(key, value);
  } catch (error) {
    // Storage may be unavailable in strict privacy modes.
  }
}

const storedTheme = readStoredValue("nakamoto-theme");
const systemThemeQuery = window.matchMedia?.("(prefers-color-scheme: dark)");
const systemPrefersDark = systemThemeQuery?.matches;
const initialTheme = storedTheme || (systemPrefersDark ? "dark" : "light");

if (siteSearchSummary && !siteSearchSummary.hasAttribute("aria-live")) {
  siteSearchSummary.setAttribute("aria-live", "polite");
}

function setTheme(theme, options = {}) {
  rootElement.dataset.theme = theme;
  if (options.persist !== false) writeStoredValue("nakamoto-theme", theme);

  const toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.innerHTML = `<span class="theme-bulb" aria-hidden="true"></span><span class="theme-label">${theme === "dark" ? "Light" : "Dark"}</span>`;
    toggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    toggle.setAttribute("aria-pressed", String(theme === "dark"));
    toggle.setAttribute("title", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }
}

rootElement.dataset.theme = initialTheme;
rootElement.dataset.themeReady = "true";

systemThemeQuery?.addEventListener?.("change", (event) => {
  if (readStoredValue("nakamoto-theme")) return;
  setTheme(event.matches ? "dark" : "light", { persist: false });
});

function normalize(value) {
  return value.trim().toLowerCase();
}


function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function scoreDestination(destination, query) {
  if (!query) return 0;

  const haystack = normalize(`${destination.title} ${destination.label} ${destination.summary} ${destination.terms}`);
  const tokens = query.split(/\s+/).filter(Boolean);
  let score = 0;

  tokens.forEach((token) => {
    if (normalize(destination.label) === token) score += 8;
    if (normalize(destination.title).includes(token)) score += 5;
    if (destination.terms.includes(token)) score += 4;
    if (haystack.includes(token)) score += 2;
  });

  if (haystack.includes(query)) score += 6;
  return score;
}

function renderSiteSearch(rawQuery) {
  if (!siteSearchResults || !siteSearchSummary) return;

  const query = normalize(rawQuery);
  const ranked = searchDestinations
    .map((destination, index) => ({ ...destination, index, score: scoreDestination(destination, query) }))
    .filter((destination) => query.length === 0 || destination.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, query.length > 0 ? 6 : 4);

  siteSearchSummary.textContent = query
    ? `${ranked.length} recommended path${ranked.length === 1 ? "" : "s"} for "${rawQuery.trim()}".`
    : "Start with a topic or use a shortcut.";

  siteSearchResults.innerHTML = ranked.map((destination) => `
    <a class="site-search-result" href="${destination.href}">
      <span>${escapeHTML(destination.label)}</span>
      <b>${escapeHTML(destination.title)}</b>
      <small>${escapeHTML(destination.summary)}</small>
    </a>
  `).join("");
}

function titleFromSearchPath(path) {
  return path
    .replace(/^\/+/, "")
    .replace(/\.html$/, "")
    .replace(/\/index$/, "")
    .split(/[/-]+/)
    .filter(Boolean)
    .map((word) => word.length <= 3 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function loadSitemapSearchDestinations() {
  if (!siteSearchResults) return;

  try {
    const response = await fetch("sitemap.xml", { cache: "no-store" });
    if (!response.ok) return;

    const xml = new DOMParser().parseFromString(await response.text(), "application/xml");
    const known = new Set(searchDestinations.map((item) => item.href.replace(/^\//, "")));
    const additions = [...xml.querySelectorAll("url loc")]
      .map((node) => {
        try {
          return new URL(node.textContent.trim()).pathname.replace(/^\//, "") || "index.html";
        } catch (error) {
          return "";
        }
      })
      .filter((path) => path.endsWith(".html") && !known.has(path) && !path.includes("404"));

    additions.forEach((path) => {
      const title = titleFromSearchPath(path);
      searchDestinations.push({
        title,
        label: "Archive",
        href: path,
        summary: `Open the ${title} page in the Nakamoto Research archive.`,
        terms: normalize(`${title} ${path.replace(/[-/.]/g, " ")}`)
      });
      known.add(path);
    });

    renderSiteSearch(searchInput?.value || "");
  } catch (error) {
    // Search still works from the built-in index when sitemap fetch is unavailable.
  }
}

function applySearch(rawQuery) {
  const query = normalize(rawQuery);

  renderSiteSearch(rawQuery);

  searchableItems.forEach((item) => {
    const haystack = normalize(`${item.textContent} ${item.dataset.search || ""} ${item.dataset.tags || ""}`);
    item.classList.toggle("is-hidden", query.length > 0 && !haystack.includes(query));
  });

  chapterParts.forEach((part) => {
    const visibleArticles = part.querySelectorAll("article:not(.is-hidden)");
    part.classList.toggle("is-hidden", query.length > 0 && visibleArticles.length === 0);
  });
}

const initialSearchQuery = new URLSearchParams(window.location.search).get("q") || "";
if (initialSearchQuery && searchInput) {
  searchInput.value = initialSearchQuery;
  applySearch(initialSearchQuery);
} else {
  renderSiteSearch("");
}

loadSitemapSearchDestinations();

searchInput?.addEventListener("input", (event) => {
  applySearch(event.target.value);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!searchInput) return;

    const value = button.dataset.filter;
    searchInput.value = value;
    applySearch(value);
    searchInput.focus();
  });
});

const header = document.querySelector("[data-header]") || document.querySelector(".site-header");

function installThemeToggle() {
  if (!header || header.querySelector("[data-theme-toggle]")) return;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "theme-toggle";
  toggle.dataset.themeToggle = "";
  toggle.addEventListener("click", () => {
    setTheme(rootElement.dataset.theme === "dark" ? "light" : "dark");
  });

  header.append(toggle);
  setTheme(rootElement.dataset.theme || initialTheme);
}

installThemeToggle();

function installCurrentNavigationState() {
  document.querySelectorAll(".top-nav a[href], .site-footer a[href]").forEach((link) => {
    const targetPath = new URL(link.getAttribute("href"), window.location.href).pathname
      .replace(/\/index\.html$/, "/")
      .replace(/^\//, "") || "index.html";

    if (targetPath === normalizedCurrentPath) {
      link.setAttribute("aria-current", "page");
    }
  });
}

installCurrentNavigationState();

function installLogoFallbacks() {
  document.querySelectorAll('img[src*="bitcoin-logo-bw.svg"]').forEach((image) => {
    const fallbackTarget = image.closest(".brand-mark, .bitcoin-mark");
    const showFallback = () => fallbackTarget?.classList.add("logo-fallback");

    image.addEventListener("error", showFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      showFallback();
    }
  });
}

installLogoFallbacks();

function installWhaleBackground() {
  if (document.querySelector("[data-whale-scene]")) return;

  const scene = document.createElement("div");
  scene.className = "whale-scene";
  scene.dataset.whaleScene = "";
  scene.setAttribute("aria-hidden", "true");

  const whales = [
    ["whale-pod pod-one", "whale adult", "whale baby"],
    ["whale-pod pod-two", "whale adult", "whale baby"],
    ["whale-pod pod-three", "whale adult", "whale baby"],
  ];

  whales.forEach(([podClass, adultClass, babyClass]) => {
    const pod = document.createElement("span");
    pod.className = podClass;
    pod.innerHTML = `<i class="${adultClass}"></i><i class="${babyClass}"></i>`;
    scene.append(pod);
  });

  document.body.prepend(scene);
}

// Decorative background layers are intentionally disabled for a cleaner publication design.

function installBitcoinBackground() {
  if (document.querySelector("[data-bitcoin-sparkles]")) return;

  const layer = document.createElement("div");
  layer.className = "bitcoin-sparkles";
  layer.dataset.bitcoinSparkles = "";
  layer.setAttribute("aria-hidden", "true");

  const positions = [
    ["8%", "22%", "0s"],
    ["18%", "72%", "-3s"],
    ["34%", "14%", "-6s"],
    ["48%", "84%", "-9s"],
    ["64%", "28%", "-12s"],
    ["78%", "66%", "-15s"],
    ["90%", "36%", "-18s"],
    ["6%", "88%", "-21s"],
    ["24%", "42%", "-24s"],
    ["42%", "58%", "-27s"],
    ["58%", "8%", "-30s"],
    ["72%", "88%", "-33s"],
    ["86%", "12%", "-36s"],
    ["12%", "52%", "-39s"],
  ];

  positions.forEach(([left, top, delay], index) => {
    const mark = document.createElement("span");
    mark.textContent = "\u20BF";
    mark.className = index % 3 === 0 ? "large" : index % 3 === 1 ? "small" : "";
    mark.style.left = left;
    mark.style.top = top;
    mark.style.animationDelay = delay;
    layer.append(mark);
  });

  document.body.prepend(layer);
}

// Decorative background layers are intentionally disabled for a cleaner publication design.

function installResearchAtmosphere() {
  if (document.querySelector("[data-research-atmosphere]")) return;

  const layer = document.createElement("div");
  layer.className = "research-atmosphere";
  layer.dataset.researchAtmosphere = "";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `
    <span class="node-line line-one"></span>
    <span class="node-line line-two"></span>
    <span class="node-line line-three"></span>
    <span class="network-node node-one"></span>
    <span class="network-node node-two"></span>
    <span class="network-node node-three"></span>
    <span class="network-node node-four"></span>
    <span class="network-node node-five"></span>
    <span class="block-drift block-one"></span>
    <span class="block-drift block-two"></span>
    <span class="block-drift block-three"></span>
    <span class="mempool-dot dot-one"></span>
    <span class="mempool-dot dot-two"></span>
    <span class="mempool-dot dot-three"></span>
    <span class="satoshi-word word-one">proof of work</span>
    <span class="satoshi-word word-two">21 million</span>
    <span class="satoshi-word word-three">self custody</span>
    <span class="chart-trace"></span>
    <span class="currency-battle">
      <i class="battle-token btc-token">&#8383;</i>
      <i class="battle-token usd-token">$</i>
      <i class="battle-pulse"></i>
    </span>
  `;

  document.body.prepend(layer);
}

// Decorative background layers are intentionally disabled for a cleaner publication design.

function installFourthDimensionBackground() {
  if (document.querySelector("[data-fourth-dimension]")) return;

  const layer = document.createElement("div");
  layer.className = "fourth-dimension";
  layer.dataset.fourthDimension = "";
  layer.setAttribute("aria-hidden", "true");
  layer.innerHTML = `
    <span class="mobius-field">
      <span class="mobius-strip strip-one"></span>
      <span class="mobius-strip strip-two"></span>
      <span class="mobius-strip strip-three"></span>
      <span class="mobius-glint glint-one"></span>
      <span class="mobius-glint glint-two"></span>
    </span>
    <span class="dimension-ring ring-one"></span>
    <span class="dimension-ring ring-two"></span>
    <span class="dimension-ring ring-three"></span>
    <span class="dimension-grid"></span>
    <span class="hypercube cube-one"><i></i><i></i><i></i><i></i></span>
    <span class="hypercube cube-two"><i></i><i></i><i></i><i></i></span>
    <span class="hypercube cube-three"><i></i><i></i><i></i><i></i></span>
    <span class="depth-line depth-one"></span>
    <span class="depth-line depth-two"></span>
    <span class="depth-line depth-three"></span>
  `;

  document.body.prepend(layer);
}

// Decorative background layers are intentionally disabled for a cleaner publication design.
function installCreatorCredit() {
  document.querySelectorAll(".site-footer").forEach((footer) => {
    if (footer.querySelector("[data-creator-credit]")) return;

    const credit = document.createElement("p");
    credit.className = "creator-credit";
    credit.dataset.creatorCredit = "";
    credit.textContent = "Created by Paras Poudel";
    footer.append(credit);
  });
}

installCreatorCredit();

function updateHeader() {
  header?.classList.toggle("has-shadow", window.scrollY > 8);
}

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

function installDesignRevealMotion() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const revealTargets = document.querySelectorAll([
    ".hero-copy",
    ".hero-visual",
    ".section-heading",
    ".action-card",
    ".page-grid article",
    ".resource-grid article",
    ".platform-map a",
    ".homepage-trust article",
    ".news-rank-list article",
    ".archive-list article",
    ".metric",
    ".dashboard",
    ".paper-section"
  ].join(","));

  if (!revealTargets.length || !("IntersectionObserver" in window)) return;

  revealTargets.forEach((element, index) => {
    element.classList.add("motion-ready");
    element.style.setProperty("--motion-index", String(index % 8));
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("motion-visible");
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.12
  });

  revealTargets.forEach((element) => observer.observe(element));
}

installDesignRevealMotion();

const networkFields = {
  price: document.querySelector("[data-btc-price]"),
  priceNote: document.querySelector("[data-btc-price-note]"),
  height: document.querySelector("[data-block-height]"),
  blockNote: document.querySelector("[data-block-note]"),
  mempool: document.querySelector("[data-mempool-count]"),
  mempoolNote: document.querySelector("[data-mempool-note]"),
  updated: document.querySelector("[data-live-updated]"),
  blockList: document.querySelector("[data-block-list]"),
  refresh: document.querySelector("[data-refresh-network]"),
  feeLow: document.querySelector("[data-fee-low]"),
  feeMedium: document.querySelector("[data-fee-medium]"),
  feeHigh: document.querySelector("[data-fee-high]"),
  feeNote: document.querySelector("[data-fee-note]"),
  supplyBar: document.querySelector("[data-supply-bar]"),
  supplyIssued: document.querySelector("[data-supply-issued]"),
  supplyRemaining: document.querySelector("[data-supply-remaining]"),
};

const newsFields = {
  headline: document.querySelector("[data-news-headline]"),
  summary: document.querySelector("[data-news-summary]"),
  price: document.querySelector("[data-news-price]"),
  block: document.querySelector("[data-news-block]"),
};

const numberFormatter = new Intl.NumberFormat("en-US");
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const compactPriceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  notation: "compact",
});
let liveBtcPrice = null;
let livePriceCheckedAt = null;
let priceRequest = null;

function validPositiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

async function loadBitcoinPrice() {
  if (priceRequest) return priceRequest;
  priceRequest = (async () => {
    try {
      const prices = await fetchJson("https://mempool.space/api/v1/prices");
      if (!validPositiveNumber(prices.USD)) throw new Error("Invalid price response");
      liveBtcPrice = prices.USD;
      livePriceCheckedAt = new Date();
    } catch (error) {
      liveBtcPrice = null;
      livePriceCheckedAt = null;
    }
    renderInvestmentPerformance();
    updateConverter("btc");
  })();
  try { await priceRequest; } finally { priceRequest = null; }
}

function formatAge(timestampSeconds) {
  const seconds = Math.max(0, Math.floor(Date.now() / 1000 - timestampSeconds));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

function setLiveError() {
  if (networkFields.price) networkFields.price.textContent = "Unavailable";
  if (networkFields.height) networkFields.height.textContent = "Unavailable";
  if (networkFields.mempool) networkFields.mempool.textContent = "Unavailable";
  if (networkFields.feeLow) networkFields.feeLow.textContent = "Unavailable";
  if (networkFields.feeMedium) networkFields.feeMedium.textContent = "Unavailable";
  if (networkFields.feeHigh) networkFields.feeHigh.textContent = "Unavailable";
  if (networkFields.supplyIssued) networkFields.supplyIssued.textContent = "Unavailable";
  if (networkFields.supplyRemaining) networkFields.supplyRemaining.textContent = "Unavailable";
  if (networkFields.priceNote) networkFields.priceNote.textContent = "Check connection";
  if (networkFields.blockNote) networkFields.blockNote.textContent = "Could not reach network API";
  if (networkFields.mempoolNote) networkFields.mempoolNote.textContent = "Try refresh";
  if (networkFields.feeNote) networkFields.feeNote.textContent = "Fee data unavailable.";
  if (networkFields.updated) networkFields.updated.textContent = "Live data unavailable";
  if (newsFields.headline) newsFields.headline.textContent = "Bitcoin live brief is unavailable.";
  if (newsFields.summary) newsFields.summary.textContent = "Live market and network data could not be reached. Use source links for manual verification.";
  if (newsFields.price) newsFields.price.textContent = "Price unavailable";
  if (newsFields.block) newsFields.block.textContent = "Network data unavailable";
}

function estimateIssuedSupply(height) {
  let issued = 0;
  let subsidy = 50;
  let remainingBlocks = height + 1;

  while (remainingBlocks > 0 && subsidy > 0) {
    const blocksAtSubsidy = Math.min(210000, remainingBlocks);
    issued += blocksAtSubsidy * subsidy;
    remainingBlocks -= blocksAtSubsidy;
    subsidy /= 2;
  }

  return issued;
}

function renderSupply(height) {
  if (!networkFields.supplyBar) return;

  const issued = estimateIssuedSupply(height);
  const cap = 21000000;
  const remaining = Math.max(0, cap - issued);
  const issuedPercent = Math.min(100, (issued / cap) * 100);

  networkFields.supplyBar.style.width = `${issuedPercent.toFixed(2)}%`;
  if (networkFields.supplyIssued) networkFields.supplyIssued.textContent = `${numberFormatter.format(Math.floor(issued))} BTC`;
  if (networkFields.supplyRemaining) networkFields.supplyRemaining.textContent = `${numberFormatter.format(Math.ceil(remaining))} BTC`;
}

function renderBlocks(blocks) {
  if (!networkFields.blockList) return;
  networkFields.blockList.innerHTML = blocks.slice(0, 4).map((block) => `
    <div class="block-row">
      <span>#${numberFormatter.format(block.height)}</span>
      <b>${numberFormatter.format(block.tx_count)} txs</b>
      <small>${formatAge(block.timestamp)}</small>
    </div>
  `).join("");
}

function renderNewsBrief({ price, blockHeight, mempool, fees }) {
  if (!newsFields.headline) return;

  const feeText = fees?.halfHourFee ? `${fees.halfHourFee} sat/vB medium fee` : "fee data updating";
  newsFields.headline.textContent = `Bitcoin trades near ${priceFormatter.format(price)} as block ${numberFormatter.format(blockHeight)} confirms.`;
  if (newsFields.summary) newsFields.summary.textContent = `Mempool: ${numberFormatter.format(mempool.count)} unconfirmed transactions. Current network context: ${feeText}.`;
  if (newsFields.price) newsFields.price.textContent = `${priceFormatter.format(price)} BTC spot price`;
  if (newsFields.block) newsFields.block.textContent = `Block ${numberFormatter.format(blockHeight)} - ${numberFormatter.format(mempool.count)} waiting txs`;
}

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadBitcoinNetworkData() {
  if (!networkFields.price || !networkFields.blockList) return;

  if (networkFields.refresh) {
    networkFields.refresh.disabled = true;
    networkFields.refresh.textContent = "Refreshing";
  }

  try {
    const [prices, height, mempool, blocks, fees] = await Promise.all([
      fetchJson("https://mempool.space/api/v1/prices"),
      fetch("https://mempool.space/api/blocks/tip/height", { cache: "no-store", signal: AbortSignal.timeout(12000) }).then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.text();
      }),
      fetchJson("https://mempool.space/api/mempool"),
      fetchJson("https://mempool.space/api/blocks"),
      fetchJson("https://mempool.space/api/v1/fees/recommended"),
    ]);

    const blockHeight = Number(height);
    if (!validPositiveNumber(prices.USD) || !Number.isInteger(blockHeight) || blockHeight < 0 || !Number.isInteger(mempool.count) || mempool.count < 0 || !Array.isArray(blocks) || blocks.some(block => [block.height, block.tx_count, block.timestamp].some(value => !Number.isInteger(value) || value < 0)) || [fees.hourFee, fees.halfHourFee, fees.fastestFee].some(value => !Number.isFinite(value) || value < 0)) throw new Error("Invalid network response");
    liveBtcPrice = prices.USD;
    livePriceCheckedAt = new Date();

    if (networkFields.price) networkFields.price.textContent = priceFormatter.format(prices.USD);
    if (networkFields.height) networkFields.height.textContent = numberFormatter.format(blockHeight);
    if (networkFields.mempool) networkFields.mempool.textContent = numberFormatter.format(mempool.count);
    if (networkFields.feeLow) networkFields.feeLow.textContent = `${fees.hourFee} sat/vB`;
    if (networkFields.feeMedium) networkFields.feeMedium.textContent = `${fees.halfHourFee} sat/vB`;
    if (networkFields.feeHigh) networkFields.feeHigh.textContent = `${fees.fastestFee} sat/vB`;
    if (networkFields.priceNote) networkFields.priceNote.textContent = "mempool.space USD price";
    if (networkFields.blockNote) networkFields.blockNote.textContent = "Latest confirmed block";
    if (networkFields.mempoolNote) networkFields.mempoolNote.textContent = "Waiting to be mined";
    if (networkFields.feeNote) networkFields.feeNote.textContent = "Low, medium, and high confirmation targets.";
    if (networkFields.updated) networkFields.updated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    renderBlocks(blocks);
    renderSupply(blockHeight);
    renderNewsBrief({ price: prices.USD, blockHeight, mempool, fees });
    renderInvestmentPerformance();
  } catch (error) {
    setLiveError();
  } finally {
    if (networkFields.refresh) {
      networkFields.refresh.disabled = false;
      networkFields.refresh.textContent = "Refresh Live Data";
    }
  }
}

networkFields.refresh?.addEventListener("click", loadBitcoinNetworkData);
loadBitcoinNetworkData();

const chartFields = {
  panel: document.querySelector("[data-price-chart]"),
  line: document.querySelector("[data-chart-line]"),
  area: document.querySelector("[data-chart-area]"),
  price: document.querySelector("[data-chart-price]"),
  range: document.querySelector("[data-chart-range]"),
  low: document.querySelector("[data-chart-low]"),
  high: document.querySelector("[data-chart-high]"),
  change: document.querySelector("[data-chart-change]"),
  buttons: document.querySelectorAll("[data-chart-range-button]"),
};

let chartRequestId = 0;

function buildChartPath(prices) {
  const width = 800;
  const height = 300;
  const padding = 22;
  const values = prices.map((point) => Array.isArray(point) ? point[1] : point);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const step = (width - padding * 2) / Math.max(1, values.length - 1);

  const points = values.map((value, index) => {
    const x = padding + index * step;
    const y = height - padding - ((value - min) / spread) * (height - padding * 2);
    return [x, y];
  });

  const line = points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L ${points[points.length - 1][0].toFixed(2)} ${height - padding} L ${points[0][0].toFixed(2)} ${height - padding} Z`;

  return { line, area, values, min, max };
}

function renderPriceChart(prices, label) {
  if (!chartFields.line || !chartFields.area || !prices.length) return;

  const { line, area, values, min, max } = buildChartPath(prices);
  const first = values[0];
  const last = values[values.length - 1];
  const change = first ? ((last - first) / first) * 100 : 0;

  chartFields.line.setAttribute("d", line);
  chartFields.area.setAttribute("d", area);
  if (chartFields.price) chartFields.price.textContent = priceFormatter.format(last);
  if (chartFields.range) chartFields.range.textContent = label;
  if (chartFields.low) chartFields.low.textContent = `Low: ${compactPriceFormatter.format(min)}`;
  if (chartFields.high) chartFields.high.textContent = `High: ${compactPriceFormatter.format(max)}`;
  if (chartFields.change) {
    chartFields.change.textContent = `Change: ${change >= 0 ? "+" : ""}${change.toFixed(2)}%`;
    chartFields.change.dataset.trend = change >= 0 ? "up" : "down";
  }
}

function rangeLabel(range) {
  const labels = {
    "1": "Last 24 hours",
    "7": "Last 7 days",
    "30": "Last 30 days",
    "365": "Last 1 year",
    max: "Full available history",
  };
  return labels[range] || labels["7"];
}

async function loadPriceChart(range = "7") {
  if (!chartFields.panel) return;
  const requestId = ++chartRequestId;

  chartFields.buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.chartRangeButton === range);
  });

  if (chartFields.range) chartFields.range.textContent = "Loading chart data";

  try {
    const data = await fetchJson(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${range}`);
    if (requestId !== chartRequestId) return;
    if (!Array.isArray(data.prices) || data.prices.length < 2 || data.prices.some(p => !Array.isArray(p) || !Number.isFinite(p[0]) || !validPositiveNumber(p[1]))) throw new Error("Invalid chart data");
    renderPriceChart(data.prices, rangeLabel(range));
  } catch (error) {
    if (requestId !== chartRequestId) return;
    chartFields.line?.setAttribute("d", "");
    chartFields.area?.setAttribute("d", "");
    if (chartFields.range) chartFields.range.textContent = rangeLabel(range) + " — data unavailable; retry a range or use the source link";
    for (const field of [chartFields.price, chartFields.low, chartFields.high, chartFields.change]) if (field) field.textContent = "Unavailable";
  }
}

chartFields.buttons.forEach((button) => {
  button.addEventListener("click", () => loadPriceChart(button.dataset.chartRangeButton));
});

loadPriceChart("7");

const largeHolderAddresses = [
  { rank: 1, balance: "248,598", address: "34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo", percentage: "1.24%" },
  { rank: 2, balance: "174,934", address: "3M219KR5vEneNb47ewrPfWyb5jQ2DjxRP6", percentage: "0.88%" },
  { rank: 3, balance: "140,063", address: "bc1ql49ydapnjafl5t2cp9zqpjwe6pdgmxy98859v2", percentage: "0.70%" },
  { rank: 4, balance: "130,010", address: "bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97", percentage: "0.65%" },
  { rank: 5, balance: "96,936", address: "bc1qjasf9z3h7w3jspkhtgatgpyvvzgpa2wwd2lr0eh5tx44reyn2k7sfc27a4", percentage: "0.49%" },
  { rank: 6, balance: "94,643", address: "bc1qazcm763858nkj2dj986etajv6wquslv8uxwczt", percentage: "0.47%" },
  { rank: 7, balance: "91,850", address: "bc1qd4ysezhmypwty5dnw7c8nqy5h5nxg0xqsvaefd0qn5kq32vwnwqqgv4rzr", percentage: "0.46%" },
  { rank: 8, balance: "79,957", address: "1FeexV6bAHb8ybZjqQMjJrcCrHGW9sb6uF", percentage: "0.40%" },
  { rank: 9, balance: "78,317", address: "bc1q8yj0herd4r4yxszw3nkfvt53433thk0f5qst4g", percentage: "0.39%" },
  { rank: 10, balance: "72,537", address: "1Ay8vMC7R1UbyCCZRVULMV7iQpHSAbguJP", percentage: "0.36%" },
  { rank: 11, balance: "69,370", address: "bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6", percentage: "0.35%" },
  { rank: 12, balance: "68,200", address: "3LYJfcfHPXYJreMsASk2jkn69LWEYKzexb", percentage: "0.34%" },
  { rank: 13, balance: "62,658", address: "bc1q0ymzksy046tv4z88ts5nmu7s574umnwmdev3rt", percentage: "0.31%" },
  { rank: 14, balance: "55,905", address: "3MgEAFWu1HKSnZ5ZsC8qf61ZW18xrP5pgd", percentage: "0.28%" },
  { rank: 15, balance: "53,880", address: "1LdRcdxfbSnmCYYNdeYpUnztiYzVfBEQeC", percentage: "0.27%" },
  { rank: 16, balance: "51,830", address: "1AC4fMwgY8j9onSbXEWeH6Zan8QGMSdmtA", percentage: "0.26%" },
  { rank: 17, balance: "44,000", address: "1LruNZjwamWJXThX2Y8C2d47QqhAkkc5os", percentage: "0.22%" },
  { rank: 18, balance: "42,660", address: "bc1qws342rlkhszh58rtn35zrw7w076puz83gkcufy", percentage: "0.21%" },
  { rank: 19, balance: "42,563", address: "bc1q0j55cut9nd2c88tnnsfultdx696c8lt6n4n0su", percentage: "0.21%" },
  { rank: 20, balance: "42,434", address: "bc1q4j7fcl8zx5yl56j00nkqez9zf3f6ggqchwzzcs5hjxwqhsgxvavq3qfgpr", percentage: "0.21%" },
  { rank: 21, balance: "38,194", address: "bc1qa2eu6p5rl9255e3xz7fcgm6snn4wl5kdfh7zpt05qp5fad9dmsys0qjg0e", percentage: "0.19%" },
  { rank: 22, balance: "37,927", address: "3LQUu4v9z6KNch71j7kbj8GPeAGUo1FW6a", percentage: "0.19%" },
  { rank: 23, balance: "37,484", address: "bc1qy3uw2kk45uj9vsy52rjfhydm2tnd6hreu8vha3", percentage: "0.19%" },
  { rank: 24, balance: "36,000", address: "bc1q7ydrtdn8z62xhslqyqtyt38mm4e2c4h3mxjkug", percentage: "0.18%" },
  { rank: 25, balance: "31,643", address: "bc1qx9t2l3pyny2spqpqlye8svce70nppwtaxwdrp4", percentage: "0.16%" },
  { rank: 26, balance: "31,275", address: "3FHNBLobJnbCTFTVakh5TXmEneyf5PT61B", percentage: "0.16%" },
  { rank: 27, balance: "31,118", address: "3FuhQLprN9s9MR3bZzR5da7mw75fuahsaU", percentage: "0.16%" },
  { rank: 28, balance: "31,000", address: "12ib7dApVFvg82TXKycWBNpN8kFyiAN1dr", percentage: "0.16%" },
  { rank: 29, balance: "30,800", address: "bc1q8taf2eca7pn9wu4czt8fgftqm288xtfxdyt33syzxuexxty733xsszghzk", percentage: "0.15%" },
  { rank: 30, balance: "30,574", address: "bc1q6h2v33qt0jjvpr2hxxtwhtvdvtn086g0n2qu06", percentage: "0.15%" },
  { rank: 31, balance: "30,467", address: "bc1qukw69mjxwp30adfqddv6gcyva26laxz562rhlk", percentage: "0.15%" },
  { rank: 32, balance: "28,151", address: "12tkqA9xSoowkzoERHMWNKsTey55YEBqkv", percentage: "0.14%" },
  { rank: 33, balance: "26,984", address: "3EMVdMehEq5SFipQ5UfbsfMsH223sSz9A9", percentage: "0.14%" },
  { rank: 34, balance: "26,916", address: "3FsDiWdG76meMpdCLbVV4dUXhrFyaLrtxL", percentage: "0.13%" },
  { rank: 35, balance: "26,062", address: "39eYrpgAgDhp4tTjrSb1ppZ5kdAc1ikBYw", percentage: "0.13%" },
  { rank: 36, balance: "25,337", address: "bc1qysj2w7xsw09datsy9mt9x50jn7qjd6qde6d66qm3ce0a4y9uzdpqcavdr0", percentage: "0.13%" },
  { rank: 37, balance: "24,052", address: "1N7jWmv63mkMdsYzbNUVHbEYDQfcq1u8Yp", percentage: "0.12%" },
  { rank: 38, balance: "23,600", address: "15cHRgVrGKz7qp2JL2N5mkB2MCFGLcnHxv", percentage: "0.12%" },
  { rank: 39, balance: "22,289", address: "bc1qr4dl5wa7kl8yu792dceg9z5knl2gkn220lk7a9", percentage: "0.11%" },
  { rank: 40, balance: "20,755", address: "bc1qs4z2d3h5je080f74tax92dwg08sf3hylj9vfg3", percentage: "0.10%" },
  { rank: 41, balance: "20,182", address: "bc1qx2x5cqhymfcnjtg902ky6u5t5htmt7fvqztdsm028hkrvxcl4t2sjtpd9l", percentage: "0.10%" },
  { rank: 42, balance: "20,008", address: "17rm2dvb439dZqyMe2d4D6AQJSgg6yeNRn", percentage: "0.10%" },
  { rank: 43, balance: "19,414", address: "1PeizMg76Cf96nUQrYg8xuoZWLQozU5zGW", percentage: "0.10%" },
  { rank: 44, balance: "18,737", address: "bc1q72nyp6mzxjxm02j7t85pg0pq24684zdj2wuweu", percentage: "0.09%" },
  { rank: 45, balance: "18,065", address: "bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h", percentage: "0.09%" },
  { rank: 46, balance: "16,653", address: "3GPAWK5aUB5Ve9akvTzZgp69USjgbhFbay", percentage: "0.08%" },
  { rank: 47, balance: "16,500", address: "bc1p6mv2d3rpfhatkv77r6huuurgqyyklxpsnw3090k2qjwqtd6cwkcqzsruxt", percentage: "0.08%" },
  { rank: 48, balance: "16,400", address: "bc1qptc9cz269u2mc5yguun5a5d6yd5c7f7ne4qj26", percentage: "0.08%" },
  { rank: 49, balance: "16,307", address: "34HpHYiyQwg69gFmCq2BGHjF1DZnZnBeBP", percentage: "0.08%" },
  { rank: 50, balance: "16,116", address: "38rFtDdFpXc4y6XPbSnNd2UvveEt5Xms2E", percentage: "0.08%" },
  { rank: 51, balance: "15,746", address: "1GR9qNz7zgtaW5HwwVpEJWMnGWhsbsieCG", percentage: "0.08%" },
  { rank: 52, balance: "15,379", address: "3FM9vDYsN2iuMPKWjAcqgyahdwdrUxhbJ3", percentage: "0.08%" },
  { rank: 53, balance: "15,098", address: "1PJiGp2yDLvUgqeBsuZVCBADArNsk6XEiw", percentage: "0.08%" },
  { rank: 54, balance: "15,000", address: "1BAuq7Vho2CEkVkUxbfU26LhwQjbCmWQkD", percentage: "0.08%" },
  { rank: 55, balance: "14,238", address: "1CNtkWbb4grh8xtb8mhoZ6armNE9PHgzA8", percentage: "0.07%" },
  { rank: 56, balance: "13,759", address: "bc1qlt5nm3kflne7rht4alsnzdzad878ld5rcu4na0", percentage: "0.07%" },
  { rank: 57, balance: "13,589", address: "3KZbyboy2MKfQjDKKf2R4UdVbUKgYvso22", percentage: "0.07%" },
  { rank: 58, balance: "13,514", address: "bc1qsg6x2cvm75xuddn5g0ss9zglaamgz90q8vcp8w", percentage: "0.07%" },
  { rank: 59, balance: "13,303", address: "36X44rmLtk218sXACZ3gFpNMFENi6dQ2n3", percentage: "0.07%" },
  { rank: 60, balance: "13,108", address: "bc1qvrwzs8unvu35kcred2z5ujjef36s5jgf3y6tp8", percentage: "0.07%" },
  { rank: 61, balance: "13,003", address: "bc1q4vxn43l44h30nkluqfxd9eckf45vr2awz38lwa", percentage: "0.07%" },
  { rank: 62, balance: "12,500", address: "bc1p4zxtwg3rhr5jqkzuvf0q03m2a69clydghqqz6arhldxln7ew0guq840aqm", percentage: "0.06%" },
  { rank: 63, balance: "12,477", address: "39gUvGynQ7Re3i15G3J2gp9DEB9LnLFPMN", percentage: "0.06%" },
  { rank: 64, balance: "12,267", address: "bc1qkmk4v2xn29yge68fq6zh7gvfdqrvpq3v3p3y0s", percentage: "0.06%" },
  { rank: 65, balance: "12,024", address: "bc1qchctnvmdva5z9vrpxkkxck64v7nmzdtyxsrq64", percentage: "0.06%" },
  { rank: 66, balance: "10,896", address: "bc1qatjx2qc8vxz39m0qdz303z8et2pgmc74xz8km3", percentage: "0.05%" },
  { rank: 67, balance: "10,771", address: "1F34duy2eeMz5mSrvFepVzy7Y1rBsnAyWC", percentage: "0.05%" },
  { rank: 68, balance: "10,681", address: "162bzZT2hJfv5Gm3ZmWfWfHJjCtMD6rHhw", percentage: "0.05%" },
  { rank: 69, balance: "10,536", address: "3NWndKFmvV6cJ6ENgXVeaDTo3mBfAvr27H", percentage: "0.05%" },
  { rank: 70, balance: "10,500", address: "bc1qxlth5har0qasqvattsjvgp80st2x402u5shuud", percentage: "0.05%" },
  { rank: 71, balance: "10,306", address: "14FEEMRhaUwMbhf2rA1cFXmS1Zuk9nc9eq", percentage: "0.05%" },
  { rank: 72, balance: "10,217", address: "1Q8QR5k32hexiMQnRgkJ6fmmjn5fMWhdv9", percentage: "0.05%" },
  { rank: 73, balance: "10,020", address: "bc1qcpflj68s3ahy4xajez4d8v3vk28pvf7qte2jmlftvxzfke2u6mqsge3gvh", percentage: "0.05%" },
  { rank: 74, balance: "10,002", address: "bc1qsxdxm0exqdsmnl9ejrz250xqxrxpxkgf5nhhtq", percentage: "0.05%" },
  { rank: 75, balance: "10,000", address: "1Ki3WTEEqTLPNsN5cGTsMkL2sJ4m5mdCXT", percentage: "0.05%" },
  { rank: 76, balance: "10,000", address: "1DzsfLRDfbmQM99xm59au2SrTY3YmciBSB", percentage: "0.05%" },
  { rank: 77, balance: "10,000", address: "1GUfWdZQoo2pQ4BKHsiegxuZPnheY5ueTm", percentage: "0.05%" },
  { rank: 78, balance: "10,000", address: "12HnxiXEeKUVjQRbMVTytsGWnzHd5LdGCt", percentage: "0.05%" },
  { rank: 79, balance: "10,000", address: "17uULjz9moeLyjXHoKNwDRgKzf8ahY3Jia", percentage: "0.05%" },
  { rank: 80, balance: "10,000", address: "18qNs1yBGGKR8RyErnEF5kegbNUgPfixhS", percentage: "0.05%" },
  { rank: 81, balance: "10,000", address: "1DP3VYwN6ozHXDDaETbvNFLd86CAXfaewi", percentage: "0.05%" },
  { rank: 82, balance: "10,000", address: "1NhJGUJu8rrTwPS4vopsdTqqcK4nAwdLwJ", percentage: "0.05%" },
  { rank: 83, balance: "10,000", address: "1MtUMTqtdrpT6Rar5fgWoyrzAevatssej5", percentage: "0.05%" },
  { rank: 84, balance: "10,000", address: "1MewpRkpcbFdqamPPYc1bXa9AJ189Succy", percentage: "0.05%" },
  { rank: 85, balance: "10,000", address: "1H2MXWiSniAgg7ykdXEzPHL6oTH1ic4kP", percentage: "0.05%" },
  { rank: 86, balance: "10,000", address: "1CY7fykRLWXeSbKB885Kr4KjQxmDdvW923", percentage: "0.05%" },
  { rank: 87, balance: "9,800", address: "bc1qxkhwkn623l5lg4rx9vx8cujmleaga0eg6wc7p6", percentage: "0.05%" },
  { rank: 88, balance: "9,725", address: "bc1q9d5lq9psmkx9rtgewjgez7csg45faak2cccew8", percentage: "0.05%" },
  { rank: 89, balance: "9,722", address: "12VuUfQHTGqWDvBzm8TBad1mZBm4hjGEzN", percentage: "0.05%" },
  { rank: 90, balance: "9,500", address: "bc1qd46j77pkp5vdxraf8tw5l6xs36dlygdx2rt9ly", percentage: "0.05%" },
  { rank: 91, balance: "9,425", address: "1P9fAFAsSLRmMu2P7wZ5CXDPRfLSWTy9N8", percentage: "0.05%" },
  { rank: 92, balance: "9,343", address: "17MWdxfjPYP2PYhdy885QtihfbW181r1rn", percentage: "0.05%" },
  { rank: 93, balance: "9,260", address: "1HLvaTs3zR3oev9ya7Pzp3GB9Gqfg6XYJT", percentage: "0.05%" },
  { rank: 94, balance: "9,252", address: "33eU1zeB2S4x3p4ccSsnAChXcGJgtMrMtZ", percentage: "0.05%" },
  { rank: 95, balance: "9,112", address: "bc1qukqenm2t85dhdta9glqehllglxznsu4qyxn079", percentage: "0.05%" },
  { rank: 96, balance: "9,099", address: "bc1qffyax9rrxmqyq8xwjkzrrqwqjp3ppz5a4665f9", percentage: "0.05%" },
  { rank: 97, balance: "9,092", address: "1LVYbnSX6f6vE2Zn4zs2oZ4eKyBgzkqaay", percentage: "0.05%" },
  { rank: 98, balance: "8,999", address: "13uZyaPbt4rTwYQ8xWFySVUzWH3pk2P5c7", percentage: "0.05%" },
  { rank: 99, balance: "8,999", address: "167ZWTT8n6s4ya8cGjqNNQjDwDGY31vmHg", percentage: "0.05%" },
  { rank: 100, balance: "8,645", address: "3JZq4atUahhuA9rLhXLMhhTo133J9rF97j", percentage: "0.04%" },
];

const holderTable = document.querySelector("[data-holder-table]");
const holderSearch = document.querySelector("[data-holder-search]");

function renderLargeHolders(query = "") {
  if (!holderTable) return;

  const normalizedQuery = normalize(query);
  const rows = largeHolderAddresses.filter((holder) => {
    return `${holder.rank} ${holder.balance} ${holder.address} ${holder.percentage}`.toLowerCase().includes(normalizedQuery);
  });

  holderTable.innerHTML = rows.map((holder) => `
    <tr>
      <td>${holder.rank}</td>
      <td>${holder.balance} BTC</td>
      <td class="holder-address">${holder.address}</td>
      <td>${holder.percentage}</td>
    </tr>
  `).join("");
}

holderSearch?.addEventListener("input", (event) => {
  renderLargeHolders(event.target.value);
});

renderLargeHolders();

const historicalBtcPrices = {
  2010: 0.003,
  2011: 0.30,
  2012: 5.28,
  2013: 13.30,
  2014: 754.97,
  2015: 320.19,
  2016: 430.72,
  2017: 963.66,
  2018: 14112.20,
  2019: 3746.71,
  2020: 7200.17,
  2021: 28994.01,
  2022: 46311.74,
  2023: 16547.91,
  2024: 44167.33,
  2025: 93576.00,
  2026: 93425.00,
};

const investmentFields = {
  start: document.querySelector("[data-invest-start]"),
  lump: document.querySelector("[data-lump-amount]"),
  monthly: document.querySelector("[data-monthly-amount]"),
  calculate: document.querySelector("[data-calc-investment]"),
  investedTotal: document.querySelector("[data-invested-total]"),
  btcTotal: document.querySelector("[data-btc-total]"),
  currentValue: document.querySelector("[data-current-value]"),
  currentPriceNote: document.querySelector("[data-current-price-note]"),
  profitLoss: document.querySelector("[data-profit-loss]"),
  returnMultiple: document.querySelector("[data-return-multiple]"),
  lumpResult: document.querySelector("[data-lump-result]"),
  dcaResult: document.querySelector("[data-dca-result]"),
  combinedResult: document.querySelector("[data-combined-result]"),
  assetCompare: document.querySelector("[data-asset-compare]"),
  assetLabel: document.querySelector("[data-asset-label]"),
  assetResult: document.querySelector("[data-asset-result]"),
  assetNote: document.querySelector("[data-asset-note]"),
};

function interpolateBtcPrice(year, monthIndex) {
  const startPrice = historicalBtcPrices[year] || historicalBtcPrices[2020];
  const nextPrice = historicalBtcPrices[year + 1] || liveBtcPrice;
  const progress = monthIndex / 12;
  return startPrice + (nextPrice - startPrice) * progress;
}

function calculateDca(startYear, monthlyAmount) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  let btc = 0;
  let invested = 0;

  for (let year = startYear; year <= currentYear; year += 1) {
    const monthLimit = year === currentYear ? currentMonth : 11;

    for (let month = 0; month <= monthLimit; month += 1) {
      const price = year >= 2026 ? liveBtcPrice : interpolateBtcPrice(year, month);
      btc += monthlyAmount / price;
      invested += monthlyAmount;
    }
  }

  return { btc, invested };
}

function renderInvestmentPerformance() {
  if (!investmentFields.start || !investmentFields.lump || !investmentFields.monthly) return;

  const startYear = Number(investmentFields.start.value);
  const lumpAmount = Number(investmentFields.lump.value || 0);
  const monthlyAmount = Number(investmentFields.monthly.value || 0);
  const validInputs = Number.isInteger(startYear) && startYear >= 2010 && startYear <= new Date().getFullYear() && Number.isFinite(lumpAmount) && lumpAmount >= 0 && Number.isFinite(monthlyAmount) && monthlyAmount >= 0;
  if (!validInputs || !validPositiveNumber(liveBtcPrice)) {
    for (const key of ["investedTotal", "btcTotal", "currentValue", "profitLoss", "returnMultiple", "lumpResult", "dcaResult", "combinedResult", "assetResult"]) if (investmentFields[key]) investmentFields[key].textContent = "Unavailable";
    if (investmentFields.currentPriceNote) investmentFields.currentPriceNote.textContent = validInputs ? "USD quote unavailable. Retry Calculate; no cached sample price is used." : "Enter finite, non-negative amounts and a valid start year.";
    return;
  }
  const startPrice = historicalBtcPrices[startYear] || liveBtcPrice;
  const lumpBtc = lumpAmount / startPrice;
  const dca = calculateDca(startYear, monthlyAmount);
  const totalBtc = lumpBtc + dca.btc;
  const totalInvested = lumpAmount + dca.invested;
  const currentValue = totalBtc * liveBtcPrice;
  const profitLoss = currentValue - totalInvested;
  const multiple = totalInvested > 0 ? currentValue / totalInvested : 0;

  if (investmentFields.investedTotal) investmentFields.investedTotal.textContent = priceFormatter.format(totalInvested);
  if (investmentFields.btcTotal) investmentFields.btcTotal.textContent = `${totalBtc.toFixed(6)} BTC`;
  if (investmentFields.currentValue) investmentFields.currentValue.textContent = priceFormatter.format(currentValue);
  if (investmentFields.currentPriceNote) investmentFields.currentPriceNote.textContent = `mempool.space quote ${priceFormatter.format(liveBtcPrice)}; checked ${livePriceCheckedAt?.toLocaleString() || "this session"}. Approximate model, not a historical backtest.`;
  if (investmentFields.profitLoss) investmentFields.profitLoss.textContent = priceFormatter.format(profitLoss);
  if (investmentFields.returnMultiple) investmentFields.returnMultiple.textContent = `${multiple.toFixed(2)}x return`;
  if (investmentFields.lumpResult) investmentFields.lumpResult.textContent = priceFormatter.format(lumpBtc * liveBtcPrice);
  if (investmentFields.dcaResult) investmentFields.dcaResult.textContent = priceFormatter.format(dca.btc * liveBtcPrice);
  if (investmentFields.combinedResult) investmentFields.combinedResult.textContent = priceFormatter.format(currentValue);

  if (investmentFields.assetCompare) {
    const compareRates = {
      cash: { label: "Cash saved", rate: 0, note: "Same total dollars, no investment return." },
      gold: { label: "Gold estimate", rate: 0.06, note: "Simple annual estimate for comparison only." },
      stocks: { label: "Stock index estimate", rate: 0.08, note: "Simple annual estimate for comparison only." },
      "real-estate": { label: "Real estate estimate", rate: 0.05, note: "Simple annual estimate before taxes, leverage, and maintenance." },
    };
    const compare = compareRates[investmentFields.assetCompare.value] || compareRates.cash;
    const estimated = calculateComparisonValue(startYear, lumpAmount, monthlyAmount, compare.rate);
    if (investmentFields.assetLabel) investmentFields.assetLabel.textContent = compare.label;
    if (investmentFields.assetResult) investmentFields.assetResult.textContent = priceFormatter.format(estimated);
    if (investmentFields.assetNote) investmentFields.assetNote.textContent = compare.note;
  }
}

function calculateComparisonValue(startYear, lumpAmount, monthlyAmount, annualRate, now = new Date()) {
  // Contributions occur at the start of each month, including the current month.
  const monthsElapsed = (now.getFullYear() - startYear) * 12 + now.getMonth();
  let value = lumpAmount * Math.pow(1 + annualRate, monthsElapsed / 12);
  for (let month = 0; month <= monthsElapsed; month += 1) value += monthlyAmount * Math.pow(1 + annualRate, (monthsElapsed - month) / 12);
  return value;
}

investmentFields.calculate?.addEventListener("click", () => {
  if (!validPositiveNumber(liveBtcPrice)) loadBitcoinPrice();
  else renderInvestmentPerformance();
});

document.querySelectorAll("[data-preset-invest]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!investmentFields.start || !investmentFields.lump || !investmentFields.monthly) return;

    const [year, lump, monthly] = button.dataset.presetInvest.split(":");
    investmentFields.start.value = year;
    investmentFields.lump.value = lump;
    investmentFields.monthly.value = monthly;
    renderInvestmentPerformance();
  });
});

investmentFields.start?.addEventListener("change", renderInvestmentPerformance);
investmentFields.lump?.addEventListener("input", renderInvestmentPerformance);
investmentFields.monthly?.addEventListener("input", renderInvestmentPerformance);
investmentFields.assetCompare?.addEventListener("change", renderInvestmentPerformance);
renderInvestmentPerformance();

const termButtons = document.querySelectorAll("[data-term]");
const termOutput = document.querySelector("[data-term-output]");

termButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (termOutput) {
      termOutput.textContent = button.dataset.term;
    }
  });
});

const securityChecks = document.querySelectorAll("[data-security-check]");
const checklistProgress = document.querySelector("[data-checklist-progress]");

function updateChecklistProgress() {
  if (!checklistProgress) return;
  const completed = [...securityChecks].filter((input) => input.checked).length;
  checklistProgress.textContent = `${completed} of ${securityChecks.length} complete`;
}

securityChecks.forEach((input) => {
  input.addEventListener("change", updateChecklistProgress);
});

updateChecklistProgress();

document.querySelectorAll(".newsletter-form").forEach((newsletterForm) => {
  newsletterForm.addEventListener("submit", () => {
    const button = newsletterForm.querySelector("button");
    const email = newsletterForm.querySelector('input[type="email"]')?.value || "";
    sendAnalyticsEvent("newsletter_signup", {
      form_name: newsletterForm.getAttribute("name") || "newsletter-form",
      email_domain: email.includes("@") ? email.split("@").pop().slice(0, 80) : ""
    });
    if (button) {
      button.textContent = "Joining";
      button.disabled = true;
    }
  });
});

const articleDialog = document.querySelector("[data-article-dialog]");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogBody = document.querySelector("[data-dialog-body]");
const closeArticleButton = document.querySelector("[data-close-article]");

document.querySelectorAll("[data-open-article]").forEach((button) => {
  button.addEventListener("click", () => {
    const article = button.closest("[data-article-title]");
    if (!article || !articleDialog || !dialogTitle || !dialogBody) return;

    dialogTitle.textContent = article.dataset.articleTitle;
    dialogBody.textContent = article.dataset.articleBody;

    if (typeof articleDialog.showModal === "function") {
      articleDialog.showModal();
    } else {
      articleDialog.setAttribute("open", "");
    }
  });
});

closeArticleButton?.addEventListener("click", () => {
  if (typeof articleDialog?.close === "function") {
    articleDialog.close();
  } else {
    articleDialog?.removeAttribute("open");
  }
});

const readingListOutput = document.querySelector("[data-reading-list]");
const storageKey = "nakamoto-saved-reading";

function getSavedReading() {
  try {
    const parsed = JSON.parse(readStoredValue(storageKey) || "[]");
    return Array.isArray(parsed) ? parsed.filter(title => typeof title === "string") : [];
  } catch (error) {
    return [];
  }
}

function renderSavedReading() {
  if (!readingListOutput) return;

  const saved = getSavedReading();
  readingListOutput.innerHTML = saved.length
    ? saved.map((title) => `<span class="saved-item">${escapeHTML(title)}</span>`).join("")
    : "No saved articles yet.";
}

document.querySelectorAll("[data-save-reading]").forEach((button) => {
  button.addEventListener("click", () => {
    const article = button.closest("[data-article-title]");
    const title = article.dataset.articleTitle;
    const saved = getSavedReading();

    if (!saved.includes(title)) {
      saved.push(title);
      writeStoredValue(storageKey, JSON.stringify(saved));
    }

    button.textContent = "Saved";
    renderSavedReading();
  });
});

renderSavedReading();

const simulatorSteps = [
  "The wallet creates and signs a transaction with a private key.",
  "The transaction is broadcast to peers across the Bitcoin network.",
  "Nodes validate the transaction and hold it in their mempool if it follows the rules.",
  "Miners choose valid transactions and assemble a candidate block.",
  "A miner finds proof of work and publishes the block to the network.",
  "Nodes verify the block. Each later block adds another confirmation."
];

const simButtons = document.querySelectorAll("[data-sim-step]");
const simOutput = document.querySelector("[data-sim-output]");
const simNext = document.querySelector("[data-sim-next]");
let simIndex = 0;

function renderSimulatorStep(index) {
  if (!simOutput) return;

  simIndex = index;
  simButtons.forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === simIndex);
  });
  simOutput.textContent = simulatorSteps[simIndex];
}

simButtons.forEach((button, index) => {
  button.addEventListener("click", () => renderSimulatorStep(index));
});

simNext?.addEventListener("click", () => {
  renderSimulatorStep((simIndex + 1) % simulatorSteps.length);
});

const walletInputs = {
  experience: document.querySelector("[data-wallet-experience]"),
  amount: document.querySelector("[data-wallet-amount]"),
  need: document.querySelector("[data-wallet-need]"),
  output: document.querySelector("[data-wallet-output]"),
};

function updateWalletRecommendation() {
  if (!walletInputs.output) return;

  const amount = walletInputs.amount?.value || "";
  const need = walletInputs.need?.value || "";
  let title = "Mobile hot wallet for small amounts.";
  let body = "Use a hot wallet only for spending balances. For savings, graduate to hardware or multisig.";

  if (need === "desktop") {
    title = "Desktop wallet with hardware-wallet support.";
    body = "Use Sparrow, Electrum, Specter, or Nunchuk with a hardware wallet so private keys stay offline.";
  }

  if (amount === "medium") {
    title = "Hardware wallet for meaningful savings.";
    body = "Use a reputable hardware wallet, verify receive addresses on-device, and store the seed offline.";
  }

  if (amount === "large" || need === "multisig") {
    title = "Multisig custody for larger balances.";
    body = "Use multisig, documented recovery, inheritance planning, and professional custody review before moving significant funds.";
  }

  const titleElement = walletInputs.output.querySelector("h3");
  const bodyElement = walletInputs.output.querySelector("p");
  if (titleElement) titleElement.textContent = title;
  if (bodyElement) bodyElement.textContent = body;
}

[walletInputs.experience, walletInputs.amount, walletInputs.need].forEach((input) => {
  input?.addEventListener("change", updateWalletRecommendation);
});

updateWalletRecommendation();

const exchangeInputs = {
  goal: document.querySelector("[data-exchange-goal]"),
  priority: document.querySelector("[data-exchange-priority]"),
  output: document.querySelector("[data-exchange-output]"),
};

function updateExchangeRecommendation() {
  if (!exchangeInputs.output) return;

  const goal = exchangeInputs.goal?.value || "";
  const priority = exchangeInputs.priority?.value || "";
  let title = "Bitcoin-only broker or recurring-buy exchange.";
  let body = "Best for users who want a simple DCA path and regular self-custody withdrawals.";

  if (goal === "advanced" || priority === "fees") {
    title = "Advanced exchange with lower-fee trading.";
    body = "Best for users who understand order books, withdrawal fees, and exchange custody risk.";
  }

  if (priority === "withdrawal") {
    title = "Exchange with strong withdrawal and self-custody workflow.";
    body = "Prioritize platforms with clear withdrawal fees, address allowlists, and reliable Bitcoin withdrawals.";
  }

  if (goal === "bitcoin-only") {
    title = "Bitcoin-only broker.";
    body = "Best fit for users who want fewer distractions, recurring buys, and education around self-custody.";
  }

  const titleElement = exchangeInputs.output.querySelector("h3");
  const bodyElement = exchangeInputs.output.querySelector("p");
  if (titleElement) titleElement.textContent = title;
  if (bodyElement) bodyElement.textContent = body;
}

[exchangeInputs.goal, exchangeInputs.priority].forEach((input) => {
  input?.addEventListener("change", updateExchangeRecommendation);
});

updateExchangeRecommendation();

function updateScore(selector, outputSelector) {
  const checks = document.querySelectorAll(selector);
  const output = document.querySelector(outputSelector);
  if (!checks.length || !output) return;

  const completed = [...checks].filter((check) => check.checked).length;
  const labels = ["High", "Elevated", "Medium", "Lower", "Low"];
  output.textContent = labels[completed] || "Lower";
}

function bindScore(selector, outputSelector) {
  document.querySelectorAll(selector).forEach((check) => {
    check.addEventListener("change", () => updateScore(selector, outputSelector));
  });
  updateScore(selector, outputSelector);
}

bindScore("[data-custody-check]", "[data-custody-score]");
bindScore("[data-treasury-check]", "[data-treasury-score]");
bindScore("[data-tax-check]", "[data-tax-score]");

function updateChecklistCount(selector, outputSelector) {
  const checks = document.querySelectorAll(selector);
  const output = document.querySelector(outputSelector);
  if (!checks.length || !output) return;
  const completed = [...checks].filter((check) => check.checked).length;
  output.textContent = `${completed} of ${checks.length} complete`;
}

function bindChecklistCount(selector, outputSelector) {
  document.querySelectorAll(selector).forEach((check) => {
    check.addEventListener("change", () => updateChecklistCount(selector, outputSelector));
  });
  updateChecklistCount(selector, outputSelector);
}

function updateRiskWord(selector, outputSelector, words) {
  const checks = document.querySelectorAll(selector);
  const output = document.querySelector(outputSelector);
  if (!checks.length || !output) return;
  const checked = [...checks].filter((check) => check.checked).length;
  const index = Math.min(words.length - 1, checked);
  output.textContent = words[index];
}

function bindRiskWord(selector, outputSelector, words) {
  document.querySelectorAll(selector).forEach((check) => {
    check.addEventListener("change", () => updateRiskWord(selector, outputSelector, words));
  });
  updateRiskWord(selector, outputSelector, words);
}

bindRiskWord("[data-safety-check]", "[data-safety-score]", ["High Risk", "High Risk", "Elevated Risk", "Medium Risk", "Lower Risk", "Stronger Setup"]);
bindRiskWord("[data-scam-check]", "[data-scam-score]", ["Low Warning", "Caution", "Danger", "High Danger", "Stop", "Stop", "Stop"]);
bindChecklistCount("[data-buying-check]", "[data-buying-score]");
bindChecklistCount("[data-tax-list-check]", "[data-tax-list-score]");
bindChecklistCount("[data-wallet-setup-check]", "[data-wallet-setup-score]");
bindChecklistCount("[data-inheritance-check]", "[data-inheritance-score]");

const quizFields = {
  goal: document.querySelector("[data-quiz-goal]"),
  experience: document.querySelector("[data-quiz-experience]"),
  concern: document.querySelector("[data-quiz-concern]"),
  output: document.querySelector("[data-quiz-output]"),
};

function updateBeginnerQuiz() {
  if (!quizFields.output) return;

  const goal = quizFields.goal?.value || "";
  const concern = quizFields.concern?.value || "";
  let title = "Start with the plain-English beginner path.";
  let body = "Read Chapter 1 first, then move to the safety guide.";
  let href = "chapter-1.html";

  if (goal === "buy") {
    title = "Start with the buying checklist.";
    body = "Learn account security, fees, withdrawals, and small test transactions before buying.";
    href = "tools.html#buying-checklist";
  } else if (goal === "wallet") {
    title = "Start with the wallet setup wizard.";
    body = "Choose the wallet type, write the seed phrase offline, and test with a small amount.";
    href = "tools.html#wallet-setup-wizard";
  } else if (goal === "invest") {
    title = "Start with allocation and risk.";
    body = "Use the allocation tool and simulator before thinking about return potential.";
    href = "tools.html#portfolio-allocation";
  } else if (goal === "business") {
    title = "Start with treasury and inheritance planning.";
    body = "Business use needs custody, approvals, accounting, and risk policy before exposure.";
    href = "guides.html#treasury";
  }

  if (concern === "safety") {
    title = "Start with safety.";
    body = "Use the safety score and scam checker before installing wallets or moving funds.";
    href = "tools.html#bitcoin-safety-score";
  } else if (concern === "tax") {
    title = "Start with tax and country rules.";
    body = "Use the country finder and tax checklist so records are organized early.";
    href = "policy.html#country-finder";
  }

  const titleElement = quizFields.output.querySelector("h3");
  const bodyElement = quizFields.output.querySelector("p");
  const linkElement = quizFields.output.querySelector("a");
  if (titleElement) titleElement.textContent = title;
  if (bodyElement) bodyElement.textContent = body;
  if (linkElement) linkElement.setAttribute("href", href);
}

[quizFields.goal, quizFields.experience, quizFields.concern].forEach((input) => {
  input?.addEventListener("change", updateBeginnerQuiz);
});
updateBeginnerQuiz();

const portfolioFields = {
  size: document.querySelector("[data-portfolio-size]"),
  allocation: document.querySelector("[data-portfolio-allocation]"),
  comfort: document.querySelector("[data-portfolio-comfort]"),
  output: document.querySelector("[data-portfolio-output]"),
};

function updatePortfolioAllocation() {
  if (!portfolioFields.output) return;
  const size = Number(portfolioFields.size?.value || 0);
  const allocation = Number(portfolioFields.allocation?.value || 0);
  const exposure = size * allocation / 100;
  const comfort = portfolioFields.comfort?.value || "";
  const note = comfort === "low"
    ? "For low volatility comfort, small allocations may still feel emotionally large."
    : comfort === "high"
      ? "Higher volatility comfort does not remove loss risk or custody risk."
      : "A small allocation can still move sharply and should be sized thoughtfully.";

  const titleElement = portfolioFields.output.querySelector("h3");
  const bodyElement = portfolioFields.output.querySelector("p");
  if (titleElement) titleElement.textContent = `${priceFormatter.format(exposure)} Bitcoin exposure`;
  if (bodyElement) bodyElement.textContent = `A ${allocation}% allocation on ${priceFormatter.format(size)} equals ${priceFormatter.format(exposure)}. ${note}`;
}

[portfolioFields.size, portfolioFields.allocation, portfolioFields.comfort].forEach((input) => {
  input?.addEventListener("input", updatePortfolioAllocation);
  input?.addEventListener("change", updatePortfolioAllocation);
});
updatePortfolioAllocation();

const countryData = {
  us: {
    label: "United States",
    title: "Bitcoin ownership is generally allowed, but intermediaries are regulated.",
    body: "Watch tax reporting, exchange compliance, ETFs, custody, state money-transmission rules, and federal market-structure debates.",
  },
  eu: {
    label: "European Union",
    title: "MiCA creates a harmonized crypto-asset framework.",
    body: "The EU focuses on service-provider authorization, stablecoin rules, disclosures, market integrity, and consumer protection.",
  },
  uk: {
    label: "United Kingdom",
    title: "The UK is moving cryptoasset activity into regulated financial services.",
    body: "Watch FCA promotions rules, custody expectations, stablecoin policy, and broader market structure changes.",
  },
  japan: {
    label: "Japan",
    title: "Japan uses a supervised exchange and investor-protection model.",
    body: "Rules focus on exchange registration, asset segregation, custody, tax treatment, and market oversight.",
  },
  uae: {
    label: "UAE",
    title: "The UAE uses a licensed digital-asset hub model.",
    body: "Dubai VARA and federal frameworks support supervised virtual asset businesses with licensing requirements.",
  },
  china: {
    label: "China",
    title: "China uses a restrictive model for trading and mining.",
    body: "Policy has emphasized capital controls, financial stability, energy management, fraud prevention, and monetary authority.",
  },
  elsalvador: {
    label: "El Salvador",
    title: "El Salvador remains the best-known state Bitcoin adoption case.",
    body: "Its legal-tender experiment, government holdings, and later policy revisions show both adoption potential and policy constraints.",
  },
};

const countrySelect = document.querySelector("[data-country-select]");
const countryOutput = document.querySelector("[data-country-output]");

function updateCountryFinder() {
  if (!countrySelect || !countryOutput) return;
  const country = countryData[countrySelect.value] || countryData.us;
  const labelElement = countryOutput.querySelector("span");
  const titleElement = countryOutput.querySelector("h3");
  const bodyElement = countryOutput.querySelector("p");
  if (labelElement) labelElement.textContent = country.label;
  if (titleElement) titleElement.textContent = country.title;
  if (bodyElement) bodyElement.textContent = country.body;
}

countrySelect?.addEventListener("change", updateCountryFinder);
updateCountryFinder();

const converterFields = {
  btc: document.querySelector("[data-convert-btc]"),
  sats: document.querySelector("[data-convert-sats]"),
  usd: document.querySelector("[data-convert-usd]"),
  note: document.querySelector("[data-convert-note]"),
};
let converterLock = false;

function updateConverter(source) {
  if (!converterFields.btc || !converterFields.sats || !converterFields.usd || !converterFields.note || converterLock) return;
  converterLock = true;
  try {
    const hasPrice = validPositiveNumber(liveBtcPrice);
    converterFields.usd.disabled = !hasPrice;
    const raw = Number(converterFields[source]?.value || 0);
    if (!Number.isFinite(raw) || raw < 0) {
      for (const key of ["btc", "sats", "usd"]) if (key !== source) converterFields[key].value = "";
      converterFields.note.textContent = "Enter a finite, non-negative amount.";
      return;
    }
    if (source === "usd" && !hasPrice) return;
    const btc = source === "sats" ? raw / 100000000 : source === "usd" ? raw / liveBtcPrice : raw;
    const sats = Math.round(btc * 100000000);
    if (!Number.isSafeInteger(sats)) {
      for (const key of ["btc", "sats", "usd"]) if (key !== source) converterFields[key].value = "";
      converterFields.note.textContent = "Amount exceeds the converter's exact satoshi range.";
      return;
    }
    if (source !== "btc") converterFields.btc.value = btc.toFixed(8).replace(/0+$/, "").replace(/\.$/, "") || "0";
    if (source !== "sats") converterFields.sats.value = String(sats);
    if (source !== "usd") converterFields.usd.value = hasPrice ? (btc * liveBtcPrice).toFixed(2) : "";
    converterFields.note.textContent = btc.toFixed(8) + " BTC equals " + numberFormatter.format(sats) + " sats" + (hasPrice ? ", about " + priceFormatter.format(btc * liveBtcPrice) + ". Quote checked " + livePriceCheckedAt?.toLocaleString() + "." : ". USD quote unavailable; BTC/sats conversion still works.");
  } finally {
    converterLock = false;
  }
}

converterFields.btc?.addEventListener("input", () => updateConverter("btc"));
converterFields.sats?.addEventListener("input", () => updateConverter("sats"));
converterFields.usd?.addEventListener("input", () => updateConverter("usd"));
updateConverter("btc");
if (converterFields.btc || investmentFields.start) loadBitcoinPrice();

const addressInput = document.querySelector("[data-address-input]");
const addressOutput = document.querySelector("[data-address-output]");

function updateAddressChecker() {
  if (!addressInput || !addressOutput) return;
  const value = addressInput.value.trim();
  let label = "Waiting";
  let title = "Paste a Bitcoin address.";
  let body = "Legacy, nested SegWit, native SegWit, and Taproot addresses are explained here.";

  if (value) {
    if (/^1[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value)) {
      label = "Legacy";
      title = "This looks like a legacy Bitcoin address.";
      body = "Legacy addresses begin with 1. They are valid Bitcoin formats but can be less fee-efficient than newer SegWit formats.";
    } else if (/^3[1-9A-HJ-NP-Za-km-z]{25,34}$/.test(value)) {
      label = "Nested SegWit";
      title = "This looks like a nested SegWit address.";
      body = "Addresses beginning with 3 can be nested SegWit or multisig-style addresses. Always verify the recipient and network.";
    } else if (/^bc1q[023456789acdefghjklmnpqrstuvwxyz]{20,90}$/.test(value.toLowerCase())) {
      label = "Native SegWit";
      title = "This looks like a native SegWit address.";
      body = "Native SegWit addresses begin with bc1q and are commonly used for lower-fee Bitcoin transactions.";
    } else if (/^bc1p[023456789acdefghjklmnpqrstuvwxyz]{20,90}$/.test(value.toLowerCase())) {
      label = "Taproot";
      title = "This looks like a Taproot address.";
      body = "Taproot addresses begin with bc1p. Make sure the sending platform supports Taproot withdrawals.";
    } else {
      label = "Check Carefully";
      title = "This does not look like a standard Bitcoin address format.";
      body = "Do not send funds until the address, recipient, and network are verified. This tool only checks simple format patterns.";
    }
  }

  const labelElement = addressOutput.querySelector("span");
  const titleElement = addressOutput.querySelector("h3");
  const bodyElement = addressOutput.querySelector("p");
  if (labelElement) labelElement.textContent = label;
  if (titleElement) titleElement.textContent = title;
  if (bodyElement) bodyElement.textContent = body;
}

addressInput?.addEventListener("input", updateAddressChecker);
updateAddressChecker();

const txidInput = document.querySelector("[data-txid-input]");
const txidOutput = document.querySelector("[data-txid-output]");
const txidLink = document.querySelector("[data-txid-link]");

function updateTxidExplainer() {
  if (!txidInput || !txidOutput) return;
  const txid = txidInput.value.trim();
  const isTxid = /^[a-fA-F0-9]{64}$/.test(txid);

  const labelElement = txidOutput.querySelector("span");
  const titleElement = txidOutput.querySelector("h3");
  const bodyElement = txidOutput.querySelector("p");
  if (labelElement) labelElement.textContent = isTxid ? "Valid Format" : txid ? "Check Format" : "Waiting";
  if (titleElement) titleElement.textContent = isTxid ? "This looks like a Bitcoin transaction ID." : txid ? "This does not look like a full TXID." : "Paste a transaction ID.";
  if (bodyElement) {
    bodyElement.textContent = isTxid
      ? "A transaction page can show confirmations, fee rate, inputs, outputs, and whether the transaction is still waiting in the mempool."
      : "A TXID is usually a 64-character hexadecimal identifier. It does not contain spaces or punctuation.";
  }
  if (txidLink) txidLink.href = isTxid ? `https://mempool.space/tx/${txid}` : "https://mempool.space/";
}

txidInput?.addEventListener("input", updateTxidExplainer);
updateTxidExplainer();



function normalizePrimaryNavigation() {
  const items = [
    ["start.html", "Start Here"],
    ["crypto-news-today.html", "News"],
    ["sections.html", "Learn"],
    ["tools.html", "Tools"],
    ["source-packs.html", "Sources"],
    ["search.html", "Search"],
  ];
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const newsDeskPages = new Set([
    "news-desks.html",
    "news-markets.html",
    "news-technology.html",
    "news-ai.html",
    "news-startups.html",
    "news-companies.html",
    "news-economics.html",
    "news-investing.html",
    "news-policy.html",
    "news-energy.html",
    "news-space.html",
    "news-cybersecurity.html"
  ]);

  document.querySelectorAll(".top-nav").forEach((nav) => {
    const hasParentLinks = Array.from(nav.querySelectorAll("a[href]")).some((link) => (link.getAttribute("href") || "").startsWith("../"));
    const prefix = hasParentLinks ? "../" : "";

    nav.replaceChildren(...items.map(([href, label]) => {
      const link = document.createElement("a");
      link.href = `${prefix}${href}`;
      link.textContent = label;
      if (href === currentPage || (href === "crypto-news-today.html" && newsDeskPages.has(currentPage))) {
        link.setAttribute("aria-current", "page");
      }
      return link;
    }));
  });
}

normalizePrimaryNavigation();

function installSkipLink() {
  if (document.querySelector(".skip-link")) return;

  const main = document.querySelector("main");
  if (!main) return;

  if (!main.id) main.id = "main-content";
  if (!main.hasAttribute("tabindex")) main.tabIndex = -1;

  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = `#${main.id}`;
  skipLink.textContent = "Skip to content";
  document.body.prepend(skipLink);
}

function installExternalLinkSafety() {
  document.querySelectorAll("a[href]").forEach((link) => {
    const url = new URL(link.href, window.location.href);
    if (!isOutboundLink(url)) return;

    const rel = new Set((link.getAttribute("rel") || "").split(/\s+/).filter(Boolean));
    rel.add("noreferrer");
    rel.add("noopener");
    link.setAttribute("rel", Array.from(rel).join(" "));

    if (!link.hasAttribute("target")) {
      link.setAttribute("target", "_blank");
    }
  });
}

function installMediaPerformanceDefaults() {
  document.querySelectorAll("img").forEach((image, index) => {
    if (!image.hasAttribute("loading")) image.loading = index < 2 ? "eager" : "lazy";
    if (!image.hasAttribute("decoding")) image.decoding = "async";
    if (index < 2 && !image.hasAttribute("fetchpriority")) image.setAttribute("fetchpriority", "high");
    if (!image.hasAttribute("alt")) image.alt = "";
  });

  document.querySelectorAll("iframe").forEach((frame) => {
    if (!frame.hasAttribute("loading")) frame.loading = "lazy";
    if (!frame.hasAttribute("title")) frame.title = "Embedded content";
  });
}

function getRecommendationSet(pathname) {
  const defaultSet = [
    ["Start Here", "Bitcoin basics in plain English.", "start.html"],
    ["Latest News", "Today's crypto and Bitcoin desk update.", "crypto-news-today.html"],
    ["Tools", "Calculators, safety checks, and decision helpers.", "tools.html"],
    ["Sources", "Primary sources and research links.", "resources.html"]
  ];

  if (pathname.includes("news") || pathname.includes("crypto-news-today") || pathname.includes("daily-operations")) {
    return [
      ["News Desks", "Open the full editorial category map.", "news-desks.html"],
      ["News Archive", "Compare today's story with earlier daily briefs.", "news-archive.html"],
      ["Markets Desk", "Track Bitcoin, ETFs, liquidity, and macro risk.", "news-markets.html"],
      ["Cybersecurity Desk", "Wallet, scam, exploit, and payment-risk checks.", "news-cybersecurity.html"]
    ];
  }

  if (pathname.includes("rwa") || pathname.includes("stablecoin")) {
    return [
      ["RWA Guide", "Legal rights, custody, redemption, and issuer risk.", "rwa-crypto-explained.html"],
      ["Stablecoins", "Reserves, redemption, depegs, and regulation.", "stablecoins-explained.html"],
      ["Policy", "Regulation and country-level market structure.", "policy.html"],
      ["Sources", "Primary documents for verification.", "resources.html"]
    ];
  }

  if (pathname.includes("wallet") || pathname.includes("scam") || pathname.includes("security")) {
    return [
      ["Wallet Safety", "Seed phrases, backups, hardware wallets, and recovery.", "bitcoin-wallet-safety.html"],
      ["Scam Checklist", "Red flags before installing wallets or sending funds.", "crypto-scam-checklist.html"],
      ["Tools", "Use safety and risk checkers.", "tools.html"],
      ["Beginner Path", "Learn the basics before taking action.", "start.html"]
    ];
  }

  if (pathname.includes("etf") || pathname.includes("market") || pathname.includes("price")) {
    return [
      ["ETF Explained", "Spot ETF structure, custody, fees, and trade-offs.", "bitcoin-etf-explained.html"],
      ["Global Markets", "Macro context for Bitcoin readers.", "global-markets.html"],
      ["Price Scenarios", "Risk scenarios without price promises.", "bitcoin-price-scenarios.html"],
      ["Daily News", "Current market and policy updates.", "crypto-news-today.html"]
    ];
  }

  return defaultSet;
}

function installRelatedDiscovery() {
  const main = document.querySelector("main");
  if (!main || document.querySelector("[data-related-discovery]")) return;

  const pathname = window.location.pathname.split("/").pop() || "index.html";
  if (["404.html", "thanks.html"].includes(pathname)) return;

  const current = pathname.toLowerCase();
  const recommendations = getRecommendationSet(current)
    .filter(([, , href]) => href.toLowerCase() !== current)
    .slice(0, 4);

  if (!recommendations.length) return;

  const section = document.createElement("section");
  section.className = "page-section related-discovery";
  section.dataset.relatedDiscovery = "true";
  section.setAttribute("aria-labelledby", "related-discovery-title");
  section.innerHTML = `
    <div class="section-heading">
      <p class="section-kicker">Keep Reading</p>
      <h2 id="related-discovery-title">Recommended next pages.</h2>
      <p>These links connect the current page to stronger context, tools, sources, and evergreen guides.</p>
    </div>
    <div class="page-grid">
      ${recommendations.map(([label, summary, href]) => `
        <a class="action-card" href="${href}">
          <span>${escapeHTML(label)}</span>
          <h3>${escapeHTML(summary)}</h3>
          <p>Use this next step to continue the research path.</p>
          <em>Open page</em>
        </a>
      `).join("")}
    </div>
  `;

  main.append(section);
}

function installPrivacyNotice() {
  if (readStoredValue("nakamoto-privacy-notice") === "accepted") return;

  const notice = document.createElement("section");
  notice.className = "privacy-notice";
  notice.setAttribute("aria-label", "Privacy and analytics notice");
  notice.innerHTML = `
    <div>
      <b>Privacy notice</b>
      <p>NAKAMOTO uses analytics and heatmaps to improve pages, navigation, speed, and content discovery.</p>
    </div>
    <div class="privacy-actions">
      <a href="${getRelativePath("privacy.html")}">Details</a>
      <button type="button" data-privacy-accept>Accept</button>
    </div>
  `;

  notice.querySelector("[data-privacy-accept]")?.addEventListener("click", () => {
    writeStoredValue("nakamoto-privacy-notice", "accepted");
    sendAnalyticsEvent("privacy_notice_accept");
    notice.remove();
  });

  document.body.append(notice);

  const compactNoticeQuery = window.matchMedia("(max-width: 760px)");
  if (!compactNoticeQuery.matches) return;

  const heroActionGroup = document.querySelector(".hero-actions");
  if (!heroActionGroup) return;

  const syncNoticeVisibility = () => {
    const rect = heroActionGroup.getBoundingClientRect();
    const heroActionsVisible = rect.bottom > 0 && rect.top < window.innerHeight;
    notice.classList.toggle("privacy-notice--deferred", heroActionsVisible);
  };

  syncNoticeVisibility();
  window.addEventListener("scroll", syncNoticeVisibility, { passive: true });
  window.addEventListener("resize", syncNoticeVisibility);
}

function getRelativePath(target) {
  const depth = window.location.pathname.split("/").filter(Boolean).length - 1;
  const prefix = depth > 0 ? "../".repeat(depth) : "";
  return `${prefix}${target}`;
}

function getAbsolutePageUrl() {
  const normalizedPath = window.location.pathname.replace(/\/index\.html$/, "/");
  return new URL(normalizedPath || "/", window.location.origin).href;
}

function getMetaContent(selector) {
  return document.querySelector(selector)?.getAttribute("content")?.trim() || "";
}

function ensureHeadMeta(selector, createElement) {
  const existing = document.querySelector(selector);
  if (existing) return existing;
  const element = createElement();
  document.head.append(element);
  return element;
}

function installSeoMetadataSafetyNet() {
  const pageUrl = getAbsolutePageUrl();
  const title = document.title.trim() || "NAKAMOTO";
  const description = getMetaContent('meta[name="description"]')
    || document.querySelector("main p")?.textContent?.trim()?.slice(0, 155)
    || "NAKAMOTO publishes source-first Bitcoin, crypto, investing, trading, and personal finance education.";

  ensureHeadMeta('link[rel="canonical"]', () => {
    const link = document.createElement("link");
    link.rel = "canonical";
    link.href = pageUrl;
    return link;
  });

  ensureHeadMeta('meta[property="og:url"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:url");
    meta.content = pageUrl;
    return meta;
  });

  ensureHeadMeta('meta[property="og:title"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:title");
    meta.content = title;
    return meta;
  });

  ensureHeadMeta('meta[property="og:description"]', () => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:description");
    meta.content = description;
    return meta;
  });

  ensureHeadMeta('meta[name="twitter:card"]', () => {
    const meta = document.createElement("meta");
    meta.name = "twitter:card";
    meta.content = "summary_large_image";
    return meta;
  });
}

function inferStructuredPageType() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("news-") || path.includes("crypto-news") || path.includes("daily-brief")) return "NewsArticle";
  if (path.includes("blog") || path.includes("guide") || path.includes("lesson") || path.includes("article")) return "Article";
  if (path.includes("faq")) return "FAQPage";
  if (path.includes("search")) return "SearchResultsPage";
  return "WebPage";
}

function installStructuredDataSafetyNet() {
  if (document.querySelector('script[type="application/ld+json"]')) return;

  const pageUrl = getAbsolutePageUrl();
  const title = document.title.trim() || "NAKAMOTO";
  const description = getMetaContent('meta[name="description"]')
    || document.querySelector("main p")?.textContent?.trim()?.slice(0, 155)
    || "Source-first Bitcoin, crypto, investing, trading, and personal finance education.";
  const pageType = inferStructuredPageType();
  const dateMatch = window.location.pathname.match(/(20\d{2})-(\d{2})-(\d{2})/);
  const datePublished = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : undefined;
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": `${window.location.origin}/`
    },
    ...pathParts.map((part, index) => {
      const itemPath = `/${pathParts.slice(0, index + 1).join("/")}`;
      return {
        "@type": "ListItem",
        "position": index + 2,
        "name": part.replace(/\.html$/, "").replace(/-/g, " "),
        "item": new URL(itemPath, window.location.origin).href
      };
    })
  ];

  const pageNode = {
    "@type": pageType,
    "@id": `${pageUrl}#page`,
    "url": pageUrl,
    "name": title,
    "description": description,
    "isPartOf": { "@id": `${window.location.origin}/#website` },
    "publisher": { "@id": `${window.location.origin}/#organization` }
  };

  if (pageType === "Article" || pageType === "NewsArticle") {
    pageNode.headline = title.replace(/\s+\|\s+NAKAMOTO.*$/i, "");
    pageNode.mainEntityOfPage = pageUrl;
    pageNode.author = { "@id": `${window.location.origin}/about.html#organization` };
    if (datePublished) pageNode.datePublished = datePublished;
  }

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${window.location.origin}/#organization`,
        "name": "NAKAMOTO",
        "url": `${window.location.origin}/`,
        "logo": `${window.location.origin}/assets/bitcoin-logo-bw.svg`,
        "sameAs": []
      },
      {
        "@type": "WebSite",
        "@id": `${window.location.origin}/#website`,
        "name": "NAKAMOTO",
        "url": `${window.location.origin}/`,
        "publisher": { "@id": `${window.location.origin}/#organization` }
      },
      pageNode,
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        "itemListElement": breadcrumbItems
      }
    ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(graph);
  document.head.append(script);
}

function installTrustFooterLinks() {
  const footer = document.querySelector(".site-footer");
  if (!footer || footer.querySelector(".footer-legal-links")) return;

  const links = [
    ["Privacy", "privacy.html"],
    ["Cookie Policy", "cookie-policy.html"],
    ["Terms", "terms.html"],
    ["Disclaimer", "disclaimer.html"],
    ["Affiliate Disclosure", "affiliate-disclosure.html"],
    ["Contact", "contact.html"],
    ["Editorial Policy", "editorial-policy.html"],
    ["Corrections", "corrections-policy.html"],
    ["Source Policy", "source-policy.html"]
  ];

  const nav = document.createElement("nav");
  nav.className = "footer-legal-links";
  nav.setAttribute("aria-label", "Legal, privacy, and trust links");
  nav.innerHTML = links.map(([label, href]) => `<a href="${getRelativePath(href)}">${escapeHTML(label)}</a>`).join("");
  footer.append(nav);
}

function installAcademyRiskTools() {
  const numberValue = (selector, fallback = 0) => {
    const element = document.querySelector(selector);
    if (!element) return fallback;
    const value = Number.parseFloat(element.value);
    return Number.isFinite(value) ? value : fallback;
  };

  const setOutput = (selector, title, note) => {
    const output = document.querySelector(selector);
    if (!output) return;
    output.innerHTML = `<strong>${escapeHTML(title)}</strong><p>${escapeHTML(note)}</p>`;
  };

  const updateExpectancy = () => {
    const winRate = Math.min(Math.max(numberValue("[data-academy-exp-winrate]", 45), 0), 100) / 100;
    const averageWin = numberValue("[data-academy-exp-win]", 1.8);
    const averageLoss = Math.abs(numberValue("[data-academy-exp-loss]", 1));
    const expectancy = (winRate * averageWin) - ((1 - winRate) * averageLoss);
    const label = `${expectancy >= 0 ? "+" : ""}${expectancy.toFixed(2)}R`;
    const note = expectancy > 0
      ? "Positive before costs, slippage, mistakes, and sample-size limits. Review whether the assumptions are realistic."
      : "Negative or flat before costs. Study the setup, reduce mistakes, or reject the idea until the math improves.";
    setOutput("[data-academy-exp-output]", label, note);
  };

  const updateDrawdown = () => {
    const drawdown = Math.min(Math.max(numberValue("[data-academy-dd-percent]", 12), 0), 99.9);
    const recovery = drawdown / (100 - drawdown) * 100;
    setOutput("[data-academy-dd-output]", `${recovery.toFixed(1)}%`, `Approximate gain needed to recover from a ${drawdown.toFixed(1)}% drawdown.`);
  };

  const updatePositionSize = () => {
    const balance = Math.max(numberValue("[data-academy-size-balance]", 10000), 0);
    const riskPercent = Math.max(numberValue("[data-academy-size-risk]", 1), 0);
    const stopDistance = Math.max(numberValue("[data-academy-size-stop]", 50), 0);
    const unitRisk = Math.max(numberValue("[data-academy-size-unit]", stopDistance), 0);
    const riskBudget = balance * (riskPercent / 100);
    const units = unitRisk > 0 ? riskBudget / unitRisk : 0;
    setOutput("[data-academy-size-output]", `${units.toFixed(2)} units`, `Educational size estimate from a ${riskPercent.toFixed(2)}% risk limit and ${riskBudget.toFixed(2)} risk budget.`);
  };

  const updateChecklist = () => {
    const checks = Array.from(document.querySelectorAll("[data-academy-risk-check]"));
    if (!checks.length) return;
    const done = checks.filter((check) => check.checked).length;
    setOutput("[data-academy-risk-progress]", `${done}/${checks.length}`, done === checks.length
      ? "All pre-risk checks are complete. The next job is still review, not prediction."
      : "Do not treat the plan as complete until every risk check is answered.");
  };

  [
    "[data-academy-exp-winrate]",
    "[data-academy-exp-win]",
    "[data-academy-exp-loss]",
    "[data-academy-dd-percent]",
    "[data-academy-size-balance]",
    "[data-academy-size-risk]",
    "[data-academy-size-stop]",
    "[data-academy-size-unit]"
  ].forEach((selector) => {
    document.querySelectorAll(selector).forEach((field) => {
      field.addEventListener("input", () => {
        updateExpectancy();
        updateDrawdown();
        updatePositionSize();
      });
    });
  });

  document.querySelectorAll("[data-academy-risk-check]").forEach((check) => {
    check.addEventListener("change", updateChecklist);
  });

  updateExpectancy();
  updateDrawdown();
  updatePositionSize();
  updateChecklist();
}

installSkipLink();
installExternalLinkSafety();
installMediaPerformanceDefaults();
installSeoMetadataSafetyNet();
installStructuredDataSafetyNet();
installRelatedDiscovery();
installTrustFooterLinks();
installPrivacyNotice();
installAcademyRiskTools();

const readerSaveStorageKey = "nakamoto-reader-saves-v2";
const readerPreferenceStorageKey = "nakamoto-reader-preferences-v1";

function getReaderSaves() {
  try {
    const parsed = JSON.parse(readStoredValue(readerSaveStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function setReaderSaves(items) {
  writeStoredValue(readerSaveStorageKey, JSON.stringify(items.slice(0, 80)));
}

function getReaderPreferences() {
  try {
    const parsed = JSON.parse(readStoredValue(readerPreferenceStorageKey) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function setReaderPreferences(items) {
  writeStoredValue(readerPreferenceStorageKey, JSON.stringify(items));
}

function getCurrentReaderPage() {
  const title = document.querySelector("h1")?.textContent?.trim() || document.title.replace(/\s+\|\s+NAKAMOTO.*$/i, "");
  const description = document.querySelector('meta[name="description"]')?.content
    || document.querySelector("main p")?.textContent?.trim()
    || "Saved NAKAMOTO page.";
  const topic = document.querySelector(".eyebrow, .section-kicker")?.textContent?.trim() || "Reading";

  return {
    title: title.slice(0, 120),
    url: window.location.pathname.replace(/^\//, "") || "index.html",
    absoluteUrl: window.location.href,
    description: description.slice(0, 180),
    topic: topic.slice(0, 40),
    savedAt: new Date().toISOString()
  };
}

function isReaderUtilityPage() {
  return document.body.classList.contains("reader-entry-page") || /(reader-dashboard|login|register)\.html$/.test(window.location.pathname);
}

function renderReaderDashboard() {
  const output = document.querySelector("[data-dashboard-saves]");
  if (!output) return;

  const saves = getReaderSaves();
  if (!saves.length) {
    output.innerHTML = `<div class="empty-state"><h3>No saved pages yet.</h3><p>Use the Save page button on articles, guides, news, and tools. Your saved list will appear here.</p><a class="button secondary" href="crypto-news-today.html">Read published news</a></div>`;
  } else {
    output.innerHTML = saves.map((item) => `
      <article class="saved-dashboard-card">
        <span>${escapeHTML(item.topic || "Saved")}</span>
        <h3><a href="${escapeHTML(item.url)}">${escapeHTML(item.title)}</a></h3>
        <p>${escapeHTML(item.description || "Saved reading item.")}</p>
        <small>Saved ${new Date(item.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</small>
        <button type="button" data-remove-save="${escapeHTML(item.url)}">Remove</button>
      </article>
    `).join("");
  }

  output.querySelectorAll("[data-remove-save]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = getReaderSaves().filter((item) => item.url !== button.dataset.removeSave);
      setReaderSaves(next);
      sendAnalyticsEvent("saved_article_remove", { saved_count: next.length });
      renderReaderDashboard();
      updateReaderSaveButtonState();
    });
  });
}

function updateReaderSaveButtonState() {
  const current = getCurrentReaderPage();
  const isSaved = getReaderSaves().some((item) => item.url === current.url);
  document.querySelectorAll("[data-save-current-page]").forEach((button) => {
    button.textContent = isSaved ? "Saved" : "Save page";
    button.setAttribute("aria-pressed", String(isSaved));
  });
}

function saveCurrentReaderPage() {
  const current = getCurrentReaderPage();
  const saves = getReaderSaves();
  const existingIndex = saves.findIndex((item) => item.url === current.url);
  const next = existingIndex >= 0
    ? [current, ...saves.filter((_, index) => index !== existingIndex)]
    : [current, ...saves];
  setReaderSaves(next);
  updateReaderSaveButtonState();
  renderReaderDashboard();
  sendAnalyticsEvent("saved_article_click", {
    article_title: current.title,
    article_url: current.url,
    saved_count: next.length
  });
}

function installReaderSaveStrip() {
  if (document.querySelector("[data-reader-save-strip]")) return;
  if (isReaderUtilityPage()) return;
  if (!document.querySelector("main h1")) return;

  const main = document.querySelector("main");
  const firstSection = main?.querySelector("section");
  if (!main || !firstSection) return;

  const strip = document.createElement("section");
  strip.className = "reader-save-strip";
  strip.dataset.readerSaveStrip = "true";
  strip.innerHTML = `
    <div>
      <span>Reader tools</span>
      <p>Save this page in your browser dashboard or continue your reading path.</p>
    </div>
    <div class="reader-save-actions">
      <button type="button" data-save-current-page aria-pressed="false">Save page</button>
      <a class="button secondary" href="reader-dashboard.html">Dashboard</a>
    </div>
  `;
  firstSection.insertAdjacentElement("afterend", strip);
  strip.querySelector("[data-save-current-page]")?.addEventListener("click", saveCurrentReaderPage);
  updateReaderSaveButtonState();
}

function installReaderPreferences() {
  const form = document.querySelector("[data-reader-preferences]");
  if (!form) return;

  const savedPreferences = getReaderPreferences();
  form.querySelectorAll('input[name="topic"]').forEach((input) => {
    input.checked = savedPreferences.includes(input.value);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const selected = Array.from(form.querySelectorAll('input[name="topic"]:checked')).map((input) => input.value);
    setReaderPreferences(selected);
    sendAnalyticsEvent("reader_preferences_save", {
      preferences: selected.join(", "),
      preference_count: selected.length
    });
    const button = form.querySelector("button");
    if (button) {
      button.textContent = "Preferences saved";
      setTimeout(() => { button.textContent = "Save preferences"; }, 1800);
    }
  });
}

const readerRouteMap = {
  "Bitcoin": [
    ["Bitcoin wallet safety", "bitcoin-wallet-safety.html", "Seed phrases, fake wallets, test transactions, and custody basics."],
    ["Bitcoin start path", "start.html", "Beginner Bitcoin learning from first principles."],
    ["ETF flow tracker", "bitcoin-etf-flow-tracker.html", "ETF context without overreacting to one-day prints."]
  ],
  "Trading Academy": [
    ["Trading Academy", "trading-academy.html", "Risk-first lessons, drills, and chart literacy."],
    ["Trading risk lab", "trading-risk-lab.html", "Practice invalidation, sizing, and journal review."],
    ["Trading methodology", "trading-research-methodology.html", "A calmer process for market research."]
  ],
  "Investing": [
    ["Investing hub", "investing.html", "Portfolio thinking, product context, and research routes."],
    ["Product explainers", "investing-product-explainers.html", "ETF and fund structure before reacting to headlines."],
    ["Finance library", "finance-library/index.html", "Market research, reports, and finance tools."]
  ],
  "Personal Finance": [
    ["Money library", "money-library/index.html", "Budgeting, saving, debt, emergency funds, and guides."],
    ["Daily money brief", "money-library/daily-money-brief.html", "Turn market context into household readiness."],
    ["Investing basics", "money-library/investing-basics.html", "Plain-English foundations before risk."]
  ],
  "News": [
    ["Today's crypto brief", "crypto-news-today.html", "The current source-checked market route."],
    ["News archive", "news-archive.html", "Preserved daily coverage by date."],
    ["Today's source pack", "today-source-pack-2026-08-19.html", "Source links behind the current update."]
  ],
  "Safety": [
    ["Scam checklist", "crypto-scam-checklist.html", "Review before clicking, connecting, or trusting offers."],
    ["Wallet safety", "bitcoin-wallet-safety.html", "Custody and recovery basics."],
    ["Source policy", "source-policy.html", "How to verify claims before acting."]
  ]
};

function renderPersonalizedHomeRoutes() {
  const output = document.querySelector("[data-personalized-routes]");
  if (!output) return;

  const preferences = getReaderPreferences();
  const active = preferences.length ? preferences : ["Trading Academy", "Investing", "Personal Finance", "Bitcoin"];
  const routes = [];
  active.forEach((preference) => {
    (readerRouteMap[preference] || []).forEach((route) => {
      if (!routes.some((item) => item[1] === route[1])) routes.push([preference, ...route]);
    });
  });

  output.innerHTML = routes.slice(0, 8).map(([topic, title, href, description]) => `
    <a class="action-card" href="${escapeHTML(href)}">
      <span>${escapeHTML(topic)}</span>
      <h3>${escapeHTML(title)}.</h3>
      <p>${escapeHTML(description)}</p>
      <em>Open route</em>
    </a>
  `).join("");
}

function installReaderAccountEvents() {
  document.querySelectorAll('form[name="nakamoto-reader-account"]').forEach((form) => {
    form.addEventListener("submit", () => {
      sendAnalyticsEvent("register_submit", { form_name: "nakamoto-reader-account" });
    });
  });

  document.querySelectorAll('form[name="nakamoto-login-request"]').forEach((form) => {
    form.addEventListener("submit", () => {
      sendAnalyticsEvent("login_request", { form_name: "nakamoto-login-request" });
    });
  });

  document.querySelectorAll('a[href*="register.html"], a[href*="login.html"], a[href*="reader-dashboard.html"]').forEach((link) => {
    link.addEventListener("click", () => {
      sendAnalyticsEvent("reader_account_navigation", {
        link_url: link.href,
        link_text: link.textContent.trim().slice(0, 120)
      });
    });
  });

  document.querySelector("[data-clear-saves]")?.addEventListener("click", () => {
    setReaderSaves([]);
    sendAnalyticsEvent("saved_articles_clear");
    renderReaderDashboard();
    updateReaderSaveButtonState();
  });
}

installReaderSaveStrip();
installReaderPreferences();
installReaderAccountEvents();
renderReaderDashboard();
renderPersonalizedHomeRoutes();
updateReaderSaveButtonState();

const monetizationRouteLinks = [
  ["Today's brief", "crypto-news-today.html", "Daily source-checked market route."],
  ["Bitcoin safety", "bitcoin-wallet-safety.html", "Custody, seed phrase, and scam prevention."],
  ["Trading risk", "trading-risk-lab.html", "Position size, invalidation, and journal discipline."],
  ["Investing basics", "investing.html", "Long-term research paths and product context."],
  ["Money reset", "7-day-money-reset.html", "Budget, debt, savings, and weekly review."],
  ["Premium preview", "premium.html", "Research bundles, checklists, and member tools."]
];

function isPublisherContentPage() {
  const path = window.location.pathname.toLowerCase();
  if (document.body.classList.contains("reader-entry-page")) return false;
  if (path.endsWith("/") || path.endsWith("/index.html") || path.includes("404") || path.includes("thanks")) return false;
  return Boolean(document.querySelector("main h1"));
}

function installReadingProgressBar() {
  if (document.querySelector("[data-reading-progress]")) return;
  if (!document.querySelector("main h1")) return;

  const progress = document.createElement("div");
  progress.className = "reading-progress-bar";
  progress.dataset.readingProgress = "true";
  progress.setAttribute("aria-hidden", "true");
  document.body.append(progress);

  const updateProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
    progress.style.setProperty("--reading-progress", `${percent}%`);
  };

  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

function installReaderDepthTracking() {
  if (document.documentElement.dataset.readerDepthInstalled) return;
  if (!document.querySelector("main h1")) return;
  document.documentElement.dataset.readerDepthInstalled = "true";

  const depthMarks = [25, 50, 75, 90];
  const firedDepths = new Set();
  const updateDepth = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const percent = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));

    depthMarks.forEach((mark) => {
      if (percent >= mark && !firedDepths.has(mark)) {
        firedDepths.add(mark);
        sendAnalyticsEvent("reader_scroll_depth", {
          scroll_percent: mark,
          page_path: window.location.pathname
        });
      }
    });
  };

  window.addEventListener("scroll", updateDepth, { passive: true });
  updateDepth();

  [30, 60, 120, 240].forEach((seconds) => {
    window.setTimeout(() => {
      if (document.visibilityState !== "visible") return;
      sendAnalyticsEvent("reader_engaged_time", {
        engaged_seconds: seconds,
        page_path: window.location.pathname
      });
    }, seconds * 1000);
  });
}

function installArticleJourneyPrompt() {
  if (document.querySelector("[data-article-journey-prompt]")) return;
  if (!isPublisherContentPage()) return;

  const main = document.querySelector("main");
  const sections = [...main.querySelectorAll(":scope > section")].filter((section) => {
    return !section.matches(".privacy-notice, .reader-save-strip");
  });
  if (sections.length < 2) return;

  const prompt = document.createElement("section");
  prompt.className = "article-journey-prompt";
  prompt.dataset.articleJourneyPrompt = "true";
  prompt.innerHTML = `
    <div>
      <span>Reader path</span>
      <h2>One useful next step beats five random tabs.</h2>
      <p>Save this page, verify the source route, or continue into the strongest related guide.</p>
    </div>
    <div class="article-journey-actions">
      <button type="button" data-save-current-page aria-pressed="false">Save page</button>
      <a class="button secondary" href="${getRelativePath("resources.html")}">Verify sources</a>
      <a class="button secondary" href="${getRelativePath("best-of-nakamoto.html")}">Best pages</a>
    </div>
  `;

  sections[Math.min(2, sections.length - 1)].insertAdjacentElement("afterend", prompt);
  prompt.querySelector("[data-save-current-page]")?.addEventListener("click", saveCurrentReaderPage);
  updateReaderSaveButtonState();
}

function installMonetizationRoutePanel() {
  if (document.querySelector("[data-monetization-route-panel]")) return;
  if (document.body.classList.contains("reader-entry-page")) return;
  const main = document.querySelector("main");
  if (!main) return;

  const candidateSections = [...main.querySelectorAll(":scope > section")].filter((section) => {
    return !section.matches(".privacy-notice");
  });
  if (candidateSections.length < 3) return;

  const currentPath = window.location.pathname.replace(/^\//, "") || "index.html";
  const routes = monetizationRouteLinks
    .filter(([, href]) => href !== currentPath)
    .slice(0, 4);

  const panel = document.createElement("section");
  panel.className = "monetization-route-panel";
  panel.dataset.monetizationRoutePanel = "true";
  panel.innerHTML = `
    <div class="section-heading">
      <p class="section-kicker">Continue Reading</p>
      <h2>Useful next steps, not random clicks.</h2>
      <p>More page views only matter when readers find better sources, safer decisions, and clearer learning paths.</p>
    </div>
    <div class="monetization-route-grid">
      ${routes.map(([title, href, summary]) => `
        <a class="action-card" href="${escapeHTML(href)}">
          <span>Next</span>
          <h3>${escapeHTML(title)}.</h3>
          <p>${escapeHTML(summary)}</p>
          <em>Open route</em>
        </a>
      `).join("")}
    </div>
  `;

  candidateSections[Math.min(4, candidateSections.length - 1)].insertAdjacentElement("afterend", panel);
}

function installRevenueEngagementTracking() {
  if (document.documentElement.dataset.revenueTrackingInstalled) return;
  document.documentElement.dataset.revenueTrackingInstalled = "true";

  document.addEventListener("click", (event) => {
    const routeLink = event.target.closest?.(".monetization-route-panel a");

    if (routeLink) {
      sendAnalyticsEvent("recommended_route_click", describeLink(routeLink));
    }
  });

  if (!("IntersectionObserver" in window)) return;

  const seen = new Set();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      sendAnalyticsEvent("revenue_module_view", {
        module_type: "recommendation",
        page_path: window.location.pathname
      });
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -20% 0px", threshold: 0.2 });

  document.querySelectorAll(".monetization-route-panel").forEach((element) => {
    observer.observe(element);
  });
}

function installArticleShareTools() {
  if (!isPublisherContentPage() || document.querySelector("[data-share-tools]")) return;
  const main = document.querySelector("main");
  const heading = main?.querySelector("h1");
  if (!main || !heading) return;

  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
  const title = heading.textContent.trim();
  const tools = document.createElement("aside");
  tools.className = "article-share-tools";
  tools.dataset.shareTools = "true";
  tools.setAttribute("aria-label", "Share this page");
  tools.innerHTML = `
    <strong>Useful? Share the source-led version.</strong>
    <div>
      <button type="button" data-native-share>Share</button>
      <button type="button" data-copy-link>Copy link</button>
      <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonical)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(title)}" target="_blank" rel="noopener noreferrer">X</a>
    </div>
    <span data-share-status aria-live="polite"></span>
  `;
  heading.closest("section, article")?.insertAdjacentElement("afterend", tools) || main.prepend(tools);

  const status = tools.querySelector("[data-share-status]");
  tools.querySelector("[data-native-share]")?.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: canonical });
        sendAnalyticsEvent("content_share", { method: "native", page_path: window.location.pathname });
      } catch (error) {
        if (error?.name !== "AbortError") status.textContent = "Sharing is unavailable in this browser.";
      }
    } else {
      status.textContent = "Use Copy link or a social button.";
    }
  });
  tools.querySelector("[data-copy-link]")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(canonical);
      status.textContent = "Link copied.";
      sendAnalyticsEvent("content_share", { method: "copy_link", page_path: window.location.pathname });
    } catch {
      status.textContent = canonical;
    }
  });
  tools.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    sendAnalyticsEvent("content_share", { method: link.textContent.toLowerCase(), page_path: window.location.pathname });
  }));
}

function installCampaignAttribution() {
  if (document.documentElement.dataset.campaignAttributionInstalled) return;
  document.documentElement.dataset.campaignAttributionInstalled = "true";
  const params = new URLSearchParams(window.location.search);
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const campaign = Object.fromEntries(allowed
    .map((key) => [key, (params.get(key) || "").slice(0, 100)])
    .filter(([, value]) => value));
  if (!Object.keys(campaign).length) return;

  try {
    sessionStorage.setItem("nakamoto-campaign", JSON.stringify({
      ...campaign,
      landing_page: window.location.pathname,
      captured_at: new Date().toISOString()
    }));
  } catch {}

  sendAnalyticsEvent("campaign_landing", {
    ...campaign,
    landing_page: window.location.pathname
  });
}

installReadingProgressBar();
installReaderDepthTracking();
installArticleJourneyPrompt();
installMonetizationRoutePanel();
installRevenueEngagementTracking();
installArticleShareTools();
installCampaignAttribution();
