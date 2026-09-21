// api/pirlotv.js — Real-time auto-renovated 24/7 channels from pirlotv.la/tv-en-vivo.php

import { checkAuth, getBaseUrl, fetchTvEnVivoM3U } from "./_core.js";

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).send("401 Unauthorized — pasa ?key=TU_API_KEY\n");
  }

  const baseUrl = getBaseUrl(req);
  const apiKey = process.env.API_KEY || "televisor2024";

  try {
    const m3u = await fetchTvEnVivoM3U(baseUrl, apiKey);
    res.setHeader("Content-Type", "application/x-mpegurl; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).send(m3u);
  } catch (err) {
    res.status(502).send(`Error generando playlist PirloTV: ${err.message}\n`);
  }
}
