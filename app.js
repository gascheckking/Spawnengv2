// app.js
import { getUnifiedActivity, computeStatsFromEvents } from "./services/activity.js";
import { getZoraActivityMock } from "./integrations/zora.js";
import { postCastMock } from "./integrations/farcaster.js";

const NETWORK_INFO = {
  name: "Base Sepolia",
  label: "Base · Pack ecosystems",
};

const state = {
  wallet: null,
  connected: false,
  theme: "dark",
  events: [],
  stats: null,
  zora: null,
  profile: {
    streakDays: 3,
    xp: 1250,
    level: 4,
    bestHit: "Relic (ZoraPack)",
  },
};

const TABS = [
  "trading",
  "my-packs",
  "creator-forge",
  "pull-lab",
  "pack-maps",
  "warp-verified",
  "bubbles",
  "stats-engine",
  "deploy-center",
  "profile",
  "settings",
];

function humanTabName(id) {
  return id
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* INIT */

async function init() {
  const root = document.getElementById("app");
  if (!root) return;

  root.innerHTML = `
    <header class="app-header">
      <div class="brand">
        <div class="brand-title">SpawnEngine</div>
        <div class="brand-sub">Onchain Pack Factory · Pack Mesh Protocol</div>
      </div>
      <div class="header-right">
        <div class="network-pill" id="network-pill">${NETWORK_INFO.label}</div>
        <button id="wallet-btn" class="btn">Connect Wallet</button>
      </div>
    </header>

    <nav class="tab-bar" id="tab-bar"></nav>

    <div class="status-strip">
      <div class="status-left">
        <span><span id="wallet-dot" class="status-dot"></span><span id="wallet-status">Wallet: Disconnected</span></span>
        <span>Theme: Dark</span>
      </div>
      <div class="status-right">
        <span>Gas: 0.26 gwei</span>
        <span>Mesh: Live</span>
      </div>
    </div>

    <div class="ticker">
      <div class="ticker-inner" id="ticker-inner"></div>
    </div>

    <main class="app-main">
      <h2 class="view-title" id="view-title"></h2>
      <div id="view-body"></div>
    </main>

    <footer class="app-footer">
      SpawnEngine · Base · Zora · Farcaster · Unified Activity Mesh
    </footer>
  `;

  setupTabs();
  setupWallet();

  // Ladda Unified Activity Mesh
  state.events = await getUnifiedActivity();
  state.stats = computeStatsFromEvents(state.events);
  state.zora = await getZoraActivityMock("0xYourWalletHere");

  renderTicker();
  switchView("trading");
}

/* TABS */

function setupTabs() {
  const bar = document.getElementById("tab-bar");
  bar.innerHTML = "";

  TABS.forEach((id) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn";
    btn.dataset.tab = id;
    btn.textContent = humanTabName(id);
    btn.addEventListener("click", () => switchView(id));
    bar.appendChild(btn);
  });

  const first = bar.querySelector(".tab-btn");
  if (first) first.classList.add("active");
}

function setActiveTab(id) {
  document.querySelectorAll(".tab-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === id);
  });
}

/* WALLET MOCK */

function setupWallet() {
  const btn = document.getElementById("wallet-btn");
  const status = document.getElementById("wallet-status");
  const dot = document.getElementById("wallet-dot");

  btn.addEventListener("click", () => {
    state.connected = !state.connected;
    state.wallet = state.connected
      ? "0x" + Math.random().toString(16).slice(2, 8) + "...mesh"
      : null;

    btn.textContent = state.connected ? "Disconnect" : "Connect Wallet";
    status.textContent = state.connected
      ? `Wallet: ${state.wallet}`
      : "Wallet: Disconnected";
    dot.classList.toggle("on", state.connected);
  });
}

/* TICKER */

function renderTicker() {
  const el = document.getElementById("ticker-inner");
  const line = state.events
    .map((e) => `${e.short} · ${e.rarity} · ${e.owner}`)
    .join("   •   ");
  el.textContent = line;
}

