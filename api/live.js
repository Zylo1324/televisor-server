// api/live.js — Live stream resolver for auto-renovating sports and regional channels

import { checkAuth, fetchLiveStreamM3U8 } from "./_core.js";

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).send("401 Unauthorized — pasa ?key=TU_API_KEY\n");
  }

  const url = new URL(req.url, "http://localhost");
  const slug = url.searchParams.get("slug");
  const stream = url.searchParams.get("stream");
  const target = stream || slug;

  if (!target) {
    return res.status(400).send("Falta ?slug=canal o ?stream=H94\n");
  }

  const forwarded = req.headers["x-forwarded-for"] || "";
  const clientIp = forwarded.split(",")[0].trim() || req.socket?.remoteAddress || "127.0.0.1";

  try {
    const m3u8Content = await fetchLiveStreamM3U8(target, clientIp);
    res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    // Refresh on the CDN without making every player wait for the upstream.
    // Keep the browser's copy at zero age so it checks the live edge playlist.
    res.setHeader("Cache-Control", "public, max-age=0");
    res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=2, stale-while-revalidate=15");
    res.status(200).send(m3u8Content);
  } catch (err) {
    res.status(502).send(`Error resolviendo stream ${target}: ${err.message}\n`);
  }
}
