const state = {
  wallet: null,
  wallets: [],
  xp: 1575,
  spn: 497,
  meshEvents: 9,
  activeTab: "overview",
  gasLevel: 0.35,
  tasks: {
    testPack: false,
    share: false,
  },
  theme: "dark",
};

const TABS = [
  { id: "overview", label: "Home" },
  { id: "profile", label: "Mesh profile" },
  { id: "trading", label: "Trading" },
  { id: "pull-lab", label: "Pull lab" },
  { id: "pack-maps", label: "Pack maps" },
  { id: "campaigns", label: "Creator quests" },
  { id: "stats", label: "Stats" },
  { id: "pnl", label: "PNL" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "settings", label: "Settings" },
];

const livePulls = [
  { pack: "Neon Fragments", tier: "shard", band: "Shard", text: "hit in 4 pulls" },
  { pack: "Base Relics", tier: "relic", band: "Relic", text: "after 37 pulls" },
  { pack: "Crown Trials", tier: "relic", band: "Crown", text: "in 1 923 pulls" },
  { pack: "Mesh Emberline", tier: "fragment", band: "Ember", text: "streak x10" },
];

const recentPullsMock = [
  { pack: "Neon Fragments", band: "Ember", amount: 10, odds: "1 / 420" },
  { pack: "Base Relics", band: "Crown", amount: 3, odds: "1 / 1 200" },
  { pack: "Shard Forge", band: "Relic", amount: 1, odds: "1 / 2 000" },
];

function remainingXP() {
  let total = 150;
  if (state.tasks.testPack) total -= 50;
  if (state.tasks.share) total -= 100;
  return total;
}

/* init */

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
                  Modular mesh for packs, XP, bounties & creator modules
                </div>
              </div>
            </div>
            <div class="brand-right">
              <div class="pill">
                <span class="pill-dot"></span>
                <span class="pill-label">Base · Mesh layer</span>
              </div>
              <button class="btn-wallet" id="btn-wallet">
                <span id="wallet-status-icon">⦿</span><span id="wallet-label">Connect</span>
              </button>
              <div class="wallet-inline-status" id="wallet-inline-status">
                No wallet connected
              </div>
            </div>
          </div>

          <div class="mode-row">
            <span>Mode · v0.2</span>
            <span>Mesh preview · single player</span>
          </div>

          <div class="status-row">
            <div class="status-pill">
              <span class="status-pill-label">Gas</span>
              <span class="status-pill-value" id="status-gas">~0.24 gwei est.</span>
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
              <span class="status-pill-label">Mesh token</span>
              <span class="status-pill-value" id="status-spn">${state.spn} SPN</span>
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
            <a href="https://x.com/spawnizz" target="_blank" rel="noreferrer">X/Twitter</a>
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
            </div>

            <div class="side-settings-group" style="margin-top:10px;">
              <div class="side-settings-title">Quick links</div>
              <button class="side-menu-item" data-menu="multiwallet">
                Wallet mesh · connect more wallets
              </button>
              <button class="side-menu-item" data-menu="creator-theme">
                Create your own color pack
              </button>
            </div>

            <ul class="side-menu-list">
              <li>
                <button class="side-menu-item" data-menu="quests">
                  Creator quests & bounties overview
                </button>
              </li>
              <li>
                <button class="side-menu-item" data-menu="docs">
                  Dev docs · GitHub
                </button>
              </li>
              <li>
                <button class="side-menu-item" data-menu="reset">
                  Reset local mesh state
                </button>
              </li>
              <li>
                <button class="side-menu-item" data-menu="logout">
                  Log out (clear wallet)
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
              Copy a small stat-snippet and open your favourite surface.
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" data-share-dest="x">Post on X</button>
              <button class="modal-btn" data-share-dest="farcaster">Cast on Farcaster</button>
              <button class="modal-btn" data-share-dest="base">Share via Base app</button>
            </div>
            <div class="modal-footer-row">
              <button data-close="share">Close</button>
            </div>
          </div>
        </div>

        <!-- Daily check-in -->
        <div class="modal" id="checkin-modal">
          <div class="modal-backdrop" data-close="checkin"></div>
          <div class="modal-panel">
            <div class="modal-title">Daily check-in</div>
            <div class="modal-sub">
              Ping the mesh once per day for a small XP bump. Optional stake gives a tiny extra.
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

        <!-- Wallet mesh modal -->
        <div class="modal" id="wallet-mesh-modal">
          <div class="modal-backdrop" data-close="wallet-mesh"></div>
          <div class="modal-panel">
            <div class="modal-title">Wallet mesh</div>
            <div class="modal-sub">
              Preview of multi-wallet mode – pick which address drives the mesh.
            </div>
            <div class="wallet-list" id="wallet-list">
              <!-- filled in JS -->
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" id="wallet-mesh-add">
                Add mock wallet
              </button>
            </div>
            <div class="modal-footer-row">
              <button data-close="wallet-mesh">Close</button>
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
  initWalletMeshModal();
  renderActiveView();
  updateGasMeter();
  startGasInterval();
}

