// app.js

// ---- STATE ----
let currentWallet = "";
let currentTheme = "dark";

let packs = [];      // marketplace packs
let pulls = [];      // recent pulls
let forTrade = [];   // local for-trade list

// ---- UTIL ----
function short(addr = "") {
  if (!addr) return "";
  return addr.length > 10 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

function normRarity(r) {
  const n = String(r || "").toUpperCase();
  if (["4", "LEGENDARY"].includes(n)) return "LEGENDARY";
  if (["3", "EPIC"].includes(n)) return "EPIC";
  if (["2", "RARE"].includes(n)) return "RARE";
  if (["1", "COMMON"].includes(n)) return "COMMON";
  return ["COMMON", "RARE", "EPIC", "LEGENDARY"].includes(n) ? n : "COMMON";
}

function stars(r) {
  const n = normRarity(r);
  if (n === "LEGENDARY") return "★★★★";
  if (n === "EPIC") return "★★★";
  if (n === "RARE") return "★★";
  return "★";
}

function loadForTrade() {
  try {
    const raw = localStorage.getItem("spawnengine-for-trade");
    forTrade = raw ? JSON.parse(raw) : [];
  } catch {
    forTrade = [];
  }
}

function saveForTrade() {
  try {
    localStorage.setItem("spawnengine-for-trade", JSON.stringify(forTrade));
  } catch {
    // ignore
  }
}

// ---- MOCK DATA ----
function initMockData() {
  packs = [
    {
      id: "p1",
      name: "FOIL REALMS — Genesis Pack",
      creator: "spawniz.eth",
      rarity: "LEGENDARY",
      verified: true,
      image: "",
      url: "https://vibechain.com/market"
    },
    {
      id: "p2",
      name: "Tiny Legends — Booster S1",
      creator: "0xMintArtist",
      rarity: "EPIC",
      verified: true,
      image: "",
      url: "https://vibechain.com/market"
    },
    {
      id: "p3",
      name: "GlitchTotems — Chaos Box",
      creator: "0xGlitch",
      rarity: "RARE",
      verified: false,
      image: "",
      url: "https://vibechain.com/market"
    },
    {
      id: "p4",
      name: "BaseTrix — Demo Pack",
      creator: "0xBaseCaster",
      rarity: "COMMON",
      verified: false,
      image: "",
      url: "https://vibechain.com/market"
    }
  ];

  pulls = [
    {
      id: "o1",
      owner: "0x1234deadbeef1234dead",
      collection: "FOIL REALMS",
      tokenId: 7,
      rarity: "LEGENDARY",
      ts: Date.now() - 1000 * 60 * 2
    },
    {
      id: "o2",
      owner: "0x9999aaaa5555bbbbcccc",
      collection: "Tiny Legends",
      tokenId: 145,
      rarity: "EPIC",
      ts: Date.now() - 1000 * 60 * 15
    },
    {
      id: "o3",
      owner: "0xspawniz000000000000",
      collection: "GlitchTotems",
      tokenId: 23,
      rarity: "RARE",
      ts: Date.now() - 1000 * 60 * 40
    }
  ];
}

// ---- DOM HOOKS ----
document.addEventListener("DOMContentLoaded", () => {
  // Theme init
  currentTheme = (localStorage.getItem("spawnengine-theme") || "dark");
  document.body.setAttribute("data-theme", currentTheme);

  // Load local data
  loadForTrade();
  initMockData();

  // Tabs
  setupTabs();

  // Buttons
  const btnConnect = document.getElementById("btn-connect");
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  const btnThemeSettings = document.getElementById("btn-theme-in-settings");
  const btnRefreshActivity = document.getElementById("btn-refresh-activity");

  btnConnect?.addEventListener("click", connectWallet);
  btnThemeToggle?.addEventListener("click", toggleTheme);
  btnThemeSettings?.addEventListener("click", toggleTheme);
  btnRefreshActivity?.addEventListener("click", () => {
    refreshActivity();
    renderActivity();
    renderTicker();
  });

  // Filters (trading)
  const searchInput = document.getElementById("search-input");
  const raritySelect = document.getElementById("rarity-select");
  const verifiedOnly = document.getElementById("verified-only");

  [searchInput, raritySelect, verifiedOnly].forEach(el => {
    el?.addEventListener("input", () => {
      renderMarketplace();
      renderVerifiedSidebar();
    });
    el?.addEventListener("change", () => {
      renderMarketplace();
      renderVerifiedSidebar();
    });
  });

  // For-trade form
  const ftAdd = document.getElementById("ft-add");
  ftAdd?.addEventListener("click", handleAddForTrade);

  // Initial renders
  renderTicker();
  renderMarketplace();
  renderVerifiedSidebar();
  renderForTrade();
  renderActivity();
  updateHeaderUI();
});

// ---- TABS ----
function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab");
  const tabPages = document.querySelectorAll(".tab-page");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPages.forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      const page = document.querySelector(`.tab-page[data-tab="${tab}"]`);
      if (page) page.classList.add("active");
    });
  });
}

