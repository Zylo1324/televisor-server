import { checkAuth, resolveTvPlusGratis } from "./_core.js";

export default async function handler(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).send("401 Unauthorized — pasa ?key=TU_API_KEY\n");
  }

  const url = new URL(req.url, "http://localhost");
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return res.status(400).send("Falta ?slug=canal\n");
  }

  try {
    const streamUrl = await resolveTvPlusGratis(slug);
    // Redirige al reproductor (VLC, Smart TV, navegador) al stream real
    res.redirect(302, streamUrl);
  } catch (err) {
    res.status(502).send(`Error resolviendo stream: ${err.message}\n`);
  }
}
