const state = {
  wallet: null,
  wallets: [],
  xp: 1575,
  spawn: 497,
  meshEvents: 9,
  activeTab: "overview",
  gasLevel: 0.35,
  tasks: {
    checkin: false,
    testPack: false,
    share: false,
  },
  theme: "dark",
};

const TABS = [
  { id: "overview", label: "Home" },
  { id: "profile", label: "Profile" },
  { id: "trading", label: "Trading" },
  { id: "pull-lab", label: "Pull Lab" },
  { id: "quests", label: "Creator Quests" },
  { id: "stats", label: "Stats" },
  { id: "pnl", label: "PNL" },
  { id: "settings", label: "Settings" },
];

const livePulls = [
  { pack: "Neon Fragments", tier: "shard", band: "Band II", text: "hit in 4 pulls" },
  { pack: "Base Relics", tier: "relic", band: "Relic", text: "after 37 pulls" },
  { pack: "Mesh Trials", tier: "fragment", band: "Band I", text: "streak x10" },
  { pack: "Shard Forge", tier: "relic", band: "Relic", text: "in 1 923 pulls" },
];

const recentPullsMock = [
  { pack: "Neon Fragments", band: "Band I", amount: 10, odds: "1 / 420" },
  { pack: "Base Relics", band: "Relic", amount: 3, odds: "1 / 1 200" },
  { pack: "Shard Forge", band: "Relic", amount: 1, odds: "1 / 2 000" },
];

/* helpers */

function remainingXP() {
  let total = 200;
  if (state.tasks.checkin) total -= 40;
  if (state.tasks.testPack) total -= 60;
  if (state.tasks.share) total -= 100;
  if (total < 0) total = 0;
  return total;
}

