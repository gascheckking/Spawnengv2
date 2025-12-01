// Small helpers
const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => Array.from(document.querySelectorAll(sel));

// Simple state persisted in localStorage
const STORAGE_KEY = "spawn-mesh-hud";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        xp: 1575,
        spawn: 497,
        streakDays: 1,
        lastCheckIn: null,
        wallets: [
          { addr: "0xspawn...mesh", label: "Main mesh wallet" },
        ],
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      xp: 1575,
      spawn: 497,
      streakDays: 1,
      lastCheckIn: null,
      wallets: [
        { addr: "0xspawn...mesh", label: "Main mesh wallet" },
      ],
    };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

let state = loadState();

/* TABS */

function setupTabs() {
  const tabs = qsa(".tab");
  const views = qsa(".view");

  const activate = (target) => {
    tabs.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === target);
    });
    views.forEach((view) => {
      view.classList.toggle("active", view.dataset.view === target);
    });
  };

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.tab));
  });

  // side-menu shortcuts
  qsa("[data-tab-link]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activate(btn.dataset.tabLink);
      closeMenu();
    });
  });
}

/* MENU */

function openMenu() {
  const shell = qs(".side-menu");
  shell.classList.add("open");
}

function closeMenu() {
  const shell = qs(".side-menu");
  shell.classList.remove("open");
}

function setupMenu() {
  const side = qs(".side-menu");
  const btnMenu = qs("#btn-menu");
  const btnClose = qs("#btn-close-menu");

  btnMenu.addEventListener("click", openMenu);
  btnClose.addEventListener("click", closeMenu);

  side.addEventListener("click", (e) => {
    if (e.target === side) closeMenu();
  });

  // theme chips
  qsa(".theme-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const theme = chip.dataset.theme;
      document.documentElement.setAttribute("data-theme", theme);
      qsa(".theme-chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
    });
  });
}

/* WALLET MOCK + CONNECT */

function setupWallets() {
  renderWallets();
  updateWalletChip();

  const addBtn = qs("#btn-add-mock-wallet");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const n = state.wallets.length + 1;
      const addr = "0x" + Math.random().toString(16).slice(2, 6) + "...mesh";
      state.wallets.push({ addr, label: `Extra wallet #${n}` });
      saveState(state);
      renderWallets();
      updateWalletChip();
    });
  }

  const connectBtn = qs("#btn-connect");
  connectBtn.addEventListener("click", () => {
    if (connectBtn.dataset.connected === "yes") {
      connectBtn.dataset.connected = "no";
      qs("#connect-label").textContent = "Connect wallet";
      qs("#menu-wallet-label").textContent = "No wallet connected.";
      qs("#chip-mode").textContent = "Single mesh";
    } else {
      connectBtn.dataset.connected = "yes";
      qs("#connect-label").textContent = "Wallet connected";
      qs("#menu-wallet-label").textContent =
        state.wallets[0]?.addr ?? "0xspawn...mesh";
      qs("#chip-mode").textContent = "Mesh + wallet";
    }
  });
}

function renderWallets() {
  const list = qs("#wallet-list");
  if (!list) return;
  list.innerHTML = "";
  state.wallets.forEach((w) => {
    const div = document.createElement("div");
    div.className = "wallet-pill";
    div.innerHTML = `<span>${w.addr}</span><span>${w.label}</span>`;
    list.appendChild(div);
  });
}

function updateWalletChip() {
  qs("#chip-active").textContent = String(state.wallets.length);
}

/* BUBBLES + EVENTS */

function setupOverviewMock() {
  // gas mock
  qs("#chip-gas").textContent = "~0.24 gwei est.";

  // bubble map
  const bubbles = [
    { addr: "0xA9c...91f3", tag: "Hot pulls" },
    { addr: "rainbow.vibe", tag: "Swap spree" },
    { addr: "0x7BE...c101", tag: "Burning commons" },
    { addr: "spawniz.eth", tag: "Watching grails" },
    { addr: "0xF3d...88aa", tag: "Idle" },
  ];
  const row = qs("#bubble-row");
  row.innerHTML = "";
  bubbles.forEach((b) => {
    const el = document.createElement("div");
    el.className = "bubble";
    el.innerHTML = `
      <span class="bubble-dot"></span>
      <span>${b.addr}</span>
      <span class="bubble-tag">· ${b.tag}</span>
    `;
    row.appendChild(el);
  });

  // events
  const events = [
    {
      type: "pack_open",
      main: "0xA93...e1c2 → Neon Fragments (Rare)",
      meta: "10s ago",
    },
    {
      type: "burn",
      main: "0x4B1...aa32 → Void Keys (Common)",
      meta: "25s ago",
    },
    {
      type: "swap",
      main: "0xD29...b81d → Shard Forge (Legendary)",
      meta: "1m ago",
    },
    {
      type: "zora_buy",
      main: "0x91F...ccd0 → Base Relics (Epic)",
      meta: "2m ago",
    },
  ];
  const list = qs("#overview-events");
  list.innerHTML = "";
  events.forEach((ev) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `
      <span class="event-type">${ev.type}</span>
      <span class="event-main">${ev.main}</span>
      <span class="event-meta">${ev.meta}</span>
    `;
    list.appendChild(li);
  });

  // packs mock list
  const packs = [
    "Neon Fragment · Rare · opened",
    "Void Shard · Common · opened",
    "Shard Forge · Legendary · unopened",
    "Prime Relic · Epic · opened",
    "Spawn Core · Mythic · unopened",
  ];
  const packList = qs("#pack-list");
  packList.innerHTML = "";
  packs.forEach((p) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `<span class="event-main">${p}</span>`;
    packList.appendChild(li);
  });
}

