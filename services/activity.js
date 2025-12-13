// services/activity.js
// Event shape:
// { id, kind, label, short, series, rarity, owner, tags, score, timestamp }

const MOCK_EVENTS = [
  {
    id: "1",
    kind: "pack_open",
    label: "Genesis Pack #42",
    short: "GEN-42",
    series: "Genesis",
    rarity: "Core",
    owner: "0x1234...beef",
    tags: ["pull", "core"],
    score: 420,
    timestamp: Date.now() - 5_000,
  },
  {
    id: "2",
    kind: "swap",
    label: "Shard → Core",
    short: "S>C",
    series: "Genesis",
    rarity: "Shard",
    owner: "0x9999...aaaa",
    tags: ["swap"],
    score: 210,
    timestamp: Date.now() - 25_000,
  },
  {
    id: "3",
    kind: "burn",
    label: "Burn 10 Fragments",
    short: "10xF",
    series: "Genesis",
    rarity: "Fragment",
    owner: "0xabcd...0001",
    tags: ["burn", "gamble"],
    score: 90,
    timestamp: Date.now() - 60_000,
  },
  {
    id: "4",
    kind: "zora_buy",
    label: "ZoraPack Mythic Hit",
    short: "Z-MYT",
    series: "ZoraPacks",
    rarity: "Relic",
    owner: "0xdeaf...9999",
    tags: ["zora", "mythic_hit"],
    score: 9_900,
    timestamp: Date.now() - 120_000,
  },
  {
    id: "5",
    kind: "farcaster_cast",
    label: "Cast: “Just pulled an Artifact on Base”",
    short: "CAST",
    series: "Social",
    rarity: "Artifact",
    owner: "0xface...7777",
    tags: ["farcaster", "social"],
    score: 300,
    timestamp: Date.now() - 240_000,
  },
];

/**
 * Här kan du senare byta ut mocken mot:
 *  - riktiga kontrakt-events via onchain/base.js
 *  - Zora API-respons
 *  - Farcaster/Neynar API
 */
export async function getUnifiedActivity() {
  await new Promise((r) => setTimeout(r, 50));
  return MOCK_EVENTS.slice().sort((a, b) => b.timestamp - a.timestamp);
}

export function computeStatsFromEvents(events) {
  const stats = {
    totalPacks: 0,
    fragments: 0,
    shards: 0,
    cores: 0,
    artifacts: 0,
    relics: 0,
    holderCount: 0,
  };

  const holders = new Set();

  for (const e of events) {
    if (e.kind === "pack_open") stats.totalPacks++;

    switch (e.rarity) {
      case "Fragment": stats.fragments++; break;
      case "Shard": stats.shards++; break;
      case "Core": stats.cores++; break;
      case "Artifact": stats.artifacts++; break;
      case "Relic": stats.relics++; break;
    }

    holders.add(e.owner);
  }

  stats.holderCount = holders.size;
  return stats;
}