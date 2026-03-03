const categories = ["Macro", "Equities", "FX", "Rates", "Commodities", "Crypto", "Policy"];

const events = [
  { year: 2000, title: "Dot-com unwind", summary: "Valuation reset in technology equities led to risk-off positioning and defensive sector rotation.", categories: ["Equities", "Macro"] },
  { year: 2001, title: "9/11 shock & recession", summary: "Demand contraction and policy easing highlighted the role of central-bank liquidity in market stabilization.", categories: ["Macro", "Policy"] },
  { year: 2008, title: "Global Financial Crisis", summary: "Credit seizure, deleveraging, and coordinated rescue packages triggered major cross-asset volatility.", categories: ["Macro", "Rates", "Policy"] },
  { year: 2010, title: "Sovereign debt stress", summary: "Eurozone peripheral bond spreads widened; currency markets priced redenomination and fragmentation risk.", categories: ["FX", "Rates", "Macro"] },
  { year: 2014, title: "Oil collapse", summary: "Energy oversupply and weaker global demand caused a large crude selloff, impacting inflation expectations.", categories: ["Commodities", "Macro"] },
  { year: 2020, title: "Pandemic recession", summary: "Fastest contraction/recovery cycle in modern history with unprecedented fiscal and monetary expansion.", categories: ["Macro", "Policy", "Equities"] },
  { year: 2022, title: "Inflation and rate shock", summary: "Inflation spikes drove aggressive tightening cycles, repricing long-duration assets and FX carry structures.", categories: ["Rates", "FX", "Macro"] },
  { year: 2024, title: "AI capex cycle", summary: "Productivity optimism and investment concentration boosted selected mega-cap and semiconductor ecosystems.", categories: ["Equities", "Macro"] },
  { year: 2026, title: "Forward outlook", summary: "Base case: slower but positive growth, disinflation trend with periodic commodity and geopolitics-driven volatility.", categories: ["Macro", "Commodities", "Policy"] }
];

const annualData = {
  years: Array.from({ length: 27 }, (_, i) => 2000 + i),
  gdpGrowth: [4.8,2.5,3.1,4.3,5.3,4.9,5.5,5.6,3.0,-0.1,5.4,4.3,3.6,3.5,3.6,3.5,3.3,3.8,3.6,2.9,-2.8,6.2,3.4,3.2,3.1,2.9,2.8],
  inflationUS: [3.4,2.8,1.6,2.3,2.7,3.4,3.2,2.9,3.8,-0.4,1.6,3.2,2.1,1.5,1.6,0.1,1.3,2.1,2.4,1.8,1.2,4.7,8.0,4.1,3.0,2.5,2.3],
  spReturn: [-9.1,-11.9,-22.1,28.7,10.9,4.9,15.8,5.5,-37.0,26.5,15.1,2.1,16.0,32.4,13.7,1.4,12.0,21.8,-4.4,31.5,18.4,28.7,-18.1,26.3,17.8,10.2,8.5],
  commodityIdx: [100,97,101,110,125,140,148,162,185,130,150,170,165,160,130,90,95,108,120,108,98,135,158,145,141,147,150]
};

const evidence = [
  { name: "IMF World Economic Outlook Database", link: "https://www.imf.org/en/Publications/WEO/weo-database/2024/October" },
  { name: "World Bank Open Data", link: "https://data.worldbank.org/indicator/NY.GDP.MKTP.KD.ZG" },
  { name: "US Bureau of Labor Statistics CPI", link: "https://www.bls.gov/cpi/" },
  { name: "Federal Reserve Economic Data (FRED)", link: "https://fred.stlouisfed.org/" },
  { name: "S&P Dow Jones Indices annual return history", link: "https://www.spglobal.com/spdji/en/indices/equity/sp-500/" },
  { name: "World Bank Pink Sheet commodity prices", link: "https://www.worldbank.org/en/research/commodity-markets" }
];

const searchInput = document.getElementById("searchInput");
const clearSearch = document.getElementById("clearSearch");
const categoryFilters = document.getElementById("categoryFilters");
const timeline = document.getElementById("timeline");
const suggestions = document.getElementById("suggestions");

let activeCategory = "All";

function formatPct(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function drawChart(canvasId, values, options = {}) {
  const canvas = document.getElementById(canvasId);
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const pad = 36;

  const min = Math.min(...values, options.min ?? Infinity);
  const max = Math.max(...values, options.max ?? -Infinity);
  const span = max - min || 1;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#0f1729";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = pad + (i * (height - pad * 2)) / 4;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(width - pad, y);
    ctx.stroke();
  }

  ctx.strokeStyle = options.color || "#4f8cff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  values.forEach((v, i) => {
    const x = pad + (i * (width - pad * 2)) / (values.length - 1);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  });
  ctx.stroke();

  ctx.fillStyle = "#b2c6ee";
  ctx.font = "11px sans-serif";
  ctx.fillText(`${max.toFixed(1)}`, 4, pad + 5);
  ctx.fillText(`${min.toFixed(1)}`, 4, height - pad);
  ctx.fillText(`${annualData.years[0]}`, pad, height - 8);
  ctx.fillText(`${annualData.years.at(-1)}`, width - pad - 28, height - 8);
}

