const budgetForm = document.getElementById("budgetForm");
const budgetStatus = document.getElementById("budgetStatus");
const budgetSummary = document.getElementById("budgetSummary");
const allocationContainer = document.getElementById("allocationContainer");
const allocationTotal = document.getElementById("allocationTotal");
const allocationLeads = document.getElementById("allocationLeads");

const CHANNEL_CONFIG = {
  "google-ads": { label: "Google Ads", cpl: 180 },
  "facebook-ads": { label: "Facebook Ads", cpl: 135 },
  "local-services-ads": { label: "Local Service Ads", cpl: 95 },
  seo: { label: "SEO", cpl: 95 }
};

const state = window.LeadGenFunnelStorage.read();
if (!Array.isArray(state.channels) || !state.channels.length) {
  window.LeadGenFunnelStorage.merge({ channels: ["google-ads"] });
}
if (!state.vslWorkflow) {
  window.LeadGenFunnelStorage.merge({ vslWorkflow: { mode: "upload", videoUrl: "", notes: "", uploadedFileName: "" } });
}
if (!state.businessAssets) {
  window.LeadGenFunnelStorage.merge({
    businessAssets: { imageFiles: [], testimonialFiles: [], blogFiles: [], testimonialText: "", contentLinks: "" }
  });
}
const activeState = window.LeadGenFunnelStorage.read();

function money(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return "$0";
  return `$${numeric.toLocaleString("en-US")}`;
}

function normalizeTo100(values) {
  const raw = values.map((value) => Math.max(0, Number(value) || 0));
  const sum = raw.reduce((acc, value) => acc + value, 0);
  if (sum <= 0) {
    const equal = Math.floor(100 / raw.length);
    const remainder = 100 - equal * raw.length;
    return raw.map((_, index) => equal + (index < remainder ? 1 : 0));
  }

  const scaled = raw.map((value) => (value / sum) * 100);
  const floored = scaled.map((value) => Math.floor(value));
  let remainder = 100 - floored.reduce((acc, value) => acc + value, 0);
  const order = scaled
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);

  let pointer = 0;
  while (remainder > 0 && order.length) {
    floored[order[pointer % order.length].index] += 1;
    pointer += 1;
    remainder -= 1;
  }
  return floored;
}

const budget = Math.max(1000, Number(activeState.monthlyBudgetUsd || 5000));
budgetSummary.textContent = `${activeState.businessName || "Draft intake"} · Monthly budget ${money(
  budget
)} · Selected channels: ${activeState.channels
  .map((channel) => CHANNEL_CONFIG[channel]?.label || channel)
  .join(", ")}`;

let allocations = (() => {
  const existing =
    activeState.channelAllocations && typeof activeState.channelAllocations === "object"
      ? activeState.channelAllocations
      : {};
  const seed = activeState.channels.map((channel) => Number(existing[channel] || 0));
  const normalized = normalizeTo100(seed.every((value) => value === 0) ? activeState.channels.map(() => 1) : seed);
  return activeState.channels.map((channel, index) => ({
    key: channel,
    label: CHANNEL_CONFIG[channel]?.label || channel,
    percent: normalized[index]
  }));
})();

function rebalance(changedKey, nextPercent) {
  const clamped = Math.max(0, Math.min(100, Math.round(Number(nextPercent) || 0)));
  const updated = allocations.map((entry) => ({ ...entry }));
  const target = updated.find((entry) => entry.key === changedKey);
  if (!target) return;

  const others = updated.filter((entry) => entry.key !== changedKey);
  if (!others.length) {
    target.percent = 100;
    allocations = updated;
    return;
  }

  const remaining = 100 - clamped;
  const otherCurrent = others.map((entry) => entry.percent);
  const otherSum = otherCurrent.reduce((acc, value) => acc + value, 0);

  let normalizedOthers;
  if (otherSum <= 0) {
    normalizedOthers = normalizeTo100(others.map(() => 1)).map((value) => Math.round((value / 100) * remaining));
  } else {
    const scaled = otherCurrent.map((value) => (value / otherSum) * remaining);
    const floored = scaled.map((value) => Math.floor(value));
    let remainder = remaining - floored.reduce((acc, value) => acc + value, 0);
    const order = scaled
      .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
      .sort((a, b) => b.fraction - a.fraction);
    let pointer = 0;
    while (remainder > 0 && order.length) {
      floored[order[pointer % order.length].index] += 1;
      pointer += 1;
      remainder -= 1;
    }
    normalizedOthers = floored;
  }

  target.percent = clamped;
  others.forEach((entry, index) => {
    entry.percent = normalizedOthers[index];
  });
  allocations = updated;
}

function estimateLeadRange() {
  let expected = 0;
  allocations.forEach((entry) => {
    const channelBudget = (budget * entry.percent) / 100;
    const cpl = CHANNEL_CONFIG[entry.key]?.cpl || 140;
    expected += channelBudget / cpl;
  });
  const rounded = Math.max(1, Math.round(expected));
  return {
    expected: rounded,
    low: Math.max(1, Math.floor(rounded * 0.8)),
    high: Math.max(1, Math.ceil(rounded * 1.2))
  };
}

const allocationRows = new Map();

function renderAllocationMeta() {
  const total = allocations.reduce((acc, entry) => acc + entry.percent, 0);
  const forecast = estimateLeadRange();
  allocationTotal.textContent = `Total allocation: ${total}%`;
  allocationLeads.textContent = `Expected leads at this split: ${forecast.low}-${forecast.high} / month (best estimate ${forecast.expected})`;
}

function syncAllocationUi() {
  allocations.forEach((entry) => {
    const row = allocationRows.get(entry.key);
    if (!row) return;
    row.percent.textContent = `${entry.percent}%`;
    row.slider.value = String(entry.percent);
  });
  renderAllocationMeta();
}

function initializeAllocationSliders() {
  allocationRows.clear();
  allocationContainer.innerHTML = "";
  allocations.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "allocation-row";
    row.innerHTML = `
      <div class="allocation-head">
        <strong>${entry.label}</strong>
        <span data-channel-percent="${entry.key}">${entry.percent}%</span>
      </div>
      <input type="range" min="0" max="100" step="1" value="${entry.percent}" data-channel-slider="${entry.key}" />
    `;
    allocationContainer.appendChild(row);

    const slider = row.querySelector(`input[data-channel-slider="${entry.key}"]`);
    const percent = row.querySelector(`span[data-channel-percent="${entry.key}"]`);
    if (!slider || !percent) return;
    allocationRows.set(entry.key, { slider, percent });

    slider.addEventListener("input", (event) => {
      rebalance(entry.key, event.target.value);
      syncAllocationUi();
    });
  });
  syncAllocationUi();
}

initializeAllocationSliders();

budgetForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = budgetForm.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Finishing...";
  }
  budgetStatus.textContent = "Saving setup...";
  budgetStatus.className = "message";

  const channelAllocations = allocations.reduce((acc, entry) => {
    acc[entry.key] = entry.percent;
    return acc;
  }, {});

  window.LeadGenFunnelStorage.merge({ channelAllocations });

  try {
    budgetStatus.textContent = "Setup complete. Opening owner lead dashboard...";
    budgetStatus.className = "message success";
    window.setTimeout(() => {
      window.location.href = "/marketing-lead-tracker";
    }, 450);
  } catch (error) {
    budgetStatus.textContent = `${error.message || "Unable to finish setup."}`;
    budgetStatus.className = "message error";
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Finish Setup";
    }
  }
});
