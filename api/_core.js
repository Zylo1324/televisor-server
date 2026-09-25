// api/_core.js — Core engine for M3U generation, scraping, and stream decoding

import { waitUntil } from "@vercel/functions";

const API_KEY_DEFAULT = process.env.API_KEY || "televisor2024";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// ─── Static Channel Catalog ──────────────────────────────────────────────────
export const CHANNELS = [
  // ── Nacionales (Dial Chiclayo y Canales Peruanos) ───────────────────────────
  { chno: 2, name: "Latina TV (HD 1080p - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Latina_Televisi%C3%B3n_Peru_logo.svg", directUrl: "http://190.93.224.43/LATINA/index.m3u8" },
  { chno: 3, name: "Movistar Deportes (HD)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Movistar_Deportes_logo.png", slug: "movistardeportes" },
  { chno: 4, name: "América Televisión (HD 1080p - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/4/47/America_Television_logo.png", directUrl: "http://190.93.224.43/AMERICA-TV/index.m3u8" },
  { chno: 5, name: "Panamericana TV (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Panamericana_Television_logo.png", directUrl: "http://190.93.224.43/PANAMERICANA/index.m3u8" },
  { chno: 6, name: "Exitosa TV (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/9/90/Corporacion_Universal.png", directUrl: "http://190.93.224.43/EXITOSA/index.m3u8" },
  { chno: 7, name: "TV Perú (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/TV-PERU/index.m3u8" },
  { chno: 8, name: "Nativa TV (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/USMP_TV.png", directUrl: "http://190.93.224.42/NATIVA-TV/index.m3u8" },
  { chno: 9, name: "ATV (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/ATV/index.m3u8" },
  { chno: 10, name: "ATV+ (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/ATV-PLUS/index.m3u8" },
  { chno: 11, name: "Viva TV (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/VIVA-TV/index.m3u8" },
  { chno: 12, name: "TV Perú Noticias (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/TV-PERU-NOTICIAS/index.m3u8" },
  { chno: 13, name: "Global Televisión (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/GLOBAL/index.m3u8" },
  { chno: 14, name: "RPP Noticias (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/RPP_Noticias_logo.png", directUrl: "http://190.93.224.43/RPP/index.m3u8" },
  { chno: 15, name: "La Tele (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "http://190.93.224.43/LA-TELE/index.m3u8" },
  { chno: 16, name: "Willax Televisión (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/4/42/Willax_logo.jpg", directUrl: "http://190.93.224.43/WILLAX/index.m3u8" },
  { chno: 17, name: "ATV Sur (HD)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/ATV_logo.png", directUrl: "https://dnhmqt6n0lkaq.cloudfront.net/ts:abr.m3u8" },
  { chno: 18, name: "Canal IPe (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/IPE/index.m3u8" },
  { chno: 19, name: "Justicia TV (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/TV_Per%C3%BA.svg", directUrl: "http://190.93.224.43/JUSTICIA-TV/index.m3u8" },
  { chno: 21, name: "Bethel Televisión (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Bethel_Television_logo.png", directUrl: "http://190.93.224.43/BETHEL/index.m3u8" },
  { chno: 33, name: "USMP TV (HD - 16ms)", group: "Nacionales (Chiclayo)", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/USMP_TV.png", directUrl: "http://190.93.224.43/USMP/index.m3u8" },

  // ── Deportes (Fútbol y Canales Deportivos) ──────────────────────────────────
  { chno: 40, name: "Liga 1 MAX (HD 1080p 60fps - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Liga1_peru_logo.png", directUrl: "http://190.93.224.43/LIGA-1-MAX/index.m3u8" },
  { chno: 41, name: "Liga 1 MAX (Respaldo HD 1080p)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/8/81/Liga1_peru_logo.png", directUrl: "http://190.93.224.43/LIGA-1-MAX/index.m3u8" },
  { chno: 42, name: "ESPN (HD - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN/index.m3u8" },
  { chno: 43, name: "ESPN 2 (HD - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-2/index.m3u8" },
  { chno: 44, name: "ESPN 3 (HD - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-3/index.m3u8" },
  { chno: 45, name: "FOX Sports 1 / ESPN 4 (HD 60fps - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Fox_Sports_logo.svg", directUrl: "http://190.93.224.43/ESPN-4/index.m3u8" },
  { chno: 46, name: "FOX Sports 2 / ESPN 5 (HD 60fps - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Fox_Sports_logo.svg", directUrl: "http://190.93.224.43/ESPN-5/index.m3u8" },
  { chno: 47, name: "FOX Sports 3 / ESPN 6 (HD 60fps - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Fox_Sports_logo.svg", directUrl: "http://190.93.224.43/ESPN-6/index.m3u8" },
  { chno: 48, name: "FOX Sports Premium / ESPN 7 (HD 60fps - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Fox_Sports_logo.svg", directUrl: "http://190.93.224.43/ESPN-7/index.m3u8" },
  { chno: 49, name: "ESPN Premium (HD 60fps - 16ms)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", directUrl: "http://190.93.224.43/ESPN-PREMIUM/index.m3u8" },
  { chno: 50, name: "Claro Sports HD", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Claro_Sports_logo.svg", slug: "claro-sports" },
  { chno: 51, name: "DSPORTS (DirecTV Sports)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", slug: "dsports" },
  { chno: 52, name: "DSPORTS 2 (DirecTV Sports 2)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", slug: "dsports2" },
  { chno: 53, name: "DSPORTS + (DirecTV Sports +)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", slug: "dsportsplus" },
  { chno: 54, name: "TyC Sports (HD 1080p)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/6/62/TyC_Sports_logo.svg", directUrl: "http://15.204.246.24:8080/TyCSportsHD/index.m3u8" },
  { chno: 55, name: "TNT Sports Premium Argentina", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/TNT_Sports_logo.svg", slug: "tntsports" },
  { chno: 56, name: "TNT Sports Premium Chile", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4f/TNT_Sports_logo.svg", slug: "tntchile" },
  { chno: 57, name: "Win Sports +", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Win_Sports_logo.svg", slug: "winplus" },
  { chno: 58, name: "Win Sports (HD 1080p)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Win_Sports_logo.svg", directUrl: "http://138.121.15.230:9002/WIN-SPORT/index.m3u8" },
  { chno: 59, name: "Tigo Sports HD", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", directUrl: "http://190.61.90.17:40000/play/a02v/index.m3u8" },
  { chno: 60, name: "FOX Sports 1 (Señal México HD)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Fox_Sports_logo.svg", slug: "foxsports1" },
  { chno: 61, name: "FOX Sports 2 (Señal México HD)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Fox_Sports_logo.svg", slug: "foxsports2" },
  { chno: 62, name: "FOX Sports 3 (Señal México HD)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/22/Fox_Sports_logo.svg", slug: "foxsports3" },
  { chno: 63, name: "DAZN - Turquía vs Francia (Full HD 1080p 50fps)", group: "Deportes", logo: "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/international/dazn-int.png", slug: "dazn-turquia-francia" },
  { chno: 65, name: "Paramount Network (HD 1080p 60fps con respaldo)", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Paramount_Network.svg", slug: "paramount" },

  // ── Películas, Series y Premium (HBO, Warner, Sony, etc.) ───────────────────
  { chno: 70, name: "HBO 2 (HD 1080p - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-2/index.m3u8" },
  { chno: 71, name: "HBO Family (HD 1080p - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-FAMILY/index.m3u8" },
  { chno: 72, name: "HBO Plus (HD 1080p)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://15.204.246.24:8080/HBOPlusHD/index.m3u8" },
  { chno: 73, name: "HBO Signature (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-SIGNATURE/index.m3u8" },
  { chno: 74, name: "HBO Xtreme (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg", directUrl: "http://190.93.224.43/HBO-XTREME/index.m3u8" },
  { chno: 75, name: "TNT (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/1/15/TNT_Logo_2016.svg", directUrl: "http://190.93.224.43/TNT/index.m3u8" },
  { chno: 76, name: "TNT Series (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/TNT_Series_logo.svg", directUrl: "http://190.93.224.43/TNT-SERIES/index.m3u8" },
  { chno: 77, name: "TNT Novelas (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/TNT_Novelas_logo.svg", directUrl: "http://190.93.224.43/TNT-NOVELAS/index.m3u8" },
  { chno: 78, name: "Space (HD 1080p)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Space_logo.svg", directUrl: "http://181.119.66.28:8081/SPACE/index.m3u8" },
  { chno: 79, name: "AXN (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fb/AXN_Logo.svg", directUrl: "http://190.93.224.43/AXN/index.m3u8" },
  { chno: 80, name: "FX (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/c/c5/FX_logo.svg", directUrl: "http://190.93.224.43/FX/index.m3u8" },
  { chno: 81, name: "Sony Channel (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Sony_Channel_logo.svg", directUrl: "http://190.93.224.43/SONY-CHANNEL/index.m3u8" },
  { chno: 82, name: "Star Channel (HD 1080p)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/Star_Channel_2021.svg", directUrl: "http://181.119.66.28:8081/STAR-CHANNEL/index.m3u8" },
  { chno: 83, name: "Warner Channel (HD 1080p)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/3/36/Warner_Channel_2021.svg", directUrl: "http://15.204.246.24:8080/WarnerChannelHD/index.m3u8" },
  { chno: 84, name: "Cinemax HD", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/a/ab/Cinemax_logo_2016.svg", slug: "cinemax" },
  { chno: 85, name: "Golden (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Golden_Logo.png", directUrl: "http://190.93.224.43/GOLDEN/index.m3u8" },
  { chno: 86, name: "Golden Premiere HD", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Golden_Logo.png", slug: "golden-premier" },
  { chno: 87, name: "Cinecanal (HD 1080p)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Cinecanal_2016.svg", directUrl: "http://138.121.15.230:9002/CINECANAL/index.m3u8" },
  { chno: 88, name: "Studio Universal (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Studio_Universal_2016.png", directUrl: "http://190.93.224.43/STUDIO-UNIVERSAL/index.m3u8" },
  { chno: 89, name: "Comedy Central (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Comedy_Central_2018.svg", directUrl: "http://190.93.224.43/COMEDY-CENTRAL/index.m3u8" },
  { chno: 90, name: "Film & Arts (HD - 16ms)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/0/06/Film_%26_Arts.png", directUrl: "http://190.93.224.43/FILM-AND-ARTS/index.m3u8" },

  // ── Infantil ───────────────────────────────────────────────────────────────
  { chno: 91, name: "Cartoon Network (HD 1080p)", group: "Infantil", logo: "https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg", directUrl: "http://181.119.66.28:8081/CARTOON-NETWORK/index.m3u8" },
  { chno: 92, name: "Cartoonito (HD 1080p)", group: "Infantil", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Cartoonito_2021.svg", directUrl: "http://181.119.66.28:8081/CARTOONITO/index.m3u8" },
  { chno: 93, name: "Nickelodeon (HD - 16ms)", group: "Infantil", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Nickelodeon_2009_logo.svg", directUrl: "http://190.93.224.43/NICK/index.m3u8" },
  { chno: 94, name: "Discovery Kids (HD - 16ms)", group: "Infantil", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Discovery_Kids_2016.svg", directUrl: "http://190.93.224.43/DISCOVERY-KIDS/index.m3u8" },
  { chno: 95, name: "Disney Jr (HD 720p)", group: "Infantil", logo: "https://upload.wikimedia.org/wikipedia/commons/5/52/Disney_Junior_2011_logo.svg", directUrl: "http://181.78.14.26:4000/play/a073/index.m3u8" },
  { chno: 96, name: "Adult Swim Latinoamérica (HD 720p)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Adult_Swim_2003_logo.svg/960px-Adult_Swim_2003_logo.svg.png", slug: "adult-swim" },

  // ── Cultura y Variedades ───────────────────────────────────────────────────
  { chno: 100, name: "Discovery Home & Health (H&H) (HD 1080p)", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Discovery_Home_%26_Health_logo.png", directUrl: "http://190.61.90.17:40000/play/a0hw/index.m3u8" },
  { chno: 101, name: "El Gourmet (HD - 16ms)", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/El_Gourmet_logo.png", directUrl: "http://190.93.224.43/EL-GOURMET/index.m3u8" },
  { chno: 102, name: "History Channel (HD 1080p)", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/History_Logo.svg", directUrl: "http://138.121.15.230:9002/HISTORY-CHANNEL/index.m3u8" },
  { chno: 103, name: "History 2 (HD 1080p)", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/History_2_logo.svg", directUrl: "http://181.119.66.28:8081/HISTORY-2/index.m3u8" },
  { chno: 104, name: "National Geographic (HD - 16ms)", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/National_Geographic_logo.svg", directUrl: "http://190.93.224.43/NAT-GEO/index.m3u8" },
  { chno: 105, name: "Discovery Turbo (HD - 16ms)", group: "Cultura", logo: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Discovery_Turbo_Logo.svg", directUrl: "http://190.93.224.43/DISCOVERY-TURBO/index.m3u8" },

  // ── Noticias e Internacional ───────────────────────────────────────────────
  { chno: 110, name: "CNN en Español (HD - 16ms)", group: "Noticias", logo: "https://upload.wikimedia.org/wikipedia/commons/b/bb/CNN_en_Espa%C3%B1ol_logo.svg", directUrl: "http://190.93.224.43/CNN-ESPANOL/index.m3u8" },
  { chno: 111, name: "Telemundo Puerto Rico (HD 1080p)", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Telemundo_logo.svg", directUrl: "https://nbculocallive.akamaized.net/hls/live/2037499/puertorico/stream1/master.m3u8" },
  { chno: 112, name: "Canal de las Estrellas (HD - 16ms)", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Telemundo_logo.svg", directUrl: "http://190.93.224.43/CANAL-LAS-ESTRELLAS/index.m3u8" },
  { chno: 113, name: "Univisión (HD - 16ms)", group: "Entretenimiento", logo: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Telemundo_logo.svg", directUrl: "http://190.93.224.43/UNIVISION/index.m3u8" },
];

// ─── Mapping: Direct HLS Streams (Optimized Dynamic Window) ───────────────────
export const DIRECT_HLS_MAP = {
  movistardeportes: "http://45.185.163.75:8000/play/a0i9/index.m3u8",
  "movistar-deportes": "http://45.185.163.75:8000/play/a0i9/index.m3u8",
  movistar: "http://45.185.163.75:8000/play/a0i9/index.m3u8",
  cmd: "http://45.185.163.75:8000/play/a0i9/index.m3u8",
  "claro-sports": "http://45.185.163.75:8000/play/a07k/index.m3u8",
  clarosports: "http://45.185.163.75:8000/play/a07k/index.m3u8",
  "claro-sport": "http://45.185.163.75:8000/play/a07k/index.m3u8",
  foxsports1: "http://190.93.224.43/ESPN-4/index.m3u8",
  "fox-sports-1": "http://190.93.224.43/ESPN-4/index.m3u8",
  "fox-sports": "http://190.93.224.43/ESPN-4/index.m3u8",
  foxsports2: "http://190.93.224.43/ESPN-5/index.m3u8",
  "fox-sports-2": "http://190.93.224.43/ESPN-5/index.m3u8",
  foxsports3: "http://190.93.224.43/ESPN-6/index.m3u8",
  "fox-sports-3": "http://190.93.224.43/ESPN-6/index.m3u8",
  "dazn-turquia-francia": [
    "https://admin2.passionepizza.com.br/france.m3u8",
    "https://live05.meung.app/live/08552895_tsc.m3u8",
  ],
  "star-channel": "http://45.185.163.75:8000/play/a0dm/index.m3u8",
  "warner-channel": "http://45.185.163.75:8000/play/a0dn/index.m3u8",
  cinemax: "http://45.185.163.75:8000/play/a014/index.m3u8",
  "golden-premier": "http://45.185.163.75:8000/play/a0fv/index.m3u8",
  cinecanal: "http://45.185.163.75:8000/play/a0dp/index.m3u8",
  "cartoon-network": "http://45.185.163.75:8000/play/a0e0/index.m3u8",
  cartoonito: "http://45.185.163.75:8000/play/a0e2/index.m3u8",
  "discovery-hh": "http://45.185.163.75:8000/play/a0c9/index.m3u8",
  paramount: [
    "http://4.30.180.36:8420/paramount/index.m3u8?token=test",
    "http://23.237.104.106:8080/USA_PARAMOUNT_NETWORK/index.m3u8",
  ],
  "paramount-network": [
    "http://4.30.180.36:8420/paramount/index.m3u8?token=test",
    "http://23.237.104.106:8080/USA_PARAMOUNT_NETWORK/index.m3u8",
  ],
  "adult-swim": [
    "http://168.197.104.22/ADULT_SWIM/index.m3u8",
    "http://45.162.64.114/ADULT_SWIM/index.m3u8",
  ],
  adultswim: [
    "http://168.197.104.22/ADULT_SWIM/index.m3u8",
    "http://45.162.64.114/ADULT_SWIM/index.m3u8",
  ],
};

// ─── Mapping: Slugs to TVF90 1080p Flussonic Cluster (PelotaLibre) ───────────
export const TVF90_MAP = {
  foxsports: "foxsports",
  foxsports1: "foxsports",
  "fox-sports": "foxsports",
  "fox-sports-1": "foxsports",
  foxsports2: "foxsports2",
  "fox-sports-2": "foxsports2",
  foxsports3: "foxsports3",
  "fox-sports-3": "foxsports3",
  movistardeportes: "movistar",
  "movistar-deportes": "movistar",
  movistar: "movistar",
  cmd: "movistar",
  dsports: "dsports",
  "directv-sports": "dsports",
  dsports2: "dsports2",
  "directv-sports-2": "dsports2",
  dsportsplus: "dsportsplus",
  "directv-sports-plus": "dsportsplus",
  tycsports: "tycsports",
  "tyc-sports": "tycsports",
  liga1max: "liga1max",
  "liga-1-max": "liga1max",
};

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

    const chNo = ch.chno ? ` tvg-chno="${ch.chno}"` : "";
    const logoUrl = `${baseUrl}/logos/${ch.chno}.png`;
    lines.push(
      `#EXTINF:-1 tvg-name="${ch.name}"${chNo} tvg-logo="${logoUrl}" group-title="${ch.group}",${ch.name}`
    );

    const streamUrl = ch.directUrl || `${baseUrl}/live.m3u8?slug=${ch.slug}&key=${apiKey}`;
    lines.push(streamUrl);
  }

  return lines.join("\n");
}

// ─── Instream Auto-Renovating Dynamic Resolver (Low Latency & Anti-Buffering) ──

// Two-tier cache:
// 1. tokenCache: stores upstream streamUrls for 10 minutes so we don't re-scrape instream.click HTML on every poll.
// 2. manifestCache: stores parsed M3U8 for ONLY 1.5 seconds so live sequence numbers advance smoothly and never stall!
const tokenCache = new Map();
const TOKEN_CACHE_TTL = 10 * 60 * 1000; // 10 minutos

const manifestCache = new Map();
const MANIFEST_CACHE_TTL = 1500; // 1.5 segundos

function proxySegmentUrl(segmentUrl, referer, slug, offset, proxyBaseUrl, apiKey) {
  if (!proxyBaseUrl) return segmentUrl;
  const proxyUrl = new URL("/segment.ts", proxyBaseUrl);
  proxyUrl.searchParams.set("url", segmentUrl);
  proxyUrl.searchParams.set("ref", referer);
  proxyUrl.searchParams.set("slug", slug);
  proxyUrl.searchParams.set("offset", String(offset));
  proxyUrl.searchParams.set("key", apiKey || API_KEY_DEFAULT);
  return proxyUrl.href;
}

export async function resolveInstreamM3U8(streamId, proxyBaseUrl, apiKey) {
  const now = Date.now();

  // Tier 2: Check ultra-short live manifest cache (1.5s)
  const cachedManifest = manifestCache.get(streamId);
  if (cachedManifest && now - cachedManifest.time < MANIFEST_CACHE_TTL && cachedManifest.content) {
    return cachedManifest.content;
  }

  // Tier 1: Check token cache or scrape fresh URLs
  let urls = null;
  const cachedToken = tokenCache.get(streamId);
  if (cachedToken && now - cachedToken.time < TOKEN_CACHE_TTL && cachedToken.urls) {
    urls = cachedToken.urls;
  } else {
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

    urls = [m[1], m[2]].filter(Boolean).map(u => u.replace(/\\u0026/g, "&"));
    tokenCache.set(streamId, { urls, time: now });
  }

  // Fetch the fresh live manifest from upstream CDN
  let m3u8Text = null;
  let activeUrl = null;

  for (const rawUrl of urls) {
    try {
      const upstreamRes = await fetch(rawUrl, {
        headers: {
          "user-agent": UA,
          "referer": "https://instream.click/",
        },
        signal: AbortSignal.timeout(5000),
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

  // If cached token failed, invalidate and try scraping once more
  if (!m3u8Text) {
    tokenCache.delete(streamId);
    throw new Error(`El stream ${streamId} no devolvió una lista M3U8 válida`);
  }

  const targetObj = new URL(activeUrl);
  const basePath = activeUrl.substring(0, activeUrl.lastIndexOf("/") + 1);

  // ── LOW-LATENCY & ANTI-BUFFERING ENGINE ───────────────────────────────────────
  // Parse segments and sequence to create an ultra-low latency sliding window
  const lines = m3u8Text.split("\n");
  const seqMatch = m3u8Text.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/);
  const origSeq = seqMatch ? parseInt(seqMatch[1]) : 0;
  const targetDurMatch = m3u8Text.match(/#EXT-X-TARGETDURATION:(\d+)/);
  const targetDur = targetDurMatch ? targetDurMatch[1] : "7";

  const segments = [];
  let currentInf = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#EXTINF:")) {
      currentInf = trimmed;
    } else if (currentInf && !trimmed.startsWith("#")) {
      const fullTs = trimmed.startsWith("http")
        ? trimmed
        : (trimmed.startsWith("/") ? `${targetObj.origin}${trimmed}` : `${basePath}${trimmed}`);
      segments.push({ inf: currentInf, ts: fullTs });
      currentInf = null;
    }
  }

  // Keep last 4 segments:
  // - Starts instantly with only 1 chunk buffer (~700KB download)
  // - Low bandwidth consumption (works smoothly on slow Wi-Fi / mobile data)
  // - Reduces broadcast latency to 6-10 seconds (near real-time live edge)
  const KEEP_COUNT = 4;
  const keptSegments = segments.length > KEEP_COUNT ? segments.slice(-KEEP_COUNT) : segments;
  const droppedCount = segments.length - keptSegments.length;
  const newSeq = origSeq + droppedCount;

  const outputLines = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `#EXT-X-MEDIA-SEQUENCE:${newSeq}`,
    `#EXT-X-TARGETDURATION:${targetDur}`,
  ];

  for (const [index, seg] of keptSegments.entries()) {
    outputLines.push(seg.inf);
    outputLines.push(proxySegmentUrl(
      seg.ts,
      "https://instream.click/",
      streamId,
      index - keptSegments.length,
      proxyBaseUrl,
      apiKey,
    ));
  }

  const optimizedM3U8 = outputLines.join("\n");
  manifestCache.set(streamId, { content: optimizedM3U8, time: now });
  return optimizedM3U8;
}

// ─── Direct HLS Stream Resolver ───────────────────────────────────────────────

// Astra's variant URL stays valid across playlist refreshes. Reusing it avoids
// fetching the master playlist on every cache miss, while a failed variant is
// retried through the master immediately.
const hlsVariantCache = new Map();
// Astra variant paths are stable. Reuse them for ten minutes and invalidate
// immediately on any failed refresh, avoiding an extra master request every
// time a Smart TV polls the live window.
const HLS_VARIANT_TTL = 10 * 60 * 1000;
const hlsRequests = new Map();
const HLS_STALE_TTL = 15000;

async function fetchHlsText(url) {
  const response = await fetch(url, {
    headers: { "user-agent": UA },
    signal: AbortSignal.timeout(6000),
  });
  if (!response.ok) throw new Error(`Stream upstream retornó HTTP ${response.status}`);
  const text = await response.text();
  if (!text.startsWith("#EXTM3U")) throw new Error("Stream upstream no devolvió M3U8");
  return text;
}

async function loadDirectHls(m3u8Url, streamKey) {
  let activeUrl = m3u8Url;
  let text;
  const cachedVariant = hlsVariantCache.get(streamKey);

  if (cachedVariant && cachedVariant.expires > Date.now()) {
    try {
      activeUrl = cachedVariant.url;
      text = await fetchHlsText(activeUrl);
    } catch {
      hlsVariantCache.delete(streamKey);
      activeUrl = m3u8Url;
    }
  }

  if (!text) {
    text = await fetchHlsText(m3u8Url);
    if (text.includes("#EXT-X-STREAM-INF")) {
      const lines = text.split("\n");
      const index = lines.findIndex((line) => line.startsWith("#EXT-X-STREAM-INF"));
      const subUrl = lines.slice(index + 1).find((line) => line.trim() && !line.startsWith("#"));
      if (!subUrl) throw new Error("Master playlist sin variante HLS");
      activeUrl = new URL(subUrl.trim(), m3u8Url).href;
      text = await fetchHlsText(activeUrl);
      hlsVariantCache.set(streamKey, { url: activeUrl, expires: Date.now() + HLS_VARIANT_TTL });
    }
  }

  if (text.includes("#EXT-X-STREAM-INF")) throw new Error("Variante HLS no resuelta");
  return { text, activeUrl };
}

export async function resolveHlsStream(m3u8Url, streamKey) {
  const now = Date.now();
  const cached = manifestCache.get(streamKey);
  const cacheAge = cached ? now - cached.time : Infinity;
  if (cached?.content && cacheAge < MANIFEST_CACHE_TTL) {
    return cached.content;
  }

  let request = hlsRequests.get(streamKey);
  if (!request) {
    request = buildDirectHls(m3u8Url, streamKey);
    hlsRequests.set(streamKey, request);
    request.then(
      () => hlsRequests.delete(streamKey),
      () => hlsRequests.delete(streamKey),
    );
  }

  // On Vercel, return a recent live window immediately and refresh it after
  // the response. This prevents a slow upstream poll from delaying the player.
  if (process.env.VERCEL && cached?.content && cacheAge < HLS_STALE_TTL) {
    waitUntil(request.catch((err) => {
      console.error(`[HLS background refresh] ${streamKey}:`, err.message);
    }));
    return cached.content;
  }

  try {
    return await request;
  } catch (err) {
    if (cached?.content && cacheAge < HLS_STALE_TTL) return cached.content;
    throw err;
  }
}

async function buildDirectHls(m3u8Url, streamKey) {
  const { text, activeUrl } = await loadDirectHls(m3u8Url, streamKey);

  // Parse the upstream sequence and its current live window.
  const lines = text.split("\n");
  const seqMatch = text.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/);
  const origSeq = seqMatch ? parseInt(seqMatch[1]) : 0;
  const targetDurMatch = text.match(/#EXT-X-TARGETDURATION:(\d+)/);
  const targetDur = targetDurMatch ? targetDurMatch[1] : "3";

  const segments = [];
  let currentInf = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#EXTINF:")) {
      currentInf = trimmed;
    } else if (currentInf && !trimmed.startsWith("#")) {
      const fullTs = trimmed.startsWith("http") ? trimmed : new URL(trimmed, activeUrl).href;
      segments.push({ inf: currentInf, ts: fullTs });
      currentInf = null;
    }
  }

  if (!segments.length) throw new Error("Playlist HLS sin fragmentos");

  // Astra can advertise its newest segment while it still contains only one
  // 188-byte MPEG-TS packet. Keep completed segments so Smart TVs do not loop
  // while waiting for that open segment to fill.
  const MAX_RING_SEGMENTS = 6;
  const completedSegments = segments.length > 1 ? segments.slice(0, -1) : segments;
  const dropped = Math.max(0, completedSegments.length - MAX_RING_SEGMENTS);
  const keptSegments = completedSegments.slice(dropped);

  const outputLines = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `#EXT-X-MEDIA-SEQUENCE:${origSeq + dropped}`,
    `#EXT-X-TARGETDURATION:${targetDur}`,
  ];

  for (const seg of keptSegments) {
    outputLines.push(seg.inf);
    outputLines.push(seg.ts);
  }

  const optimizedM3U8 = outputLines.join("\n");
  manifestCache.set(streamKey, { content: optimizedM3U8, time: Date.now() });
  return optimizedM3U8;
}

export async function resolveHlsStreamWithFallback(sourceUrls, streamKey) {
  const errors = [];
  for (const [index, sourceUrl] of sourceUrls.entries()) {
    try {
      const sourceKey = index === 0 ? streamKey : `${streamKey}:backup-${index}`;
      return await resolveHlsStream(sourceUrl, sourceKey);
    } catch (err) {
      errors.push(`${sourceUrl}: ${err.message}`);
    }
  }
  throw new Error(`ninguna fuente HLS respondió (${errors.join("; ")})`);
}

// ─── TVF90 / FTL.LY Auto-Renovating Dynamic Resolver (PelotaLibre 1080p HD) ─────
const tvf90TokenCache = new Map();
const TVF90_TOKEN_TTL = 3 * 60 * 60 * 1000; // 3 horas

export async function resolveTvf90M3U8(streamId, cleanSlug, proxyBaseUrl, apiKey) {
  const now = Date.now();
  const cacheKey = `tvf90_${cleanSlug || streamId}`;

  // Check manifest cache (1.5s live window)
  const cachedManifest = manifestCache.get(cacheKey);
  if (cachedManifest && now - cachedManifest.time < MANIFEST_CACHE_TTL && cachedManifest.content) {
    return cachedManifest.content;
  }

  let masterUrl = null;
  const cachedToken = tvf90TokenCache.get(streamId);
  if (cachedToken && now - cachedToken.time < TVF90_TOKEN_TTL && cachedToken.url) {
    masterUrl = cachedToken.url;
  } else {
    const pageUrl = `https://tvf90.com/5.php?stream=${streamId}`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        "user-agent": UA,
        "referer": "https://pelotalibre.net.pe/",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!pageRes.ok) {
      throw new Error(`tvf90 retornó HTTP ${pageRes.status}`);
    }

    const html = await pageRes.text();
    const m = html.match(/(https:\/\/[^"'\s]*mono\.m3u8\?[^"'\s]*)/);
    if (!m) {
      throw new Error(`No se encontró mono.m3u8 para ${streamId}`);
    }

    masterUrl = m[1];
    tvf90TokenCache.set(streamId, { url: masterUrl, time: now });
  }

  let m3u8Res = await fetch(masterUrl, {
    headers: {
      "user-agent": UA,
      "referer": "https://tvf90.com/",
    },
    signal: AbortSignal.timeout(6000),
  });

  if (!m3u8Res.ok) {
    tvf90TokenCache.delete(streamId);
    const retryPageRes = await fetch(`https://tvf90.com/5.php?stream=${streamId}`, {
      headers: { "user-agent": UA, "referer": "https://pelotalibre.net.pe/" },
      signal: AbortSignal.timeout(6000),
    });
    const html = await retryPageRes.text();
    const m = html.match(/(https:\/\/[^"'\s]*mono\.m3u8\?[^"'\s]*)/);
    if (m) {
      masterUrl = m[1];
      tvf90TokenCache.set(streamId, { url: masterUrl, time: now });
      m3u8Res = await fetch(masterUrl, {
        headers: { "user-agent": UA, "referer": "https://tvf90.com/" },
        signal: AbortSignal.timeout(6000),
      });
    }
  }

  if (!m3u8Res.ok) {
    throw new Error(`Upstream Flussonic retornó HTTP ${m3u8Res.status}`);
  }

  const text = await m3u8Res.text();
  const basePath = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);

  const lines = text.split("\n");
  const seqMatch = text.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/);
  const origSeq = seqMatch ? parseInt(seqMatch[1]) : 0;
  const targetDurMatch = text.match(/#EXT-X-TARGETDURATION:(\d+)/);
  const targetDur = targetDurMatch ? targetDurMatch[1] : "6";

  const segments = [];
  let currentInf = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#EXTINF:")) {
      currentInf = trimmed;
    } else if (currentInf && !trimmed.startsWith("#")) {
      const fullTs = trimmed.startsWith("http")
        ? trimmed
        : (trimmed.startsWith("/") ? new URL(trimmed, masterUrl).href : `${basePath}${trimmed}`);
      segments.push({ inf: currentInf, ts: fullTs });
      currentInf = null;
    }
  }

  const KEEP_COUNT = 4;
  const keptSegments = segments.length > KEEP_COUNT ? segments.slice(-KEEP_COUNT) : segments;
  const droppedCount = segments.length - keptSegments.length;
  const newSeq = origSeq + droppedCount;

  const outputLines = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `#EXT-X-MEDIA-SEQUENCE:${newSeq}`,
    `#EXT-X-TARGETDURATION:${targetDur}`,
  ];

  for (const [index, seg] of keptSegments.entries()) {
    outputLines.push(seg.inf);
    outputLines.push(proxySegmentUrl(
      seg.ts,
      "https://tvf90.com/",
      cleanSlug || streamId,
      index - keptSegments.length,
      proxyBaseUrl,
      apiKey,
    ));
  }

  const optimizedM3U8 = outputLines.join("\n");
  manifestCache.set(cacheKey, { content: optimizedM3U8, time: now });
  return optimizedM3U8;
}

// ─── Universal Live Stream Fetcher ───────────────────────────────────────────

export async function fetchLiveStreamM3U8(
  targetSlug,
  clientIp = "127.0.0.1",
  proxyBaseUrl = null,
  apiKey = API_KEY_DEFAULT,
) {
  if (!targetSlug) throw new Error("Falta slug de canal");
  const cleanSlug = targetSlug.toLowerCase().trim();

  // 1. Direct HLS stream (Astra ring-buffered dynamic sliding window & local fiber)
  // Zero IP locks, zero tokens, works seamlessly on Smart TVs without 403 Forbidden!
  const directHls = DIRECT_HLS_MAP[cleanSlug];
  if (directHls) {
    try {
      const sources = Array.isArray(directHls) ? directHls : [directHls];
      return await resolveHlsStreamWithFallback(sources, cleanSlug);
    } catch (err) {
      console.error(`[Direct HLS Error] ${cleanSlug}:`, err.message);
    }
  }

  // 2. PelotaLibre / TVF90 1080p Flussonic cluster (fallback)
  const tvf90Id = TVF90_MAP[cleanSlug];
  if (tvf90Id) {
    try {
      return await resolveTvf90M3U8(tvf90Id, cleanSlug, proxyBaseUrl, apiKey);
    } catch (err) {
      console.warn(`[TVF90 fallback] ${cleanSlug} (${tvf90Id}):`, err.message);
    }
  }

  // 3. Direct stream ID (e.g. H94, H95, H96) or mapped slug
  const streamId = (cleanSlug.startsWith("h") && !isNaN(cleanSlug.slice(1)))
    ? cleanSlug.toUpperCase()
    : INSTREAM_MAP[cleanSlug];

  if (streamId) {
    try {
      return await resolveInstreamM3U8(streamId, proxyBaseUrl, apiKey);
    } catch (err) {
      console.error(`[Instream Error] ${cleanSlug} (${streamId}):`, err.message);
    }
  }

  // 4. Fallback to tvplusgratis handshake if exists
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

  // Parse segments for low-latency & anti-buffering sliding window
  const lines = playlistText.split("\n");
  const seqMatch = playlistText.match(/#EXT-X-MEDIA-SEQUENCE:(\d+)/);
  const origSeq = seqMatch ? parseInt(seqMatch[1]) : 0;
  const targetDurMatch = playlistText.match(/#EXT-X-TARGETDURATION:(\d+)/);
  const targetDur = targetDurMatch ? targetDurMatch[1] : "10";

  const segments = [];
  let currentInf = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#EXTINF:")) {
      currentInf = trimmed;
    } else if (currentInf && !trimmed.startsWith("#")) {
      const fullTs = trimmed.startsWith("http") ? trimmed : new URL(trimmed, playlistUrl).href;
      segments.push({ inf: currentInf, ts: fullTs });
      currentInf = null;
    }
  }

  const KEEP_COUNT = 4;
  const keptSegments = segments.length > KEEP_COUNT ? segments.slice(-KEEP_COUNT) : segments;
  const droppedCount = segments.length - keptSegments.length;
  const newSeq = origSeq + droppedCount;

  const outputLines = [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `#EXT-X-MEDIA-SEQUENCE:${newSeq}`,
    `#EXT-X-TARGETDURATION:${targetDur}`,
  ];
  for (const seg of keptSegments) {
    outputLines.push(seg.inf);
    outputLines.push(seg.ts);
  }

  const optimizedM3U8 = outputLines.join("\n");

  tvplusCache.set(cacheKey, {
    playlistUrl,
    streamUrl,
    content: optimizedM3U8,
    time: Date.now(),
  });

  return optimizedM3U8;
}
