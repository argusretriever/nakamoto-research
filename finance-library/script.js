const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navPanel = document.querySelector("[data-nav-panel]");
const tabsRoot = document.querySelector("[data-tabs]");
const signupForm = document.querySelector("[data-signup-form]");
const formMessage = document.querySelector("[data-form-message]");
const contactForm = document.querySelector("[data-contact-form]");
const contactMessage = document.querySelector("[data-contact-message]");
const compassForm = document.querySelector("[data-compass-form]");
const compassTitle = document.querySelector("[data-compass-title]");
const compassCopy = document.querySelector("[data-compass-copy]");
const compassSteps = document.querySelectorAll("[data-compass-step]");
const ritualItems = document.querySelectorAll("[data-ritual-item]");
const ritualProgress = document.querySelector("[data-ritual-progress]");
const ritualNote = document.querySelector("[data-ritual-note]");
const compoundCalculator = document.querySelector("[data-compound-calculator]");
const feeCalculator = document.querySelector("[data-fee-calculator]");
const allocationChecker = document.querySelector("[data-allocation-checker]");
const journeyButtons = document.querySelectorAll("[data-journey]");
const saveResourceButtons = document.querySelectorAll("[data-save-resource]");
const savedLibrary = document.querySelector("[data-saved-library]");
const dashboardJourney = document.querySelector("[data-dashboard-journey]");
const dashboardNote = document.querySelector("[data-dashboard-note]");
const dashboardMeter = document.querySelector("[data-dashboard-meter]");
const dashboardSavedCount = document.querySelector("[data-dashboard-saved-count]");
const dashboardRitualCount = document.querySelector("[data-dashboard-ritual-count]");
const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("[data-search-input]");
const searchCategory = document.querySelector("[data-search-category]");
const searchType = document.querySelector("[data-search-type]");
const searchResults = document.querySelector("[data-search-results]");
const searchCount = document.querySelector("[data-search-count]");
const compareTool = document.querySelector("[data-compare-tool]");
const compareOutput = document.querySelector("[data-compare-output]");
const watchlistForm = document.querySelector("[data-watchlist-form]");
const watchlistItems = document.querySelector("[data-watchlist-items]");
const journeyProgressLabel = document.querySelector("[data-journey-progress-label]");
const journeyProgressNote = document.querySelector("[data-journey-progress-note]");
const journeyProgressMeter = document.querySelector("[data-journey-progress-meter]");
const journeyProgressCount = document.querySelector("[data-journey-progress-count]");
const iqScoreMini = document.querySelector("[data-iq-score-mini]");
const completeStepButtons = document.querySelectorAll("[data-complete-step]");
const achievementCards = document.querySelectorAll("[data-achievement]");
const iqAssessment = document.querySelector("[data-iq-assessment]");
const iqResultTitle = document.querySelector("[data-iq-result-title]");
const iqResultCopy = document.querySelector("[data-iq-result-copy]");
const iqResultMeter = document.querySelector("[data-iq-result-meter]");
const iqResultScore = document.querySelector("[data-iq-result-score]");
const iqResultStage = document.querySelector("[data-iq-result-stage]");
const portfolioClinic = document.querySelector("[data-portfolio-clinic]");
const clinicTitle = document.querySelector("[data-clinic-title]");
const clinicCopy = document.querySelector("[data-clinic-copy]");
const clinicMeter = document.querySelector("[data-clinic-meter]");
const clinicScore = document.querySelector("[data-clinic-score]");
const clinicGrade = document.querySelector("[data-clinic-grade]");
const tradingModuleButtons = document.querySelectorAll("[data-trading-module]");
const tradingProgressTitle = document.querySelector("[data-trading-progress-title]");
const tradingProgressNote = document.querySelector("[data-trading-progress-note]");
const tradingProgressMeter = document.querySelector("[data-trading-progress-meter]");
const tradingProgressCount = document.querySelector("[data-trading-progress-count]");
const investorProfileButtons = document.querySelectorAll("[data-investor-profile]");
const investorProfileTitle = document.querySelector("[data-investor-profile-title]");
const investorProfileCopy = document.querySelector("[data-investor-profile-copy]");
const investorProfileCode = document.querySelector("[data-investor-profile-code]");
const investorProfileMeter = document.querySelector("[data-investor-profile-meter]");
const portfolioSimulator = document.querySelector("[data-portfolio-simulator]");
const simulatorValue = document.querySelector("[data-simulator-value]");
const simulatorNote = document.querySelector("[data-simulator-note]");
const simulatorMeter = document.querySelector("[data-simulator-meter]");
const simulatorRange = document.querySelector("[data-simulator-range]");
const simulatorRisk = document.querySelector("[data-simulator-risk]");
const simulatorOutput = document.querySelector("[data-simulator-output]");
const alertForm = document.querySelector("[data-alert-form]");
const alertList = document.querySelector("[data-alert-list]");
const alertOutput = document.querySelector("[data-alert-output]");
const themeToggles = document.querySelectorAll("[data-theme-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const spotlightItems = document.querySelectorAll("[data-spotlight]");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const scrollProgress = document.querySelector(".scroll-progress span");
const storyLinks = document.querySelectorAll("[data-story-link]");
const storySections = document.querySelectorAll("[data-story-section]");
const animatedHeadings = document.querySelectorAll("h1, .section-heading h2, .method-copy h2, .footer-hero h2");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const currency = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0, style: "currency", currency: "USD" });
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
      event_category: "finance_library",
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
      } else if (link.closest("nav, .hero, .art-card, .resource-card, .journey-card, .footer-links")) {
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
      form_name: form.getAttribute("aria-label") || form.dataset.formName || form.id || "finance_library_form"
    });
  });
};

