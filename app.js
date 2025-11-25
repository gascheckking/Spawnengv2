// Simple mock state
const state = {
  wallet: null,
  xp: 1575,
  spawn: 497,
  meshEvents: 9,
  activeTab: "profile",
};

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "overview", label: "Overview" },
  { id: "trading", label: "Trading" },
  { id: "pull-lab", label: "Pull Lab" },
  { id: "pack-maps", label: "Pack Maps" },
  { id: "stats", label: "Stats" },
  { id: "tasks", label: "Daily" },
  { id: "settings", label: "Settings" },
];

const mockEvents = [
  { short: "pack_open", label: "0xA9…93 → Neon Fragments (Fragment)" },
  { short: "burn", label: "0x4B…1f → 5x Fragments → Core" },
  { short: "swap", label: "0xD2…90 → Shard Forge (Legendary)" },
  { short: "zora_buy", label: "0x91…ff → Base Relics (Epic)" },
  { short: "fc_cast", label: "@spawnengine casted new pack series" },
];

function init() {
  const root = document.getElementById("app-root");
  if (!root) return;

  root.innerHTML = `
    <div class="app-shell">
      <div class="app-frame">
        <header class="app-header">
          <div class="brand-row">
            <div class="brand-left">
              <div class="brand-icon">SE</div>
              <div>
                <div class="brand-copy-title">SPAWNENGINE</div>
                <div class="brand-copy-sub">
                  Modular onchain engine for packs, XP, badges & creator modules
                </div>
              </div>
            </div>
            <div class="brand-right">
              <div class="pill">
                <span class="pill-dot"></span>
                <span class="pill-label">Base · Mesh Layer</span>
              </div>
              <button class="btn-wallet" id="btn-wallet">
                <span>⦿</span><span id="wallet-label">Connect</span>
              </button>
            </div>
          </div>

          <div class="status-row">
            <div class="status-pill">
              <span class="status-pill-label">Wallet</span>
              <span class="status-pill-value" id="status-wallet">Disconnected</span>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">Gas</span>
              <span class="status-pill-value">~0.25 gwei est.</span>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">Mesh</span>
              <span class="status-pill-value" id="status-mesh">${state.meshEvents} events</span>
            </div>
          </div>

          <div class="status-row" style="margin-top:6px;">
            <div class="status-pill">
              <span class="status-pill-label">XP</span>
              <span class="status-pill-value" id="status-xp">${state.xp}</span>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">Spawn</span>
              <span class="status-pill-value" id="status-spawn">${state.spawn}</span>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">Mode</span>
              <span class="status-pill-value">v0.2 · mock data</span>
            </div>
          </div>

          <div class="nav-row">
            <div class="nav-tabs" id="nav-tabs"></div>
          </div>
        </header>

        <div class="ticker">
          <span class="ticker-label">Live pulls</span>
          <span class="ticker-stream" id="ticker-stream"></span>
        </div>

        <main class="main-content" id="main-content"></main>

        <footer class="app-footer">
          <span>SpawnEngine · Layer on Base</span>
          <div class="footer-links">
            <a href="https://warpcast.com/spawnengine" target="_blank" rel="noreferrer">
              Warpcast
            </a>
            <a href="https://farcaster.xyz/spawniz" target="_blank" rel="noreferrer">
              Farcaster
            </a>
            <a href="https://x.com/spawnizz" target="_blank" rel="noreferrer">
              X
            </a>
          </div>
        </footer>
      </div>
    </div>
  `;

  wireWallet();
  renderTabs();
  renderTicker();
  renderActiveView();
}

// wallet mock

function wireWallet() {
  const btn = document.getElementById("btn-wallet");
  if (!btn) return;
  btn.addEventListener("click", () => {
    if (!state.wallet) {
      const rand = Math.random().toString(16).slice(2, 8);
      state.wallet = `0x094c…${rand}`;
    } else {
      state.wallet = null;
    }
    updateWalletUI();
  });
  updateWalletUI();
}

