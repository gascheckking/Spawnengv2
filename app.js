// SpawnEngine v0.3 — app.js (full file)

// Global state (preview)
const state = {
  wallet: null,
  xp: 1575,
  spn: 497, // SpEngine balance
  meshEvents: 9,
  activeTab: "overview",
  gasLevel: 0.35, // 0–1
  tasks: {
    testPack: false,
    share: false,
  },
  theme: "dark",
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "trading", label: "Trading" },
  { id: "pull-lab", label: "Pull Lab" },
  { id: "pack-maps", label: "Pack Maps" },
  { id: "campaigns", label: "Quests" },
  { id: "leaderboard", label: "Leaders" },
  { id: "stats", label: "Stats" },
  { id: "pnl", label: "PNL" },
  { id: "tasks", label: "Daily" },
  { id: "settings", label: "Settings" },
];

const livePulls = [
  { pack: "Neon Fragments", tier: "shard", band: "Shard", text: "hit in 4 pulls" },
  { pack: "Base Relics", tier: "relic", band: "Relic", text: "after 37 pulls" },
  { pack: "Shard Forge", tier: "relic", band: "Relic", text: "in 1 923 pulls" },
  { pack: "Mesh Trials", tier: "fragment", band: "Fragment", text: "streak x10" },
];

const recentPullsMock = [
  { pack: "Neon Fragments", band: "Shard", amount: 10, odds: "1 / 420" },
  { pack: "Base Relics", band: "Relic", amount: 3, odds: "1 / 1 200" },
  { pack: "Shard Forge", band: "Relic", amount: 1, odds: "1 / 2 000" },
];

// creator + leaderboard mock data
const creators = [
  {
    handle: "@spawniz",
    title: "SpawnEngine core",
    verified: true,
    meshScore: 96,
    activeQuests: 3,
  },
  {
    handle: "@basebuilder",
    title: "Base pack artisan",
    verified: true,
    meshScore: 88,
    activeQuests: 2,
  },
  {
    handle: "@foilwizard",
    title: "Foil realms curator",
    verified: false,
    meshScore: 74,
    activeQuests: 1,
  },
];

const leaderboardRows = [
  { label: "Wallet", value: "0x094c…mesh", pnl: "+1.8 ETH", xp: 2100 },
  { label: "Creator", value: "@spawniz", pnl: "+3.2 ETH", xp: 5400 },
  { label: "Wallet", value: "0x7ae4…b52", pnl: "+0.7 ETH", xp: 900 },
  { label: "Creator", value: "@basebuilder", pnl: "+1.1 ETH", xp: 3100 },
];

function remainingXP() {
  let total = 150;
  if (state.tasks.testPack) total -= 50;
  if (state.tasks.share) total -= 100;
  return total;
}