installGrowthTracking();
const storageKeys = {
  journey: "nakamoto-finance-library-active-journey",
  savedResources: "nakamoto-finance-library-saved-resources",
  ritual: "nakamoto-finance-library-weekly-ritual",
  watchlist: "nakamoto-finance-library-watchlist",
  journeyMilestones: "nakamoto-finance-library-journey-milestones",
  achievements: "nakamoto-finance-library-achievements",
  iqAssessment: "nakamoto-finance-library-iq-assessment",
  clinic: "nakamoto-finance-library-portfolio-clinic",
  tradingAcademy: "nakamoto-finance-library-trading-academy",
  investorProfile: "nakamoto-finance-library-investor-profile",
  alerts: "nakamoto-finance-library-alerts"
};
const compassPaths = {
  "builder-portfolio": {
    title: "Core portfolio architecture",
    copy:
      "Start with allocation rules, rebalance bands, ETF overlap, and a written policy before adding satellite positions.",
    steps: ["Allocation audit", "ETF overlap check", "Rebalancing policy"]
  },
  "builder-etf": {
    title: "Low-cost compounding engine",
    copy:
      "Prioritize broad exposure, tax efficiency, low fees, tracking quality, and overlap control across long-horizon ETFs.",
    steps: ["Fund screen", "Overlap map", "Tax location"]
  },
  "builder-stocks": {
    title: "Quality stock research path",
    copy:
      "Build a watchlist around durable margins, reinvestment runway, balance sheet strength, and valuation discipline.",
    steps: ["Moat checklist", "Cash flow model", "Position sizing"]
  },
  "transition-portfolio": {
    title: "Risk transition plan",
    copy:
      "Balance growth exposure with drawdown tolerance, cash needs, bond duration, and a slower rebalancing cadence.",
    steps: ["Risk budget", "Duration review", "Drawdown rules"]
  },
  "transition-etf": {
    title: "ETF simplification plan",
    copy:
      "Reduce duplicate exposures, clarify each fund's job, and make the portfolio easier to monitor every quarter.",
    steps: ["Holdings overlap", "Fee review", "Role definition"]
  },
  "transition-stocks": {
    title: "Concentrated holding review",
    copy:
      "Pressure-test single-stock risk against goals, time horizon, valuation, and the opportunity cost of index exposure.",
    steps: ["Risk contribution", "Valuation range", "Exit criteria"]
  },
  "income-portfolio": {
    title: "Preservation and income map",
    copy:
      "Focus on cash flow reliability, sequence risk, inflation protection, and withdrawal rules before reaching for yield.",
    steps: ["Cash ladder", "Bond role", "Withdrawal policy"]
  },
  "income-etf": {
    title: "Income ETF due diligence",
    copy:
      "Separate sustainable income from high-yield marketing by reviewing holdings quality, duration, distribution history, and tax treatment.",
    steps: ["Yield quality", "Duration risk", "Tax profile"]
  },
  "income-stocks": {
    title: "Dividend durability desk",
    copy:
      "Evaluate payout safety, balance sheet resilience, cash flow coverage, and valuation before relying on dividend income.",
    steps: ["Payout safety", "Debt maturity", "Dividend policy"]
  }
};

document.body.classList.add("page-ready");

const prepareTextReveal = () => {
  if (reduceMotion) return;

  animatedHeadings.forEach((heading) => {
    if (heading.querySelector(".text-reveal")) return;
    const text = heading.textContent.trim();
    heading.setAttribute("aria-label", text);
    heading.textContent = "";

    const wrapper = document.createElement("span");
    wrapper.className = "text-reveal";
    wrapper.setAttribute("aria-hidden", "true");

    text.split(" ").forEach((word, index, words) => {
      const span = document.createElement("span");
      span.className = "word";
      span.style.setProperty("--word-index", index);
      span.textContent = word;
      wrapper.append(span);
      if (index < words.length - 1) wrapper.append(document.createTextNode(" "));
    });

    heading.append(wrapper);
  });
};

const syncHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 12);
};

const syncScrollProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  scrollProgress?.style.setProperty("--scroll-progress", Math.max(0, Math.min(1, progress)).toFixed(4));
};

const setTheme = (theme) => {
  document.body.dataset.theme = theme;
  themeColorMeta?.setAttribute("content", theme === "dark" ? "#080909" : "#f5f1e8");
  const nextLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  themeToggles.forEach((toggle) => toggle.setAttribute("aria-label", nextLabel));
  try {
    localStorage.setItem("nakamoto-finance-library-theme", theme);
  } catch {
    // Theme persistence is a nice-to-have; the UI still works if storage is unavailable.
  }
};

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem("nakamoto-finance-library-theme");
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  } catch {
    return "dark";
  }
  return "dark";
};

setTheme(getInitialTheme());
prepareTextReveal();
syncHeader();
syncScrollProgress();
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("scroll", syncScrollProgress, { passive: true });
window.addEventListener("resize", syncScrollProgress, { passive: true });

const markCurrentNavigation = () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("./")) return;
    const linkPage = href.slice(2).split("#")[0];
    if (linkPage === currentPage) link.setAttribute("aria-current", "page");
  });
};

