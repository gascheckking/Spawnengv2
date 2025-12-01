// ------- UTILITIES -------

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE = {
  streak: "spawnengine_streak",
  theme: "spawnengine_theme",
  wallets: "spawnengine_wallets"
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ------- TABS -------

function initTabs() {
  const tabs = $$(".tab");
  const views = $$(".view");

  function setTab(name) {
    tabs.forEach((t) =>
      t.classList.toggle("active", t.dataset.tab === name)
    );
    views.forEach((v) =>
      v.classList.toggle("active", v.dataset.view === name)
    );
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setTab(tab.dataset.tab));
  });

  // Allow menu shortcuts to trigger tabs
  $$(".side-links button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tabLink;
      setTab(target);
      closeMenu();
    });
  });

  setTab("overview");
}

// ------- THEME -------

function applyTheme(name) {
  document.documentElement.setAttribute("data-theme", name);
  localStorage.setItem(STORAGE.theme, name);
  $$(".theme-chip").forEach((chip) =>
    chip.classList.toggle("active", chip.dataset.theme === name)
  );
}

function initTheme() {
  const saved = localStorage.getItem(STORAGE.theme) || "deep";
  applyTheme(saved);

  $$(".theme-chip").forEach((chip) => {
    chip.addEventListener("click", () => applyTheme(chip.dataset.theme));
  });
}

// ------- MENU / WALLET LABEL -------

let connectedWallet = null;

function openMenu() {
  $("#side-menu").classList.add("open");
}

function closeMenu() {
  $("#side-menu").classList.remove("open");
}

function initMenu() {
  $("#btn-menu").addEventListener("click", openMenu);
  $("#btn-close-menu").addEventListener("click", closeMenu);
}

// Wallet connect mock
function initWalletConnect() {
  const btn = $("#btn-connect");
  btn.addEventListener("click", () => {
    if (!connectedWallet) {
      // Simple mock address
      connectedWallet = "0xF39...abC1";
    } else {
      connectedWallet = null;
    }
    updateWalletUI();
  });
}

function updateWalletUI() {
  const label = connectedWallet
    ? connectedWallet
    : "No wallet connected";
  $("#connect-label").textContent = connectedWallet
    ? "Disconnect"
    : "Connect wallet";
  $("#menu-wallet-label").textContent = label;
  $("#chip-active").textContent = connectedWallet ? "1" : "0";
}

// ------- DAILY STREAK -------

function loadStreak() {
  const raw = localStorage.getItem(STORAGE.streak);
  if (!raw) return { streak: 0, last: null };
  try {
    return JSON.parse(raw);
  } catch {
    return { streak: 0, last: null };
  }
}

function saveStreak(data) {
  localStorage.setItem(STORAGE.streak, JSON.stringify(data));
}

function computeNextStreak() {
  const today = todayKey();
  const yest = yesterdayKey();
  const s = loadStreak();

  let next = 1;
  if (s.last === today) {
    next = s.streak;
  } else if (s.last === yest) {
    next = s.streak + 1;
  }

  return { current: s.streak, next, last: s.last };
}

function updateStreakSummary() {
  const s = loadStreak();
  const streak = s.streak || 0;
  const cap = 7;
  const pct = Math.max(4, Math.min(100, (streak / cap) * 100));

  $("#streak-counter").textContent = `${streak} day${
    streak === 1 ? "" : "s"
  }`;
  $("#streak-fill").style.width = `${pct}%`;

  if (!streak) {
    $("#streak-copy").textContent =
      "Tap check-in once per day to start your mesh streak.";
  } else if (streak < cap) {
    $("#streak-copy").textContent = `Keep the streak for ${
      cap - streak
    } more day${cap - streak === 1 ? "" : "s"} for a full weekly run.`;
  } else {
    $("#streak-copy").textContent =
      "You’ve hit a full 7-day run. Legends would be proud.";
  }
}

function shouldShowStreakModalOnLoad() {
  const s = loadStreak();
  return s.last !== todayKey();
}

function openStreakModal() {
  const meta = computeNextStreak();
  $("#streak-modal").classList.remove("hidden");

  const s = meta.next;
  const cap = 7;
  const pct = Math.max(4, Math.min(100, (s / cap) * 100));
  $("#streak-modal-fill").style.width = `${pct}%`;

  let text;
  if (!meta.current) {
    text = "Day 1: ping the mesh and lock in your first streak orb.";
  } else {
    text = `Day ${s}: keep the streak so the mesh doesn’t forget you.`;
  }
  $("#streak-modal-text").textContent = text;
}

function closeStreakModal() {
  $("#streak-modal").classList.add("hidden");
}

function claimStreak() {
  const meta = computeNextStreak();
  const today = todayKey();
  const data = { streak: meta.next, last: today };
  saveStreak(data);
  updateStreakSummary();
  closeStreakModal();
}

function initStreak() {
  updateStreakSummary();

  $("#btn-open-streak").addEventListener("click", openStreakModal);
  $("#btn-close-streak").addEventListener("click", closeStreakModal);
  $("#btn-skip-streak").addEventListener("click", closeStreakModal);
  $("#btn-claim-streak").addEventListener("click", claimStreak);

  if (shouldShowStreakModalOnLoad()) {
    // small delay så den inte hoppar direkt när sidan laddar
    setTimeout(openStreakModal, 700);
  }
}

