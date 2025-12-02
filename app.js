// Minimal Mesh HUD logic – inga APIs förstörd layout, bara lokal mock

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupStreak();
  setupMeshLoad();
  setupEvents();
  setupWalletMock();
});

/* ---- TABS ---- */
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      document
        .querySelector(`.tab-panel[data-tab="${target}"]`)
        .classList.add("active");
    });
  });
}

/* ---- STREAK & XP MOCK ---- */
function setupStreak() {
  const streakEl = document.getElementById("streakDays");
  const leftEl = document.getElementById("streakLeft");
  const fillEl = document.getElementById("streakFill");
  const xpEl = document.getElementById("xpBalance");
  const checkBtn = document.getElementById("checkInBtn");

  let streak = 1;
  let xp = 1575;

  function render() {
    streakEl.textContent = streak;
    const left = Math.max(0, 7 - streak);
    leftEl.textContent = left;
    const pct = Math.max(0.12, Math.min(1, streak / 7));
    fillEl.style.width = `${pct * 100}%`;
    xpEl.textContent = xp.toLocaleString("sv-SE") + " XP";
  }

  checkBtn.addEventListener("click", () => {
    streak = Math.min(7, streak + 1);
    xp += 25;
    render();
    pulseButton(checkBtn);
  });

  render();
}

function pulseButton(btn) {
  btn.classList.add("pulse");
  setTimeout(() => btn.classList.remove("pulse"), 250);
}

/* ---- MESH LOAD MOCK ---- */
function setupMeshLoad() {
  const marker = document.getElementById("loadMarker");
  const refresh = document.getElementById("refreshMeshBtn");

  function randomPos() {
    // 0..100% inside bar
    const pct = 20 + Math.random() * 60; // håll den oftast i mitten
    marker.style.left = `${pct}%`;
  }

  refresh.addEventListener("click", () => {
    randomPos();
    pulseButton(refresh);
  });

  randomPos();
}

/* ---- EVENT LIST MOCK ---- */
const EVENT_POOL = [
  "Spawn mesh ticked XP lane for 3 wallets.",
  "Creator mesh synced pack odds from VibeMarket.",
  "Local shard burn simulated 3× rare → 5 pack test.",
  "New wallet attached to mesh HUD.",
  "Base gas snapshot cached for Pull Lab runs.",
  "XP faucet pinged – ready for daily streak.",
  "Mesh router simulated burn ladder for fragments.",
];

function setupEvents() {
  const list = document.getElementById("eventList");
  const shuffleBtn = document.getElementById("shuffleEvents");

  function render() {
    const now = Date.now();
    const items = [];
    for (let i = 0; i < 5; i++) {
      const msg =
        EVENT_POOL[Math.floor(Math.random() * EVENT_POOL.length)];
      const mins = 1 + i * 3;
      items.push({ msg, minsAgo: mins });
    }
    list.innerHTML = items
      .map(
        (it) => `
      <li>
        <div class="event-main">
          <div>${it.msg}</div>
          <div class="event-tag">Mesh event</div>
        </div>
        <span class="event-time">${it.minsAgo}m</span>
      </li>`
      )
      .join("");
  }

  shuffleBtn.addEventListener("click", () => {
    render();
    pulseButton(shuffleBtn);
  });

  render();
}

/* ---- WALLET MOCK (ingen riktig Web3 än) ---- */
function setupWalletMock() {
  const btn = document.getElementById("connectWalletBtn");
  const label = document.getElementById("walletShort");

  let connected = false;
  let addr = "0xSpawnMeshDemo0000000000000000000000000000";

  function short(a) {
    return a.slice(0, 6) + "…" + a.slice(-4);
  }

  function render() {
    if (!connected) {
      label.textContent = "No wallet connected";
      btn.textContent = "Connect wallet";
    } else {
      label.textContent = short(addr);
      btn.textContent = "Disconnect";
    }
  }

  btn.addEventListener("click", () => {
    connected = !connected;
    render();
  });

  render();
}