markCurrentNavigation();

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  const nextOpen = !isOpen;
  navToggle.setAttribute("aria-expanded", String(nextOpen));
  navToggle.setAttribute("aria-label", nextOpen ? "Close menu" : "Open menu");
  navPanel?.classList.toggle("open", nextOpen);
});

navPanel?.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open menu");
    navPanel.classList.remove("open");
  }
});

themeToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
});

spotlightItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    if (reduceMotion) return;
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const tiltY = ((x / rect.width) - 0.5) * 4;
    const tiltX = ((y / rect.height) - 0.5) * -4;
    item.style.setProperty("--mx", `${x}px`);
    item.style.setProperty("--my", `${y}px`);
    item.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    item.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
  });

  item.addEventListener("pointerleave", () => {
    item.style.setProperty("--tilt-x", "0deg");
    item.style.setProperty("--tilt-y", "0deg");
  });
});

let ticking = false;
const syncParallax = () => {
  if (reduceMotion) return;
  parallaxItems.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0.1);
    const rect = item.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const itemCenter = rect.top + rect.height / 2;
    const offset = (viewportCenter - itemCenter) * speed;
    item.style.setProperty("--parallax-y", `${Math.max(-32, Math.min(32, offset))}px`);
  });
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(syncParallax);
      ticking = true;
    }
  },
  { passive: true }
);
syncParallax();

const readCompassValue = (name) => {
  const checked = compassForm?.querySelector(`input[name="${name}"]:checked`);
  return checked instanceof HTMLInputElement ? checked.value : "";
};

const updateCompass = () => {
  if (!compassForm || !compassTitle || !compassCopy) return;
  const horizon = readCompassValue("horizon") || "builder";
  const focus = readCompassValue("focus") || "portfolio";
  const path = compassPaths[`${horizon}-${focus}`] || compassPaths["builder-portfolio"];

  compassTitle.textContent = path.title;
  compassCopy.textContent = path.copy;
  compassSteps.forEach((step, index) => {
    step.textContent = path.steps[index] || "";
  });

  try {
    localStorage.setItem("nakamoto-finance-library-compass", JSON.stringify({ horizon, focus }));
  } catch {
    // The compass still works when private browsing blocks storage.
  }
};

const restoreCompass = () => {
  if (!compassForm) return;
  try {
    const saved = JSON.parse(localStorage.getItem("nakamoto-finance-library-compass") || "{}");
    ["horizon", "focus"].forEach((name) => {
      const value = saved[name];
      const input = value ? compassForm.querySelector(`input[name="${name}"][value="${value}"]`) : null;
      if (input instanceof HTMLInputElement) input.checked = true;
    });
  } catch {
    // Ignore malformed saved state and keep the default path.
  }
  updateCompass();
};

compassForm?.addEventListener("submit", (event) => event.preventDefault());
compassForm?.addEventListener("change", updateCompass);
restoreCompass();

const updateRitual = () => {
  const completed = [...ritualItems].filter((item) => item.checked).length;
  const total = ritualItems.length || 1;
  const percent = Math.round((completed / total) * 100);
  ritualProgress?.style.setProperty("--ritual-progress", `${percent}%`);

  if (ritualNote) {
    ritualNote.textContent =
      completed === total
        ? "Ritual complete. Come back next week with a cleaner decision log."
        : `${completed} of ${total} complete. Turn reading into a decision habit.`;
  }

  try {
    const state = {};
    ritualItems.forEach((item) => {
      state[item.dataset.ritualItem] = item.checked;
    });
    localStorage.setItem(storageKeys.ritual, JSON.stringify(state));
  } catch {
    // Progress persistence is helpful, but not required for the checklist to work.
  }
};

try {
  const savedRitual = JSON.parse(localStorage.getItem(storageKeys.ritual) || "{}");
  ritualItems.forEach((item) => {
    item.checked = Boolean(savedRitual[item.dataset.ritualItem]);
  });
} catch {
  // Keep unchecked defaults if stored data cannot be parsed.
}

ritualItems.forEach((item) => item.addEventListener("change", updateRitual));
updateRitual();

const getSavedResources = () => {
  try {
    const resources = JSON.parse(localStorage.getItem(storageKeys.savedResources) || "[]");
    return Array.isArray(resources) ? resources : [];
  } catch {
    return [];
  }
};

const setSavedResources = (resources) => {
  try {
    localStorage.setItem(storageKeys.savedResources, JSON.stringify(resources));
  } catch {
    // Saving is optional; the interface still works during the current visit.
  }
};

const getRitualCompletion = () => {
  try {
    const ritual = JSON.parse(localStorage.getItem(storageKeys.ritual) || "{}");
    const values = Object.values(ritual);
    const completed = values.filter(Boolean).length;
    return { completed, total: Math.max(3, values.length || 3) };
  } catch {
    return { completed: 0, total: 3 };
  }
};

const renderSavedLibrary = () => {
  const resources = getSavedResources();

  if (savedLibrary) {
    savedLibrary.innerHTML = "";
    if (!resources.length) {
      const empty = document.createElement("li");
      empty.textContent = "No saved resources yet.";
      savedLibrary.append(empty);
    } else {
      resources.forEach((resource) => {
        const item = document.createElement("li");
        item.textContent = resource;
        savedLibrary.append(item);
      });
    }
  }

  if (dashboardSavedCount) dashboardSavedCount.textContent = String(resources.length);

  saveResourceButtons.forEach((button) => {
    const resource = button.dataset.saveResource;
    const saved = Boolean(resource && resources.includes(resource));
    button.classList.toggle("saved", saved);
    button.setAttribute("aria-pressed", String(saved));
  });
};