// ---- THEME ----
function toggleTheme() {
  currentTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", currentTheme);
  localStorage.setItem("spawnengine-theme", currentTheme);
}

// ---- WALLET ----
async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("No injected wallet found (MetaMask / Rabby).");
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    currentWallet = accounts?.[0] || "";
    updateHeaderUI();
  } catch (e) {
    console.error(e);
    alert("Wallet connection failed.");
  }
}

function updateHeaderUI() {
  const pill = document.getElementById("wallet-pill");
  const profileWallet = document.getElementById("profile-wallet");
  const ftWalletLabel = document.getElementById("for-trade-wallet-label");

  const label = currentWallet ? short(currentWallet) : "Not connected";
  if (pill) pill.textContent = label;
  if (profileWallet) profileWallet.textContent = label;
  if (ftWalletLabel) ftWalletLabel.textContent = currentWallet ? label : "Connect wallet";
}

// ---- MARKETPLACE RENDER ----
function getFilters() {
  const q = (document.getElementById("search-input")?.value || "").trim().toLowerCase();
  const rarity = document.getElementById("rarity-select")?.value || "ALL";
  const verifiedOnly = document.getElementById("verified-only")?.checked || false;
  return { q, rarity, verifiedOnly };
}

function filteredPacks() {
  const { q, rarity, verifiedOnly } = getFilters();
  return packs.filter(p => {
    const rn = normRarity(p.rarity);
    const passQ =
      !q ||
      (p.name || "").toLowerCase().includes(q) ||
      (p.creator || "").toLowerCase().includes(q);
    const passR = rarity === "ALL" || rn === rarity;
    const passV = !verifiedOnly || p.verified;
    return passQ && passR && passV;
  });
}

function renderMarketplace() {
  const grid = document.getElementById("market-grid");
  if (!grid) return;
  const list = filteredPacks();
  if (!list.length) {
    grid.innerHTML = `<div class="card">No packs found.</div>`;
    return;
  }
  grid.innerHTML = list
    .map(
      p => `
      <a href="${p.url}" target="_blank" rel="noreferrer" class="card pack">
        <div>
          <div class="thumb lg"></div>
          <div class="meta">
            <div class="row-between">
              <div class="title truncate">${p.name}</div>
              <span class="badge">${normRarity(p.rarity)}</span>
            </div>
            <div class="sub truncate">${short(p.creator || "")}</div>
            ${
              p.verified
                ? `<div class="sub" style="color: var(--green); font-size: 11px;">Verified creator</div>`
                : ""
            }
          </div>
        </div>
      </a>
    `
    )
    .join("");
}

// ---- VERIFIED SIDEBAR ----
function renderVerifiedSidebar() {
  const box = document.getElementById("verified-list");
  if (!box) return;
  const list = filteredPacks().filter(p => p.verified).slice(0, 8);
  if (!list.length) {
    box.innerHTML = `<div class="card">No verified packs under current filters.</div>`;
    return;
  }
  box.innerHTML = list
    .map(
      p => `
      <a href="${p.url}" target="_blank" rel="noreferrer" class="card row">
        <div class="thumb"></div>
        <div class="grow">
          <div class="title truncate">${p.name}</div>
          <div class="sub">View pack</div>
        </div>
      </a>
    `
    )
    .join("");
}

