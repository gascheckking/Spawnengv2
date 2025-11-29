const state = {
  wallet: null,
  wallets: [],
  xp: 1575,
  spawn: 497,
  meshEvents: 9,
  activeTab: "home",
  gasLevel: 0.35,
  tasks: {
    testPack: false,
    share: false,
  },
  theme: "dark",
};

const TABS = [
  { id: "home", label: "Home" },
  { id: "profile", label: "Profile" },
  { id: "trading", label: "Trading" },
  { id: "pull-lab", label: "Pull Lab" },
  { id: "pack-maps", label: "Pack Maps" },
  { id: "campaigns", label: "Campaigns" },
  { id: "stats", label: "Stats" },
  { id: "pnl", label: "PNL" },
  { id: "creator", label: "Creator Hub" },
  { id: "settings", label: "Settings" },
];

const livePulls = [
  { pack: "Neon Fragments", tier: "shard", band: "Shard", text: "hit after 4 pulls" },
  { pack: "Base Relics", tier: "relic", band: "Relic", text: "after 37 pulls" },
  { pack: "Mesh Trials", tier: "fragment", band: "Fragment", text: "streak x10" },
  { pack: "Spawn Vault", tier: "relic", band: "Relic", text: "perfect roll" },
];

const recentPullsMock = [
  { pack: "Neon Fragments", band: "Shard", amount: 10, odds: "1 / 420" },
  { pack: "Base Relics", band: "Relic", amount: 3, odds: "1 / 1 200" },
  { pack: "Shard Forge", band: "Relic", amount: 1, odds: "1 / 2 000" },
];

function remainingXP() {
  let total = 250;
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
                <span class="pill-label">Base · Mesh Layer</span>
              </div>
              <button class="btn-wallet" id="btn-wallet">
                <span id="wallet-status-icon">⦿</span>
                <span id="wallet-label">Connect</span>
              </button>
            </div>
          </div>

          <div class="mode-tag">
            <span>MODE · v0.2</span><span>Mesh preview · single player</span>
          </div>

          <div class="status-row">
            <div class="status-pill">
              <span class="status-pill-label">Gas</span>
              <span class="status-pill-value" id="status-gas">~0.25 gwei est.</span>
              <div class="gas-meter">
                <div class="gas-meter-fill" id="gas-meter-fill"></div>
              </div>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">Mesh</span>
              <span class="status-pill-value" id="status-mesh">${state.meshEvents} events</span>
            </div>
          </div>

          <div class="wallet-inline-row">
            <div>
              <div class="wallet-inline-label">Connected wallet</div>
              <div class="wallet-inline-address" id="wallet-address-inline">
                No wallet connected
              </div>
            </div>
          </div>

          <div class="status-row">
            <div class="status-pill">
              <span class="status-pill-label">XP</span>
              <span class="status-pill-value" id="status-xp">${state.xp}</span>
            </div>
            <div class="status-pill">
              <span class="status-pill-label">Spawn</span>
              <span class="status-pill-value" id="status-spawn">${state.spawn} SPN</span>
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

        <!-- side menu -->
        <div class="side-menu" id="side-menu">
          <div class="side-menu-backdrop" id="side-menu-backdrop"></div>
          <div class="side-menu-panel">
            <div class="side-menu-header">
              <div class="side-menu-avatar">SE</div>
              <div>
                <div class="side-menu-title">@spawnengine</div>
                <div class="side-menu-sub">Mesh layer controls · v0.2 preview</div>
              </div>
            </div>

            <div class="side-settings-group">
              <div class="side-settings-title">App themes</div>
              <div class="side-theme-row">
                <button class="side-theme-btn active" data-theme="dark">Dark</button>
                <button class="side-theme-btn" data-theme="jurassic">Jurassic</button>
                <button class="side-theme-btn" data-theme="hologram">Hologram</button>
                <button class="side-theme-btn" data-theme="neonwire">NeonWire</button>
                <button class="side-theme-btn" data-theme="retrobase">RetroBase</button>
              </div>
              <button class="side-menu-item" data-menu="shuffle-theme">
                Create your own look (shuffle theme)
              </button>
              <button class="side-menu-item" data-menu="multiwallet">
                Connect more wallets (mock)
              </button>
            </div>

            <ul class="side-menu-list">
              <li>
                <button class="side-menu-item" data-menu="docs">
                  Dev docs / GitHub
                </button>
              </li>
              <li>
                <button class="side-menu-item" data-menu="reset">
                  Reset mesh preview
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- wallet manager modal -->
        <div class="wallet-modal" id="wallet-modal">
          <div class="wallet-modal-backdrop" id="wallet-modal-backdrop"></div>
          <div class="wallet-modal-panel">
            <div class="wallet-modal-title">Wallet mesh</div>
            <div class="wallet-modal-sub">
              Preview of multi-wallet mode – pick which address drives the mesh.
            </div>
            <div class="wallet-list" id="wallet-list"></div>
            <div class="wallet-modal-actions">
              <button class="wallet-modal-btn" id="wallet-add-btn">Add mock wallet</button>
              <button class="wallet-modal-btn" id="wallet-close-btn">Close</button>
            </div>
          </div>
        </div>

        <!-- share modal -->
        <div class="modal" id="share-modal">
          <div class="modal-backdrop" data-close="share"></div>
          <div class="modal-panel">
            <div class="modal-title">Share your mesh</div>
            <div class="modal-sub">
              Choose a surface and we’ll copy a SpawnEngine stat snippet for you.
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

        <!-- daily check-in modal -->
        <div class="modal" id="checkin-modal">
          <div class="modal-backdrop" data-close="checkin"></div>
          <div class="modal-panel">
            <div class="modal-title">Daily check-in</div>
            <div class="modal-sub">
              Ping the mesh once per day for a small XP bump. Optional “stake” gives a tiny extra.
            </div>
            <div class="modal-actions">
              <button class="modal-btn primary" id="checkin-claim">Claim +10 XP</button>
              <button class="modal-btn" id="checkin-claim-stake">
                Claim +10 XP & stake (+3% mock)
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
  initWalletModal();
  renderActiveView();
  updateGasMeter();
  startGasInterval();
}