function init() {
  const root = document.getElementById("app-root");
  if (!root) return;

  root.innerHTML = `
    <div class="app-shell">
      <div class="app-frame">
        <header class="app-header">
          <div class="brand-row">
            <div class="brand-left">
              <button class="menu-btn" id="menu-btn" aria-label="Menu">
                <span></span><span></span><span></span>
              </button>
              <div class="brand-icon">SE</div>
              <div>
                <div class="brand-copy-title">SPAWNENGINE</div>
                <div class="brand-copy-sub">
                  Modular onchain mesh for packs, XP, badges & creator modules
                </div>
              </div>
            </div>
            <div class="brand-right">
              <div class="pill">
                <span class="pill-dot"></span>
                <span class="pill-label">Base · Mesh Layer</span>
              </div>
              <div class="wallet-block">
                <button class="btn-wallet" id="btn-wallet">
                  <span id="wallet-status-icon">⦿</span>
                  <span id="wallet-label">Connect</span>
                </button>
                <div class="wallet-address" id="wallet-address-display">
                  No wallet connected
                </div>
              </div>
            </div>
          </div>

          <div class="mode-tag">
            <span>MODE · v0.3</span><span>SpawnEngine mesh preview</span>
          </div>

          <div class="status-row">
            <div class="status-pill">
              <span class="status-pill-label">Gas</span>
              <span class="status-pill-value" id="status-gas">~0.25 gwei</span>
              <div class="gas-meter">
                <div class="gas-meter-fill" id="gas-meter-fill"></div>
              </div>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">Mesh</span>
              <span class="status-pill-value" id="status-mesh">${state.meshEvents} events</span>
            </div>
          </div>

          <div class="status-row">
            <div class="status-pill">
              <span class="status-pill-label">XP</span>
              <span class="status-pill-value" id="status-xp">${state.xp}</span>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">SpEngine</span>
              <span class="status-pill-value" id="status-spn">${state.spn}</span>
            </div>
          </div>

          <div class="nav-row">
            <div class="nav-tabs" id="nav-tabs"></div>
          </div>
        </header>

        <div class="ticker">
          <span class="ticker-label">Live pulls</span>
          <div class="ticker-stream">
            <div class="ticker-inner" id="ticker-inner"></div>
          </div>
        </div>

        <main class="main-content" id="main-content"></main>

        <footer class="app-footer">
          <span>SpawnEngine · Layer on Base</span>
          <div class="footer-links">
            <a href="https://zora.co/@spawniz" target="_blank" rel="noreferrer">
              Zora
            </a>
            <a href="https://farcaster.xyz/spawniz" target="_blank" rel="noreferrer">
              Farcaster
            </a>
            <a href="https://x.com/spawnizz" target="_blank" rel="noreferrer">
              X/Twitter
            </a>
            <a
              href="https://base.app/profile/0x4A9bBB6FC9602C53aC84D59d8A1C12c89274f7Da"
              target="_blank"
              rel="noreferrer"
            >
              Base
            </a>
          </div>
        </footer>

        <!-- Side menu (vänster) -->
        <div class="side-menu" id="side-menu">
          <div class="side-menu-backdrop" id="side-menu-backdrop"></div>
          <div class="side-menu-panel">
            <div class="side-menu-header">
              <div class="side-menu-avatar">SE</div>
              <div>
                <div class="side-menu-title">@spawnengine</div>
                <div class="side-menu-sub">Mesh layer controls</div>
              </div>
            </div>

            <div class="side-settings-group">
              <div class="side-settings-title">App theme</div>
              <div class="side-theme-row">
                <button class="side-theme-btn active" data-theme="dark">Dark</button>
                <button class="side-theme-btn" data-theme="jurassic">Jurassic</button>
                <button class="side-theme-btn" data-theme="hologram">Hologram</button>
              </div>
              <button class="side-menu-item" data-menu="custom-theme">
                Create your own theme (soon)
              </button>
              <button class="side-menu-item" data-menu="multiwallet">
                Connect more wallets (mock)
              </button>
            </div>

            <ul class="side-menu-list">
              <li>
                <button class="side-menu-item" data-menu="docs">
                  Dev docs – GitHub
                </button>
              </li>
              <li>
                <button class="side-menu-item" data-menu="reset">
                  Reset preview state
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Share modal -->
        <div class="modal" id="share-modal">
          <div class="modal-backdrop" data-close="share"></div>
          <div class="modal-panel">
            <div class="modal-title">Share your mesh</div>
            <div class="modal-sub">
              Pick where to shout your SpawnEngine stats. We’ll copy a snippet for you.
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" data-share-dest="x">
                Post on X (Twitter)
              </button>
              <button class="modal-btn" data-share-dest="farcaster">
                Cast on Farcaster
              </button>
              <button class="modal-btn" data-share-dest="base">
                Share via Base App profile
              </button>
            </div>
            <div class="modal-footer-row">
              <button data-close="share">Close</button>
            </div>
          </div>
        </div>

        <!-- Daily check-in modal -->
        <div class="modal" id="checkin-modal">
          <div class="modal-backdrop" data-close="checkin"></div>
          <div class="modal-panel">
            <div class="modal-title">Daily check-in</div>
            <div class="modal-sub">
              Claim a small bonus to keep the streak warm. You can also stake it for a tiny extra boost.
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" id="checkin-claim">
                Claim +10 XP
              </button>
              <button class="modal-btn" id="checkin-claim-stake">
                Claim +10 XP & stake (+3% boost)
              </button>
            </div>
            <div class="modal-footer-row">
              <button data-close="checkin">Skip</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  applyTheme();
  wireWallet();
  renderTabs();
  renderTicker();
  wireMenu();
  initShareModal();
  initCheckinModal();
  renderActiveView();
  updateGasMeter();
  startGasInterval();
}

/* theme */

function applyTheme() {
  const body = document.body;
  body.classList.remove("theme-dark", "theme-jurassic", "theme-hologram");
  const cls = `theme-${state.theme || "dark"}`;
  body.classList.add(cls);
}

/* wallet */

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
    renderActiveView();
  });

  updateWalletUI();
}

function updateWalletUI() {
  const label = document.getElementById("wallet-label");
  const addr = document.getElementById("wallet-address-display");
  const icon = document.getElementById("wallet-status-icon");
  const btn = document.getElementById("btn-wallet");
  if (!label || !addr || !btn) return;

  if (state.wallet) {
    label.textContent = "Disconnect";
    addr.textContent = state.wallet;
    btn.classList.add("wallet-connected");
    if (icon) icon.textContent = "●";
  } else {
    label.textContent = "Connect";
    addr.textContent = "No wallet connected";
    btn.classList.remove("wallet-connected");
    if (icon) icon.textContent = "⦿";
  }
}

/* tabs */

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

/* ticker */

function renderTicker() {
  const inner = document.getElementById("ticker-inner");
  if (!inner) return;

  const pills = livePulls
    .map((p) => {
      const rarityClass =
        p.tier === "fragment"
          ? "rarity-fragment"
          : p.tier === "shard"
          ? "rarity-shard"
          : "rarity-relic";
      return `
        <span class="ticker-pill">
          <span>${p.pack}</span>
          <span class="${rarityClass}">${p.band} · ${p.text}</span>
        </span>
      `;
    })
    .join("");

  inner.innerHTML = pills + pills;
}

/* side menu */

function wireMenu() {
  const btn = document.getElementById("menu-btn");
  const menu = document.getElementById("side-menu");
  const backdrop = document.getElementById("side-menu-backdrop");
  if (!btn || !menu || !backdrop) return;

  const toggle = (open) => {
    if (open) menu.classList.add("open");
    else menu.classList.remove("open");
  };

  btn.addEventListener("click", () => toggle(true));
  backdrop.addEventListener("click", () => toggle(false));

  menu.querySelectorAll(".side-menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const action = item.dataset.menu;
      if (action === "reset") {
        resetMockState();
      } else if (action === "docs") {
        window.open("https://github.com/gascheckking/SpawnEngine", "_blank");
      } else if (action === "multiwallet") {
        alert("Multi-wallet mesh: later this opens a real manager.");
      } else if (action === "custom-theme") {
        alert("Custom themes are coming later – for now use Dark / Jurassic / Hologram.");
      }
      toggle(false);
    });
  });

  // theme buttons
  menu.querySelectorAll(".side-theme-btn").forEach((btnTheme) => {
    btnTheme.addEventListener("click", () => {
      const theme = btnTheme.dataset.theme;
      state.theme = theme;
      menu
        .querySelectorAll(".side-theme-btn")
        .forEach((b) => b.classList.remove("active"));
      btnTheme.classList.add("active");
      applyTheme();
    });
  });
}

function resetMockState() {
  state.wallet = null;
  state.tasks = { testPack: false, share: false };
  state.meshEvents = 9;
  state.xp = 1575;
  state.spn = 497;
  updateWalletUI();
  renderActiveView();
}

/* share modal */

function initShareModal() {
  const modal = document.getElementById("share-modal");
  if (!modal) return;

  const closeButtons = modal.querySelectorAll("[data-close='share']");
  closeButtons.forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("open")),
  );

  modal.querySelectorAll("[data-share-dest]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.dataset.shareDest;
      const text = `SpawnEngine mesh · XP ${state.xp} · SpEngine ${state.spn} · ${state.meshEvents} events · mode v0.3 preview.`;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }

      state.tasks.share = true;
      renderActiveView();

      if (dest === "x") {
        window.open("https://x.com/compose/tweet", "_blank");
      } else if (dest === "farcaster") {
        window.open("https://warpcast.com/~/compose", "_blank");
      } else if (dest === "base") {
        window.open(
          "https://base.app/profile/0x4A9bBB6FC9602C53aC84D59d8A1C12c89274f7Da",
          "_blank",
        );
      }

      modal.classList.remove("open");
    });
  });
}

function openShareModal() {
  const modal = document.getElementById("share-modal");
  if (modal) modal.classList.add("open");
}

/* check-in modal */

function initCheckinModal() {
  const modal = document.getElementById("checkin-modal");
  const claimBtn = document.getElementById("checkin-claim");
  const claimStakeBtn = document.getElementById("checkin-claim-stake");
  if (!modal || !claimBtn || !claimStakeBtn) return;

  modal.classList.add("open");

  const addCheckinXp = (amount) => {
    state.xp += amount;
    const xpEl = document.getElementById("status-xp");
    if (xpEl) xpEl.textContent = state.xp;
    modal.classList.remove("open");
    renderActiveView();
  };

  claimBtn.addEventListener("click", () => addCheckinXp(10));
  claimStakeBtn.addEventListener("click", () => addCheckinXp(13)); // 10 + ~3% boost

  modal.querySelectorAll("[data-close='checkin']").forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("open")),
  );
}

/* gas meter */

function updateGasMeter() {
  const fill = document.getElementById("gas-meter-fill");
  const label = document.getElementById("status-gas");
  if (!fill || !label) return;

  const level = state.gasLevel; // 0–1
  const width = 20 + level * 60; // 20–80%
  fill.style.width = `${width}%`;

  const gwei = (0.15 + level * 0.25).toFixed(2);
  label.textContent = `~${gwei} gwei`;
}

function startGasInterval() {
  setInterval(() => {
    state.gasLevel = 0.2 + Math.random() * 0.6;
    updateGasMeter();
  }, 8000);
}

/* router */

function renderActiveView() {
  const main = document.getElementById("main-content");
  if (!main) return;

  let html = "";
  switch (state.activeTab) {
    case "profile":
      html = renderProfile();
      break;
    case "overview":
      html = renderOverview();
      break;
    case "trading":
      html = renderTrading();
      break;
    case "pull-lab":
      html = renderPullLab();
      break;
    case "pack-maps":
      html = renderPackMaps();
      break;
    case "campaigns":
      html = renderCampaigns();
      break;
    case "leaderboard":
      html = renderLeaderboard();
      break;
    case "stats":
      html = renderStats();
      break;
    case "pnl":
      html = renderPnl();
      break;
    case "tasks":
      html = renderTasks();
      break;
    case "settings":
      html = renderSettings();
      break;
    default:
      html = "";
  }

  main.innerHTML = html;
  wireTaskButtons();
}

/* PROFILE */

function renderProfile() {
  const handle = "@spawnengine";
  const chain = "Base";
  const modules = ["Factory", "TokenPackSeries", "ReserveGuard", "UtilityRouter"];

  return `
    <section class="panel">
      <div class="panel-title">Mesh profile</div>
      <div class="panel-sub mesh-profile-header">
        One wallet, multiple contract types, all flowing into a single activity mesh.
      </div>

      <div class="trading-card">
        <div class="trading-card-head">
          <div style="display:flex;align-items:center;gap:9px;">
            <div class="brand-icon" style="width:34px;height:34px;font-size:13px;">SE</div>
            <div>
              <div class="trading-card-title">${handle}</div>
              <div class="trading-card-sub">
                Mesh owner on ${chain} · packs, XP, quests & creator modules
              </div>
            </div>
          </div>
          <span class="chip chip-online">ONLINE</span>
        </div>
        <div class="trading-card-foot">
          Connected modules: ${modules.join(" · ")}
        </div>
      </div>

      <div class="overview-grid">
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Grows as you complete daily mesh tasks.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">SpEngine balance</div>
          <div class="metric-value">${state.spn}</div>
          <div class="metric-foot">Rewards from packs & quests (preview).</div>
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
          <div class="trading-row-title">Linked wallet</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Base wallet</div>
                <div class="trading-card-sub" id="profile-wallet-row">
                  ${
                    state.wallet
                      ? state.wallet
                      : "Connect wallet in the header to lock in your mesh identity."
                  }
                </div>
              </div>
              <span class="chip chip-mesh">REQUIRED</span>
            </div>
            <div class="trading-card-foot">
              In v1, XP and SpEngine rewards will be tied to this wallet’s onchain activity.
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
                  Hooks for casts, mints & creator coins streaming into the mesh.
                </div>
              </div>
              <span class="chip chip-planned">COMING</span>
            </div>
            <div class="trading-card-foot">
              Your casts and creator actions become first-class events in the activity layer.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* OVERVIEW */

function renderOverview() {
  const recentHtml = recentPullsMock
    .map(
      (r) => `
      <div class="recent-pull-item">
        <div class="recent-left">
          <div class="recent-pack">${r.pack}</div>
          <div class="recent-meta">${r.band} · ${r.amount} packs</div>
        </div>
        <div class="recent-right">
          <div class="luck-label">Luck ${r.odds}</div>
        </div>
      </div>
    `,
    )
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">Mesh overview</div>
      <div class="panel-sub">
        One engine for TokenSeries, NFTSeries, Zora packs & XP modules – all streaming into the same mesh.
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
          <div class="metric-label">SpEngine balance</div>
          <div class="metric-value">${state.spn}</div>
          <div class="metric-foot">Earned from packs, quests & streaks.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Connected modules</div>
          <div class="metric-value">4</div>
          <div class="metric-foot">Factory · TokenSeries · Guard · UtilityRouter</div>
        </div>
      </div>

      ${renderDailyTasksInner()}

      <div class="recent-pulls">
        <div class="recent-pulls-header">Recent pulls</div>
        ${recentHtml}
      </div>
    </section>
  `;
}

/* TRADING / PULL LAB / MAPS / CAMPAIGNS / LEADERBOARD / STATS / PNL / TASKS / SETTINGS */

function renderTrading() {
  return `
    <section class="panel">
      <div class="panel-title">Trading hub</div>
      <div class="panel-sub">
        Future view: swap packs, fragments, shards, relics & creator tokens in one mesh-driven orderbook.
      </div>

      <div class="trading-panel">
        <div>
          <div class="trading-row-title">Surfaces</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Unified orderbook</div>
                <div class="trading-card-sub">
                  TokenSeries · NFTSeries · Zora packs · mesh-linked liquidity.
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
                  ReserveGuard protected pools with treasury checks.
                </div>
              </div>
              <span class="chip chip-risk">RISK-AWARE</span>
            </div>
            <div class="trading-card-foot">
              Guard enforces “two-relic” safety before any new series can go live.
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
              <span class="chip chip-mesh">MESH</span>
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
        Rarity bands for the SpawnEngine model – only Fragments & Shards will be gambled, Relics stay pure premiums.
      </div>
      <div class="overview-grid" style="margin-top:9px;">
        <div class="metric-card">
          <div class="metric-label">Standard pack</div>
          <div class="metric-value">100 000</div>
          <div class="metric-foot">Base cost per pack.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Fragment</div>
          <div class="metric-value">9 500–10 000</div>
          <div class="metric-foot">≈ 90% loss by design.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Shard</div>
          <div class="metric-value">110 000</div>
          <div class="metric-foot">≈ 1.1× pack.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Core</div>
          <div class="metric-value">300k–400k</div>
          <div class="metric-foot">≈ 3–4× band.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Artifact</div>
          <div class="metric-value">≈ 4M</div>
          <div class="metric-foot">≈ 40× band.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic</div>
          <div class="metric-value">10–20M</div>
          <div class="metric-foot">≈ 100–200×, no gamble.</div>
        </div>
      </div>
    </section>
  `;
}

function renderPackMaps() {
  // bubble-style preview
  const bubbles = [
    { label: "Series #1 · Token packs", size: 72, cls: "bubble-core" },
    { label: "@spawniz · creator node", size: 60, cls: "bubble-creator" },
    { label: "NFTSeries · Artifacts", size: 50, cls: "bubble-artifact" },
    { label: "Zora packs lane", size: 44, cls: "bubble-zora" },
    { label: "XP-only quests", size: 36, cls: "bubble-xp" },
  ];

  const bubblesHtml = bubbles
    .map(
      (b) => `
      <div class="mesh-bubble ${b.cls}" style="--r:${b.size}px;">
        <span>${b.label}</span>
      </div>
    `,
    )
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">Pack maps</div>
      <div class="panel-sub">
        Visual mesh of series, creators & risk-zones across Base – this preview keeps it UI-only.
      </div>
      <div class="mesh-bubble-wrap">
        ${bubblesHtml}
      </div>
      <div class="mesh-note">
        Later: each bubble becomes clickable, wired to real TokenSeries / NFTSeries / Zora-series addresses.
      </div>
    </section>
  `;
}

function renderCampaigns() {
  const creatorsHtml = creators
    .map(
      (c) => `
      <div class="creator-row">
        <div class="creator-main">
          <div class="creator-handle">
            ${c.handle} ${c.verified ? '<span class="creator-badge">VERIFIED</span>' : ""}
          </div>
          <div class="creator-sub">${c.title}</div>
        </div>
        <div class="creator-meta">
          <div class="creator-score">Mesh ${c.meshScore}</div>
          <div class="creator-quests">${c.activeQuests} quests</div>
        </div>
      </div>
    `,
    )
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">Creator quests</div>
      <div class="panel-sub">
        Creator-defined reward lanes – “pull the right thing, get extra packs or SpEngine” with rewards pre-funded in contracts.
      </div>

      <div class="trading-panel">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">SpawnEngine launch lane</div>
              <div class="trading-card-sub">
                Example: pull any Relic from Series #1 → auto-credit 3 extra packs to your wallet.
              </div>
            </div>
            <span class="chip chip-mesh">LIVE PREVIEW</span>
          </div>
          <div class="trading-card-foot">
            Once wired onchain, creators lock rewards once; SpawnEngine handles the payouts automatically.
          </div>
        </div>

        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Try miniapps & lanes</div>
              <div class="trading-card-sub">
                Quests like “try my miniapp”, “mint 3 packs”, or “collect 5 Cores” unlock extra SpEngine or packs.
              </div>
            </div>
            <span class="chip chip-planned">DESIGN SPACE</span>
          </div>
          <div class="trading-card-foot">
            The idea: one quest system that works across Zora, Farcaster miniapps and Base-native contracts.
          </div>
        </div>
      </div>

      <div class="creator-list-block">
        <div class="creator-list-header">Active creators (preview)</div>
        ${creatorsHtml}
      </div>

      <div class="creator-actions-row">
        <button class="task-cta" onclick="openShareModal()">
          Share quest idea on X / Farcaster
        </button>
        <button class="task-cta" onclick="window.open('https://warpcast.com/~/compose','_blank')">
          DM a creator on Farcaster
        </button>
      </div>
    </section>
  `;
}

function renderLeaderboard() {
  const rowsHtml = leaderboardRows
    .map(
      (r) => `
      <div class="leader-row">
        <div class="leader-main">
          <div class="leader-label">${r.label}</div>
          <div class="leader-value">${r.value}</div>
        </div>
        <div class="leader-meta">
          <div class="leader-pnl">${r.pnl}</div>
          <div class="leader-xp">${r.xp} XP</div>
        </div>
      </div>
    `,
    )
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">Leaders</div>
      <div class="panel-sub">
        Snapshot-style leaderboard across wallets & creators – later wired to real mesh data and SpEngine rewards.
      </div>

      <div class="leader-list">
        ${rowsHtml}
      </div>
    </section>
  `;
}

function renderStats() {
  return `
    <section class="panel">
      <div class="panel-title">Stats & luck engine</div>
      <div class="panel-sub">
        Once onchain events are wired, this view becomes the analytics layer for the whole mesh.
      </div>
      <div class="overview-grid" style="margin-top:9px;">
        <div class="metric-card">
          <div class="metric-label">Total packs</div>
          <div class="metric-value">12 543</div>
          <div class="metric-foot">Combined across all series (preview).</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic hit rate</div>
          <div class="metric-value">3.2%</div>
          <div class="metric-foot">Will be computed from real pulls.</div>
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

/* PNL view */

function renderPnl() {
  const pnlSummary = {
    total: "+ 4.21 ETH",
    realized: "+ 2.40 ETH",
    unrealized: "+ 1.81 ETH",
    winRate: "63%",
  };

  const pnlSeries = [+0.8, -0.4, +1.2, +0.3, -0.1, +0.9, +1.5]; // mock ETH per day

  const barsHtml = pnlSeries
    .map((v) => {
      const isNeg = v < 0;
      const mag = Math.min(Math.abs(v) / 1.5, 1); // scale
      const height = Math.max(10, Math.round(mag * 100));
      return `
        <div class="pnl-bar ${isNeg ? "pnl-bar-negative" : ""}">
          <div class="pnl-bar-inner" style="--h:${height}%;"></div>
        </div>
      `;
    })
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">PNL view</div>
      <div class="panel-sub">
        PNL layer for everything the mesh has seen – later wired to real pulls, swaps & Zora buys.
      </div>

      <div class="pnl-summary-grid">
        <div class="metric-card">
          <div class="metric-label">Total mesh PNL</div>
          <div class="metric-value">${pnlSummary.total}</div>
          <div class="metric-foot">All packs, fees & rewards combined.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Realized</div>
          <div class="metric-value">${pnlSummary.realized}</div>
          <div class="metric-foot">Closed positions only.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Unrealized</div>
          <div class="metric-value">${pnlSummary.unrealized}</div>
          <div class="metric-foot">Open packs / relics.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Win rate</div>
          <div class="metric-value">${pnlSummary.winRate}</div>
          <div class="metric-foot">Profitable pulls vs total.</div>
        </div>
      </div>

      <div style="margin-top:10px;font-size:10px;color:#9ca3af;">
        Last 7 mesh days (ETH-denominated):
      </div>
      <div class="pnl-chart">
        ${barsHtml}
      </div>
    </section>
  `;
}

function renderTasks() {
  return `
    <section class="panel">
      <div class="panel-title">Daily mesh tasks</div>
      <div class="panel-sub">
        Same loop as on the overview tab – kept here as a focused view for streak hunters.
      </div>
      ${renderDailyTasksInner()}
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-title">Settings & modules</div>
      <div class="panel-sub">
        Control room for wallets, modules and future integration knobs.
      </div>
      <div class="trading-panel" style="margin-top:9px;">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Wallets</div>
              <div class="trading-card-sub">
                Multi-wallet mesh planned – track PNL per wallet and per pack-series.
              </div>
            </div>
          </div>
          <div class="trading-card-foot">
            Current preview keeps a single wallet toggle in the header.
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

/* daily tasks shared block */

function renderDailyTasksInner() {
  const remaining = remainingXP();
  const t = state.tasks;

  return `
    <div class="task-list">
      <div class="task-header">
        <span>Today’s loop</span>
        <span style="color:#22c55e;">+${remaining} XP available</span>
      </div>
      <div class="task-items">
        <div class="task-item">
          <div class="task-left">
            <div class="task-dot ${t.testPack ? "done" : ""}"></div>
            <div>
              <div class="task-label-main">Open a test pack</div>
              <div class="task-label-sub">Trigger one mock pack_open event</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="task-xp">+50 XP</div>
            <button
              class="task-cta ${t.testPack ? "done" : ""}"
              data-task="test-pack"
            >
              ${t.testPack ? "Done" : "Simulate"}
            </button>
          </div>
        </div>
        <div class="task-item">
          <div class="task-left">
            <div class="task-dot ${t.share ? "done" : ""}"></div>
            <div>
              <div class="task-label-main">Share your mesh</div>
              <div class="task-label-sub">Post a cast / X post with your stats</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="task-xp">+100 XP</div>
            <button
              class="task-cta ${t.share ? "done" : ""}"
              data-task="share"
            >
              ${t.share ? "Copied" : "Copy & share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* task buttons */

function wireTaskButtons() {
  const buttons = document.querySelectorAll(".task-cta");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    const task = btn.dataset.task;
    btn.addEventListener("click", () => {
      if (task === "test-pack") {
        if (!state.tasks.testPack) {
          state.tasks.testPack = true;
          state.meshEvents += 1;
          const meshEl = document.getElementById("status-mesh");
          if (meshEl) meshEl.textContent = `${state.meshEvents} events`;
        }
      } else if (task === "share") {
        openShareModal();
        return;
      }
      renderActiveView();
    });
  });
}

init();