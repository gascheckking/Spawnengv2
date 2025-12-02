// SpawnEngine2 – vanilla JS app logic

// Small helpers
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function shortAddr(x = "") {
  if (!x) return "";
  return x.length > 10 ? `${x.slice(0, 6)}…${x.slice(-4)}` : x;
}

function normRarity(r) {
  const n = String(r || "").toUpperCase();
  if (["4", "LEGENDARY"].includes(n)) return "LEGENDARY";
  if (["3", "EPIC"].includes(n)) return "EPIC";
  if (["2", "RARE"].includes(n)) return "RARE";
  if (["1", "COMMON"].includes(n)) return "COMMON";
  return ["COMMON", "RARE", "EPIC", "LEGENDARY"].includes(n) ? n : "COMMON";
}

function starsFor(r) {
  const n = normRarity(r);
  if (n === "LEGENDARY") return "★★★★";
  if (n === "EPIC") return "★★★";
  if (n === "RARE") return "★★";
  return "★";
}

/* ---------- MOCK DATA (packs & pulls) ---------- */

const MOCK_PACKS = [
  {
    id: "pack-1",
    name: "Tiny Legends: Neon Foils",
    collectionName: "Tiny Legends",
    rarity: "RARE",
    creator: "0xSpawniz",
    verified: true,
    image:
      "https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://vibechain.com/market",
  },
  {
    id: "pack-2",
    name: "Glitch Totems – Series 1",
    collectionName: "GlitchTotems",
    rarity: "EPIC",
    creator: "0xVibeArtist",
    verified: true,
    image:
      "https://images.pexels.com/photos/3404200/pexels-photo-3404200.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://vibechain.com/market",
  },
  {
    id: "pack-3",
    name: "Base Bots Booster",
    collectionName: "Base Bots",
    rarity: "COMMON",
    creator: "0xBaseBuilder",
    verified: false,
    image:
      "https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://vibechain.com/market",
  },
  {
    id: "pack-4",
    name: "Foil Realms: Prism Veil",
    collectionName: "Foil Realms",
    rarity: "LEGENDARY",
    creator: "0xSpawniz",
    verified: true,
    image:
      "https://images.pexels.com/photos/799443/pexels-photo-799443.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://vibechain.com/market",
  },
  {
    id: "pack-5",
    name: "Cabal Deluxe – Balatro Edition",
    collectionName: "Cabal Deluxe",
    rarity: "EPIC",
    creator: "0xCabalDev",
    verified: false,
    image:
      "https://images.pexels.com/photos/799420/pexels-photo-799420.jpeg?auto=compress&cs=tinysrgb&w=800",
    url: "https://vibechain.com/market",
  },
];

const MOCK_PULLS = [
  {
    id: "pull-1",
    owner: "0xSpawniz",
    collection: "Foil Realms",
    tokenId: "143",
    rarity: "LEGENDARY",
    ts: Date.now() - 2 * 60 * 1000,
  },
  {
    id: "pull-2",
    owner: "0xVibeLord",
    collection: "GlitchTotems",
    tokenId: "88",
    rarity: "EPIC",
    ts: Date.now() - 8 * 60 * 1000,
  },
  {
    id: "pull-3",
    owner: "0xFarmer",
    collection: "Tiny Legends",
    tokenId: "312",
    rarity: "COMMON",
    ts: Date.now() - 20 * 60 * 1000,
  },
  {
    id: "pull-4",
    owner: "0xBaseWhale",
    collection: "Base Bots",
    tokenId: "7",
    rarity: "RARE",
    ts: Date.now() - 45 * 60 * 1000,
  },
];

let packs = [...MOCK_PACKS];
let pulls = [...MOCK_PULLS];

let currentWallet = "";
let currentTheme = "dark";
let forTrade = [];

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTabs();
  initWallet();
  initFilters();
  initForTrade();
  initActivity();
  initGas();

  renderPacks();
  renderVerified();
  renderTicker();
  renderActivity();
  renderProfile();
});

