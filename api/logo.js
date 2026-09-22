import { readFile } from "node:fs/promises";
import path from "node:path";

const CHANNEL_NUMBER = /^\d{1,3}$/;

export default async function handler(req, res) {
  const url = new URL(req.url, "http://localhost");
  const chno = url.searchParams.get("chno") || "";
  if (!CHANNEL_NUMBER.test(chno)) {
    return res.status(400).send("Número de canal inválido\n");
  }

  try {
    const content = await readFile(path.join(process.cwd(), "logos", `${chno}.png`));
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=31536000, immutable");
    return res.status(200).send(content);
  } catch {
    return res.status(404).send("Logo no encontrado\n");
  }
}
