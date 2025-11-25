// integrations/farcaster.js

// Placeholder för riktig Farcaster/Neynar-integration.

export async function postCastMock(message, url) {
  console.log("[FAKE CAST]", message, url || "");
  await new Promise((r) => setTimeout(r, 50));
  return { ok: true, id: "fake_cast_id" };
}