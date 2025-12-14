// app.js (ESM)
import { getUnifiedActivity, computeStatsFromEvents } from "./services/activity.js";

// Simple helper
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* =========================
   PERF / RUNTIME
========================= */
const MAX_EVENTS = 120;          // keep in memory
const RENDER_EVENTS = 40;        // render caps to avoid DOM bloat
const PULSE_MS = 4500;           // same feel as before
const LIVE_IDLE_OFF_MS = 20000;  // optional “LIVE” window

let __pulseTimer = null;
let __liveUntil = 0;

function clampEvents(list) {
  if (!Array.isArray(list)) return [];
  if (list.length <= MAX_EVENTS) return list;
  return list.slice(0, MAX_EVENTS);
}

function startPulse() {
  if (__pulseTimer) return;
  __pulseTimer = setInterval(() => {
    // Don't spam when tab hidden
    if (document.hidden) return;
    addRandomMeshEvent();
    maybeRunBot();
    renderAll();
  }, PULSE_MS);
}

function stopPulse() {
  if (!__pulseTimer) return;
  clearInterval(__pulseTimer);
  __pulseTimer = null;
}

function setLiveMode(ms = LIVE_IDLE_OFF_MS) {
  __liveUntil = Date.now() + ms;
}

/* =========================
   STATE
========================= */
const state = {
  connected: false,
  activeWallet: null,
  wallets: [],
  events: [],
  xp: 0,
  spn: 0,
  inv: {
    sealed: 2,
    opened: 0,
    Fragment: 20,
    Shard: 2,
    Core: 0,
    Artifact: 0,
    Relic: 0,
  },
  streakDays: 0,
  bot: {
    autoOpen: false,
    autoClaim: false,
    autoGambit: false,
    alerts: true,
  },
  alerts: {
    whale: false,
    relic: false,
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  setupTabs();
  setupWalletConnectMock();
  setupMeshLoad();
  setupBubbles();
  setupStreak();
  setupTrading();
  setupPacks();
  setupGambit();
  setupWallets();
  setupChat();
  setupForge();
  setupSupCast();
  setupBot();
  setupSettings();

  await bootMesh();

  // Pulse button
  $("#btn-pulse-now")?.addEventListener("click", () => {
    addRandomMeshEvent({ loud: true });
    setLiveMode();
    renderAll();
  });

  // Pause/Resume pulses when tab visibility changes
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopPulse();
    else startPulse();
  });

  startPulse();
});

/* =========================
   CORE: MESH
========================= */

async function bootMesh() {
  $("#chip-sync").textContent = "Local mock";
  const events = await getUnifiedActivity();
  state.events = clampEvents(events || []);

  // Seed balances a bit from events
  state.spn = 497;
  state.xp = 1575;

  renderAll();
}

function addRandomMeshEvent(opts = {}) {
  const kinds = ["pack_open", "swap", "burn", "zora_buy", "farcaster_cast", "gamble", "reward"];
  const kind = kinds[Math.floor(Math.random() * kinds.length)];
  const seriesPool = ["Genesis", "ZoraPacks", "Social"];
  const series = seriesPool[Math.floor(Math.random() * seriesPool.length)];

  const rarityPool = ["Fragment", "Shard", "Core", "Artifact", "Relic"];
  const rarity = rarityPool[Math.floor(Math.random() * rarityPool.length)];

  const score = Math.floor(40 + Math.random() * 5000);
  const owner =
    state.activeWallet?.addr ||
    "0x" + Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6);

  const e = {
    id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
    kind,
    label: labelFor(kind, series, rarity),
    short: shortFor(kind),
    series,
    rarity,
    owner,
    tags: tagsFor(kind),
    score,
    timestamp: Date.now(),
  };

  // push + clamp (prevents infinite growth)
  state.events = clampEvents([e, ...(state.events || [])]);

  // Light economy drip (local sim)
  if (kind === "pack_open") {
    state.inv.opened += 1;
    state.xp += 15;
    state.spn += 12;

    // Add low-tier pieces too
    if (Math.random() < 0.55) state.inv.Fragment += 5;
    if (Math.random() < 0.25) state.inv.Shard += 1;

    // Rare hits
    if (rarity === "Core") state.inv.Core += 1;
    if (rarity === "Artifact") state.inv.Artifact += 1;
    if (rarity === "Relic") state.inv.Relic += 1;
  }

  if (kind === "reward") {
    state.xp += 25;
    state.spn += 18;
  }

  if (state.bot.alerts) maybeAlertFromEvent(e, opts.loud);
}