/* theme */

function applyTheme() {
  const body = document.body;
  body.classList.remove(
    "theme-jurassic",
    "theme-hologram",
    "theme-neonwire",
    "theme-retrobase",
  );
  if (state.theme === "jurassic") body.classList.add("theme-jurassic");
  else if (state.theme === "hologram") body.classList.add("theme-hologram");
  else if (state.theme === "neonwire") body.classList.add("theme-neonwire");
  else if (state.theme === "retrobase") body.classList.add("theme-retrobase");
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
      state.wallets.push(addr);
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
  const inlineAddr = document.getElementById("wallet-address-inline");

  if (!label || !btn || !inlineAddr || !icon) return;

  if (state.wallet) {
    label.textContent = "Disconnect";
    icon.textContent = "●";
    btn.classList.add("wallet-connected");
    inlineAddr.textContent = state.wallet;
  } else {
    label.textContent = "Connect";
    icon.textContent = "⦿";
    btn.classList.remove("wallet-connected");
    inlineAddr.textContent = "No wallet connected";
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

/* side menu + theme + docs + reset + multiwallet */

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
        openWalletModal();
      } else if (action === "shuffle-theme") {
        shuffleTheme();
      }
      toggle(false);
    });
  });

  // theme buttons
  menu.querySelectorAll(".side-theme-btn").forEach((btnTheme) => {
    btnTheme.addEventListener("click", () => {
      const theme = btnTheme.dataset.theme;
      state.theme = theme === "dark" ? "dark" : theme;
      menu
        .querySelectorAll(".side-theme-btn")
        .forEach((b) => b.classList.remove("active"));
      btnTheme.classList.add("active");
      applyTheme();
    });
  });
}

function shuffleTheme() {
  const themes = ["dark", "jurassic", "hologram", "neonwire", "retrobase"];
  const next = themes[Math.floor(Math.random() * themes.length)];
  state.theme = next;
  applyTheme();
  const menu = document.getElementById("side-menu");
  if (!menu) return;
  const btns = menu.querySelectorAll(".side-theme-btn");
  btns.forEach((b) => {
    b.classList.toggle("active", b.dataset.theme === next);
  });
}

function resetMockState() {
  state.wallet = null;
  state.wallets = [];
  state.tasks = { testPack: false, share: false };
  state.meshEvents = 9;
  state.xp = 1575;
  state.spawn = 497;
  updateWalletUI();
  renderActiveView();
}

/* wallet modal (multiwallet preview) */

