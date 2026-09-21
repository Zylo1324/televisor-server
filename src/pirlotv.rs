/// pirlotv.rs — Scraper y decodificador de pirlotv.la
///
/// Cadena de extracción:
///   pirlotv.la/home.php
///     → r=BASE64 → playvi.org/CANAL.php
///         → <iframe live4.lat o streamx305.sbs/global3.php?channel=X>
///             → JS ofuscado: ne[] array + k1()+k2() → URL final M3U8
///                 → https://sN.envivoslatam99.sbs/global/canal/index.m3u8?token=...

use once_cell::sync::Lazy;
use regex::Regex;
use std::{
    collections::HashMap,
    sync::Mutex,
    time::{Duration, Instant},
};

const PIRLOTV_HOME: &str = "https://pirlotv.la/home.php";
const CACHE_TTL: Duration = Duration::from_secs(300); // 5 minutos

// ─── Cache de eventos (evita scrapear pirlotv en cada request) ───────────────

struct EventCache {
    m3u: String,
    cached_at: Instant,
}

static EVENT_CACHE: Lazy<Mutex<Option<EventCache>>> = Lazy::new(|| Mutex::new(None));

// ─── Tipos ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone)]
pub struct LiveEvent {
    pub name: String,  // ej: "Liga MX: Pachuca vs Tijuana Xolos"
    pub time: String,  // ej: "19:00"
    pub channels: Vec<EventChannel>,
}

#[derive(Debug, Clone)]
pub struct EventChannel {
    pub label: String,       // ej: "Canal 1 (HD)"
    pub playvi_url: String,  // ej: "https://playvi.org/ligamx1.php"
    pub is_hd: bool,
}

// ─── Punto de entrada público ─────────────────────────────────────────────────

/// Devuelve la lista M3U completa con todos los eventos en vivo de pirlotv.
/// Usa caché de 5 minutos para no sobrecargar pirlotv.
pub async fn fetch_eventos_m3u(http: &reqwest::Client) -> anyhow::Result<String> {
    // Revisar caché primero
    {
        let cache = EVENT_CACHE.lock().unwrap();
        if let Some(c) = &*cache {
            if c.cached_at.elapsed() < CACHE_TTL {
                tracing::info!("Eventos desde caché ({}s restantes)", 
                    (CACHE_TTL - c.cached_at.elapsed()).as_secs());
                return Ok(c.m3u.clone());
            }
        }
    }

    tracing::info!("Scrapeando pirlotv.la...");
    let events = scrape_events(http).await?;
    tracing::info!("Encontrados {} eventos en vivo", events.len());

    let m3u = build_eventos_m3u(http, &events).await;

    // Guardar en caché
    {
        let mut cache = EVENT_CACHE.lock().unwrap();
        *cache = Some(EventCache {
            m3u: m3u.clone(),
            cached_at: Instant::now(),
        });
    }

    Ok(m3u)
}

// ─── Scraping de pirlotv.la/home.php ─────────────────────────────────────────

pub async fn scrape_events(http: &reqwest::Client) -> anyhow::Result<Vec<LiveEvent>> {
    let html = http
        .get(PIRLOTV_HOME)
        .send()
        .await?
        .text()
        .await?;

    parse_events_html(&html)
}

