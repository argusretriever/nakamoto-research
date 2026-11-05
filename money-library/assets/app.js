const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const savedTheme = localStorage.getItem("nakamoto-money-library-theme");
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
const activeTheme = savedTheme || systemTheme;
document.documentElement.dataset.theme = activeTheme;

const updateThemeControls = () => {
  const theme = document.documentElement.dataset.theme || "light";
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    button.setAttribute("title", `Switch to ${nextTheme} mode`);
    const label = button.querySelector("[data-theme-label]");
    if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
  });
};

document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("nakamoto-money-library-theme", nextTheme);
    updateThemeControls();
  });
});

updateThemeControls();

window.nakamotoMoneyLibraryEvents = window.nakamotoMoneyLibraryEvents || [];
const trackEvent = (name, detail = {}) => {
  const path = window.location.pathname.split("/").pop() || "index.html";
  window.nakamotoMoneyLibraryEvents.push({
    name,
    detail,
    path,
    timestamp: new Date().toISOString()
  });
  if (typeof window.gtag !== "function" || name === "page_view") return;
  const safeEventDetails = {
    interaction: ["label", "href", "type"],
    conversion_intent: ["label", "href"],
    sticky_cta_dismissed: [],
    audience_route_selected: ["route"],
    search: ["filter", "results"],
    contact_submit: ["form", "topic"],
    lead_capture: ["form", "priority"]
  };
  if (!(name in safeEventDetails)) return;
  const params = {
    page_name: path
  };
  safeEventDetails[name].forEach((key) => {
    if (detail[key] === undefined || detail[key] === null) return;
    params[key] = String(detail[key]).slice(0, 100);
  });
  window.gtag("event", name, params);
};

trackEvent("page_view", { title: document.title });

const pageTitle = (document.title || "NAKAMOTO Money Library").split("|")[0].trim();
const main = document.querySelector("main");
if (main && !document.body.classList.contains("error-page") && !/index\.html?$/.test(window.location.pathname)) {
  const breadcrumbs = document.createElement("nav");
  breadcrumbs.className = "breadcrumbs";
  breadcrumbs.setAttribute("aria-label", "Breadcrumb");
  breadcrumbs.innerHTML = `<a href="index.html">Home</a><span aria-hidden="true">/</span><span>${pageTitle}</span>`;
  main.prepend(breadcrumbs);
}

document.querySelectorAll(".footer-inner").forEach((footer) => {
  if (footer.querySelector(".review-signal")) return;
  const signal = document.createElement("span");
  signal.className = "review-signal";
  signal.textContent = "Educational content reviewed Jun 20, 2026";
  footer.append(signal);
});