function shortAddress(addr) {
  if (!addr) return "No wallet connected";
  if (addr.length <= 10) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/* INIT */

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
                  Modular mesh for packs, XP, bounties & creator lanes
                </div>
              </div>
            </div>
            <div class="brand-right">
              <div class="network-pill">
                <span class="network-pill-dot"></span>
                <span>Base · Mesh Layer</span>
              </div>
              <button class="btn-wallet" id="btn-wallet">
                <span id="wallet-status-icon">⦿</span>
                <span id="wallet-label">Connect</span>
              </button>
            </div>
          </div>

          <div class="mode-row">
            <span>Mode · v0.2</span>
            <span>Mesh preview · Single player</span>
          </div>

          <div class="wallet-strip">
            <div class="wallet-strip-left">
              <span class="wallet-strip-label">Connected wallet</span>
              <span class="wallet-strip-address" id="wallet-address-display">
                No wallet connected
              </span>
            </div>
            <div class="wallet-strip-right">
              <span class="wallet-strip-status-icon" id="wallet-strip-status">⦿</span>
              <button class="wallet-strip-manage" id="wallet-manage-btn">
                Wallet mesh
              </button>
            </div>
          </div>

          <div class="status-grid">
            <div class="status-card">
              <div class="status-label">Gas</div>
              <div class="status-value-row">
                <span class="status-value" id="status-gas">~0.25 gwei est.</span>
                <span class="status-sub">Live estimate</span>
              </div>
              <div class="gas-meter">
                <div class="gas-meter-fill" id="gas-meter-fill"></div>
              </div>
            </div>
            <div class="status-card">
              <div class="status-label">Mesh</div>
              <div class="status-value-row">
                <span class="status-value" id="status-mesh">${state.meshEvents} events</span>
                <span class="status-sub">Today</span>
              </div>
            </div>
          </div>

          <div class="status-grid">
            <div class="status-card">
              <div class="status-label">XP</div>
              <div class="status-value-row">
                <span class="status-value" id="status-xp">${state.xp}</span>
                <span class="status-sub">Streak</span>
              </div>
            </div>
            <div class="status-card">
              <div class="status-label">Spawn</div>
              <div class="status-value-row">
                <span class="status-value" id="status-spawn">${state.spawn} SPN</span>
                <span class="status-sub">Mesh token</span>
              </div>
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
            <a href="https://zora.co/@spawniz" target="_blank" rel="noreferrer">Zora</a>
            <a href="https://warpcast.com/spawniz" target="_blank" rel="noreferrer">Farcaster</a>
            <a href="https://x.com/spawnizz" target="_blank" rel="noreferrer">X</a>
          </div>
        </footer>

        <!-- Side menu -->
        <div class="side-menu" id="side-menu">
          <div class="side-menu-backdrop" id="side-menu-backdrop"></div>
          <div class="side-menu-panel">
            <div class="side-menu-header">
              <div class="side-menu-avatar">SE</div>
              <div>
                <div class="side-menu-title">@spawnengine</div>
                <div class="side-menu-sub">Mesh controls · Preview v0.2</div>
              </div>
            </div>

            <div class="side-settings-group">
              <div class="side-settings-title">Theme</div>
              <div class="side-theme-row">
                <button class="side-theme-btn active" data-theme="dark">Dark</button>
                <button class="side-theme-btn" data-theme="jurassic">Jurassic</button>
                <button class="side-theme-btn" data-theme="hologram">Hologram</button>
              </div>
              <button class="side-menu-item" data-menu="custom-theme">
                Create your own layout presets (soon)
              </button>
              <button class="side-menu-item" data-menu="multiwallet">
                Connect more wallets
              </button>
            </div>

            <ul class="side-menu-list">
              <li>
                <button class="side-menu-item" data-menu="docs">
                  Open SpawnEngine repo
                </button>
              </li>
              <li>
                <button class="side-menu-item" data-menu="reset">
                  Reset local mesh state
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
              Copy a short text about your XP, Spawn and events – then post wherever.
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" data-share-dest="x">Post on X</button>
              <button class="modal-btn" data-share-dest="farcaster">Cast on Farcaster</button>
              <button class="modal-btn" data-share-dest="base">Share in Base app</button>
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
              Ping the mesh once per day to keep your streak warm. Small XP now, better perks later.
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" id="checkin-claim">Claim +10 XP</button>
              <button class="modal-btn" id="checkin-claim-stake">
                Claim +10 XP & stake (+3% bonus)
              </button>
            </div>
            <div class="modal-footer-row">
              <button data-close="checkin">Skip</button>
            </div>
          </div>
        </div>

        <!-- Wallet mesh modal -->
        <div class="modal" id="wallet-modal">
          <div class="modal-backdrop" data-close="wallet"></div>
          <div class="modal-panel">
            <div class="modal-title">Wallet mesh</div>
            <div class="modal-sub">
              Preview of multi-wallet mode – pick which address drives the mesh.
            </div>
            <div class="wallet-list" id="wallet-list"></div>
            <div class="modal-actions">
              <button class="modal-btn primary" id="wallet-add-btn">Add mock wallet</button>
            </div>
            <div class="modal-footer-row">
              <button data-close="wallet">Close</button>
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
  initWalletModal();
  renderActiveView();
  updateGasMeter();
  startGasInterval();
}

/* THEME */

function applyTheme() {
  const body = document.body;
  body.classList.remove("theme-dark", "theme-jurassic", "theme-hologram");
  if (state.theme === "jurassic") body.classList.add("theme-jurassic");
  else if (state.theme === "hologram") body.classList.add("theme-hologram");
  else body.classList.add("theme-dark");
}

/* WALLET */

function generateMockWallet() {
  const rand = Math.random().toString(16).slice(2, 10);
  return `0x${rand}c${rand.slice(0, 4)}`;
}

function wireWallet() {
  const btn = document.getElementById("btn-wallet");
  const manageBtn = document.getElementById("wallet-manage-btn");
  if (!btn || !manageBtn) return;

  btn.addEventListener("click", () => {
    if (!state.wallet) {
      const addr = generateMockWallet();
      state.wallet = addr;
      if (!state.wallets.includes(addr)) state.wallets.unshift(addr);
    } else {
      state.wallet = null;
    }
    updateWalletUI();
    renderActiveView();
  });

  manageBtn.addEventListener("click", () => {
    openWalletModal();
  });

  updateWalletUI();
}

