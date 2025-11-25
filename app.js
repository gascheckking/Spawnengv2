/* ------------------------------------------------ */
/* SPAWNENGINE V2 — FULL APP.JS                    */
/* ------------------------------------------------ */

const state = {
    wallet: null,
    connected: false,
    events: [],
};

/* ------------------------------------------------ */
/* MOCK EVENTS – tills riktiga Base-logs kopplas */
/* ------------------------------------------------ */
state.events = [
    { kind: "pack_open", label: "Genesis Pack #22", rarity: "Core", owner: "0x123...456", age: "5s" },
    { kind: "swap", label: "Shard → Core", rarity: "Shard", owner: "0x991...bbb", age: "20s" },
    { kind: "burn", label: "10x Fragments", rarity: "Fragment", owner: "0xabc...111", age: "55s" },
    { kind: "zora_buy", label: "Artifact Pulled", rarity: "Artifact", owner: "0xde4...ff2", age: "2m" },
];

/* ------------------------------------------------ */
/* RENDER APP STRUCTURE */
/* ------------------------------------------------ */
function renderApp() {
    document.getElementById("app").innerHTML = `
        <header class="header">
            <div class="brand">
                <div class="brand-title">SpawnEngine</div>
                <div class="brand-sub">Onchain Pack Protocol</div>
            </div>

            <div style="display:flex;gap:0.5rem;">
                <div class="network-pill">Base Sepolia</div>
                <button id="wallet-btn" class="btn">Connect Wallet</button>
            </div>
        </header>

        <nav class="tab-bar" id="tab-bar"></nav>

        <div class="status-strip">
            <span><span class="status-dot" id="wallet-dot"></span> Wallet: <span id="wallet-status">Disconnected</span></span>
            <span>Gas: 0.26 gwei</span>
        </div>

        <div class="ticker">
            <div class="ticker-inner" id="ticker-inner"></div>
        </div>

        <main id="view"></main>

        <footer class="footer">SpawnEngine V2 · Onchain Pack Factory</footer>
    `;

    setupTabs();
    setupWallet();
    updateTicker();
    switchView("trading");
}

/* ------------------------------------------------ */
/* TABS */
/* ------------------------------------------------ */
const tabs = [
    "trading",
    "mypacks",
    "creatorforge",
    "pulllab",
    "packmaps",
    "warpverified",
    "bubbles",
    "stats",
    "deploycenter",
    "settings",
];

function setupTabs() {
    const bar = document.getElementById("tab-bar");
    bar.innerHTML = "";
    tabs.forEach(t => {
        const b = document.createElement("button");
        b.className = "tab-btn";
        b.dataset.tab = t;
        b.textContent = formatTab(t);
        b.onclick = () => switchView(t);
        bar.appendChild(b);
    });
}

function formatTab(t) {
    return t.replace(/([A-Z])/g, " $1")
            .replace(/^\w/, c => c.toUpperCase());
}

/* ------------------------------------------------ */
/* WALLET MOCK */
/* ------------------------------------------------ */
function setupWallet() {
    document.getElementById("wallet-btn").onclick = () => {
        state.connected = !state.connected;
        state.wallet = state.connected ? "0x" + Math.random().toString(16).slice(2, 8) + "..." : null;
        document.getElementById("wallet-status").textContent = state.connected ? state.wallet : "Disconnected";
        document.getElementById("wallet-btn").textContent = state.connected ? "Disconnect" : "Connect Wallet";
        document.getElementById("wallet-dot").classList.toggle("on", state.connected);
    };
}

/* ------------------------------------------------ */
/* TICKER */
/* ------------------------------------------------ */
function updateTicker() {
    const t = state.events.map(e => `${e.kind} | ${e.label} | ${e.owner}`).join(" • ");
    document.getElementById("ticker-inner").textContent = t;
}

/* ------------------------------------------------ */
/* VIEW SWITCH */
/* ------------------------------------------------ */
function switchView(tab) {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(`[data-tab=${tab}]`).classList.add("active");

    const v = document.getElementById("view");

    const renderers = {
        trading: renderTrading,
        mypacks: renderMyPacks,
        creatorfoge: renderCreatorForge,
        pulllab: renderPullLab,
        packmaps: renderPackMaps,
        warpverified: renderWarpVerified,
        bubbles: renderBubbles,
        stats: renderStats,
        deploycenter: renderDeployCenter,
        settings: renderSettings,
    };

    v.innerHTML = (renderers[tab] || (() => `<h2>Not Found</h2>`))();
    if (tab === "packmaps") drawPackMap();
}

/* ------------------------------------------------ */
/* VIEWS */
/* ------------------------------------------------ */