// ------- ACTIVITY METER -------

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function refreshActivity() {
  const value = randomInt(0, 100);
  const fill = $("#activity-fill");
  const text = $("#activity-text");

  // map 0–100 till 0–86% typ
  const pos = (value / 100) * 86;
  fill.style.transform = `translateX(${pos}%)`;

  let label;
  if (value < 25) {
    label = "Mesh is quiet – grail snipers have time to think.";
  } else if (value < 60) {
    label = "Healthy flow – pulls, swaps and a few sneaky burns.";
  } else if (value < 85) {
    label = "Busy – packs are flying and XP orbs are everywhere.";
  } else {
    label = "Full send – this is peak onchain chaos. Buckle up.";
  }

  text.textContent = label;
}

function initActivityMeter() {
  $("#btn-refresh-activity").addEventListener("click", refreshActivity);
  refreshActivity();
}

// ------- BUBBLE MAPS (LIGHT) -------

const MOCK_BUBBLES = [
  { label: "0xA9c…91f3", heat: "Hot pulls" },
  { label: "rainbow.vibe", heat: "Swap spree" },
  { label: "0x7Be…c101", heat: "Burning commons" },
  { label: "spawniz.eth", heat: "Watching grails" },
  { label: "0xF3d…88aa", heat: "Idle" }
];

function initBubbles() {
  const row = $("#bubble-row");
  row.innerHTML = "";
  MOCK_BUBBLES.forEach((b) => {
    const el = document.createElement("div");
    el.className = "bubble";
    el.innerHTML = `
      <span class="bubble-dot"></span>
      <span>${b.label}</span>
      <span style="opacity:.6;">· ${b.heat}</span>
    `;
    row.appendChild(el);
  });
}

// ------- PACKS MOCK -------

const MOCK_PACKS = [
  "Neon Fragments · Rare · opened",
  "Void Shard · Common · opened",
  "Shard Forge · Legendary · unopened",
  "Prime Relic · Epic · unopened",
  "Spawn Core · Mythic · unopened"
];

function initPacks() {
  const list = $("#pack-list");
  list.innerHTML = "";
  MOCK_PACKS.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

// ------- LAB LUCK -------

function rollLuck() {
  const val = randomInt(0, 100);
  const pos = (val / 100) * 86;
  $("#lab-fill").style.transform = `translateX(${pos}%)`;

  let label;
  if (val < 25) label = "Calm – today feels like base-rate luck.";
  else if (val < 60)
    label = "Decent – small streaks, nice for mid-tier hits.";
  else if (val < 90)
    label = "Spicy – odds feel tilted, grail hunting time.";
  else label = "Absurd – if this was real, you’d click pull. Twice.";

  $("#lab-text").textContent = label;
}

function initLab() {
  $("#btn-roll-luck").addEventListener("click", rollLuck);
}

// ------- WALLETS LIST -------

function loadWallets() {
  const raw = localStorage.getItem(STORAGE.wallets);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveWallets(list) {
  localStorage.setItem(STORAGE.wallets, JSON.stringify(list));
}

function renderWallets() {
  const list = $("#wallet-list");
  const wallets = loadWallets();

  list.innerHTML = "";
  if (!wallets.length) {
    const p = document.createElement("p");
    p.textContent = "No mock wallets yet – add a few to test multi-mesh.";
    p.style.fontSize = "11px";
    p.style.color = "var(--text-soft)";
    list.appendChild(p);
    return;
  }

  wallets.forEach((w) => {
    const el = document.createElement("div");
    el.className = "wallet-pill";
    el.innerHTML = `
      <span>${w.address}</span>
      <span style="opacity:.7;">${w.label}</span>
    `;
    list.appendChild(el);
  });
}

function addMockWallet() {
  const wallets = loadWallets();
  const id = wallets.length + 1;
  const addr = `0xMock…${(1000 + id).toString(16)}`;
  wallets.push({ address: addr, label: "Mesh node " + id });
  saveWallets(wallets);
  renderWallets();
}

function initWallets() {
  $("#btn-add-mock-wallet").addEventListener("click", addMockWallet);
  renderWallets();
}

// ------- OVERVIEW EVENTS -------

const MOCK_EVENTS = [
  { type: "pack_open", msg: "0xA93…e1c2 → Neon Fragments (Rare)" },
  { type: "burn", msg: "0x4B1…aa32 → Void Keys (Common)" },
  { type: "swap", msg: "0xD29…b81d → Shard Forge (Legendary)" },
  { type: "zora_buy", msg: "0x91F…ccd0 → Base Relics (Epic)" }
];

function initOverviewEvents() {
  const list = $("#overview-events");
  list.innerHTML = "";
  MOCK_EVENTS.forEach((e) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="event-type">${e.type}</span> ${e.msg}`;
    list.appendChild(li);
  });
}

// ------- INIT -------

function main() {
  initTabs();
  initTheme();
  initMenu();
  initWalletConnect();
  initStreak();
  initActivityMeter();
  initBubbles();
  initPacks();
  initLab();
  initWallets();
  initOverviewEvents();
  updateWalletUI();
}

document.addEventListener("DOMContentLoaded", main);