function updateWalletUI() {
  const label = document.getElementById("wallet-label");
  const addrEl = document.getElementById("wallet-address-display");
  const icon = document.getElementById("wallet-status-icon");
  const stripStatus = document.getElementById("wallet-strip-status");
  const btn = document.getElementById("btn-wallet");
  if (!label || !addrEl || !btn) return;

  if (state.wallet) {
    label.textContent = "Disconnect";
    addrEl.textContent = shortAddress(state.wallet);
    btn.classList.add("wallet-connected");
    if (icon) icon.textContent = "●";
    if (stripStatus) stripStatus.textContent = "●";
  } else {
    label.textContent = "Connect";
    addrEl.textContent = "No wallet connected";
    btn.classList.remove("wallet-connected");
    if (icon) icon.textContent = "⦿";
    if (stripStatus) stripStatus.textContent = "⦿";
  }
}

/* TABS */

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

/* TICKER */

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

/* SIDE MENU */

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
        resetState();
      } else if (action === "docs") {
        window.open("https://github.com/gascheckking/SpawnEngine", "_blank");
      } else if (action === "multiwallet") {
        openWalletModal();
      } else if (action === "custom-theme") {
        alert("Custom presets will arrive in the onchain version.");
      }
      toggle(false);
    });
  });

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

function resetState() {
  state.wallet = null;
  state.wallets = [];
  state.xp = 1575;
  state.spawn = 497;
  state.meshEvents = 9;
  state.tasks = { checkin: false, testPack: false, share: false };
  updateWalletUI();
  renderActiveView();
}

/* SHARE MODAL */

function initShareModal() {
  const modal = document.getElementById("share-modal");
  if (!modal) return;

  modal.querySelectorAll("[data-close='share']").forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("open"))
  );

  modal.querySelectorAll("[data-share-dest]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.dataset.shareDest;
      const text = `SpawnEngine mesh · XP ${state.xp} · Spawn ${state.spawn} SPN · ${state.meshEvents} events · Base mesh layer.`;

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
        window.open("https://base.app", "_blank");
      }

      modal.classList.remove("open");
    });
  });
}

function openShareModal() {
  const modal = document.getElementById("share-modal");
  if (modal) modal.classList.add("open");
}

/* CHECK-IN MODAL */

function initCheckinModal() {
  const modal = document.getElementById("checkin-modal");
  const claimBtn = document.getElementById("checkin-claim");
  const claimStakeBtn = document.getElementById("checkin-claim-stake");
  if (!modal || !claimBtn || !claimStakeBtn) return;

  // open once on load
  modal.classList.add("open");

  const addCheckinXp = (amount) => {
    if (!state.tasks.checkin) {
      state.tasks.checkin = true;
      state.xp += amount;
    }
    const xpEl = document.getElementById("status-xp");
    if (xpEl) xpEl.textContent = state.xp;
    modal.classList.remove("open");
    renderActiveView();
  };

  claimBtn.addEventListener("click", () => addCheckinXp(10));
  claimStakeBtn.addEventListener("click", () => addCheckinXp(13));

  modal.querySelectorAll("[data-close='checkin']").forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("open"))
  );
}

/* WALLET MODAL */

function initWalletModal() {
  const modal = document.getElementById("wallet-modal");
  const addBtn = document.getElementById("wallet-add-btn");
  if (!modal || !addBtn) return;

  modal.querySelectorAll("[data-close='wallet']").forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("open"))
  );

  addBtn.addEventListener("click", () => {
    const addr = generateMockWallet();
    state.wallets.unshift(addr);
    if (!state.wallet) state.wallet = addr;
    updateWalletUI();
    renderWalletList();
  });

  renderWalletList();
}

function renderWalletList() {
  const list = document.getElementById("wallet-list");
  if (!list) return;

  if (!state.wallets.length) {
    list.innerHTML =
      '<div class="wallet-row"><span>No wallets yet – connect once to start a mesh.</span></div>';
    return;
  }

  list.innerHTML = state.wallets
    .map((addr) => {
      const active = addr === state.wallet;
      return `
        <div class="wallet-row">
          <span>${shortAddress(addr)}</span>
          <button data-wallet="${addr}">
            ${active ? "Active" : "Set active"}
          </button>
        </div>
      `;
    })
    .join("");

  list.querySelectorAll("button[data-wallet]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const w = btn.dataset.wallet;
      state.wallet = w;
      updateWalletUI();
      renderWalletList();
      renderActiveView();
    });
  });
}

