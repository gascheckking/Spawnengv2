// integrations/zora.js
// Mock Zora-activity (byt senare mot riktig Zora API/GraphQL)

const MOCK_ZORA_ITEMS = [
  {
    id: "z1",
    title: "Foil Realms — Neon Witch",
    media: "image",
    collection: "Foil Realms",
    url: "https://zora.co/",
    valueHint: "High",
  },
  {
    id: "z2",
    title: "Tiny Legends Pack — Series 2",
    media: "image",
    collection: "Tiny Legends",
    url: "https://zora.co/",
    valueHint: "Medium",
  },
];

export async function getZoraActivityMock(wallet = "0x0000...0000") {
  await new Promise((r) => setTimeout(r, 50));
  return {
    wallet,
    items: MOCK_ZORA_ITEMS.slice(),
    timestamp: Date.now(),
  };
}