/* VIEW SWITCH */

function switchView(id) {
  setActiveTab(id);
  const title = document.getElementById("view-title");
  const body = document.getElementById("view-body");

  title.textContent = humanTabName(id);

  const map = {
    "trading": viewTrading,
    "my-packs": viewMyPacks,
    "creator-forge": viewCreatorForge,
    "pull-lab": viewPullLab,
    "pack-maps": viewPackMaps,
    "warp-verified": viewWarpVerified,
    "bubbles": viewBubbles,
    "stats-engine": viewStatsEngine,
    "deploy-center": viewDeployCenter,
    "profile": viewProfile,
    "settings": viewSettings,
  };

  const renderer = map[id] || (() => "<p>Not implemented yet.</p>");
  body.innerHTML = renderer();

  if (id === "pack-maps") {
    drawPackMap();
  }
}

/* VIEWS */

function viewTrading() {
  const events = state.events;

  const rows = events
    .map(
      (e) => `
      <div class="card">
        <h3>${e.label}</h3>
        <p>Kind: ${e.kind}</p>
        <p>Series: ${e.series}</p>
        <p>Rarity: ${e.rarity}</p>
        <p>Owner: ${e.owner}</p>
      </div>
    `
    )
    .join("");

  return `
    <div class="card-grid">
      ${rows}
    </div>
  `;
}

function viewMyPacks() {
  const packs = state.events.filter((e) => e.kind === "pack_open");

  if (!packs.length) {
    return `<p>Inga packs öppnade ännu.</p>`;
  }

  const rows = packs
    .map(
      (e) => `
      <div class="card">
        <h3>${e.label}</h3>
        <p>Series: ${e.series}</p>
        <p>Rarity: ${e.rarity}</p>
        <p>Score: ${e.score}</p>
      </div>
    `
    )
    .join("");

  return `<div class="card-grid">${rows}</div>`;
}

function viewCreatorForge() {
  return `
    <div class="card-grid">
      <div class="card">
        <h3>Forge New Pack Series</h3>
        <p>Gå från bild → rarity → foil → deploy.</p>
        <p>Framtiden: koppla direkt till PackFactory-kontraktet.</p>
        <button class="btn">Start Forge Flow</button>
      </div>
      <div class="card">
        <h3>Manage Existing Series</h3>
        <p>Visa och konfigurera redan deployade serier.</p>
        <button class="btn">Open Series Panel</button>
      </div>
    </div>
  `;
}

function viewPullLab() {
  return `
    <div class="card-grid">
      <div class="card">
        <h3>Fragment Gamble</h3>
        <p>Burn 10x Fragments → chans på Shard/Core.</p>
        <button class="btn">Simulate Burn</button>
      </div>
      <div class="card">
        <h3>Shard Gamble</h3>
        <p>Burn 3x Shards → chans på Artifact/Relic.</p>
        <button class="btn">Simulate Burn</button>
      </div>
      <div class="card">
        <h3>Zora Packs</h3>
        <p>Köp ZoraPack → få rarity multipliers baserat på Zora value.</p>
        <button class="btn">Open Zora Pack</button>
      </div>
    </div>
  `;
}

function viewPackMaps() {
  return `
    <div class="packmap-wrap">
      <canvas id="packmap-canvas" class="packmap-canvas"></canvas>
    </div>
  `;
}