/* theme */

function applyTheme() {
  const body = document.body;
  body.classList.remove("theme-jurassic", "theme-hologram");
  if (state.theme === "jurassic") {
    body.classList.add("theme-jurassic");
  } else if (state.theme === "hologram") {
    body.classList.add("theme-hologram");
  }
}

/* wallet */

function wireWallet() {
  const btn = document.getElementById("btn-wallet");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!state.wallet) {
      const rand = Math.random().toString(16).slice(2, 8);
      const addr = `0x094c…${rand}`;
      state.wallet = addr;
      state.wallets = [addr, ...state.wallets.filter((w) => w !== addr)];
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
  const icon = document.getElementById("wallet-status-icon");
  const btn = document.getElementById("btn-wallet");
  const inline = document.getElementById("wallet-inline-status");
  if (!label || !btn || !inline) return;

  if (state.wallet) {
    label.textContent = "Disconnect";
    inline.textContent = state.wallet;
    btn.classList.add("wallet-connected");
    if (icon) icon.textContent = "●";
  } else {
    label.textContent = "Connect";
    inline.textContent = "No wallet connected";
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
        openWalletMeshModal();
      } else if (action === "quests") {
        state.activeTab = "campaigns";
        renderTabs();
        renderActiveView();
      } else if (action === "logout") {
        state.wallet = null;
        updateWalletUI();
        renderActiveView();
      } else if (action === "creator-theme") {
        alert(
          "Creator theme lab: later you’ll be able to save your own color presets for the app."
        );
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

function resetMockState() {
  state.wallet = null;
  state.wallets = [];
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
    btn.addEventListener("click", () => modal.classList.remove("open"))
  );

  modal.querySelectorAll("[data-share-dest]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dest = btn.dataset.shareDest;
      const text = `SpawnEngine mesh · XP ${state.xp} · SPN ${state.spn} · ${state.meshEvents} mesh events · v0.2. #SpawnEngine`;

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
          "_blank"
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
  claimStakeBtn.addEventListener("click", () => addCheckinXp(13));

  modal.querySelectorAll("[data-close='checkin']").forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("open"))
  );
}

/* wallet mesh modal */

function initWalletMeshModal() {
  const modal = document.getElementById("wallet-mesh-modal");
  if (!modal) return;

  modal.querySelectorAll("[data-close='wallet-mesh']").forEach((btn) =>
    btn.addEventListener("click", () => modal.classList.remove("open"))
  );

  const addBtn = document.getElementById("wallet-mesh-add");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const rand = Math.random().toString(16).slice(2, 8);
      const addr = `0xmesh…${rand}`;
      if (!state.wallets.includes(addr)) state.wallets.push(addr);
      if (!state.wallet) state.wallet = addr;
      updateWalletUI();
      renderWalletList();
    });
  }

  renderWalletList();
}

function openWalletMeshModal() {
  const modal = document.getElementById("wallet-mesh-modal");
  if (modal) {
    renderWalletList();
    modal.classList.add("open");
  }
}

function renderWalletList() {
  const list = document.getElementById("wallet-list");
  if (!list) return;

  const all = state.wallet
    ? [state.wallet, ...state.wallets.filter((w) => w !== state.wallet)]
    : state.wallets;

  if (!all.length) {
    list.innerHTML =
      '<div class="wallet-row" style="justify-content:flex-start;">No wallets yet – first connect will appear here.</div>';
    return;
  }

  list.innerHTML = all
    .map(
      (addr) => `
      <div class="wallet-row">
        <span>${addr}${addr === state.wallet ? " · active" : ""}</span>
        ${
          addr === state.wallet
            ? '<button disabled>Current</button>'
            : `<button data-wallet="${addr}">Set active</button>`
        }
      </div>
    `
    )
    .join("");

  list.querySelectorAll("button[data-wallet]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const addr = btn.dataset.wallet;
      state.wallet = addr;
      updateWalletUI();
      renderWalletList();
      renderActiveView();
    });
  });
}