function labelFor(kind, series, rarity) {
  const r = rarity;
  if (kind === "pack_open") return `${series} pull → ${r} hit`;
  if (kind === "swap") return `${series} swap → ${r} route`;
  if (kind === "burn") return `${series} burn → ${r} fuel`;
  if (kind === "zora_buy") return `Zora buy → ${series} · ${r}`;
  if (kind === "farcaster_cast") return `Cast mirrored → “${series} is popping”`;
  if (kind === "gamble") return `Gambit roll → ${r} turbulence`;
  if (kind === "reward") return `Reward claim → XP + SPN`;
  return `${series} event`;
}

function shortFor(kind) {
  return (
    {
      pack_open: "OPEN",
      swap: "SWAP",
      burn: "BURN",
      zora_buy: "ZORA",
      farcaster_cast: "CAST",
      gamble: "GMBL",
      reward: "CLM",
    }[kind] || "EVT"
  );
}

function tagsFor(kind) {
  if (kind === "zora_buy") return ["zora", "market"];
  if (kind === "farcaster_cast") return ["farcaster", "social"];
  if (kind === "gamble") return ["gamble", "shardonly"];
  if (kind === "pack_open") return ["pull", "packs"];
  if (kind === "burn") return ["burn"];
  if (kind === "swap") return ["swap"];
  if (kind === "reward") return ["reward", "xp"];
  return ["mesh"];
}

function maybeAlertFromEvent(e, loud) {
  const isWhale = e.score >= 2000;
  const isRelicHit = e.rarity === "Relic" || (e.kind === "zora_buy" && e.score >= 5000);

  if (state.alerts.whale && isWhale) toast(`🐋 Whale pulse: ${e.label}`, loud ? 2600 : 1800);
  if (state.alerts.relic && isRelicHit) toast(`💎 Treasure hit: ${e.label}`, loud ? 2600 : 1800);
}

function renderAll() {
  renderHeaderMetrics();
  renderTicker();
  renderOverview();
  renderMeshStats();
  renderTrading();
  renderPacks();
  renderGambit();
  renderWalletSnapshot();
}

/* =========================
   TABS
========================= */

function setupTabs() {
  const tabs = $$(".tab");
  const views = $$(".view");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.getAttribute("data-tab");
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      views.forEach((view) => {
        const viewKey = view.getAttribute("data-view");
        view.classList.toggle("active", viewKey === target);
      });
    });
  });
}

/* =========================
   WALLET CONNECT (mock)
========================= */

function setupWalletConnectMock() {
  const btn = $("#btn-connect");
  const label = $("#connect-label");
  const walletChip = $("#chip-active");

  btn.addEventListener("click", () => {
    state.connected = !state.connected;

    if (state.connected) {
      label.textContent = "Disconnect";
      if (!state.wallets.length) seedWallets();
      state.activeWallet = state.wallets[0];
      walletChip.textContent = String(state.wallets.length);
      toast("Wallet connected (mock). Mesh unlocked.", 1800);
    } else {
      label.textContent = "Connect wallet";
      walletChip.textContent = "0";
      state.activeWallet = null;
      toast("Disconnected.", 1400);
    }

    renderWalletList();
    renderAll();
  });
}

function seedWallets() {
  state.wallets = [
    { label: "Main vault", addr: "0xF3a…92b0", active: true },
    { label: "Sniping wallet", addr: "0x91c…7e10", active: false },
  ];
}

/* =========================
   MESH LOAD
========================= */

function setupMeshLoad() {
  const fill = $("#activity-fill");
  const text = $("#activity-text");
  const gasChip = $("#chip-gas");
  const btn = $("#btn-refresh-activity");

  function pulse() {
    const load = Math.floor(Math.random() * 101);
    fill.style.width = `${load}%`;

    if (load < 30) text.textContent = "Quiet – packs are idling.";
    else if (load < 70) text.textContent = "Active – packs & XP are flowing.";
    else text.textContent = "Wild – packs are flying and XP orbs everywhere.";

    const gas = (0.12 + Math.random() * 0.18).toFixed(2);
    gasChip.textContent = `~${gas} gwei est.`;
  }

  pulse();
  btn.addEventListener("click", pulse);
}

/* =========================
   BUBBLE MAP MOCK
========================= */