function renderTrading() {
    return `
        <h2 style="padding:1rem;">Trading Post</h2>

        <div class="card-grid">
            <div class="card">
                <h3>Public Market</h3>
                <p>Swap fragments and shards on the market.</p>
                <button class="btn">Enter</button>
            </div>

            <div class="card">
                <h3>Peer-to-Peer</h3>
                <p>Direct trades with collectors.</p>
                <button class="btn">Find Trades</button>
            </div>

            <div class="card">
                <h3>Zora Bridge</h3>
                <p>List items on Zora.</p>
                <button class="btn">Go</button>
            </div>
        </div>
    `;
}

function renderMyPacks() {
    return `
        <h2 style="padding:1rem;">My Packs</h2>
        <div class="card-grid">
            ${state.events
                .filter(e => e.kind === "pack_open")
                .map(e => `
                <div class="card">
                    <h3>${e.label}</h3>
                    <p>Rarity: ${e.rarity}</p>
                    <p>Owner: ${e.owner}</p>
                </div>
            `).join("")}
        </div>
    `;
}

function renderCreatorForge() {
    return `
        <h2 style="padding:1rem;">Creator Forge</h2>
        <div class="card-grid">
            <div class="card">
                <h3>Create New Pack Series</h3>
                <p>Upload → Rarity → Metadata → Deploy</p>
                <button class="btn">Start</button>
            </div>

            <div class="card">
                <h3>Manage Series</h3>
                <p>Edit metadata, pause minting, view stats.</p>
                <button class="btn">Open</button>
            </div>
        </div>
    `;
}

function renderPullLab() {
    return `
        <h2 style="padding:1rem;">Pull Lab</h2>
        <div class="card-grid">

            <div class="card">
                <h3>Fragment Pull</h3>
                <p>Cost: 100 Fragments</p>
                <button class="btn">Pull</button>
            </div>

            <div class="card">
                <h3>Shard Pull</h3>
                <p>Cost: 20 Shards</p>
                <button class="btn">Pull</button>
            </div>

            <div class="card">
                <h3>Core Pull</h3>
                <p>Cost: 5 Cores</p>
                <button class="btn">Pull</button>
            </div>

        </div>
    `;
}

function renderPackMaps() {
    return `
        <h2 style="padding:1rem;">Pack Maps</h2>
        <canvas id="packmap" class="packmap-canvas"></canvas>
    `;
}

function drawPackMap() {
    const c = document.getElementById("packmap");
    const ctx = c.getContext("2d");

    c.width = c.offsetWidth;
    c.height = c.offsetHeight;

    for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.fillStyle = "#00d4ff";
        ctx.arc(
            Math.random() * c.width,
            Math.random() * c.height,
            Math.random() * 4 + 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }
}

function renderWarpVerified() {
    return `
        <h2 style="padding:1rem;">Warp Verified</h2>
        <div class="card-grid">
            ${state.events
                .filter(e => e.rarity === "Artifact" || e.rarity === "Core")
                .map(e => `
                <div class="card">
                    <h3>${e.label}</h3>
                    <p>Rarity: ${e.rarity}</p>
                    <p>${e.owner}</p>
                </div>
            `).join("")}
        </div>
    `;
}

function renderBubbles() {
    return `
        <h2 style="padding:1rem;">Bubbles</h2>
        <div class="card-grid">
            <div class="card">
                <h3>Trending</h3>
                <p>#GenesisPacks</p>
            </div>
            <div class="card">
                <h3>Highest Floor</h3>
                <p>Core — 2.3 ETH</p>
            </div>
        </div>
    `;
}

function renderStats() {
    return `
        <h2 style="padding:1rem;">Stats Engine</h2>

        <div class="metric-grid">
            <div class="metric">
                <div class="value">12,532</div>
                <div class="label">Total Packs</div>
            </div>
            <div class="metric">
                <div class="value">3.1%</div>
                <div class="label">Core Rate</div>
            </div>
            <div class="metric">
                <div class="value">944</div>
                <div class="label">Holders</div>
            </div>
        </div>
    `;
}

function renderDeployCenter() {
    return `
        <h2 style="padding:1rem;">Deploy Center</h2>
        <div class="card-grid">

            <div class="card">
                <h3>Deploy Pack Factory</h3>
                <p>Guard + Factory + Router</p>
                <button class="btn">Deploy</button>
            </div>

            <div class="card">
                <h3>Deploy TokenPackSeries</h3>
                <p>Royalties, rarity table, pricing.</p>
                <button class="btn">Launch</button>
            </div>

            <div class="card">
                <h3>Verify Creator</h3>
                <p>Add creator registry entry.</p>
                <button class="btn">Verify</button>
            </div>

        </div>
    `;
}

function renderSettings() {
    return `
        <h2 style="padding:1rem;">Settings</h2>
        <div class="card-grid">
            <div class="card">
                <h3>Theme</h3>
                <button class="btn">Toggle</button>
            </div>
            <div class="card">
                <h3>Network</h3>
                <p>Base Sepolia</p>
            </div>
        </div>
    `;
}

/* ------------------------------------------------ */
/* INIT */
/* ------------------------------------------------ */
renderApp();