// Simple mock state
const state = {
  wallet: null,
  xp: 1575,
  spawn: 497,
  meshEvents: 9,
  activeTab: "overview",
  chat: [
    { from: "bot", text: "Welcome to Spawnbot. How can I help you build today?" }
  ]
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "profile", label: "Profile" },
  { id: "daily", label: "Daily" },
  { id: "trading", label: "Trading" },
  { id: "pull-lab", label: "Pull Lab" },
  { id: "chat", label: "Spawnbot" },
  { id: "settings", label: "Settings" }
];

const mockEvents = [
  { short: "pack_open", label: "0xA9…93 → Neon Fragments (Fragment)" },
  { short: "burn", label: "0x4B…1f → 5x Fragments → Core" },
  { short: "swap", label: "0xD2…90 → Shard Forge (Legendary)" },
  { short: "zora_buy", label: "0x91…ff → Base Relics (Epic)" },
  { short: "fc_cast", label: "@spawnengine casted new pack series" }
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

    <a href="https://zora.co/@spawniz" target="_blank" rel="noreferrer">
      Zora
    </a>

    <a href="https://farcaster.xyz/spawniz" target="_blank" rel="noreferrer">
      Farcaster
    </a>

    <a href="https://x.com/spawnizz" target="_blank" rel="noreferrer">
      X / Twitter
    </a>

    <a href="https://base.app/profile/0x4A9bBB6FC9602C53aC84D59d8A1C12c89274f7Da"
       target="_blank" rel="noreferrer">
      BaseApp (TBA)
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

// view router

function renderActiveView() {
  const main = document.getElementById("main-content");
  if (!main) return;

  switch (state.activeTab) {
    case "overview":
      main.innerHTML = renderOverview();
      break;
    case "profile":
      main.innerHTML = renderProfile();
      break;
    case "daily":
      main.innerHTML = renderDaily();
      break;
    case "trading":
      main.innerHTML = renderTrading();
      break;
    case "pull-lab":
      main.innerHTML = renderPullLab();
      break;
    case "chat":
      main.innerHTML = renderChat();
      wireChatInput();
      break;
    case "settings":
      main.innerHTML = renderSettings();
      break;
    default:
      main.innerHTML = "";
  }
}

/* ========== SPAWNBOT CHAT VIEW ========== */

function renderChat() {
  const bubbles = state.chat
    .map((msg) => {
      return `
        <div class="chat-bubble ${msg.from}">
          ${msg.text}
        </div>
      `;
    })
    .join("");

  return `
    <section class="panel">
      <div class="panel-title">Spawnbot</div>
      <div class="panel-sub">
        Talk to your engine. Create packs, modules, XP lanes & more.
      </div>

      <div class="chat-window">${bubbles}</div>

      <div class="chat-input-row">
        <input id="chat-input" class="chat-input" placeholder="Type a command..." />
        <button id="chat-send" class="chat-send">→</button>
      </div>
    </section>
  `;
}

function wireChatInput() {
  const input = document.getElementById("chat-input");
  const btn = document.getElementById("chat-send");

  if (!input || !btn) return;

  btn.addEventListener("click", () => sendChat());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendChat();
  });
}

function sendChat() {
  const input = document.getElementById("chat-input");
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = "";

  state.chat.push({ from: "user", text });

  state.chat.push({
    from: "bot",
    text: `I registered your request: "${text}". Soon I will be able to deploy modules automatically.`
  });

  renderActiveView();
}

/* ========== OTHER VIEWS (OVERVIEW, PROFILE, DAILY, etc) ========== */

function renderOverview() {
  return `
    <section class="panel">
      <div class="panel-title">Overview</div>
      <div class="panel-sub">Your layer on Base: packs · modules · XP · mesh activity</div>

      <div class="overview-grid">
        <div class="metric-card">
          <div class="metric-label">XP streak</div>
          <div class="metric-value">${state.xp}</div>
          <div class="metric-foot">Completing daily tasks extends it.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Spawn balance</div>
          <div class="metric-value">${state.spawn}</div>
          <div class="metric-foot">Mock rewards.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Today’s mesh</div>
          <div class="metric-value">${state.meshEvents}</div>
          <div class="metric-foot">Actual feeds coming soon.</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Modules</div>
          <div class="metric-value">4</div>
          <div class="metric-foot">Factory / Series / Guard / Router</div>
        </div>
      </div>
    </section>
  `;
}

function renderProfile() {
  return `
    <section class="panel">
      <div class="panel-title">Profile</div>
      <div class="panel-sub">Wallet identity & surfaces</div>

      <div class="trading-card">
        <div class="trading-card-head">
          <div>
            <div class="trading-card-title">@spawnengine</div>
            <div class="trading-card-sub">
              Layer-4 mesh identity (mock).
            </div>
          </div>
          <span class="chip chip-mesh">ONLINE</span>
        </div>
        <div class="trading-card-foot">
          Wallet: ${state.wallet ? state.wallet : "Disconnected"}
        </div>
      </div>
    </section>
  `;
}

function renderDaily() {
  return `
    <section class="panel">
      <div class="panel-title">Daily tasks</div>
      <div class="panel-sub">Simple mock streak & XP</div>

      <div class="task-list">
        <div class="task-header">
          <span>Today’s loop</span>
          <span style="color:#22c55e;">+250 XP</span>
        </div>

        <div class="task-items">
          <div class="task-item">
            <div class="task-left">
              <div class="task-dot"></div>
              <div>
                <div class="task-label-main">Open one test pack</div>
                <div class="task-label-sub">Triggers a mock event</div>
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
                <div class="task-label-sub">Post a cast</div>
              </div>
            </div>
            <div class="task-xp">+100 XP</div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderTrading() {
  return `
    <section class="panel">
      <div class="panel-title">Trading</div>
      <div class="panel-sub">Unified surfaces (mock)</div>
      <p style="opacity:0.5;margin-top:8px;">v0.4 UI only</p>
    </section>
  `;
}

function renderPullLab() {
  return `
    <section class="panel">
      <div class="panel-title">Pull Lab</div>
      <div class="panel-sub">Rarity ranges (mock)</div>
      <p style="opacity:0.5;margin-top:8px;">v0.4 UI only</p>
    </section>
  `;
}

function renderSettings() {
  return `
    <section class="panel">
      <div class="panel-title">Settings</div>
      <div class="panel-sub">Modules, wallets, surfaces (mock)</div>
      <p style="opacity:0.5;margin-top:8px;">v0.4 UI only</p>
    </section>
  `;
}

init();