function setupBubbles() {
  const row = $("#bubble-row");
  const sample = [
    { addr: "0xA9c...91f3", status: "Hot pulls" },
    { addr: "rainbow.vibe", status: "Swap spree" },
    { addr: "0x7Be...c101", status: "Burning commons" },
    { addr: "spawniz.eth", status: "Watching grails" },
    { addr: "0xF3d...88aa", status: "Idle" },
  ];

  row.innerHTML = "";
  sample.forEach((w) => {
    const pill = document.createElement("div");
    pill.className = "bubble-pill";
    pill.innerHTML = `
      <span class="bubble-dot"></span>
      <span class="bubble-label">${w.addr} · ${w.status}</span>
    `;
    row.appendChild(pill);
  });
}

/* =========================
   HEADER METRICS
========================= */

function renderHeaderMetrics() {
  $("#metric-xp").textContent = `${state.xp} XP`;
  $("#metric-spawn").textContent = `${state.spn} SPN`;
}

/* =========================
   TICKER
========================= */

function renderTicker() {
  const el = $("#ticker-marquee");
  if (!el) return;

  const slice = (state.events || []).slice(0, 12);
  const parts = slice.map((e) => `• ${e.short} · ${e.series} · ${e.rarity} · score ${e.score}`);
  const line = parts.join("   ");
  // Duplicate for smooth marquee
  el.textContent = line + "     " + line;
}

/* =========================
   OVERVIEW
========================= */

function setupEventsFilter() {
  $("#overview-filter")?.addEventListener("change", renderOverview);
}

function renderOverview() {
  setupEventsFilter();

  const list = $("#overview-events");
  if (!list) return;

  const filter = $("#overview-filter")?.value || "all";
  const events = (state.events || [])
    .filter((e) => {
      if (filter === "all") return true;
      if (filter === "gamble") return e.kind === "gamble" || (e.tags || []).includes("gamble");
      return e.kind === filter;
    })
    .slice(0, 18);

  list.innerHTML = "";
  events.forEach((ev) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `
      <div class="event-title">${ev.kind} · <span style="opacity:.9">${ev.label}</span></div>
      <div class="event-meta">${ev.owner} · ${timeAgo(ev.timestamp)} · score ${ev.score}</div>
      <div class="event-chiprow">
        ${[ev.series, ev.rarity, ...(ev.tags || [])]
          .slice(0, 5)
          .map((t) => `<span class="chip">${t}</span>`)
          .join("")}
      </div>
    `;
    list.appendChild(li);
  });
}

/* =========================
   MESH STATS
========================= */

function renderMeshStats() {
  const stats = computeStatsFromEvents(state.events || []);
  $("#stat-totalPacks").textContent = String(stats.totalPacks);
  $("#stat-holders").textContent = String(stats.holderCount);

  // Local "luck"
  const my = (state.events || []).slice(0, 20).reduce((a, e) => a + (e.score || 0), 0);
  $("#stat-luck").textContent = String(Math.floor(my / 20));
}

/* =========================
   TRADING
========================= */

function setupTrading() {
  $("#trade-view")?.addEventListener("change", () => {
    const v = $("#trade-view").value;
    $("#trade-pane-tape").classList.toggle("hidden", v !== "tape");
    $("#trade-pane-ob").classList.toggle("hidden", v !== "orderbook");
  });

  $("#btn-quick-buy")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    const cost = 38;
    if (state.spn < cost) return toast("Not enough SPN (mock).", 1600);
    state.spn -= cost;
    state.xp += 6;
    addSwapEvent("Buy", cost);
    toast("Quick buy executed (mock).", 1500);
    renderAll();
  });

  $("#btn-quick-sell")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    const gain = 28;
    state.spn += gain;
    state.xp += 4;
    addSwapEvent("Sell", gain);
    toast("Quick sell executed (mock).", 1500);
    renderAll();
  });
}

function addSwapEvent(side, amount) {
  const series = $("#trade-series")?.value || "Genesis";
  const e = {
    id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
    kind: "swap",
    label: `${side} route → ${series} · ${amount} SPN`,
    short: "SWAP",
    series,
    rarity: "Shard",
    owner: state.activeWallet?.addr || "0x0000…0000",
    tags: ["swap", "trading"],
    score: Math.floor(100 + Math.random() * 900),
    timestamp: Date.now(),
  };
  state.events = clampEvents([e, ...(state.events || [])]);
}