function initWalletModal() {
  const modal = document.getElementById("wallet-modal");
  if (!modal) return;
  const backdrop = document.getElementById("wallet-modal-backdrop");
  const addBtn = document.getElementById("wallet-add-btn");
  const closeBtn = document.getElementById("wallet-close-btn");

  const close = () => modal.classList.remove("open");

  if (backdrop) backdrop.addEventListener("click", close);
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const rand = Math.random().toString(16).slice(2, 8);
      const addr = `0xmesh…${rand}`;
      state.wallets.push(addr);
      if (!state.wallet) state.wallet = addr;
      updateWalletList();
      updateWalletUI();
      renderActiveView();
    });
  }

  updateWalletList();
}

function openWalletModal() {
  const modal = document.getElementById("wallet-modal");
  if (!modal) return;
  modal.classList.add("open");
  updateWalletList();
}

function updateWalletList() {
  const list = document.getElementById("wallet-list");
  if (!list) return;

  if (!state.wallets.length) {
    list.innerHTML =
      '<div class="wallet-modal-sub" style="margin-top:6px;">No wallets yet – the first connect will appear here.</div>';
    return;
  }

  list.innerHTML = state.wallets
    .map(
      (addr) => `
      <div class="wallet-row">
        <span>${addr}</span>
        <span>${addr === state.wallet ? "Active" : "Tap to set active"}</span>
      </div>
    `,
    )
    .join("");

  Array.from(list.querySelectorAll(".wallet-row")).forEach((row, idx) => {
    row.addEventListener("click", () => {
      state.wallet = state.wallets[idx];
      updateWalletUI();
      updateWalletList();
      renderActiveView();
    });
  });
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
      const text = `SpawnEngine mesh · XP ${state.xp} · Spawn ${state.spawn} SPN · ${
        state.meshEvents
      } events · Base mesh layer.`;

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
        window.open("https://base.app/", "_blank");
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

  const open = () => {
    modal.classList.add("open");
  };
  const close = () => {
    modal.classList.remove("open");
  };

  // Spara globalt om vi vill trigga den senare
  window.SpawnEngineOpenCheckin = open;

  const addCheckinXp = (amount) => {
    state.xp += amount;
    const xpEl = document.getElementById("status-xp");
    if (xpEl) xpEl.textContent = state.xp;
    close();
    renderActiveView();
  };

  claimBtn.addEventListener("click", () => addCheckinXp(10));
  claimStakeBtn.addEventListener("click", () => addCheckinXp(13));

  modal.querySelectorAll("[data-close='checkin']").forEach((btn) =>
    btn.addEventListener("click", close),
  );

  // ⚠️ Ingen auto-open här längre, så rutan buggar inte vid load.
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
    case "home":
      html = renderHome();
      break;
    case "profile":
      html = renderProfile();
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
    case "creator":
      html = renderCreatorHub();
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

/* HOME */

function renderHome() {
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
      <div class="panel-title">Mesh home</div>
      <div class="panel-sub">
        One view for packs, XP and pulls – the quick “Base app” style overview.
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
          <div class="metric-foot">Daily check-ins and tasks push this up.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn balance</div>
          <div class="metric-value">${state.spawn} SPN</div>
          <div class="metric-foot">Internal mesh token for rewards.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Connected modules</div>
          <div class="metric-value">4</div>
          <div class="metric-foot">Factory · TokenSeries · Guard · UtilityRouter</div>
        </div>
      </div>

      ${renderDailyTasksInner()}

      <div class="recent-pulls">
        <div class="recent-pulls-header">Recent pulls (preview)</div>
        ${recentHtml}
      </div>
    </section>
  `;
}

/* PROFILE */

function renderProfile() {
  const handle = "@spawnengine";
  const chain = "Base";

  return `
    <section class="panel">
      <div class="panel-title">Mesh profile</div>
      <div class="mesh-profile-header">
        One identity across packs, quests and creator bounties.
      </div>

      <div class="profile-card">
        <div class="trading-card-head">
          <div style="display:flex;align-items:center;gap:9px;">
            <div class="brand-icon" style="width:34px;height:34px;font-size:13px;">SE</div>
            <div>
              <div class="trading-card-title">${handle}</div>
              <div class="trading-card-sub">
                Mesh owner on ${chain} · Layer-4 style XP & packs
              </div>
            </div>
          </div>
          <span class="chip chip-online">ONLINE</span>
        </div>
        <div class="trading-card-foot" style="margin-top:6px;">
          Active wallet:
          <strong>${
            state.wallet ? state.wallet : "none – connect a Base wallet from the header"
          }</strong>
        </div>
      </div>

      <div class="overview-grid">
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Grows with daily mesh actions.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn balance</div>
          <div class="metric-value">${state.spawn} SPN</div>
          <div class="metric-foot">Earned from pulls & quests.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Today’s events</div>
          <div class="metric-value">${state.meshEvents}</div>
          <div class="metric-foot">pack_open · burns · swaps · casts.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Connected surfaces</div>
          <div class="metric-value">${state.wallets.length || 1}</div>
          <div class="metric-foot">Wallets / packs / social surfaces.</div>
        </div>
      </div>

      <div class="trading-panel">
        <div>
          <div class="trading-row-title">Linked wallet</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Base wallet</div>
                <div class="trading-card-sub">
                  ${
                    state.wallet
                      ? state.wallet
                      : "Connect from the top-right button to lock identity."
                  }
                </div>
              </div>
              <span class="chip chip-mesh">Required</span>
            </div>
            <div class="trading-card-foot">
              In v1, XP and Spawn payouts will follow the active wallet.
            </div>
          </div>
        </div>

        <div>
          <div class="trading-row-title">Social surfaces</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Farcaster / Zora hooks</div>
                <div class="trading-card-sub">
                  Casts, mints & creator coins stream into the mesh view.
                </div>
              </div>
              <span class="chip chip-planned">Planned</span>
            </div>
            <div class="trading-card-foot">
              Think “Base app + Farcaster + Zora” but all routed through SpawnEngine.
            </div>
          </div>
        </div>
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
        Future orderbook for packs, fragments, shards, relics & creator tokens – all mesh-routed.
      </div>

      <div class="trading-panel">
        <div>
          <div class="trading-row-title">Surfaces</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Unified orderbook</div>
                <div class="trading-card-sub">
                  TokenSeries · NFTSeries · Zora packs · Mesh-linked liquidity lanes.
                </div>
              </div>
              <span class="chip chip-planned">Preview</span>
            </div>
            <div class="trading-card-foot">
              Factory deploys many series – trading hub keeps them in one clean view.
            </div>
          </div>
        </div>

        <div>
          <div class="trading-row-title">Risk lanes</div>
          <div class="trading-card">
            <div class="trading-card-head">
              <div>
                <div class="trading-card-title">Fragment & shard markets</div>
                <div class="trading-card-sub">
                  ReserveGuard protected pools and creator-configured “safety rails”.
                </div>
              </div>
              <span class="chip chip-risk">Risk-aware</span>
            </div>
            <div class="trading-card-foot">
              The idea: Relics are pure premium, lower bands carry most of the variance.
            </div>
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
        Playbook for SpawnEngine rarity bands – Fragment, Shard, Ember, Crown, Relic.
      </div>

      <div class="overview-grid" style="margin-top:9px;">
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
          <div class="metric-foot">Our “epic” – strong payouts and leaderboard weight.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Crown</div>
          <div class="metric-value">Band IV</div>
          <div class="metric-foot">Legendary tier – unlocked for curated, verified creators.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Relic</div>
          <div class="metric-value">Band V</div>
          <div class="metric-foot">Mythic-style relics – no gamble tickets, only premium packs.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn kickback</div>
          <div class="metric-value">5–10%</div>
          <div class="metric-foot">XP/Spawn routed back to the wallet per pack open.</div>
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
        Bubble-style view of creators, series and wallets. Think lightweight BubbleMaps for packs.
      </div>
      <div class="trading-card" style="margin-top:9px;">
        <div class="trading-card-head">
          <div>
            <div class="trading-card-title">Mesh nodes</div>
            <div class="trading-card-sub">
              Each deployed series becomes a node: TokenSeries, NFTSeries, Zora packs, XP modules.
            </div>
          </div>
          <span class="chip chip-planned">Map view</span>
        </div>
        <div class="trading-card-foot">
          v0.2 keeps this as UI-only – later we wire real topology and wallet clusters.
        </div>
      </div>
    </section>
  `;
}

/* CAMPAIGNS / QUESTS */

function renderCampaigns() {
  return `
    <section class="panel">
      <div class="panel-title">Campaigns</div>
      <div class="panel-sub">
        Creator-designed lanes – pull-based quests, leaderboard boosts and one-off prize pools.
      </div>

      <div class="trading-panel">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">SpawnEngine launch lane</div>
              <div class="trading-card-sub">
                Example: hit any Relic from Series #1 and auto-earn extra packs or Spawn tokens.
              </div>
            </div>
            <span class="chip chip-mesh">Preview</span>
          </div>
          <div class="trading-card-foot">
            Everything funded up-front by the creator, payouts handled by the mesh router.
          </div>
        </div>

        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Onboard invites</div>
              <div class="trading-card-sub">
                Invite friends to the app – each “alpha invite” can be tied to special quests.
              </div>
            </div>
            <span class="chip chip-planned">Onboard</span>
          </div>
          <div class="trading-card-foot">
            Think Rodeo-style referrals but wired into pack odds, XP and Creator bounty pots.
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
        Skeleton view for PnL and rarity stats across the whole mesh.
      </div>
      <div class="overview-grid" style="margin-top:9px;">
        <div class="metric-card">
          <div class="metric-label">Total packs (preview)</div>
          <div class="metric-value">12 543</div>
          <div class="metric-foot">Combined across all series.</div>
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
        Future full PNL for everything SpawnEngine touches – packs, swaps, bounties.
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
          <div class="metric-foot">Open packs / relics / series.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Win rate</div>
          <div class="metric-value">${pnlSummary.winRate}</div>
          <div class="metric-foot">Profitable pulls vs total.</div>
        </div>
      </div>

      <div style="margin-top:10px;font-size:10px;color:#9ca3af;">
        Last 7 mesh days (ETH-denominated, preview only):
      </div>
      <div class="pnl-chart">
        ${barsHtml}
      </div>
    </section>
  `;
}

/* CREATOR HUB */

function renderCreatorHub() {
  return `
    <section class="panel">
      <div class="panel-title">Creator hub</div>
      <div class="panel-sub">
        Where verified creators wire their packs into quests, bounties and on-chain miniapps.
      </div>

      <div class="creator-grid">
        <div class="creator-card">
          <div class="creator-label">Live bounties</div>
          <div class="creator-heading">
            Pull quests & pack hunts
            <span class="badge-small" style="margin-left:6px;">Preview</span>
          </div>
          <div class="creator-sub">
            Example: hit 3 Shards and 1 Ember in 20 packs → earn extra Spawn or pack drops.
            Later this will list real quests from verified creators.
          </div>
        </div>

        <div class="creator-card">
          <div class="creator-label">Creator miniapps</div>
          <div class="creator-heading">“Try my miniapp” lanes</div>
          <div class="creator-sub">
            Quest type where bounties are tied to using a creator’s onchain miniapp – mint,
            play, or interact once to qualify.
          </div>
        </div>

        <div class="creator-card">
          <div class="creator-label">Verification</div>
          <div class="creator-heading">Creator score & trust</div>
          <div class="creator-sub">
            Later: hook into Creator Score / Farcaster data so high-score creators get
            access to Crown/Relic bands and bigger reward pools.
          </div>
        </div>
      </div>
    </section>
  `;
}

/* SETTINGS */

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-title">Settings</div>
      <div class="panel-sub">
        Compact control room for wallets, modules and appearance – same vibe on web and miniapp.
      </div>

      <div class="trading-panel" style="margin-top:9px;">
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Wallets</div>
              <div class="trading-card-sub">
                Active: ${state.wallet ? state.wallet : "none"} · Total saved: ${
    state.wallets.length
  }.
              </div>
            </div>
          </div>
          <div class="trading-card-foot">
            Use “Connect more wallets” in the side menu to preview multi-wallet mesh.
          </div>
        </div>
        <div class="trading-card">
          <div class="trading-card-head">
            <div>
              <div class="trading-card-title">Creator modules</div>
              <div class="trading-card-sub">
                Factory, TokenSeries, Guard, UtilityRouter and future Zora/Farcaster modules.
              </div>
            </div>
          </div>
          <div class="trading-card-foot">
            SpawnEngine stays modular under the hood – this app is just the mesh UI.
          </div>
        </div>
      </div>
    </section>
  `;
}

/* daily tasks block – used only on Home */

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

/* boot */

init();