const renderDashboardStatus = () => {
  let activeJourney = "Core portfolio architecture";
  try {
    activeJourney = localStorage.getItem(storageKeys.journey) || activeJourney;
  } catch {
    activeJourney = "Core portfolio architecture";
  }
  const resources = getSavedResources();
  const ritual = getRitualCompletion();
  const progress = Math.min(100, Math.round((resources.length / 4) * 40 + (ritual.completed / ritual.total) * 40 + (activeJourney ? 20 : 0)));

  if (dashboardJourney) dashboardJourney.textContent = activeJourney;
  if (dashboardRitualCount) dashboardRitualCount.textContent = `${ritual.completed}/${ritual.total}`;
  if (dashboardMeter) dashboardMeter.style.setProperty("--dashboard-progress", `${progress}%`);
  if (dashboardNote) {
    dashboardNote.textContent =
      resources.length > 0
        ? "Your workspace is building a useful research memory."
        : "Choose a journey and save resources to personalize this workspace.";
  }

  journeyButtons.forEach((button) => {
    const active = button.dataset.journey === activeJourney;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  renderSavedLibrary();
};

journeyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const journey = button.dataset.journey || "Core portfolio architecture";
    try {
      localStorage.setItem(storageKeys.journey, journey);
    } catch {
      // Keep the button feedback even if storage is blocked.
    }
    renderDashboardStatus();
  });
});

saveResourceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const resource = button.dataset.saveResource;
    if (!resource) return;
    const resources = getSavedResources();
    if (!resources.includes(resource)) resources.push(resource);
    setSavedResources(resources);
    button.classList.add("saved");
    button.setAttribute("aria-label", `${resource} saved`);
    renderDashboardStatus();
  });
});

renderDashboardStatus();

let searchItems = [];

const renderSearchResults = (query = "") => {
  if (!searchResults) return;
  const normalized = query.trim().toLowerCase();
  const activeCategory = searchCategory?.value || "";
  const activeType = searchType?.value || "";
  const matches = searchItems.filter((item) => {
    if (activeCategory && item.category !== activeCategory) return false;
    if (activeType && item.type !== activeType) return false;
    if (!normalized) return true;
    const haystack = [item.title, item.type, item.category, item.summary, ...(item.tags || [])].join(" ").toLowerCase();
    return haystack.includes(normalized);
  });

  searchResults.innerHTML = "";
  matches.forEach((item) => {
    const article = document.createElement("article");
    article.className = "search-result art-card";
    const tags = Array.isArray(item.tags) ? item.tags.slice(0, 5) : [];
    article.innerHTML = `
      <span>${item.type} / ${item.category}</span>
      <h3><a href="${item.url}">${item.title}</a></h3>
      <p>${item.summary}</p>
      <small>${tags.join(" / ")}</small>
    `;
    searchResults.append(article);
  });

  if (!matches.length) {
    const empty = document.createElement("article");
    empty.className = "search-result art-card";
    empty.innerHTML = "<h3>No matching resources yet.</h3><p>Try a broader term like ETF, portfolio, market, fees, or retirement.</p>";
    searchResults.append(empty);
  }

  if (searchCount) {
    const filters = [activeCategory, activeType].filter(Boolean).join(" / ");
    searchCount.textContent = `${matches.length} resources found${filters ? ` in ${filters}` : ""}`;
  }
};

const loadSearchIndex = async () => {
  if (!searchResults) return;
  try {
    const response = await fetch("./content-index.json");
    const data = await response.json();
    searchItems = Array.isArray(data.items) ? data.items : [];
  } catch {
    searchItems = [
      {
        title: "Research Library",
        type: "Hub",
        category: "Research",
        url: "./research-library.html",
        summary: "Browse NAKAMOTO Finance Library research categories, desks, and launch clusters.",
        tags: ["research", "library", "articles"]
      }
    ];
  }
  renderSearchResults(searchInput?.value || "");
};

let searchTrackingTimer;
const trackSearchUsage = (query) => {
  clearTimeout(searchTrackingTimer);
  const normalized = query.trim();
  if (normalized.length < 2) return;
  searchTrackingTimer = setTimeout(() => {
    trackGrowthEvent("site_search", {
      search_term: normalized.slice(0, 80),
      result_count: searchResults?.querySelectorAll(".search-result").length || 0
    });
  }, 500);
};

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  trackSearchUsage(searchInput?.value || "");
});
searchInput?.addEventListener("input", () => {
  renderSearchResults(searchInput.value);
  trackSearchUsage(searchInput.value);
});
searchCategory?.addEventListener("change", () => renderSearchResults(searchInput?.value || ""));
searchType?.addEventListener("change", () => renderSearchResults(searchInput?.value || ""));
loadSearchIndex();

