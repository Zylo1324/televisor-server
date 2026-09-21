// api/_core.js — Core engine for M3U generation, scraping, and stream decoding

const API_KEY_DEFAULT = process.env.API_KEY || "televisor2024";

// ─── Static Channel Catalog ──────────────────────────────────────────────────
export const CHANNELS = [
  // Perú
  { name: "América Televisión", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/America_Television_logo.png", slug: "americatv" },
  { name: "Latina TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Latina_Televisi%C3%B3n_Peru_logo.svg", slug: "latina" },
  { name: "ATV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", slug: "atv" },
  { name: "TV Perú", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", slug: "tvperu" },
  { name: "Canal N", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Canal_N_logo.png", slug: "canaln" },
  { name: "Willax", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Willax_logo.jpg", slug: "willax" },

  // Deportes
  { name: "ESPN", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "espn", directUrl: "http://190.93.224.42/bein/espnlat/index.m3u8" },
  { name: "ESPN 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "espn2", directUrl: "http://190.93.224.42/bein/espn2lat/index.m3u8" },
  { name: "ESPN 3", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "espn3", directUrl: "http://190.93.224.42/bein/espn3lat/index.m3u8" },
  { name: "ESPN Premium", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "espnpremium" },
  { name: "DSports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "dsports", directUrl: "http://190.93.224.42/bein/directvlat/index.m3u8" },
  { name: "DSports 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "dsports2", directUrl: "http://190.93.224.42/bein/directv2lat/index.m3u8" },
  { name: "Fox Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Fox_Sports_logo.svg", slug: "foxsports" },
  { name: "Fox Sports 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Fox_Sports_logo.svg", slug: "foxsports2" },
  { name: "TNT Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/TNT_Sports_logo.svg", slug: "tntsports" },
  { name: "Movistar LaLiga", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fb/LaLiga_logo.svg", slug: "movistarlaliga" },
  { name: "bein Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/BeIN_Sports_logo.svg", slug: "beinsports" },

  // Entretenimiento
  { name: "CNN en Español", group: "Noticias", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg", slug: "cnn" },
  { name: "Cartoon Network", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg", slug: "cartoonnetwork" },
  { name: "Discovery Channel", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Discovery-channel-logo.png", slug: "discovery" },
  { name: "National Geographic", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/National_Geographic_logo.svg", slug: "natgeo" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function checkAuth(req) {
  const expected = process.env.API_KEY || API_KEY_DEFAULT;
  const url = new URL(req.url, "http://localhost");
  const fromQuery = url.searchParams.get("key");
  const fromHeader = req.headers["x-api-key"];
  return fromQuery === expected || fromHeader === expected;
}

export function getBaseUrl(req) {
  if (process.env.SERVER_URL) return process.env.SERVER_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${proto}://${host}`;
}

export function generateM3U(filterGroup, baseUrl, apiKey) {
  const lines = [
    '#EXTM3U x-tvg-url=""',
    `# Televisor Cloud — ${new Date().toISOString()}`,
    "",
  ];

  for (const ch of CHANNELS) {
    if (filterGroup && ch.group.toLowerCase() !== filterGroup.toLowerCase()) {
      continue;
    }

    lines.push(
      `#EXTINF:-1 tvg-name="${ch.name}" tvg-logo="${ch.logo}" group-title="${ch.group}",${ch.name}`
    );

    const streamUrl = ch.directUrl || `${baseUrl}/live.m3u8?slug=${ch.slug}&key=${apiKey}`;
    lines.push(streamUrl);
  }

  return lines.join("\n");
}

// ─── Pirlotv Scraper & Stream Deobfuscator ────────────────────────────────────

let eventosCache = { m3u: null, timestamp: 0 };
const PIRLOTV_CACHE_TTL = 3 * 60 * 1000; // 3 minutos

export async function fetchEventosM3U() {
  const now = Date.now();
  if (eventosCache.m3u && now - eventosCache.timestamp < PIRLOTV_CACHE_TTL) {
    return eventosCache.m3u;
  }

  const pirlotvHome = "https://pirlotv.la/home.php";
  const res = await fetch(pirlotvHome, {
    headers: { "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
  });
  const html = await res.text();

  const lines = [
    '#EXTM3U x-tvg-url=""',
    `# PirloTV Eventos en Vivo — ${new Date().toISOString()}`,
    "",
  ];

  // Extraer bloques de evento: <li><a href="#">EVENTO<span class="t">HORA</span></a><ul>CANALES</ul></li>
  const reEvent = /<li><a href="#">([^<]+)<span class="t">([^<]+)<\/span><\/a>\s*<ul>([\s\S]*?)<\/ul><\/li>/g;
  let eventMatch;
  const events = [];

  while ((eventMatch = reEvent.exec(html)) !== null) {
    const eventName = eventMatch[1].trim();
    const eventTime = eventMatch[2].trim();
    const channelsHtml = eventMatch[3];

    const reChannel = /<li class="subitem1"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
    let chMatch;
    const channels = [];

    while ((chMatch = reChannel.exec(channelsHtml)) !== null) {
      let href = chMatch[1].trim();
      let label = chMatch[2].trim();

      let targetUrl = href;
      if (href.includes("?r=")) {
        const b64 = href.split("?r=")[1];
        try {
          targetUrl = Buffer.from(b64, "base64").toString("utf-8");
        } catch (_) {}
      } else if (href.startsWith("/")) {
        targetUrl = "https://pirlotv.la" + href;
      }

      channels.push({ label, url: targetUrl });
    }

    if (channels.length > 0) {
      events.push({ name: eventName, time: eventTime, channels });
    }
  }

  // Resolver canales en paralelo por evento (máximo 4 eventos concurrentes)
  for (const ev of events) {
    const group = ev.name.replace(/[^\w\s\-\:áéíóúÁÉÍÓÚñÑ]/g, "").trim();

    for (const ch of ev.channels) {
      const streamUrl = await resolveChannelStream(ch.url);
      if (streamUrl) {
        const title = `${ev.name} — ${ch.label}`;
        lines.push(
          `#EXTINF:-1 tvg-name="${title}" tvg-logo="https://pirlotv.la/logo.png" group-title="${group}",${title}`
        );
        lines.push(streamUrl);
      }
    }
  }

  const resultM3U = lines.join("\n");
  eventosCache = { m3u: resultM3U, timestamp: now };
  return resultM3U;
}

export async function resolveChannelStream(url) {
  try {
    let currentUrl = url;
    let referer = "https://pirlotv.la/";

    for (let depth = 0; depth < 3; depth++) {
      const res = await fetch(currentUrl, {
        headers: {
          referer,
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
      });
      const html = await res.text();

      // 1. Direct M3U8
      const m3u8Match = html.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/);
      if (m3u8Match) {
        return m3u8Match[1];
      }

      // 2. Decoder for streamx305 / futlivehd / envivoslatam
      const arrMatch = html.match(/\b([a-zA-Z_]\w*)=(\[\[\d+,"[A-Za-z0-9+\/=]+"[\s\S]*?\]\]);/);
      const fnMatches = [...html.matchAll(/function \w+\(\)\{return (\d+);\}/g)];

      if (arrMatch && fnMatches.length >= 2) {
        try {
          const pairs = JSON.parse(arrMatch[2]);
          pairs.sort((a, b) => a[0] - b[0]);
          const k = parseInt(fnMatches[0][1]) + parseInt(fnMatches[1][1]);
          let decoded = "";
          for (const p of pairs) {
            const dec = Buffer.from(p[1], "base64").toString("utf-8");
            decoded += String.fromCharCode(parseInt(dec.replace(/\D/g, "")) - k);
          }
          if (decoded.startsWith("http")) {
            return decoded;
          }
        } catch (_) {}
      }

      // 3. Follow next iframe
      const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/);
      if (iframeMatch) {
        referer = currentUrl;
        currentUrl = iframeMatch[1];
      } else {
        break;
      }
    }
  } catch (_) {}

  return null;
}

// ─── tvplusgratis.org Resolver ───────────────────────────────────────────────

let tvplusCache = new Map();

export async function resolveTvPlusGratis(slug) {
  const cached = tvplusCache.get(slug);
  if (cached && Date.now() - cached.time < 30 * 60 * 1000) {
    return cached.url;
  }

  const coreUrl = `https://www.tvplusgratis.org/live/core.php?canal=${slug}`;
  const coreRes = await fetch(coreUrl, {
    headers: { referer: "https://www.tvplusgratis.org/" },
  });
  const coreHtml = await coreRes.text();

  const streamMatch = coreHtml.match(/src=['"]([^'"]*stream\.php[^'"]*)['"]/);
  if (!streamMatch) throw new Error("No stream.php");

  const streamRes = await fetch(streamMatch[1], { headers: { referer: coreUrl } });
  const streamHtml = await streamRes.text();

  const playlistMatch = streamHtml.match(/var\s+src\s*=\s*["']([^"']+playlist\.php[^"']*)['"]/);
  if (!playlistMatch) throw new Error("No playlist.php");

  const playlistRes = await fetch(playlistMatch[1], { headers: { referer: streamMatch[1] } });
  const playlistText = await playlistRes.text();

  const m3u8Match = playlistText.match(/(https?:\/\/[^\s]+\.m3u8[^\s]*)/);
  const finalUrl = m3u8Match ? m3u8Match[1] : playlistMatch[1];

  tvplusCache.set(slug, { url: finalUrl, time: Date.now() });
  return finalUrl;
}