if (!document.querySelector("[data-sticky-conversion]")) {
  const sticky = document.createElement("aside");
  sticky.className = "sticky-conversion";
  sticky.setAttribute("data-sticky-conversion", "");
  sticky.setAttribute("aria-label", "NAKAMOTO Money Library next step");
  sticky.innerHTML = `
    <div><span>Next money move</span><strong>Start free, then choose your path.</strong></div>
    <a href="money-reset.html">Free reset</a>
    <button type="button" aria-label="Hide next step">&times;</button>
  `;
  document.body.append(sticky);
  sticky.querySelector("button").addEventListener("click", () => {
    sticky.classList.add("is-hidden");
    trackEvent("sticky_cta_dismissed");
  });
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("a, button");
  if (!target) return;
  const href = target.getAttribute("href") || "";
  const label = target.textContent.trim().replace(/\s+/g, " ").slice(0, 80);
  trackEvent("interaction", {
    label,
    href,
    type: target.tagName.toLowerCase()
  });
  if (/money-reset|newsletter|budget-kit|planning|money-planning-system|contact|workshops|audiences/.test(href)) {
    trackEvent("conversion_intent", { label, href });
  }
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reducedMotion) {
  document.documentElement.classList.add("motion-ready");

  let pointerFrame = 0;
  window.addEventListener("pointermove", (event) => {
    if (pointerFrame) return;
    pointerFrame = window.requestAnimationFrame(() => {
      pointerFrame = 0;
      document.body.style.setProperty("--mx", `${event.clientX}px`);
      document.body.style.setProperty("--my", `${event.clientY}px`);
    });
  });

  document.querySelectorAll(".card, .idea-card, .tool-card, .country-card, .feature-card, .resource-card, .map-node, .path-step, .wealth-ladder div, .family-points article, .debt-map article, .story-board article, .workshop-grid article, .funnel-lanes article, .planning-hero-strip div, .proof-grid article").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const xRatio = x / rect.width - 0.5;
      const yRatio = y / rect.height - 0.5;
      card.style.setProperty("--sx", `${x}px`);
      card.style.setProperty("--sy", `${y}px`);
      card.style.setProperty("--rx", `${yRatio * -4}deg`);
      card.style.setProperty("--ry", `${xRatio * 5}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--rx");
      card.style.removeProperty("--ry");
    });
  });

  const revealTargets = document.querySelectorAll(".hero > *, .hero-signal, .money-orbit, .signature-strip, .brand-canvas, .money-map-stage, .knowledge-orbit, .audience-router, .path-step, .wealth-ladder div, .family-system, .debt-map article, .story-board article, .workshop-grid article, .funnel-lanes article, .planning-hero-strip div, .proof-grid article, .section-head, .card, .idea-row, .idea-card, .tool-card, .country-card, .feature-card, .resource-card, .growth-console, .roadmap a, .search-panel, .faq-list details");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });

  revealTargets.forEach((target) => observer.observe(target));
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const group = button.closest("[data-filter-group]");
    const target = button.dataset.filter;
    group.querySelectorAll("[data-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    document.querySelectorAll("[data-category]").forEach((card) => {
      card.hidden = target !== "all" && card.dataset.category !== target;
    });
  });
});

document.querySelectorAll("[data-mini-tool]").forEach((form) => {
  const output = form.querySelector("[data-output]");
  const note = form.querySelector("[data-note]");
  const update = () => {
    const values = Object.fromEntries(Array.from(form.querySelectorAll("input")).map((input) => [input.name, Number(input.value || 0)]));
    let result = 0;
    let text = "";
    if (form.dataset.miniTool === "subscription") {
      result = values.monthly * 12;
      text = "Annual recurring spend revealed.";
    }
    if (form.dataset.miniTool === "raise") {
      result = values.raise * values.save / 100;
      text = "Suggested annual amount to route toward goals.";
    }
    if (form.dataset.miniTool === "shield") {
      result = values.expenses * values.months;
      text = "Emergency shield target.";
    }
    output.textContent = money.format(result);
    note.textContent = text;
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-suite-tool]").forEach((form) => {
  const output = form.querySelector("[data-suite-output]");
  const note = form.querySelector("[data-suite-note]");
  const bar = form.querySelector("[data-suite-bar]");
  const values = () => Object.fromEntries(Array.from(form.querySelectorAll("input")).map((input) => [input.name, Number(input.value || 0)]));
  const update = () => {
    const v = values();
    let result = "";
    let text = "";
    let percent = 0;
    if (form.dataset.suiteTool === "budget") {
      const margin = v.income - v.essentials - v.debt - v.savings;
      const savingsRate = v.income > 0 ? Math.round(v.savings / v.income * 100) : 0;
      result = money.format(margin);
      text = `${savingsRate}% planned savings rate after essentials and debt.`;
      percent = Math.max(0, Math.min(100, 50 + margin / Math.max(v.income, 1) * 100));
    }
    if (form.dataset.suiteTool === "savings") {
      const remaining = Math.max(0, v.goal - v.current);
      const months = v.monthly > 0 ? Math.ceil(remaining / v.monthly) : Infinity;
      result = Number.isFinite(months) ? `${months} months` : "Paused";
      text = `${money.format(remaining)} left toward the goal.`;
      percent = Math.min(100, Math.round(v.current / Math.max(v.goal, 1) * 100));
    }
    if (form.dataset.suiteTool === "emergency") {
      const target = v.essentials * v.months;
      const gap = Math.max(0, target - v.current);
      result = money.format(target);
      text = gap > 0 ? `${money.format(gap)} left to fully fund this shield.` : "Emergency target is funded.";
      percent = Math.min(100, Math.round(v.current / Math.max(target, 1) * 100));
    }
    if (form.dataset.suiteTool === "debt") {
      const monthlyRate = v.apr / 100 / 12;
      let balance = v.balance;
      let months = 0;
      while (balance > 0 && months < 600 && v.payment > balance * monthlyRate) {
        balance = balance + balance * monthlyRate - v.payment;
        months += 1;
      }
      result = months >= 600 || v.payment <= v.balance * monthlyRate ? "Increase payment" : `${months} months`;
      text = months >= 600 ? "Payment is not high enough for a clean payoff path." : `${money.format(v.payment)} monthly toward debt.`;
      percent = months >= 600 ? 15 : Math.max(5, Math.min(100, 100 - months / 60 * 100));
    }
    if (form.dataset.suiteTool === "networth") {
      const net = v.cash + v.investments + v.assets - v.debts;
      result = money.format(net);
      text = net >= 0 ? "Positive net worth. Track the trend monthly." : "Negative net worth. Focus on margin and debt pressure.";
      percent = Math.max(5, Math.min(100, 50 + net / 1000));
    }
    if (form.dataset.suiteTool === "retirement") {
      const monthlyRate = v.return / 100 / 12;
      const months = v.years * 12;
      let future = v.current;
      for (let i = 0; i < months; i += 1) future = future * (1 + monthlyRate) + v.monthly;
      result = money.format(future);
      text = `${money.format(v.monthly)} monthly for ${v.years} years at ${v.return}% assumed return.`;
      percent = Math.min(100, Math.max(10, Math.round(Math.log10(Math.max(future, 1)) * 14)));
    }
    output.textContent = result;
    note.textContent = text;
    if (bar) bar.style.width = `${Math.round(percent)}%`;
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-dashboard-planner]").forEach((form) => {
  const scoreEl = form.querySelector("[data-dashboard-score]");
  const noteEl = form.querySelector("[data-dashboard-note]");
  const bar = form.querySelector("[data-dashboard-bar]");
  const runwayEl = form.querySelector("[data-dashboard-runway]");
  const marginEl = form.querySelector("[data-dashboard-margin]");
  const rateEl = form.querySelector("[data-dashboard-rate]");
  const update = () => {
    const v = Object.fromEntries(Array.from(form.querySelectorAll("input")).map((input) => [input.name, Number(input.value || 0)]));
    const margin = v.income - v.essentials - v.payment - v.investing;
    const runway = v.essentials > 0 ? v.savings / v.essentials : 0;
    const savingsRate = v.income > 0 ? (v.investing + Math.max(0, margin)) / v.income * 100 : 0;
    const debtPressure = v.income > 0 ? v.debt / v.income : 0;
    const score = Math.max(1, Math.min(99, Math.round(42 + runway * 10 + savingsRate * .8 - debtPressure * 7 + (margin > 0 ? 8 : -8))));
    scoreEl.textContent = score;
    bar.style.width = `${score}%`;
    runwayEl.textContent = `${runway.toFixed(1)} months`;
    marginEl.textContent = `${money.format(margin)} margin`;
    rateEl.textContent = `${Math.max(0, Math.round(savingsRate))}% saving`;
    noteEl.textContent = score < 50 ? "Start with cash-flow margin and a starter emergency buffer." : score < 75 ? "Stable foundation. Keep building runway and reducing debt pressure." : "Strong direction. Optimize investing, goals, and long-term planning.";
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-start-quiz]").forEach((form) => {
  const output = form.querySelector("[data-quiz-output]");
  const note = form.querySelector("[data-quiz-note]");
  const update = () => {
    const priority = form.priority.value;
    const buffer = form.buffer.value;
    const routes = {
      budget: ["Budget pulse", "Start with the Paycheck Reset Method and the Paycheck Allocation Tool."],
      saving: ["Savings lift", "Read The First $1,000 Plan and join the $100 Challenge."],
      debt: ["Debt release", "Use the Debt Freedom Date Calculator, then choose avalanche or snowball."],
      emergency: ["Emergency shield", "Build a starter buffer before optimizing investing or lifestyle upgrades."],
      wealth: ["Wealth orbit", "Check investing prerequisites, retirement basics, and net worth tracking."]
    };
    const result = buffer === "no" && priority !== "debt" ? ["Emergency shield", "Your first move is a starter emergency fund, then your selected path."] : routes[priority];
    output.textContent = result[0];
    note.textContent = result[1];
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-personality-quiz]").forEach((form) => {
  const output = form.querySelector("[data-personality-output]");
  const note = form.querySelector("[data-personality-note]");
  const labels = {
    saver: ["Saver", "Your path is emergency savings, guilt-free spending, and simple future goals."],
    avoider: ["Avoider", "Your path is a no-shame check-in, one small dashboard, and the 7-Day Money Reset."],
    optimizer: ["Optimizer", "Your path is one clean system, net worth tracking, and automation without overbuilding."],
    rebuilder: ["Rebuilder", "Your path is a weekly reset, debt clarity, and rebuilding trust with yourself."],
    freedom: ["Freedom Planner", "Your path is investing basics, retirement planning, and long-term options."]
  };
  const update = () => {
    const scores = { saver: 0, avoider: 0, optimizer: 0, rebuilder: 0, freedom: 0 };
    Array.from(form.querySelectorAll("select")).forEach((select) => {
      scores[select.value] += 1;
    });
    const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
    output.textContent = labels[winner][0];
    note.textContent = labels[winner][1];
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-audience-router]").forEach((router) => {
  const routes = {
    students: {
      label: "Student starter system",
      title: "Protect cash flow before independence gets expensive.",
      copy: "Start with first paycheck basics, a tiny emergency buffer, spending boundaries, and a simple way to avoid debt surprises.",
      links: [["Open student path", "for-students.html"], ["First paycheck guide", "guide-first-paycheck.html"], ["$1,000 buffer", "article-first-1000.html"]]
    },
    professionals: {
      label: "Young professional system",
      title: "Turn stronger income into a repeatable money rhythm.",
      copy: "Use paycheck allocation, rent checks, emergency targets, debt pressure review, and investing readiness before lifestyle creep takes over.",
      links: [["Open professional path", "for-young-professionals.html"], ["Paycheck tool", "tool-paycheck-allocation.html"], ["Rent guide", "guide-rent-affordability.html"]]
    },
    families: {
      label: "Household money system",
      title: "Make shared money calmer and more visible.",
      copy: "Map bills, sinking funds, emergency runway, child costs, and one weekly family decision so the budget stops living in one person's head.",
      links: [["Open family path", "for-families.html"], ["Budget kit", "budget-kit.html"], ["Life events", "life-events.html"]]
    },
    rebuilders: {
      label: "Debt confidence system",
      title: "Move from debt fog to a clean payoff rule.",
      copy: "List every balance, protect minimums, choose a payoff method, build a starter buffer, and review progress without shame.",
      links: [["Open rebuilder path", "for-debt-rebuilders.html"], ["Debt calculator", "tool-debt-freedom.html"], ["Compare methods", "comparison-snowball-vs-avalanche.html"]]
    }
  };
  const label = router.querySelector("[data-audience-label]");
  const title = router.querySelector("[data-audience-title]");
  const copy = router.querySelector("[data-audience-copy]");
  const links = router.querySelector("[data-audience-links]");
  router.querySelectorAll("[data-audience-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const route = routes[button.dataset.audienceChoice];
      router.querySelectorAll("[data-audience-choice]").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      label.textContent = route.label;
      title.textContent = route.title;
      copy.textContent = route.copy;
      links.innerHTML = route.links.map(([text, href]) => `<a class="pill" href="${href}">${text}</a>`).join("");
      trackEvent("audience_route_selected", { route: button.dataset.audienceChoice });
    });
  });
});

document.querySelectorAll("[data-allocation-tool]").forEach((form) => {
  const output = form.querySelector("[data-allocation-output]");
  const note = form.querySelector("[data-allocation-note]");
  const update = () => {
    const pay = Number(form.pay.value || 0);
    const essentials = Number(form.essentials.value || 0);
    const savings = Number(form.savings.value || 0);
    const debt = Number(form.debt.value || 0);
    const spending = Math.max(0, 100 - essentials - savings - debt);
    output.textContent = `${money.format(pay * savings / 100)} to savings`;
    note.textContent = `${money.format(pay * essentials / 100)} essentials, ${money.format(pay * debt / 100)} debt, ${money.format(pay * spending / 100)} flexible spending.`;
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-debt-date-tool]").forEach((form) => {
  const output = form.querySelector("[data-debt-output]");
  const note = form.querySelector("[data-debt-note]");
  const update = () => {
    const balanceStart = Number(form.balance.value || 0);
    const apr = Number(form.apr.value || 0) / 100 / 12;
    const payment = Number(form.payment.value || 0);
    let balance = balanceStart;
    let months = 0;
    while (balance > 0 && months < 600 && payment > balance * apr) {
      balance = balance + balance * apr - payment;
      months += 1;
    }
    if (months >= 600 || payment <= balanceStart * apr) {
      output.textContent = "Needs more payment";
      note.textContent = "The payment is too low to create a clear payoff path.";
    } else {
      output.textContent = `${months} months`;
      note.textContent = `Estimated payoff with ${money.format(payment)} monthly payments.`;
    }
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-goal-tracker]").forEach((form) => {
  const output = form.querySelector("[data-goal-output]");
  const note = form.querySelector("[data-goal-note]");
  const bar = form.querySelector("[data-goal-bar]");
  const update = () => {
    const current = Number(form.current.value || 0);
    const target = Math.max(1, Number(form.target.value || 1));
    const percent = Math.min(100, Math.max(0, Math.round(current / target * 100)));
    const left = Math.max(0, target - current);
    output.textContent = `${percent}%`;
    note.textContent = left > 0 ? `${money.format(left)} left to reach the target.` : "Target reached. Choose the next milestone.";
    bar.style.width = `${percent}%`;
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-next-dollar]").forEach((form) => {
  const output = form.querySelector("[data-next-output]");
  const note = form.querySelector("[data-next-note]");
  const update = () => {
    const billsSafe = form.bills.value === "yes";
    const emergency = Number(form.emergency.value || 0);
    const apr = Number(form.apr.value || 0);
    const hasMatch = form.match.value === "yes";
    let result = ["Protect bills", "Use the next $100 to keep essentials current and avoid late fees."];
    if (billsSafe && emergency < 1000) result = ["Build starter buffer", "Put the next $100 toward the first $1,000 emergency fund."];
    if (billsSafe && emergency >= 1000 && apr >= 15) result = ["Attack high-interest debt", "Use the next $100 as an extra payment on the highest-pressure debt."];
    if (billsSafe && emergency >= 1000 && apr < 15 && hasMatch) result = ["Capture retirement match", "Consider routing the next dollars toward an available employer match."];
    if (billsSafe && emergency >= 1000 && apr < 15 && !hasMatch) result = ["Fund the next goal", "Use the next $100 for a sinking fund, investing habit, or life goal."];
    output.textContent = result[0];
    note.textContent = result[1];
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-lifestyle-creep]").forEach((form) => {
  const output = form.querySelector("[data-lifestyle-output]");
  const note = form.querySelector("[data-lifestyle-note]");
  const bar = form.querySelector("[data-lifestyle-bar]");
  const update = () => {
    const raise = Number(form.raise.value || 0);
    const creep = Number(form.subscriptions.value || 0) + Number(form.food.value || 0) + Number(form.upgrades.value || 0);
    const remaining = raise - creep;
    const used = raise > 0 ? Math.max(0, Math.min(100, Math.round(creep / raise * 100))) : 0;
    output.textContent = `${money.format(remaining)} left`;
    note.textContent = `${money.format(creep)} of new monthly spending uses ${used}% of the income increase.`;
    if (bar) bar.style.width = `${used}%`;
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-rent-affordability]").forEach((form) => {
  const output = form.querySelector("[data-rent-output]");
  const note = form.querySelector("[data-rent-note]");
  const bar = form.querySelector("[data-rent-bar]");
  const update = () => {
    const income = Number(form.income.value || 0);
    const committed = Number(form.debt.value || 0) + Number(form.savings.value || 0) + Number(form.utilities.value || 0) + Number(form.transport.value || 0) + Number(form.flex.value || 0);
    const rent = Math.max(0, income - committed);
    const share = income > 0 ? Math.round(rent / income * 100) : 0;
    output.textContent = money.format(rent);
    note.textContent = `${share}% of take-home income remains for rent after the listed commitments.`;
    if (bar) bar.style.width = `${Math.max(0, Math.min(100, share))}%`;
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-scenario]").forEach((form) => {
  const output = form.querySelector("[data-scenario-output]");
  const note = form.querySelector("[data-scenario-note]");
  const update = () => {
    if (form.dataset.scenario === "rent") {
      const rent = Number(form.rent.value || 0);
      const increase = Number(form.increase.value || 0);
      const monthly = rent * increase / 100;
      output.textContent = money.format(monthly);
      note.textContent = `${money.format(monthly * 12)} more rent over one year.`;
      return;
    }
    const amount = Number(form.amount.value || 0);
    const months = Number(form.months.value || 0);
    output.textContent = money.format(amount * months);
    note.textContent = form.dataset.scenario === "debt" ? "Extra principal directed to debt." : "Extra savings over time.";
  };
  form.addEventListener("input", update);
  update();
});

document.querySelectorAll("[data-snapshot]").forEach((form) => {
  const output = form.querySelector("[data-snapshot-output]");
  const note = form.querySelector("[data-snapshot-note]");
  const update = () => {
    const income = Math.max(1, Number(form.income.value || 1));
    const essentials = Number(form.essentials.value || 0);
    const savings = Number(form.savings.value || 0);
    const debt = Number(form.debt.value || 0);
    const runway = essentials > 0 ? savings / essentials : 0;
    const debtLoad = debt / income;
    const score = Math.max(10, Math.min(95, Math.round(45 + runway * 20 - debtLoad * 6)));
    output.textContent = `${score}/100`;
    note.textContent = `${runway.toFixed(1)} months of essential runway. Suggested next step: ${runway < 1 ? "build a starter buffer" : debtLoad > 1 ? "reduce debt pressure" : "grow your next goal"}.`;
  };
  form.addEventListener("input", update);
  update();
});

const siteSearchIndex = [
  ["Home", "The NAKAMOTO Money Library growth engine and user journey.", "index.html"],
  ["Explore NAKAMOTO Money Library", "Complete directory of NAKAMOTO Money Library guides, tools, calculators, dashboards, countries, research, and resources.", "explore.html"],
  ["Start Here Quiz", "Route users to budget, saving, debt, emergency, or wealth paths.", "start-here.html"],
  ["Budgeting Knowledge Hub", "Learn cash flow, bill timing, flexible spending, and paycheck budgeting.", "budgeting.html"],
  ["Saving Money Knowledge Hub", "Learn starter buffers, sinking funds, savings goals, and automation.", "saving.html"],
  ["Emergency Fund Knowledge Hub", "Learn emergency fund targets, starter buffers, account choices, and risk layers.", "emergency-fund.html"],
  ["Debt Payoff Knowledge Hub", "Learn APR, minimum payments, snowball, avalanche, consolidation, and debt rights.", "debt.html"],
  ["Financial Literacy Knowledge Hub", "Learn core money concepts for budgeting, saving, debt, credit, investing, and protection.", "financial-literacy.html"],
  ["Credit and Banking Knowledge Hub", "Learn checking, savings, credit reports, credit cards, fraud, and account safety.", "credit-banking.html"],
  ["Investing Basics Knowledge Hub", "Learn investing readiness, risk, diversification, compound growth, fees, and time horizon.", "investing-basics.html"],
  ["Retirement Planning Knowledge Hub", "Learn savings rate, retirement accounts, compounding, inflation, and future income planning.", "retirement.html"],
  ["Net Worth Knowledge Hub", "Learn assets, debts, net worth trends, benchmarks, and progress tracking.", "net-worth.html"],
  ["Financial Independence Knowledge Hub", "Learn savings rate, runway, assets, optionality, and realistic freedom planning.", "financial-independence.html"],
  ["Career and Income Knowledge Hub", "Learn raises, benefits, side income, earning power, and lifestyle creep.", "career-income.html"],
  ["Life Goals Money Hub", "Plan moving, family, education, travel, career breaks, and goal funds.", "life-goals.html"],
  ["Money Psychology Knowledge Hub", "Learn money avoidance, shame, habits, motivation, and behavior design.", "money-psychology.html"],
  ["Taxes and Insurance Knowledge Hub", "Learn take-home pay, tax set-asides, insurance, risk protection, and country context.", "taxes-insurance.html"],
  ["Audience Money Paths", "Student, young professional, family, and debt rebuilder personal finance journeys.", "audiences.html"],
  ["NAKAMOTO Money Library for Students", "Student budgeting, first paycheck, small emergency funds, credit caution, and beginner literacy.", "for-students.html"],
  ["NAKAMOTO Money Library for Young Professionals", "Paycheck systems, rent decisions, debt pressure, benefits, and investing readiness.", "for-young-professionals.html"],
  ["NAKAMOTO Money Library for Families", "Household budgets, sinking funds, emergency shields, shared money meetings, and family goals.", "for-families.html"],
  ["NAKAMOTO Money Library for Debt Rebuilders", "Debt clarity, payoff strategy, emergency buffers, and rebuilding confidence after money stress.", "for-debt-rebuilders.html"],
  ["Scenario Success Stories", "Realistic educational stories showing how different users can use NAKAMOTO Money Library.", "success-stories.html"],
  ["Free Money Workshops", "Workshop paths for paycheck control, debt clarity, emergency funds, family budgeting, and investing readiness.", "workshops.html"],
  ["The First $1,000 Plan", "Beginner emergency fund article.", "article-first-1000.html"],
  ["7-Day Money Reset", "Free email course to organize spending, cut leaks, build a starter buffer, and choose a money path.", "money-reset.html"],
  ["Saved NAKAMOTO Money Library Account", "Saved calculators, saved quiz results, saved dashboard path, and weekly plans.", "account.html"],
  ["Research Library", "Official sources for budgeting, debt, savings, investing, retirement, countries, and consumer protection.", "research-library.html"],
  ["Source Materials", "Official source materials for budgeting, saving, debt, banking, investing, privacy, and retirement.", "source-materials.html"],
  ["Quality Roadmap", "Production readiness roadmap for content, UX, SEO, accessibility, performance, trust, security, analytics, and growth.", "quality-audit.html"],
  ["Marketing Engine", "Website marketing audit and growth roadmap for positioning, SEO, GEO, CRO, lead generation, trust, analytics, automation, and revenue.", "marketing-engine.html"],
  ["Planning", "Compare NAKAMOTO Money Library free tools, template pack, and Pro planning options.", "planning.html"],
  ["Financial Literacy Glossary", "Plain-English definitions for budgeting, debt, saving, investing, retirement, and credit terms.", "glossary.html"],
  ["Calculator Assumptions", "Inputs, limits, and educational assumptions behind NAKAMOTO Money Library calculators.", "calculator-assumptions.html"],
  ["Evergreen Knowledge Roadmap", "Long-term topic clusters and durability rules for the NAKAMOTO Money Library finance library.", "evergreen-roadmap.html"],
  ["Money Personality Quiz", "Find out if you are a Saver, Avoider, Optimizer, Rebuilder, or Freedom Planner.", "money-personality-quiz.html"],
  ["Goal Trackers", "Track emergency funds, debt payoff, net worth, and savings goals.", "goals.html"],
  ["Where Should My Next $100 Go", "Decision tool for routing extra cash to bills, savings, debt, investing, or goals.", "next-100.html"],
  ["Money Coach Prompts", "Budget review, debt plan, savings plan, money anxiety, and weekly reset prompts.", "money-coach.html"],
  ["Scenario Calculators", "What-if calculators for saving more, paying extra debt, and rent increases.", "scenario-calculators.html"],
  ["Financial Literacy Academy", "Short lesson paths for budgeting, saving, debt, investing, retirement, and psychology.", "academy.html"],
  ["Life Event Money Hubs", "Money guides for first job, moving, marriage, baby, car, job loss, and career changes.", "life-events.html"],
  ["Community Money Challenges", "No-spend weekends, emergency fund sprints, food budget resets, and debt streaks.", "community-challenges.html"],
  ["Money Snapshot Report", "Create a simple report with income, essentials, savings, debt, and a next step.", "money-snapshot.html"],
  ["Finance Product Scorecards", "Transparent scorecards for apps, savings accounts, debt options, and brokerages.", "scorecards.html"],
  ["NAKAMOTO Money Library Email Courses", "Budget Reset, Debt Reset, Emergency Fund Sprint, and First Investing Month.", "email-courses.html"],
  ["Paycheck Reset Method", "Payday workflow for bills, spending, saving, and debt.", "article-paycheck-reset.html"],
  ["How Much Emergency Fund Do I Need", "Set emergency fund targets by expenses, income stability, and household risk.", "guide-emergency-fund-how-much.html"],
  ["How to Budget When Paid Biweekly", "Biweekly paycheck budgeting with bill timing and extra-paycheck months.", "guide-biweekly-budget.html"],
  ["How to Stop Living Paycheck to Paycheck", "Map bills, cut leaks, protect essentials, and build a tiny buffer.", "guide-paycheck-to-paycheck.html"],
  ["Best Way to Pay Off Credit Card Debt", "Credit card debt payoff using methods, payment increases, and behavior guardrails.", "guide-credit-card-debt.html"],
  ["How Much Rent Can I Afford", "Rent affordability based on income, debt, savings, utilities, and transport.", "guide-rent-affordability.html"],
  ["How to Save Money Fast on a Low Income", "Small-buffer savings plan for low-income households.", "guide-save-money-low-income.html"],
  ["What to Do With Your First Paycheck", "First paycheck guide for taxes, bills, savings, benefits, and investing basics.", "guide-first-paycheck.html"],
  ["Emergency Fund vs Paying Off Debt", "Decision guide for where extra money should go first.", "guide-emergency-vs-debt.html"],
  ["How to Start Investing With Little Money", "Beginner investing readiness, risk, fees, accounts, and automation.", "guide-investing-little-money.html"],
  ["Net Worth by Age Explained Carefully", "Contextual net worth guide by life stage without shame.", "guide-net-worth-by-age.html"],
  ["Content Engine", "SEO content clusters and article ideas.", "content.html"],
  ["Tools", "Calculators and financial planning tools.", "tools.html"],
  ["Paycheck Allocation Tool", "Split a paycheck into essentials, savings, debt, and spending.", "tool-paycheck-allocation.html"],
  ["Debt Freedom Date Calculator", "Estimate payoff time from balance, APR, and payment.", "tool-debt-freedom.html"],
  ["Lifestyle Creep Calculator", "Calculate how recurring lifestyle upgrades use a raise or income increase.", "lifestyle-creep-calculator.html"],
  ["Rent Affordability Calculator", "Estimate safer rent based on take-home income, debt, savings, utilities, transport, and spending.", "rent-affordability-calculator.html"],
  ["Challenges", "Money challenges for savings, debt, and weekly reset habits.", "challenges.html"],
  ["Countries", "Country-specific finance hubs.", "countries.html"],
  ["US Money Hub", "US emergency funds, credit, 401(k), Roth IRA.", "country-us.html"],
  ["UK Money Hub", "UK budgeting, council tax, ISAs, pensions.", "country-uk.html"],
  ["Canada Money Hub", "TFSA, RRSP, emergency funds, rent, debt.", "country-canada.html"],
  ["Templates", "Budget, net worth, debt payoff, and sinking fund templates.", "templates.html"],
  ["Monthly Money Review Template", "Review balances, bills, savings transfers, debt payments, and one next action.", "template-monthly-review.html"],
  ["Net Worth Tracker Template", "Track assets, debts, net worth trend, notes, and financial milestones.", "template-net-worth-tracker.html"],
  ["Debt Payoff Planner Template", "Plan balances, APRs, minimums, payoff method, progress, and freed cash.", "template-debt-payoff-planner.html"],
  ["Sinking Fund Planner Template", "Plan future expenses, due dates, monthly targets, and account labels.", "template-sinking-fund-planner.html"],
  ["Household Money Meeting Template", "Run shared bill reviews, family goals, roles, and money decisions.", "template-household-money-meeting.html"],
  ["Semester Budget Template", "Plan tuition, rent, food, transport, books, subscriptions, and student income.", "template-semester-budget.html"],
  ["Variable Income Planner Template", "Plan freelance, gig, commission, tax buckets, lean-month buffers, and invoices.", "template-variable-income-planner.html"],
  ["Life Goal Template Bundle", "Plan travel, car, wedding, home, moving, school, and annual bill sinking funds.", "template-life-goal-bundle.html"],
  ["Printable Budget Kit", "Budget worksheet, debt tracker, emergency fund tracker, net worth sheet, sinking fund planner, and weekly review.", "budget-kit.html"],
  ["Finance App Privacy Checklist", "Checklist for privacy, bank linking, subscriptions, data sharing, and account control.", "finance-app-privacy-checklist.html"],
  ["Life Event Money Checklists", "Checklists for moving, first job, wedding, baby, career break, car, home, and job loss.", "life-event-money-checklists.html"],
  ["Resources", "Downloadable resources and evergreen utilities.", "resources.html"],
  ["My Money Plan Dashboard", "Financial confidence score, roadmap, next steps, trackers, and weekly habits.", "dashboard.html"],
  ["Comparisons", "Personal finance comparison guides for debt, savings, retirement, and budgeting apps.", "comparisons.html"],
  ["Budgeting Apps Comparison", "Comparison template for beginner budgeting apps.", "comparison-budgeting-apps.html"],
  ["Debt Snowball vs Avalanche", "Compare debt payoff methods by motivation, interest savings, and best fit.", "comparison-snowball-vs-avalanche.html"],
  ["HYSA vs Checking", "Compare where to keep emergency funds.", "comparison-hysa-vs-checking.html"],
  ["Roth IRA vs 401(k)", "Compare beginner retirement account options.", "comparison-roth-ira-vs-401k.html"],
  ["Debt Consolidation vs Payoff Plan", "Compare consolidation with a self-managed debt payoff plan.", "comparison-debt-consolidation-vs-payoff.html"],
  ["Newsletter Products", "Friday reset, one-number education, and onboarding courses.", "newsletter.html"],
  ["Monetization", "Templates, Pro tools, courses, B2B, affiliates, and membership.", "monetization.html"],
  ["Nakamoto Money Library", "Planning templates, saved tool concepts, courses, and guided money systems.", "money-planning-system.html"],
  ["Methodology", "Editorial standards, source policy, and review process.", "methodology.html"],
  ["FAQ", "Common questions about NAKAMOTO Money Library and personal finance education.", "faq.html"],
  ["Authors", "NAKAMOTO Money Library authors, reviewers, and editorial trust standards.", "authors.html"],
  ["Australia Money Starter", "Australia budgeting, emergency funds, superannuation, and student debt basics.", "country-australia.html"],
  ["India Young Professional Budget", "India rent, family support, digital payments, emergency cash, insurance, and investing basics.", "country-india.html"],
  ["UAE Expat Money System", "UAE remittance, rent, emergency funds, school costs, and repatriation planning.", "country-uae.html"],
  ["Germany Beginner Finance Guide", "Germany insurance, renting, taxes, savings, pensions, and investing basics.", "country-germany.html"],
  ["Ireland Cost-of-Living Budget", "Ireland rent, transport, energy, emergency funds, and savings goals.", "country-ireland.html"],
  ["Singapore Wealth Starter Guide", "Singapore CPF awareness, housing, emergency funds, and investing habits.", "country-singapore.html"],
  ["Contact", "Feedback, partnership, and support route.", "contact.html"]
];

document.querySelectorAll("[data-site-search]").forEach((form) => {
  const input = form.querySelector("input");
  const results = form.querySelector("[data-search-results]");
  const filterButtons = form.querySelectorAll("[data-search-filter]");
  const suggestionButtons = form.querySelectorAll("[data-search-suggestion]");
  const params = new URLSearchParams(window.location.search);
  let activeFilter = "all";
  if (params.get("q")) input.value = params.get("q");
  const inferCategory = (title, description, href) => {
    const haystack = `${title} ${description} ${href}`.toLowerCase();
    if (haystack.includes("country-") || haystack.includes("countries")) return "countries";
    if (haystack.includes("tool") || haystack.includes("calculator") || haystack.includes("dashboard") || haystack.includes("tracker") || haystack.includes("quiz")) return "tools";
    if (haystack.includes("methodology") || haystack.includes("authors") || haystack.includes("research") || haystack.includes("privacy") || haystack.includes("assumptions")) return "trust";
    return "guides";
  };
  const render = () => {
    const query = input.value.trim().toLowerCase();
    const matches = siteSearchIndex.filter(([title, description, href]) => {
      const haystack = `${title} ${description}`.toLowerCase();
      const category = inferCategory(title, description, href);
      return (!query || haystack.includes(query)) && (activeFilter === "all" || category === activeFilter);
    }).slice(0, 10);
    trackEvent("search", { query, filter: activeFilter, results: matches.length });
    if (!matches.length) {
      results.innerHTML = `<div class="search-empty"><strong>No exact match yet.</strong><p>Try emergency fund, debt, paycheck, retirement, country, budget, or templates.</p></div>`;
      return;
    }
    results.innerHTML = matches.map(([title, description, href]) => `
      <a class="search-result" href="${href}">
        <span>${inferCategory(title, description, href)}</span>
        <strong>${title}</strong>
        <p>${description}</p>
      </a>
    `).join("");
  };
  input.addEventListener("input", render);
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.searchFilter;
      filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
      render();
    });
  });
  suggestionButtons.forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.searchSuggestion;
      input.focus();
      render();
    });
  });
  render();
});

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  const status = form.querySelector("[data-contact-status]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const topic = form.querySelector("[name='topic']")?.value || "General";
    status.textContent = `Thanks. Your ${topic.toLowerCase()} message is ready to route to the NAKAMOTO Money Library team.`;
    trackEvent("contact_submit", { form: "contact", topic });
    form.reset();
  });
});

document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
  const status = form.querySelector("[data-newsletter-status]");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const priority = form.querySelector("[name='priority']")?.value || "money reset";
    form.classList.add("is-success");
    status.textContent = `You are on the ${priority.toLowerCase()} path. Check your inbox for the next NAKAMOTO Money Library step.`;
    trackEvent("lead_capture", { form: "newsletter", priority });
    form.reset();
  });
});
