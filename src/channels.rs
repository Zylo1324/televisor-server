/// channels.rs — Canales estáticos + generador de M3U + resolver tvplusgratis

use once_cell::sync::Lazy;
use regex::Regex;
use std::time::{Duration, Instant};
use std::collections::HashMap;
use std::sync::Mutex;

// ─── Definición de canales ────────────────────────────────────────────────────

#[derive(Clone)]
pub struct Channel {
    pub name: &'static str,
    pub group: &'static str,
    pub logo: &'static str,
    pub slug: Option<&'static str>,   // tvplusgratis slug
    pub direct_url: Option<&'static str>, // URL directa HLS/DASH
}

pub static CHANNELS: Lazy<Vec<Channel>> = Lazy::new(|| {
    vec![
        // ── Perú ──────────────────────────────────────────────────────────────
        Channel { name: "América Televisión", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/America_Television_logo.png", slug: Some("americatv"), direct_url: None },
        Channel { name: "Latina TV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Latina_Televisi%C3%B3n_Peru_logo.svg", slug: Some("latina"), direct_url: None },
        Channel { name: "ATV", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", slug: Some("atv"), direct_url: None },
        Channel { name: "TV Perú", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", slug: Some("tvperu"), direct_url: None },
        Channel { name: "Canal N", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Canal_N_logo.png", slug: Some("canaln"), direct_url: None },
        Channel { name: "Willax", group: "Peru", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Willax_logo.jpg", slug: Some("willax"), direct_url: None },

        // ── Deportes ──────────────────────────────────────────────────────────
        Channel { name: "ESPN", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: Some("espn"), direct_url: Some("http://190.93.224.42/bein/espnlat/index.m3u8") },
        Channel { name: "ESPN 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: Some("espn2"), direct_url: Some("http://190.93.224.42/bein/espn2lat/index.m3u8") },
        Channel { name: "ESPN 3", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: Some("espn3"), direct_url: Some("http://190.93.224.42/bein/espn3lat/index.m3u8") },
        Channel { name: "ESPN Premium", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: Some("espnpremium"), direct_url: None },
        Channel { name: "DSports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: Some("dsports"), direct_url: Some("http://190.93.224.42/bein/directvlat/index.m3u8") },
        Channel { name: "DSports 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: Some("dsports2"), direct_url: Some("http://190.93.224.42/bein/directv2lat/index.m3u8") },
        Channel { name: "Fox Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Fox_Sports_logo.svg", slug: Some("foxsports"), direct_url: None },
        Channel { name: "Fox Sports 2", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Fox_Sports_logo.svg", slug: Some("foxsports2"), direct_url: None },
        Channel { name: "TNT Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/TNT_Sports_logo.svg", slug: Some("tntsports"), direct_url: None },
        Channel { name: "Movistar LaLiga", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fb/LaLiga_logo.svg", slug: Some("movistarlaliga"), direct_url: None },
        Channel { name: "bein Sports", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/BeIN_Sports_logo.svg", slug: Some("beinsports"), direct_url: None },

        // ── Entretenimiento / Noticias ─────────────────────────────────────────
        Channel { name: "CNN en Español", group: "Noticias", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg", slug: Some("cnn"), direct_url: None },
        Channel { name: "Cartoon Network", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg", slug: Some("cartoonnetwork"), direct_url: None },
        Channel { name: "Discovery Channel", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/7/74/Discovery-channel-logo.png", slug: Some("discovery"), direct_url: None },
        Channel { name: "National Geographic", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/National_Geographic_logo.svg", slug: Some("natgeo"), direct_url: None },
    ]
});

// ─── Generador de M3U ─────────────────────────────────────────────────────────

/// Genera lista M3U de canales estáticos.
/// Si `filter_group` es Some("Deportes") solo incluye canales de ese grupo.
pub fn generate_m3u(filter_group: Option<&str>) -> String {
    let server_base = std::env::var("SERVER_URL")
        .unwrap_or_else(|_| "http://localhost:10000".into());
    let api_key = std::env::var("API_KEY")
        .unwrap_or_else(|_| "televisor2024".into());

    let mut lines = vec![
        "#EXTM3U x-tvg-url=\"\"".to_string(),
        format!("# Televisor Cloud — {}", chrono::Utc::now().format("%Y-%m-%d %H:%M UTC")),
        String::new(),
    ];

    for ch in CHANNELS.iter() {
        if let Some(g) = filter_group {
            if !ch.group.eq_ignore_ascii_case(g) {
                continue;
            }
        }

        lines.push(format!(
            "#EXTINF:-1 tvg-name=\"{}\" tvg-logo=\"{}\" group-title=\"{}\",{}",
            ch.name, ch.logo, ch.group, ch.name
        ));

        // Preferir URL directa si está disponible, sino usar el proxy
        let stream_url = if let Some(direct) = ch.direct_url {
            direct.to_string()
        } else if let Some(slug) = ch.slug {
            format!("{server_base}/live.m3u8?slug={slug}&key={api_key}")
        } else {
            continue;
        };

        lines.push(stream_url);
    }

    lines.join("\n")
}

// ─── Resolver tvplusgratis stream ─────────────────────────────────────────────

struct StreamCache {
    url: String,
    cached_at: Instant,
}

static STREAM_CACHE: Lazy<Mutex<HashMap<String, StreamCache>>> =
    Lazy::new(|| Mutex::new(HashMap::new()));

const STREAM_TTL: Duration = Duration::from_secs(2500); // ~42 min

/// Resuelve un slug de tvplusgratis.org a una URL M3U8 real.
/// Mismo algoritmo que el proxy local de src-tauri/src/lib.rs.
pub async fn resolve_tvplusgratis_stream(
    http: &reqwest::Client,
    slug: &str,
) -> anyhow::Result<String> {
    // Cache check
    {
        let cache = STREAM_CACHE.lock().unwrap();
        if let Some(c) = cache.get(slug) {
            if c.cached_at.elapsed() < STREAM_TTL {
                return Ok(c.url.clone());
            }
        }
    }

    let url = do_tvplusgratis_handshake(http, slug).await?;

    {
        let mut cache = STREAM_CACHE.lock().unwrap();
        cache.insert(slug.to_string(), StreamCache {
            url: url.clone(),
            cached_at: Instant::now(),
        });
    }

    Ok(url)
}

async fn do_tvplusgratis_handshake(
    http: &reqwest::Client,
    slug: &str,
) -> anyhow::Result<String> {
    // Paso 1: core.php
    let core_url = format!("https://www.tvplusgratis.org/live/core.php?canal={slug}");
    let core_html = http
        .get(&core_url)
        .header("referer", "https://www.tvplusgratis.org/")
        .send()
        .await?
        .text()
        .await?;

    // Extraer URL del iframe stream.php
    static RE_STREAM: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"src=['"]([^'"]*stream\.php[^'"]*)['""]"#).unwrap()
    });

    let stream_url = RE_STREAM.captures(&core_html)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .ok_or_else(|| anyhow::anyhow!("No se encontró stream.php en core.php"))?;

    // Paso 2: stream.php
    let stream_html = http
        .get(&stream_url)
        .header("referer", &core_url)
        .send()
        .await?
        .text()
        .await?;

    // Extraer URL playlist.php
    static RE_PLAYLIST: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"var\s+src\s*=\s*["']([^"']+playlist\.php[^"']*)['""]"#).unwrap()
    });

    let playlist_url = RE_PLAYLIST.captures(&stream_html)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .ok_or_else(|| anyhow::anyhow!("No se encontró playlist.php en stream.php"))?;

    // Paso 3: playlist.php → devuelve #EXTM3U real
    let playlist_content = http
        .get(&playlist_url)
        .header("referer", &stream_url)
        .send()
        .await?
        .text()
        .await?;

    // Extraer la primera URL de stream del playlist
    static RE_TS: Lazy<Regex> = Lazy::new(|| {
        Regex::new(r#"(https?://[^\s]+\.m3u8[^\s]*)"#).unwrap()
    });

    let final_url = RE_TS.captures(&playlist_content)
        .and_then(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .unwrap_or(playlist_url); // fallback: usar playlist_url directamente

    Ok(final_url)
}