function updateWalletUI() {
  const label = document.getElementById("wallet-label");
  const statusWallet = document.getElementById("status-wallet");
  if (!label || !statusWallet) return;

  if (state.wallet) {
    label.textContent = state.wallet.slice(0, 6) + "…";
    statusWallet.textContent = state.wallet;
  } else {
    label.textContent = "Connect";
    statusWallet.textContent = "Disconnected";
  }
}

// tabs

function renderTabs() {
  const nav = document.getElementById("nav-tabs");
  if (!nav) return;
  nav.innerHTML = "";

  TABS.forEach((tab) => {
    const btn = document.createElement("button");
    btn.className = "nav-tab" + (state.activeTab === tab.id ? " active" : "");
    btn.dataset.tab = tab.id;
    btn.innerHTML = `<span class="nav-dot"></span><span>${tab.label}</span>`;
    btn.addEventListener("click", () => {
      state.activeTab = tab.id;
      document
        .querySelectorAll(".nav-tab")
        .forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
      renderActiveView();
    });
    nav.appendChild(btn);
  });
}

// ticker

function renderTicker() {
  const el = document.getElementById("ticker-stream");
  if (!el) return;
  const text = mockEvents
    .map((e) => `${e.short} · ${e.label}`)
    .join("   •   ");
  el.textContent = ` ${text}   •   ${text}   •   ${text}`;
}

// views

function renderActiveView() {
  const main = document.getElementById("main-content");
  if (!main) return;

  switch (state.activeTab) {
    case "profile":
      main.innerHTML = renderProfile();
      break;
    case "overview":
      main.innerHTML = renderOverview();
      break;
    case "trading":
      main.innerHTML = renderTrading();
      break;
    case "pull-lab":
      main.innerHTML = renderPullLab();
      break;
    case "pack-maps":
      main.innerHTML = renderPackMaps();
      break;
    case "stats":
      main.innerHTML = renderStats();
      break;
    case "tasks":
      main.innerHTML = renderTasks();
      break;
    case "settings":
      main.innerHTML = renderSettings();
      break;
    default:
      main.innerHTML = "";
  }
}

/* PROFILE VIEW */

function renderProfile() {
  const handle = "@spawnengine";
  const chain = "Base";
  const modules = ["Factory", "TokenPackSeries", "ReserveGuard", "UtilityRouter"];

  return `
    <section class="panel">
      <div class="panel-title">Mesh profile</div>
      <div class="panel-sub">
        One wallet, multiple contract types, all flowing into a single activity mesh.
      </div>

      <div class="trading-card" style="margin-top:9px;">
        <div class="trading-card-head">
          <div style="display:flex;align-items:center;gap:9px;">
            <div class="brand-icon" style="width:36px;height:36px;font-size:14px;">SE</div>
            <div>
              <div class="trading-card-title">${handle}</div>
              <div class="trading-card-sub">
                Mesh owner on ${chain} · Layer-4 style XP & packs
              </div>
            </div>
          </div>
          <span class="chip chip-mesh">ONLINE</span>
        </div>
        <div class="trading-card-foot">
          Connected modules: ${modules.join(" · ")} (mock v0.2)
        </div>
      </div>

      <div class="overview-grid">
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Grows as you complete daily mesh tasks.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn balance</div>
          <div class="metric-value">${state.spawn}</div>
          <div class="metric-foot">Test rewards from packs & quests (mock).</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Today’s events</div>
          <div class="metric-value">${state.meshEvents}</div>
          <div class="metric-foot">pack_open · burns · swaps · casts.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Connected surfaces</div>
          <div class="metric-value">3</div>
          <div class="metric-foot">Token packs · NFT packs · Zora packs (planned).</div>
        </div>
      </div>

      <div class="trading-panel">
        <div>
          <div class="trading-row-title">Linked apps</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Base wallet</div>
                <div class="trading-card-sub" id="profile-wallet-row">
                  ${state.wallet ? state.wallet : "Connect wallet to lock in your mesh identity."}
                </div>
              </div>
              <span class="chip chip-mesh">REQUIRED</span>
            </div>
            <div class="trading-card-foot">
              In v1, XP and Spawn rewards will be tied to this wallet’s onchain activity.
            </div>
          </div>
        </div>

        <div>
          <div class="trading-row-title">Social surfaces</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Farcaster & Zora</div>
                <div class="trading-card-sub">
                  Future hooks: casts, mints & creator coins streamed into the mesh.
                </div>
              </div>
              <span class="chip chip-planned">PLANNED</span>
            </div>
            <div class="trading-card-foot">
              Your casts and creator actions will become first-class events in the activity layer.
            </div>
          </div>
        </div>
      </div>

      ${renderDailyTasksInner()}
    </section>
  `;
}