/* ---------- THEME ---------- */
function initTheme() {
  const saved = localStorage.getItem("spawnengine_theme");
  currentTheme = saved === "light" ? "light" : "dark";
  applyTheme();

  const btnHeader = qs("#theme-toggle-btn");
  const btnSettings = qs("#settings-theme-toggle");
  const settingsLabel = qs("#settings-theme-label");

  const updateLabels = () => {
    if (btnHeader) {
      btnHeader.textContent = currentTheme === "dark" ? "Dark" : "Light";
    }
    if (settingsLabel) {
      settingsLabel.textContent = `Current: ${currentTheme}`;
    }
  };

  updateLabels();

  const toggle = () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("spawnengine_theme", currentTheme);
    applyTheme();
    updateLabels();
  };

  btnHeader && btnHeader.addEventListener("click", toggle);
  btnSettings && btnSettings.addEventListener("click", toggle);
}

function applyTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme);
}

/* ---------- TABS ---------- */
function initTabs() {
  const tabs = qsa(".tab");
  const panels = qsa(".tab-panel");

  tabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      tabs.forEach((t) => t.classList.remove("active"));
      btn.classList.add("active");

      panels.forEach((p) => {
        if (p.dataset.tab === tab) {
          p.style.display = "";
        } else {
          p.style.display = "none";
        }
      });
    });
  });
}

/* ---------- WALLET ---------- */
function initWallet() {
  const connectBtn = qs("#connect-btn");
  const walletPill = qs("#wallet-pill");
  const forTradeLabel = qs("#for-trade-wallet-label");
  const profileWallet = qs("#profile-wallet");

  connectBtn &&
    connectBtn.addEventListener("click", async () => {
      if (!window.ethereum) {
        alert("No injected wallet found (MetaMask/Rabby).");
        return;
      }
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const addr = accounts?.[0];
        if (!addr) return;
        currentWallet = addr;
        const short = shortAddr(addr);
        if (walletPill) walletPill.textContent = short;
        if (forTradeLabel) forTradeLabel.textContent = short;
        if (profileWallet) profileWallet.textContent = short;
        connectBtn.textContent = "Connected";
        connectBtn.classList.add("ghost");
        renderProfile();
      } catch (e) {
        console.error(e);
        alert("Connection failed");
      }
    });
}

/* ---------- FILTERS / MARKETPLACE ---------- */
function initFilters() {
  const search = qs("#search-input");
  const raritySel = qs("#rarity-select");
  const verifiedOnly = qs("#verified-only");

  const apply = () => {
    renderPacks();
    renderVerified();
  };

  search && search.addEventListener("input", apply);
  raritySel && raritySel.addEventListener("change", apply);
  verifiedOnly && verifiedOnly.addEventListener("change", apply);
}

