import { Readable } from "node:stream";
import {
  checkAuth,
  INSTREAM_MAP,
  resolveInstreamM3U8,
  resolveStreamTPM3U8,
  resolveTvf90M3U8,
  TVF90_MAP,
} from "./_core.js";

const ALLOWED_HOSTS = [
  /(^|\.)ftlly\.com$/i,
  /(^|\.)instreams\.pro$/i,
  /(^|\.)instreams\.live$/i,
  /(^|\.)domhsd\.com$/i,
];

async function fetchSegment(target, referer) {
  return fetch(target, {
    headers: {
      "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      "referer": referer,
      "accept": "video/mp2t,*/*",
    },
    signal: AbortSignal.timeout(20000),
  });
}

export async function proxySegment(req, res) {
  if (!checkAuth(req)) {
    return res.status(401).send("401 Unauthorized\n");
  }

  const requestUrl = new URL(req.url, "http://localhost");
  const rawTarget = requestUrl.searchParams.get("url");
  const referer = requestUrl.searchParams.get("ref") || "https://tvf90.com/";
  const slug = (requestUrl.searchParams.get("slug") || "").toLowerCase();
  const offset = Math.min(-1, Math.max(-6, Number(requestUrl.searchParams.get("offset")) || -1));
  if (!rawTarget) return res.status(400).send("Falta ?url=FRAGMENTO_TS\n");

  let target;
  try {
    target = new URL(rawTarget);
  } catch {
    return res.status(400).send("URL de fragmento inválida\n");
  }

  if (!["http:", "https:"].includes(target.protocol)
    || !ALLOWED_HOSTS.some((pattern) => pattern.test(target.hostname))) {
    return res.status(403).send("Origen de fragmento no permitido\n");
  }

  try {
    // The live manifest and fragment route share the same Fluid function pool,
    // so the original IP-bound token normally succeeds without another scrape.
    let upstream = await fetchSegment(target, referer);

    // Tokens from these providers are tied to the requesting IP. Resolve a
    // fresh manifest only when another instance receives the segment request.
    if (!upstream.ok) {
      let freshManifest;
      if (/(^|\.)domhsd\.com$/i.test(target.hostname) && slug.startsWith("disney")) {
        freshManifest = await resolveStreamTPM3U8(slug, null, undefined, true);
      } else if (/(^|\.)ftlly\.com$/i.test(target.hostname) && TVF90_MAP[slug]) {
        freshManifest = await resolveTvf90M3U8(TVF90_MAP[slug], slug, null);
      } else {
        const streamId = INSTREAM_MAP[slug] || slug.toUpperCase();
        freshManifest = await resolveInstreamM3U8(streamId, null);
      }

      const candidates = freshManifest
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => /^https?:\/\//.test(line));
      const samePath = candidates.find((candidate) => {
        try { return new URL(candidate).pathname === target.pathname; } catch { return false; }
      });
      const refreshedTarget = samePath || candidates.at(offset);
      if (!refreshedTarget) return res.status(502).send("No se pudo renovar el fragmento\n");
      upstream = await fetchSegment(refreshedTarget, referer);
    }

    if (!upstream.ok || !upstream.body) {
      return res.status(upstream.status || 502).send(`Fragmento upstream HTTP ${upstream.status}\n`);
    }

    res.statusCode = 200;
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "video/mp2t");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Vercel-CDN-Cache-Control", "public, s-maxage=300, stale-while-revalidate=60");
    const length = upstream.headers.get("content-length");
    if (length) res.setHeader("Content-Length", length);

    const stream = Readable.fromWeb(upstream.body);
    stream.on("error", (err) => res.destroy(err));
    stream.pipe(res);
  } catch (err) {
    if (!res.headersSent) return res.status(502).send(`Error descargando fragmento: ${err.message}\n`);
    res.destroy(err);
  }
}

export default proxySegment;