function drawPackMap() {
  const canvas = document.getElementById("packmap-canvas");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = Math.random() * 4 + 2;

    const rarityColors = ["#4b5563", "#60a5fa", "#a855f7", "#facc15", "#f97316"];
    ctx.fillStyle =
      rarityColors[Math.floor(Math.random() * rarityColors.length)];

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function viewWarpVerified() {
  const verified = state.events.filter((e) =>
    e.tags.includes("mythic_hit")
  );

  if (!verified.length) {
    return `<p>Inga Warp Verified mythic hits ännu.</p>`;
  }

  const rows = verified
    .map(
      (e) => `
      <div class="card">
        <h3>${e.label}</h3>
        <p>Owner: ${e.owner}</p>
        <p>Score: ${e.score}</p>
      </div>
    `
    )
    .join("");

  return `<div class="card-grid">${rows}</div>`;
}

function viewBubbles() {
  return `
    <div class="card-grid">
      <div class="card">
        <h3>Trending Tags</h3>
        <p>#GenesisPacks · #ZoraPack · #RelicHit</p>
      </div>
      <div class="card">
        <h3>Social Cast</h3>
        <p>Posta ett mock-cast till Farcaster (framtida Neynar-integration).</p>
        <button class="btn" id="cast-btn">Post Mock Cast</button>
      </div>
    </div>
  `;
}

function viewStatsEngine() {
  const s = state.stats;
  if (!s) return `<p>Stats loading...</p>`;

  return `
    <div class="metric-grid">
      <div class="metric">
        <div class="value">${s.totalPacks}</div>
        <div class="label">Total Packs Opened</div>
      </div>
      <div class="metric">
        <div class="value">${s.cores}</div>
        <div class="label">Core Hits</div>
      </div>
      <div class="metric">
        <div class="value">${s.artifacts}</div>
        <div class="label">Artifacts</div>
      </div>
      <div class="metric">
        <div class="value">${s.relics}</div>
        <div class="label">Relics</div>
      </div>
      <div class="metric">
        <div class="value">${s.holderCount}</div>
        <div class="label">Unique Holders</div>
      </div>
    </div>
  `;
}

function viewDeployCenter() {
  return `
    <div class="card-grid">
      <div class="card">
        <h3>Deploy Guard + Factory</h3>
        <p>Deployar ReserveGuard + PackFactory på Base.</p>
        <p>(När du kopplar på Hardhat/kontrakt och RPC.)</p>
        <button class="btn">Deploy Base Skeleton</button>
      </div>
      <div class="card">
        <h3>Deploy TokenPackSeries</h3>
        <p>Starta en ny serie med din rarity-tabell.</p>
        <button class="btn">Launch Series</button>
      </div>
      <div class="card">
        <h3>Creator Registry</h3>
        <p>Framtida modul för Warp Verified kreatörer.</p>
        <button class="btn">Open Registry</button>
      </div>
    </div>
  `;
}

function viewProfile() {
  const p = state.profile;
  const walletText = state.wallet || "0x….not-connected";

  return `
    <div class="profile-header">
      <div><strong>Spawn Profile</strong></div>
      <div class="profile-wallet">${walletText}</div>
      <div class="badge-row">
        <span class="badge">Streak: ${p.streakDays} days</span>
        <span class="badge">XP: ${p.xp}</span>
        <span class="badge">Level ${p.level}</span>
        <span class="badge">Best hit: ${p.bestHit}</span>
      </div>
    </div>

    <div class="metric-grid">
      <div class="metric">
        <div class="value">+25</div>
        <div class="label">Daily XP Ready</div>
      </div>
      <div class="metric">
        <div class="value">3</div>
        <div class="label">Quests Today</div>
      </div>
    </div>
  `;
}

function viewSettings() {
  return `
    <div class="card-grid">
      <div class="card">
        <h3>Theme</h3>
        <p>Dark mode aktiverad. (Light disabled – protokoll gillar mörker.)</p>
        <button class="btn">Toggle Theme (mock)</button>
      </div>
      <div class="card">
        <h3>Network</h3>
        <p>Aktiv kedja: ${NETWORK_INFO.name}</p>
      </div>
    </div>
  `;
}

/* EXTRA: KOPPLA KNAPPAR I BUBBLES EFTER RENDER */

document.addEventListener("click", async (e) => {
  if (e.target && e.target.id === "cast-btn") {
    await postCastMock("Just pulled a Core via SpawnEngine Mesh!", "https://spawn-engine.vercel.app");
    alert("Mock-cast skickad (loggas i console).");
  }
});

/* START */

init();