function openWalletModal() {
  const modal = document.getElementById("wallet-modal");
  if (!modal) return;
  renderWalletList();
  modal.classList.add("open");
}

/* GAS METER */

function updateGasMeter() {
  const fill = document.getElementById("gas-meter-fill");
  const label = document.getElementById("status-gas");
  if (!fill || !label) return;

  const level = state.gasLevel; // 0–1
  const width = 20 + level * 60; // 20–80%
  fill.style.width = `${width}%`;

  const gwei = (0.15 + level * 0.25).toFixed(2);
  label.textContent = `~${gwei} gwei est.`;
}

function startGasInterval() {
  setInterval(() => {
    state.gasLevel = 0.2 + Math.random() * 0.6;
    updateGasMeter();
  }, 8000);
}

/* ROUTER */

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
    case "quests":
      html = renderQuests();
      break;
    case "stats":
      html = renderStats();
      break;
    case "pnl":
      html = renderPnl();
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
      <div class="panel-sub">
        One wallet, many contract types – all streamed into a single activity mesh.
      </div>

      <div class="trading-card" style="margin-top:6px;">
        <div class="trading-card-head">
          <div style="display:flex;align-items:center;gap:9px;">
            <div class="brand-icon" style="width:34px;height:34px;font-size:13px;">SE</div>
            <div>
              <div class="trading-card-title">${handle}</div>
              <div class="trading-card-sub">
                Mesh owner on ${chain} · Packs, XP & creator lanes
              </div>
            </div>
          </div>
          <span class="chip chip-online">ONLINE</span>
        </div>
        <div class="trading-card-foot">
          Connected modules: ${modules.join(" · ")}
        </div>
      </div>

      <div class="overview-grid" style="margin-top:6px;">
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Grows as you complete daily loop tasks.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn balance</div>
          <div class="metric-value">${state.spawn} SPN</div>
          <div class="metric-foot">Internal mesh token for rewards.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Today’s events</div>
          <div class="metric-value">${state.meshEvents}</div>
          <div class="metric-foot">pack_open · burn · swap · zora_buy · casts.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Connected modules</div>
          <div class="metric-value">4</div>
          <div class="metric-foot">Factory · TokenSeries · Guard · Router.</div>
        </div>
      </div>

      ${renderDailyTasksInner(true)}
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
    `
    )
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">Mesh home</div>
      <div class="panel-sub">
        Quick Base-style overview for pulls, XP and mesh health – before any APIs.
      </div>

      <div class="overview-grid" style="margin-top:6px;">
        <div class="metric-card">
          <div class="metric-label">Today’s mesh events</div>
          <div class="metric-value">${state.meshEvents}</div>
          <div class="metric-foot">pack_open · burn · swap · zora_buy · casts.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Keep the streak alive with daily tasks.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn balance</div>
          <div class="metric-value">${state.spawn} SPN</div>
          <div class="metric-foot">Small rewards from packs & quests.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Active wallets</div>
          <div class="metric-value">${state.wallets.length || 1}</div>
          <div class="metric-foot">Single player today – multi-wallet later.</div>
        </div>
      </div>

      ${renderDailyTasksInner(false)}

      <div class="recent-pulls">
        <div class="recent-pulls-header">Recent pulls (sample)</div>
        ${recentHtml}
      </div>
    </section>
  `;
}

/* TRADING */