function renderOverview() {
  return `
    <section class="panel">
      <div class="panel-title">Mesh overview</div>
      <div class="panel-sub">
        One engine for TokenSeries, NFTSeries, Zora packs & XP modules –
        all streaming into the same onchain mesh.
      </div>

      <div class="overview-grid">
        <div class="metric-card">
          <div class="metric-label">Today’s mesh events</div>
          <div class="metric-value">${state.meshEvents}</div>
          <div class="metric-foot">pack_open · burn · swap · zora_buy · casts</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Keep claiming daily tasks to extend the streak.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn balance</div>
          <div class="metric-value">${state.spawn}</div>
          <div class="metric-foot">Mock Spawn tokens from packs & quests.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Connected modules</div>
          <div class="metric-value">4</div>
          <div class="metric-foot">Factory · TokenSeries · Guard · UtilityRouter</div>
        </div>
      </div>

      ${renderDailyTasksInner()}
    </section>
  `;
}

function renderTrading() {
  return `
    <section class="panel">
      <div class="panel-title">Trading hub</div>
      <div class="panel-sub">
        Future view: swap packs, fragments, cores & creator tokens in one mesh-driven orderbook.
      </div>

      <div class="trading-panel">
        <div>
          <div class="trading-row-title">Surfaces</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Unified orderbook</div>
                <div class="trading-card-sub">
                  TokenSeries · NFTSeries · Zora packs · Mesh-linked liquidity.
                </div>
              </div>
              <span class="chip chip-planned">PLANNED</span>
            </div>
            <div class="trading-card-foot">
              Factory deploys multiple series – all stream into one trading surface.
            </div>
          </div>
        </div>

        <div>
          <div class="trading-row-title">Risk aware lanes</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Fragment & shard markets</div>
                <div class="trading-card-sub">
                  ReserveGuard protected pools with anti-rug & treasury checks.
                </div>
              </div>
              <span class="chip chip-risk">RISK-AWARE</span>
            </div>
            <div class="trading-card-foot">
              Guard enforces “two-mythic” safety before any new series can go live.
            </div>
          </div>
        </div>

        <div>
          <div class="trading-row-title">Mesh mode</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Mesh-driven routing</div>
                <div class="trading-card-sub">
                  Orders, pulls & burns all show up in the unified activity layer.
                </div>
              </div>
              <span class="chip chip-mesh">MESH-DRIVEN</span>
            </div>
            <div class="trading-card-foot">
              One mesh instead of 10 separate dapps.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPullLab() {
  return `
    <section class="panel">
      <div class="panel-title">Pull lab</div>
      <div class="panel-sub">
        Simulated pulls per rarity layer – in v1 only Fragments & Shards will be gambled.
      </div>
      <div class="overview-grid" style="margin-top:9px;">
        <div class="metric-card">
          <div class="metric-label">Standard pack</div>
          <div class="metric-value">100 000</div>
          <div class="metric-foot">Base cost per pack (mock).</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Fragment EV</div>
          <div class="metric-value">9 500–10 000</div>
          <div class="metric-foot">≈ 90% loss by design.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic band</div>
          <div class="metric-value">100–200×</div>
          <div class="metric-foot">High-end pulls (no gamble).</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn kickback</div>
          <div class="metric-value">5–10%</div>
          <div class="metric-foot">XP/Spawn returned per pack open.</div>
        </div>
      </div>
      ${renderDailyTasksInner()}
    </section>
  `;
}

function renderPackMaps() {
  return `
    <section class="panel">
      <div class="panel-title">Pack maps</div>
      <div class="panel-sub">
        Future: visual mesh of series, creators & risk-zones across Base.
      </div>
      <div class="trading-card" style="margin-top:9px;">
        <div class="trading-card-head">
          <div>
            <div class="trading-card-title">Mesh nodes</div>
            <div class="trading-card-sub">
              Each deployed series becomes a node: TokenSeries, NFTSeries, Zora packs, XP modules.
            </div>
          </div>
          <span class="chip chip-planned">MAP VIEW</span>
        </div>
        <div class="trading-card-foot">
          This version keeps it UI-only – later we wire real onchain topology.
        </div>
      </div>
    </section>
  `;
}

function renderStats() {
  return `
    <section class="panel">
      <div class="panel-title">Stats & luck engine</div>
      <div class="panel-sub">
        v0.2 shows the placeholders – v1 will plug real data from TokenPackSeries events.
      </div>
      <div class="overview-grid" style="margin-top:9px;">
        <div class="metric-card">
          <div class="metric-label">Total packs (mock)</div>
          <div class="metric-value">12 543</div>
          <div class="metric-foot">Combined across all series.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic rate</div>
          <div class="metric-value">3.2%</div>
          <div class="metric-foot">Will be computed from real payouts.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Unique holders</div>
          <div class="metric-value">987</div>
          <div class="metric-foot">Based on wallet mesh activity.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Mesh score</div>
          <div class="metric-value">1.5M</div>
          <div class="metric-foot">Weighted sum of pulls, burns, swaps & quests.</div>
        </div>
      </div>
    </section>
  `;
}

function renderTasks() {
  return `
    <section class="panel">
      <div class="panel-title">Daily mesh tasks</div>
      <div class="panel-sub">
        Simple layer-4 style tasks – later wired to real XP & Spawn minting.
      </div>
      ${renderDailyTasksInner()}
    </section>
  `;
}

function renderDailyTasksInner() {
  return `
    <div class="task-list">
      <div class="task-header">
        <span>Today’s loop</span>
        <span style="color:#22c55e;">+250 XP available</span>
      </div>
      <div class="task-items">
        <div class="task-item">
          <div class="task-left">
            <div class="task-dot"></div>
            <div>
              <div class="task-label-main">Open a test pack</div>
              <div class="task-label-sub">Trigger one mock pack_open event</div>
            </div>
          </div>
          <div class="task-xp">+50 XP</div>
        </div>
        <div class="task-item">
          <div class="task-left">
            <div class="task-dot done"></div>
            <div>
              <div class="task-label-main">Connect wallet</div>
              <div class="task-label-sub">Any Base wallet counts</div>
            </div>
          </div>
          <div class="task-xp">+100 XP</div>
        </div>
        <div class="task-item">
          <div class="task-left">
            <div class="task-dot"></div>
            <div>
              <div class="task-label-main">Share your mesh</div>
              <div class="task-label-sub">Post a cast with your stats</div>
            </div>
          </div>
          <div class="task-xp">+100 XP</div>
        </div>
      </div>
    </div>
  `;
}

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-title">Settings & modules</div>
      <div class="panel-sub">
        Later this becomes the control room for connected wallets, creator modules and Zora/Farcaster hooks.
      </div>
      <div class="trading-panel" style="margin-top:9px;">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Wallets</div>
              <div class="trading-card-sub">
                Multi-wallet mesh planned – award XP per connected wallet.
              </div>
            </div>
          </div>
          <div class="trading-card-foot">
            v0.2 keeps a single wallet mock; we will expand this once onchain reads are live.
          </div>
        </div>
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Creator modules</div>
              <div class="trading-card-sub">
                Factory, TokenPackSeries, ReserveGuard, UtilityRouter & future NFT/Zora modules.
              </div>
            </div>
          </div>
          <div class="trading-card-foot">
            This app is the mesh layer UI – contracts stay modular under the hood.
          </div>
        </div>
      </div>
    </section>
  `;
}

init();