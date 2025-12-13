// integrations/farcaster.js
// Mock Farcaster/Neynar (byt senare mot riktig API-call)

export async function postCastMock(message, url = "") {
  const payload = {
    message: String(message || "").slice(0, 320),
    url: String(url || "").slice(0, 512),
    timestamp: Date.now(),
  };

  console.log("[FAKE CAST]", payload.message, payload.url);
  await new Promise((r) => setTimeout(r, 50));
  return { ok: true, id: "fake_cast_" + Math.random().toString(16).slice(2), payload };
}