function renderTrading() {
  return `
    <section class="panel">
      <div class="panel-title">Trading hub</div>
      <div class="panel-sub">
        Future mesh-driven trading surface – token packs, shards, relics & creator lanes in one place.
      </div>

      <div class="trading-panel" style="margin-top:6px;">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Unified orderbook</div>
              <div class="trading-card-sub">
                TokenSeries · NFTSeries · Zora packs flowing into one book instead of ten dapps.
              </div>
            </div>
            <span class="chip chip-planned">PLANNED</span>
          </div>
          <div class="trading-card-foot">
            Later this view wires into onchain events and shows true depth, spreads and lanes.
          </div>
        </div>

        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Risk lanes</div>
              <div class="trading-card-sub">
                Fragment & Shard markets with ReserveGuard rules, Crown/Relic as curated premiums.
              </div>
            </div>
            <span class="chip chip-risk">RISK CONTROL</span>
          </div>
          <div class="trading-card-foot">
            Creators can set conservative bands or degen lanes – but rules are clear from the start.
          </div>
        </div>
      </div>
    </section>
  `;
}

/* PULL LAB */

function renderPullLab() {
  return `
    <section class="panel">
      <div class="panel-title">Pull lab</div>
      <div class="panel-sub">
        Rarity bands for SpawnEngine – Fragment, Shard, Ember, Crown, Relic.
      </div>

      <div class="overview-grid" style="margin-top:6px;">
        <div class="metric-card">
          <div class="metric-label">Fragment · Band I</div>
          <div class="metric-value">Commons</div>
          <div class="metric-foot">Often burned, sometimes recycled into quests.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Shard · Band II</div>
          <div class="metric-value">Mid-rares</div>
          <div class="metric-foot">Unlock basic bounties & leaderboard weight.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Ember · Band III</div>
          <div class="metric-value">Our “epic”</div>
          <div class="metric-foot">Strong payouts, campaign boosters.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Crown · Band IV</div>
          <div class="metric-value">Legend tier</div>
          <div class="metric-foot">Curated, verified creator lanes only.</div>
        </div>
      </div>

      <div class="trading-card" style="margin-top:6px;">
        <div class="trading-card-head">
          <div>
            <div class="trading-card-title">Relic band</div>
            <div class="trading-card-sub">
              Our top shelf: low count, high EV collectibles that can anchor quests and bounties.
            </div>
          </div>
          <span class="chip chip-mesh">RELIC</span>
        </div>
        <div class="trading-card-foot">
          In the onchain version this view will show real hit-rates and expected value per band.
        </div>
      </div>
    </section>
  `;
}

/* QUESTS */

function renderQuests() {
  return `
    <section class="panel">
      <div class="panel-title">Creator quests</div>
      <div class="panel-sub">
        Preview of how Bounties and quests can look – creators define lanes, the mesh tracks progress.
      </div>

      <div class="overview-grid" style="margin-top:6px;">
        <div class="metric-card">
          <div class="metric-label">Active quests</div>
          <div class="metric-value">12</div>
          <div class="metric-foot">Different creators, different styles.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Completed</div>
          <div class="metric-value">37</div>
          <div class="metric-foot">Total completions across the mesh.</div>
        </div>
      </div>

      <div class="trading-panel" style="margin-top:6px;">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">“First Relic” lane</div>
              <div class="trading-card-sub">
                Pull any Relic from Base Relics S1 → earn 3 extra packs + Spawn boost.
              </div>
            </div>
            <span class="chip chip-mesh">LIVE SAMPLE</span>
          </div>
          <div class="trading-card-foot">
            Good for spotlighting a new series without forcing total degen odds.
          </div>
        </div>

        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Discovery quest</div>
              <div class="trading-card-sub">
                Open packs from 3 different creators this week → unlock an XP + Spawn reward lane.
              </div>
            </div>
            <span class="chip chip-planned">DISCOVERY</span>
          </div>
          <div class="trading-card-foot">
            Later you’ll be able to filter quests by EV, creator reputation and risk profile.
          </div>
        </div>
      </div>
    </section>
  `;
}

/* STATS */