/* gas meter */

function updateGasMeter() {
  const fill = document.getElementById("gas-meter-fill");
  const label = document.getElementById("status-gas");
  if (!fill || !label) return;

  const level = state.gasLevel;
  const width = 20 + level * 60;
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
    case "stats":
      html = renderStats();
      break;
    case "pnl":
      html = renderPnl();
      break;
    case "leaderboard":
      html = renderLeaderboard();
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

      <div class="trading-card" style="margin-top:8px;">
        <div class="trading-card-head">
          <div style="display:flex;align-items:center;gap:9px;">
            <div class="brand-icon" style="width:34px;height:34px;font-size:13px;">SE</div>
            <div>
              <div class="trading-card-title">${handle}</div>
              <div class="trading-card-sub">
                Mesh owner on ${chain} · XP & pack layer
              </div>
            </div>
          </div>
          <span class="chip chip-online">ONLINE</span>
        </div>
        <div class="trading-card-foot">
          Connected modules: ${modules.join(" · ")}.
        </div>
      </div>

      <div class="overview-grid">
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Grows as you complete daily mesh tasks.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">SPN balance</div>
          <div class="metric-value">${state.spn}</div>
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
          <div class="metric-foot">Factory · TokenSeries · Guard · UtilityRouter.</div>
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
                  ${
                    state.wallet
                      ? state.wallet
                      : "Connect wallet to lock in your mesh identity."
                  }
                </div>
              </div>
              <span class="chip chip-mesh">REQUIRED</span>
            </div>
            <div class="trading-card-foot">
              In the full version, XP and SPN rewards tie directly to onchain activity.
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
                  Casts, mints & creator coins stream into the same activity mesh.
                </div>
              </div>
              <span class="chip chip-planned">HOOKS</span>
            </div>
            <div class="trading-card-foot">
              Your creator actions become first-class mesh events.
            </div>
          </div>
        </div>
      </div>

      ${renderDailyTasksInner()}
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
        One view for packs, XP and pulls – the quick “Base app” style overview.
      </div>

      <div class="overview-grid">
        <div class="metric-card">
          <div class="metric-label">Today’s mesh events</div>
          <div class="metric-value">${state.meshEvents}</div>
          <div class="metric-foot">pack_open · burn · swap · zora_buy · casts.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Daily check-ins and tasks push this up.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">SPN balance</div>
          <div class="metric-value">${state.spn} SPN</div>
          <div class="metric-foot">Mesh token for rewards.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Connected modules</div>
          <div class="metric-value">4</div>
          <div class="metric-foot">Factory · TokenSeries · Guard · UtilityRouter.</div>
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

/* TRADING */

function renderTrading() {
  return `
    <section class="panel">
      <div class="panel-title">Trading hub</div>
      <div class="panel-sub">
        Swap packs, fragments, shards, relics & creator tokens in one mesh-driven orderbook (design preview).
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
              <span class="chip chip-planned">ORDERBOOK</span>
            </div>
            <div class="trading-card-foot">
              Factory deploys multiple series – all stream into one trading surface.
            </div>
          </div>
        </div>

        <div>
          <div class="trading-row-title">Risk-aware lanes</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Fragment & shard markets</div>
                <div class="trading-card-sub">
                  ReserveGuard-protected pools with treasury checks.
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
              One mesh instead of ten separate dapps.
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

/* PULL LAB – rarity bands */

function renderPullLab() {
  return `
    <section class="panel">
      <div class="panel-title">Pull lab</div>
      <div class="panel-sub">
        Rarity bands for SpawnEngine packs – Fragment, Shard, Ember, Crown, Relic.
      </div>

      <div class="overview-grid" style="margin-top:10px;">
        <div class="metric-card">
          <div class="metric-label">Fragment</div>
          <div class="metric-value">Band I</div>
          <div class="metric-foot">Base commons – often burned, sometimes recycled into quests.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Shard</div>
          <div class="metric-value">Band II</div>
          <div class="metric-foot">Mid-rare hits that unlock basic Creator bounties.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Ember</div>
          <div class="metric-value">Band III</div>
          <div class="metric-foot">Our “epic” tier – strong payouts and leaderboard weight.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Crown</div>
          <div class="metric-value">Band IV</div>
          <div class="metric-foot">Legendary tier – unlocked for curated, verified creators.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic</div>
          <div class="metric-value">Band V</div>
          <div class="metric-foot">Mythic outputs – big one-off rewards, used in high-end quests.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn kickback</div>
          <div class="metric-value">5–10%</div>
          <div class="metric-foot">XP / SPN returned per pack open.</div>
        </div>
      </div>
    </section>
  `;
}

/* PACK MAPS */

function renderPackMaps() {
  return `
    <section class="panel">
      <div class="panel-title">Pack maps</div>
      <div class="panel-sub">
        Visual mesh of series, creators & risk-zones across Base (map view later).
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

/* CAMPAIGNS / CREATOR QUESTS */

function renderCampaigns() {
  return `
    <section class="panel">
      <div class="panel-title">Creator quests</div>
      <div class="panel-sub">
        Bounties for pulls, burns, quests or trying miniapps – all driven by creators.
      </div>

      <div class="trading-panel">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Quest lane · Base Relics</div>
              <div class="trading-card-sub">
                Example: pull any Crown or Relic in 30 packs → win extra packs plus SPN.
              </div>
            </div>
            <span class="chip chip-mesh">LIVE SOON</span>
          </div>
          <div class="trading-card-foot">
            SpawnEngine keeps track of odds, payouts and creator budgets automatically.
          </div>
        </div>

        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Miniapp quests</div>
              <div class="trading-card-sub">
                “Try my miniapp”, “bridge to Base”, “open your first pack” – everything can be a quest.
              </div>
            </div>
            <span class="chip chip-planned">IDEA</span>
          </div>
          <div class="trading-card-foot">
            Long term: verified creators fund quests using a shared SPN / ETH pool tracked in the mesh.
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
        Mesh-wide counters and luck metrics – later wired to real onchain pack events.
      </div>
      <div class="overview-grid" style="margin-top:9px;">
        <div class="metric-card">
          <div class="metric-label">Total packs (sample)</div>
          <div class="metric-value">12 543</div>
          <div class="metric-foot">Combined across all series.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic hit rate</div>
          <div class="metric-value">3.2%</div>
          <div class="metric-foot">Computed from all Relic pulls.</div>
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
        PNL layer for everything the mesh has seen – swaps, pulls and rewards in one chart.
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
        Last 7 mesh days (ETH-denominated, sample):
      </div>
      <div class="pnl-chart">
        ${barsHtml}
      </div>
    </section>
  `;
}

/* LEADERBOARD */

function renderLeaderboard() {
  const rows = [
    { rank: 1, handle: "@creator_a", score: "Mesh score 120k", note: "Base pack archetype" },
    { rank: 2, handle: "@spawnengine", score: "Mesh score 97k", note: "XP & pack mesh" },
    { rank: 3, handle: "@noisepack", score: "Mesh score 75k", note: "Chaos foil series" },
  ];

  const htmlRows = rows
    .map(
      (r) => `
      <div class="leader-row">
        <div class="leader-left">
          <div class="leader-rank">#${r.rank}</div>
          <div>
            <div class="leader-handle">${r.handle}</div>
            <div class="leader-score">${r.score}</div>
          </div>
        </div>
        <span style="font-size:9px;color:var(--text-soft);">${r.note}</span>
      </div>
    `
    )
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">Creator leaderboard</div>
      <div class="panel-sub">
        Preview of how SpawnEngine ranks creators by activity, pulls and quest payouts.
      </div>
      <div class="leaderboard-list">
        ${htmlRows}
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
        Control room for wallets, modules and social hooks.
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
            v0.2 keeps everything local – onchain reads come next.
          </div>
        </div>
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Creator modules</div>
              <div class="trading-card-sub">
                Factory, TokenPackSeries, ReserveGuard, UtilityRouter & future Zora / NFT modules.
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

/* DAILY TASKS shared */

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
              <div class="task-label-sub">Trigger one simulated pack_open event.</div>
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
              <div class="task-label-sub">Post a cast / X post with your stats.</div>
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