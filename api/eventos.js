import { checkAuth, fetchEventosM3U } from "./_core.js";

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).send("401 Unauthorized — pasa ?key=TU_API_KEY\n");
  }

  try {
    const m3u = await fetchEventosM3U();
    res.setHeader("Content-Type", "application/x-mpegurl; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).send(m3u);
  } catch (err) {
    res.status(500).send(`Error al obtener eventos: ${err.message}\n`);
  }
}