fn parse_events_html(html: &str) -> anyhow::Result<Vec<LiveEvent>> {
    // Regex para cada <li> de evento principal
    // Patrón: <li><a href="#">NOMBRE DEL PARTIDO<span class="t">HORA</span></a>
    //           <ul><li class="subitem1"><a href="URL_CANAL">LABEL</a></li>...</ul>
    // </li>

    static RE_EVENT: Lazy<Regex> = Lazy::new(|| {
        // Match event blocks with name, time, and channel list
        Regex::new(
            r##"<li><a href="#">([^<]+)<span class="t">([^<]+)</span></a>\s*<ul>([\s\S]*?)</ul></li>"##
        ).unwrap()
    });

    static RE_CHANNEL: Lazy<Regex> = Lazy::new(|| {
        // Match individual channel links
        Regex::new(
            r##"<li class="subitem1"><a href="([^"]+)">([^<]+)</a></li>"##
        ).unwrap()
    });

    let mut events = Vec::new();

    for cap in RE_EVENT.captures_iter(html) {
        let name = cap[1].trim().to_string();
        let time = cap[2].trim().to_string();
        let channels_html = &cap[3];

        let mut channels = Vec::new();
        for ch_cap in RE_CHANNEL.captures_iter(channels_html) {
            let href = ch_cap[1].trim().to_string();
            let label = ch_cap[2].trim().to_string();
            let is_hd = label.contains("HD");

            // Extraer la URL real del canal
            // Puede ser:
            // 1. /eventos.php?r=BASE64  → decodificar BASE64 → playvi.org URL
            // 2. /eventoshd.php?r=BASE64 → igual
            // 3. /en-vivo/NOMBRE.php     → URL directa en pirlotv
            let playvi_url = extract_channel_url(&href);

            channels.push(EventChannel {
                label,
                playvi_url,
                is_hd,
            });
        }

        if !channels.is_empty() {
            events.push(LiveEvent { name, time, channels });
        }
    }

    Ok(events)
}

fn extract_channel_url(href: &str) -> String {
    // Patrón 1: /eventos.php?r=BASE64 o /eventoshd.php?r=BASE64
    if let Some(r_idx) = href.find("?r=") {
        let b64 = &href[r_idx + 3..];
        if let Ok(decoded) = base64_decode_url(b64) {
            return decoded;
        }
    }

    // Patrón 2: URL relativa de pirlotv como /en-vivo/capo-deportes.php
    if href.starts_with('/') {
        return format!("https://pirlotv.la{href}");
    }

    // Patrón 3: URL absoluta
    href.to_string()
}

fn base64_decode_url(b64: &str) -> anyhow::Result<String> {
    use base64::Engine;
    // URL base64 puede tener = al final; usar el engine estándar
    let decoded_bytes = base64::engine::general_purpose::STANDARD.decode(b64)?;
    Ok(String::from_utf8(decoded_bytes)?)
}

// ─── Resolver cada canal a un stream M3U8 real ───────────────────────────────

async fn build_eventos_m3u(http: &reqwest::Client, events: &[LiveEvent]) -> String {
    let mut lines = vec![
        "#EXTM3U x-tvg-url=\"\"".to_string(),
        format!("# Generado: {} UTC", chrono::Utc::now().format("%Y-%m-%d %H:%M")),
        format!("# Eventos en vivo: {}", events.len()),
        String::new(),
    ];

    for event in events {
        // Grupo por evento (el nombre del partido)
        let group = sanitize_group_name(&event.name);

        tracing::info!("Resolviendo evento: {} ({} canales)", event.name, event.channels.len());

        for ch in &event.channels {
            // Intentar resolver el stream real
            match resolve_channel_stream(http, &ch.playvi_url).await {
                Ok(stream_url) => {
                    let tvg_name = format!("{} — {}", event.name, ch.label);
                    let logo = if ch.is_hd {
                        "https://pirlotv.la/logo.png"
                    } else {
                        "https://pirlotv.la/logo.png"
                    };
                    lines.push(format!(
                        "#EXTINF:-1 tvg-name=\"{tvg_name}\" tvg-logo=\"{logo}\" group-title=\"{group}\",{tvg_name}"
                    ));
                    lines.push(stream_url);
                }
                Err(e) => {
                    tracing::warn!("No se pudo resolver {} - {}: {e}", event.name, ch.label);
                    // Incluirlo igual con URL de fallback vacía para no romper la lista
                }
            }
        }
    }

    lines.join("\n")
}

