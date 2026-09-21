// api/_core.js — Core engine for M3U generation, scraping, and stream decoding

const API_KEY_DEFAULT = process.env.API_KEY || "televisor2024";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Static Channel Catalog ──────────────────────────────────────────────────
export const CHANNELS = [
  // ── Perú (Directos de alta velocidad sin bloqueos) ──────────────────────────
  { name: "América Televisión", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/America_Television_logo.png", directUrl: "http://190.93.224.43/AMERICA-TV/index.m3u8" },
  { name: "Latina TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Latina_Televisi%C3%B3n_Peru_logo.svg", directUrl: "http://190.93.224.43/LATINA/index.m3u8" },
  { name: "Panamericana TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Panamericana_Television_logo.png", directUrl: "http://190.93.224.43/PANAMERICANA/index.m3u8" },
  { name: "ATV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/ATV/index.m3u8" },
  { name: "ATV+", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/ATV-PLUS/index.m3u8" },
  { name: "ATV Sur", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "https://dnhmqt6n0lkaq.cloudfront.net/ts:abr.m3u8" },
  { name: "TV Perú", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/TV-PERU/index.m3u8" },
  { name: "TV Perú Noticias", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/TV-PERU-NOTICIAS/index.m3u8" },
  { name: "Willax", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Willax_logo.jpg", directUrl: "http://190.93.224.43/WILLAX/index.m3u8" },
  { name: "Exitosa TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Corporacion_Universal.png", directUrl: "http://190.93.224.43/EXITOSA/index.m3u8" },
  { name: "RPP Noticias", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/RPP_Noticias_logo.png", directUrl: "http://190.93.224.43/RPP/index.m3u8" },

  // ── Deportes ───────────────────────────────────────────────────────────────
  { name: "Liga 1 MAX", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Liga1_peru_logo.png", directUrl: "http://190.93.224.43/LIGA-1-MAX/index.m3u8" },
  { name: "ESPN", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN/index.m3u8" },
  { name: "ESPN 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-2/index.m3u8" },
  { name: "ESPN 3", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-3/index.m3u8" },
  { name: "ESPN Premium", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "espnpremium" },
  { name: "Fox Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Fox_Sports_logo.svg", slug: "fox1ar" },
  { name: "TNT Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/TNT_Sports_logo.svg", slug: "tntar" },
  { name: "Win Sports+", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Win_Sports_logo.svg", slug: "winplus" },

  // ── Entretenimiento y Cultura ──────────────────────────────────────────────
  { name: "TNT", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/TNT_Logo_2016.svg", directUrl: "http://190.93.224.43/TNT/index.m3u8" },
  { name: "Space", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Space_logo.svg", directUrl: "http://190.93.224.43/SPACE/index.m3u8" },
  { name: "History Channel", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/History_Logo.svg", directUrl: "http://190.93.224.43/HISTORY/index.m3u8" },
  { name: "National Geographic", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/National_Geographic_logo.svg", directUrl: "http://190.93.224.43/NAT-GEO/index.m3u8" },
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

export async function fetchTvPlusGratisM3U8(slug, clientIp = "127.0.0.1") {
  const cacheKey = `${slug}:${clientIp}`;
  const cached = tvplusCache.get(cacheKey);
  // Fast cache hit (< 3000ms TTL)
  if (cached && Date.now() - cached.time < 3000 && cached.content) {
    return cached.content;
  }

  const ipHeaders = {
    "User-Agent": UA,
    "X-Forwarded-For": clientIp,
    "X-Real-IP": clientIp,
    "Client-IP": clientIp
  };

  // Fast poll with cached playlistUrl
  if (cached && cached.playlistUrl && cached.streamUrl) {
    try {
      const playRes = await fetch(cached.playlistUrl, {
        headers: {
          ...ipHeaders,
          "Referer": cached.streamUrl,
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
    headers: { ...ipHeaders, "Referer": "https://www.tvplusgratis.org/", "Accept": "text/html,application/xhtml+xml" }
  });
  const coreHtml = await coreRes.text();

  const streamMatch = coreHtml.match(/src=['"]([^'"]*stream\.php[^'"]*)['"]/);
  if (!streamMatch) throw new Error("No stream.php encontrado en core.php");

  const streamUrl = streamMatch[1].replace(/&amp;/g, "&");
  const streamRes = await fetch(streamUrl, {
    headers: { ...ipHeaders, "Referer": coreUrl, "Accept": "text/html,application/xhtml+xml" }
  });
  const streamHtml = await streamRes.text();

  const unescaped = streamHtml.replace(/\\\//g, "/").replace(/&amp;/g, "&");
  const playlistMatch = unescaped.match(/https?:\/\/[^\s'"]+playlist\.php[^\s'"]*/);
  if (!playlistMatch) throw new Error("No playlist.php encontrado en stream.php");

  const playlistUrl = playlistMatch[0];
  const playRes = await fetch(playlistUrl, {
    headers: {
      ...ipHeaders,
      "Referer": streamUrl,
      "Accept": "text/html,application/xhtml+xml,application/x-mpegURL,*/*"
    }
  });

  const playlistText = await playRes.text();
  if (!playlistText.includes("#EXTM3U")) {
    throw new Error("El servidor devolvió respuesta sin cabecera EXTM3U");
  }

  tvplusCache.set(cacheKey, {
    playlistUrl,
    streamUrl,
    content: playlistText,
    time: Date.now()
  });

  return playlistText;
}

// ─── Universal Live Stream Fetcher (Sports & Regional Channels) ───────────────

const SPORTS_MAP = {
  espnpremium: "espnpremium",
  fox1ar: "fox1ar",
  tntar: "tntar",
  winplus: "winplus",
  espn: "espn",
  espn2: "espn2",
  espn3: "espn3",
  espn4: "espn4",
  espnextra: "espnextra",
};

export async function fetchLiveStreamM3U8(slug, clientIp = "127.0.0.1") {
  // 1. Try decoding from streamx305 if known sports channel
  if (SPORTS_MAP[slug]) {
    try {
      const channelName = SPORTS_MAP[slug];
      const channelUrl = `https://streamx305.sbs/global3.php?channel=${channelName}`;
      const res = await fetch(channelUrl, { headers: { "referer": "https://pirlotv.la/" } });
      const html = await res.text();
      const arrMatch = html.match(/\b([a-zA-Z_]\w*)=(\[\[\d+,"[A-Za-z0-9+\/=]+"[\s\S]*?\]\]);/);
      const fnMatches = [...html.matchAll(/function \w+\(\)\{return (\d+);\}/g)];
      if (arrMatch && fnMatches.length >= 2) {
        const pairs = JSON.parse(arrMatch[2]);
        pairs.sort((a, b) => a[0] - b[0]);
        const k = parseInt(fnMatches[0][1]) + parseInt(fnMatches[1][1]);
        let decoded = "";
        for (const p of pairs) {
          const dec = Buffer.from(p[1], "base64").toString("utf-8");
          decoded += String.fromCharCode(parseInt(dec.replace(/\D/g, "")) - k);
        }
        const cleanUrl = decoded.replace(/&ip=[^&]+/g, "");
        const upstreamRes = await fetch(cleanUrl, { headers: { "referer": "https://streamx305.sbs/" } });
        const m3u8Text = await upstreamRes.text();

        const targetObj = new URL(cleanUrl);
        const basePath = cleanUrl.substring(0, cleanUrl.lastIndexOf("/") + 1);
        return m3u8Text.split("\n").map(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) return line;
          if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
          if (trimmed.startsWith("/")) return `${targetObj.origin}${trimmed}`;
          return `${basePath}${trimmed}`;
        }).join("\n");
      }
    } catch (_) {}
  }

  // 2. Fallback to tvplusgratis handshake
  return fetchTvPlusGratisM3U8(slug, clientIp);
}

