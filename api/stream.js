// api/stream.js — Universal M3U8 Proxy that injects required Referer and rewrites relative URLs

import { checkAuth } from "./_core.js";

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).send("401 Unauthorized — pasa ?key=TU_API_KEY\n");
  }

  const url = new URL(req.url, "http://localhost");
  const targetUrl = url.searchParams.get("url");
  const referer = url.searchParams.get("ref") || "https://pirlotv.la/";

  if (!targetUrl) {
    return res.status(400).send("Falta ?url=URL_DEL_STREAM\n");
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        "referer": referer,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "accept": "application/x-mpegURL,application/vnd.apple.mpegurl,*/*"
      }
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send(`Upstream CDN returned ${upstreamRes.status}`);
    }

    let m3u8Text = await upstreamRes.text();

    // If upstream returns another redirect or not m3u8
    if (!m3u8Text.includes("#EXTM3U")) {
      return res.status(502).send("El upstream no devolvió una lista M3U válida");
    }

    // Rewrite relative URLs to absolute so any player can fetch them directly
    const targetObj = new URL(targetUrl);
    const basePath = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

    const rewritten = m3u8Text.split("\n").map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
      if (trimmed.startsWith("/")) {
        return `${targetObj.origin}${trimmed}`;
      }
      return `${basePath}${trimmed}`;
    }).join("\n");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).send(rewritten);
  } catch (err) {
    res.status(502).send(`Error en proxy: ${err.message}`);
  }
}
