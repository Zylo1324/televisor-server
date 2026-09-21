import { checkAuth, fetchLiveStreamM3U8 } from "./_core.js";

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).send("401 Unauthorized — pasa ?key=TU_API_KEY\n");
  }

  const url = new URL(req.url, "http://localhost");
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return res.status(400).send("Falta ?slug=canal\n");
  }

  const forwarded = req.headers["x-forwarded-for"] || "";
  const clientIp = forwarded.split(",")[0].trim() || req.socket?.remoteAddress || "127.0.0.1";

  try {
    const m3u8Content = await fetchLiveStreamM3U8(slug, clientIp);
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).send(m3u8Content);
  } catch (err) {
    res.status(502).send(`Error resolviendo stream: ${err.message}\n`);
  }
}