fn sanitize_group_name(name: &str) -> String {
    // Limpiar el nombre para usarlo como group-title en M3U
    name.chars()
        .map(|c| if c.is_ascii_alphanumeric() || c == ' ' || c == ':' || c == '-' || c == 'á' || c == 'é' || c == 'í' || c == 'ó' || c == 'ú' || c == 'ñ' { c } else { ' ' })
        .collect::<String>()
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

// ─── Resolver una URL de canal a un stream M3U8 ──────────────────────────────

pub async fn resolve_channel_stream(http: &reqwest::Client, url: &str) -> anyhow::Result<String> {
    tracing::debug!("Resolviendo cadena desde: {url}");
    // Intentar hasta 4 niveles de iframe anidados
    let mut current_url = url.to_string();
    let mut referer = "https://pirlotv.la/".to_string();

    for depth in 0..4 {
        tracing::debug!("[depth {depth}] fetch {current_url}");
        let html = fetch_html_with_referer(http, &current_url, &referer).await?;

        // Intentar extraer M3U8 directo
        if let Some(m3u8) = extract_direct_m3u8(&html) {
            tracing::info!("M3U8 directo encontrado en depth {depth}: {m3u8}");
            return Ok(m3u8);
        }

        // Intentar decodificar JS ofuscado (streamx305)
        if let Some(decoded) = decode_streamx305_js(&html) {
            tracing::info!("Stream decodificado (streamx305) en depth {depth}: {decoded}");
            return Ok(decoded);
        }

        // Seguir el siguiente iframe
        match extract_iframe_src(&html) {
            Ok(next_url) => {
                tracing::debug!("[depth {depth}] → iframe: {next_url}");
                referer = current_url.clone();
                current_url = next_url;
            }
            Err(_) => {
                return Err(anyhow::anyhow!("No se encontró stream en {url} (profundidad {depth})"));
            }
        }
    }

    Err(anyhow::anyhow!("No se encontró stream en {url} después de 4 niveles"))
}

async fn fetch_html_with_referer(
    http: &reqwest::Client,
    url: &str,
    referer: &str,
) -> anyhow::Result<String> {
    let resp = http
        .get(url)
        .header("referer", referer)
        .header("origin", extract_origin(referer))
        .send()
        .await?;
    Ok(resp.text().await?)
}

fn extract_origin(url: &str) -> &str {
    // Extrae https://domain.com de una URL completa
    if let Some(idx) = url.find("://") {
        let rest = &url[idx + 3..];
        if let Some(slash) = rest.find('/') {
            return &url[..idx + 3 + slash];
        }
        return url;
    }
    url
}

fn extract_iframe_src(html: &str) -> anyhow::Result<String> {
    static RE: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r##"<iframe[^>]+src="([^"]+)""##).unwrap()
    });
    RE.captures(html)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .ok_or_else(|| anyhow::anyhow!("No se encontró <iframe>"))
}

fn extract_direct_m3u8(html: &str) -> Option<String> {
    // Buscar URLs M3U8 directas en el HTML/JS
    static RE: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r##"["'](https?://[^"']+\.m3u8[^"']*)"##).unwrap()
    });
    RE.captures(html)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
}

// ─── Decodificador del algoritmo de streamx305.sbs ───────────────────────────
///
/// El JS ofuscado tiene esta forma:
///   var ne = [[idx, "BASE64"], [idx, "BASE64"], ...];  (array variable, nombre cambia)
///   ne.sort((a,b) => a[0]-b[0]);
///   var k = fn1() + fn2();          // dos funciones que retornan números
///   ne.forEach(e => {
///     playbackURL += String.fromCharCode(parseInt(atob(e[1]).replace(/\D/g,'')) - k)
///   });
///
/// Para decodificar:
/// 1. Extraer el array de pares [índice, base64]
/// 2. Ordenar por índice
/// 3. Extraer los valores de fn1() y fn2() → k = fn1 + fn2
/// 4. Para cada par: char = parseInt(digits_of(atob(b64))) - k
/// 5. Concatenar todos los chars → URL final