const updateCompareTool = () => {
  if (!compareTool || !compareOutput) return;
  const fundA = String(compareTool.querySelector('[name="fundA"]')?.value || "Fund A").trim().toUpperCase();
  const fundB = String(compareTool.querySelector('[name="fundB"]')?.value || "Fund B").trim().toUpperCase();
  const goal = String(compareTool.querySelector('[name="goal"]')?.value || "core");
  const guidance = {
    core: `${fundA} and ${fundB} should be compared on breadth, overlap, expense ratio, tracking quality, and tax efficiency before choosing a core holding.`,
    income: `${fundA} and ${fundB} should be compared on yield quality, dividend durability, sector concentration, fees, and total-return tradeoffs.`,
    factor: `${fundA} and ${fundB} should be compared on factor exposure, methodology, turnover, concentration, and role inside the total portfolio.`
  };
  compareOutput.textContent = guidance[goal] || guidance.core;
};

compareTool?.addEventListener("input", updateCompareTool);
compareTool?.addEventListener("submit", (event) => event.preventDefault());
updateCompareTool();

const getWatchlist = () => {
  try {
    const list = JSON.parse(localStorage.getItem(storageKeys.watchlist) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
};

const setWatchlist = (list) => {
  try {
    localStorage.setItem(storageKeys.watchlist, JSON.stringify(list));
  } catch {
    // The current page still updates if persistence is blocked.
  }
};

const renderWatchlist = () => {
  if (!watchlistItems) return;
  const list = getWatchlist();
  watchlistItems.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("li");
    empty.textContent = "No watchlist items yet.";
    watchlistItems.append(empty);
    return;
  }

  list.forEach((symbol) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${symbol}</strong><span>Research queue</span>`;
    watchlistItems.append(item);
  });
};

watchlistForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = watchlistForm.querySelector('[name="symbol"]');
  const symbol = input instanceof HTMLInputElement ? input.value.trim().toUpperCase() : "";
  if (!symbol) return;
  const list = getWatchlist();
  if (!list.includes(symbol)) list.push(symbol);
  setWatchlist(list);
  watchlistForm.reset();
  renderWatchlist();
});

renderWatchlist();

const readJsonState = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJsonState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The current page can still show progress when storage is unavailable.
  }
};

const getMilestones = () => {
  const milestones = readJsonState(storageKeys.journeyMilestones, []);
  return Array.isArray(milestones) ? milestones : [];
};

const getAchievements = () => {
  const achievements = readJsonState(storageKeys.achievements, []);
  return Array.isArray(achievements) ? achievements : [];
};

const unlockAchievement = (name) => {
  const achievements = getAchievements();
  if (!achievements.includes(name)) {
    achievements.push(name);
    writeJsonState(storageKeys.achievements, achievements);
  }
};

const completeMilestone = (name) => {
  const milestones = getMilestones();
  if (!milestones.includes(name)) {
    milestones.push(name);
    writeJsonState(storageKeys.journeyMilestones, milestones);
  }

  if (name.includes("Investor IQ")) unlockAchievement("First Assessment");
  if (name.includes("Goal")) unlockAchievement("Goal Architect");
  if (name.includes("Portfolio clinic")) unlockAchievement("Portfolio Auditor");
  if (name.includes("Research lab")) unlockAchievement("Research Apprentice");
  renderJourneyProgress();
};

function renderJourneyProgress() {
  const milestones = getMilestones();
  const percent = Math.min(100, Math.round((milestones.length / 7) * 100));
  const iq = readJsonState(storageKeys.iqAssessment, null);
  const achievements = getAchievements();

  journeyProgressMeter?.style.setProperty("--dashboard-progress", `${percent}%`);
  if (journeyProgressCount) journeyProgressCount.textContent = `${milestones.length}/7`;
  if (journeyProgressLabel) {
    journeyProgressLabel.textContent =
      milestones.length >= 7 ? "Advanced journey complete" : milestones.length ? "Journey in motion" : "Begin your path";
  }
  if (journeyProgressNote) {
    journeyProgressNote.textContent =
      milestones.length >= 7
        ? "Your next loop is deeper research, better rules, and quarterly review."
        : `${Math.max(0, 7 - milestones.length)} milestones remain in your investor path.`;
  }
  if (iqScoreMini) iqScoreMini.textContent = iq?.score ? String(iq.score) : "--";

  completeStepButtons.forEach((button) => {
    const complete = milestones.includes(button.dataset.completeStep);
    button.classList.toggle("saved", complete);
    button.textContent = complete ? "Completed" : "Mark done";
    button.setAttribute("aria-pressed", String(complete));
  });

  achievementCards.forEach((card) => {
    card.classList.toggle("unlocked", achievements.includes(card.dataset.achievement));
  });
}

completeStepButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.completeStep) completeMilestone(button.dataset.completeStep);
  });
});

const renderIqResult = (result) => {
  if (!result) return;
  iqResultMeter?.style.setProperty("--dashboard-progress", `${result.score}%`);
  if (iqResultScore) iqResultScore.textContent = String(result.score);
  if (iqResultStage) iqResultStage.textContent = result.stage;
  if (iqResultTitle) iqResultTitle.textContent = `${result.stage} investor`;
  if (iqResultCopy) iqResultCopy.textContent = result.copy;
  renderJourneyProgress();
};

const getIqStage = (score) => {
  if (score >= 78) {
    return {
      stage: "Advanced",
      copy: "You are ready for research labs, valuation discipline, portfolio refinement, and market regime work."
    };
  }
  if (score >= 52) {
    return {
      stage: "Builder",
      copy: "You have useful foundations. Focus next on portfolio policy, ETF overlap, and review rituals."
    };
  }
  return {
    stage: "Foundation",
    copy: "Start with investing foundations, goal design, fund basics, and behavior guardrails."
  };
};

iqAssessment?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(iqAssessment);
  const values = ["plan", "behavior", "funds", "research", "review"].map((name) => Number(data.get(name) || 0));
  if (values.some((value) => value === 0)) return;
  const score = values.reduce((sum, value) => sum + value, 0);
  const stage = getIqStage(score);
  const result = { score, stage: stage.stage, copy: stage.copy };
  writeJsonState(storageKeys.iqAssessment, result);
  completeMilestone("Investor IQ assessment");
  unlockAchievement("First Assessment");
  renderIqResult(result);
});

renderIqResult(readJsonState(storageKeys.iqAssessment, null));

const renderClinic = () => {
  if (!portfolioClinic) return;
  const checkedItems = [...portfolioClinic.querySelectorAll("[data-clinic-item]")].filter((item) => item.checked);
  const count = checkedItems.length;
  const total = portfolioClinic.querySelectorAll("[data-clinic-item]").length || 8;
  const percent = Math.round((count / total) * 100);
  const grade = count >= 7 ? "Strong" : count >= 5 ? "Builder" : count >= 3 ? "Needs work" : "Unclear";

  clinicMeter?.style.setProperty("--dashboard-progress", `${percent}%`);
  if (clinicScore) clinicScore.textContent = `${count}/${total}`;
  if (clinicGrade) clinicGrade.textContent = grade;
  if (clinicTitle) clinicTitle.textContent = count >= 7 ? "Portfolio process is strong" : "Keep tightening the plan";
  if (clinicCopy) {
    clinicCopy.textContent =
      count >= 7
        ? "You have a strong review foundation. Next step: document actions and set a quarterly cadence."
        : "Use unchecked items as your improvement queue before making new investments.";
  }

  const itemNames = checkedItems.map((item) => item.dataset.clinicItem);
  writeJsonState(storageKeys.clinic, itemNames);
  if (count === total) {
    completeMilestone("Portfolio clinic completed");
    unlockAchievement("Portfolio Auditor");
  }
};

if (portfolioClinic) {
  const savedClinic = readJsonState(storageKeys.clinic, []);
  portfolioClinic.querySelectorAll("[data-clinic-item]").forEach((item) => {
    item.checked = Array.isArray(savedClinic) && savedClinic.includes(item.dataset.clinicItem);
    item.addEventListener("change", renderClinic);
  });
  renderClinic();
}

renderJourneyProgress();

const getTradingModules = () => {
  const modules = readJsonState(storageKeys.tradingAcademy, []);
  return Array.isArray(modules) ? modules : [];
};

const renderTradingProgress = () => {
  if (!tradingModuleButtons.length) return;
  const modules = getTradingModules();
  const total = tradingModuleButtons.length || 10;
  const percent = Math.round((modules.length / total) * 100);

  tradingProgressMeter?.style.setProperty("--dashboard-progress", `${percent}%`);
  if (tradingProgressCount) tradingProgressCount.textContent = `${modules.length}/${total}`;
  if (tradingProgressTitle) {
    tradingProgressTitle.textContent =
      modules.length === total
        ? "Professional process ready"
        : modules.length >= 6
          ? "Evidence and execution stage"
          : modules.length >= 3
            ? "Risk framework forming"
            : "Build the foundation";
  }
  if (tradingProgressNote) {
    tradingProgressNote.textContent =
      modules.length === total
        ? "Next step: keep a weekly review rhythm before increasing complexity."
        : `${total - modules.length} modules remain before the full trading process is complete.`;
  }

  tradingModuleButtons.forEach((button) => {
    const complete = modules.includes(button.dataset.tradingModule);
    button.classList.toggle("saved", complete);
    button.textContent = complete ? "Module complete" : "Mark module complete";
    button.setAttribute("aria-pressed", String(complete));
  });
};

tradingModuleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const module = button.dataset.tradingModule;
    if (!module) return;
    const modules = getTradingModules();
    if (!modules.includes(module)) modules.push(module);
    writeJsonState(storageKeys.tradingAcademy, modules);
    renderTradingProgress();
  });
});

renderTradingProgress();

const profileGuidance = {
  Beginner: {
    code: "BG",
    copy: "Start with Academy foundations, glossary maps, Investor IQ, and the first contribution roadmap.",
    progress: 18
  },
  Accumulator: {
    code: "AC",
    copy: "Focus on ETF diligence, contribution rhythm, tax-aware accounts, model portfolios, and quarterly reviews.",
    progress: 42
  },
  Researcher: {
    code: "RS",
    copy: "Use thesis libraries, case studies, market history, reports, and research lab workflows.",
    progress: 68
  },
  Retiree: {
    code: "RT",
    copy: "Prioritize withdrawal policy, sequence risk, liquidity, income quality, taxes, and portfolio clinic reviews.",
    progress: 74
  },
  Income: {
    code: "IN",
    copy: "Study yield quality, dividend durability, bonds, tax treatment, and income-focused thesis reviews.",
    progress: 62
  },
  Trader: {
    code: "TR",
    copy: "Use Trading Academy, risk units, journaling, backtesting, execution checklists, and Market Pulse.",
    progress: 55
  }
};

const renderInvestorProfile = () => {
  if (!investorProfileButtons.length && !investorProfileTitle) return;
  let profile = "";
  try {
    profile = localStorage.getItem(storageKeys.investorProfile) || "";
  } catch {
    profile = "";
  }
  const guidance = profileGuidance[profile];

  if (investorProfileTitle) investorProfileTitle.textContent = profile || "Choose profile";
  if (investorProfileCopy) investorProfileCopy.textContent = guidance?.copy || "Your recommended path will appear here.";
  if (investorProfileCode) investorProfileCode.textContent = guidance?.code || "--";
  investorProfileMeter?.style.setProperty("--dashboard-progress", `${guidance?.progress || 0}%`);

  investorProfileButtons.forEach((button) => {
    const selected = button.dataset.investorProfile === profile;
    button.classList.toggle("saved", selected);
    button.textContent = selected ? "Selected" : "Use profile";
    button.setAttribute("aria-pressed", String(selected));
  });
};

investorProfileButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const profile = button.dataset.investorProfile || "";
    try {
      localStorage.setItem(storageKeys.investorProfile, profile);
    } catch {
      // Profile selection still updates visually for the current visit.
    }
    renderInvestorProfile();
  });
});

renderInvestorProfile();

const updatePortfolioSimulator = () => {
  if (!portfolioSimulator) return;
  const readSimulatorNumber = (name, fallback = 0) => {
    const input = portfolioSimulator.querySelector(`[name="${name}"]`);
    const value = input instanceof HTMLInputElement ? Number(input.value) : fallback;
    return Number.isFinite(value) ? value : fallback;
  };
  const balance = readSimulatorNumber("balance");
  const contribution = readSimulatorNumber("contribution");
  const years = Math.max(1, readSimulatorNumber("years", 1));
  const returnRate = readSimulatorNumber("returnRate") / 100;
  const equity = Math.max(0, Math.min(100, readSimulatorNumber("equity", 60)));
  const months = years * 12;
  const monthlyReturn = returnRate / 12;
  let value = balance;

  for (let month = 0; month < months; month += 1) {
    value = value * (1 + monthlyReturn) + contribution;
  }

  const volatilityProxy = 4 + equity * 0.18;
  const downside = Math.max(5, Math.round(equity * 0.38));
  const low = value * (1 - volatilityProxy / 100);
  const high = value * (1 + volatilityProxy / 100);
  const riskLabel = equity >= 80 ? "High" : equity >= 55 ? "Moderate" : "Lower";
  const confidence = Math.max(8, Math.min(96, Math.round(equity)));

  if (simulatorValue) simulatorValue.textContent = `${currency.format(value)} scenario value`;
  if (simulatorNote) simulatorNote.textContent = `A rough ${years}-year estimate using ${(returnRate * 100).toFixed(1)}% expected return.`;
  simulatorMeter?.style.setProperty("--dashboard-progress", `${confidence}%`);
  if (simulatorRange) simulatorRange.textContent = `${currency.format(low)}-${currency.format(high)}`;
  if (simulatorRisk) simulatorRisk.textContent = riskLabel;
  if (simulatorOutput) {
    simulatorOutput.textContent = `Estimated value: ${currency.format(value)}. A ${equity}% equity allocation could face a rough ${downside}% drawdown in a severe cycle.`;
  }
};

portfolioSimulator?.addEventListener("input", updatePortfolioSimulator);
portfolioSimulator?.addEventListener("submit", (event) => event.preventDefault());
updatePortfolioSimulator();

const getAlerts = () => {
  const alerts = readJsonState(storageKeys.alerts, []);
  return Array.isArray(alerts) ? alerts : [];
};

const renderAlerts = () => {
  if (!alertList) return;
  const alerts = getAlerts();
  alertList.innerHTML = "";

  if (!alerts.length) {
    const empty = document.createElement("li");
    empty.textContent = "No alerts yet.";
    alertList.append(empty);
    return;
  }

  alerts.forEach((alert) => {
    const item = document.createElement("li");
    item.innerHTML = `<strong>${alert.title}</strong><span>${alert.category} / ${alert.cadence}</span>`;
    alertList.append(item);
  });
};

alertForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(alertForm);
  const title = String(data.get("title") || "").trim();
  const category = String(data.get("category") || "Reminder");
  const cadence = String(data.get("cadence") || "Event-driven");
  if (!title) return;
  const alerts = getAlerts();
  alerts.push({ title, category, cadence });
  writeJsonState(storageKeys.alerts, alerts);
  if (alertOutput) alertOutput.textContent = `${title} saved as a ${cadence.toLowerCase()} alert.`;
  alertForm.reset();
  renderAlerts();
});

renderAlerts();

const getNumber = (form, name, fallback = 0) => {
  const input = form?.querySelector(`[name="${name}"]`);
  const value = input instanceof HTMLInputElement ? Number(input.value) : fallback;
  return Number.isFinite(value) ? value : fallback;
};

const updateCompoundCalculator = () => {
  if (!compoundCalculator) return;
  const principal = getNumber(compoundCalculator, "principal");
  const contribution = getNumber(compoundCalculator, "contribution");
  const annualReturn = getNumber(compoundCalculator, "returnRate") / 100;
  const years = Math.max(1, getNumber(compoundCalculator, "years", 1));
  const months = years * 12;
  const monthlyReturn = annualReturn / 12;
  let value = principal;

  for (let month = 0; month < months; month += 1) {
    value = value * (1 + monthlyReturn) + contribution;
  }

  const output = compoundCalculator.querySelector("[data-compound-output]");
  if (output) output.textContent = `${currency.format(value)} estimated future value`;
};

const updateFeeCalculator = () => {
  if (!feeCalculator) return;
  const balance = getNumber(feeCalculator, "balance");
  const lowFee = getNumber(feeCalculator, "lowFee") / 100;
  const highFee = getNumber(feeCalculator, "highFee") / 100;
  const years = Math.max(1, getNumber(feeCalculator, "years", 1));
  const difference = Math.max(0, balance * (highFee - lowFee) * years);
  const output = feeCalculator.querySelector("[data-fee-output]");
  if (output) output.textContent = `${currency.format(difference)} potential fee difference`;
};

const updateAllocationChecker = () => {
  if (!allocationChecker) return;
  const checks = [...allocationChecker.querySelectorAll('input[type="checkbox"]')];
  const completed = checks.filter((input) => input.checked).length;
  const output = allocationChecker.querySelector("[data-allocation-output]");
  if (output) output.textContent = `${completed} of ${checks.length} policy elements complete`;
};

compoundCalculator?.addEventListener("input", updateCompoundCalculator);
compoundCalculator?.addEventListener("submit", (event) => event.preventDefault());
feeCalculator?.addEventListener("input", updateFeeCalculator);
feeCalculator?.addEventListener("submit", (event) => event.preventDefault());
allocationChecker?.addEventListener("change", updateAllocationChecker);
allocationChecker?.addEventListener("submit", (event) => event.preventDefault());
updateCompoundCalculator();
updateFeeCalculator();
updateAllocationChecker();

tabsRoot?.addEventListener("click", (event) => {
  const button = event.target instanceof HTMLElement ? event.target.closest("[data-tab]") : null;
  if (!(button instanceof HTMLButtonElement)) return;

  activateTab(button);
});

const activateTab = (button) => {
  const tabId = button.dataset.tab;
  const buttons = tabsRoot.querySelectorAll("[data-tab]");
  const panels = tabsRoot.querySelectorAll("[data-panel]");

  buttons.forEach((tabButton) => {
    const active = tabButton === button;
    tabButton.classList.toggle("active", active);
    tabButton.setAttribute("aria-selected", String(active));
    tabButton.setAttribute("tabindex", active ? "0" : "-1");
  });

  panels.forEach((panel) => {
    const active = panel.getAttribute("data-panel") === tabId;
    panel.classList.toggle("active", active);
    panel.toggleAttribute("hidden", !active);
  });
};

tabsRoot?.addEventListener("keydown", (event) => {
  if (!(event.target instanceof HTMLButtonElement) || !event.target.matches("[data-tab]")) return;
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  event.preventDefault();
  const buttons = [...tabsRoot.querySelectorAll("[data-tab]")];
  const currentIndex = buttons.indexOf(event.target);
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? buttons.length - 1
        : event.key === "ArrowRight"
          ? (currentIndex + 1) % buttons.length
          : (currentIndex - 1 + buttons.length) % buttons.length;

  const nextButton = buttons[nextIndex];
  nextButton.focus();
  activateTab(nextButton);
});

signupForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(signupForm);
  const email = String(data.get("email") || "").trim();
  const emailInput = signupForm.querySelector('input[type="email"]');

  if (!email) {
    if (formMessage) formMessage.textContent = "Add your email to subscribe.";
    emailInput?.focus();
    return;
  }

  if (emailInput instanceof HTMLInputElement && !emailInput.checkValidity()) {
    if (formMessage) formMessage.textContent = "Enter a valid email address.";
    emailInput.focus();
    return;
  }

  if (formMessage) formMessage.textContent = "You are on the list. Choose your next NAKAMOTO Finance Library path.";
  signupForm.reset();
  window.setTimeout(() => {
    window.location.href = "./thank-you.html";
  }, 650);
});

contactForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const topic = String(data.get("topic") || "").trim();
  const message = String(data.get("message") || "").trim();
  const emailInput = contactForm.querySelector('input[name="email"]');

  if (!name) {
    if (contactMessage) contactMessage.textContent = "Add your name before sending.";
    contactForm.querySelector('input[name="name"]')?.focus();
    return;
  }

  if (!email) {
    if (contactMessage) contactMessage.textContent = "Add your email before sending.";
    emailInput?.focus();
    return;
  }

  if (emailInput instanceof HTMLInputElement && !emailInput.checkValidity()) {
    if (contactMessage) contactMessage.textContent = "Enter a valid email address.";
    emailInput.focus();
    return;
  }

  if (!topic) {
    if (contactMessage) contactMessage.textContent = "Choose a message topic.";
    contactForm.querySelector('select[name="topic"]')?.focus();
    return;
  }

  if (!message) {
    if (contactMessage) contactMessage.textContent = "Add a short message before sending.";
    contactForm.querySelector('textarea[name="message"]')?.focus();
    return;
  }

  if (contactMessage) {
    contactMessage.textContent =
      "Message prepared locally. Connect this form to your production inbox before launch.";
  }
  contactForm.reset();
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item) => observer.observe(item));
  animatedHeadings.forEach((heading) => {
    if (!heading.closest(".hero")) observer.observe(heading);
  });

  const storyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const activeId = entry.target.getAttribute("data-story-section");
        storyLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("data-story-link") === activeId);
        });
      });
    },
    { rootMargin: "-42% 0px -42% 0px", threshold: 0 }
  );

  storySections.forEach((section) => storyObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
  animatedHeadings.forEach((heading) => heading.classList.add("visible"));
}

