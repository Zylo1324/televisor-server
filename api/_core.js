// api/_core.js — Core engine for M3U generation, scraping, and stream decoding

const API_KEY_DEFAULT = process.env.API_KEY || "televisor2024";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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

export async function fetchEventosM3U(baseUrl, apiKey) {
  const now = Date.now();
  if (eventosCache.m3u && now - eventosCache.timestamp < PIRLOTV_CACHE_TTL) {
    return eventosCache.m3u;
  }

  const pirlotvHome = "https://pirlotv.la/home.php";
  const res = await fetch(pirlotvHome, {
    headers: { "user-agent": UA },
  });
  const html = await res.text();

  const lines = [
    '#EXTM3U x-tvg-url=""',
    `# PirloTV Eventos en Vivo — ${new Date().toISOString()}`,
    "",
  ];

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

  for (const ev of events) {
    const group = ev.name.replace(/[^\w\s\-\:áéíóúÁÉÍÓÚñÑ]/g, "").trim();

    for (const ch of ev.channels) {
      const streamInfo = await resolveChannelStream(ch.url);
      if (streamInfo && streamInfo.url) {
        const title = `${ev.name} — ${ch.label}`;
        lines.push(
          `#EXTINF:-1 tvg-name="${title}" tvg-logo="https://pirlotv.la/logo.png" group-title="${group}",${title}`
        );

        // Proxied URL with Referer injection
        const proxiedStream = `${baseUrl}/stream.m3u8?url=${encodeURIComponent(streamInfo.url)}&ref=${encodeURIComponent(streamInfo.referer)}&key=${apiKey}`;
        lines.push(proxiedStream);
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
          "user-agent": UA,
        },
      });
      const html = await res.text();

      // 1. Direct M3U8
      const m3u8Match = html.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/);
      if (m3u8Match) {
        const clean = m3u8Match[1].replace(/\\u0026/g, "&").replace(/&ip=[^&]+/g, "");
        return { url: clean, referer: currentUrl };
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
            const clean = decoded.replace(/\\u0026/g, "&").replace(/&ip=[^&]+/g, "");
            return { url: clean, referer: currentUrl };
          }
        } catch (_) {}
      }

      // 3. Decoder for lunchup.net (window._econfig)
      const econfigMatch = html.match(/window\._econfig\s*=\s*'([^']+)'/);
      if (econfigMatch) {
        try {
          const rawB64 = econfigMatch[1];
          const order = [2, 0, 3, 1];
          const decoded = Buffer.from(rawB64, "base64").toString("binary");
          const partLen = Math.floor(decoded.length / 4);
          const parts = [];
          let offset = 0;
          for (let i = 0; i < 4; i++) {
            parts.push(decoded.slice(offset, offset + partLen));
            offset += partLen;
          }
          const orderedParts = [];
          for (let i = 0; i < 4; i++) {
            let p = String(parts[i]);
            p = p.slice(0, 3) + p.slice(4);
            orderedParts[order[i]] = Buffer.from(p, "base64").toString("binary");
          }
          const config = JSON.parse(Buffer.from(orderedParts.join(""), "base64").toString("utf-8"));
          const streamUrl = config.stream_url_nop2p || config.stream_url;
          if (streamUrl) {
            return { url: streamUrl, referer: currentUrl };
          }
        } catch (_) {}
      }

      // 4. Follow next iframe
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

// ─── tvplusgratis.org Resolver with Full M3U8 Proxied Content ────────────────

let tvplusCache = new Map();

export async function fetchTvPlusGratisM3U8(slug) {
  const cached = tvplusCache.get(slug);
  // Fast cache hit (< 3000ms TTL)
  if (cached && Date.now() - cached.time < 3000 && cached.content) {
    return cached.content;
  }

  // Fast poll with cached playlistUrl
  if (cached && cached.playlistUrl && cached.streamUrl) {
    try {
      const playRes = await fetch(cached.playlistUrl, {
        headers: {
          "Referer": cached.streamUrl,
          "User-Agent": UA,
          "Accept": "text/html,application/xhtml+xml,application/x-mpegURL,*/*"
        }
      });
      if (playRes.ok) {
        const text = await playRes.text();
        if (text.includes("#EXTM3U")) {
          cached.content = text;
          cached.time = Date.now();
          return text;
        }
      }
    } catch (_) {}
  }

  // Full 3-step handshake: core.php -> stream.php -> playlist.php
  const coreUrl = `https://www.tvplusgratis.org/live/core.php?canal=${slug}`;
  const coreRes = await fetch(coreUrl, {
    headers: { "Referer": "https://www.tvplusgratis.org/", "User-Agent": UA, "Accept": "text/html,application/xhtml+xml" }
  });
  const coreHtml = await coreRes.text();

  const streamMatch = coreHtml.match(/src=['"]([^'"]*stream\.php[^'"]*)['"]/);
  if (!streamMatch) throw new Error("No stream.php encontrado en core.php");

  const streamUrl = streamMatch[1].replace(/&amp;/g, "&");
  const streamRes = await fetch(streamUrl, {
    headers: { "Referer": coreUrl, "User-Agent": UA, "Accept": "text/html,application/xhtml+xml" }
  });
  const streamHtml = await streamRes.text();

  const unescaped = streamHtml.replace(/\\\//g, "/").replace(/&amp;/g, "&");
  const playlistMatch = unescaped.match(/https?:\/\/[^\s'"]+playlist\.php[^\s'"]*/);
  if (!playlistMatch) throw new Error("No playlist.php encontrado en stream.php");

  const playlistUrl = playlistMatch[0];
  const playRes = await fetch(playlistUrl, {
    headers: {
      "Referer": streamUrl,
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/x-mpegURL,*/*"
    }
  });

  const playlistText = await playRes.text();
  if (!playlistText.includes("#EXTM3U")) {
    throw new Error("El servidor devolvió respuesta sin cabecera EXTM3U");
  }

  tvplusCache.set(slug, {
    playlistUrl,
    streamUrl,
    content: playlistText,
    time: Date.now()
  });

  return playlistText;
}