function renderTrading() {
  // Tape from mesh
  const tape = $("#trade-tape");
  if (tape) {
    const series = $("#trade-series")?.value || "Genesis";
    const rows = (state.events || [])
      .filter((e) => e.kind === "swap" || (e.tags || []).includes("trading"))
      .filter((e) => e.series === series)
      .slice(0, 14);

    tape.innerHTML = "";
    rows.forEach((e) => {
      const li = document.createElement("li");
      li.className = "event-item";
      li.innerHTML = `
        <div class="event-title">${e.label}</div>
        <div class="event-meta">${timeAgo(e.timestamp)} · score ${e.score}</div>
      `;
      tape.appendChild(li);
    });
  }

  // Orderbook mock
  const bids = $("#ob-bids");
  const asks = $("#ob-asks");
  if (bids && asks) {
    bids.innerHTML = "";
    asks.innerHTML = "";
    const mid = 42 + Math.random() * 12;

    const mk = (p, s) => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${p.toFixed(2)}</span><span>${s}</span>`;
      return li;
    };

    for (let i = 0; i < 6; i++) bids.appendChild(mk(mid - (i + 1) * 0.6, 20 + Math.floor(Math.random() * 90)));
    for (let i = 0; i < 6; i++) asks.appendChild(mk(mid + (i + 1) * 0.6, 20 + Math.floor(Math.random() * 90)));
  }

  // Snapshot
  $("#trade-spn").textContent = String(state.spn);
  $("#trade-frag").textContent = String(state.inv.Fragment);
  $("#trade-shard").textContent = String(state.inv.Shard);
}

/* =========================
   PACKS
========================= */

function setupPacks() {
  $("#btn-open-pack")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    if (state.inv.sealed <= 0) return toast("No sealed packs (mock).", 1600);

    state.inv.sealed -= 1;
    addPackOpenEvent();
    toast("Pack opened (mock).", 1500);
    renderAll();
  });

  $("#btn-seal-pack")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    state.inv.sealed += 1;
    toast("Added sealed pack (mock).", 1400);
    renderPacks();
  });

  $("#pack-filter")?.addEventListener("change", renderPacks);
}

function addPackOpenEvent() {
  const series = $("#trade-series")?.value || "Genesis";
  const rarity = rollRarity();
  const e = {
    id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
    kind: "pack_open",
    label: `${series} pack open → ${rarity}`,
    short: "OPEN",
    series,
    rarity,
    owner: state.activeWallet?.addr || "0x0000…0000",
    tags: ["pull", "packs"],
    score: rarityScore(rarity),
    timestamp: Date.now(),
  };
  state.events = clampEvents([e, ...(state.events || [])]);

  state.inv.opened += 1;
  state.xp += 12;
  state.spn += 10;

  if (rarity === "Fragment") state.inv.Fragment += 6;
  if (rarity === "Shard") state.inv.Shard += 2;
  if (rarity === "Core") state.inv.Core += 1;
  if (rarity === "Artifact") state.inv.Artifact += 1;
  if (rarity === "Relic") state.inv.Relic += 1;

  if (state.bot.alerts) maybeAlertFromEvent(e, true);
}

function rollRarity() {
  const r = Math.random();
  if (r < 0.62) return "Fragment";
  if (r < 0.9) return "Shard";
  if (r < 0.975) return "Core";
  if (r < 0.995) return "Artifact";
  return "Relic";
}

function rarityScore(r) {
  if (r === "Fragment") return 60 + Math.floor(Math.random() * 120);
  if (r === "Shard") return 180 + Math.floor(Math.random() * 420);
  if (r === "Core") return 900 + Math.floor(Math.random() * 1400);
  if (r === "Artifact") return 2400 + Math.floor(Math.random() * 3200);
  return 7000 + Math.floor(Math.random() * 6000);
}

function renderPacks() {
  const list = $("#pack-list");
  if (!list) return;

  const filter = $("#pack-filter")?.value || "all";
  const rows = [];

  for (let i = 0; i < state.inv.sealed; i++) rows.push({ type: "sealed", txt: "Sealed pack · unopened" });
  for (let i = 0; i < Math.min(state.inv.opened, 20); i++) rows.push({ type: "opened", txt: "Opened pack · logged in mesh" });

  const shown =
    filter === "all" ? rows : filter === "sealed" ? rows.filter((r) => r.type === "sealed") : rows.filter((r) => r.type === "opened");

  list.innerHTML = "";
  shown.slice(0, 18).forEach((p) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `<div class="event-title">${p.txt}</div>`;
    list.appendChild(li);
  });
}

/* =========================
   GAMBIT (Fragment/Shard only)
========================= */

function setupGambit() {
  $("#btn-frag-burn")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    if (state.inv.Fragment < 10) return toast("Need 10 Fragments.", 1600);

    state.inv.Fragment -= 10;
    state.inv.Shard += 1;
    writeGambleEvent("burn", "Fragment", "Shard", 260);
    toast("Burned 10 Fragments → 1 Shard.", 1500);
    renderAll();
  });

  $("#btn-frag-double")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    if (state.inv.Fragment < 6) return toast("Need 6 Fragments.", 1600);

    state.inv.Fragment -= 6;

    const win = Math.random() < 0.48;
    if (win) {
      state.inv.Fragment += 14;
      writeGambleEvent("gamble", "Fragment", "Fragment", 180);
      toast("Risk roll: win. Fragments multiplied.", 1600);
    } else {
      writeGambleEvent("gamble", "Fragment", "dust", 140);
      toast("Risk roll: lost. Fragments vaporized.", 1600);
    }
    renderAll();
  });

  $("#btn-shard-up")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    if (state.inv.Shard < 2) return toast("Need 2 Shards.", 1600);

    state.inv.Shard -= 2;

    // Chance Core, otherwise refund 1 shard
    const hit = Math.random() < 0.18;
    if (hit) {
      state.inv.Core += 1;
      writeTreasureEvent("Core");
      toast("Shard engine: Core forged.", 1600);
    } else {
      state.inv.Shard += 1;
      writeGambleEvent("gamble", "Shard", "Shard", 220);
      toast("Shard engine: no Core. Partial refund.", 1600);
    }
    renderAll();
  });

  $("#btn-shard-safe")?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    if (state.inv.Shard < 1) return toast("Need 1 Shard.", 1600);

    // Safe swap into SPN
    state.inv.Shard -= 1;
    state.spn += 55;
    writeGambleEvent("swap", "Shard", "SPN", 200);
    toast("Shard swapped to SPN (mock).", 1500);
    renderAll();
  });
}

function writeGambleEvent(kind, from, to, baseScore) {
  const e = {
    id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
    kind: "gamble",
    label: `${kind.toUpperCase()} · ${from} → ${to}`,
    short: "GMBL",
    series: "Gambit",
    rarity: from === "Shard" ? "Shard" : "Fragment",
    owner: state.activeWallet?.addr || "0x0000…0000",
    tags: ["gamble", "shardonly"],
    score: baseScore + Math.floor(Math.random() * 260),
    timestamp: Date.now(),
  };
  state.events = clampEvents([e, ...(state.events || [])]);
}

function writeTreasureEvent(rarity) {
  const e = {
    id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
    kind: "reward",
    label: `TREASURE HIT · forged ${rarity}`,
    short: "CLM",
    series: "Gambit",
    rarity,
    owner: state.activeWallet?.addr || "0x0000…0000",
    tags: ["treasure_hit", "reward"],
    score: rarity === "Core" ? 1800 + Math.floor(Math.random() * 900) : 5200,
    timestamp: Date.now(),
  };
  state.events = clampEvents([e, ...(state.events || [])]);

  if (state.bot.alerts) maybeAlertFromEvent(e, true);
}

function renderGambit() {
  $("#g-frag-bal").textContent = String(state.inv.Fragment);
  $("#g-shard-bal").textContent = String(state.inv.Shard);

  const log = $("#gambit-log");
  if (!log) return;

  const rows = (state.events || [])
    .filter((e) => e.kind === "gamble" || (e.tags || []).includes("treasure_hit"))
    .slice(0, 14);

  log.innerHTML = "";
  rows.forEach((e) => {
    const li = document.createElement("li");
    li.className = "event-item";
    li.innerHTML = `
      <div class="event-title">${e.label}</div>
      <div class="event-meta">${timeAgo(e.timestamp)} · score ${e.score}</div>
    `;
    log.appendChild(li);
  });
}

/* =========================
   WALLETS
========================= */

function setupWallets() {
  const list = $("#wallet-list");
  const btnAdd = $("#btn-add-mock-wallet");
  const btnSet = $("#btn-set-active");
  const roleSel = $("#wallet-role");

  $("#alert-whale")?.addEventListener("change", (e) => {
    state.alerts.whale = e.target.checked;
    toast("Whale alert updated.", 1200);
  });

  $("#alert-relic")?.addEventListener("change", (e) => {
    state.alerts.relic = e.target.checked;
    toast("Relic alert updated.", 1200);
  });

  if (!list || !btnAdd) return;

  btnAdd.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);

    const id = state.wallets.length + 1;
    state.wallets.push({
      label: roleSel?.value || "Mesh node " + id,
      addr: "0x" + Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6),
      active: false,
    });

    $("#chip-active").textContent = String(state.wallets.length);
    renderWalletList();
  });

  btnSet?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    if (!state.wallets.length) return;

    // Rotate active
    const idx = state.wallets.findIndex((w) => w.active);
    const next = (idx + 1) % state.wallets.length;
    state.wallets.forEach((w, i) => (w.active = i === next));
    state.activeWallet = state.wallets[next];

    toast(`Active wallet: ${state.activeWallet.addr}`, 1500);
    renderWalletList();
  });
}

function renderWalletList() {
  const list = $("#wallet-list");
  if (!list) return;

  list.innerHTML = "";
  state.wallets.forEach((w) => {
    const row = document.createElement("div");
    row.className = "wallet-row";
    row.innerHTML = `
      <span>${w.addr}</span>
      <span class="wallet-tag">${w.active ? "ACTIVE · " : ""}${w.label}</span>
    `;
    list.appendChild(row);
  });
}

function renderWalletSnapshot() {
  // chip sync + active wallet count already handled elsewhere
  // keep this spot for future expansions
}

/* =========================
   DAILY STREAK
========================= */

function setupStreak() {
  const counter = $("#streak-counter");
  const fill = $("#streak-fill");
  const copy = $("#streak-copy");
  const modal = $("#streak-modal");
  const modalFill = $("#streak-modal-fill");
  const modalText = $("#streak-modal-text");

  const btnOpen = $("#btn-open-streak");
  const btnClose = $("#btn-close-streak");
  const btnClaim = $("#btn-claim-streak");
  const btnSkip = $("#btn-skip-streak");

  function updateUI() {
    counter.textContent = `${state.streakDays} day${state.streakDays === 1 ? "" : "s"}`;
    const pct = Math.min((state.streakDays / 7) * 100, 100);
    fill.style.width = pct + "%";
    modalFill.style.width = pct + "%";

    const remaining = Math.max(0, 7 - state.streakDays);
    copy.textContent =
      remaining > 0 ? `Keep the streak for ${remaining} more days for a full weekly run.` : "Full weekly run completed – mesh is glowing.";
    modalText.textContent = "Ping the mesh once per day to build your streak.";
  }

  updateUI();

  btnOpen?.addEventListener("click", () => modal.classList.remove("hidden"));
  const closeModal = () => modal.classList.add("hidden");
  btnClose?.addEventListener("click", closeModal);
  btnSkip?.addEventListener("click", closeModal);

  btnClaim?.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);

    // REAL DAILY LOCK (1 claim per ISO date)
    const today = new Date().toISOString().slice(0, 10);
    if (state.dailyClaimedISO === today) return toast("Already claimed today.", 1600);

    state.dailyClaimedISO = today;

    state.streakDays = Math.min(state.streakDays + 1, 7);
    state.xp += 35;
    state.spn += 20;

    // Write reward event
    const e = {
      id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
      kind: "reward",
      label: `Daily check-in · streak day ${state.streakDays}`,
      short: "CLM",
      series: "Streak",
      rarity: "Shard",
      owner: state.activeWallet?.addr || "0x0000…0000",
      tags: ["reward", "xp", "streak"],
      score: 180 + state.streakDays * 40,
      timestamp: Date.now(),
    };
    state.events = clampEvents([e, ...(state.events || [])]);

    updateUI();
    closeModal();
    toast("Streak claimed (mock).", 1500);
    renderAll();
  });
}

/* =========================
   CHAT
========================= */

function setupChat() {
  const stream = $("#chat-stream");
  const input = $("#chat-input");
  const send = $("#btn-send-chat");

  if (!stream || !input || !send) return;

  // Seed
  const seed = [
    { who: "them", txt: "Collector room is live. Anyone hit Relic today?" },
    { who: "them", txt: "Dev: next patch will hook read-only onchain logs → same mesh." },
    { who: "me", txt: "SpawnEngine feels like one brain. Trading + packs in one feed." },
  ];
  seed.forEach((m) => pushMsg(m.who, m.txt, false));

  send.addEventListener("click", () => {
    const v = input.value.trim();
    if (!v) return;
    pushMsg("me", v);
    input.value = "";

    // Tiny bot reply
    setTimeout(() => {
      pushMsg("them", "Noted. Mirror that into SupCast or turn it into a bounty?");
    }, 700);
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send.click();
  });

  function pushMsg(who, txt, autoscroll = true) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.innerHTML = `
      <div>${escapeHtml(txt)}</div>
      <div class="msg-meta">${who === "me" ? "You" : "Mesh"} · ${new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}</div>
    `;
    stream.appendChild(div);
    if (autoscroll) stream.scrollTop = stream.scrollHeight;
  }
}

/* =========================
   FORGE
========================= */

function setupForge() {
  const out = $("#forge-output");
  const btnPreview = $("#btn-forge-preview");
  const btnDeploy = $("#btn-forge-deploy");

  const seriesEl = $("#forge-series");
  const presetEl = $("#forge-preset");
  const oddsEl = $("#forge-odds");
  const cutEl = $("#forge-cut");

  if (!out || !btnPreview || !btnDeploy) return;

  const buildConfig = () => ({
    seriesName: (seriesEl?.value || "Genesis").trim(),
    preset: presetEl?.value || "TokenPackSeries",
    oddsMood: oddsEl?.value || "safe",
    creatorCutPct: Number(cutEl?.value || 25),
    baseUnit: 100000,
    rules: {
      gambit: "Fragment + Shard only",
      protected: ["Core", "Artifact", "Relic"],
      mesh: "all actions emit unified events",
    },
  });

  const show = () => {
    out.textContent = JSON.stringify(buildConfig(), null, 2);
  };

  btnPreview.addEventListener("click", () => {
    show();
    toast("Forge config previewed.", 1300);
  });

  btnDeploy.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    show();

    const cfg = buildConfig();
    const e = {
      id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
      kind: "deploy",
      label: `Deploy (mock) · ${cfg.preset} · ${cfg.seriesName}`,
      short: "DPLY",
      series: cfg.seriesName,
      rarity: "Core",
      owner: state.activeWallet?.addr || "0x0000…0000",
      tags: ["deploy", "creator"],
      score: 888,
      timestamp: Date.now(),
    };
    state.events = clampEvents([e, ...(state.events || [])]);

    toast("Deployed (mock). Event written to mesh.", 1700);
    renderAll();
  });
}

/* =========================
   SUPCAST
========================= */

function setupSupCast() {
  const list = $("#supcast-list");
  const filter = $("#supcast-filter");
  const btnNew = $("#btn-new-ticket");
  if (!list || !filter || !btnNew) return;

  const tickets = [
    { kind: "idea", label: "Add Pack Reveal Widget (CSGO-style) as SpawnAPI module." },
    { kind: "bug", label: "Trading wall: add saved filters per wallet group." },
    { kind: "bounty", label: "Quest: open 3 packs + burn 10 fragments → reward XP." },
    { kind: "idea", label: "Bubble map: cluster wallets by series affinity." },
  ];

  const render = () => {
    const f = filter.value;
    const rows = f === "all" ? tickets : tickets.filter((t) => t.kind === f);
    list.innerHTML = "";
    rows.forEach((t) => {
      const li = document.createElement("li");
      li.className = "event-item";
      li.innerHTML = `
        <div class="event-title">${t.kind.toUpperCase()} · ${t.label}</div>
        <div class="event-meta">SupCast · local ticket</div>
      `;
      list.appendChild(li);
    });
  };

  filter.addEventListener("change", render);

  btnNew.addEventListener("click", () => {
    tickets.unshift({ kind: "idea", label: "New ticket (mock) · make this a mesh input + reward." });
    render();
    toast("SupCast ticket created (mock).", 1400);

    const e = {
      id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
      kind: "farcaster_cast",
      label: "SupCast mirrored → new idea ticket",
      short: "CAST",
      series: "SupCast",
      rarity: "Shard",
      owner: state.activeWallet?.addr || "0x0000…0000",
      tags: ["social", "supcast"],
      score: 210,
      timestamp: Date.now(),
    };
    state.events = clampEvents([e, ...(state.events || [])]);
    renderAll();
  });

  render();
}

/* =========================
   SPAWNBOT
========================= */

function setupBot() {
  const log = $("#bot-log");
  const run = $("#btn-bot-run");
  const save = $("#btn-bot-save");

  const autoOpen = $("#bot-autoOpen");
  const autoClaim = $("#bot-autoClaim");
  const autoGambit = $("#bot-autoGambit");
  const alerts = $("#bot-alerts");

  if (!log || !run || !save) return;

  const sync = () => {
    state.bot.autoOpen = !!autoOpen?.checked;
    state.bot.autoClaim = !!autoClaim?.checked;
    state.bot.autoGambit = !!autoGambit?.checked;
    state.bot.alerts = !!alerts?.checked;
  };

  [autoOpen, autoClaim, autoGambit, alerts].forEach((el) =>
    el?.addEventListener("change", () => {
      sync();
      toast("SpawnBot updated.", 1200);
    })
  );

  run.addEventListener("click", () => {
    if (!state.connected) return toast("Connect wallet first.", 1600);
    sync();
    const lines = runBotOnce();
    log.textContent = lines.join("\n");
    toast("SpawnBot ran once (mock).", 1400);
    renderAll();
  });

  save.addEventListener("click", () => {
    sync();
    log.textContent = `Saved preset:\n${JSON.stringify(state.bot, null, 2)}`;
    toast("Preset saved (local).", 1400);
  });

  sync();
  log.textContent = "SpawnBot ready. Toggle modules, run once, then wire to real triggers later.";
}

function maybeRunBot() {
  if (!state.connected) return;
  if (!state.bot.autoOpen && !state.bot.autoClaim && !state.bot.autoGambit) return;

  // Auto-claim: real daily lock too
  if (state.bot.autoClaim && state.streakDays < 7 && Math.random() < 0.08) {
    const today = new Date().toISOString().slice(0, 10);
    if (state.dailyClaimedISO !== today) {
      state.dailyClaimedISO = today;
      state.streakDays += 1;
      state.xp += 20;
      state.spn += 14;

      const e = {
        id: crypto?.randomUUID?.() || String(Date.now() + Math.random()),
        kind: "reward",
        label: `Auto-claim · streak day ${state.streakDays}`,
        short: "CLM",
        series: "Streak",
        rarity: "Shard",
        owner: state.activeWallet?.addr || "0x0000…0000",
        tags: ["reward", "xp", "streak"],
        score: 160 + state.streakDays * 35,
        timestamp: Date.now(),
      };
      state.events = clampEvents([e, ...(state.events || [])]);
    }
  }

  // Auto-open
  if (state.bot.autoOpen && state.inv.sealed > 0 && Math.random() < 0.1) {
    state.inv.sealed -= 1;
    addPackOpenEvent();
  }

  // Auto-gambit
  if (state.bot.autoGambit && state.inv.Fragment >= 10 && Math.random() < 0.09) {
    state.inv.Fragment -= 10;
    state.inv.Shard += 1;
    writeGambleEvent("burn", "Fragment", "Shard", 240);
  }
}

function runBotOnce() {
  const lines = [];
  lines.push(`[SpawnBot] ${new Date().toLocaleTimeString()} run`);
  lines.push(`- autoOpen: ${state.bot.autoOpen}`);
  lines.push(`- autoClaim: ${state.bot.autoClaim}`);
  lines.push(`- autoGambit: ${state.bot.autoGambit}`);
  lines.push(`- alerts: ${state.bot.alerts}`);

  if (state.bot.autoClaim && state.streakDays < 7) {
    const today = new Date().toISOString().slice(0, 10);
    if (state.dailyClaimedISO !== today) {
      state.dailyClaimedISO = today;
      state.streakDays += 1;
      state.xp += 15;
      lines.push(`→ Claimed streak (mock). streakDays=${state.streakDays}`);
    } else {
      lines.push(`→ Daily already claimed today.`);
    }
  }

  if (state.bot.autoOpen && state.inv.sealed > 0) {
    state.inv.sealed -= 1;
    addPackOpenEvent();
    lines.push(`→ Opened a pack (mock). sealed=${state.inv.sealed}`);
  }

  if (state.bot.autoGambit && state.inv.Fragment >= 10) {
    state.inv.Fragment -= 10;
    state.inv.Shard += 1;
    writeGambleEvent("burn", "Fragment", "Shard", 220);
    lines.push(`→ Burned 10 fragments → +1 shard (mock).`);
  }

  if (!state.bot.autoOpen && !state.bot.autoClaim && !state.bot.autoGambit) {
    lines.push("→ No actions. (All toggles off)");
  }

  return lines;
}

/* =========================
   SETTINGS
========================= */

function setupSettings() {
  $("#set-sync")?.addEventListener("change", (e) => {
    $("#chip-sync").textContent = e.target.value;
    toast("Sync mode updated.", 1200);
  });

  $("#set-theme")?.addEventListener("change", (e) => {
    document.documentElement.setAttribute("data-theme", e.target.value);
    toast("Theme updated.", 1200);
  });

  $("#btn-reset")?.addEventListener("click", () => {
    localReset();
    toast("Local state reset.", 1400);
    renderAll();
  });
}

function localReset() {
  state.xp = 0;
  state.spn = 0;
  state.streakDays = 0;
  state.dailyClaimedISO = null;
  state.inv = { sealed: 2, opened: 0, Fragment: 20, Shard: 2, Core: 0, Artifact: 0, Relic: 0 };
  state.events = (state.events || []).slice(0, 5);
}

/* =========================
   UTILS
========================= */

function toast(msg, ms = 1500) {
  const el = $("#toast");
  if (!el) return;
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.add("hidden"), ms);
}

function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