function renderStats() {
  return `
    <section class="panel">
      <div class="panel-title">Stats & luck engine</div>
      <div class="panel-sub">
        Snapshot numbers now, onchain data later – same layout, just wired up.
      </div>

      <div class="overview-grid" style="margin-top:6px;">
        <div class="metric-card">
          <div class="metric-label">Total packs</div>
          <div class="metric-value">12 543</div>
          <div class="metric-foot">Combined across all SpawnEngine series.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic hit rate</div>
          <div class="metric-value">3.2%</div>
          <div class="metric-foot">Will be computed from real pulls.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Unique holders</div>
          <div class="metric-value">987</div>
          <div class="metric-foot">Wallets that touched at least one pack.</div>
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

/* PNL */

function renderPnl() {
  const pnlSummary = {
    total: "+ 4.21 ETH",
    realized: "+ 2.40 ETH",
    unrealized: "+ 1.81 ETH",
    winRate: "63%",
  };

  const pnlSeries = [+0.8, -0.4, +1.2, +0.3, -0.1, +0.9, +1.5];

  const barsHtml = pnlSeries
    .map((v) => {
      const isNeg = v < 0;
      const mag = Math.min(Math.abs(v) / 1.5, 1);
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
        Mesh-style PNL for everything the engine has seen – later tied to real swaps & pulls.
      </div>

      <div class="pnl-summary-grid" style="margin-top:6px;">
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
        Last 7 mesh days (ETH-denominated, sample):
      </div>
      <div class="pnl-chart">
        ${barsHtml}
      </div>
    </section>
  `;
}

/* SETTINGS */

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-title">Settings & modules</div>
      <div class="panel-sub">
        Control room for wallets, creators and future API integrations.
      </div>

      <div class="trading-panel" style="margin-top:6px;">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Wallets</div>
              <div class="trading-card-sub">
                Today: local preview only. Later: real Base wallets with multi-account support.
              </div>
            </div>
          </div>
          <div class="trading-card-foot">
            Use the “Wallet mesh” button above to add and switch between mock addresses.
          </div>
        </div>

        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Creator modules</div>
              <div class="trading-card-sub">
                Factory, TokenPackSeries, ReserveGuard, UtilityRouter and hooks for Zora & Farcaster.
              </div>
            </div>
          </div>
          <div class="trading-card-foot">
            The app is the mesh UI; contracts stay modular so you can add more lanes later.
          </div>
        </div>
      </div>
    </section>
  `;
}

/* DAILY TASKS SHARED BLOCK */

function renderDailyTasksInner(isProfile) {
  const remaining = remainingXP();
  const t = state.tasks;

  return `
    <div class="task-list">
      <div class="task-header">
        <span>${isProfile ? "Today’s loop" : "Daily mesh loop"}</span>
        <span>+${remaining} XP available</span>
      </div>
      <div class="task-items">
        <div class="task-item">
          <div class="task-left">
            <div class="task-dot ${t.checkin ? "done" : ""}"></div>
            <div>
              <div class="task-label-main">Daily check-in</div>
              <div class="task-label-sub">Tap in once a day to keep your streak.</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="task-xp">+40 XP</div>
            <button class="task-cta ${t.checkin ? "done" : ""}" data-task="checkin">
              ${t.checkin ? "Done" : "Open"}
            </button>
          </div>
        </div>

        <div class="task-item">
          <div class="task-left">
            <div class="task-dot ${t.testPack ? "done" : ""}"></div>
            <div>
              <div class="task-label-main">Open a test pack</div>
              <div class="task-label-sub">Simulate one pack_open event.</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="task-xp">+60 XP</div>
            <button class="task-cta ${t.testPack ? "done" : ""}" data-task="test-pack">
              ${t.testPack ? "Done" : "Simulate"}
            </button>
          </div>
        </div>

        <div class="task-item">
          <div class="task-left">
            <div class="task-dot ${t.share ? "done" : ""}"></div>
            <div>
              <div class="task-label-main">Share your mesh</div>
              <div class="task-label-sub">Copy stats and post on X / Farcaster.</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <div class="task-xp">+100 XP</div>
            <button class="task-cta ${t.share ? "done" : ""}" data-task="share">
              ${t.share ? "Copied" : "Copy & share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* TASK BUTTONS */

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
        renderActiveView();
      } else if (task === "checkin") {
        const modal = document.getElementById("checkin-modal");
        if (modal) modal.classList.add("open");
      } else if (task === "share") {
        openShareModal();
      }
    });
  });
}

/* START */

document.addEventListener("DOMContentLoaded", init);