/* MESH LOAD + LAB LUCK */

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function updateMeshLoad() {
  const value = randomBetween(5, 100);
  const fill = qs("#activity-fill");
  const text = qs("#activity-text");

  fill.style.width = `${value}%`;

  let label;
  if (value < 30) label = "Quiet – grails are resting.";
  else if (value < 70) label = "Active – packs are flying.";
  else label = "Wild – XP orbs everywhere.";

  text.textContent = label;
}

function setupMeshLoad() {
  updateMeshLoad();
  qs("#btn-refresh-activity").addEventListener("click", updateMeshLoad);
}

function rollLuck() {
  const value = randomBetween(1, 100);
  const fill = qs("#lab-fill");
  const text = qs("#lab-text");
  fill.style.width = `${value}%`;

  if (value < 25) {
    text.textContent = "Cold pockets – maybe wait for a better pulse.";
  } else if (value < 60) {
    text.textContent = "Decent odds – time for a few warm-up packs.";
  } else if (value < 85) {
    text.textContent = "Hot lane – streak XP wants to be claimed.";
  } else {
    text.textContent = "Mythic window – this is where grails spawn.";
  }
}

function setupLab() {
  qs("#btn-roll-luck").addEventListener("click", rollLuck);
}

/* STREAK + MODAL */

function sameDay(tsA, tsB) {
  if (!tsA || !tsB) return false;
  const a = new Date(tsA);
  const b = new Date(tsB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function updateStreakUI() {
  const counter = qs("#streak-counter");
  const copy = qs("#streak-copy");
  const bar = qs("#streak-fill");
  const modalBar = qs("#streak-modal-fill");
  const modalText = qs("#streak-modal-text");

  const days = state.streakDays || 0;
  counter.textContent = `${days} day${days === 1 ? "" : "s"}`;

  const pct = Math.min(100, (days / 7) * 100);
  bar.style.width = `${pct}%`;
  modalBar.style.width = `${pct}%`;

  const remaining = Math.max(0, 7 - days);
  copy.textContent =
    remaining > 0
      ? `Keep the streak for ${remaining} more day${
          remaining === 1 ? "" : "s"
        } for a full weekly run.`
      : "Weekly streak complete – keep it rolling for bonus XP.";

  modalText.textContent =
    "Ping the mesh once per day to build your streak. Missing a day will reset the bar.";
}

function openStreakModal() {
  qs("#streak-modal").classList.remove("hidden");
}

function closeStreakModal() {
  qs("#streak-modal").classList.add("hidden");
}

function setupStreak() {
  // ensure UI matches loaded state
  updateStreakUI();

  qs("#btn-open-streak").addEventListener("click", openStreakModal);
  qs("#btn-close-streak").addEventListener("click", closeStreakModal);
  qs("#btn-skip-streak").addEventListener("click", closeStreakModal);

  qs("#btn-claim-streak").addEventListener("click", () => {
    const now = Date.now();
    if (sameDay(now, state.lastCheckIn)) {
      // already checked in today, just close
      closeStreakModal();
      return;
    }
    state.streakDays = (state.streakDays || 0) + 1;
    state.lastCheckIn = now;
    state.xp += 25;
    state.spawn += 1;
    saveState(state);
    qs("#metric-xp").textContent = `${state.xp} XP`;
    qs("#metric-spawn").textContent = `${state.spawn} SPN`;
    updateStreakUI();
    closeStreakModal();
  });
}

/* INIT */

document.addEventListener("DOMContentLoaded", () => {
  // metrics from state
  qs("#metric-xp").textContent = `${state.xp} XP`;
  qs("#metric-spawn").textContent = `${state.spawn} SPN`;

  setupTabs();
  setupMenu();
  setupWallets();
  setupOverviewMock();
  setupMeshLoad();
  setupLab();
  setupStreak();
});