function renderPacks() {
  const grid = qs("#packs-grid");
  if (!grid) return;

  const search = qs("#search-input")?.value.trim().toLowerCase() || "";
  const raritySel = qs("#rarity-select")?.value || "ALL";
  const verifiedOnly = !!qs("#verified-only")?.checked;

  const filtered = packs.filter((p) => {
    const rn = normRarity(p.rarity);
    const passQ =
      !search ||
      p.name.toLowerCase().includes(search) ||
      p.collectionName.toLowerCase().includes(search) ||
      String(p.creator || "").toLowerCase().includes(search);
    const passR = raritySel === "ALL" || rn === raritySel;
    const passV = !verifiedOnly || p.verified === true;
    return passQ && passR && passV;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="card">No packs found.</div>`;
    return;
  }

  grid.innerHTML = filtered
    .map((p) => {
      const rarity = normRarity(p.rarity);
      const vIcon = p.verified
        ? `<span class="badge">Verified</span>`
        : "";
      const img = p.image
        ? `<img src="${p.image}" alt="" class="pack-thumb" />`
        : `<div class="pack-thumb"></div>`;
      return `
        <a href="${p.url}" target="_blank" rel="noreferrer" class="card pack-card">
          ${img}
          <div class="pack-meta">
            <div class="row-between">
              <div class="title truncate">${p.name}</div>
              <span class="badge">${rarity}</span>
            </div>
            <div class="muted truncate">${
              p.collectionName
            } • ${shortAddr(p.creator || "")}</div>
            <div class="muted" style="margin-top:4px; font-size:11px;">
              ${vIcon}
            </div>
          </div>
        </a>
      `;
    })
    .join("");
}

function renderVerified() {
  const grid = qs("#verified-grid");
  if (!grid) return;
  const verified = packs.filter((p) => p.verified).slice(0, 8);

  if (!verified.length) {
    grid.innerHTML = `<div class="card">No verified packs yet.</div>`;
    return;
  }

  grid.innerHTML = verified
    .map((p) => {
      const img = p.image
        ? `<img src="${p.image}" alt="" class="pack-thumb small" />`
        : `<div class="pack-thumb small"></div>`;
      return `
        <a href="${p.url}" target="_blank" rel="noreferrer" class="card row pack-card-small">
          ${img}
          <div class="grow">
            <div class="title truncate">${p.name}</div>
            <div class="muted truncate">${p.collectionName}</div>
          </div>
          <span class="badge">${normRarity(p.rarity)}</span>
        </a>
      `;
    })
    .join("");
}

/* ---------- TICKER ---------- */
function renderTicker() {
  const t = qs("#ticker");
  if (!t) return;

  const items = pulls.length ? pulls : MOCK_PULLS;
  const chips = items
    .map((i) => {
      return `<div class="ticker-chip">${shortAddr(
        i.owner
      )} pulled ${normRarity(i.rarity)} in ${i.collection} #${i.tokenId}</div>`;
    })
    .join("");

  // duplicate for smooth loop
  t.innerHTML = chips + chips;
}

/* ---------- ACTIVITY ---------- */
function initActivity() {
  const btn = qs("#refresh-activity-btn");
  btn &&
    btn.addEventListener("click", () => {
      // just reshuffle mock pulls for now
      pulls = [...pulls].sort(() => Math.random() - 0.5);
      renderActivity();
      renderTicker();
    });
}

function renderActivity() {
  const container = qs("#activity-cards");
  if (!container) return;

  if (!pulls.length) {
    container.innerHTML = `<div class="card">No recent pulls.</div>`;
    return;
  }

  const now = Date.now();
  const fmtAgo = (ts) => {
    const diff = Math.max(0, now - ts);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const h = Math.floor(mins / 60);
    return `${h} h ago`;
  };

  container.innerHTML = pulls
    .slice(0, 40)
    .map((p) => {
      return `
      <div class="card activity-item">
        <div class="activity-icon">📦</div>
        <div class="activity-body">
          <div class="activity-title">
            ${shortAddr(p.owner)} opened ${p.collection} #${p.tokenId}
          </div>
          <div class="activity-sub">
            Rarity: ${normRarity(p.rarity)} • ${starsFor(p.rarity)}
          </div>
        </div>
        <div class="activity-time">${fmtAgo(p.ts)}</div>
      </div>
    `;
    })
    .join("");
}

/* ---------- FOR TRADE (local) ---------- */
function initForTrade() {
  try {
    const raw = localStorage.getItem("spawnengine_forTrade");
    forTrade = raw ? JSON.parse(raw) : [];
  } catch {
    forTrade = [];
  }

  const nameInput = qs("#ft-name");
  const rarityInput = qs("#ft-rarity");
  const contractInput = qs("#ft-contract");
  const tokenInput = qs("#ft-tokenid");
  const addBtn = qs("#ft-add-btn");

  const save = () => {
    try {
      localStorage.setItem("spawnengine_forTrade", JSON.stringify(forTrade));
    } catch (e) {
      console.error(e);
    }
    renderForTrade();
    renderProfile();
  };

  addBtn &&
    addBtn.addEventListener("click", () => {
      const name = nameInput?.value.trim() || "";
      const rarity = rarityInput?.value || "COMMON";
      const contract = contractInput?.value.trim() || "";
      const tokenId = tokenInput?.value.trim() || "";

      if (!name && !contract) return;

      const entry = {
        id: `${contract || "local"}-${tokenId || Date.now()}-${Math.random()}`,
        name,
        rarity: normRarity(rarity),
        contract,
        tokenId,
      };
      forTrade.push(entry);

      if (nameInput) nameInput.value = "";
      if (contractInput) contractInput.value = "";
      if (tokenInput) tokenInput.value = "";
      rarityInput && (rarityInput.value = "COMMON");

      save();
    });

  renderForTrade();
}