function computeStats() {
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const volatility = (arr) => {
    const m = avg(arr);
    return Math.sqrt(arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / arr.length);
  };

  return [
    { label: "Avg Global GDP Growth", value: formatPct(avg(annualData.gdpGrowth)) },
    { label: "Avg US Inflation", value: formatPct(avg(annualData.inflationUS)) },
    { label: "Avg S&P Annual Return", value: formatPct(avg(annualData.spReturn)) },
    { label: "S&P Return Volatility", value: formatPct(volatility(annualData.spReturn)) },
    { label: "Peak Inflation Year", value: `${annualData.years[annualData.inflationUS.indexOf(Math.max(...annualData.inflationUS))]} (${Math.max(...annualData.inflationUS).toFixed(1)}%)` },
    { label: "Deepest Equity Drawdown Year", value: `${annualData.years[annualData.spReturn.indexOf(Math.min(...annualData.spReturn))]} (${Math.min(...annualData.spReturn).toFixed(1)}%)` }
  ];
}

function renderStats() {
  const stats = computeStats();
  const wrap = document.getElementById("statistics");
  wrap.innerHTML = stats.map((s) => `<div class="stat"><strong>${s.value}</strong><span>${s.label}</span></div>`).join("");

  const heroStats = document.getElementById("heroStats");
  heroStats.innerHTML = `
    <div class="hero-stat"><strong>${events.length}</strong><span>Major regime events tracked</span></div>
    <div class="hero-stat"><strong>${annualData.years[0]}–${annualData.years.at(-1)}</strong><span>Research coverage period</span></div>
    <div class="hero-stat"><strong>${categories.length}</strong><span>Searchable market categories</span></div>
  `;
}

function renderFilters() {
  const all = ["All", ...categories];
  categoryFilters.innerHTML = all.map(cat =>
    `<button class="chip ${cat === activeCategory ? "active" : ""}" data-category="${cat}">${cat}</button>`).join("");

  document.querySelectorAll(".chip").forEach((el) => {
    el.addEventListener("click", () => {
      activeCategory = el.dataset.category;
      renderFilters();
      renderTimeline();
    });
  });
}

function filterEvents() {
  const query = searchInput.value.trim().toLowerCase();
  return events.filter((event) => {
    const categoryMatch = activeCategory === "All" || event.categories.includes(activeCategory);
    const text = `${event.title} ${event.summary} ${event.categories.join(" ")} ${event.year}`.toLowerCase();
    return categoryMatch && (!query || text.includes(query));
  });
}

function renderTimeline() {
  const filtered = filterEvents();
  if (!filtered.length) {
    timeline.innerHTML = `<p class="muted">No events match this search. Try broader wording like "policy" or "commodities".</p>`;
    return;
  }

  timeline.innerHTML = filtered.map((event) => `
    <div class="event">
      <strong>${event.year} — ${event.title}</strong>
      <p>${event.summary}</p>
      <div>${event.categories.map((c) => `<span class="tag">${c}</span>`).join("")}</div>
    </div>
  `).join("");
}

function renderSuggestions() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    suggestions.innerHTML = ["inflation", "rate hikes", "equities", "oil", "recession", "AI"].map((item) =>
      `<button class="suggestion" data-value="${item}">${item}</button>`
    ).join("");
  } else {
    const words = new Set();
    events.forEach(e => {
      `${e.title} ${e.summary}`.toLowerCase().split(/[^a-z0-9]+/).forEach(w => {
        if (w.length > 3 && w.includes(query)) words.add(w);
      });
    });
    const picks = [...words].slice(0, 6);
    suggestions.innerHTML = picks.length
      ? picks.map((item) => `<button class="suggestion" data-value="${item}">${item}</button>`).join("")
      : `<span class="muted">No quick suggestions.</span>`;
  }

  document.querySelectorAll(".suggestion").forEach((btn) => {
    btn.addEventListener("click", () => {
      searchInput.value = btn.dataset.value;
      renderSuggestions();
      renderTimeline();
    });
  });
}

function renderEvidence() {
  const list = document.getElementById("evidenceList");
  list.innerHTML = evidence
    .map((s) => `<li><a href="${s.link}" target="_blank" rel="noopener noreferrer">${s.name}</a></li>`)
    .join("");
}

function init() {
  renderFilters();
  renderTimeline();
  renderSuggestions();
  renderStats();
  renderEvidence();

  drawChart("gdpChart", annualData.gdpGrowth, { color: "#1cd3a2" });
  drawChart("inflationChart", annualData.inflationUS, { color: "#ffb84d" });
  drawChart("equityChart", annualData.spReturn, { color: "#4f8cff" });
  drawChart("commodityChart", annualData.commodityIdx, { color: "#d788ff" });

  searchInput.addEventListener("input", () => {
    renderSuggestions();
    renderTimeline();
  });

  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    renderSuggestions();
    renderTimeline();
  });
}

init();
