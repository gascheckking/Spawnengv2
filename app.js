document.addEventListener("DOMContentLoaded", () => {
  const app = document.getElementById("app");

  // ---------- RENDER MARKUP ----------

  app.innerHTML = `
    <div class="app-shell">
      <div class="app-status-bar"></div>

      <div class="app-top-nav">
        <div class="app-top-title">SpawnEngine · Mesh HUD v0.2</div>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="theme-dot-row">
            <button class="theme-dot default active" data-theme="default" aria-label="Default theme"></button>
            <button class="theme-dot blue" data-theme="blue" aria-label="Blue theme"></button>
            <button class="theme-dot emerald" data-theme="emerald" aria-label="Emerald theme"></button>
            <button class="theme-dot magenta" data-theme="magenta" aria-label="Magenta theme"></button>
          </div>
          <button class="app-icon-button" id="menu-toggle" aria-label="Open menu">
            <span>≡</span>
          </button>
        </div>
      </div>

      <div class="mesh-header-card">
        <div class="mesh-header-main">
          <div class="mesh-logo">
            <span>SE</span>
          </div>
          <div class="mesh-title-block">
            <h1>SpawnEngine – Mesh HUD</h1>
            <p>Modular mesh for packs, XP, bounties & creator modules.</p>
          </div>
          <div class="mesh-header-right">
            <div class="mesh-chip-row">
              <div class="mesh-chip">Base · Pack ecosystems</div>
              <div class="mesh-chip mesh-chip--green">Farcaster ready</div>
            </div>
            <button class="btn-connect" id="wallet-btn">Connect</button>
          </div>
        </div>

        <div class="mesh-header-meta">
          <div class="mesh-meta-pill">
            <span class="mesh-pill-label">Gas</span>
            <span class="mesh-pill-value" id="gas-value">~0.24 gwei est.</span>
          </div>
          <div class="mesh-meta-pill">
            <span class="mesh-pill-label">Mode</span>
            <span class="mesh-pill-value" id="mode-value">Single mesh</span>
          </div>
          <div class="mesh-meta-pill">
            <span class="mesh-pill-label">Sync</span>
            <span class="mesh-pill-value" id="sync-value">Local mock</span>
          </div>
          <div class="mesh-meta-pill">
            <span class="mesh-pill-label">Wallet</span>
            <span class="mesh-pill-value mesh-pill-value--wallet" id="wallet-label">No wallet connected</span>
          </div>
        </div>
      </div>

      <div class="main-tabs" id="main-tabs">
        <button class="tab-pill active" data-tab="overview">Overview</button>
        <button class="tab-pill" data-tab="mesh">Mesh</button>
        <button class="tab-pill" data-tab="packs">Packs</button>
        <button class="tab-pill" data-tab="pulllab">Pull Lab</button>
        <button class="tab-pill" data-tab="wallets">Wallets</button>
        <button class="tab-pill" data-tab="quests">Quests</button>
      </div>

      <div id="tab-overview">
        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Mesh snapshot</div>
              <div class="card-subtitle">Today</div>
            </div>
            <div class="badge-soft">Single player mesh</div>
          </div>

          <div class="snapshot-grid">
            <div class="snapshot-stat">
              <div class="snapshot-label">XP balance</div>
              <div class="snapshot-value" id="xp-balance">1 575 XP</div>
            </div>
            <div class="snapshot-stat">
              <div class="snapshot-label">Spawn token</div>
              <div class="snapshot-value" id="spawn-balance">497 SPN</div>
            </div>
          </div>

          <div class="streak-label-row">
            <span>Daily streak</span>
            <span><strong id="streak-days">1 day</strong></span>
          </div>
          <div class="streak-bar">
            <div class="streak-bar-fill" id="streak-fill"></div>
          </div>
          <div class="streak-caption" id="streak-caption">
            Keep the streak for 6 more days for a full weekly run.
          </div>
          <button class="btn-streak" id="streak-btn">Check-in</button>
        </div>

        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Mesh load</div>
              <div class="card-subtitle">How busy SpawnEngine feels right now.</div>
            </div>
            <button class="badge-soft" id="mesh-refresh-btn">Refresh pulse</button>
          </div>

          <div class="mesh-load-meter">
            <div class="mesh-load-mask"></div>
            <div class="mesh-load-indicator" id="mesh-indicator"></div>
          </div>
          <div class="mesh-load-scale">
            <span>Quiet</span>
            <span>Active</span>
            <span>Wild</span>
          </div>
        </div>

        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Online collectors</div>
              <div class="card-subtitle">Local preview of wallets “near” your mesh.</div>
            </div>
            <div class="badge-soft">Wallet bubbles</div>
          </div>

          <div class="collectors-list" id="collector-list"></div>
        </div>

        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Today’s mesh events</div>
              <div class="card-subtitle">Pack opens, burns, swaps & Zora buys.</div>
            </div>
            <div class="badge-soft">Activity feed</div>
          </div>

          <div class="events-list" id="events-list"></div>
        </div>
      </div>

      <div id="tab-mesh" style="display:none;">
        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Mesh overview</div>
              <div class="card-subtitle">Rough sketch of how the onchain mesh will look.</div>
            </div>
          </div>
          <p class="tab-placeholder">
            Mesh view will show Bubble maps, creator clusters and where packs & XP
            are moving in real time. Current version is a static preview.
          </p>
        </div>
      </div>

      <div id="tab-packs" style="display:none;">
        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Packs / inventory</div>
              <div class="card-subtitle">Opened hits, sealed packs & grails in one list.</div>
            </div>
          </div>
          <p class="tab-placeholder">
            This section will plug into SpawnEngine pack contracts and show
            real pulls per wallet. For now it’s a visual shell ready for wiring.
          </p>
        </div>
      </div>

      <div id="tab-pulllab" style="display:none;">
        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Pull Lab · Luck engine</div>
              <div class="card-subtitle">Simulation layer for streaks, entropy & bounties.</div>
            </div>
          </div>
          <p class="tab-placeholder">
            Pull Lab will host experiments: luck meters, entropy tests,
            “open N packs” quests and creator bounties hooked to real contracts.
          </p>
        </div>
      </div>

      <div id="tab-wallets" style="display:none;">
        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Wallet mesh</div>
              <div class="card-subtitle">Preview of multi-wallet mode.</div>
            </div>
          </div>
          <p class="tab-placeholder">
            Multi-wallet mesh lets you drive the HUD from different addresses:
            sniping wallet, main vault, creator treasury, etc. UX shell is ready;
            next step is real connections.
          </p>
        </div>
      </div>

      <div id="tab-quests" style="display:none;">
        <div class="card">
          <div class="card-header-row">
            <div>
              <div class="card-title">Creator quests / bounties</div>
              <div class="card-subtitle">High-signal tasks from verified creators.</div>
            </div>
          </div>
          <p class="tab-placeholder">
            Quest layer will surface pack-based bounties (pull X, burn Y, try
            this mini-app, follow a creator mesh). This view is the UX frame the
            onchain module will plug into.
          </p>
        </div>
      </div>

      <div class="app-footer">
        Built with <strong>SpawnEngine</strong> · Mesh HUD v0.2 ·
        <a href="https://spawn-engine.vercel.app" target="_blank" rel="noreferrer">Legacy preview v1</a> ·
        <a href="https://warpcast.com/spawniz" target="_blank" rel="noreferrer">Farcaster</a>
      </div>
    </div>

    <div class="side-menu-backdrop" id="side-menu-backdrop"></div>
    <div class="side-menu" id="side-menu">
      <div class="side-menu-header">
        <span>Mesh settings</span>
        <button class="side-menu-close" id="menu-close">×</button>
      </div>

      <div>
        <div class="side-menu-section-title">Themes</div>
        <div class="side-menu-list">
          <div class="side-menu-item">Default · deep navy</div>
          <div class="side-menu-item">Blue glow · Rodeo-ish</div>
          <div class="side-menu-item">Emerald mesh · XP jungle</div>
          <div class="side-menu-item">Magenta aura · late-night mode</div>
        </div>
      </div>

      <div>
        <div class="side-menu-section-title">Creator tools</div>
        <div class="side-menu-list">
          <div class="side-menu-item">Open SpawnEngine docs (soon)</div>
          <div class="side-menu-item">Spawn pack factory (soon)</div>
          <div class="side-menu-item">Creator bounties dashboard (soon)</div>
        </div>
      </div>

      <div>
        <div class="side-menu-section-title">About this HUD</div>
        <div class="side-menu-list">
          <div class="side-menu-item">
            Mesh HUD is a standalone prototype for The Base App / Farcaster style
            onchain activity dashboard – ready for real contracts & APIs.
          </div>
        </div>
      </div>
    </div>

    <div class="streak-burst" id="streak-burst">
      <div class="streak-burst-inner">
        <div class="streak-orb"></div>
        <span>Daily streak up! XP orbs fly across the mesh.</span>
      </div>
    </div>
  `;

  // ---------- STATE ----------

  const state = {
    connected: false,
    walletAddress: null,
    streakDays: 1,
    meshLoad: 0.35,
    collectors: [
      { addr: "0xA9c9…91f3", status: "Hot pulls" },
      { addr: "rainbow.vibe", status: "Swap spree" },
      { addr: "0x7BE…c101", status: "Burning commons" },
      { addr: "spawniz.eth", status: "Watching grails" },
      { addr: "0xF3D…88aa", status: "Idle" }
    ],
    events: [
      {
        kind: "pack_open",
        desc: "0xA93…e1c2 → Neon Fragments (Rare)",
        time: "10s ago"
      },
      {
        kind: "burn",
        desc: "0x4B1…aa32 → Void Keys (Common)",
        time: "25s ago"
      },
      {
        kind: "swap",
        desc: "0xD29…b81d → Shard Forge (Legendary)",
        time: "1m ago"
      },
      {
        kind: "zora_buy",
        desc: "0x91F…ccd0 → Base Relics (Epic)",
        time: "2m ago"
      }
    ]
  };

  // load streak from localStorage if present
  const savedStreak = Number.parseInt(localStorage.getItem("spawnMeshStreak") || "1", 10);
  if (!Number.isNaN(savedStreak) && savedStreak > 0) {
    state.streakDays = savedStreak;
  }

  // ---------- ELEMENT HOOKS ----------

  const walletBtn = document.getElementById("wallet-btn");
  const walletLabel = document.getElementById("wallet-label");

  const tabsRoot = document.getElementById("main-tabs");
  const tabButtons = tabsRoot.querySelectorAll(".tab-pill");

  const streakBtn = document.getElementById("streak-btn");
  const streakDaysEl = document.getElementById("streak-days");
  const streakFillEl = document.getElementById("streak-fill");
  const streakCaptionEl = document.getElementById("streak-caption");
  const streakBurstEl = document.getElementById("streak-burst");

  const meshIndicator = document.getElementById("mesh-indicator");
  const meshRefreshBtn = document.getElementById("mesh-refresh-btn");

  const collectorsListEl = document.getElementById("collector-list");
  const eventsListEl = document.getElementById("events-list");

  const themeDots = document.querySelectorAll(".theme-dot");

  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const menuBackdrop = document.getElementById("side-menu-backdrop");
  const sideMenu = document.getElementById("side-menu");

  // ---------- RENDER HELPERS ----------

  function formatStreak() {
    if (state.streakDays === 1) return "1 day";
    return `${state.streakDays} days`;
  }

  function streakProgress() {
    const maxDays = 7;
    const ratio = Math.min(state.streakDays / maxDays, 1);
    return 15 + ratio * 75; // between 15% and 90%
  }

  function updateStreakUI() {
    streakDaysEl.textContent = formatStreak();
    streakFillEl.style.width = `${streakProgress()}%`;
    const daysLeft = Math.max(0, 7 - state.streakDays);
    streakCaptionEl.textContent =
      daysLeft > 0
        ? `Keep the streak for ${daysLeft} more day${daysLeft === 1 ? "" : "s"} for a full weekly run.`
        : "Full weekly run completed – mesh is fully charged.";
  }

  function updateMeshLoadUI() {
    const position = 5 + state.meshLoad * 90; // 5–95%
    meshIndicator.style.transform = `translateX(${position}%)`;
  }

  function renderCollectors() {
    collectorsListEl.innerHTML = "";
    state.collectors.forEach((c) => {
      const row = document.createElement("div");
      row.className = "collector-pill";
      row.innerHTML = `
        <div class="collector-left">
          <div class="collector-dot"></div>
          <div class="collector-address">${c.addr}</div>
        </div>
        <div class="collector-status">${c.status}</div>
      `;
      collectorsListEl.appendChild(row);
    });
  }

  function renderEvents() {
    eventsListEl.innerHTML = "";
    state.events.forEach((e) => {
      const row = document.createElement("div");
      row.className = "event-row";
      row.innerHTML = `
        <div class="event-kind">${e.kind}</div>
        <div class="event-body">
          <div class="event-left">${e.desc}</div>
          <div class="event-right">${e.time}</div>
        </div>
      `;
      eventsListEl.appendChild(row);
    });
  }

  function setTheme(themeKey) {
    const body = document.body;
    body.classList.remove("theme-default", "theme-blue", "theme-emerald", "theme-magenta");
    switch (themeKey) {
      case "blue":
        body.classList.add("theme-blue");
        break;
      case "emerald":
        body.classList.add("theme-emerald");
        break;
      case "magenta":
        body.classList.add("theme-magenta");
        break;
      default:
        body.classList.add("theme-default");
    }
    themeDots.forEach((dot) => {
      dot.classList.toggle("active", dot.dataset.theme === themeKey);
    });
    localStorage.setItem("spawnMeshTheme", themeKey);
  }

  // ---------- INITIAL RENDER ----------

  updateStreakUI();
  updateMeshLoadUI();
  renderCollectors();
  renderEvents();

  const savedTheme = localStorage.getItem("spawnMeshTheme");
  if (savedTheme) {
    setTheme(savedTheme);
  }

  // ---------- EVENTS ----------

  // wallet connect (mock)
  walletBtn.addEventListener("click", () => {
    state.connected = !state.connected;

    if (state.connected) {
      // mock address
      state.walletAddress = "0xSpawn…mesh";
      walletLabel.textContent = state.walletAddress;
      walletBtn.textContent = "Disconnect";
    } else {
      state.walletAddress = null;
      walletLabel.textContent = "No wallet connected";
      walletBtn.textContent = "Connect";
    }
  });

  // tabs
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      tabButtons.forEach((b) => b.classList.toggle("active", b === btn));

      const ids = ["overview", "mesh", "packs", "pulllab", "wallets", "quests"];
      ids.forEach((id) => {
        const el = document.getElementById(`tab-${id}`);
        if (el) {
          el.style.display = id === tab ? "block" : "none";
        }
      });
    });
  });

  // streak check-in
  streakBtn.addEventListener("click", () => {
    state.streakDays += 1;
    localStorage.setItem("spawnMeshStreak", String(state.streakDays));
    updateStreakUI();

    // simple burst animation
    streakBurstEl.classList.add("active");
    setTimeout(() => {
      streakBurstEl.classList.remove("active");
    }, 800);
  });

  // mesh refresh
  meshRefreshBtn.addEventListener("click", () => {
    // random between 0–1, but bias a bit toward middle
    const r = Math.random();
    state.meshLoad = 0.15 + r * 0.75;
    updateMeshLoadUI();
  });

  // theme switches
  themeDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const key = dot.dataset.theme || "default";
      setTheme(key);
    });
  });

  // side menu
  function openMenu() {
    sideMenu.classList.add("open");
    menuBackdrop.classList.add("open");
  }
  function closeMenu() {
    sideMenu.classList.remove("open");
    menuBackdrop.classList.remove("open");
  }

  menuToggle.addEventListener("click", openMenu);
  menuClose.addEventListener("click", closeMenu);
  menuBackdrop.addEventListener("click", closeMenu);
});