// ---- TICKER ----
function renderTicker() {
  const strip = document.getElementById("ticker-strip");
  if (!strip) return;
  const list = pulls.length
    ? pulls
    : [
        {
          id: "dummy",
          owner: "0x0000",
          collection: "Demo",
          tokenId: 0,
          rarity: "COMMON"
        }
      ];
  const chips = list
    .map(
      i =>
        `<div class="chip">${short(i.owner)} pulled ${normRarity(
          i.rarity
        )} in ${i.collection} #${i.tokenId}</div>`
    )
    .join("");
  // duplicera för infinite scroll-känsla
  strip.innerHTML = chips + chips;
}

// ---- ACTIVITY ----
function refreshActivity() {
  // enkelt: kasta in en ny fejk-pull
  const newItem = {
    id: `dyn-${Date.now()}`,
    owner: currentWallet || "0xNewMinter",
    collection: "SpawnEngine Series",
    tokenId: Math.floor(Math.random() * 5000),
    rarity: ["COMMON", "RARE", "EPIC", "LEGENDARY"][Math.floor(Math.random() * 4)],
    ts: Date.now()
  };
  pulls.unshift(newItem);
  if (pulls.length > 40) pulls = pulls.slice(0, 40);
}

function renderActivity() {
  const listEl = document.getElementById("activity-list");
  if (!listEl) return;
  if (!pulls.length) {
    listEl.innerHTML = `<div class="card">No pulls yet.</div>`;
    return;
  }
  listEl.innerHTML = pulls
    .slice(0, 40)
    .map(
      i => `
      <div class="card row">
        <div class="thumb"></div>
        <div class="grow">
          <div class="title">${short(i.owner)} pulled</div>
          <div class="sub">${i.collection} • #${i.tokenId} • ${normRarity(i.rarity)} (${stars(
            i.rarity
          )})</div>
        </div>
        <div class="sub">${new Date(i.ts).toLocaleTimeString()}</div>
      </div>
    `
    )
    .join("");
}

// ---- FOR TRADE ----
function handleAddForTrade() {
  const nameEl = document.getElementById("ft-name");
  const rarityEl = document.getElementById("ft-rarity");
  const contractEl = document.getElementById("ft-contract");
  const tokenIdEl = document.getElementById("ft-token-id");

  const name = (nameEl?.value || "").trim();
  const rarity = rarityEl?.value || "COMMON";
  const contract = (contractEl?.value || "").trim();
  const tokenId = (tokenIdEl?.value || "").trim();

  if (!name && !contract) return;

  const item = {
    id: `${contract}-${tokenId}-${Math.random().toString(16).slice(2)}`,
    name,
    rarity,
    contract,
    tokenId
  };

  forTrade.push(item);
  saveForTrade();
  renderForTrade();

  if (nameEl) nameEl.value = "";
  if (contractEl) contractEl.value = "";
  if (tokenIdEl) tokenIdEl.value = "";
  if (rarityEl) rarityEl.value = "COMMON";
}

function renderForTrade() {
  const list = document.getElementById("for-trade-list");
  if (!list) return;
  if (!forTrade.length) {
    list.innerHTML = `<div class="card">No items added yet.</div>`;
    return;
  }
  list.innerHTML = forTrade
    .map(
      i => `
      <div class="card">
        <div class="row-between">
          <div class="title truncate">${i.name || "Unnamed"}</div>
          <span class="badge">${normRarity(i.rarity)}</span>
        </div>
        <div class="sub">${short(i.contract) || "No contract"} • #${i.tokenId || "—"}</div>
        <div class="row" style="margin-top: 8px;">
          <button class="btn ghost" data-remove="${i.id}">Remove</button>
        </div>
      </div>
    `
    )
    .join("");

  // bind remove-buttons
  list.querySelectorAll("button[data-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-remove");
      forTrade = forTrade.filter(x => x.id !== id);
      saveForTrade();
      renderForTrade();
    });
  });
}