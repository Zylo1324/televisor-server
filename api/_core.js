// api/_core.js — Core engine for M3U generation, scraping, and stream decoding

const API_KEY_DEFAULT = process.env.API_KEY || "televisor2024";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Static Channel Catalog ──────────────────────────────────────────────────
export const CHANNELS = [
  // ── Perú (Directos de alta velocidad sin bloqueos ni tokens) ─────────────────
  { name: "América Televisión", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/America_Television_logo.png", directUrl: "http://190.93.224.43/AMERICA-TV/index.m3u8" },
  { name: "Latina TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Latina_Televisi%C3%B3n_Peru_logo.svg", directUrl: "http://190.93.224.43/LATINA/index.m3u8" },
  { name: "Panamericana TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Panamericana_Television_logo.png", directUrl: "http://190.93.224.43/PANAMERICANA/index.m3u8" },
  { name: "ATV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/ATV/index.m3u8" },
  { name: "ATV+", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/ATV-PLUS/index.m3u8" },
  { name: "ATV Sur", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "https://dnhmqt6n0lkaq.cloudfront.net/ts:abr.m3u8" },
  { name: "TV Perú", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/TV-PERU/index.m3u8" },
  { name: "TV Perú Noticias", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/TV-PERU-NOTICIAS/index.m3u8" },
  { name: "Willax Televisión", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Willax_logo.jpg", directUrl: "http://190.93.224.43/WILLAX/index.m3u8" },
  { name: "Exitosa TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Corporacion_Universal.png", directUrl: "http://190.93.224.43/EXITOSA/index.m3u8" },
  { name: "RPP Noticias", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/RPP_Noticias_logo.png", directUrl: "http://190.93.224.43/RPP/index.m3u8" },

  // ── Deportes: DIRECTV Sports (DSPORTS) ──────────────────────────────────────
  { name: "DSPORTS (DirecTV Sports)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", slug: "dsports" },
  { name: "DSPORTS 2 (DirecTV Sports 2)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", slug: "dsports2" },
  { name: "DSPORTS + (DirecTV Sports +)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", slug: "dsportsplus" },

  // ── Deportes: ESPN & Fox ────────────────────────────────────────────────────
  { name: "ESPN Premium (Cable HD 60fps)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-PREMIUM/index.m3u8" },
  { name: "ESPN Premium (PirloTV)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "espnpremium" },
  { name: "ESPN", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN/index.m3u8" },
  { name: "ESPN 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-2/index.m3u8" },
  { name: "ESPN 3", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-3/index.m3u8" },
  { name: "ESPN 4", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-4/index.m3u8" },
  { name: "ESPN Deportes USA", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "espndeportes" },

  // ── Deportes: Ligas, TNT, Win & TyC ─────────────────────────────────────────
  { name: "Liga 1 MAX (Cable HD 60fps)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Liga1_peru_logo.png", directUrl: "http://190.93.224.43/LIGA-1-MAX/index.m3u8" },
  { name: "Liga 1 MAX (PirloTV)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Liga1_peru_logo.png", slug: "liga1max" },
  { name: "TNT Sports Premium Argentina", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/TNT_Sports_logo.svg", slug: "tntsports" },
  { name: "TNT Sports Premium Chile", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/TNT_Sports_logo.svg", slug: "tntchile" },
  { name: "Win Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Win_Sports_logo.svg", slug: "winsports" },
  { name: "Win Sports +", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Win_Sports_logo.svg", slug: "winplus" },
  { name: "TyC Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/6/62/TyC_Sports_logo.svg", slug: "tycsports" },

  // ── Películas, Series y Premium (HBO, Warner, Sony, etc.) ───────────────────
  { name: "HBO 2", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-2/index.m3u8" },
  { name: "HBO Plus", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-PLUS/index.m3u8" },
  { name: "HBO Family", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-FAMILY/index.m3u8" },
  { name: "HBO Signature", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-SIGNATURE/index.m3u8" },
  { name: "TNT", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/TNT_Logo_2016.svg", directUrl: "http://190.93.224.43/TNT/index.m3u8" },
  { name: "Space", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Space_logo.svg", directUrl: "http://190.93.224.43/SPACE/index.m3u8" },
  { name: "AXN", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fb/AXN_Logo.svg", directUrl: "http://190.93.224.43/AXN/index.m3u8" },
  { name: "FX", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/FX_logo.svg", directUrl: "http://190.93.224.43/FX/index.m3u8" },
  { name: "Sony Channel", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Sony_Channel_logo.svg", directUrl: "http://190.93.224.43/SONY-CHANNEL/index.m3u8" },
  { name: "Golden", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Golden_Logo.png", directUrl: "http://190.93.224.43/GOLDEN/index.m3u8" },
  { name: "Studio Universal", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Studio_Universal_2016.png", directUrl: "http://190.93.224.43/STUDIO-UNIVERSAL/index.m3u8" },

  // ── Cultura y Variedades ───────────────────────────────────────────────────
  { name: "History Channel", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/History_Logo.svg", directUrl: "http://190.93.224.43/HISTORY/index.m3u8" },
  { name: "National Geographic", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/National_Geographic_logo.svg", directUrl: "http://190.93.224.43/NAT-GEO/index.m3u8" },
  { name: "Discovery Turbo", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Discovery_Turbo_Logo.svg", directUrl: "http://190.93.224.43/DISCOVERY-TURBO/index.m3u8" },
  { name: "Discovery Kids", group: "Infantil", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Discovery_Kids_2016.svg", directUrl: "http://190.93.224.43/DISCOVERY-KIDS/index.m3u8" },
  { name: "Disney Jr", group: "Infantil", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Disney_Junior_2011_logo.svg", directUrl: "http://190.93.224.43/DISNEY-JR/index.m3u8" },
  { name: "Telemundo", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Telemundo_logo.svg", directUrl: "http://190.93.224.43/TELEMUNDO/index.m3u8" },
];

// ─── Mapping: Slugs to PirloTV / Instream Stream IDs ──────────────────────────
export const INSTREAM_MAP = {
  dsports: "H94",
  "directv-sports": "H94",
  dsports2: "H95",
  "directv-sports-2": "H95",
  dsportsplus: "H96",
  "directv-sports-plus": "H96",
  espnpremium: "H76",
  "espn-premium": "H76",
  espndeportes: "H71",
  "espn-deportes": "H71",
  tntsports: "H75",
  tntar: "H75",
  "tnt-sports": "H75",
  tntchile: "H82",
  "tnt-chile": "H82",
  winsports: "H82",
  "win-sports": "H82",
  winplus: "H81",
  winsportsplus: "H81",
  "win-sports-plus": "H81",
  tycsports: "H77",
  "tyc-sports": "H77",
  liga1max: "H84",
  "liga-1-max": "H84"
};

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
    `# Televisor Cloud Auto-Renovado — ${new Date().toISOString()}`,
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

// ─── Instream Auto-Renovating Dynamic Resolver ────────────────────────────────

const instreamCache = new Map();
const INSTREAM_CACHE_TTL = 45 * 1000; // 45 segundos de caché rápida para segmentos

export async function resolveInstreamM3U8(streamId) {
  const now = Date.now();
  const cached = instreamCache.get(streamId);
  if (cached && now - cached.time < INSTREAM_CACHE_TTL && cached.content) {
    return cached.content;
  }

  const pageUrl = `https://instream.click/hlsspanich.php?stream=${streamId}`;
  const pageRes = await fetch(pageUrl, {
    headers: {
      "user-agent": UA,
      "referer": "https://live4.lat/",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!pageRes.ok) {
    throw new Error(`instream.click retornó HTTP ${pageRes.status}`);
  }

  const html = await pageRes.text();
  const m = html.match(/const streamUrls = \["([^"]+)"(?:,"([^"]+)")?\]/);
  if (!m) {
    throw new Error(`No se encontró streamUrls para ${streamId}`);
  }

  const urls = [m[1], m[2]].filter(Boolean).map(u => u.replace(/\\u0026/g, "&"));

  let m3u8Text = null;
  let activeUrl = null;

  for (const rawUrl of urls) {
    try {
      const upstreamRes = await fetch(rawUrl, {
        headers: {
          "user-agent": UA,
          "referer": "https://instream.click/",
        },
        signal: AbortSignal.timeout(6000),
      });

      if (upstreamRes.ok) {
        const text = await upstreamRes.text();
        if (text.includes("#EXTM3U")) {
          m3u8Text = text;
          activeUrl = rawUrl;
          break;
        }
      }
    } catch (_) {}
  }

  if (!m3u8Text || !activeUrl) {
    throw new Error(`El stream ${streamId} no devolvió una lista M3U8 válida`);
  }

  const targetObj = new URL(activeUrl);
  const basePath = activeUrl.substring(0, activeUrl.lastIndexOf("/") + 1);

  const rewritten = m3u8Text
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
      if (trimmed.startsWith("/")) return `${targetObj.origin}${trimmed}`;
      return `${basePath}${trimmed}`;
    })
    .join("\n");

  instreamCache.set(streamId, { content: rewritten, time: now });
  return rewritten;
}

// ─── Universal Live Stream Fetcher ───────────────────────────────────────────

export async function fetchLiveStreamM3U8(targetSlug, clientIp = "127.0.0.1") {
  if (!targetSlug) throw new Error("Falta slug de canal");
  const cleanSlug = targetSlug.toLowerCase().trim();

  // 1. Direct stream ID (e.g. H94, H95, H96) or mapped slug
  const streamId = (cleanSlug.startsWith("h") && !isNaN(cleanSlug.slice(1)))
    ? cleanSlug.toUpperCase()
    : INSTREAM_MAP[cleanSlug];

  if (streamId) {
    try {
      return await resolveInstreamM3U8(streamId);
    } catch (err) {
      console.error(`[Instream Error] ${cleanSlug} (${streamId}):`, err.message);
    }
  }

  // 2. Fallback to tvplusgratis handshake if exists
  return fetchTvPlusGratisM3U8(cleanSlug, clientIp);
}

// ─── PirloTV 24/7 Channels Scraper (tv-en-vivo.php) ───────────────────────────

let tvEnVivoCache = { m3u: null, timestamp: 0 };
const TV_ENVIVO_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function fetchTvEnVivoM3U(baseUrl, apiKey) {
  const now = Date.now();
  if (tvEnVivoCache.m3u && now - tvEnVivoCache.timestamp < TV_ENVIVO_CACHE_TTL) {
    return tvEnVivoCache.m3u;
  }

  const pirlotvTv = "https://pirlotv.la/tv-en-vivo.php";
  const res = await fetch(pirlotvTv, {
    headers: { "user-agent": UA },
  });
  const html = await res.text();

  const lines = [
    '#EXTM3U x-tvg-url=""',
    `# PirloTV Canales 24/7 En Vivo (Auto-Renovados) — ${new Date().toISOString()}`,
    "",
  ];

  const reMenu = /<li><a href="#">([^<]+)<\/a>\s*<ul>([\s\S]*?)<\/ul><\/li>/g;
  let match;

  while ((match = reMenu.exec(html)) !== null) {
    const channelName = match[1].trim();
    const subHtml = match[2];
    const reOptions = /<li class="subitem1"><a href="([^"]+)">([^<]+)<\/a><\/li>/g;
    let optMatch;

    // Direct mapping to instream ID if known
    let streamId = null;
    const lower = channelName.toLowerCase();
    if (lower.includes("dsports (directv sports)")) streamId = "H94";
    else if (lower.includes("dsports 2")) streamId = "H95";
    else if (lower.includes("dsports +")) streamId = "H96";
    else if (lower.includes("espn premium")) streamId = "H76";
    else if (lower.includes("espn deportes")) streamId = "H71";
    else if (lower.includes("liga 1 max")) streamId = "H84";
    else if (lower.includes("tnt sports premium argentina")) streamId = "H75";
    else if (lower.includes("tnt sports premium chile")) streamId = "H82";
    else if (lower.includes("win sports +")) streamId = "H81";
    else if (lower.includes("win sports")) streamId = "H82";
    else if (lower.includes("tyc sports")) streamId = "H77";

    if (streamId) {
      lines.push(
        `#EXTINF:-1 tvg-name="${channelName}" tvg-logo="https://pirlotv.la/logo.png" group-title="PirloTV 24/7",${channelName}`
      );
      lines.push(`${baseUrl}/live.m3u8?stream=${streamId}&key=${apiKey}`);
    } else {
      // General option parser
      while ((optMatch = reOptions.exec(subHtml)) !== null) {
        let href = optMatch[1].trim();
        let label = optMatch[2].trim();
        if (href.includes("?r=")) {
          try { href = Buffer.from(href.split("?r=")[1], "base64").toString("utf-8"); } catch(_) {}
        }
        const title = `${channelName} (${label})`;
        lines.push(
          `#EXTINF:-1 tvg-name="${title}" tvg-logo="https://pirlotv.la/logo.png" group-title="PirloTV 24/7",${title}`
        );
        lines.push(`${baseUrl}/stream.m3u8?url=${encodeURIComponent(href)}&ref=${encodeURIComponent("https://pirlotv.la/")}&key=${apiKey}`);
      }
    }
  }

  const resultM3U = lines.join("\n");
  tvEnVivoCache = { m3u: resultM3U, timestamp: now };
  return resultM3U;
}

// ─── PirloTV Live Events Scraper (home.php) ───────────────────────────────────

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

    for (let depth = 0; depth < 4; depth++) {
      const res = await fetch(currentUrl, {
        headers: {
          referer,
          "user-agent": UA,
        },
      });
      const html = await res.text();

      // Check for instream.click / H id
      const instreamMatch = html.match(/stream=(H\d+)/i);
      if (instreamMatch) {
        const id = instreamMatch[1].toUpperCase();
        const pageUrl = `https://instream.click/hlsspanich.php?stream=${id}`;
        const pRes = await fetch(pageUrl, { headers: { referer: currentUrl, "user-agent": UA } });
        const pHtml = await pRes.text();
        const m = pHtml.match(/const streamUrls = \["([^"]+)"/);
        if (m) {
          return { url: m[1].replace(/\\u0026/g, "&"), referer: "https://instream.click/" };
        }
      }

      // Direct M3U8
      const m3u8Match = html.match(/["'](https?:\/\/[^"'\s]+\.m3u8[^"'\s]*)["']/);
      if (m3u8Match) {
        const clean = m3u8Match[1].replace(/\\u0026/g, "&").replace(/&ip=[^&]+/g, "");
        return { url: clean, referer: currentUrl };
      }

      // Lunchup Decoder
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

      // Follow next iframe
      const iframeMatch = html.match(/<iframe[^>]+src="([^"]+)"/i);
      if (iframeMatch) {
        let next = iframeMatch[1];
        if (next.startsWith("//")) next = "https:" + next;
        referer = currentUrl;
        currentUrl = next;
      } else {
        break;
      }
    }
  } catch (_) {}

  return null;
}

// ─── tvplusgratis.org Resolver ────────────────────────────────────────────────

let tvplusCache = new Map();

export async function fetchTvPlusGratisM3U8(slug, clientIp = "127.0.0.1") {
  const cacheKey = `${slug}:${clientIp}`;
  const cached = tvplusCache.get(cacheKey);
  if (cached && Date.now() - cached.time < 3000 && cached.content) {
    return cached.content;
  }

  const ipHeaders = {
    "User-Agent": UA,
    "X-Forwarded-For": clientIp,
    "X-Real-IP": clientIp,
    "Client-IP": clientIp,
  };

  const coreUrl = `https://www.tvplusgratis.org/live/core.php?canal=${slug}`;
  const coreRes = await fetch(coreUrl, {
    headers: { ...ipHeaders, "Referer": "https://www.tvplusgratis.org/", "Accept": "text/html,application/xhtml+xml" },
  });
  const coreHtml = await coreRes.text();

  const streamMatch = coreHtml.match(/src=['"]([^'"]*stream\.php[^'"]*)['"]/);
  if (!streamMatch) throw new Error("No stream.php encontrado en core.php");

  const streamUrl = streamMatch[1].replace(/&amp;/g, "&");
  const streamRes = await fetch(streamUrl, {
    headers: { ...ipHeaders, "Referer": coreUrl, "Accept": "text/html,application/xhtml+xml" },
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
      "Accept": "text/html,application/xhtml+xml,application/x-mpegURL,*/*",
    },
  });

  const playlistText = await playRes.text();
  if (!playlistText.includes("#EXTM3U")) {
    throw new Error("El servidor devolvió respuesta sin cabecera EXTM3U");
  }

  tvplusCache.set(cacheKey, {
    playlistUrl,
    streamUrl,
    content: playlistText,
    time: Date.now(),
  });

  return playlistText;
}
