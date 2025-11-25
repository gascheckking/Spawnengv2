// integrations/zora.js

// Här kan du sen kalla riktiga Zora API:er / GraphQL.
// Nu: enkel mock för "Zora Bridge" / "Zora Packs"-view.

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

export async function getZoraActivityMock(wallet) {
  await new Promise((r) => setTimeout(r, 50));
  return {
    wallet,
    items: MOCK_ZORA_ITEMS,
  };
}