pub fn decode_streamx305_js(html: &str) -> Option<String> {
    // Paso 1: Encontrar el array (puede llamarse ne, Bg, o cualquier nombre de 2 chars)
    // Patrón: VARNAME=[[NUM,"BASE64"],[NUM,"BASE64"],...];
    static RE_ARRAY: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"\w+=(\[\[\d+,"[A-Za-z0-9+/=]+"(?:,\[\d+,"[A-Za-z0-9+/=]+"\])*\]\]);"#).unwrap()
    });

    // Patrón más flexible para el array
    static RE_ARRAY2: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"(?:ne|[A-Z][a-z]|[a-z][A-Z])=(\[\[\d+,"[A-Za-z0-9+/=]+"(?:,\[\d+,"[A-Za-z0-9+/=]+"\])*\]\]);"#).unwrap()
    });

    // Extraer el array JSON directamente buscando el patrón [[N,"B64"],[N,"B64"],...]
    static RE_ARRAY3: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"=(\[\[\d+,"[A-Za-z0-9+/=]+"(?:,?\[\d+,"[A-Za-z0-9+/=]+"\]){10,}\]);"#).unwrap()
    });

    let array_str = RE_ARRAY.captures(html)
        .or_else(|| RE_ARRAY2.captures(html))
        .or_else(|| RE_ARRAY3.captures(html))
        .and_then(|c| c.get(1))
        .map(|m| m.as_str())?;

    // Paso 2: Parsear el array manualmente (no usar serde para simplificar)
    let pairs = parse_ne_array(array_str)?;

    // Paso 3: Extraer k = fn1() + fn2()
    // Las funciones tienen la forma: function NOMBRE(){return NUMERO;}
    static RE_K: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"function \w+\(\)\{return (\d+);\}"#).unwrap()
    });

    let k_values: Vec<u64> = RE_K.captures_iter(html)
        .take(2)
        .filter_map(|c| c[1].parse::<u64>().ok())
        .collect();

    if k_values.len() < 2 {
        tracing::warn!("No se encontraron las funciones k1/k2 en el JS");
        return None;
    }

    let k = k_values[0] + k_values[1];
    tracing::debug!("k = {} + {} = {}", k_values[0], k_values[1], k);

    // Paso 4: Decodificar
    use base64::Engine;
    let url: String = pairs.iter()
        .filter_map(|(_, b64)| {
            let decoded = base64::engine::general_purpose::STANDARD.decode(b64).ok()?;
            let s = String::from_utf8(decoded).ok()?;
            let digits: String = s.chars().filter(|c| c.is_ascii_digit()).collect();
            let n: u64 = digits.parse().ok()?;
            let ch = char::from_u32((n - k) as u32)?;
            Some(ch)
        })
        .collect();

    if url.starts_with("http") {
        tracing::info!("URL decodificada: {url}");
        Some(url)
    } else {
        tracing::warn!("URL decodificada no parece válida: {url}");
        None
    }
}

fn parse_ne_array(s: &str) -> Option<Vec<(u64, String)>> {
    // Patrón: [[N,"B64"],[N,"B64"],...]
    static RE_PAIR: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"\[(\d+),"([A-Za-z0-9+/=]+)"\]"#).unwrap()
    });

    let mut pairs: Vec<(u64, String)> = RE_PAIR.captures_iter(s)
        .filter_map(|c| {
            let idx: u64 = c[1].parse().ok()?;
            let b64 = c[2].to_string();
            Some((idx, b64))
        })
        .collect();

    if pairs.is_empty() {
        return None;
    }

    pairs.sort_by_key(|(idx, _)| *idx);
    Some(pairs)
}

// ─── Cache por canal para streamx305 ─────────────────────────────────────────

struct ChannelCache {
    url: String,
    cached_at: Instant,
}

static CHANNEL_CACHE: Lazy<Mutex<HashMap<String, ChannelCache>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

/// Versión con caché por canal (evita re-hacer el handshake si el token sigue vivo)
pub async fn resolve_channel_stream_cached(
    http: &reqwest::Client,
    channel_key: &str,
    playvi_url: &str,
) -> anyhow::Result<String> {
    // Los tokens duran ~15h, cache de 1h es seguro
    const CHANNEL_TTL: Duration = Duration::from_secs(3600);

    {
        let cache = CHANNEL_CACHE.lock().unwrap();
        if let Some(c) = cache.get(channel_key) {
            if c.cached_at.elapsed() < CHANNEL_TTL {
                return Ok(c.url.clone());
            }
        }
    }

    let url = resolve_channel_stream(http, playvi_url).await?;

    {
        let mut cache = CHANNEL_CACHE.lock().unwrap();
        cache.insert(channel_key.to_string(), ChannelCache {
            url: url.clone(),
            cached_at: Instant::now(),
        });
    }

    Ok(url)
}