function renderForTrade() {
  const list = qs("#for-trade-list");
  if (!list) return;

  if (!forTrade.length) {
    list.innerHTML = `<div class="card">No items yet. Add something to your trade list.</div>`;
    return;
  }

  list.innerHTML = forTrade
    .map((i) => {
      return `
      <div class="card">
        <div class="row-between">
          <div class="title truncate">${i.name || "Unnamed"}</div>
          <span class="badge">${normRarity(i.rarity)}</span>
        </div>
        <div class="muted" style="font-size:12px; margin:4px 0;">
          ${i.contract ? shortAddr(i.contract) : "Local"} • #${
        i.tokenId || "—"
      }
        </div>
        <div class="row" style="margin-top:6px; justify-content:flex-end;">
          <button class="btn ghost btn-remove" data-id="${i.id}">Remove</button>
        </div>
      </div>
    `;
    })
    .join("");

  qsa(".btn-remove", list).forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      forTrade = forTrade.filter((x) => x.id !== id);
      try {
        localStorage.setItem("spawnengine_forTrade", JSON.stringify(forTrade));
      } catch (e) {
        console.error(e);
      }
      renderForTrade();
      renderProfile();
    });
  });
}

/* ---------- PROFILE ---------- */
function renderProfile() {
  const xpEl = qs("#profile-xp");
  const streakEl = qs("#profile-streak");
  const openedEl = qs("#profile-opened");
  const ftCountEl = qs("#profile-fortrade-count");

  // Just placeholders / mock logic
  const mockXP = 120 + forTrade.length * 5;
  const mockStreak = 3 + (currentWallet ? 2 : 0);
  const mockOpened = pulls.length;

  if (xpEl) xpEl.textContent = `${mockXP} XP`;
  if (streakEl) streakEl.textContent = `${mockStreak} days`;
  if (openedEl) openedEl.textContent = String(mockOpened);
  if (ftCountEl) ftCountEl.textContent = String(forTrade.length);
}

/* ---------- GAS MINI-WIDGET ---------- */
const gasState = {
  ethereum: 9.2,
  base: 0.15,
  optimism: 1.2,
};

function initGas() {
  updateGas();
  setInterval(updateGas, 4000);
}

function simulateGasChange(value) {
  const change = (Math.random() - 0.5) * 0.3; // lite fladdrigt
  const next = Math.max(0, value + change);
  return Number(next.toFixed(2));
}

function updateGas() {
  const ids = ["ethereum", "base", "optimism"];
  ids.forEach((net) => {
    const oldVal = gasState[net];
    const newVal = simulateGasChange(oldVal);
    gasState[net] = newVal;

    const el = qs(`#gas-${net}`);
    if (!el) return;

    el.textContent = `${newVal} gwei`;

    // trend färg
    if (newVal > oldVal) {
      el.classList.add("gas-up");
      el.classList.remove("gas-down", "gas-stable");
    } else if (newVal < oldVal) {
      el.classList.add("gas-down");
      el.classList.remove("gas-up", "gas-stable");
    } else {
      el.classList.add("gas-stable");
      el.classList.remove("gas-up", "gas-down");
    }
  });

  const upd = qs("#gas-updated");
  if (upd) {
    const now = new Date();
    upd.textContent =
      "Updated: " +
      now.toLocaleString("sv-SE", {
        hour12: false,
        timeZone: "Europe/Stockholm",
      });
  }
}