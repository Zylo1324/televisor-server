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
  { chno: 63, name: "DAZN (En Vivo)", group: "Deportes", logo: "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/international/dazn-int.png", logoVersion: "dazn-1", slug: "disney7" },
  { chno: 64, name: "Capo Deportes (En Vivo)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/DSPORTS_logo.png", slug: "capodeportes" },
  { chno: 66, name: "Disney+ Eventos 1 (ESPN en Disney+)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "disney1" },
  { chno: 67, name: "Disney+ Eventos 2 (ESPN en Disney+)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "disney2" },
  { chno: 68, name: "Disney+ Eventos 3 (ESPN en Disney+)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "disney3" },
  { chno: 69, name: "Disney+ Eventos 7 (ESPN en Disney+ - En Vivo)", group: "Deportes", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg", slug: "disney7" },
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
  { chno: 96, name: "Adult Swim Latinoamérica (Español 1080p)", group: "Series y Peliculas", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Adult_Swim_2003_logo.svg/960px-Adult_Swim_2003_logo.svg.png", directUrl: "http://190.14.238.117:8000/play/a035/index.m3u8" },

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

// ─── VOD Películas GoldTV (CSM_JULIO/Julionova) ─────────────────────────────
export const VOD_MOVIES = [
  { name: "72 horas (2026) (VIK)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uxUrEaqf7WnDj7UcEWcIE3Xo8hY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/567310.mp4" },
  { name: "Supergirl (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/xhei2GX9L2H1eQlrHeFw44VNLd1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/564599.mp4" },
  { name: "Citizen Vigilante (2026) | Subtitulado (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/6LmJD3Wohe0g4U62wgi7RyJqfE4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/564596.mp4" },
  { name: "The Dink: Pasión por el pickleball (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8zKenqYB6vP8LltnOxfWptpH0vG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563797.mp4" },
  { name: "Te Quiero Desde Siempre (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1fqFyMYJE5PjoH8Bhdejh4zjHvQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563794.mp4" },
  { name: "Los creyentes (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/pUvs1iFFMDy3sNp5dNmkRak1oxD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563791.mp4" },
  { name: "La Bestia Del Pantano (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/t4X5HtZBtwNzbg9K5prABkC0nDJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563788.mp4" },
  { name: "El Cobrador De Deudas (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/yWYD8XatpEMHBw9LD02OtyEqyBr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563785.mp4" },
  { name: "Angeles de Guerra (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sFNNi7wN5wZSzgxHebrZOpD1L2e.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563782.mp4" },
  { name: "72 horas (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/k64Eg5qDYnegDWnVos5oEPxmoA8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563779.mp4" },
  { name: "Elize: Sombras de una Mujer (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/a3y0aWIJdJEw7pme6Y9W0aReIN9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563201.mp4" },
  { name: "Amos del Universo (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/2byCAyHGBt29zAZlFtdI45VLnCH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/563198.mp4" },
  { name: "Insaciable (2026) | Subtitulado (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zMYFsfuHttGtHnXquWkIWI9Min8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562889.mp4" },
  { name: "Infierno bajo cero (2026) | Castellano (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/dQyyx00wZSiJlJEAT0oIo9NZVjn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562886.mp4" },
  { name: "El mal (2026) | Castellano (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8RmEO655PT9AK7Q58hIAPmpLNLT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562880.mp4" },
  { name: "El día de la revelación (2026) (D)", group: "Películas 2026", logo: "https://m.media-amazon.com/images/M/MV5BZWVmN2NiMmEtOWIzMy00ZTM3LTgyZTEtMDhhMGE5YzE4YTliXkEyXkFqcGc@._V1_.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562718.mp4" },
  { name: "Scary Movie: Terroríficamente incorrecta (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/cAvdDPtiuVCauhjCwqK4EX2woHL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562698.mp4" },
  { name: "Star Wars: The Mandalorian and Grogu (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sWitU9IjgFwf6y1OrI0zUaL3GNa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562695.mp4" },
  { name: "Socias por accidente (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/sr1Yoj6XLPTWYcbDoBy67xivW4I.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562179.mp4" },
  { name: "Nada entre los dos (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/6GZt6CfXJQgOFBA7ArLbOQYvXI8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562028.mp4" },
  { name: "La ironía del amor (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uvfBXtJ1EB3asfpJcQCN9g9Eijf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562025.mp4" },
  { name: "Heartstopper Forever (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4rsI2lhFLBXPtVScJ3rBKHwIt5b.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562022.mp4" },
  { name: "Deseo (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/5lJPvf7cJ2r2EiNrnvBVYpusKFM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562019.mp4" },
  { name: "23 000 Vidas (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/AnNQDqCXcdJrWknQtbBIlvMDboE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562016.mp4" },
  { name: "Yo antes de ser yo (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/fSSsjV7hvVS6gBaP9Sua5DEFaEh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/561508.mp4" },
  { name: "Papá a Cargo (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qox5OvknYs1XJqw3aS3d9CvSEKO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/561115.mp4" },
  { name: "Is God Is (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/u007P0KcvbVMsNUUJkVAnUqzOpm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/561112.mp4" },
  { name: "Espadas De Los Guardianes: El Viento Se Levanta En El Desierto (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/wOYPRKEdYEdTCaJ25Q9IFmsvAkD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/561109.mp4" },
  { name: "Do Not Enter (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1gHygrBcGU2dL9DHcvnj4FJc8pF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/561106.mp4" },
  { name: "Backrooms: Sin salida (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3YTb97zytlWRWZb7HrOiEhk4e6f.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/561103.mp4" },
  { name: "Susana y Elvira: Sin plan B (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/amqNq4a3cugpf48nfpZFJwnFzbb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560817.mp4" },
  { name: "Golden Kamuy: Asalto a la prisión de Abashiri (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/82GKBbN5ovZJiz5H2dSbDBrHcJ2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560814.mp4" },
  { name: "A una isla de ti (2026) | Castellano (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/j3siQa1NL6L2wIiZ0r6fKacBIp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560811.mp4" },
  { name: "El último gran golpe (2026) | Subtitulado (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zlkeH0s7dDxcnuPcHBqAyXFUxqN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560532.mp4" },
  { name: "Naufragio: Pesadilla en el mar (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/z9z9e5HgOTPuFVIVhxnHnbk89U2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560363.mp4" },
  { name: "Miguel Ángel Blanco: Las 48 horas que lo cambiaron todo (2026) | Castellano (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/7MCnV8wb1tODOrM8NmWAuPWm40Y.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560360.mp4" },
  { name: "El Ases (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rMprIGQqKpZ9cD3BjEynVB1sEOn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560357.mp4" },
  { name: "Boulevard (2026) | Castellano (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/fvk8wxyQXLlrBIMuglDxdMYLgBW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560354.mp4" },
  { name: "Amarga Navidad (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ji29dXqoeIsQiVnXAkzI4nzxMjr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560351.mp4" },
  { name: "Lucky Lu (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/jvSNREwGqNj7ksVschtlUUJ9hYu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/558932.mp4" },
  { name: "Un Portero Muy Improbable (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/2qIny8wROLKOEe89YHJgkMHiBxA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/557739.mp4" },
  { name: "The Furious (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ryOVzYoGhiOn4QtkwSa8pUTivPO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/557733.mp4" },
  { name: "El Día D: Bajo presión (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/d0PeqfICHgKnQ2f8YxyRJAg62fK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/557730.mp4" },
  { name: "Normal (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1KmqwmCPrrs06qHFmwx4kzB58kJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/557724.mp4" },
  { name: "Hasta el final (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3SKN8QZptMm8KfCCQtEmyh1Zkgz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/557721.mp4" },
  { name: "El pasajero del diablo (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/q9s0EfBsZVpg2iScoJBVf3WOxWO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/557718.mp4" },
  { name: "El pasado acecha (2026) (D)", group: "Películas 2026", logo: "https://m.media-amazon.com/images/S/pv-target-images/03729127c42d8097f8b0741f910797a7f87ef5966d14596b04bf76da2693cfa3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/554847.mp4" },
  { name: "Deseo en Manhattan (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zvRBvOyDifX3HNgqscIBtQO9jtP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/554844.mp4" },
  { name: "The Simpsons: Simpsley (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qkJefER6Ym4v2KC1v4qK34AlcVo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551852.mp4" },
  { name: "Temporada de Sangre (2025) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/lZZu0UEPtEeZ90fkX6i1pmEHOs8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551849.mp4" },
  { name: "Balística (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/f8GUHZjNPSGLjUhi7HzVn9541bY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551846.mp4" },
  { name: "Iron Maiden: Burning Ambition (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/wtXlLK1TSPLfbQZR774xLduLj16.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551484.mp4" },
  { name: "Strung (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/lWdpUOhnJ8uWWO1G1vbyUsCliov.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551481.mp4" },
  { name: "Licencia para Robar (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/fX5HV8LC2tulHI2GT9Ar8WVFyg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551478.mp4" },
  { name: "Obsesión (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rmCkNtzYR2xTOO3ZXmIqB5zgYdE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551475.mp4" },
  { name: "El diablo viste a la moda 2 (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/rdvPsRItlhErfKF8Y0f0wjnxUzz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/551472.mp4" },
  { name: "En la zona gris (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/yfgquGqeT6DtdsIzPPzTLRABBy0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/547365.mp4" },
  { name: "Hermanito (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/s8mudAYQcHmVoFSamqyv1Ron527.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/547111.mp4" },
  { name: "Un Lugar en la Mesa (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8cOEREMN6WF4Vf6IgBLU3AqmbeN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/547108.mp4" },
  { name: "El Manuscrito De Dante (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/enwGWEZs9aHkIweLjAxWV0Tqt9v.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/547105.mp4" },
  { name: "Las ovejas detectives (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/iryjE7zrVxML5UM5vCPJGtKYvWC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/547102.mp4" },
  { name: "Hokum: La maldición de la bruja (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/hzOJEzqrOtwXbPw1U5nZMvTaljQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543838.mp4" },
  { name: "La Familia Del Barrio: La Maldición del Quinto Partido (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/lGZavJahqfBhaopeeiI4samtqyt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543835.mp4" },
  { name: "Maridos en acción (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/12TfQSbwyb3t9PN0KTOTE4NB7lq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543832.mp4" },
  { name: "Mensajes de voz para Isabelle (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3nY9BG8VjuxwLLRx5BGiiuj0M71.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543829.mp4" },
  { name: "Sueños galácticos (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/dKT6A7yQWxvRhZwX5uudHofvpja.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543826.mp4" },
  { name: "El golpe final (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/vJgosLzzHbny5Kls82LnAA3iTfa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543823.mp4" },
  { name: "Una Familia de Bastardos (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zuiZDJcjlNWB6EcXHer06u9BQke.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543319.mp4" },
  { name: "The Internship (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/fYqSOkix4rbDiZW0ACNnvZCpT6X.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543316.mp4" },
  { name: "Tetracampeones: Brasil volvió a creer (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/7vW1BD3416Ev2rdB7CHKXGnzdGv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543313.mp4" },
  { name: "Poldi (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ylgaqq0NdSlnrBRtWMePYvDlTDa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543310.mp4" },
  { name: "La desconocida (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/wrjKPBd4ieJMSxO7n5GothE9WAB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543307.mp4" },
  { name: "La casa de la playa (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/373mESpAt0wKpRgUd8MBh3tjBsD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543304.mp4" },
  { name: "condena anulada (2026) (D)\\" tvg-logo=\\"https://image.tmdb.org/t/p/w600_and_h900_bestv2/iP9b3NBxJKtyzLf7CKFWl3MpgKS.jpg\\" group-title=\\"⏩ FULL ESTRENOS 2026⏪ \\",Instadocus: Alex Murdaugh, condena anulada (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/iP9b3NBxJKtyzLf7CKFWl3MpgKS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543301.mp4" },
  { name: "El asesinato de Rachel Nickell (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4gcZdPpd6xFxfFHBX0VfxvGhchO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543298.mp4" },
  { name: "Doblemente feliz (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/dCUWFwtE4cpcjncxImeXT7Bh9Yx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543295.mp4" },
  { name: "Dibu Martínez: El pibe que ataja el tiempo (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/xjBwm6dIt3TMRPK0CFDrMVmt5TG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/543292.mp4" },
  { name: "Instinto maternal (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4KdmT71AGzDMp5hJbAu9vysKQKT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542752.mp4" },
  { name: "The Amazing Digital Circus: El Ultimo Acto (2026) | Subtitulado (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/ufMZpIbrDpcUIBVYUUo4PKaMovC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542675.mp4" },
  { name: "diviértete, no mueras (2026) (D)\\" tvg-logo=\\"https://image.tmdb.org/t/p/w600_and_h900_bestv2/blfTYXDP1luoeku48pVkrZ6Zjwv.jpg\\" group-title=\\"⏩ FULL ESTRENOS 2026⏪ \\",Buena suerte, diviértete, no mueras (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/blfTYXDP1luoeku48pVkrZ6Zjwv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542170.mp4" },
  { name: "Sobre tu Cadáver (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/yf7PDJZmBWEztHSgkGEdJc0Ptdk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/541690.mp4" },
  { name: "Los colores del mal: Negro (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/v6J7FYPywQFF8ANoRRtceqIGpDM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/541687.mp4" },
  { name: "Michael (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/mB3zisIw3bsQcoDSnvMPAQhjrTM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/541435.mp4" },
  { name: "Psicópata: El Asesino del Conejo Blanco (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/7tIgfsTWuzXKR2kLRUPrLRTbcuo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/541119.mp4" },
  { name: "Risa y la cabina del viento (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/noZJqOiKcj8Ih0zqxmYfeSPlv1g.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540521.mp4" },
  { name: "El Susurro (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/evDvchrDRS2i9jKcLJpixSLjx45.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540512.mp4" },
  { name: "El choque (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/mTN9baARVvqjS8ZuMUQeFBW6z2l.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540029.mp4" },
  { name: "La casaca de Dios (2026) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/v56hSpcEnS0joV9lUn9bKpPdktl.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540023.mp4" },
  { name: "Amanda Knox: En la boca del lobo (2026) | SubEspañol", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/q2kRcAxTF39y3OXxVb8yEpMfVHs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539592.mp4" },
  { name: "La furia de Becky (2023) (D)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/eMEPuFtylazpTVaFDSZocRM13YE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539586.mp4" },
  { name: "Ídolos (2026) | Castellano", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/j2gYxk9EQXh2hz1jNZQOe9WOUXU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539318.mp4" },
  { name: "Psycho Killer (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/5xgxxmLivJXL8aF0HdZfpx8aAIo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539315.mp4" },
  { name: "Perturbado Por El Pasado (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4Fj40Qh6sLbyQvaf4g4QLPbte4M.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/534882.mp4" },
  { name: "18 rosas (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wzbR0RXBjifBjDE7WepcAcxsNhX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572090.mp4" },
  { name: "53 domingos (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/nxUy4A5KFdNVjwqXoFRK8PqZ5vZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572091.mp4" },
  { name: "72 horas", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/enkyq1gVdQqWaCyAFjFIxjlKvNW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572092.mp4" },
  { name: "911- Llamada Infernal", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/aOIXYOwB97ioUnhHzwnyCRxwVBe.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572093.mp4" },
  { name: "Acusada (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5e98uGz4dafgJQkujLwTBqaAp7G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572094.mp4" },
  { name: "Al descubierto- Jaque al rey (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oC68KgbyFiraKJRdUedQI9aXBF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572096.mp4" },
  { name: "Alerta Extinción (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/bp0tX5Q02YtkFAQI8TMwwsvQs1d.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572097.mp4" },
  { name: "Amanda Knox- En la boca del lobo (2026) - SubEspañol", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572098.mp4" },
  { name: "Amarga Navidad", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ji29dXqoeIsQiVnXAkzI4nzxMjr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572099.mp4" },
  { name: "Amos del Universo", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/A6kqScyPEsn6akDS5HyPf9jE4Od.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572100.mp4" },
  { name: "Animales", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wOnhgV3RZJhpOMA5b3LWBcfMncB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572101.mp4" },
  { name: "Backrooms- Sin salida", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ur2yYTVGPkEDmLdoQ1Obm2RKXuU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572103.mp4" },
  { name: "Balística (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/f8GUHZjNPSGLjUhi7HzVn9541bY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572104.mp4" },
  { name: "Beast", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3S32pzyZMoOJ3ADrnT2GbV4tiX4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572105.mp4" },
  { name: "Bendito corazon (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/iAUKEORVdNcSaXGIdJ7QKJrBxVr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572106.mp4" },
  { name: "Boulevard - Castellano", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572107.mp4" },
  { name: "Carrera de bestias", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/6Qwd9xKb1TnO7juMlZqHNiiJLWm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572109.mp4" },
  { name: "Citizen Vigilante (2026) - Subtitulado", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572110.mp4" },
  { name: "condena anulada (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/iP9b3NBxJKtyzLf7CKFWl3MpgKS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572111.mp4" },
  { name: "Cortafuego (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/gqzIKAeBKkiwj5qz2oZCOuZKHPA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572112.mp4" },
  { name: "Couture (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ivXtlBv1UhZhAdIj2OouEAOuGf1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572113.mp4" },
  { name: "Criaturas luminosas (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/afCyi1YlcSq2BH14UJmFbqzzJ65.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572115.mp4" },
  { name: "Deseo", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/hzyByMOgLeYwu13fusOwIPJwMNV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572102.mp4" },
  { name: "Detonación", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/2yAFN5Cd5cPHnz3R2Nlng4G0fDb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572095.mp4" },
  { name: "Dibu Martínez- El pibe que ataja el tiempo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/xjBwm6dIt3TMRPK0CFDrMVmt5TG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572089.mp4" },
  { name: "¡Ayuda! (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/qXZZtyzuTX3KMfSLssCR6J0mODd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572116.mp4" },
  { name: "¡La novia! (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/4xC5IfnCekweHkTFjqQsMOC1gca.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572088.mp4" },
  { name: "¡Uf! ¿Solo amigos- (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9bxYsc9GegAcqt0egBdXaS1mMmw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572086.mp4" },
  { name: "¿Quieres Ser Mi Novia- (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oscW8xV8EhRYj7iAhyVlBohKqxo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572087.mp4" },
  { name: "“Cumbres Borrascosas” (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/afGUJcMBJloAUp9uC27MQiqkD7X.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572108.mp4" },
  { name: "Doblemente feliz (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sTovX5IDk3v1rqfCuHOCB7TGtzW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572142.mp4" },
  { name: "Dolly (2026) - Subtitulado", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572143.mp4" },
  { name: "Dolly- Juega conmigo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/umDXoAiEMb7RxB4gaPAlT02XLAS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572144.mp4" },
  { name: "Dont Die - Subtitulada", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572145.mp4" },
  { name: "dulce hogar (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/dEXPxwI0yi41pwbG94I1PRaeVZq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572146.mp4" },
  { name: "El ases", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/rMprIGQqKpZ9cD3BjEynVB1sEOn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572147.mp4" },
  { name: "El choque (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/mTN9baARVvqjS8ZuMUQeFBW6z2l.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572148.mp4" },
  { name: "El Coro (2025)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/iLNyy9jXTdod8yPOn2tQrVEyuO2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572149.mp4" },
  { name: "El diablo viste a la moda 2 (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sz687EF7yJMS4VNEdHKT9ebkhA9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572150.mp4" },
  { name: "El Drama (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/zgfBYGYCNcOZ51JDbr6tm45H8y0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572151.mp4" },
  { name: "El día de la revelación", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/dPTa7jSIeaDhie2d9JSZr7qI0Tf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572152.mp4" },
  { name: "El engaño (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/y8ADH1i7Ti1A0WLWjMCTEN6s4F8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572153.mp4" },
  { name: "El Guardián- Último Refugio (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/kOsqd5jFZ0p3O8Z0k0VQvBW2neW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572154.mp4" },
  { name: "El Manuscrito De Dante (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3pIx9UV3cSd96siLH9tkdmZ3GUI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572155.mp4" },
  { name: "El Momento (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/RiE4GRCOgSS9OgDi4nUuEvgGyK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572156.mp4" },
  { name: "El Pasado Acecha", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/iNnUghBqWWlod2CfOZ14HlaB04f.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572157.mp4" },
  { name: "El Susurro (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/x1kKY4OvlDGxTvBn5GDyTVCYv6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572158.mp4" },
  { name: "El vínculo sueco (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/snlnvSB232OZwPCuO8zkWYJ6P7j.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572159.mp4" },
  { name: "El yerno (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/2C6EUH0qSthnOM6wtjS7ZRCdVZU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572160.mp4" },
  { name: "El Último Conquistador (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/615WsMjiK76xBzW6zQNaPjgvnpP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572161.mp4" },
  { name: "El último gigante (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/B1T4YXBS4B5TR2fVFOomCKXRuc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572162.mp4" },
  { name: "El último gran golpe (2026) - Subtitulado", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572163.mp4" },
  { name: "Embestida (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/osYy4GDE4nr69MGTJxRaZlqU82S.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572164.mp4" },
  { name: "En busca de Harry- El arte detrás de la magia (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/v9kNDfpOG7o2W6mHfUltypvZEPa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572165.mp4" },
  { name: "En la Ruta del Crimen (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/lw6D3Kil3Kz9qyaKYhC8SWctkOQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572166.mp4" },
  { name: "En la zona gris (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/kQik7Yfcs3O8dCBpIUGSdXOMOnQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572167.mp4" },
  { name: "Enterramos a los Muertos (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/yuXdvV9seBbSQkEv4nfCapYqMja.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572168.mp4" },
  { name: "Equipo Demolición (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ttEESBvVrO8ngZr19qp6eBMVS9F.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572169.mp4" },
  { name: "Espadas De Los Guardianes- El Viento Se Levanta En El Desierto", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wOYPRKEdYEdTCaJ25Q9IFmsvAkD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572170.mp4" },
  { name: "Evil Dead En Llamas (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/hDXmoQJ7EClgjv83Z0vEIQu2t7S.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572171.mp4" },
  { name: "Exterminio- El templo de huesos (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/2DTPapravB7kVBWjm6RsqEWyNqn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572172.mp4" },
  { name: "Golden Kamuy- Asalto a la prisión de Abashiri", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/pY44IjFr3KMe4arWh6TjsB24zCx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572173.mp4" },
  { name: "Hasta el Final", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vaedoBmTuQ3zutjUxDvd2YpsHyQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572174.mp4" },
  { name: "Hasta Que Amanezca (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/8DU4jyJ7veZhdb4BzdZtzP6xzJr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572175.mp4" },
  { name: "Heartstopper Forever", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/4rsI2lhFLBXPtVScJ3rBKHwIt5b.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572176.mp4" },
  { name: "Hermanito (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/s8mudAYQcHmVoFSamqyv1Ron527.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572177.mp4" },
  { name: "Hokum- La maldición de la bruja (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/hzOJEzqrOtwXbPw1U5nZMvTaljQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572178.mp4" },
  { name: "Impacto Mortal", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/qXt4RZ4Ff14cNR8FhRXTzDMR53s.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572179.mp4" },
  { name: "Instinto Implacable (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/VAH1JuP9FncRg5MNuzPQFQwdhF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572180.mp4" },
  { name: "Instinto maternal (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/jiW2OSaZwYHzIXlVMzFnd7mQPmB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572141.mp4" },
  { name: "Intercambiados (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/i89vUDwNhAEWUZSFYITSiv1RIbK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572140.mp4" },
  { name: "Inthum (2026)", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572139.mp4" },
  { name: "Iron Maiden- Burning Ambition (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wtXlLK1TSPLfbQZR774xLduLj16.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572138.mp4" },
  { name: "Jackass- La última y nos vamos +18", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572137.mp4" },
  { name: "Jerry West- The Logo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/mkW9mJJMPrQgkGaMdIt7j5nxBDy.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572136.mp4" },
  { name: "Kill Bill- Todo el sangriento asunto (2011)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/rrdOoifC74O7YLdQsaIXA393RlR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572135.mp4" },
  { name: "Kraken (2026) - Subtitulo", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572134.mp4" },
  { name: "La Bestia Del Pantano", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/t4X5HtZBtwNzbg9K5prABkC0nDJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572133.mp4" },
  { name: "La caja azul (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/dkIzjzfv7TbXqjbJKM51CZYORaR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572132.mp4" },
  { name: "La casaca de Dios (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/jzhMm3R8slLP806k0xx4izuGENW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572131.mp4" },
  { name: "La desconocida (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wrjKPBd4ieJMSxO7n5GothE9WAB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572130.mp4" },
  { name: "la esposa y ella", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/x0RUPvba4JlCCkyyEZGlQFIFVuF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572129.mp4" },
  { name: "La Familia Del Barrio- La Maldición del Quinto Partido (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/lGZavJahqfBhaopeeiI4samtqyt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572128.mp4" },
  { name: "La invitación", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/21JnfyCARiRkms9AZHtTXiZKbIj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572127.mp4" },
  { name: "La ironía del amor", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/uvfBXtJ1EB3asfpJcQCN9g9Eijf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572126.mp4" },
  { name: "La línea roja (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/2jZkzmwSLaWO7GTWVjUsmv2SR9F.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572125.mp4" },
  { name: "La muerte de Robin Hood - Latino Line", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572123.mp4" },
  { name: "La Máquina- The Smashing Machine (2025)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3qfyfrY4Sa0fUPVH0rcsfGZZNoY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572124.mp4" },
  { name: "La posesión de la momia (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/btXGqRlctQdbML6ifPmacZuykcC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572122.mp4" },
  { name: "La reina del ajedrez (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oTng4l8LILAVKuZKrWJNXCfpWkF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572121.mp4" },
  { name: "La tostadora (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/2tTUscTlshVovvUnk1qlkQrkbum.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572120.mp4" },
  { name: "La verdad detrás de la tragedia de Moriah Wilson (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/zoa2XatA43nKhF1kx8nVcVyH1M0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572118.mp4" },
  { name: "La virgen de la tosquera (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/nLw8adzoWXzF13aHgPVgnfn2rKD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572117.mp4" },
  { name: "La última casa", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/CIGQ7ONbNaSDK3KGkXjBILcj1d.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572119.mp4" },
  { name: "ladrar (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sW3upJz5ZwSFNRMqYjkc12OaNz0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572235.mp4" },
  { name: "Las damas primero (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ANI2K8Oo5f88Oq6FFi6CfvonrT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572245.mp4" },
  { name: "Las ovejas detectives (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/hUj4XFicPaR7Ca1Ljkwz9tK7e0M.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572241.mp4" },
  { name: "Leviticus- Ritual de sangre", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/gS8Z2lepduus8x6Crwzb85F6Gli.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572239.mp4" },
  { name: "Licencia para Robar (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/8yPsb11dtGvx6fHQeHFASq2w1nZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572248.mp4" },
  { name: "Lindas y Letales (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/cmZqxJQ9MdNQEoD49HYghOXsiwH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572253.mp4" },
  { name: "Los colores del mal- Negro (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/cyASW7irDybUePt5Lv5SeMoNs7c.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572236.mp4" },
  { name: "Los creyentes - Castellano", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572247.mp4" },
  { name: "Lucky Lu", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/kCcRUbLhZCVag8HjQXAlYn4NWBL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572251.mp4" },
  { name: "Lucky Strike (2026) - Subtitulado", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572243.mp4" },
  { name: "Mensajes de voz para Isabelle (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ohIYxdaO7WV1zsSPFZVddWNEWkk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572249.mp4" },
  { name: "Miguel Ángel Blanco- Las 48 horas que lo cambiaron todo - Castellano", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/7MCnV8wb1tODOrM8NmWAuPWm40Y.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572242.mp4" },
  { name: "Mike & Nick & Nick & Alice (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/k6PSvLUs84QJsWLt0Zlkoa8ih6V.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572238.mp4" },
  { name: "Monkey’s Magic Merry Go Round (2026) - Subtitulado", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572246.mp4" },
  { name: "Mortal Kombat II (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ivVKHht5jutNGnObn1y5sSDrAXn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572252.mp4" },
  { name: "Máquina de guerra (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5C18uOTbDZRvVIZcVRO747k2fUi.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572237.mp4" },
  { name: "Nada entre los dos", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/6GZt6CfXJQgOFBA7ArLbOQYvXI8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572244.mp4" },
  { name: "no mueras (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vzJkrTx01ol7FTIhzS50pms5xEG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572254.mp4" },
  { name: "No se desea buena suerte", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/eSHrRxvVxXH0JYdj2NdBD78FC6B.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572240.mp4" },
  { name: "Obsesión (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wnyUBssII8ZRDjDRlUyXt6tX9rt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572250.mp4" },
  { name: "Outcome (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9uriReigJBf5zVBNaHj5C9kDDTe.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572218.mp4" },
  { name: "Panda Plan- The Magical Tribe (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5uE4qDFSoPLcuQRGpXEFCInhNLT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572214.mp4" },
  { name: "Patrulla Nocturna (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/kRnyUO5FGczz0eZas2NbimYEZDk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572210.mp4" },
  { name: "Pavana (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/A1zFat9HYHRdorJqpVhVRxg78AJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572212.mp4" },
  { name: "Peaky Blinders- El hombre inmortal (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/l9S8MLUyi2diTc2Gf3KDAOQTuVx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572211.mp4" },
  { name: "Pizza Movie (2026) - Subtitulado", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572231.mp4" },
  { name: "Poldi (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ylgaqq0NdSlnrBRtWMePYvDlTDa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572220.mp4" },
  { name: "Proyecto- El Internado (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/i7iL6HZykQGNg6uaFTwxlmgilz5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572215.mp4" },
  { name: "Psycho Killer", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5xgxxmLivJXL8aF0HdZfpx8aAIo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572233.mp4" },
  { name: "repetir (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/xzuvCZNKF2jnZ6amc0SP5AjclNK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572216.mp4" },
  { name: "Rey del ring (2025)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/yOvLYwwODIbE82QrzfZ0q13nUXp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572207.mp4" },
  { name: "Risa y la cabina del viento (2026)", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572208.mp4" },
  { name: "Scary Movie- Terroríficamente incorrecta", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/qhGf7btEU9hcGz3A0lneNptJKL7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572224.mp4" },
  { name: "Scream 7 (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/jgJCp2TOtTMGWS766tQhNcuFhjs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572228.mp4" },
  { name: "Shipwrecked- Nightmare at Sea", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/tkeqiyvmrjinpP7GMRywlXU0RAR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572221.mp4" },
  { name: "Sobran las palabras (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/tQd773a9flb3utTxwYWzsThU6j9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572225.mp4" },
  { name: "Sobre tu cadáver (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sdbBMUVo7ddm5CsJNf11Zb0Oho5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572226.mp4" },
  { name: "Socias por accidente", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sr1Yoj6XLPTWYcbDoBy67xivW4I.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572229.mp4" },
  { name: "Sonunda Sen (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/mnBW7o8ycDi8WotGeRkGoDxrNMd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572213.mp4" },
  { name: "Soulm8te", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/xeBFjbLFp3vvv49yD2q1Gg64zyb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572232.mp4" },
  { name: "Star Wars- The Mandalorian and Grogu", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sWitU9IjgFwf6y1OrI0zUaL3GNa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572219.mp4" },
  { name: "Strung (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/lWdpUOhnJ8uWWO1G1vbyUsCliov.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572209.mp4" },
  { name: "Sueños galácticos (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/yeXvd6Sx5CG5NfYHUiNUQEMh6z7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572217.mp4" },
  { name: "Supergirl", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/Ao9ucdnMaBhNt528Z5S4Wxovgnf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572206.mp4" },
  { name: "Susana y Elvira- Sin plan B", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/amqNq4a3cugpf48nfpZFJwnFzbb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572234.mp4" },
  { name: "Te Quiero Desde Siempre", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/mjR9MAuIvW3KWj8V3Ya5mfjMVTM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572222.mp4" },
  { name: "Terror en Silent Hill- Regreso al infierno (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5d55Yl0JL1zlOHX021VL36unOlY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572230.mp4" },
  { name: "Tetracampeones- Brasil volvió a creer (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/7vW1BD3416Ev2rdB7CHKXGnzdGv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572227.mp4" },
  { name: "Te van a matar (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9dEn8a12dqkQw48zxQhPcpQ7D5W.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572205.mp4" },
  { name: "The Amazing Digital Circus- El Ultimo Acto (2026) - Subtitulado", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sKm720uPqkh0WEZEuMmgc5dLo5S.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572204.mp4" },
  { name: "The Dink- Pasión por el pickleball", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5rVJLhpYrtaDzeItzhteP3xCZW7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572203.mp4" },
  { name: "The Dreadful (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ycYv5bhMLJG3wt0I5xFY13Z7PsU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572202.mp4" },
  { name: "The Dutchman", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/zzGeXgq958sllA1ysSMemi1jWzM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572201.mp4" },
  { name: "The Furious", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ryOVzYoGhiOn4QtkwSa8pUTivPO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572200.mp4" },
  { name: "The Gates", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/dWMiHlKz0OsbVXEEZR3hYyWHcdq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572199.mp4" },
  { name: "The Punisher- La última muerte (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/p1eqHRxfIxfgtDgfjWcpEESeEvF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572198.mp4" },
  { name: "The Simpsons- Simpsley (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/e0ienqvJZUPbVH7ym0ShQOwhb5z.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572197.mp4" },
  { name: "Tormenta en Plaza Sesamo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oMAuDxxMPxzHjUmbrCR9EvJyH8U.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572196.mp4" },
  { name: "Torrente Presidente (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oD9He3Kpxs1FMm10y82JYAqYDAJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572195.mp4" },
  { name: "Toy Story 5 - WebRip Latino Line", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572194.mp4" },
  { name: "Tu o Yo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/iaiy3tg9QVkDpObm1IGqmbC9A5C.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572193.mp4" },
  { name: "Turbulencia en la oficina (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/46fpIuAydvL4wjGsH9zR4iLGgE0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572192.mp4" },
  { name: "Una Familia de Bastardos (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/zuiZDJcjlNWB6EcXHer06u9BQke.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572191.mp4" },
  { name: "Un destino en Corea (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/8bIkhMcRg2lFKV7J5ZtbTEwU3UH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572190.mp4" },
  { name: "Un lugar en la mesa (2026) - Castellano", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572188.mp4" },
  { name: "un lémur en fuga", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ryEMOnfeJRhyHOkh4yXvE9OjEdw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572189.mp4" },
  { name: "Un Portero Muy Improbable", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/hojyUEl0BdjWHyFOQ52HLicHxHa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572187.mp4" },
  { name: "Untold- Jail Blazers (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vmp45llJTRr6JLaIamt3RlfxgTH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572186.mp4" },
  { name: "Ven a volar conmigo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9kG1FfRD3rONR1PCPPaSl1f5V8I.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572185.mp4" },
  { name: "Violencia en la Frontera 2 (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/bGMxbKjxzOUUnV0YCUYsNdV8db3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572184.mp4" },
  { name: "Whistle- El sonido de la muerte (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/1gafvXyeC3vB7CatUo1IIx8a421.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572183.mp4" },
  { name: "Young Washington", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/cpY0vz53hWon3N7zJ4XTSkxAEUd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572182.mp4" },
  { name: "Zona de riesgo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/6pZw6KFwrADsS4HYfJe8AHMwpQh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572181.mp4" },
  { name: "Snoopy Presenta Hogar  Dulce", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/dEXPxwI0yi41pwbG94I1PRaeVZq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572677.mp4" },
  { name: "Letras Robadas", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oYqsgYCaPjCvd3NPE43yNbhgCtG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572680.mp4" },
  { name: "Beast -2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3S32pzyZMoOJ3ADrnT2GbV4tiX4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572684.mp4" },
  { name: "Bendito Corazon", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/iAUKEORVdNcSaXGIdJ7QKJrBxVr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572683.mp4" },
  { name: "Moana 2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wC27PIEqSthbUhaVMdYEhaTzYmo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572679.mp4" },
  { name: "Evolution (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vzkouNc5lH0RMRe0ZCEtFHDV2ms.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572682.mp4" },
  { name: "Altas Capacidades", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/65aKcfq06mNR1wLOT1d9Wr3H1mz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572685.mp4" },
  { name: "La Isla De Los Deseos", group: "Películas 2026", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572681.mp4" },
  { name: "One Mile  Una Milla", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/o8wSKL9hF1f4VRrGwnHQuxTBdef.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572678.mp4" },
  { name: "Daddio", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/gmSObyC9UPZ6KKoPcd4KUSrKXZ9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572691.mp4" },
  { name: "Rescate en el golfo", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3g1WuB4GI2NhoqS7XTpbB5EvfxK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572690.mp4" },
  { name: "kalevala", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/eUMtmxTnBuo8RUxtKeQILFX8P33.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572689.mp4" },
  { name: "The.Devils.Mouth.2026.WEB-DL.720p.Spanish.Latin.America", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/cPsXFr7g39Kjul7Wx8XBpZwkOS4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572687.mp4" },
  { name: "The.Gentleman.Thief.2026.WEB-DL.720p.English", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oMutDMODnbCZf46w0dK4wncQmDB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572686.mp4" },
  { name: "El final de la calle Oak", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/g9DUGw8ufetrwhCIrwq3h1NlpWO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/572692.mp4" },
  { name: "Manual Para Detectar A Un Narcisista", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5P2i5H3aqAEX1Nb3SiE7lv0n7iG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/574582.mp4" },
  { name: "Un hijo propio", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3QylEx2tqfX8MXswK4oGdJUOExB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/574580.mp4" },
  { name: "Quince días", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/f52tZybwHnomYCkRhe9rHMSEz5j.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/574585.mp4" },
  { name: "La captura", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/iwCeOpuBtuTP1kLosqgniey5OvX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/574908.mp4" },
  { name: "El turno del papa", group: "Películas 2026", logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKi2YSPuCAy7Y0_ZZXnKduajzckBJgjqXMKOnKWBdWzQ&s", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/574909.mp4" },
  { name: "Insidious: Fuera del más allá", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/uEqCJh1fA9Ao9jaCL2xoROPJeUB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/576015.mp4" },
  { name: "Amor es Amor (2026) Pelicula Latino [Miyamura Izumi]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/klwPK4U79XyZxfUJmXmqsK4ppor.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575821.mp4" },
  { name: "Song Sung Blue_ Sueño Inquebrantable", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/8Dv7zkEzH7xLFE9Mj87kS1d37iq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575382.mp4" },
  { name: "Todo lo que nunca fuimos (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/zqxIT48mWFsC4NSjGEHAcp1pjEo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575817.mp4" },
  { name: "Paw patrol 2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/fcBc0yfACuTU9oX9cm54IrFJzEW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575383.mp4" },
  { name: "Oxidado (2026) Pelicula Latino [Miyamura Izumi]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wdLnaA1vfXzk2KBOPiCpxJvCcwt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575819.mp4" },
  { name: "Tumorrou (2026) Pelicula Latino [Miyamura Izumi]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/v27tz1VKt1RKpGw7DQC2hRnVOLM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575816.mp4" },
  { name: "Basta Mamá (2026) Pelicula Latino [Miyamura Izumi]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/t8EarPqNvaAttgzEmaOWlyawsJF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575820.mp4" },
  { name: "Batman Knightfall Part 1 - Knightfall (2026) [VOSE]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/360qdtu2hLnqMu8SVHMywn420w1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575831.mp4" },
  { name: "Star_Wars_The_Mandalorian_and_Grogu_2026_1080p_HQ_HDTC_DIGITAL_2", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/sWitU9IjgFwf6y1OrI0zUaL3GNa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/575818.mp4" },
  { name: "Coyote vs Acme", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/e4P8CIoffzsyjTm9e6U87Mng2CU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579452.mp4" },
  { name: "El.ser.querido.(2026).2[castellano]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/bFYCaNsYmj4bOoHGIoqEthRxfRv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579451.mp4" },
  { name: "El ser querido (2026) [Bluray 1080p][Esp]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/bFYCaNsYmj4bOoHGIoqEthRxfRv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579450.mp4" },
  { name: "Ghost.in.the.Cell.2026.WEB-DL.720p.Indonesian", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/gF6Ijrq5bixh4qemCuroRwXtbBc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579449.mp4" },
  { name: "Joker Folie a Deux (2024) Dual @Only_Chris", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/g9l7iLYusH82bbEbwGCJzhVkOe2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579448.mp4" },
  { name: "Una pesadilla maravillosa", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/rSP8mTvujNKsbdtvaWCq9tXVfI9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579447.mp4" },
  { name: "Uno vuelve siempre - 2025", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/8chgdtCD2SYkJqI7FC6fgfyzuyj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579446.mp4" },
  { name: "Yellow Mirror (2026)  1080p WEB-DL Latino-Castellano-", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9jkXiMrYWAbiuLDzt6DfBPARdzY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579445.mp4" },
  { name: "Caida Libre", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wDxu2TejJAfvWdu8jOFZMPqisI5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579454.mp4" },
  { name: "Una.Mujer.sin.Pasado.(2026)[latino]", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/yOtIiIqKVlg5QH0pF88kJSI6c6K.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579566.mp4" },
  { name: "Spider Man Un nuevo día", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9g0sEFhmvmK4nGhXj8DHuv2noYI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/579997.mp4" },
  { name: "Canelones.2026.1080p.WEBRip", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/s2g8wLNs6G5XYa5ivfUNuWbQTKQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/580619.mp4" },
  { name: "I want your sex", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/pR7SIX3AwqdoD96OI44oLG98e7g.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/580611.mp4" },
  { name: "Motor City", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9CatrE52P66ODUQmrMlBO7L0D5c.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/580609.mp4" },
  { name: "Pinocchio Unstrung - 2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/kuPRjis9YN1V9m4ud0hePtREUCo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/580608.mp4" },
  { name: "Yo no moriré de amor - 2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/f5O7hMhzug2qOCFIDwRCro4NqFL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/580605.mp4" },
  { name: "Al Borde De La Guerra", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vCIQeQ2ynVqEjIvtbOXGnKtcgAX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581756.mp4" },
  { name: "la breakdancer viral\\" tvg-logo=\\"https://image.tmdb.org/t/p/w400/3pnlJjsGtrUp3cPEOLzkR0sPQAK.jpg\\" group-title=\\"⏩ ESTRENOS 2026 ⏪\\",Al descubierto_ Raygun, la breakdancer viral", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3pnlJjsGtrUp3cPEOLzkR0sPQAK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581755.mp4" },
  { name: "Fall 2: Punto muerto", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/7ODJFeX9gp4QfK6aFItw4CCrPfr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581754.mp4" },
  { name: "Gandhari", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/hCHei97aPYCCsh4vicz9X0wmdFV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581752.mp4" },
  { name: "La Maldición Del Tiburón", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/oYtFCIpA2tR6N4I3miE2qw2hdBG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581751.mp4" },
  { name: "Máquina de guerra", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5C18uOTbDZRvVIZcVRO747k2fUi.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581750.mp4" },
  { name: "Momentos decisivos: Generación 11-S", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/fSPbxVI1q5sCS4fegzoFByzE749.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581748.mp4" },
  { name: "A la carrera", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/aBzKyfruwaUgU2qYYtMO7vC1Pv2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581747.mp4" },
  { name: "The Dog Stars  La Guerra De Los Últimos", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vbCb1yHXtXym4V1c420MSasbyyP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581746.mp4" },
  { name: "Afterburn (Zona cero)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/soZdshVi2nQpCWqQkS8qumUNNqO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581745.mp4" },
  { name: "Mayday", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/naKQcM3HRuaISCtsSx5ibVMTbDu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/581749.mp4" },
  { name: "Blue Lock", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/tT7wk65X4czBIxDjoPRMNw5JhKD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582574.mp4" },
  { name: "Kraken", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/uUCVGVWnBgIf6NV3AqHpJcCBC8T.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582573.mp4" },
  { name: "N121 Bus de nuit (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/xPaoGDyb7C30rBVDqLidUNl8Ef1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582572.mp4" },
  { name: "Hope.(2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ptqlN6mDIAqJjVA86J5eOoG82zc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/583738.mp4" },
  { name: "Undercard (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5QRH0zH0rCYHuEkwz5vAVORfSji.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/583737.mp4" },
  { name: "Her Private Hell 2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/xFXoPwN8zRtC0ayA6UKmCK11Isy.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/585026.mp4" },
  { name: "El motín", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/5zmLk7K4wHWG68OlniFzrNrZjJE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/585024.mp4" },
  { name: "Shrek", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/jTQONM7jt1yv2lL972TtmWO0UIZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586137.mp4" },
  { name: "Shrek 2", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/knRt4E8KyfwEv0SVu9LsLvD28IQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586136.mp4" },
  { name: "Shrek tercero", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/7sTwtmVPTX77CFOUXdwAM7lKtKL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586134.mp4" },
  { name: "Shrek_ Para siempre el capítulo final", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/11K03KebrdD8nUlGFJX3rSL3KHK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586135.mp4" },
  { name: "LA SEÑAL DEL APOCALIPSIS", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vK9tTyWlVKlBGPTFp1e4WPGMJ7w.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/588456.mp4" },
  { name: "The Awakening", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ojymLyU843OTKXA7VQAtfsfyqYg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/588455.mp4" },
  { name: "Tony", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3WN0JWwRI7oGH7Ni2R6poVWej05.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/588454.mp4" },
  { name: "Tu Yo Los dos contra todos", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/mzgqiEhujCAZiaD6jNVYSXdqFXs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/588453.mp4" },
  { name: "Tiburón de Guerra", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/58xC3Vj5Td1UXhNaOQDOj2ygAH6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/588457.mp4" },
  { name: "Gator Face", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/tUkIHTfiMIa5ipTvgYZW86fIoQX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586889.mp4" },
  { name: "Resident Evil Noche Cero", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/3d8D5tZXiPUE2VmRjnrTNzFORBa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586888.mp4" },
  { name: "master (7)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/7oLHxoLoJrMiWpGnq1dv1gNQfNz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586002.mp4" },
  { name: "Sultana 2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/wDebpR4NplIM8EteAGfd51Zdisu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586885.mp4" },
  { name: "Nimrods 2026", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/9DShRzKYULy6ENCNaAozPpogIF1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586883.mp4" },
  { name: "Ballena Asesina (2026) 720p WEB-DL Latino", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/x8lIphxDZ0CIvyBCvYS0FwjyHco.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586891.mp4" },
  { name: "Llama a mi agente", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/4eD5LRzDW1BG3FWSz7yLEprMWZE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586003.mp4" },
  { name: "Gracias equipo (2026)", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/aVGaBCt8g0Q990jKW85wTJKotev.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586004.mp4" },
  { name: "SAVAGE HOUSE", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/nZobH7JvGEZj8gaauVHRPU2JHI3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586887.mp4" },
  { name: "Asesinato en la 3 planta", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/6ejsKi47sjjbpu7kcNv7LVgZhRh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586005.mp4" },
  { name: "Spider Island", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/eKw6aF7oNEaTnVvN396Q1is9R1n.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586886.mp4" },
  { name: "Festival de Cannes", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/aUeOpkCfGJHgQYFy89vTb0OvgWF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586890.mp4" },
  { name: "The Wolf And The Lamp", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/kb5aX2cyEvtVHKI3b7IBZ1u1311.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/586884.mp4" },
  { name: "Coyote vs. Acme HD", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/vWFz9spZFBkJvForuYrKK2ntOLB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/589916.mp4" },
  { name: "La hipótesis del amor", group: "Películas 2026", logo: "https://image.tmdb.org/t/p/w400/ylrSdW6fZYwaInYH6WAqvIEnSiV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/589915.mp4" },
  { name: "Valor sentimental (2025) | castellano (D)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/s4a3hpTmws0mNLEn0BNBRiX5q3g.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560824.mp4" },
  { name: "Hamnet (2025) (D)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qXF968t2LfHZJ8Zrq2NgMGNomnE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560821.mp4" },
  { name: "don't (2025) (D)\\" tvg-logo=\\"https://image.tmdb.org/t/p/w600_and_h900_bestv2/fJm3kmd9NLZWypMas7g34oNFgbk.jpg\\" group-title=\\"⏩ PELICULAS 2025 ⏪\\",Honey, don't (2025) (D)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/fJm3kmd9NLZWypMas7g34oNFgbk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542746.mp4" },
  { name: "Tiger: Tanque de guerra (2025) (D)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/iqPUwI03NVnyrXmd0hiN4Au93hv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540823.mp4" },
  { name: "La chica del perdón (2025) (D)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3d5BPSr0TxLNJAvPsV0lXZiA0dZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539583.mp4" },
  { name: "la película (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/yKIG63pXN89EfbTA7yKpwxAU1rf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/471278.mkv" },
  { name: "8 (Ocho) (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/zyrviRUaxVMN2rOmmUwMzCFbHG7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573224.mp4" },
  { name: "10DANCE (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/iQOIOz8BZ2QLMyFJ7Leo9izSyti.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573225.mp4" },
  { name: "13 noches (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qS3UNEPpomerbjJZKdAf33X38Kc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573226.mp4" },
  { name: "27 noches (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/vqReHIFJc1vgYLTQF768rFsRxRC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573227.mp4" },
  { name: "31 Minutos Calurosa Navidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dv9UrOoicRiMGkzr2oj2YwSFY2K.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573228.mp4" },
  { name: "40 Acres (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uGszUM659bYgjjd1daS4esz2dty.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573229.mp4" },
  { name: "55 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qKCS6MK2MlOdBVWcRnVKkfJRug6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573230.mp4" },
  { name: "96 Minutos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ooCsipqBSXqaGkbRjnzPUW85K32.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573231.mp4" },
  { name: "100 metros (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ftUHKZfXONnjuOGGpNeFCeAXbYF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573232.mp4" },
  { name: "2024 (2024)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573233.mp4" },
  { name: "Abrahams Boys A Dracula Story (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/owUZI7rRIN85TnXJY8gD9LdMiGU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573234.mp4" },
  { name: "Academia de villanos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lRIvhKw058RFYHdXpdAPROTdWpx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573235.mp4" },
  { name: "Acosada (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dz1vbU1ExgGB1rcWTNHB1wzTCjA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573236.mp4" },
  { name: "Adivina quien muere esta noche (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/jK3U9ymvunvYqTE1XnVkegKUHuL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573237.mp4" },
  { name: "Adultez (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kTVABjFns9gZ72kOPbtuwnfBeLo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573238.mp4" },
  { name: "Adult Swims The Elephant (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/hesk0yJrkojyuZcyZ4KRxMtAQNK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573239.mp4" },
  { name: "Ad Vitam (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3ZqM7bLNmHdyj658gqtifrV5afl.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573240.mp4" },
  { name: "Aileen La reina de las asesinas en serie (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/olvE4YAWpMydQW0lI1SeqIhqUoR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573241.mp4" },
  { name: "Alarum Codigo Letal (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/chIQxgimGbIFnuFsLqpcoTbsH9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573242.mp4" },
  { name: "Alba del desierto (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/vJxo8xxVnSaPAf9EdkjAfKwmoQK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573243.mp4" },
  { name: "Algo embarazada (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lpMXvcdOnEg4rvsIjWEImhHI1aH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573244.mp4" },
  { name: "Alguien asi (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/5pdPJqoN199sIE14nBKGsNs9f14.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573245.mp4" },
  { name: "Alma en llamas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/soOVFNyB2ioIYFWsRNfGNt3LCoI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573246.mp4" },
  { name: "Americana (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/83Gis9pOKCvAdaKXCNChey4IZyL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573247.mp4" },
  { name: "Amor a la italiana (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/wZnHtXYb0jNqjEjByzHwRzSA2ia.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573248.mp4" },
  { name: "Amor en cuatro letras (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fwbfsFZaoDslqCHVJ5NwGuDWJbQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573249.mp4" },
  { name: "Amor erizo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lQXHQMlpEO8YYqSpDx8sOr1OJQs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573250.mp4" },
  { name: "Amor explosivo 2025", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/z0jwBykM5DgPQ99lVlKI4sA0U0L.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573251.mp4" },
  { name: "Amor Fuera De Tiempo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6DJdWUrXWaekvLvKLdfZxGyBOZj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573252.mp4" },
  { name: "Amor y vino (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/zf4b5f9sqzWkD675ODeLjqWAwtc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573253.mp4" },
  { name: "Anemona (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mb7yTypzkmM8sWrgi5Dr3kl9Jcx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573254.mp4" },
  { name: "Animales Peligrosos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dztGSM9IL23Be7uGxw0khy8dfE1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573255.mp4" },
  { name: "Antes de la luna llena (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573256.mp4" },
  { name: "Antes Del Fin Del Mundo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9Ahg3uWnIMSdAijrP455lsdlBz4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573257.mp4" },
  { name: "A pesar de ti (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kDSdgH26sX3ctZIG1CWM7bgkmZB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573258.mp4" },
  { name: "A prueba (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rKWo5GfBeW4aeZ8u93npNyWl9IR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573259.mp4" },
  { name: "Aquel verano en Paris (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/r1Aiq6OaCsV1eKgr6AkA9xUa4xm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573260.mp4" },
  { name: "Armados (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573261.mp4" },
  { name: "Asesinato en la Embajada (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/vW5pt7wPbY2mtsGd26IqV39zRJa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573262.mp4" },
  { name: "Asesinos de Aliens del Espacio Sideral (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7ubj6nPmJDwGPFW41USMYIs8AKc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573263.mp4" },
  { name: "Asesinos de aliens del espacio sideral 2025", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7ubj6nPmJDwGPFW41USMYIs8AKc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573264.mp4" },
  { name: "Ash (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4n1U0Mwn7djux6VKNYDRWPgS2x6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573265.mp4" },
  { name: "Asiento Mortal (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/1ofdDh4ZHeFczYBKGYu4JEPuBsG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573266.mp4" },
  { name: "Atena (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kgH8uEmzV3qt911gnptXQiz4jRz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573267.mp4" },
  { name: "Atrapado robando (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dpEGQKgOeDo9GmmKDnEWjTLTi4u.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573268.mp4" },
  { name: "A traves del fuego (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8n0kkUc4wKknqEJfq8eErWrvvUL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573269.mp4" },
  { name: "A trav s del fuego 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573270.mp4" },
  { name: "Aunque nuestro amor se desvanezca esta noche (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lawtchSE4FQch7kNTA5OiMTZ4F3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573271.mp4" },
  { name: "Azul (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rzcigN8ujeVJiEKGP3y3mJybvii.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573272.mp4" },
  { name: "Azul de nino (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lHd3YgFQf2CvyDgeUVV2TgAxl3R.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573273.mp4" },
  { name: "Baja de paternidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4zEzivNNh0FhKkHjEtohmMuIe51.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573274.mp4" },
  { name: "Bajo un volcan (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8joWkrzM7ss1t8JZlBffavbg4hg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573275.mp4" },
  { name: "Bajo un volc n 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573276.mp4" },
  { name: "Banger (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mtyIfCHm7FZw1plbwbybj9Stfz8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573277.mp4" },
  { name: "Barbie y Teresa La receta de la amistad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3qJO7F0Pwz67WhAIbHSs2U5Q0qs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573278.mp4" },
  { name: "Bastion 36 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/56hPHYFZMafbPw6ORxrUWG7Qxad.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573279.mp4" },
  { name: "Batman Azteca Choque de imperios (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/wpMaI2J3ISYZiaIWNkoA1lVb5LQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573280.mp4" },
  { name: "Batman Ninja vs La Liga Yakuza (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3hVjnB5FE4gBrR5rqk42qiBFgGe.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573281.mp4" },
  { name: "Belen (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/w0DzNvUOjCIqxxifViNlwMSc3bm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573282.mp4" },
  { name: "Beso de tres (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4Ptyvpmnk9RcxxdK610VtXpHf1w.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573283.mp4" },
  { name: "Blancanieves y los 7 enanitos (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573284.mp4" },
  { name: "Blind River (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9pdyAX2AzpbRVptTehqp2UMuMKD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573285.mp4" },
  { name: "Blue Sun Palace (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bg8Fi5Vt9DhtuzWmyUn9qkljblu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573286.mp4" },
  { name: "Bonjour Tristesse (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/eDn7SUptOydljO7IM4vq1PrGM5G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573287.mp4" },
  { name: "Borron y Vida Nueva (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bB5KB2uILvbyzeoM2jBMw4EUoxf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573288.mp4" },
  { name: "Buenas noticias (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/zER9LQ7bWpuMRxtVeZ4toDc7PnM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573289.mp4" },
  { name: "Bugonia (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/gaplD9IEUxez3GeX16SkgLXQJEb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573290.mp4" },
  { name: "Caceria de brujas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uSzB0T77LvQzCjYCkb6ZhWHTrQa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573291.mp4" },
  { name: "Caeras (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/wytZFBYpkEgxsALpg5l2euGeVQz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573292.mp4" },
  { name: "Calle Malaga (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fWagBXNDk44UaupYtwQOAvDwGiT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573293.mp4" },
  { name: "Campamento Garra de Oso (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9VZSbOxvHTOy8cDpk5YoXItsgIX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573294.mp4" },
  { name: "Canelo lvarez vs. Terence Crawford 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573295.mp4" },
  { name: "Caramelo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/c4ZEAah5a01cu27w7vT2IAoFogk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573296.mp4" },
  { name: "Carretera Forestal (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rSOYVDmg4VFoVuZzu4941X2s1fO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573297.mp4" },
  { name: "Casi familia (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fgk4rtDNlP9LZql9rtC3Huil1ob.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573298.mp4" },
  { name: "Cazadores de fronteras (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573299.mp4" },
  { name: "Cazadores Del Fin Del Mundo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/soZdshVi2nQpCWqQkS8qumUNNqO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573223.mp4" },
  { name: "Cazando al asesino (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tNAsBkiSQe5fTB9SDRlHbmV5kRz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573222.mp4" },
  { name: "Chica conoce a chico (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kxRjfgZHj7nsa7aBqm6qato2b70.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573221.mp4" },
  { name: "Chico Bento y el maravilloso arbol de la guayaba (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573220.mp4" },
  { name: "Chicos de hielo en el tropico (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/2IL9BVp0wXPFADYGW7wtCxsIw8L.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573219.mp4" },
  { name: "Christy (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/A34zGQkOsi9iTOlwnh1vVDxtlfN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573218.mp4" },
  { name: "Chuck E. Cheese Especial de Navidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/osuxNst45U4d7CT02uYHBI1B9nK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573217.mp4" },
  { name: "Ciudadanos soberanos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3tKoiSTXBafXPbIyFF0eeb0KVoJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573216.mp4" },
  { name: "Cleopatra el misterio final (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/iXNdiLowyxNem3hHmIh4M9A16Q8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573215.mp4" },
  { name: "Codigo 3 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3hPPcGOS8XUciA2TDLWEE5hwikH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573214.mp4" },
  { name: "Codigo Venganza (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8uO0pWRuW20H7sX6Bj0MS7BOqGY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573213.mp4" },
  { name: "Colonia 75 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/h0YrXkV6HHVg4K2adbgBSYlb1jS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573212.mp4" },
  { name: "Contigo en el futuro (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/94UuKFxMiEwTjdwBMhm1y3jKKKF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573211.mp4" },
  { name: "Control Room (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/1oPW1RuTy3CgJ1Nlv06AleOHz7a.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573210.mp4" },
  { name: "Corazon delator (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/5XgEqq8KJVW0R0NhDZCdBV2Pjr0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573209.mp4" },
  { name: "Corina (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/nZviAfnhXylrYpjPznmhHCBeKWx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573208.mp4" },
  { name: "Countdown Taylor vs. Serrano (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lFsLbXGuMiH9ZAYy3O22ccwDsDH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573207.mp4" },
  { name: "CoverUp Un periodista en las trincheras (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qdT3g7OENo82FLqPZo7uVGYnt1r.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573206.mp4" },
  { name: "Criatura voraz (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/iinb9KTcTqVWVj8sgNIFssaUGae.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573205.mp4" },
  { name: "Criminales de lujo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rpAbueORafYSgTk2oSc2t6ayktb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573204.mp4" },
  { name: "Cronicas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tOOskqjivQo5cJjtLxLWfpPVxkf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573203.mp4" },
  { name: "Cronicas de Exorcismo El Comienzo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/wwcNlc69qLyzDLY6sa9SLdUZfBx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573202.mp4" },
  { name: "Cronicas de guerra (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/oSoMQbqBTKJYk8LF9ibeNhkaHTQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573201.mp4" },
  { name: "Crypto La apuesta final (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3McqBhWdjAp0HZlkfZ8srltO4k8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573200.mp4" },
  { name: "Cuatro madres (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/x4Clc08pw5UJEzK2fM6yy6HdrKr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573199.mp4" },
  { name: "El Demonio De Alaska 2025", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/zPI3xK4a4oXUZVrxNWLc8Rck0Cd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573394.mp4" },
  { name: "El descendiente (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3tO8SSlRxrZrJStbX2nPr5u7dCQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573393.mp4" },
  { name: "El diablo sobre hielo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/d3f4NgLEKwPE461dOo3RXaHIPKW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573392.mp4" },
  { name: "El dia de la masacre (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/1lZVbDNOw0egqeh7vIOvyiQO6Io.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573391.mp4" },
  { name: "El diario de Greg Esto es el colmo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/xg6hPJGl130XkJgwWpBagMHojWz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573390.mp4" },
  { name: "El dosier Maldoror (2024)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/nscnLW6csnYLedioaFFnoNDA6dH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573389.mp4" },
  { name: "Eleanor la grande (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9XTM42IJST6lwPxtK2iUwNaFvCT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573388.mp4" },
  { name: "El encanto del champan (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/yey6ihLZVwx2sjMXhObUyFusqyX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573387.mp4" },
  { name: "El entrenador (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/24zTubOP9RCJGVTpUxpQ92JxflC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573386.mp4" },
  { name: "El esquema Fenicio (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ts8IjoVDPH4wTlhZOm8owNlPhs4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573385.mp4" },
  { name: "El Extrano en mi casa (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/wxp2Vu19qwquzdqSvuALgzMJD6H.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573384.mp4" },
  { name: "El falsario (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bJFvxY8S3kM7h2ScWhfVozROstF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573383.mp4" },
  { name: "El falsecuestro (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/57AB64sBdZltSV0MXHZHgHRvfg1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573382.mp4" },
  { name: "El gran diluvio (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qIzSyT2AmDxkcQ0zOAeTbtZR9EQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573381.mp4" },
  { name: "El gran premio a toda velocidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/hIsNhT2qih9opJX6ofDiMImWPNC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573380.mp4" },
  { name: "El gran viaje de tu vida 2025", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7Ja9exbCZBl3TEHRTWPESHoiln0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573379.mp4" },
  { name: "El hada de las tinieblas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/n4mCg3QogFLL5ZVLFlIoZmfxd4W.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573378.mp4" },
  { name: "El Hijo Del Carpintero (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3BSDrV3NJRXf00sQDclPlLwwK26.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573377.mp4" },
  { name: "El hijo de mil hombres (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/yfkecTToGVoq7hUE1xlay7ccM9e.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573376.mp4" },
  { name: "El hilo rojo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mZ8Z4jCDVlBflEuCOwH3NCDyqBP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573375.mp4" },
  { name: "El hombre mas afortunado de America (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tc2EJTWbXX5w0peUUiqXmd4uj6f.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573374.mp4" },
  { name: "El Hombre sin Memoria (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/sGUFzO1P703rq7YeuNOC74Y58FS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573373.mp4" },
  { name: "El infiltrado (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/y1V9aoBYrUfCkpl4598MUeMCL8i.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573372.mp4" },
  { name: "El Intermediario (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/jUDzCoIAdgxdlOsRdRfRSjcjFkT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573371.mp4" },
  { name: "El jardinero (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/sVuYUl7EtBxyJTOl4Ao7eZVjKDb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573370.mp4" },
  { name: "El jurado (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/5v7multPqUOZR5NJtCOMqhFWCIv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573369.mp4" },
  { name: "El ladron de joyas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/hzuus3qrQct2JeoAs2AGMYzKzjZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573368.mp4" },
  { name: "Ella McCay Imperfectamente perfecta (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7dkh168bJBPAl3tjcnhDHXowyWt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573367.mp4" },
  { name: "El mapa que me lleva a ti (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8gzmyWZX6C29aKNLr5ol17n03nN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573366.mp4" },
  { name: "El mismo d a contigo 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573365.mp4" },
  { name: "El mismo dia contigo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lqYyrLLLpvfQLay7Q2ttUYa1wGj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573364.mp4" },
  { name: "El misterio de la familia Carman (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kehV1PgXItaiPJS9o3YZPIVJcPT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573363.mp4" },
  { name: "El muro negro (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ubKnIdUWNfpKUgkfdOPJvcGXO2G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573362.mp4" },
  { name: "El negociador (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6lsLKuLkobTG7APDGSVwd109TPg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573361.mp4" },
  { name: "El novio de mama (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8cqHaqqDH8TLhn0SCTMts0M65UK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573360.mp4" },
  { name: "El otro Paris (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/voSMS4SpnvRuDYovWosVDuz4eUo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573359.mp4" },
  { name: "El otro Par s 2025", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3ZGF8ePSPz3H4sq1Q1S1z1wpfvv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573358.mp4" },
  { name: "El padel es nuestro (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6KFOfT40Kh0SJEEq1tuuowPEXG9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573357.mp4" },
  { name: "El paseo 8 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aKK9zPMmnTOyezy9M1cnSfsLCAk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573356.mp4" },
  { name: "El Payaso del Maizal (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6YIN3L7lCYR1MiKNKjSg9as1Iz0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573355.mp4" },
  { name: "El p del es nuestro 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573354.mp4" },
  { name: "El piloto (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/juoinefK6tMbjwJhRpRvbAAmrTB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573353.mp4" },
  { name: "El precio de la violencia (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/jRaizO2dTPrKf7VIsitHnvKZW2Z.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573352.mp4" },
  { name: "El primer asesinato (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7OSDlAgpXRNTdecXArA0S75y2aN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573351.mp4" },
  { name: "El Retorno (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/eECi8bMz5XrAzqucLBLIXg90H4F.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573350.mp4" },
  { name: "El secreto de Santa (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mWla8Ndd7YjTdRKqfbdTneoMRPz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573349.mp4" },
  { name: "El Sistema Victoria (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tiM0WkpknLkBjfE2pEBlJ973bTQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573348.mp4" },
  { name: "El talento (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/UHbbLwjeUASlQR4J7SM6BF7cOZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573347.mp4" },
  { name: "El tesoro de Keops (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4sic9AsYo2dyIUQdSKzw9XpuW03.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573346.mp4" },
  { name: "El tiempo que nos queda (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/vuACwlwsDzsm55QFkN2fmFcx8y3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573345.mp4" },
  { name: "El ultimo contrabando (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aEmiccPESNRtY61aKAAbh11ebGp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573344.mp4" },
  { name: "El ultimo encargo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lbpyI9nwzSVDjS7OnE0uC41UciP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573343.mp4" },
  { name: "El ultimo refugio (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9iFkwShRf5M29yLABAdsEZyr9w6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573342.mp4" },
  { name: "El ultimo respiro (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bgcf7lci3pwWSMgHNBlqDDQbyJJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573341.mp4" },
  { name: "El ultimo secreto de Cleopatra (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573340.mp4" },
  { name: "El ultimo suspiro (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/o1t90bgozPJhdYljx7hP9jSmnh7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573339.mp4" },
  { name: "El Valiente (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6yy3Y03MF5hhliTYSKPTTvH34gT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573338.mp4" },
  { name: "El Vengador Toxico (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/41wHrp3eAJlcNogEjLqHoFiSPcg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573337.mp4" },
  { name: "Empezar de nuevo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4I0OOU9ALso0fjavHJRkXjUFMZo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573336.mp4" },
  { name: "En busca de la felicidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bCDQwZ3oKJp8JuxN9AeszbW4ho9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573335.mp4" },
  { name: "En busca de venganza 2 Ciudad de los lobos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6oOyMLOP7wL3yl11E6BURRm2eqZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573334.mp4" },
  { name: "En el camino (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9rgxz1O2kRUYfyyD4jiypaz6IDw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573333.mp4" },
  { name: "En el Reino de las Sombras (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tkMsXx2Cmigomq5ANWHQOIWRC1S.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573332.mp4" },
  { name: "Enemigos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/931RWObebU1Y4EUS2fpwmZQRGPs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573331.mp4" },
  { name: "Enfrentando la oscuridad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/g6inzVOHMo5ciB7qbZ07XOvvK3w.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573330.mp4" },
  { name: "En la linea de fuego (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/wSQYF6sckhXixTtwgeEl3v87Cic.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573329.mp4" },
  { name: "En la l nea de fuego 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573328.mp4" },
  { name: "En suenos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/z2v3lNAA2ymrZuKof4J2vqFIBdw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573327.mp4" },
  { name: "Esa semana juntos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/238RnTgyIsDMEnznrB45r4QxoF3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573326.mp4" },
  { name: "Escapada de Espanto (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/yK26eD5iXTw199cxqwf8yvvk8Rd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573325.mp4" },
  { name: "EspacioTiempo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/szBZF4QOjNeutEShuqxhkXSZP9G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573324.mp4" },
  { name: "Estado electrico (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/swUvAF9d9WKWGQwVCPDu8Qi8ilZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573323.mp4" },
  { name: "Esta funcionando esto (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ulxREzIzqoXjfvFUM3R2mUgK4wx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573322.mp4" },
  { name: "Este maldito f tbol fantasy 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573321.mp4" },
  { name: "Este maldito futbol fantasy (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/hVFMmPPvG1JSkJWMMbzV1llUXM0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573320.mp4" },
  { name: "Estragos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tbsDLmo2Ej8YFM0HKcOGfNMTlyJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573319.mp4" },
  { name: "Eternidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/wtc3feb9u2LzVyMGcj45oe3RgHE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573318.mp4" },
  { name: "Exilio (2024)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4Td91sEilR6mFORIdBJbSWD0QWj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573317.mp4" },
  { name: "Exilio (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/yKVWmPG3QkQWtifw3DJVmlQZ9UY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573316.mp4" },
  { name: "Exit 8 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mqlgMvy1d5jIbIE6SPlJq724htT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573315.mp4" },
  { name: "Exorcismo El Ritual (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/284B2AL0U5M4o85LfRJCdvjTN7N.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573314.mp4" },
  { name: "Exterritorial (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bTYbNWz4kI1P3GzEVvWZwyZT7Uv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573313.mp4" },
  { name: "Fackham Hall (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fwpdRe6WGmzqXFEJYJVepDQ6jrw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573312.mp4" },
  { name: "Familia en renta (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tqNMl8WfOFSfxFgznVOH5Ekm84P.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573311.mp4" },
  { name: "Familiar Touch (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uFXSdQHTIBpUKADogpTl3ECwOaF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573310.mp4" },
  { name: "Fantasmagoria (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7TA8HJFBZ5GBdiiH1lQ1co6TM5L.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573309.mp4" },
  { name: "Feliz Navidar con Elmo y Mark Rober (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/p0DR6j8wwHptbHTyWRawZtXVw0d.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573308.mp4" },
  { name: "Fiasco total El crucero de la caca (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kbuDN8mB8xMMM30rZcgeJHL9j9y.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573307.mp4" },
  { name: "Fiasco total La tragedia del festival Astroworld (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/u8E4aR8ghCnc1gWJTyHxXseHvpy.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573306.mp4" },
  { name: "Fight or Flight (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/c8yjsPIZV4PLTzlb4G8LFMJT7gt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573305.mp4" },
  { name: "Fin de fiesta (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aZVAHRUIwLho8etYvEvUPMKRLg7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573304.mp4" },
  { name: "Fllar Casar Matar (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ouSqCU275wmXHsnFuQSywb3tnSb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573303.mp4" },
  { name: "F llar Casar Matar 2025", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ouSqCU275wmXHsnFuQSywb3tnSb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573302.mp4" },
  { name: "Fotografo de guerra El hombre que capto la imagen (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kZO3xC3GYEHvW2dFppe0CnCMImb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573301.mp4" },
  { name: "Cuatro paredes (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/75zBgOZDVGM86eK5WThXzzuXhzp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573420.mp4" },
  { name: "Cuerno Azulado (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/q0OveDlsh5BNq6ifZqNWKtLKiwb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573421.mp4" },
  { name: "Cuerpos locos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/oerSVMe58ULacCDM2SSnbItLeuu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573422.mp4" },
  { name: "Culpa mia Londres (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/q0HxfkF9eoa6wSVnzwMhuDSK7ba.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573423.mp4" },
  { name: "Culpa nuestra (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6kmi6vmp6iOn4KzI7WfnVtAeJhU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573424.mp4" },
  { name: "Cumpleanos sangriento (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aJD1NwETK4vTrKx6lPuFoCdPLGZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573425.mp4" },
  { name: "Daniela Forever (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bMp6uSDSnsmJOaZIvcclmEiHa1r.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573426.mp4" },
  { name: "David (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dRGOzTWMvRPGeOXKU0FIyG3YVO5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573427.mp4" },
  { name: "Day of Reckoning (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/af5mcUPylOFNcrWSd4OCImC71Mf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573428.mp4" },
  { name: "Decorado (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8GNQ9xEhUnMZspXoTqmpmaVUYV5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573429.mp4" },
  { name: "Dejame Estar Contigo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/g7CoOjbpKO9tAbQhyJgOB6iwrqV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573430.mp4" },
  { name: "Del cielo al infierno (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/b0AQYSM09AYVRKLZr6jIAP2xNq9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573431.mp4" },
  { name: "Delicia (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rzaHDRtLwveEC3hsA3q2PKMTjye.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573432.mp4" },
  { name: "Depredador Cazador de Asesinos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8upWJ1KTR1bAPqXCHAuVOhfuiAZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573433.mp4" },
  { name: "Desastre en familia (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/s47Wf9DxTNPslxIN4VYFJ1d1D2X.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573434.mp4" },
  { name: "Desconectados 2 Reconectados (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ltQVd2J70YY56qxYm1Ya1HaF4ox.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573435.mp4" },
  { name: "Despelote (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/udtlwWSJ45S0uQm29BvFvjPJGW0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573436.mp4" },
  { name: "De vuelta a la accion (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mAvyQ2X3767LwXE2htvAd22ucd3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573437.mp4" },
  { name: "Dhoom Dhaam (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/2E7me3rPi8HqaeheuD86YlpNX6k.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573438.mp4" },
  { name: "Diablo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uFQduVyYIinJy3eLjozgfl6Xtcn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573439.mp4" },
  { name: "Dibujos Imaginarios (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3iA0yPEZWxrVrW4zDBVVaTEXCz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573440.mp4" },
  { name: "Diecinueve (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kgtm27BC45KxVD7yJKzIRMjlo6x.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573441.mp4" },
  { name: "Dimelo bajito (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dvebFZgb6HczmYkOA43bGfSrvYl.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573442.mp4" },
  { name: "Dimensionales (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/vb8wrZlqFXswqranjjSi0w816kl.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573443.mp4" },
  { name: "DJ Ahmet (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ysiY9ah2tDXyfRbgh1Q58d0FvpY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573444.mp4" },
  { name: "DJ encubierto (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mtyIfCHm7FZw1plbwbybj9Stfz8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573445.mp4" },
  { name: "Doble espionaje (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/chIQxgimGbIFnuFsLqpcoTbsH9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573446.mp4" },
  { name: "Doble Traicion (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bEOvj0cEDHTXiyYlCSJ76BpzPuB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573447.mp4" },
  { name: "Dora Aventuras magicas en el Reino de las Sirenas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8rN5AD747CBhzBBaVR9LaEWylgF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573448.mp4" },
  { name: "Dora y la busqueda del Sol Dorado (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/sVLSOnGfNXj7VVGBgOz5cNa0lDz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573449.mp4" },
  { name: "Downton Abbey The Grand Finale (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/f474M02m9FocBhR6sr4DAkvoM2c.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573450.mp4" },
  { name: "Dr. Seusss The Sneetches (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/pBdeeWVarVjq4j3uLLAAXbw2NZZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573451.mp4" },
  { name: "Dr cula 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573452.mp4" },
  { name: "Dreams (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/2gE6z0de4RZVW7YG1IcYBClH9MZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573453.mp4" },
  { name: "Dreams Suenos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/taMMxgN8SEvuAYAAdpG0v3BtKv5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573454.mp4" },
  { name: "Duro de casar (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/lfaU8qybKHg3b6IbHJ11FtIyDn2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573455.mp4" },
  { name: "Echo Valley (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/1E4WCgTodyS7zo8pSp1gZlPO0th.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573419.mp4" },
  { name: "Eddington (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/2uB5UFi0ZMpFglg0QhMAVKCf27X.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573418.mp4" },
  { name: "Eden (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/2xVyCvnuVVRpYohPxrvwxZiH49r.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573417.mp4" },
  { name: "El abismo secreto (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bJToUFSmdyDR1qx2hmjXFJld5vK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573416.mp4" },
  { name: "El accidente de piano (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tTxiiSFFocayJX16Yxs2HB8RVZR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573415.mp4" },
  { name: "El asesino del calendario (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/p6ALxjTM4YUdiCRmHCkZLE6r2pG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573414.mp4" },
  { name: "El banco de Dave 2 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mLrJSg62N6u9dfTkzd0cLLGyWbF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573413.mp4" },
  { name: "El banquete de boda (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/8DTcbtM4SoNVT2leLE3BO75gP1T.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573412.mp4" },
  { name: "El beso de la mujer arana (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aVy3AVg43S0S0dFQLzHl289x1yv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573411.mp4" },
  { name: "El Brutalista (2024) lat", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573410.mp4" },
  { name: "El caos esta en el aire (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7DBLmQ1Dy3PqWJV5FWzo9i3RMGd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573409.mp4" },
  { name: "El caso Eloa Rehen en vivo (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573408.mp4" },
  { name: "El caso Frieda (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/1lAsVqtqt29JwKVhsNcox7P8OHk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573407.mp4" },
  { name: "El casoplon (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/godwprYhs8weMqDEA1iI3bJmm6q.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573406.mp4" },
  { name: "El cautivo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/2vfxMQ3WEA8goCH7LXlAzED9aed.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573405.mp4" },
  { name: "El cielo de los animales (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mKyfAAbXXjKk7ShwcnIMkeE3JSE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573404.mp4" },
  { name: "El club del crimen de los jueves (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/xJeCdbeaLgsEr5DkXD6T67eqZFT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573403.mp4" },
  { name: "El comisario Zende (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dHGtwfVfY502veuMojfAkNbIBO9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573402.mp4" },
  { name: "El Conjuro 4 ltimos ritos 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573401.mp4" },
  { name: "El corazon de mi nina (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/oj2y8UYScRemDQTHmq9Kfwe3EpQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573400.mp4" },
  { name: "El coro de Ramsden (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/iLNyy9jXTdod8yPOn2tQrVEyuO2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573399.mp4" },
  { name: "El Cuchillo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/du65x58CJrMMThuiT85kBFMYi0Z.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573398.mp4" },
  { name: "El cuento del lobo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dP9K1gVK9mBksCSn1Z7E64OMoRG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573397.mp4" },
  { name: "El d a de la masacre 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573396.mp4" },
  { name: "El demonio de Alaska (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/zPI3xK4a4oXUZVrxNWLc8Rck0Cd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573395.mp4" },
  { name: "Ojos de Corazon (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6v0LlIAW903yLbsoTw6DMUAaQeq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573537.mp4" },
  { name: "One Chicago Crossover Event (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573538.mp4" },
  { name: "One of Them Days (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7FCcl763dbG6ieiqdKbYBkDzohS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573539.mp4" },
  { name: "On Falling (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/i8PhtOAxl2NnH08vGCDkNAw9bA5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573540.mp4" },
  { name: "OniGoroshi Ciudad de los demonios (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/cU6InMc8NYc54Ok4NnNHdjipqCQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573541.mp4" },
  { name: "On the Go (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/cTnsQaiUq1hR6bOfIw6uBYCGktN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573542.mp4" },
  { name: "Operacion Maldoror (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573543.mp4" },
  { name: "Opus (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/5KPh4GB1Vng9g9QOhvXCTtMAEc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573544.mp4" },
  { name: "Osiris (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ky0P36kdTD86ZFPEcBapc6gbue3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573545.mp4" },
  { name: "Otro amor fuera de tiempo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/sEIP1pTVXa8BJaYSuVeVG3wFN10.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573546.mp4" },
  { name: "Otro pequeno favor (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/74kVRS7yqXH9ymdd2DbvQ3MR09C.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573547.mp4" },
  { name: "Padre no hay mas que uno 5 Nido repleto (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7H27uvaPZfq794qVcLFrSEgHseZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573548.mp4" },
  { name: "Padres (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9xgp7atCnf1hnC8mdvieM7oplXS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573549.mp4" },
  { name: "Pangolin Kulus Journey (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/y2VWWAPcicBqCDwqyuibfbfiJaS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573550.mp4" },
  { name: "Panico en el tren bala (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qDyJuHpn0Sh19fMv52vRTwGBx4g.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573551.mp4" },
  { name: "Papa x dos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/gclIrK0PYAVXhROFQuH6ju15k8h.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573552.mp4" },
  { name: "Parecido a un asesinato (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9hGp5Zwe5fRwvTYbtAwjClVJNnd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573553.mp4" },
  { name: "Parking (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/cZdZCT8PG1UYFPjk11XUUIDfKs3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573554.mp4" },
  { name: "Partisanos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/yrQVtisoMqRpmmobUoUGxb6RAoz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573555.mp4" },
  { name: "Patriotismo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kOLkpkS2T4HAdA6J7uq4eipNTup.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573556.mp4" },
  { name: "Patrulla de aterrizaje Operacion bola de nieve (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/nmbyvqhJE9MMSW0zYCvCsEfgY0C.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573557.mp4" },
  { name: "PAW Patrol especial de Navidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/22jKJhRDxGBE2FBKWD1XPvFYaG5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573558.mp4" },
  { name: "Perdidas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/sLDxndoqFWwJEq7iEdYQBzPjUDQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573559.mp4" },
  { name: "Perdida Total (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qweOvbSGTTG5sTpokW09s70gh9J.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573560.mp4" },
  { name: "Piglets Return (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/q5EgekSffLNiHk05SCdB96byC97.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573561.mp4" },
  { name: "Planeta Solteros Una aventura en Grecia (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fwXkQNBHRPpPUdRcCvd2BUXkElc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573562.mp4" },
  { name: "Plan familiar 2 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/sxoN17pPyL6SiqD8F6DXmTPILwJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573563.mp4" },
  { name: "Policias de la mafia (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6bPAC4sHupPb7Kr8e2T2Ltnhdpn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573564.mp4" },
  { name: "Por el mal camino (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mNCVMaK3UMR6yyAoH0YnOSwlZTd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573565.mp4" },
  { name: "Presas del abismo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rqpjQQPubIduZlyXktrI6VSujx7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573566.mp4" },
  { name: "Presente continuo (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/oEJIL0ZND2B25qalWIBNyoyLxQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573567.mp4" },
  { name: "Pretty Thing (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/xWVbtqUvuhAOYzkZV6YDQOnN5fQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573568.mp4" },
  { name: "Prisionero de guerra (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6paGLyOAvY95XxjfdiTcatwI7dJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573569.mp4" },
  { name: "Profugo por accidente (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/syg221lrQPzhqn8lSXLYA4LdVaI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573570.mp4" },
  { name: "Putin (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/j3Q2MrpmaOrKfN2pInNvRNhYa4G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573571.mp4" },
  { name: "Quien es Luigi Mangione (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/1UymgOU9dlGdj0xEoi4fDJKJf30.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573572.mp4" },
  { name: "Quien quiere casarse con un astronauta (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/5SBePVhGosxVnyfSURUahiR1bGI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573573.mp4" },
  { name: "Ramon and Ramon (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/k6dP7oDg2oJ4RmzmUhAHrUH6IWD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573574.mp4" },
  { name: "Rapaces (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/apvuSq8TX1yf5sVLRrVC7Zdh7ty.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573575.mp4" },
  { name: "Una abogada brillante (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rWwfU4etugzsAiMJVvMdqM8DRVC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573576.mp4" },
  { name: "Una amistad para siempre La aventura (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/iHFs6hwDlDsKagchvsmR63Bm078.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573577.mp4" },
  { name: "Una ballena (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qwf9zfHVdpDRHqerMwZ2NtXItDY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573578.mp4" },
  { name: "Una batalla tras otra (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/iZ1499F6hYxDxiqioy8oSUaxipG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573579.mp4" },
  { name: "Una boda en las Bahamas con Madea (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/brXUEyuY25r3ksIt8poDGjNyWNt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573580.mp4" },
  { name: "Una casa llena de dinamita (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ku4vTAnfTgO5oPPaHqyLtP39LrE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573581.mp4" },
  { name: "Una historia de amor en Copenhague (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uflnD9Gl6Ia327IYfjNtNSxjzdO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573582.mp4" },
  { name: "una historia de Tracker (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/r3U9MCWTOFtqfdsgyXblOXFEYgy.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573583.mp4" },
  { name: "Una muerte antes de una boda (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/bOVmksfmax1kA7FF0pmCq89TrF4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573584.mp4" },
  { name: "Una muerte silenciosa (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dfxVkV5vFZmgnR2zzoj6virotwB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573585.mp4" },
  { name: "Una mujer normal (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/81qLGik27wRW9NRg2Zrx9adbvdK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573586.mp4" },
  { name: "Una Navidad diferente (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/sAitXp2OsxbwSMGt53XZQyuI72l.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573587.mp4" },
  { name: "Una Navidad EXtra (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aCh3KvC7abbNex2d4dKMnIeQs3Q.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573588.mp4" },
  { name: "Una Navidad Muy Jonas Brothers (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rQp9P3CigiN3bgNm0NkYoSl3bMv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573589.mp4" },
  { name: "Una Pelicula de Navidad de Loud House Loud Travieso o Loud Bueno (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573590.mp4" },
  { name: "Una quinta portuguesa (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/yq3HwogoVCxYkWyEd0aCi62ewjY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573591.mp4" },
  { name: "Una vida honrada (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/w6Xdq2juOSaK6QlOQhuYNltmWUU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573592.mp4" },
  { name: "Un matrimonio mortal en Carolina del Norte (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/c8G6CoHY1psABHv312r39NeOPdu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573593.mp4" },
  { name: "Un Mejor Papa (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/jwHb5xK4UGkrxEoHsMiT0MTYsOC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573594.mp4" },
  { name: "Un mundo maravilloso (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/t5YN7vsHePlcnhoT21xRfErJE9J.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573595.mp4" },
  { name: "Uno equis dos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ieBuOrFCS1CRwSNwjutaGUgYECO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573596.mp4" },
  { name: "Un robo muy navideno (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/90vYAz1JCdbF2Ggx2VQUQEfitbN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573597.mp4" },
  { name: "Vaya Navidad (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uNmyZChmLKqxROmbsylj5sbzGUR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573598.mp4" },
  { name: "VEILS (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/eX6WC02RFdm2Om6iPzV5YV3wFAv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573599.mp4" },
  { name: "Velocidad salvaje (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/nDNvZhJeMSwi8UH8jbpZvLMUfjp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573600.mp4" },
  { name: "Venganza justificada (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3kliZ6mw8ZgnhfmHw14Zye6GyPS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573601.mp4" },
  { name: "Verano infernal (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/gCEJCaIzrU7FiOrv6fMMMnQ163B.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573602.mp4" },
  { name: "Verano Trippin (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/eMyoKrHkmrCkDfVYXO3DV48OaeM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573603.mp4" },
  { name: "Verdad y traicion (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/jdugSr7F0kFavNqUaDytcJUgRGW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573604.mp4" },
  { name: "VHSHalloween (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573536.mp4" },
  { name: "Viaje de fin de curso Mallorca (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/A8E8EqXqETV8ggPiOkHjaBU8H9N.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573535.mp4" },
  { name: "Vicious (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qYCA7XkLRUNS1DC7c8ehtj6W4XM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573534.mp4" },
  { name: "Vidas en matrimonio (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ak7KjBRMPJN8kaAHwlY4b51VbYA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573533.mp4" },
  { name: "Vieja loca (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/669MUVWVctgxCDBpeaiorOgDjjI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573532.mp4" },
  { name: "Vini (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/s1zEsvB5XoS0Gqr7tmnNZExVdRI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573531.mp4" },
  { name: "vino del mar (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/2sq0kvNtmDsdACS2WhJDsor9BAG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573530.mp4" },
  { name: "Viva la vida (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4UEiDjGke43KD1SX13rdFQDYaR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573529.mp4" },
  { name: "Viviendo con mi ex (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aG95CIPDHmo3r5s9MwQouQWH4UA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573528.mp4" },
  { name: "Votemos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rVYEP9R8fBe6sxrqc3gP1cAehYZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573527.mp4" },
  { name: "Voy a pasarmelo mejor (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4ov5cLaFO8toC7HBDl6T0Vg8pQo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573526.mp4" },
  { name: "War 2 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/j8Gl3S4L7LE8GIF1J1phZ2Cbo72.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573525.mp4" },
  { name: "War of the Worlds (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fjgSlNGECNgVeMJaOdDAXmGh7ZM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573524.mp4" },
  { name: "Whiteout (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/hrBFCzO6AehdjCJNgP6DB12LAw8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573523.mp4" },
  { name: "Wunderschoner (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aPJVxNLNffSeiEgJPo1b3yAkZP2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573522.mp4" },
  { name: "Ya no quedan junglas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/9aCPjtt0mxnMmdvdfCuCGDqxEg8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573521.mp4" },
  { name: "Ya se vera (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qlhukyCnDmaWICbfaDE4S5J4duc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573520.mp4" },
  { name: "Y d nde est el polic a 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573519.mp4" },
  { name: "Y ella dijo quizas (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/zxiL8i4fxhdFFwvfkTTahQCK7dT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573518.mp4" },
  { name: "Y ella dijo quiz s 2025", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573517.mp4" },
  { name: "Yo era un extrano (2025)", group: "Películas 2025", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573516.mp4" },
  { name: "ZOMBIES 4 Dawn of the Vampires (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ozfvKsZcOWj50b7hdC58ifHEebv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573515.mp4" },
  { name: "Zona de caza (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/u6DNzvz4y3XS5QYqsvvauIx4Xvc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573514.mp4" },
  { name: "Zoopocalipsis (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/49s9HB9bXMjHkdw0asNs7m1rO5E.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573513.mp4" },
  { name: "Z Zone (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ynW7ZFLZsbVQozvzdAOLdQrLL9P.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573512.mp4" },
  { name: "artista en guerra (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/aKRTAib5hAyH85TdxbJacuWgg2M.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573622.mp4" },
  { name: "bebe (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/6KRFqIAE5gz35b1kZoFcrqmfOj2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573621.mp4" },
  { name: "de Tyler Perry (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/k4fJun2pJ70BBFMgGAZddk3m7sg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573627.mp4" },
  { name: "divorciada 2 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/7vGti5pNo3qsAiZJHDo1ipxSmU5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573626.mp4" },
  { name: "dos novias (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/tSgTPeGkj7vGpctZvBuV78ivtZq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573625.mp4" },
  { name: "el asesino BTK (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/47EblKlcEQ4lHdTVnay4P1d6thf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573624.mp4" },
  { name: "el rescate del lince (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/64ZfqNxyFGql2Tc83PC3iOuxVQk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573623.mp4" },
  { name: "Frankie y Los Monstruos (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/kXsI6DluqNnBfJenlXNuIpiPTOU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573653.mp4" },
  { name: "Freaky Tales (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/z17yqLUxfyNUGE75uJxFPTCOmvV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573654.mp4" },
  { name: "French Lover (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/s91yhwxBwDPfLUM7qTlJKzxzrV4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573655.mp4" },
  { name: "Frewaka (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/h4NWwBOVmzUH4a5sviENAZYdljV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573656.mp4" },
  { name: "Friendship (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/p5k9BpwG6vwMsmlqXRUKqW5MCZo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573657.mp4" },
  { name: "Fuera de foco (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/nyry65HQIe9YopvRY4Gt4oWF2VW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573658.mp4" },
  { name: "Fuera de pista 2 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/cL9Pg5qYLsPPlJrClmvuBMTaC4o.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573659.mp4" },
  { name: "Fue un accidente (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/spBARwuVCPxunzk2TkL9j0vGY3c.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573660.mp4" },
  { name: "Furioza 2 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/3f98fpG9s666xLcxX4rL0KRWRiE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573661.mp4" },
  { name: "Gatillero (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/p9mPi01GuHZXn2NxXc7d6m1xxpa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573662.mp4" },
  { name: "Gaua (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uKSS2AnpX5jiQM4xUrNEjFjd2pn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573663.mp4" },
  { name: "Giro final (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/npzFyBu4fFPQpWXaLKdrXc6JrUK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573664.mp4" },
  { name: "Gladiator Underground (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/mFslGVbAf1jHK5a2PsPrSQkuOt6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573665.mp4" },
  { name: "Golpe de superacion (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/xcXq6q0p6QEXZC1o8UIFHt3L1EE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573666.mp4" },
  { name: "Gravedad cero (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/4rOMi0FAfFwLfS1qsoklDAejI70.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573667.mp4" },
  { name: "Guillermo Tell (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/f9JBhW0bjkfPufuyNyhcA5s7NVB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573668.mp4" },
  { name: "Gunman (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/f6ubu3WuGzNy1l0Jin7WlB0YPPZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573669.mp4" },
  { name: "Gunslingers (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/15nIlGhkJ1fVt0J4DA4xpDGR6r5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573670.mp4" },
  { name: "Halloween La noche del espantapajaros (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/cT4RLIqnDCClLxxEcqpz5kcifU4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573671.mp4" },
  { name: "Hamnet (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qXF968t2LfHZJ8Zrq2NgMGNomnE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573672.mp4" },
  { name: "Happy Gilmore 2 (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/utIg6Vghn65A7rz8tH9ItHUuCzU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573673.mp4" },
  { name: "Harpia Acecho maligno (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/60wDbXGVlOZkEP6hbBjTGWrgmJa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573674.mp4" },
  { name: "Haz que regrese (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/cl3VbcYxzWnDPetd7SbdhSxwWoL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573675.mp4" },
  { name: "Hedda (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ecflk7AZf0ij205yDswjlvdxlCO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573676.mp4" },
  { name: "Henry Danger La pelicula (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/dTHEq2PIRAIq4COayxraiGiaajX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573677.mp4" },
  { name: "Heroes de Malegaon (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/ewuDGZQwDjRi6w0OWUwMVDNrTna.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573678.mp4" },
  { name: "HIGH FIVE (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/xpqa2ShXecFxMUGKv82Zx56ZoUD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573679.mp4" },
  { name: "HIM El elegido (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uXE0bHBNY3TL932JhiQJscxnJya.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573680.mp4" },
  { name: "HIM El elegido 2025", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/uXE0bHBNY3TL932JhiQJscxnJya.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573681.mp4" },
  { name: "Historia de una Madre y su Hija (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/eN7KGtf2P04kH4Sky6AzhpCzape.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573682.mp4" },
  { name: "Hogar siniestro (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/qxBpsKyyyjSenFGnQEUbR5Eq3Ub.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573683.mp4" },
  { name: "hola (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fh8qIKgIwaeuDZ215JF4ylugMZs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573684.mp4" },
  { name: "Hola Frida (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fh8qIKgIwaeuDZ215JF4ylugMZs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573685.mp4" },
  { name: "Holland (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/39jIr3A4ScUeGxFdMeARYKNxTgU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573652.mp4" },
  { name: "Hombre con H (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/13YfSFk8PXRDyU0ZOeWUPOVnrec.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573651.mp4" },
  { name: "Honey Dont (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/fJm3kmd9NLZWypMas7g34oNFgbk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573650.mp4" },
  { name: "Hook (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/oKE2xPJs87V9DbDmoo8igAsDeH1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573649.mp4" },
  { name: "Host (2025)", group: "Películas 2025", logo: "https://image.tmdb.org/t/p/w400/rG5Rm2l5PAvWK8623Bhu8xRShRC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/573648.mp4" },
  { name: "Esta es la U (2024) (D)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/a91TkdqPM4uneZmNsdsPrVTedaN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/556840.mp4" },
  { name: "Novata Espacial (2024) (D)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/drXnPoX7sBlq2dqQ5zZkREiO6Hy.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540817.mp4" },
  { name: "Topuria. Matador (2024) D", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/t67EVJZpjyZdYS5mK6Ra3si044c.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539395.mp4" },
  { name: "Gerado por Testador IPTV(PlayStore)", group: "Películas 2024", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582724.testadoriptv" },
  { name: "Rada: La Pelicula (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/yTUI5R9MkYzlMoOukETAO7RGSMY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582725.mp4" },
  { name: "Sed de Venganza 2 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/2xmQEwAhTpNUnMvQioS85ojvnO5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582726.mp4" },
  { name: "Un Gato con Suerte (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/4clvunwVxvwjem4y1BjuqImlPB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582727.mp4" },
  { name: "Venom: El Ultimo Baile (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/toZiAd0n0NKhiuHTiGk7kBMmhtG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582728.mp4" },
  { name: "Sonríe 2 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/aQtWauWpy5KQEHsBURDnoTD6svd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582729.mp4" },
  { name: "Jake Paul vs", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/hn6CZjSSktg1Dv9E1VCwqi2PI5G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582730.mp4" },
  { name: "Objetivo Secreto (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/bnBNgSvZxyDxuyiSXxxsQoV2k0W.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582731.mp4" },
  { name: "Apocalipsis Z: El Principio del Fin (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/jaBToJ1DZcwn5wOsQeLOXFVlBLn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582733.mp4" },
  { name: "Guasón 2: Folie à Deux (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/i90gQD1ogdrX2EE2bYCtYSuqjRV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582734.mp4" },
  { name: "Mi Amigo El Pingüino (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/fSXfiHmKHvWleDwsuuYeLfg8qga.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582735.mp4" },
  { name: "Canario Negro (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/iCNkHfsB3mCOCwDLOmjIZotGPID.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582736.mp4" },
  { name: "El Atraco (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/guXYrVOdyTCmBtH8voVPmeroW6S.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582737.mp4" },
  { name: "Hellboy: El Hombre Torcido (2024)", group: "Películas 2024", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582738.mp4" },
  { name: "La Sustancia (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/4cJyrYA7I29QabrQ0S89N1iWUV2.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582739.mp4" },
  { name: "Robot Salvaje (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/a0a7RC01aTa7pOnskgJb3mCD2Ba.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582740.mp4" },
  { name: "Hermanos (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/4LiZlaqMMd6TQhTUfgLn4VfD5zo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582741.mp4" },
  { name: "La Cueva Azul (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/5zlbRu9X2FCSkDxV4ZhrPrJDgg8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582742.mp4" },
  { name: "Alien: Romulus (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/8PYqGSd8MOm5ce8io4qNSAiSExW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582743.mp4" },
  { name: "Aguanta la Respiración (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/pLxy9uzUZOjj6TTAzxhBJayPZT7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582744.mp4" },
  { name: "Beetlejuice Beetlejuice (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/kWJw7dCWHcfMLr0irTHAPIKrJ4I.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582745.mp4" },
  { name: "El Hoyo 2 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/jHGgM019xAoy62cKZtDmTxvQlUY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582746.mp4" },
  { name: "Siempre Juntos (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/7lKgGBXutUpySOd7phZ45zrj191.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582747.mp4" },
  { name: "Padre no hay más que uno 4: Campanas de Boda (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/hTMvGolGJLF0GQ7mlwNjbXpsPZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582748.mp4" },
  { name: "Culpa Cero (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/3f93YAzZRc2vtOQyRqrakD0YS3O.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582749.mp4" },
  { name: "No hables con Extraños (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/4rFJZjGPZjeOg8LpdeXpWB7uzJ1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582750.mp4" },
  { name: "Vidas Perfectas (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/6W3LWbOZTbmv0SKe4OizWR0rEtW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582751.mp4" },
  { name: "Mascotas En Apuros (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/hI9HYiTquDB6ykZraUf2ElpArKL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582752.mp4" },
  { name: "Los Iniciados: El Diario de las Sombras (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/6340ZG3qHfS7q8ES5rwf4AQ0U1w.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582753.mp4" },
  { name: "Departamento 7A (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/5sEW4ITXx0BAgqQOsztzIc72gh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582754.mp4" },
  { name: "El Hombre Celoso (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/zKPAYVaGyg0hesiiEZPxRv7w9Al.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582755.mp4" },
  { name: "Lobos (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/uQbLoLKahFHMbvOTvacyi9HYwTO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582756.mp4" },
  { name: "Romper el Círculo (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/hvpQDMkfAbkiz8kxJOybcNSAq1j.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582757.mp4" },
  { name: "Inexpertos (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ukpk3ZFeDOmznIBFbSpdXb6o1pt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582758.mp4" },
  { name: "Los Instigadores (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/zDWHsjfdsvZZkMWo1u1Ep7Y77FQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582759.mp4" },
  { name: "El Exorcismo de Georgetown (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ioQCdjn2YPfAJMfJlgzNdXgYZrr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582760.mp4" },
  { name: "Ibiza, Locomía (2024)\\" tvg-logo=\\"https://image.tmdb.org/t/p/w400/veNhSeNyJN1ZXXqtDYdPhoxE9DR.jpg\\" group-title=\\"⏩ ESTRENOS 2024 ⏪\\", Disco, Ibiza, Locomía (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/veNhSeNyJN1ZXXqtDYdPhoxE9DR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582761.mp4" },
  { name: "Parpadea dos Veces (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/rtvvyUXTLVDWWYlHBaBlA4CeTLg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582762.mp4" },
  { name: "El Cuervo (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ywQsxaKU3BTT0UMq134qsU9n4IT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582763.mp4" },
  { name: "Los Feos (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/rsNSv2alCHJK72JvB81aSdk9Fms.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582764.mp4" },
  { name: "Bandida: La Número Uno (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/eVF4hqkBD1maZueHDEhhe02kNhj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582765.mp4" },
  { name: "Rebel Ridge (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/lH3uawGaDUEV6oJNc5No4n8IQPA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582766.mp4" },
  { name: "Una Maniobra Arriesgada (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ucazjbwjbLc4iSPPR28ENAgTLLh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582767.mp4" },
  { name: "Bosco (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/dXjSeS3w97setnrNv4m6tlqqXzn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582768.mp4" },
  { name: "Borderlands: El Destino del Universo Está en Juego (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/jtEZi4eZxDjxcDIeMbkQ8HmvRs1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582769.mp4" },
  { name: "The Killer (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/6PCnxKZZIVRanWb710pNpYVkCSw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582770.mp4" },
  { name: "Las Hermanas Fantásticas (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/1Nk5zwg7Sx2mKotH4mkLX2lY2km.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582771.mp4" },
  { name: "La Trampa (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/j81fGYj8hjDhpdNSHzREWMaE8p8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582772.mp4" },
  { name: "Harold y su Crayón Mágico (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/1LRmVHwhH4bCyMHHgz3ZZdqu7lO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582773.mp4" },
  { name: "Tipos de Gentileza (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/8loKNUHhW0KPe3iS7JYozXHLIOB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582774.mp4" },
  { name: "Longlegs: Coleccionista de Almas (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/tMdOL2d6bTv2ZhRbbUuNBrRAZ1G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582775.mp4" },
  { name: "Rescate Imposible (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/cawaXqf12YFiThhngc1wbt5MfBs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582776.mp4" },
  { name: "Intensa Mente 2 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/lE3DCRI7bQgHSiIuEPcFiXpiuGV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582777.mp4" },
  { name: "El Sindicato (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/1UHp2QEBPnTrcx0i6aYw6jWtDbI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582778.mp4" },
  { name: "No Puedo Vivir sin Ti (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ohtCcB46D3ki1FGoh1QvA1R14sk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582779.mp4" },
  { name: "Colateral (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/nFBjI5qFkqfvEvEx6VaylKGSOqp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582780.mp4" },
  { name: "Jackpot: Lotería Mortal (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/jExWD6GuvfSgOMMG49CF9Z5C6ZN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582781.mp4" },
  { name: "La Otra Cara de la Luna (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/tWDZF3PuigBvYisM83ZPuWM4v89.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582782.mp4" },
  { name: "La Niña del Mar (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ew4MFhQR6NiTdJiiFFGHo8z1qiT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582783.mp4" },
  { name: "Tornados (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/50xgtaDR0xJkLSVghdTGUeMoPHP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582784.mp4" },
  { name: "Un Extraño en el Bosque (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/dGGXoFRiXiHi72GKst6ulBny87I.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582785.mp4" },
  { name: "MaXXXine (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/mu1YNlNz6Zx005A1IAE2JNHtAbB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582786.mp4" },
  { name: "Al Rescate de Fondo de Bikini: La Película de Arenita Mejillas (2024)", group: "Películas 2024", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582787.mp4" },
  { name: "Deadpool & Wolverine (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/9TFSqghEHrlBMRR63yTx80Orxva.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582788.mkv" },
  { name: "Mi Villano Favorito 4 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/b6JX0fBne5yPFNBtdp4Imi3CpiE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582789.mkv" },
  { name: "Un Lugar en Silencio: Día Uno (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/6efQJ7pu9GPketUDBAhJtgZLkvD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582790.mp4" },
  { name: "No Negociable (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/2kEL2QFPyqGcFhGvzVos58dQXKS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582791.mp4" },
  { name: "El Ministerio de la Guerra (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/zhvyWzZii2SWpsrcUvLZJNaJyoG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582792.mp4" },
  { name: "Un Afortunado Soñador (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ymyyoJLOKIc9XW7t4RdvLSjf5We.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582793.mp4" },
  { name: "Capitán Avispa (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/zmthz3CuFljmBQcfuaz4hBNwbQ0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582794.mp4" },
  { name: "Juego de Espías: La Ciudad Eterna (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ghlwOez45gndnAp3aPMzg5kxMjp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582795.mp4" },
  { name: "Descendientes: El Ascenso de Red (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/57XarHzHxeDouUyjAb6BpVxIkC0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582796.mp4" },
  { name: "de Tyler Perry (2024)\\" tvg-logo=\\"https://image.tmdb.org/t/p/w400/mdas5vG9QXZjFU2F6dE9BALiMov.jpg\\" group-title=\\"⏩ ESTRENOS 2024 ⏪\\", Divorcio en Negro, de Tyler Perry (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/mdas5vG9QXZjFU2F6dE9BALiMov.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582797.mp4" },
  { name: "Detonantes (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/mOXgCNK2PKf7xlpsZzybMscFsqm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582799.mp4" },
  { name: "Bad Boys: Hasta la Muerte (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/53y0ETa1TGdVrMEVx7oLW86ay8r.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582800.mkv" },
  { name: "Perra Vida (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/bLEvem4noAw83zoLRaSyeQEYQ2o.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582723.mp4" },
  { name: "Los Extraños Capítulo 1 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/1rTRllZNEAX30dTxYL1hONR6gPj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582801.mp4" },
  { name: "Winnie Pooh: Miel y Sangre 2 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/7BSJhvwvrhifE8DyA5cuXgLRYLx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582716.mp4" },
  { name: "Cómplices del Engaño (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/pWkpI5w07073TpTiJRgTig85gLC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582802.mp4" },
  { name: "Perdidos en el Amazonas (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/7UMunKMb1tTl1HuA8bOeAXDRTo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582803.mp4" },
  { name: "¿Estoy Bien? (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/tgnubeagHdMkV13rDlQ3GrpUZ32.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582804.mp4" },
  { name: "Inmaculada (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/74VLJ09lDqNvJHeIgmwJHtualhR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582805.mkv" },
  { name: "Furiosa: de la Saga Mad Max (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/tGHUlykWn9V2IIQ4ZaATIAq9VLB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582806.mp4" },
  { name: "Guerra Civil (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/8Tvbma008LJDTS6o3VwYznYJcU1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582807.mp4" },
  { name: "Amigos Imaginarios (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/8RgGuC7w8JxhykauzTC4bwha1J8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582808.mp4" },
  { name: "Rivales (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/Aiqfn4XtXUPr7QNsDsAKNQ1aOKV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582720.mp4" },
  { name: "Pared con Pared (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/kgWPRttsBx1q5SZ72HCVHRUyDqO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582809.mp4" },
  { name: "Sayen: La Cazadora (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/rkvIQqHCEE0pj0yGJqsYC97vjjI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582719.mp4" },
  { name: "Rebel Moon - Parte Dos: La Guerrera que Deja Marcas (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ivhOeG5S2CzKjcKhureKAtfonHg.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582722.mp4" },
  { name: "El Pájaro Loco se va de Campamento (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/x7QXH6T8oTKlUbKt8TD1rPimzCr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582810.mp4" },
  { name: "Jack en la Caja Maldita 3 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/uHfddXNm1pOZDn4D8ttsZi1jcgT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582811.mp4" },
  { name: "Imaginario: Juguete Diabólico (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/6jrq4lA5KV3oIFnCYGDueSMTENd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582812.mp4" },
  { name: "Cazafantasmas: Apocalipsis Fantasma (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/fIUqk6Pjo3uf5RiOGT19KQ53ekq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582814.mp4" },
  { name: "Shirley (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/iSwTnNS7TKAS79Sz9LvyqlBxxrU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582718.mp4" },
  { name: "Un Deseo Irlandés (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/gzdsIX1nQZAIcAzIvSuSzKyWI9u.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582717.mp4" },
  { name: "Ricky Stanicky: El Impostor (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/eMJPQmvTC39ctlnWlFLJbXqrbSP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582721.mp4" },
  { name: "El Duro (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/oQmxxuPaKaqGVHDRL9XzgOyje0j.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582706.mp4" },
  { name: "Frida (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/fh8qIKgIwaeuDZ215JF4ylugMZs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582705.mp4" },
  { name: "Damsel (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/6tJWxRfBKWGIPFkfLTod2CgCexU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582710.mp4" },
  { name: "Kung Fu Panda 4 (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/2xgGWjM3a38E4KTLapvC53RnpN1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582703.mp4" },
  { name: "Megamente Contra el Sindicato de Doom (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/jdXLCBv0oFjWbTtQTuoJFXVPsbd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582700.mp4" },
  { name: "Duna: Parte Dos (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/xCHmhHeO7aOCMlzcNukGH6Q7EiD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582708.mp4" },
  { name: "El Astronauta (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/4WoFKGoh7NjuWaDilWre56BhXYO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582707.mp4" },
  { name: "Código 8: Renegados (Parte II) (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/ao4eKQf4K8qOQWACLSqkwt4y6CT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582711.mp4" },
  { name: "Jaque Mate (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/umRkEsTwKU5nVbLVNw22cYB2fjm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582704.mp4" },
  { name: "Diario de mi Vagina (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/7PzGmlaai6mRUslfrdBhfXjfA1J.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582709.mp4" },
  { name: "Mea Culpa (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/roxD9VCTTXYfPjVj9HiSC5IMtc7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582701.mp4" },
  { name: "A Través de mi Ventana 3: A Través de tu Mirada (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/1RxPBKMpHlcm5PORiPo6LHUV2ft.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582714.mp4" },
  { name: "Cinco Citas a Ciegas (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/iIaxCfXYPeYzWGHDaBZ8oiMtHoJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582712.mp4" },
  { name: "Madame Web (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/blq050GHBt0Fzx1j9FvohaEuknJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582702.mp4" },
  { name: "Bob Marley: La Leyenda (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/2QlWpWXZ7exFSsWm8K0Gu9Yqfib.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582713.mp4" },
  { name: "Ascenso (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/2D7SsqU8VZOl838KR7q9pzljaLe.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582715.mp4" },
  { name: "Suncoast (2024)", group: "Películas 2024", logo: "https://image.tmdb.org/t/p/w400/nmPLUp5lVMiGomkN3db1WPeNrz3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/582699.mp4" },
  { name: "La llamada Fatal (2023) (D)", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8pylpXylNvZFpe0FzGvYXbRvgDQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562896.mp4" },
  { name: "Al servicio del Reich (2023) (D)", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/m45rsukE42bHTibKfHUVYKbPxCr.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540820.mp4" },
  { name: "Dulces y Sangrientos 16 (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458772.mp4" },
  { name: "Extraños", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458771.mp4" },
  { name: "Notre tout petit petit mariage (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458770.mp4" },
  { name: "Temporada de huracanes (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458769.mp4" },
  { name: "El estrangulador de Boston (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458768.mp4" },
  { name: "Me Heriste (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458767.mp4" },
  { name: "Huesera (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458766.mkv" },
  { name: "¡Hasta la madre del Día de las Madres! (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458765.mp4" },
  { name: "Here Love Lies (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458764.mp4" },
  { name: "Christmas in Scotland 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/ofEpMQIIPvl3LK5YzG3vmVjxabJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458763.mp4" },
  { name: "House Party (2023)", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458762.mp4" },
  { name: "Soltera codiciada 2 (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458761.mp4" },
  { name: "Reunión 10 años – No se aceptan devoluciones (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458760.mp4" },
  { name: "Amor sin sentido (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458759.mp4" },
  { name: "El vuelo de los ladrones (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458758.mp4" },
  { name: "Los que se quedan (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458756.mp4" },
  { name: "Unicornios (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458755.mp4" },
  { name: "La memoria infinita (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458754.mp4" },
  { name: "Maestro (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458753.mp4" },
  { name: "La heredera de la mafia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458751.mp4" },
  { name: "Su único hijo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458750.mp4" },
  { name: "Los bastardos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458749.mp4" },
  { name: "Fanfic (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458748.mp4" },
  { name: "Arenas mortales (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458747.mp4" },
  { name: "Rise of the Footsoldier: Vengeance (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458746.mp4" },
  { name: "Los juegos del hambre: La balada de pájaros cantores y serpientes (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458745.mp4" },
  { name: "Munch (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458744.mp4" },
  { name: "Gringa 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/beUJW2syzHrGiVXJAwL72xn4iiD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458743.mp4" },
  { name: "My Landlord Wants Me Dead (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458742.mp4" },
  { name: "La Libreta Negra (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458741.mp4" },
  { name: "Huida sangrienta (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458740.mp4" },
  { name: "Hijos de perra (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458739.mp4" },
  { name: "Black Noise 2023 HD CAM CON PUBLICIDAD", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458738.mp4" },
  { name: "Tu navidad o la mia 2 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/1Pfxk2XiO1NlifAjOthpmwSectF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458737.mp4" },
  { name: "Francotirador: E.I.R.G. – Equipo de inteligencia y respuesta global (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458736.mp4" },
  { name: "Uno Para Morir (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458735.mp4" },
  { name: "El Justiciero: Capítulo final (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458734.mp4" },
  { name: "Desconectada (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458733.mp4" },
  { name: "Mr. Monks Last Case A Monk Movie 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/49jsE0Z1bXJX5RO2Dazgqc2PZKn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458732.mp4" },
  { name: "Miniespías: Armagedón (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458731.mp4" },
  { name: "Gunfight at Rio Bravo 2023 HD-CAM-CON PUBLICIDAD", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458730.mp4" },
  { name: "Nyad (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458729.mp4" },
  { name: "Spider-Man: A través del Spider-Verso (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458728.mp4" },
  { name: "In the Land of Saints and Sinners 2023 con anuncios", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458727.mp4" },
  { name: "La corriente (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458726.mp4" },
  { name: "Una buena persona (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458725.mp4" },
  { name: "Snag (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458724.mp4" },
  { name: "Me llamo Chihiro (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458723.mp4" },
  { name: "John Wick Chapter 4 Final FHD 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458722.mp4" },
  { name: "Cuando termines de salvar el mundo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458721.mp4" },
  { name: "Misántropo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458720.mp4" },
  { name: "Paradise (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458719.mp4" },
  { name: "Última llamada para Estambul (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458718.mp4" },
  { name: "mi amor (2023)\\" tvg-logo=\\"http://mundo2.pro:80/images/16c4bb63e210c61579427c8f381b5ede.jpg\\" group-title=\\"⏩ ESTRENOS 2023 ⏪\\",Santa, mi amor (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458717.mp4" },
  { name: "The Sacrifice Game 2023 con anuncios", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458716.mp4" },
  { name: "Your Lucky Day (2022)", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458715.mp4" },
  { name: "Conexiones perdidas (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458714.mp4" },
  { name: "Sonido de Libertad (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458713.mp4" },
  { name: "Culpa mía (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458712.mp4" },
  { name: "Apocalipsis: El despertar del anticristo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458711.mkv" },
  { name: "¡Shazam! La furia de los dioses (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458710.mkv" },
  { name: "Completement crame 2023 con anuncios", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458709.mp4" },
  { name: "Maravilloso desastre (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458708.mp4" },
  { name: "Hitmen (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458707.mp4" },
  { name: "A Quien Solia Conocer Somebody I Used to Know 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/evRsqa6KPoCHwrzq6IVQwAv3svu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458706.mp4" },
  { name: "Historia de un Crimen: Mauricio Leal (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458705.mp4" },
  { name: "Snow Falls (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458704.mp4" },
  { name: "The Bell Keeper (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458703.mp4" },
  { name: "Amor en Taipei 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458702.mp4" },
  { name: "Lobo adolescente - La pelicula 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/pPyTcJSlDZAAyxfEqEMVpLBJW7g.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458701.mp4" },
  { name: "Casi muerta (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458700.mp4" },
  { name: "Reptiles (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458699.mp4" },
  { name: "SEASON (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458698.mp4" },
  { name: "Dance for Me (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458697.mp4" },
  { name: "Enterrando una ambición (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458696.mp4" },
  { name: "Elia y el elfo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458695.mp4" },
  { name: "Retribution (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458694.mkv" },
  { name: "Elena sabe (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458693.mp4" },
  { name: "Una Navidad escandalosa (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458692.mp4" },
  { name: "La calle de la Navidad (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458691.mp4" },
  { name: "Cuando ellas quieren más (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458690.mp4" },
  { name: "Irati (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458689.mp4" },
  { name: "Divina Señal (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458688.mp4" },
  { name: "Condors Nest 2023 HD-CAM CON PUBLICIDAD", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458687.mp4" },
  { name: "A través del mar (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458686.mp4" },
  { name: "Cassandro (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458685.mp4" },
  { name: "El libro de los deseos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458684.mp4" },
  { name: "Esta noche duermes conmigo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458683.mp4" },
  { name: "Breaking Girl Code (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458682.mp4" },
  { name: "Con la soga al cuello (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458681.mp4" },
  { name: "Identidad Desbloqueada (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458680.mp4" },
  { name: "Día de la Madre (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458679.mp4" },
  { name: "Enfrentando la navidad (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458678.mp4" },
  { name: "El capitán Volkonogov Ha Huido (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458677.mp4" },
  { name: "Cuco (2023)", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458676.mp4" },
  { name: "Asteroid City (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458675.mp4" },
  { name: "Renfield: Asistente de vampiro (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458674.mp4" },
  { name: "Angela (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458673.mp4" },
  { name: "PAW Patrol: La súper película (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458672.mkv" },
  { name: "Encierro (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458671.mp4" },
  { name: "Juntos Pero No Revueltos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458670.mp4" },
  { name: "Rey de asesinos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458669.mp4" },
  { name: "La Puerta Secreta (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458668.mp4" },
  { name: "Medusas Venom 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/cn4zW417eFR2tG7He0ICRl6apTA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458667.mp4" },
  { name: "Legiones (2022)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458666.mp4" },
  { name: "Hambre (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458665.mp4" },
  { name: "Cazadora (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458664.mp4" },
  { name: "Coast Guard Malaysia: Ops Helang (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458663.mp4" },
  { name: "Hermana Muerte (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458662.mp4" },
  { name: "General Hadik (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458661.mp4" },
  { name: "Full River Red (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458660.mp4" },
  { name: "Bendita Suegra (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458659.mp4" },
  { name: "Flash FHD 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458658.mp4" },
  { name: "Un Sueno FHD 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458657.mp4" },
  { name: "Darker Shades of Summer (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458656.mp4" },
  { name: "Agente Stone (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458654.mp4" },
  { name: "Me vuelves loca (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458653.mp4" },
  { name: "Que Viva Mexico 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/ieyUpr5ES9QEz1cn4clCnBf9XJl.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458652.mp4" },
  { name: "Project Legion 2022", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/zFzwJ2OJ7XU0oAlSjyeyv8zKD2O.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458651.mp4" },
  { name: "Batman The Doom That Came to Gotham 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/y4hM4lsBqBYh0ZkzyNeEqu9RUlP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458650.mp4" },
  { name: "Un año inolvidable: Primavera (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458649.mp4" },
  { name: "Night Train (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458648.mp4" },
  { name: "Nada que ver (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458647.mp4" },
  { name: "Los reyes de Queenstown (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458646.mp4" },
  { name: "Hart: Duro de entrenar (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458644.mp4" },
  { name: "Saw X: El juego del miedo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458643.mp4" },
  { name: "South Park (No Apto Para Menores) (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458642.mp4" },
  { name: "Hazme el favor (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458641.mp4" },
  { name: "Jaane jaan 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/7XKdjkvq9Z2arK0DXxoEZKXRV4K.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458640.mp4" },
  { name: "Los Caballeros del Zodiaco: Saint Seiya - El inicio (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458639.mp4" },
  { name: "Escape bajo fuego (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458638.mp4" },
  { name: "y algunas mentiras 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/o9S6GW9MGyQZpRpPj65k0RIqYNL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458637.mp4" },
  { name: "¿Asesinato? ¿Qué Asesinato? (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458636.mp4" },
  { name: "Praise This (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458635.mp4" },
  { name: "Genie (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458634.mp4" },
  { name: "Dime Lo Que Quieres De Verdad FHD 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458633.mp4" },
  { name: "Inside Man 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/1ihXzqt84MH1d3lp1iIkp37je0b.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458632.mp4" },
  { name: "El hombre del saco (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458631.mp4" },
  { name: "Finestkind (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458630.mkv" },
  { name: "Todo sobre mi padre 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/jFkGF6Nl46GkASRgdgFsvTn6ZfR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458629.mp4" },
  { name: "Un dia y medio 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/vdQWE5gjut4Omw9NTIDfZYqP0k5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458628.mp4" },
  { name: "Mafia Mamma 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/2za7Cbo2DuZfW8RuXSZNYMtdUJN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458627.mp4" },
  { name: "Bird Box Barcelona (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458626.mp4" },
  { name: "Malibu Horror Story (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458625.mp4" },
  { name: "Apaches 2023 HD-CAM-CON PUBLICIDAD", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458624.mp4" },
  { name: "Oliva (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458623.mp4" },
  { name: "Las chicas están bien (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458622.mp4" },
  { name: "Un año inolvidable; Invierno (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458621.mp4" },
  { name: "Entre el Amor y la Amistad (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458620.mp4" },
  { name: "El club de las peleadoras (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458619.mp4" },
  { name: "Había una vez un estudio (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458618.mp4" },
  { name: "Intoxicación: La cruda verdad sobre nuestra comida (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458617.mp4" },
  { name: "The Girl Who Escaped: The Kara Robinson Story (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458616.mp4" },
  { name: "Transformers El Despertar De Las Bestias FHD 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/peIB7KBBrqW0JsCLQBt9ChEtZ7m.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458615.mp4" },
  { name: "La Ultima Yarda 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/4E10HQ6Od3fO8yRiWZPjgwYs9k5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458614.mp4" },
  { name: "Un fin de semana estupendo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458613.mp4" },
  { name: "Amigos de las vacaciones 2 (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458612.mp4" },
  { name: "Toc toc toc: El Sonido del Mal (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458611.mp4" },
  { name: "Un lugar por el que pelear (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458610.mp4" },
  { name: "Please Dont Destroy The Treasure of Foggy Mountain 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/cDaaQHyXXY0M1BryWiL64gkVlxc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458609.mp4" },
  { name: "El frío en los huesos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458608.mp4" },
  { name: "Krakens y sirenas: Conoce a los Gillman (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458607.mp4" },
  { name: "Lapsmasin (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458606.mp4" },
  { name: "David Holmes: El niño que vivió (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458605.mp4" },
  { name: "Héroe de sangre (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458603.mp4" },
  { name: "Los reyes de la calle Mulberry: ¡Que reine el amor! (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458602.mp4" },
  { name: "Foe 2023 con anuncios", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458601.mp4" },
  { name: "Capitán Carver (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458600.mp4" },
  { name: "Boksoon debe morir (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458599.mp4" },
  { name: "Oracle (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458598.mp4" },
  { name: "covenant", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458597.mp4" },
  { name: "Meu cunhado e um vampiro 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/tDKSXWeoAs9FhIW0KDDBvdEo1rR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458596.mp4" },
  { name: "Un año inolvidable: Verano (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458595.mp4" },
  { name: "Nimona (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458594.mp4" },
  { name: "Little Dixie 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/cmWTZj9zzT9KFt3XyL0gssL7Ig8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458593.mp4" },
  { name: "Taylor Swift: The Eras Tour (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458592.mp4" },
  { name: "Talk to Me (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458591.mp4" },
  { name: "Disco Inferno (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458590.mp4" },
  { name: "Alerta extrema (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458589.mp4" },
  { name: "Plan familiar (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458588.mp4" },
  { name: "Amén: Francisco responde (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458587.mp4" },
  { name: "La informante (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458586.mp4" },
  { name: "Misterio a la vista (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458585.mp4" },
  { name: "The Fire", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458584.mp4" },
  { name: "Super Mario Bros. La película (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458583.mkv" },
  { name: "JUNG_E (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458582.mp4" },
  { name: "The Squad 2023 con anuncios", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458581.mp4" },
  { name: "Mighty Morphin Power Rangers Once Always 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/qj1NrdMSm2xinqchBDD23U83vj8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458580.mkv" },
  { name: "Lo desconocido: La pirámide perdida (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458579.mp4" },
  { name: "Scary girl (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458578.mp4" },
  { name: "Blackberry: El Inicio De La Historia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458577.mkv" },
  { name: "Head Count (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458576.mp4" },
  { name: "Siete reyes deben morir (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458575.mp4" },
  { name: "Fables for the Witching Hour (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458574.mp4" },
  { name: "Dejar el mundo atrás (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458573.mp4" },
  { name: "Strawberry Shortcake and the Beast of Berry Bog 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/4zsrLV8H1fvZIai7KIA4MzI0hBB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458572.mp4" },
  { name: "Leo 2023 FHD", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458571.mkv" },
  { name: "Los iniciados (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458570.mp4" },
  { name: "Detective Knight: Independencia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458569.mp4" },
  { name: "Tenemos un fantasma (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458568.mp4" },
  { name: "Mickey y sus Amigos: Dulce o Truco (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458567.mp4" },
  { name: "Maquíllame otra vez (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458566.mp4" },
  { name: "Sé tu misma (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458565.mp4" },
  { name: "Mi Maestra se comió a mi amigo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458564.mp4" },
  { name: "me engana 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/fCcc6pc7PLSoIVdKkU6QzkEIIki.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458563.mp4" },
  { name: "Los diamantes de la discordia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458562.mp4" },
  { name: "La pecera (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458561.mp4" },
  { name: "Quiz Lady (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458560.mp4" },
  { name: "Frente a frente (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458559.mp4" },
  { name: "Rally Road Racers (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458558.mp4" },
  { name: "Bailarina (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458557.mp4" },
  { name: "King of Clones (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458556.mp4" },
  { name: "La Tierra errante II (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458555.mp4" },
  { name: "Bisbal - El Documental (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458554.mp4" },
  { name: "El asesino (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458553.mp4" },
  { name: "Amor Inesperado (2024)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458552.mp4" },
  { name: "La gran seducción (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458551.mp4" },
  { name: "El Club de los Asesinos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458550.mp4" },
  { name: "Aventuras en el desierto 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/vGgjg6J7jbrwzlNcrb0cvCo9l02.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458549.mkv" },
  { name: "Érase una vez un asesinato (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458548.mp4" },
  { name: "Mari(dos) (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458547.mp4" },
  { name: "Los Tres Mosqueteros: D'Artagnan (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458546.mp4" },
  { name: "Juicio al diablo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458544.mkv" },
  { name: "Un dia como leon 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/jPAnZoVLRgYzIdCFbaa8LEBGLEz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458543.mp4" },
  { name: "Mi soledad tiene alas (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458541.mp4" },
  { name: "Wintertide (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458540.mp4" },
  { name: "the Cello 2023 con anuncios", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458539.mp4" },
  { name: "Nightmare Radio El Acosador Nocturno FHD 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458538.mp4" },
  { name: "Luther: Cae la noche (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458537.mp4" },
  { name: "La clave del corazón (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458536.mp4" },
  { name: "Falling for a Killer (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458535.mp4" },
  { name: "65: Al borde de la extinción (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458534.mkv" },
  { name: "The Tank 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/2VxEtwgzOUukatl2IKGn4borpgE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458533.mp4" },
  { name: "Muerte Infinita FHD 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458532.mp4" },
  { name: "La Resurrección de la Momia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458531.mp4" },
  { name: "Los Archies 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/hmhWb4NTj02FyDxwBm4x9x2JxwJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458530.mp4" },
  { name: "La Conferencia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458529.mp4" },
  { name: "Desperation Road 2023 con anuncios", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458528.mp4" },
  { name: "10 días de un buen hombre (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458527.mp4" },
  { name: "Chef Jack: El cocinero aventurero (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458526.mp4" },
  { name: "Johnny Z (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458525.mp4" },
  { name: "Cementerio de Mascotas: El Origen (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458524.mp4" },
  { name: "La hija de la novia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458523.mp4" },
  { name: "Miraculous Las Aventuras De Ladybug - La Pelicula FHD 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/u0OMTZrva4WKZ2SmoNYI8eVDTkd.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458522.mp4" },
  { name: "VHS85 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/aM3wnZTKEuPLDwxuMWcHDibOkiw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458521.mp4" },
  { name: "El sabor de la Navidad (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458520.mp4" },
  { name: "Battlebox (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458519.mp4" },
  { name: "Unica (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458518.mp4" },
  { name: "Meet Me In Paris 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/zu0aQV4A9auBWwFEpgiYeAIqv2c.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458517.mp4" },
  { name: "Transfusion (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458516.mp4" },
  { name: "3 Days in Malay (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458515.mp4" },
  { name: "Sisu (2022)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458514.mkv" },
  { name: "Todos Morimos En La Oscuridad FHD 2023", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458513.mp4" },
  { name: "Outrage (2024)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458512.mp4" },
  { name: "Blood Harvest (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458511.mp4" },
  { name: "No molestar (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458510.mp4" },
  { name: "Tack och forlat 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/l9YZGPZIGlKEz376Kl9th6XDMii.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458509.mp4" },
  { name: "Desconexión: El organizador de bodas (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458508.mp4" },
  { name: "Corazón de Campeón (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458506.mp4" },
  { name: "The Unlikely Pilgrimage of Harold Fry (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458505.mp4" },
  { name: "Sayen (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458504.mp4" },
  { name: "Familia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458503.mp4" },
  { name: "iNumber Number: El oro de Johannesburgo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458502.mp4" },
  { name: "Bezos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458501.mp4" },
  { name: "Ant-Man and the Wasp: Quantumania (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458500.mp4" },
  { name: "Shift (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458499.mp4" },
  { name: "Rápidos y furiosos X (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458498.mp4" },
  { name: "Juegos entre Amigos: Despertar de Primavera (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458497.mp4" },
  { name: "Mega Lightning 2 (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458496.mp4" },
  { name: "El mejor del mundo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458495.mp4" },
  { name: "Blue Beetle (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458494.mp4" },
  { name: "Papás a la antigua (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458493.mp4" },
  { name: "Mientras Haya Esperanza 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/m5nXOX4GmuCNzv29qswOZrMWU5P.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458492.mkv" },
  { name: "Veneno (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458491.mp4" },
  { name: "Digimon Adventure 02: El Comienzo (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458490.mp4" },
  { name: "Mansión embrujada (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458489.mkv" },
  { name: "The Blackening (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458488.mp4" },
  { name: "Rabia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458487.mp4" },
  { name: "Érase una vez una estrella (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458486.mp4" },
  { name: "Fatal Night 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/kHDbVQrQNTEFoajtmg1dk8LaarF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458485.mp4" },
  { name: "El Tutor 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/8qpcD9vIB7MWkLeA4UKkYkEHAB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458484.mp4" },
  { name: "Ruido mental (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458483.mp4" },
  { name: "Bunker (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458482.mp4" },
  { name: "Pacto de graduación (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458481.mp4" },
  { name: "Oso intoxicado (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458480.mp4" },
  { name: "El rapto 2023", group: "Películas 2023", logo: "https://image.tmdb.org/t/p/w400/7ayaN1HSWcBO8ODQmONQKzleZep.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458479.mp4" },
  { name: "Resistencia (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458478.mkv" },
  { name: "La lista de los besos (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458477.mp4" },
  { name: "Reality (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458476.mp4" },
  { name: "Royalteen: La Princesa Margrethe (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458475.mp4" },
  { name: "Malcriados (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458474.mp4" },
  { name: "Welcome al Norte (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458473.mp4" },
  { name: "Sobreviviendo mis XV (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458472.mp4" },
  { name: "Estrellas Fugaces (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458471.mp4" },
  { name: "Agente Fortune: El gran engaño (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458470.mp4" },
  { name: "Ricos de Amor 2 (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458469.mp4" },
  { name: "Juego Limpio (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458468.mp4" },
  { name: "Noche de Horror (2023)", group: "Películas 2023", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/458467.mp4" },
  { name: "Coyote Ugly: El Bar Coyote (2000)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465448.mp4" },
  { name: "Junto a los Dioses 2: Los Últimos 49 Días (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465447.mp4" },
  { name: "Alma Salvaje (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465446.mp4" },
  { name: "Angry Birds Space 2012", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465445.mp4" },
  { name: "Delgo (2008)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465444.mp4" },
  { name: "Der rote Baron (2008)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465442.mp4" },
  { name: "Asterix Obelix Mission Cleopatre 2002", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/3I6ocizuNTB2DmNTffLxnCe4bnc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465441.mp4" },
  { name: "Colossal: Ella es un monstruo (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465440.mp4" },
  { name: "Off the Rails (2021)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465439.mp4" },
  { name: "Amores Caníbales (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465438.mkv" },
  { name: "Godzilla: Planeta de monstruos (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465437.mp4" },
  { name: "El castillo en el cielo (1986)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465436.mp4" },
  { name: "Encuentros Cercanos del Tercer Tipo (1977)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465435.mp4" },
  { name: "Durante la tormenta (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465434.mp4" },
  { name: "Batman inicia (2005)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465433.mp4" },
  { name: "Los chicos cool no lloran (2012)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465432.mp4" },
  { name: "Kung Fu Panda 2 (2011)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465431.mp4" },
  { name: "Coup de foudre sur un air de Noël (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465430.mkv" },
  { name: "000 leguas de viaje submarino (1954)\\" tvg-logo=\\"http://mundo2.pro:80/images/693f77bcdfd11f7be662f2135ff73f2d.jpg\\" group-title=\\"⏩ VOD LATINO ⏪\\",20,000 leguas de viaje submarino (1954)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465429.mp4" },
  { name: "Cuando los Hermanos se Encuentran (1988)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465428.mp4" },
  { name: "Milagros Inesperados (1999)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465427.mp4" },
  { name: "El pequeño vampiro (2000)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465426.mp4" },
  { name: "Amor de Medianoche (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465425.avi" },
  { name: "El buen vecino (2022)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465424.mp4" },
  { name: "De Caza con Papá (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465423.mp4" },
  { name: "El inventor de juegos (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465422.mp4" },
  { name: "A.I. - Inteligencia Artificial (2001)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465421.mp4" },
  { name: "Entre las Sombras (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465420.mp4" },
  { name: "En Primera Plana (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465419.mp4" },
  { name: "Gonzalez - Falsos Profetas (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465418.mp4" },
  { name: "Amor A Segunda Vista (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465417.mkv" },
  { name: "Bandidas (2006)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465416.mp4" },
  { name: "Calabozos y dragones (2000)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465415.mp4" },
  { name: "Fuga", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465413.mp4" },
  { name: "Premonición: El diario del terror (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465411.mp4" },
  { name: "G.I. Joe: El origen de Cobra (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465410.mp4" },
  { name: "El ascensor (2021)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465409.mp4" },
  { name: "300 (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465408.mp4" },
  { name: "Corazón loco (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465407.mp4" },
  { name: "Cumbia Callera (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465406.mp4" },
  { name: "Harry Potter y el prisionero de Azkaban (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465405.mp4" },
  { name: "¿Bailamos? (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465404.mp4" },
  { name: "El bosque siniestro (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465403.mp4" },
  { name: "Armageddon (1998)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465402.mp4" },
  { name: "Austin Powers 2: El Espía Seductor (1999)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465400.mp4" },
  { name: "Aqui y ahora (2021)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465399.mkv" },
  { name: "La esfera (1984)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465398.mp4" },
  { name: "El Hobbit 3: La Batalla de Los Cinco Ejércitos (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465397.mp4" },
  { name: "Cristiada (2012)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465396.mp4" },
  { name: "El pico de Dante (1997)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465395.mp4" },
  { name: "Gnomos al Ataque (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465394.mp4" },
  { name: "Hacker (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465393.mp4" },
  { name: "Un alma en silencio (2005)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465392.mp4" },
  { name: "Antes del atardecer (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465391.mp4" },
  { name: "Un cuento americano 2 : Fievel va al Oeste (1991)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465390.mp4" },
  { name: "Fuera De La Ley (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465388.mp4" },
  { name: "Holmes & Watson (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465387.mp4" },
  { name: "Night School (1981)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465386.mp4" },
  { name: "Freaks: eres de los nuestros (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465385.mp4" },
  { name: "August Rush: Escucha tu destino (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465384.mp4" },
  { name: "Dragones: destino de fuego (2006)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465383.mp4" },
  { name: "Madre (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465382.mkv" },
  { name: "Bajo La Misma Estrella (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465381.mp4" },
  { name: "El gigante de hierro (1999)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465380.mp4" },
  { name: "Los Cazafantasmas (1984)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465379.mp4" },
  { name: "Criaturas nocturnas (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465378.mp4" },
  { name: "Alejandro Magno (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465377.mp4" },
  { name: "Avengers: Los Vengadores (2012)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465376.mp4" },
  { name: "Dunkerque (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465375.mp4" },
  { name: "Coffee y Kareem (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465374.mp4" },
  { name: "El Cristal Encantado (1982)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465373.mp4" },
  { name: "Apocalypto (2006)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465372.mp4" },
  { name: "A todos los chicos de los que me enamoré (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465371.avi" },
  { name: "El arte de defenderse (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465370.mp4" },
  { name: "Escuadrón de la muerte (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465369.mp4" },
  { name: "Contrabando (2012)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465368.mp4" },
  { name: "Mafalda La película (1982)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465367.mp4" },
  { name: "Revenant: El renacido (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465366.mp4" },
  { name: "Cessez-le-feu (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465365.avi" },
  { name: "Chances Are 1989", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/ppXvoLSLsjXAsTH0SFsQy7Eow9B.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465363.mp4" },
  { name: "Bernardo y Bianca (1977)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465361.mp4" },
  { name: "A Golpe de Monedas (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465358.mkv" },
  { name: "Beetlejuice El Super Fantasma 1988", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465357.mp4" },
  { name: "Conan: El Destructor (1984)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465356.mp4" },
  { name: "Cámbio de Hábito 2: Más Locura en el Convento (1993)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465355.mp4" },
  { name: "Tigre y dragón 2: La espada del destino (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465354.mp4" },
  { name: "El traficante (1983)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465353.mp4" },
  { name: "Historias de fantasmas (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465352.mp4" },
  { name: "Anna: El peligro tiene nombre (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465350.mp4" },
  { name: "A la deriva (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465349.mp4" },
  { name: "Harry Potter y la cámara secreta (2002)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465347.mp4" },
  { name: "Mi nombre es Doris (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465346.mp4" },
  { name: "Astérix aux Jeux olympiques (2008)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465344.mp4" },
  { name: "Cuando los Hijos Regresan (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465343.mp4" },
  { name: "Fat Ass Zombies (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465342.mp4" },
  { name: "Love Thy Neighbor (2006)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465341.avi" },
  { name: "Ascensión de las maquinas (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465340.mp4" },
  { name: "Animales corporativos (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465339.mp4" },
  { name: "Colmillo blanco (1991)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465337.mp4" },
  { name: "Brigada 49 (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465335.mp4" },
  { name: "Fahrenheit 451 (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465334.mp4" },
  { name: "El Informe Pelícano (1993)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465333.mp4" },
  { name: "Gángster Americano (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465332.mp4" },
  { name: "The Dark Mirror (1946)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465331.mkv" },
  { name: "Chicos Buenos (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465330.mp4" },
  { name: "Gravedad (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465329.mp4" },
  { name: "Zwillinge (2010)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465328.mp4" },
  { name: "Hannibal: El origen del mal (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465327.mp4" },
  { name: "Animales Fantásticos 2: Los Crímenes de Grindelwald (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465326.mp4" },
  { name: "¡A Ganar! (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465325.mp4" },
  { name: "El Golpe Maestro (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465324.mp4" },
  { name: "El Hobbit 2: La Desolación de Smaug (2013)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465323.mp4" },
  { name: "Congo (1995)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465322.mp4" },
  { name: "A pesar de todo (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465321.mkv" },
  { name: "Equilibrium (2002)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465319.mp4" },
  { name: "Armed (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465318.mkv" },
  { name: "Ad Astra: Hacia las estrellas (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465317.mp4" },
  { name: "Spectral (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465316.mp4" },
  { name: "Doom: Aniquilación (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465315.mp4" },
  { name: "Esa mujer 2018", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/9Nw5mY5ZZQTpx2oFrhmCI7txVgA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465314.mp4" },
  { name: "365 días (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465313.mp4" },
  { name: "El especialista (2011)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465312.mp4" },
  { name: "El señor de la guerra (2005)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465310.mp4" },
  { name: "colorado 1976", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/mnUkvBpRytxnG3LDayaciKyOpxc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465309.mp4" },
  { name: "El espanta tiburones (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465308.mp4" },
  { name: "El Último Cazador De Brujas (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465307.mp4" },
  { name: "El Príncipe Olvidado (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465306.mp4" },
  { name: "Ágora: La caída del imperio romano (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465305.mp4" },
  { name: "El reinado del fuego (2002)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465304.mp4" },
  { name: "Drone (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465303.mp4" },
  { name: "El tigre y el dragón (2000)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465301.mp4" },
  { name: "Constantine (2005)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465300.mp4" },
  { name: "Dia De Perros (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465299.mp4" },
  { name: "El Día de la Independencia 2: Contraataque (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465298.mp4" },
  { name: "La demolicion 2006", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/kxqpWeeiusHYGQiCAjbtYySpEnA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465296.mp4" },
  { name: "El Cielo Rojo 2 (2015)", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465295.mp4" },
  { name: "Godzilla (1998)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465294.mp4" },
  { name: "Doblemente Embarazada (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465293.mp4" },
  { name: "Asesino de modelos (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465292.mkv" },
  { name: "El Hubiera Sí Existe (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465291.mp4" },
  { name: "Darc (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465289.mp4" },
  { name: "Riesgo en el aire (1997)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465288.mp4" },
  { name: "Elektra (2005)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465287.mp4" },
  { name: "Gato con botas (2011)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465286.mkv" },
  { name: "Guardianes Del Día (2006)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465285.mp4" },
  { name: "Conquistando a mi Suegro (2005)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465284.mp4" },
  { name: "Hasta los huesos (2002)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465283.mp4" },
  { name: "Godzilla: El devorador de planetas (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465280.mp4" },
  { name: "El demoledor (1993)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465279.mp4" },
  { name: "13 Horas: Los soldados secretos de Bengasi (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465278.mp4" },
  { name: "Venganza Despiadada 2011", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/zCA0ufLA1ELOONJTEfBFOYJBTvf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465277.mp4" },
  { name: "Perdido en la fama (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465276.mp4" },
  { name: "Escolta (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465275.mp4" },
  { name: "Estación Zombie 2: Península (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465274.mp4" },
  { name: "Caballo de Guerra (2011)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465273.mp4" },
  { name: "Un cuento americano 3: El tesoro de la isla de Manhattan (1998)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465271.mp4" },
  { name: "Gretel & Hansel: Un siniestro cuento de hadas (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465270.mp4" },
  { name: "Después de la Tierra (2013)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465269.mp4" },
  { name: "El llamado salvaje (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465268.mp4" },
  { name: "El Dia Final 1999", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/tEhKjNdD7fgc6zkVx8mwTEH1eeN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465267.mp4" },
  { name: "A Traición (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465266.mp4" },
  { name: "Fenómeno en la oscuridad (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465265.mp4" },
  { name: "Billy Elliot (2000)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465264.mp4" },
  { name: "Aladdín: El regreso de Jafar (1994)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465263.mp4" },
  { name: "En la mente del asesino (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465262.mp4" },
  { name: "Corazones De Hierro (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465261.mp4" },
  { name: "El Submarino (1981)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465259.mp4" },
  { name: "4 latas (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465258.mp4" },
  { name: "Batman & Robin (1997)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465257.mp4" },
  { name: "Ayla (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465255.mkv" },
  { name: "El viaje de Chihiro (2001)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465254.mp4" },
  { name: "Cloud Atlas: La Red Invisible (2012)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465253.mp4" },
  { name: "Chicas con pelotas (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465252.mp4" },
  { name: "Ciudades de papel (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465251.mp4" },
  { name: "La vigilante del futuro: Ghost in the Shell (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465250.mp4" },
  { name: "El Asesino Americano (2021)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465249.mp4" },
  { name: "2012 2009", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465248.mp4" },
  { name: "El cielo sí existe (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465247.mp4" },
  { name: "El hombre con los puños de hierro 2 (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465246.mp4" },
  { name: "Entrenada para Asesinar (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465245.mp4" },
  { name: "Blame (2021)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465244.mp4" },
  { name: "Espía por error (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465243.mp4" },
  { name: "Crypto (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465242.mp4" },
  { name: "Crepúsculo:  Amanecer - Parte 1 (2011)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465241.mp4" },
  { name: "The Other Sister (1999)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465240.mkv" },
  { name: "Érase una vez... (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465239.mp4" },
  { name: "Hogar dulce infierno (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465238.mp4" },
  { name: "Greyhound en la mira del enemigo (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465237.mp4" },
  { name: "Dolores (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465236.mp4" },
  { name: "Gone (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465235.mkv" },
  { name: "Horas Contadas (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465234.mp4" },
  { name: "15:17 Tren a París (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465233.mp4" },
  { name: "Amigos inseparables (1991)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465232.mp4" },
  { name: "The Assignment (1997)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465231.mp4" },
  { name: "El señor de los anillos: Las dos torres (2002)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465230.mp4" },
  { name: "Hansel and Gretel (1988)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465229.mp4" },
  { name: "Harry Potter y la orden del Fénix (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465228.mp4" },
  { name: "El Regreso de los Muertos Vivientes (1985)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465227.mp4" },
  { name: "Cenicienta y el príncipe oculto (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465226.mp4" },
  { name: "Crímenes Imperdonables (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465225.mp4" },
  { name: "Campo De Sueños (1989)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465224.mp4" },
  { name: "Gatúbela (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465223.mp4" },
  { name: "Autómata (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465222.mp4" },
  { name: "Camino a Marte (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465221.mp4" },
  { name: "Murdered at 17 (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465220.mkv" },
  { name: "Atrapados: Una historia verdadera (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465218.mp4" },
  { name: "Invasion (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465217.mp4" },
  { name: "Animal (2001)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465216.mp4" },
  { name: "Asesinatos Accidentales (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465214.avi" },
  { name: "Las Aventuras del Doctor Dolittle (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465213.mp4" },
  { name: "El Efecto Mariposa (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465211.mp4" },
  { name: "Forrest Gump (1994)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465210.mp4" },
  { name: "La reina de espadas (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465209.mp4" },
  { name: "Vengar a los cuervos: La leyenda de Loca (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465208.avi" },
  { name: "El pianista (1998)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465207.mp4" },
  { name: "Sweet November (1968)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465206.mp4" },
  { name: "El descubrimiento (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465204.mp4" },
  { name: "Alphaville (1965)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465203.mp4" },
  { name: "2010 El ano que hicimos contacto 1984", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465202.mp4" },
  { name: "El abogado del crimen (2013)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465201.mp4" },
  { name: "Anaconda (1997)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465200.mp4" },
  { name: "Una familia con Madre (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465198.avi" },
  { name: "Silencio (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465197.mp4" },
  { name: "Animal de compañia (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465196.avi" },
  { name: "El imaginario mundo del Doctor Parnassus (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465195.mp4" },
  { name: "Infierno en la tormenta (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465194.mp4" },
  { name: "Atame 1990", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/2xCjXPl90IRx0emvBAoj3ikfB6q.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465193.mp4" },
  { name: "El Libro de Henry (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465192.mp4" },
  { name: "Estación Zombie: tren a Busan (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465189.mp4" },
  { name: "Aquaman (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465188.mp4" },
  { name: "A-X-L 2018", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/9kB56ZdMB6RgY5QtX9Bar45jCeI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465187.mp4" },
  { name: "Alex y yo (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465186.mp4" },
  { name: "Háblame de ti (2022)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465185.mp4" },
  { name: "Agente Asher (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465184.mkv" },
  { name: "Harry Potter y el misterio del príncipe (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465183.mp4" },
  { name: "Celda (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465182.mp4" },
  { name: "Duro de matar (1988)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465180.mp4" },
  { name: "El Hombre Invisible (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465179.mp4" },
  { name: "Alma pura (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465177.mp4" },
  { name: "Kung Fu Panda (2008)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465176.mkv" },
  { name: "En casa todo está bien (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465174.mkv" },
  { name: "Belleza inesperada (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465173.mp4" },
  { name: "Tudo Que Aprendemos Juntos (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465172.mp4" },
  { name: "Casanova 2005", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/pp237jqOnlLojQfvCgJHv5yZofL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465171.mp4" },
  { name: "13 fantasmas (2001)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465170.mp4" },
  { name: "Ciudad de Dios (2002)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465169.mp4" },
  { name: "En el bosque sobrevive 2015", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/lMHOTyXjgg3AiINh5JvW0pFCM1C.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465168.mp4" },
  { name: "Black Widower (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465167.mp4" },
  { name: "Amor eterno (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465166.mp4" },
  { name: "Buscando justicia (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465164.mp4" },
  { name: "Algo muy gordo (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465163.avi" },
  { name: "London Fields (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465162.mp4" },
  { name: "el pulpo 2017", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465161.mp4" },
  { name: "10 cosas que odio de ti (1999)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465160.mp4" },
  { name: "Il matrimonio 1954", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/8MIuP6cY0yqaLpPWMW7q90fA7Gk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465159.mp4" },
  { name: "La Amante de mi Padre (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465158.mp4" },
  { name: "Above Majestic (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465157.mkv" },
  { name: "Grandes Héroes (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465156.mp4" },
  { name: "El Niño con el Pijama de Rayas (2008)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465155.mp4" },
  { name: "El precio de la verdad (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465154.mp4" },
  { name: "Boa vs. Python (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465153.mp4" },
  { name: "El Príncipe de Persia: Las Arenas del Tiempo (2010)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465152.mp4" },
  { name: "El rey escorpión (2002)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465151.mp4" },
  { name: "Conrad y Michelle: Si las palabras mataran (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465150.mp4" },
  { name: "En la mira del francotirador 2017", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/eI3bfoz41EtshiPzpuBqCdzh6QX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465149.mp4" },
  { name: "Pasante de Moda (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465148.mp4" },
  { name: "Belleza Americana (1999)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465147.mp4" },
  { name: "Code Name: The Cleaner (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465146.mp4" },
  { name: "Fuerza 10 de Navarone (1978)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465145.mp4" },
  { name: "El juego de la muerte II (1981)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465143.mp4" },
  { name: "Agente (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465142.mp4" },
  { name: "Ghost In the Shell 2: Inocencia (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465141.mp4" },
  { name: "Encuentro (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465139.mp4" },
  { name: "Armstrong (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465138.mp4" },
  { name: "El Origen Del Planeta De Los Simios 2011", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/6TqjIMQV11NkHMuriprN3xNoN6o.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465137.mp4" },
  { name: "El diablo viste a la moda (2006)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465136.mp4" },
  { name: "Animales sin collar (2018)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465135.mkv" },
  { name: "El especialista: Resurrección (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465134.mp4" },
  { name: "Guerra de Dragones (2007)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465133.mp4" },
  { name: "Como novio de pueblo (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465132.mp4" },
  { name: "Ella (2013)", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465131.mp4" },
  { name: "City of Night: The Making of 'Collateral' (2004)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465130.mp4" },
  { name: "Cuando te encuentre (2012)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465129.mp4" },
  { name: "GANTZ:O (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465128.mp4" },
  { name: "10.0 Earthquake (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465127.mp4" },
  { name: "Gladiador (2000)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465126.mp4" },
  { name: "Astérix y Obélix contra el César (1999)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465125.mp4" },
  { name: "Ramon 2013", group: "VOD Latino", logo: "https://image.tmdb.org/t/p/w400/7xaQAc01TZOHEku2uC520OIENWx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465124.mp4" },
  { name: "Bastardos sin gloria (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465123.mp4" },
  { name: "Dios los cría y ellos... (2017)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465122.mp4" },
  { name: "El Extranjero (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465121.mp4" },
  { name: "Hombres de coraje (2016)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465120.mp4" },
  { name: "Ghost in the Shell (1995)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465119.mp4" },
  { name: "El Código Da Vinci (2006)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465118.mp4" },
  { name: "El viaje más largo (2020)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465117.mp4" },
  { name: "Divergente (2014)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465116.mp4" },
  { name: "Atrevimiento (2019)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465115.mkv" },
  { name: "Vez", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465113.mp4" },
  { name: "Area 51 (2015)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465112.mp4" },
  { name: "Rescate del metro 123 (2009)", group: "VOD Latino", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/465111.avi" },
  { name: "Bad Boys: Hasta la muerte (2024) (VIK)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/5jI2vEHJReAx8iFDmhC2O3yW37w.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/566664.mp4" },
  { name: "Contacto Fatal (2006) | Subtitulada (D)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/qD5gxnDffbyn94KrSPrvS9F7li9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/562403.mp4" },
  { name: "Lluvia De Acero (2017) (D)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/keDM2BwLZnGsOTZP2LMBidSmiWD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/548725.mp4" },
  { name: "La caída de la Casa Blanca (2013) (D)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/AnrZVz7BM74YU4SDbenS6Nt5si6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/541618.mp4" },
  { name: "No te rindas (2015) (D)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/3ZjhQFNtodTTTFsibyBKGjMroA9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/540527.mp4" },
  { name: "Desaparecido (2017) (D)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1jcD7bGnoWTIaQTu6gQLNj4E7aF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539589.mp4" },
  { name: "Rascacielos: Rescate En Las Alturas (2018) (D)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/iZewx4w2Fh8lBuKoOlJqfPC5uWs.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539580.mp4" },
  { name: "Venganza Bajo Cero (2019) (D)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/5pPI0Isxhxqk0iKimi4VtJBcyXt.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/539577.mp4" },
  { name: "UB40 - The Collection (2002)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459932.mkv" },
  { name: "Heroe 2002", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/wsqkU03Ujr4L6f0KoW1c5YTcjQP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459930.mkv" },
  { name: "El traficante (2018)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459929.mkv" },
  { name: "Total Recall (1987)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459924.mkv" },
  { name: "Un carnaval sucio (2006)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459920.mkv" },
  { name: "A Bullet in the Head (1990)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459918.mkv" },
  { name: "El sexto dia 2000", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/iqQkG4TfxZs8SfUxErusTyZylKM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459917.mkv" },
  { name: "Altitud (2017)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459912.mkv" },
  { name: "La Isla Siniestra (2010)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459911.mkv" },
  { name: "Under Siege (1986)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459910.mkv" },
  { name: "Marauders (1986)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459909.mkv" },
  { name: "A View to a Kill 1985", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/ygkLLN9sNMkkwRY6rtpljNCKcDw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459905.mkv" },
  { name: "Jóvenes pistoleros II (1990)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459904.mkv" },
  { name: "The Myth of Garrincha (2014)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459903.mkv" },
  { name: "La vieja guardia (2020)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459902.mkv" },
  { name: "Shimmer Lake (2017)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459898.mkv" },
  { name: "La mensajera (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459897.mkv" },
  { name: "Best Friends (1982)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459895.mkv" },
  { name: "Return of the Dragon (1974)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459894.mkv" },
  { name: "Hot Rod 2007", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/vldA6LR3pOqSLaEL2w497N0EuY5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459892.mkv" },
  { name: "The J Team 2021", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/nRCYKdzUxEZVfAd97C1vDv4lBvR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459891.mkv" },
  { name: "Los Ángeles de Charlie 2: Al Límite (2003)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459890.mkv" },
  { name: "El Camino Largo (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459889.mkv" },
  { name: "El Rescate 2011", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/sQvpOFHz2f8E4ZJaIM5tuzP1rlW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459881.mkv" },
  { name: "Attrition (2018)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459880.mkv" },
  { name: "Samurái X: El origen (2021)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459878.mkv" },
  { name: "The Shadow Effect (2009)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459877.mkv" },
  { name: "El cártel de los sapos (2011)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459876.mkv" },
  { name: "Priest (1995)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459875.mkv" },
  { name: "El club secreto de los No Herederos al trono 2020", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/gKLvBS6eGIAzaFNjW9JRszwEs40.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459871.mkv" },
  { name: "Batman y las Tortugas Ninja (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459868.mkv" },
  { name: "The Gunman 2004", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/9Wi0xEjOBKvdmpSJElvciDRREHC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459867.mkv" },
  { name: "Lágrimas del Sol (2003)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459859.mkv" },
  { name: "Cartas desde Iwo Jima (2006)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459855.mkv" },
  { name: "wave (2019)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459853.mkv" },
  { name: "Francotirador (2014)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459851.mkv" },
  { name: "The Fantastic Four 1994", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/avJpIDOjyfdoOLINYficKvW9dEa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459845.mkv" },
  { name: "The Wall 1982", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/aqiDo8D4NHLrrUxckA7zWcrN6aY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459844.mkv" },
  { name: "El señor de los anillos: La comunidad del anillo (2001)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459840.mkv" },
  { name: "Blue Code of Silence (2020)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459836.mkv" },
  { name: "The Great Wall (2015)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459835.mkv" },
  { name: "12 Desafíos 2: Reloaded (2013)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459833.mkv" },
  { name: "Amnesia (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459832.mkv" },
  { name: "Left Behind (2021)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459829.mkv" },
  { name: "The Four Warriors (2015)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459824.mkv" },
  { name: "La Ultima Pelea 2011", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/4R8oxk5twJrZ5U5pYdT0oa0hnli.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459822.mkv" },
  { name: "Inframundo 3: La rebelión de los Lycans (2009)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459820.mkv" },
  { name: "Cacería (2002)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459819.mkv" },
  { name: "El Rey Escorpión 4: La Llave del poder (2015)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459816.mkv" },
  { name: "CHIKARA Tomorrow Never Dies (2014)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459815.mkv" },
  { name: "El Rey Escorpión 3: Batalla por la redención (2012)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459813.mkv" },
  { name: "Deal", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459812.mkv" },
  { name: "La delgada línea roja (1998)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459810.mkv" },
  { name: "Siege", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459809.mkv" },
  { name: "Licence to Kill (2013)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459808.mkv" },
  { name: "Escapada al limite 2019", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/xhdNBzIZjfHwoN91ADuUnTZnK9V.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459804.mkv" },
  { name: "1941 (1941)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459803.mkv" },
  { name: "La momia 2017", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/6JEbMNds0ZRBD5AYcIIhCqRVgQU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459802.mkv" },
  { name: "Blindado (2019)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459801.mkv" },
  { name: "La última fortaleza (The Last Castle) (2001)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459799.mkv" },
  { name: "The Finest Hours (1964)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459797.mkv" },
  { name: "Death Racers (2008)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459796.mkv" },
  { name: "Les Conquistadores (1976)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459794.mkv" },
  { name: "La última carta de Amor (2021)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459793.mkv" },
  { name: "Blanco o negro (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459792.mkv" },
  { name: "Un Monje a Prueba de Balas (2003)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459790.mkv" },
  { name: "El Sorprendente Hombre-Arana 2012", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/swjygVNvJ84ztpgfFX9gRr2MPBZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459786.mkv" },
  { name: "Caos (2005)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459785.mkv" },
  { name: "Día de entrenamiento (2001)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459782.mkv" },
  { name: "La noche más oscura (2012)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459781.mkv" },
  { name: "El quinto infierno 1999", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/jtJTwBMxMFnUDMMHqyt69Tx0aw6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459780.mkv" },
  { name: "At Close Range 1986", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/mis5r2maMped7HpudNlQIhvihJB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459777.mkv" },
  { name: "Misión babilonia (2008)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459775.mkv" },
  { name: "Asesino Kung Fu (2014)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459772.mkv" },
  { name: "Altered Carbon: Reenfundados (2020)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459769.mkv" },
  { name: "The Unforgiven 2017", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/iXvHtBQKdJI3PEIQq6Uuzd5Si59.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459768.mkv" },
  { name: "Vidas en pedazos (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459763.mkv" },
  { name: "One (2011)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459762.mkv" },
  { name: "Bourne: El ultimátum (2007)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459760.mkv" },
  { name: "The Fugitive Kind (1960)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459757.mkv" },
  { name: "3000 millas al infierno (2001)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459756.mkv" },
  { name: "Spectre (1977)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459753.mkv" },
  { name: "Escuadrón de lobos (2018)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459752.mkv" },
  { name: "El Cuervo (1994)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459751.mkv" },
  { name: "Medallion", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459749.mkv" },
  { name: "La Puerta Del Guerrero (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459747.mkv" },
  { name: "Peligro en Bushwick (2017)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459745.mkv" },
  { name: "Alien vs. Depredador 2 (2007)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459744.mkv" },
  { name: "Assassins Run (2013)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459743.mkv" },
  { name: "Gang Related 1997", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/osKEeAZz1AVXlshhjO8nSDLe7Gz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459738.mp4" },
  { name: "Armored 2025", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/mo4PUj0SWiX33uQMgxyzE2ZOPBK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459737.mkv" },
  { name: "Guardian Angel", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459733.mkv" },
  { name: "El reino prohibido (2008)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459730.mkv" },
  { name: "Most Wanted (1997)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459724.mkv" },
  { name: "La Guerra de los Mundos (2005)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459723.mkv" },
  { name: "Baby Driver 2", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459721.mkv" },
  { name: "La aventura del Poseidón (2005)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459720.mkv" },
  { name: "Taken (1999)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459719.mkv" },
  { name: "The World Is Enough (2013)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459713.mkv" },
  { name: "Beneath Loch Ness (2001)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459711.mp4" },
  { name: "Son of a Gun (2011)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459709.mkv" },
  { name: "007: Otro día para morir (2002)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459708.mkv" },
  { name: "Baires (2015)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459703.mkv" },
  { name: "Inside 'The Man with the Golden Gun' (2000)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459702.mkv" },
  { name: "Line Walker 2 Invisible Spy (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459700.mkv" },
  { name: "The Condemned (2013)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459695.mkv" },
  { name: "Bronx (2020)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459693.mkv" },
  { name: "Saint (1997)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459692.mkv" },
  { name: "Suicide Squad (1935)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459691.mkv" },
  { name: "Last Stand", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459690.mkv" },
  { name: "Che: El argentino (2008)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459689.mkv" },
  { name: "Campeones (1991)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459686.mkv" },
  { name: "4Got10 (2015)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459684.mkv" },
  { name: "The Net 1953", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/eHndBzRrLGqgjjWfd6kDczs25BF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459682.mkv" },
  { name: "universal source code", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459681.mkv" },
  { name: "Ciudad sin Ley (2017)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459680.mkv" },
  { name: "Fuímos heroes (2002)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459678.mkv" },
  { name: "La Suma de Todos los Miedos (2002)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459675.mkv" },
  { name: "Ataque fatal (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459674.mkv" },
  { name: "The Animal World (1956)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459673.mkv" },
  { name: "Corazón de León (2015)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459672.mkv" },
  { name: "Guardianes (2017)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459660.mkv" },
  { name: "Conversation", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459659.mkv" },
  { name: "Takers", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459658.mkv" },
  { name: "el Aceitoso 2009", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/rom0NoTExJcBWSf1TqzUV5sgYdb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459656.mkv" },
  { name: "Road House (1948)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459653.mkv" },
  { name: "Unstoppable (2004)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459652.mkv" },
  { name: "Batman regresa (1992)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459651.mkv" },
  { name: "The Bourne Identity 1988", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459650.mkv" },
  { name: "La Momia: La tumba del emperador dragón (2008)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459644.mkv" },
  { name: "Sangre de mi sangre (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459642.mkv" },
  { name: "Papillon: La gran fuga (2017)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459640.mkv" },
  { name: "Live or Let Die (2020)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459631.mkv" },
  { name: "Insurgente 2015", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/auUoVDnrPTtfn9zqQ5KKUvjwRZN.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459630.mkv" },
  { name: "En el Camino del Tráfico (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459629.mkv" },
  { name: "ICE (2018)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459628.mkv" },
  { name: "Horizonte profundo (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459624.mkv" },
  { name: "Rendirse Jamás 3 (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459623.mp4" },
  { name: "The Scorpion King (2009)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459618.mkv" },
  { name: "Inside 'For Your Eyes Only' (2000)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459617.mkv" },
  { name: "El sobreviviente (2013)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459615.mkv" },
  { name: "Chicas Armadas y Peligrosas (2013)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459613.mkv" },
  { name: "1974", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459611.mkv" },
  { name: "Los federales (1998)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459607.mkv" },
  { name: "Sonja (2018)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459605.mkv" },
  { name: "Anna 2 (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459603.mkv" },
  { name: "Cold Light Of Day", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459597.mkv" },
  { name: "On Fire (1987)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459595.mkv" },
  { name: "Antigang (2015)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459594.mkv" },
  { name: "El último hombre (2018)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459590.mkv" },
  { name: "Escuadrón Suicida (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459588.mkv" },
  { name: "Guns (1990)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459587.mkv" },
  { name: "Game", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459586.mkv" },
  { name: "The Warriors: The Way Home (2007)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459583.mkv" },
  { name: "Random Acts of Violence (1999)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459582.mkv" },
  { name: "La Corresponsal (2018)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459580.mkv" },
  { name: "Le convoi (1995)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459578.mkv" },
  { name: "El Arma Perfecta (2020)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459577.mkv" },
  { name: "Hot Pursuit 1987", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/tVjt1UhbpVvEOOCk0TZurfQmXFq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459576.mkv" },
  { name: "La Espada Del Inmortal (2017)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459575.mkv" },
  { name: "Beasts Of No Nation (2020)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459574.mkv" },
  { name: "La venganza de los vigilantes (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459571.mkv" },
  { name: "Asesinatos Accidentales: Unas Vacaciones Para Morir (2022)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459570.mkv" },
  { name: "Contacto Sangriento II (1996)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459569.mkv" },
  { name: "Comando Especial (2012)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459567.mkv" },
  { name: "Acción Jackson (1988)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459566.mkv" },
  { name: "The Real Hunt for Red October (2021)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459565.mkv" },
  { name: "Comando Especial 2 (2014)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459564.mkv" },
  { name: "8 (2016)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459562.mkv" },
  { name: "El quinto infierno II 2009", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/uVUUO2JSNukKX0Bj5BUwvcxnVWm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459561.mkv" },
  { name: "The Mummy's Curse Returns (2019)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459560.mkv" },
  { name: "La isla maldita (2004)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459558.mkv" },
  { name: "Stretch (2014)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459555.mkv" },
  { name: "The Negotiator (1994)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/7UwB3Zjnh3o6NDsEbdVctsKFNku.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459551.mkv" },
  { name: "21 Blackjack (2008)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/1c0sybcPnVF1fmVk9JKdG2fH1Au.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459550.mkv" },
  { name: "Triple amenaza (2019)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459549.mkv" },
  { name: "Leal (2018)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459547.mkv" },
  { name: "Inside 'You Only Live Twice' (2000)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459545.mkv" },
  { name: "El señor de los anillos: El retorno del rey (2003)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459543.mkv" },
  { name: "El Depredador (2018)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/r6jghOfUGi5TNl9EbdOk5NtfkzQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459542.mkv" },
  { name: "Beirut (2018)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/xOxkZGKeiasZtczCh4Yj1U7WZSh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459541.mkv" },
  { name: "Duro de matar: Un buen día para morir (2013)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/1WQ3EWu8P3mML3pV9D3PKbvfwxb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459540.mkv" },
  { name: "City (2020)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/15bnFY02iqWB6jN0sjxsxMNrmWS.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459535.mkv" },
  { name: "Batman eternamente (1995)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/wg6BN76E9iIEtiawMJnCecY0zgY.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459534.mkv" },
  { name: "La centinela (1977)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/opI5fzqlbbE4WMSspwZe2XgKC42.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459532.mkv" },
  { name: "Lara Croft: Tomb Raider (2001)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459531.mkv" },
  { name: "Alerta Máxima 2 (1995)", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/v453pRRshPun2gxRRBnNg8AIT0A.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459529.mkv" },
  { name: "The Running Man (1963)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459527.mkv" },
  { name: "The Foreigner 2003", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/e3bz8umOSXvHi6QQkfwk1297oYe.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459525.mkv" },
  { name: "Jo Pil-ho El despertar de la ira 2019", group: "Películas | Acción", logo: "https://image.tmdb.org/t/p/w400/mZLtd1fR4hpcyGVwOLM1ka1t8HX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459524.mkv" },
  { name: "El corruptor (1999)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459520.mkv" },
  { name: "La Estafa Maestra (2003)", group: "Películas | Acción", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/459511.mkv" },
  { name: "Titanes Del Pacfico (2013)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468441.mp4" },
  { name: "El padrino (1972)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/5HlLUsmsv60cZVTzVns9ICZD6zU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468440.mp4" },
  { name: "Dulce Venganza (2010)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468439.mp4" },
  { name: "Hellraiser III: Infierno en la Tierra (1992)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468438.mp4" },
  { name: "Tarzn (1999)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468436.mp4" },
  { name: "Los ros de color prpura 2 Los ngeles del apocalipsis (2004)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468435.mp4" },
  { name: "Un Paso Adelante 5 (2014)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468434.mp4" },
  { name: "Jeepers Creepers La Reencarnacin del Demonio (2022)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468433.mp4" },
  { name: "Triunfos Robados 5: Pelea hasta el final (2009)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468432.mp4" },
  { name: "Alien: Covenant (2017)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468430.mp4" },
  { name: "La hurfana Primer asesinato (2022)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468429.mkv" },
  { name: "El legado de Bourne (2012)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/pWVaLBdcVrTqSTBKIJLinmuxRso.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468428.mp4" },
  { name: "Piratas del Caribe La maldicin de la Perla Negra (2003)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468427.mp4" },
  { name: "El cdigo Da Vinci (2006)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468426.mp4" },
  { name: "Volver al Futuro 3 (1990)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468423.mp4" },
  { name: "Starship Troopers 2 Hroe de la federacin (2004)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468422.mp4" },
  { name: "Left Behind II: Tribulation Force (2002)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468421.mp4" },
  { name: "Creed III (2023)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468420.mp4" },
  { name: "Pesadilla en Elm Street 2 La venganza de Freddy (1985)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/54JsC5uy6l9HTeDmW1DGQ76dsc4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468419.mkv" },
  { name: "Annabelle 2 La Creacin (2017)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468418.mp4" },
  { name: "Stuart Little 2 La aventura contina (2002)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468417.mp4" },
  { name: "Triunfos Robados (2000)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468416.mp4" },
  { name: "Stuart Little (1999)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468415.mp4" },
  { name: "3 Ninjas al rescate (1994)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468414.mp4" },
  { name: "Mi abuela es un peligro 2 (2006)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468413.mp4" },
  { name: "Terrorficamente muertos (1987)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468412.mp4" },
  { name: "Rambo III (1988)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468411.mp4" },
  { name: "La monja (2018)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/7fxjwtEvqI1BYkXEbGqJ3dQBgXD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468410.mp4" },
  { name: "After Aqu empieza todo (2019)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468409.mp4" },
  { name: "Karate Kid (2010)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468408.mp4" },
  { name: "La Pandilla 2 Pequeos Traviesos Al Rescate (2014)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468407.mp4" },
  { name: "El ejrcito de las tinieblas (1992)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468406.mp4" },
  { name: "La noche del demonio (2011)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468405.mp4" },
  { name: "Las Tortugas Ninja (1990)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468404.mp4" },
  { name: "Hellraiser I Puerta al infierno (1987)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468403.mp4" },
  { name: "Blade", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468402.mp4" },
  { name: "Soldado Universal (El da del juicio final) (2012)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468401.mp4" },
  { name: "Critters 2: El plato principal (1988)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468400.mp4" },
  { name: "the Fire Monster (1959)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/6YcIEhXzMSuNdrooBUsO3mZK8rT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468399.mp4" },
  { name: "Ahora me ves (2013)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/iN3fPrPLozgPDrHO1IILh1Cx0C3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468398.mp4" },
  { name: "El Padrino Parte II (1974)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/mbry0W5PRylSUHsYzdiY2FSJwze.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468397.mp4" },
  { name: "Bridget Jones Al borde de la razn (2004)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468396.mp4" },
  { name: "El duende maldito 4: En el espacio (1997)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468395.mp4" },
  { name: "Cmbio de Hbito 2 Ms Locura en el Convento (1993)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468394.mp4" },
  { name: "Harry Potter y la Orden del Fnix (2007)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468393.mp4" },
  { name: "The Jack in the Box El despertar (2022)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/xm6N21UjaUSK9LF7kfDSaGJU7fx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468392.mp4" },
  { name: "Siniestro (2012)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468391.mp4" },
  { name: "La maldicin de Chucky (2013)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468390.mp4" },
  { name: "Bala Perdida (2020)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468388.mp4" },
  { name: "El planeta de los simios (1968)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468387.mp4" },
  { name: "Parte V: Todo comienza de nuevo (1985)\\" tvg-logo=\\"http://mundo2.pro:80/images/c162c2aa3f07ee06e2eeb5ea23eb1e0b.jpg\\" group-title=\\"⏩ SAGAS PREMIUM ⏪\\",Viernes 13, Parte V: Todo comienza de nuevo (1985)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468386.mp4" },
  { name: "Harry Potter y la cmara secreta (2002)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468384.mp4" },
  { name: "Depredador (2025)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468383.mp4" },
  { name: "Glass (2019)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468382.mp4" },
  { name: "Fuera de pista (2022)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468381.mp4" },
  { name: "Temblores 4 Comienza la leyenda (2004)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/hzjNWXlOnL85gkmW404OvAxGXtj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468380.mp4" },
  { name: "Furia de Titanes 2 (2012)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468379.mp4" },
  { name: "Cmo entrenar a tu dragn 3 (2019)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468378.mp4" },
  { name: "Alien Resurreccin (1997)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468377.mp4" },
  { name: "3 Ninjas Contraatacan (1995)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468376.mp4" },
  { name: "Sicario: Tierra de nadie (2015)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468375.mp4" },
  { name: "La monja II (2023)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/cRp5MhCXwyEjJ3gqynmUME4nJPv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468374.mp4" },
  { name: "Bob Esponja Un hroe fuera del agua (2015)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468373.mp4" },
  { name: "Casino Royale (2006)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468372.mp4" },
  { name: "Juon La maldicin (2002) Subtitulado", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468371.mp4" },
  { name: "Los Pitufos en la aldea perdida (2017)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468370.mp4" },
  { name: "Temblores 5 El legado (2015)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/eJ2kxo6yzwYvqUOGOBjXTaO8oYQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468369.mp4" },
  { name: "La noche del demonio La ltima llave (2018)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468368.mp4" },
  { name: "Acorralado (1989)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468367.mkv" },
  { name: "Jurassic Park HS", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468366.mp4" },
  { name: "Rambo 4: Regreso al infierno (2008)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468365.mp4" },
  { name: "Las crnicas de Narnia El prncipe Caspian (2008)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468364.mp4" },
  { name: "Soldado Universal El Retorno (1999)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/m9snWHsV6Sb6NZAUQJCOunxKGQX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468363.mp4" },
  { name: "La noche del demonio Captulo 3 (2015)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468362.mp4" },
  { name: "Rpidos y furiosos (2009)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468361.mp4" },
  { name: "Los expedientes secretos X: Quiero creer​ (2008)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468360.mp4" },
  { name: "Godzilla vs Kong (2021)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468359.mp4" },
  { name: "Inframundo 5: Guerras de sangre (2016)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468358.mp4" },
  { name: "Rpidos y furiosos 6 (2013)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468357.mp4" },
  { name: "La calle del terror (Parte 2) 1978 (2021)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468356.mp4" },
  { name: "Tiburn (1975)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468355.mp4" },
  { name: "Dulce venganza 3 La venganza es ma (2015)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/mYWk0btcYNlxcSy0q29JGhj3eDa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468354.mp4" },
  { name: "Scream 2: Grita y vuelve a Gritar (1997)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468353.mp4" },
  { name: "rase una vez en China II (1992)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468352.mkv" },
  { name: "Exterminio 2 (2007)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468351.mp4" },
  { name: "Transporter 2 (2005)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/qBECR9naHoxuwK8b6pKM8QYyS9N.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468350.mp4" },
  { name: "El Planeta de Los Simios 3: La Guerra (2017)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468349.mp4" },
  { name: "Alien 3", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/kDSuWwWLtMoh4xvlFH6sU6uNhR6.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468348.mp4" },
  { name: "Las crnicas de Narnia La travesa del viajero del alba (2010)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468347.mp4" },
  { name: "El seor de los anillos Las dos torres (2002) Extendida", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468346.mp4" },
  { name: "Plan de Escape 2 (2018)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468345.mp4" },
  { name: "Triunfos Robados: Llegar para ganar (2007)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468344.mp4" },
  { name: "Alvin Y Las Ardillas (2007)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468343.mp4" },
  { name: "Estacin Zombie tren a Busan (2016)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468342.mp4" },
  { name: "Jungla de cristal la venganza (1995)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/uLVcPispwVVa5LMpAWwQngFcm8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468341.mp4" },
  { name: "La creacin de los dioses El reino de las tormentas (2023)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468340.mp4" },
  { name: "Bad Boys for Life (2020)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/zXYARspjKpwN9vAOp2F9MF3NWa1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468338.mp4" },
  { name: "Alien: El Octavo Pasajero (1979)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468337.mp4" },
  { name: "El duende maldito 2 (1994)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468336.mp4" },
  { name: "La conquista del planeta de los simios (1972)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468335.mp4" },
  { name: "Tus navidades o las mas 2 (2023)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468333.mp4" },
  { name: "Megalodn (2018)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468332.mp4" },
  { name: "Happy Gilmore (1996)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468331.mp4" },
  { name: "Los cazafantasmas II (1989)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/tqFgvP61lOFegzsCiJOaeRfkogJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468330.mp4" },
  { name: "Siniestro 2 (2015)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468329.mp4" },
  { name: "Saga Da Vinci ngeles y demonios (2009)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468328.mp4" },
  { name: "El contador (2016)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/1Bd9ItSLT13u8Na0PApQAMcW1Jw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468327.mp4" },
  { name: "Godzilla 2: El rey de los Monstruos (2019)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468326.mp4" },
  { name: "Ro 2 (2014)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468325.mp4" },
  { name: "Starship Troopers 3 Armas del futuro (2008)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/hi9m0B83RW0w1Y9iBDl78oOj2Qu.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468324.mp4" },
  { name: "Furia de Titanes (2010)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468322.mp4" },
  { name: "Left Behind: World at War (2005)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468321.mp4" },
  { name: "Hellraiser VIII: Hellworld (2005)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468320.mp4" },
  { name: "Kong: La Isla Calavera (2017)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468319.mp4" },
  { name: "George de la Selva (1997)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468318.mp4" },
  { name: "After: En mil pedazos (2020)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468317.mp4" },
  { name: "Godzilla (2014)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468316.mp4" },
  { name: "S lo que hicieron el verano pasado (1997)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468315.mp4" },
  { name: "Charlie y la fbrica de chocolate (2005)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468314.mp4" },
  { name: "Rpidos y furiosos 9 (2021)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468313.mp4" },
  { name: "Tron: El Legado (2010)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468312.mp4" },
  { name: "Alicia a travs del espejo (2016)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468311.mp4" },
  { name: "Sicario El Da Del Soldado (2018)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468310.mp4" },
  { name: "Hellraiser VII: Deader (2005)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468309.mp4" },
  { name: "ZOMBIES 2 (2020)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/cOnxoQ3kx4mgmWb7yRi6GBWssOh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468308.mp4" },
  { name: "Sanky Panky 3 (2018)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468307.mp4" },
  { name: "RoboCop (2014)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468306.mp4" },
  { name: "La noche del demonio Captulo 2 (2013)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468305.mp4" },
  { name: "Annabelle (2014)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468304.mp4" },
  { name: "Mi pobre angelito 5 (2012)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468303.mp4" },
  { name: "Soldado Universal Regeneracin (2010)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468301.mp4" },
  { name: "Canta (2016)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/5EyWAoHFGKfcIOT7tj0Cwe9Zx57.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468300.mp4" },
  { name: "Kingdom (2019)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468299.mp4" },
  { name: "La calle del terror (Parte 1) 1994 (2021)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468298.mp4" },
  { name: "Terrifier (2011)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468297.mp4" },
  { name: "Un lugar tranquilo (C)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468296.mp4" },
  { name: "Dos pcaros con suerte Parte 3 (1983)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468295.mp4" },
  { name: "Los descendientes Corazn rebelde (2024)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468294.mp4" },
  { name: "12 Horas para sobrevivir El Ao de la Eleccin (2016)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468293.mp4" },
  { name: "Hachiko 2: Siempre a tu lado (2023)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468292.mp4" },
  { name: "Siempre a tu Lado: Hachiko (2009)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468291.mp4" },
  { name: "Madagascar 2 Escape de frica (2008)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468290.mp4" },
  { name: "Rambo 1", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468288.mp4" },
  { name: "Star Wars El regreso del Jedi (1983)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/rKMmXzdm7eRgmlwYo7iq3klT7wJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468287.mp4" },
  { name: "Destino Final (2000)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468286.mp4" },
  { name: "American Pie presenta: La milla al desnudo (2006)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468285.mp4" },
  { name: "Transformers: el lado oscuro de la luna (2011)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468284.mp4" },
  { name: "El seor de los anillos La comunidad del anillo (2001) Extendida", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468283.mp4" },
  { name: "VHS Las crnicas del miedo 2 (2013)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468282.mp4" },
  { name: "Scary Movie 5 (2013)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468281.mkv" },
  { name: "Los ros de color prpura (2000)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468280.mp4" },
  { name: "La novia de Chucky (1998)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468279.mp4" },
  { name: "RoboCop 3 (1993)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468278.mp4" },
  { name: "Misin imposible Nacin secreta (2015)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468277.mp4" },
  { name: "American Pie presenta: Campamento de bandas (2005)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468276.mp4" },
  { name: "¡Scooby! (2020)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zD8LFCoOPe4ooBTkedl1sGSYRGO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468274.mp4" },
  { name: "Crepsculo Amanecer Parte 1 (2011)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468273.mp4" },
  { name: "High School Musical 3 Fin de curso (2008)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/DMpgcsydoSvmd8gp8LPKvEXSn5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468271.mp4" },
  { name: "Jurassic World Dominio (2022)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468270.mp4" },
  { name: "Hellraiser XI Ella (2022)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468269.mp4" },
  { name: "Happy Feet El pingino (2006)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468268.mp4" },
  { name: "Chucky el mueco diablico 3 (1991)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468266.mp4" },
  { name: "Aliens: El Regreso (1986)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468265.mp4" },
  { name: "Han Solo: Una historia de Star Wars (2018)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468264.mp4" },
  { name: "Gru 2. Mi villano favorito (C)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468263.mp4" },
  { name: "Zoolander 2 (2016)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468262.mp4" },
  { name: "Alien Prometheus", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/wDVap4INWE33SPiAMcFUVlPDNIb.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468261.mp4" },
  { name: "Wonka (2023)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468260.mp4" },
  { name: "El Chanfle (1979)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/x76WV946xbdfwnSw22RhB1r2VOP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468259.mp4" },
  { name: "Triunfos Robados: Otra vez (2004)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468258.mp4" },
  { name: "Aquaman y el reino perdido (C)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468257.mp4" },
  { name: "La jungla Un buen da para morir (2013)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468256.mp4" },
  { name: "Avatar: El camino del agua (2022)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468255.mp4" },
  { name: "American Pie 3: La Boda (2003)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468254.mp4" },
  { name: "Fragmentado (2017)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468253.mp4" },
  { name: "Temblores 2 La respuesta (1996)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/uGogIG6BHjoKnKJTRnFA5YwmFu0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468252.mp4" },
  { name: "John Wick 3: Parabellum (2019)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468251.mp4" },
  { name: "REC (2009)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/vIoBgFBJuqcIzudkFyagJuCxHZ7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468250.mp4" },
  { name: "El seor de los anillos El retorno del rey (2003)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468249.mp4" },
  { name: "Zoolander (2001)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468248.mp4" },
  { name: "3 ninjas Medioda en la Mega Montaa (1998)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468247.mp4" },
  { name: "El Duende Maldito 7: El Origen (2014)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468246.mp4" },
  { name: "Inframundo La Evolucin (2006)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468245.mp4" },
  { name: "The Witch: Part 2. The Other One (2022)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468244.mp4" },
  { name: "La masacre de Texas (1974)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468243.mp4" },
  { name: "Five Nights at Freddy's (2023)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468242.mp4" },
  { name: "VHS (2012)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/Auwk2Fr3cNRseHBXEGfcjXLyH8m.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468241.mp4" },
  { name: "Sanky Panky (2007)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468239.mp4" },
  { name: "Hurfana (2017)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468238.mkv" },
  { name: "La maldicin de La Llorona (2019)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468237.mp4" },
  { name: "Cincuenta Sombras de Grey (2015)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468236.mp4" },
  { name: "La masacre de Texas 3 (1990)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468235.mp4" },
  { name: "Tomb Raider 2", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468234.mp4" },
  { name: "RoboCop 2 (1990)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468233.mp4" },
  { name: "Objetivo La Casa Blanca (2013)", group: "Películas | Sagas", logo: "https://image.tmdb.org/t/p/w400/3AWmaBCfX6x3KTa4w5rGLMevNdU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468232.mp4" },
  { name: "Madagascar 3: Los Fugitivos (2012)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468231.mp4" },
  { name: "Crepsculo Amanecer Parte 2 (2012)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468230.mp4" },
  { name: "La masacre de Texas (2003)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468229.mp4" },
  { name: "VHS Ms all (2024) Subtitulado", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468228.mp4" },
  { name: "Resident Evil 4 La resurreccin (2010)", group: "Películas | Sagas", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468227.mp4" },
  { name: "Zack y Cody La Película (2011) (D)", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/aQ3EGFTXfa2itZDNqexj6osSzNQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/561067.mp4" },
  { name: "Air Bud: Golpea de Nuevo (2003) (D)", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/uHqrJBAJFmLgxgAcGOpyO2Hkf2N.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542640.mp4" },
  { name: "Air Bud 3: Los cachorros de Buddy (2001) (D)", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/AqYWXDLeRgRhtSOc2BgVphuOEQK.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542637.mp4" },
  { name: "Air Bud: Super Estrella (1997) (D)", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/kDfzh6QdX2tseTwwyB7lp2RP7iE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542634.mp4" },
  { name: "Luca (2021)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472800.mkv" },
  { name: "Un mundo extraño (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472799.mkv" },
  { name: "el caballo del desierto 2003", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/earW79xMyzcioZMm7hqpFC75oxn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472798.mkv" },
  { name: "McFarland: Sin límites (2015)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472797.mp4" },
  { name: "Peter y el dragon 2016", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/b86WrC1hkgNPXL7tdPK1wwQX5zz.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472796.mkv" },
  { name: "Notorious 2009", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/62NsZPgueSiE8y7dqtU3FSLFwYw.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472795.mp4" },
  { name: "Si de verdad quieres... 2012", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/yNuv882GooXiEFRSZLTdLbtGbrD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472793.mp4" },
  { name: "Camp Rock 2 The Final Jam 2010", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/tiU02J6psYrY15tOASiJq6S18bU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472792.mkv" },
  { name: "The Banger Sisters 2002", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/pQ7XoEqroHcCQVKP9Xo8JpujuHU.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472791.mp4" },
  { name: "Lilo y Stitch (2002)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472790.mkv" },
  { name: "Nuestra Pandilla (1993)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472789.mp4" },
  { name: "Winnie the Pooh Unas Navidades megapooh 2002", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/8MpSfNl8b8oassXdSIBWj6eexZD.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472788.mkv" },
  { name: "Star Wars: Ewoks La Batalla Por Endor (1985)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472787.mp4" },
  { name: "La Cenicienta 3: Un giro en el tiempo (2007)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472785.mkv" },
  { name: "X (2019)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472784.mkv" },
  { name: "Valiant (2005)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472783.mkv" },
  { name: "Ocho a la deriva (1944)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472782.mp4" },
  { name: "Por fin solo en casa 2021", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/5K7qxX77PJXWuzkZD8rOBduCEKo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472781.mp4" },
  { name: "El Regreso De Mary Poppins (2018)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472779.mkv" },
  { name: "Enredados (2010)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472778.mkv" },
  { name: "Buddies (1985)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472777.mkv" },
  { name: "La leyenda del tesoro perdido 2: El libro de los secretos (2007)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472776.mp4" },
  { name: "Mas allá del Infinito: Buzz y el viaje hacia Lightyear (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472775.mp4" },
  { name: "Secret of the Wings 2012", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/soPOZlksVHcumHnhyRlI3XtAVyx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472774.mp4" },
  { name: "G (2002)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472773.mkv" },
  { name: "Venom (2018)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472772.mkv" },
  { name: "Spider (2023)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472771.mp4" },
  { name: "Piratas del Caribe 3: En el Fin del Mundo (2007)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472770.mkv" },
  { name: "Los Hechiceros de Waverly Place: La Película (2009)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472769.mp4" },
  { name: "Wish (2002)", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472768.mp4" },
  { name: "X-Men Apocalipsis 2016", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/i5ET4lACwrb97sdPzmIThieasOk.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472766.mkv" },
  { name: "Doctor Strange en el multiverso de la locura (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472765.mkv" },
  { name: "That Darn Cat 1997", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/yRD5A0w4riRriODau8NGPvMSy1p.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472764.mp4" },
  { name: "Solo en casa 3 Mi pobre angelito 3 1997", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/720eeviFT6G8SStX2lEgFsYzqAp.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472763.mp4" },
  { name: "Desencantada (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472762.mkv" },
  { name: "Mas que robots 2022", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/eVYXKUvD6xWyVJ7UbVhNTIkBuWC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472761.mp4" },
  { name: "Descendants 2 2017", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/uQCZ12XelnvTchY9ncdLgnm4Gqy.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472760.mkv" },
  { name: "El retorno de Jafar 1994", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/dpnjhDsWimMUOMsuz2AVsqeU9vL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472759.mkv" },
  { name: "Alejandro Magno descubriendo su tumba perdida 2019", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/geUEf3y7bAZc2OAzWk8fshfBHJi.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472758.mp4" },
  { name: "Our Family Wedding (2010)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472757.mp4" },
  { name: "Homecoming (2018)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472754.mkv" },
  { name: "Z-O-M-B-I-E-S 2 (2020)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472753.mp4" },
  { name: "Minicampeones 2 (2006)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472751.mp4" },
  { name: "000 leguas de viaje submarino (1954)\\" tvg-logo=\\"http://mundo2.pro:80/images/693f77bcdfd11f7be662f2135ff73f2d.jpg\\" group-title=\\"⏩ DISNEY + ⏪\\",20,000 leguas de viaje submarino (1954)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472750.mkv" },
  { name: "Los Descendientes2", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/uQCZ12XelnvTchY9ncdLgnm4Gqy.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472749.mp4" },
  { name: "El proximo tsunami gigante 2014", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/bL0P1vkHj462gVlH1AhITNAOrtj.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472748.mp4" },
  { name: "Vida Acuática con Steve Zissou (2004)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472747.mp4" },
  { name: "Z-O-M-B-I-E-S 3 (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472746.mp4" },
  { name: "Spider (2007)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472745.mkv" },
  { name: "Star Wars: Rogue One (2016)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472744.mp4" },
  { name: "Teen Beach Movie 2 (2015)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472741.mp4" },
  { name: "The Cheetah Girls (2003)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472740.mkv" },
  { name: "Guardianes de la Galaxia volumen 2 (2017)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472739.mkv" },
  { name: "Pantera Negra (2018)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472738.mkv" },
  { name: "Super policías (2001)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472737.mp4" },
  { name: "Hermano oso Tierra De Osos 2003", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/1XwOQNSby3HZfKMZcY7rtZw4KR.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472736.mkv" },
  { name: "Viaje a Darjeeling (2007)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472735.mp4" },
  { name: "Thor Love and Thunder 2022", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/z9ajF6E39Hg2pXUofmUYgZHvdX.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472734.mp4" },
  { name: "Preparatoria Halloween (2004)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472733.mp4" },
  { name: "Descendientes", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472732.mkv" },
  { name: "Piratas del Caribe 2: El Cofre de la Muerte (2006)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472731.mkv" },
  { name: "Spider (2002)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472730.mp4" },
  { name: "Los Aristogatos (1970)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472729.mkv" },
  { name: "En honor a la verdad 1996", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/nqMlCYhD19ZvdYxMbUSAXAH4iNO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472728.mp4" },
  { name: "Sea (2013)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472727.mp4" },
  { name: "Ojos en el Bosque (1980)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472726.mkv" },
  { name: "el demoledor 2012", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/lTpE4JQ2C09NicqvDhwi70IRz62.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472725.mp4" },
  { name: "Los descendientes Corazon rebelde 2024", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/57XarHzHxeDouUyjAb6BpVxIkC0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472724.mkv" },
  { name: "El cowboy naufrago 1974", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/y0OS6qzq9aZLEGPgFKocfvJ1tHJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472723.mp4" },
  { name: "Cyborg 2087 1966", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472721.mkv" },
  { name: "Las vacaciones de la familia Johnson (2004)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472720.mp4" },
  { name: "El misterio de los flamencos (2008)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472718.mkv" },
  { name: "Expediente OVNI 2009", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/7vJjS3qK1krTmlLYvXuQF9v9GkV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472717.mp4" },
  { name: "Loca por las Compras (2009)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472716.mp4" },
  { name: "Spider Man No Way Home (2022)", group: "Películas | Disney", logo: "https://www.startpage.com/av/proxy-image?piurl=https%3A%2F%2Fmx.web.img3.acsta.net%2Fpictures%2F21%2F11%2F25%2F18%2F23%2F3142881.jpg&sp=1785630471T77ac83fbcc7accc3f3ea31ab1b1ba2f70163f352e6518845d7016907960a3822", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472715.mkv" },
  { name: "Ralph rompe Internet 2018", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/wfff5XoLdGQzCt2Nb4ZF6WYNLAq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472713.mkv" },
  { name: "La tostadora valiente 2 Al rescate 1997", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/xerSiQL6UooO7hA8j93WnaqKMqJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472712.mkv" },
  { name: "Nate: Mejor tarde que nunca (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472711.mp4" },
  { name: "Miami Rhapsody (1995)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472710.mp4" },
  { name: "Chasing Papi 2003", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/7nljGY0WATlvzXyEu0h8TIRw8d1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472708.mp4" },
  { name: "Un chiflado encantador (2011)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472707.mkv" },
  { name: "Los Vengadores 2012", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/ugX4WZJO3jEvTOerctAWJLinujo.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472706.mp4" },
  { name: "Avengers: Endgame (2019)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472705.mkv" },
  { name: "Ultimate Avengers 2 Ascenso De La Pantera 2006", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/sMFyYZR9krqcQC99G6jnb10Zv4P.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472703.mkv" },
  { name: "La hora 25 (2002)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472702.mp4" },
  { name: "La tostadora valiente va a Marte 1998", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/cRfskY8DzWBV45D0nCCSQFZrPIE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472701.mkv" },
  { name: "Lilo Stitch 2 El efecto del defecto 2005", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/l71VXcph19ZwJr2ZtEFuZA6ZzK5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472700.mp4" },
  { name: "2022 (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472699.mkv" },
  { name: "Los robinsones de los mares del sur 1960", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/eIyfxhuxRlPUwxkJhiZAneh4ix9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472698.mkv" },
  { name: "El rey leon 3 Hakuna Matata 2004", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/x2SAEOXURbKDgKfdHdZ49VhPGrB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472697.mkv" },
  { name: "Lost on Everest (2020)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472696.mp4" },
  { name: "Olaf: Otra aventura congelada de Frozen (2017)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472695.mp4" },
  { name: "Notre-Dame Race Against the Inferno 2019", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/8MnjWpxoyONo0sKetJUSDzJD47O.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472694.mp4" },
  { name: "X (2011)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472693.mkv" },
  { name: "La pandilla 1992", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/wv8h6kKiBO4Z5ELicJetpsoe9oA.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472692.mkv" },
  { name: "High School Musical (2006)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472691.mkv" },
  { name: "Michael Kohlhaas (2013)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472690.mp4" },
  { name: "Zootropolis 2016", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/4zIlT48TgNLuJpUtFOkFITHoCQE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472689.mp4" },
  { name: "El Retorno De Zenon 2001", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/qO67MkWGURsWp6GB14cH9scvYHa.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472688.mp4" },
  { name: "Ant-Man: El hombre Hormiga (2015)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472687.mkv" },
  { name: "Aventuras en Alaska 2002", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/CqFvnM1hiAOXLnMnJYDYlvrknV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472686.mkv" },
  { name: "My Father the Hero (1994)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472685.mp4" },
  { name: "Solo en casa 4 Mi Pobre Angelito 4 2002", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/q9BAc2Q37oQWcRlMKUkuRilJ90E.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472684.mp4" },
  { name: "Nunca me abandones 2010", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/5t2lzqqR2IsFJb7VWvbx7HBas6R.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472683.mp4" },
  { name: "Juego de Honor (2005)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472682.mkv" },
  { name: "Volviendo a Casa 2: Perdidos en San Francisco (1996)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472681.mkv" },
  { name: "Piratas del Caribe 5: La Venganza de Salazar (2017)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472679.mkv" },
  { name: "The Marvels 2023", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/vpuuFM032yiX8tox4L84Wl9MGjG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472678.mkv" },
  { name: "Las Hermanas Magicas 2020", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/3puDk9b9OBAeoRNF3kq2qMuxwRF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472677.mp4" },
  { name: "la pelicula Candace contra el universo 2020", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/i5rPRIEf88IKSCM2loRy3iN2lQc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472675.mkv" },
  { name: "Spider-Man Across the Spider-Verse 2023", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/37WcNMgNOMxdhT87MFl7tq7FM1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472674.mkv" },
  { name: "El libro de la selva: la historia de Mowgli (1998)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472673.mp4" },
  { name: "Los Muppets 2", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/iMOk0PG1X4hJJdXbHq6nWnHgF2I.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472672.mp4" },
  { name: "Applucinante 2014", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/44NWPxVOrzSEQyz1Y2Uj1HGCz7o.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472671.mkv" },
  { name: "Avengers 2: Era de Ultrón (2015)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472670.mkv" },
  { name: "The Santa Clause 3 The Escape Clause 2006", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/k52QsJelqWajXPFSnclMCxMaSTQ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472668.mp4" },
  { name: "Hermano abeja (2010)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472667.mkv" },
  { name: "Vacaciones en directo 2003", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/ieRVGe9GnkBdaxAFKFGUnWxcy0G.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472665.mp4" },
  { name: "Spider (2019)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472664.mkv" },
  { name: "amor en rojo 2001", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/hE7ovWkqKzPmgrXZhLRIA20Hx6F.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472663.mp4" },
  { name: "Mi Amigo El Gigante (2016)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472662.mkv" },
  { name: "The Amazing Spider-Man 2012", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/swjygVNvJ84ztpgfFX9gRr2MPBZ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472661.mkv" },
  { name: "X-Men 3 La Batalla Final 2006", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/fY43xX0k1raU7M9FZHwOj0WNYhF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472660.mkv" },
  { name: "Operación monumento (2014)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472659.mp4" },
  { name: "El Libro de la Selva 2 (2003)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472658.mkv" },
  { name: "Las aventuras de Bo Peep 2020", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/kBIkCS3PQlHY86agofKY411jLM7.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472657.mkv" },
  { name: "Lilo y Stitch (2025)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472656.mkv" },
  { name: "Un Papá con Pocas Pulgas (2006)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472655.mkv" },
  { name: "Soul (2020)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472654.mkv" },
  { name: "Sein letztes Rennen (2013)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472653.mp4" },
  { name: "Radio Rebelde (2012)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472652.mkv" },
  { name: "La leyenda de Sleepy Hollow y el Senor Sapo 1949", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/cfOTB8ZGNeGQvKvlQzEFRfPG6sI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472651.mkv" },
  { name: "Los pinguinos de papa 2011", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/9KlaaIqRZkiGH1mE7ub6yw9kDhE.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472650.mp4" },
  { name: "Patrulla de aterrizaje Escuadron De Navidad", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472649.mkv" },
  { name: "High School Musical 3 Fin de curso 2008", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/DMpgcsydoSvmd8gp8LPKvEXSn5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472648.mkv" },
  { name: "El Zorro y el Sabuezo", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472646.mkv" },
  { name: "Madchen Madchen 2001", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/edGsy5IFi6m6xe6JWFqUoKPiJ1n.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472645.mp4" },
  { name: "Piratas del Caribe 4: Navegando Aguas Misteriosas (2011)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472644.mkv" },
  { name: "La Casa de los Cocodrilos 2012", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/eWEtkJ84wtHF50TAYawvxm62j6s.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472643.mp4" },
  { name: "Los rescatadores en Cangurolandia 1990", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/hyuP9jI0Q6bBDEvvsYD8ka27QD0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472642.mkv" },
  { name: "La bruja novata 1971", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/9hcab3uFL8u3C2852lr5DvJdfCh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472641.mkv" },
  { name: "Starstruck: Mi Novio es una Súperestrella (2010)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472640.mp4" },
  { name: "Las aventuras de los superhéroes de Marvel: ¡Combate sobre hielo! (2015)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472639.mp4" },
  { name: "Mas Barato por Docena (2022)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472638.mp4" },
  { name: "papa de por vida 1993", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/8GcpLdN9aiIBH5rnu8VRI4iPxbM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472637.mp4" },
  { name: "Up: Una Aventura de Altura (2009)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472636.mkv" },
  { name: "Por siempre cenicienta: Una historia de amor (1998)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472635.mp4" },
  { name: "Violetta: La emoción del concierto (2014)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472634.mkv" },
  { name: "from Pulp to Pop 2014", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/biud0bsRfQryGBfcTXN2ep6ODwM.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472633.mp4" },
  { name: "Oliver y su pandilla (1988)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472632.mkv" },
  { name: "Moana 3", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472631.mkv" },
  { name: "Maze Runner: La cura mortal (2018)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472630.mp4" },
  { name: "La pandilla de cupido motorizado (1974)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472629.mp4" },
  { name: "Raya y El Último Dragón (2021)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472628.mkv" },
  { name: "Un Milagro Para Helen (2000)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472627.mkv" },
  { name: "Tarzán y Jane (2002)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472626.mkv" },
  { name: "Vida salvaje (2006)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472625.mkv" },
  { name: "Una Chihuahua de Beverly Hills 3: ¡Viva la Fiesta! (2012)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472623.mkv" },
  { name: "Mi cita con la hija del presidente (1998)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472622.mkv" },
  { name: "Shang-Chi y la leyenda de los Diez Anillos 2021", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/9VqajJXm29uprSaxOcEh7O0d6E9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472621.mkv" },
  { name: "La Dama y el Vagabundo II: Las aventuras de Scamp (2001)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472620.mkv" },
  { name: "El Aprendiz de Brujo (2010)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472619.mkv" },
  { name: "La liga extraordinaria (2003)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472618.mp4" },
  { name: "Mi Encuentro Conmigo (2000)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472617.mp4" },
  { name: "Mi Marciano Favorito (1999)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472615.mkv" },
  { name: "High School Musical 2 (2007)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472614.mkv" },
  { name: "OLIVIA RODRIGO driving home2", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/v8tVvNTIDL2KP7a5iLDtqF2NhNL.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472613.mp4" },
  { name: "Maléfica (2014)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472611.mkv" },
  { name: "X-Men La decision final 2006", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/fY43xX0k1raU7M9FZHwOj0WNYhF.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472610.mp4" },
  { name: "John Carter 2012", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/lRvQP1wLqyPJEgBjjn35bInO7it.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472609.mkv" },
  { name: "Daredevil", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472608.mkv" },
  { name: "Iron Man 2 (2010)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472606.mkv" },
  { name: "Bichos 2003", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/3zc9gBzw0egrp7lMrE0zqFkNMms.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472604.mkv" },
  { name: "Cuatro cachorros para salvar 1987", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/97T0PPp7srO0RTiJWN9bO2eKaG1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472603.mkv" },
  { name: "La novicia rebelde (1971)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472602.mkv" },
  { name: "La Cenicienta (2015)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472601.mkv" },
  { name: "Guardianes de la galaxia (2014)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472599.mkv" },
  { name: "Los Descendientes 3 (2019)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472596.mp4" },
  { name: "El Llanero Solitario (2013)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472595.mkv" },
  { name: "El planeta del tesoro (2002)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472594.mkv" },
  { name: "Miss Peregrine y los niños peculiares (2016)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472592.mp4" },
  { name: "El jorobado de Notre Dame 2 El secreto de la campana 2002", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/gFqCwVk7ykPkRevHNC6ZNzHZuu4.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472591.mkv" },
  { name: "El Desierto Viviente (1953)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472590.mp4" },
  { name: "El solista (2009)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472589.mkv" },
  { name: "Cheque en blanco (1994)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472588.mkv" },
  { name: "La fabulosa aventura de Sharpay (2011)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472587.mkv" },
  { name: "Mulan II (2004)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472586.mp4" },
  { name: "Bernardo y Bianca Los rescatadores 1977", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/4Vi5VEkVWdqJgbG3pGdREFOwZdJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472585.mkv" },
  { name: "Ultimate Avengers 2006", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/iMCkGHVrYRdqKROPRPmVaJVSlg3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472584.mkv" },
  { name: "The Bears and I 1974", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/BdyVWRv2Ybpmz8eSLNvaDk98Tx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472583.mp4" },
  { name: "Elementos (2023)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472582.mkv" },
  { name: "Rocketeer: El hombre cohete (1991)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472581.mp4" },
  { name: "Christopher Robin 2018", group: "Películas | Disney", logo: "https://image.tmdb.org/t/p/w400/dECHNeABQCuG4B08eDpgbDOUVCI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472578.mkv" },
  { name: "La Bella y la Bestia : El mundo mágico de Bella (1998)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472577.mkv" },
  { name: "Cupido motorizado (1968)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472576.mkv" },
  { name: "Bolt (1995)", group: "Películas | Disney", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/472574.mkv" },
  { name: "Ahí viene Cascarrabias (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475791.mkv" },
  { name: "Happily Never After (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475790.mkv" },
  { name: "Bobbleheads: La Película (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475789.mkv" },
  { name: "Jorge el Curioso: Familia Real (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475788.mkv" },
  { name: "Toy Story: Olvidados en el Tiempo (2014)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475787.mkv" },
  { name: "Alfa y Omega (2010)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475786.mkv" },
  { name: "Hercules (1997)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475785.mkv" },
  { name: "Nivel Intrépido (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475784.mkv" },
  { name: "Leo Da Vinci: Misión Mona Lisa (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475783.mkv" },
  { name: "Mi pobre angelito 2: Perdido en Nueva York (1992)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475782.mkv" },
  { name: "La brújula dorada (2007)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475781.mkv" },
  { name: "La princesa encantada: Una boda real (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475780.mkv" },
  { name: "Mi villano favorito (2010)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475779.mkv" },
  { name: "Bee Movie: La historia de una abeja (2007)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475778.mkv" },
  { name: "Inside Out (2011)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475777.mkv" },
  { name: "The Incredible Hulk (1977)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475776.mkv" },
  { name: "Las crónicas de Spiderwick (2008)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475775.mkv" },
  { name: "Trolls (2016)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475774.mkv" },
  { name: "Chicken Little (2005)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475773.mkv" },
  { name: "la pelicula 1995", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/5LNUJJaKAaM1Jk3FyphZyTbZyDO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475772.mkv" },
  { name: "UglyDolls: Extraordinariamente Feos (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475771.mkv" },
  { name: "Nuestra Pandilla 3 (2007)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475770.mkv" },
  { name: "Willy Wonka y la fábrica de chocolate (1971)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475769.mkv" },
  { name: "Barbie en un mundo de videojuegos (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475768.mkv" },
  { name: "Extraterrestres de Tellur (2016)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475767.mkv" },
  { name: "Monica y sus amigos: Lecciones (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475766.mkv" },
  { name: "Supermonstruos: Los ayudantes de Santa (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475765.mkv" },
  { name: "Ella Bella Bingo (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475764.mkv" },
  { name: "Dragon Quest: Tu historia (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475763.mkv" },
  { name: "Ladybug: En busca del cañón dorado (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475762.mkv" },
  { name: "Home (2009)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475761.mkv" },
  { name: "Big Hero 6 2014", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/qVU0ag4i5BCmH5h4o04cdvUo0Zf.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475760.mkv" },
  { name: "El Libro de la Selva (2016)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475759.mkv" },
  { name: "Escuela de Miedo (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475758.mkv" },
  { name: "Astérix: El secreto de la poción mágica (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475757.mkv" },
  { name: "Dinosaurio (2000)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475756.mkv" },
  { name: "Ethel & Ernest (2016)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475755.mkv" },
  { name: "Tom y Jerry: Willy Wonka y la fábrica de chocolates (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475754.mkv" },
  { name: "Cars 2 (2011)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475753.mkv" },
  { name: "¿Quién perdió un panda? (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475752.mkv" },
  { name: "Policías y Ratones (1986)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475751.mkv" },
  { name: "Un Viernes de Locos (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475750.mkv" },
  { name: "Fantasía (1940)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475749.mkv" },
  { name: "Las locuras del emperador (2000)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475748.mkv" },
  { name: "- 2020", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475747.mkv" },
  { name: "Trains Cars 2012", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/UxCpcvjZ2D6CxvulggMQVQpPvO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475746.mkv" },
  { name: "Chico Bon Bon: ¡Baya fiesta! (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475745.mkv" },
  { name: "Tinker bell y La Bestia de Nunca Jamas (2014)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475744.mkv" },
  { name: "Top Cat 1960", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/rzmXREdmABtI9Y5EtF67RMpQLYV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475743.mkv" },
  { name: "Agente 00-Gato 2019", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/w6qp51WW5DsYcjc0elXnn6YGiRv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475742.mkv" },
  { name: "¡Cuidado: Bebé suelto! (1994)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475741.mkv" },
  { name: "La mansion embrujada (2003)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475740.mkv" },
  { name: "E.T. El Extraterrestre (1982)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475739.mkv" },
  { name: "Igor (2008)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475738.mkv" },
  { name: "Una familia espacial (2015)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475737.mkv" },
  { name: "Los hermanos guardianes (2015)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475736.mkv" },
  { name: "Ósmosis Jones (2001)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475735.mkv" },
  { name: "El Zorro y el Sabueso 2 (2006)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475734.mkv" },
  { name: "Bienvenidos a Monster High (2016)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475733.mkv" },
  { name: "Little Mermaid (2016)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475732.mkv" },
  { name: "Jorge el Curioso (2006)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475731.mkv" },
  { name: "Aviones 2: Equipo de rescate (2014)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475730.mkv" },
  { name: "Thomas & Friends: Un gran mundo de aventuras (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475729.mkv" },
  { name: "Lluvia de Hamburguesas (2009)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475728.mkv" },
  { name: "Vera: Deseos de invierno (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475727.mkv" },
  { name: "Anastasia (1997)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475726.mkv" },
  { name: "La era de hielo (2002)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475725.mkv" },
  { name: "Reyes de las olas (2007)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475724.mkv" },
  { name: "DC Super Hero Girls: Leyendas de Atlantis (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475723.mkv" },
  { name: "Tinker Bell (2008)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475722.mkv" },
  { name: "Lucas y el espíritu de la Navidad (2006)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475721.mkv" },
  { name: "Dragon Ball Z: La Galaxia Corre Peligro (1993)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475720.mkv" },
  { name: "La Bella y La Bestia (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475719.mkv" },
  { name: "Tom y Jerry y el dragón perdido (2014)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475718.mkv" },
  { name: "El jardín de las palabras (2013)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475717.mkv" },
  { name: "The Penguins of Madagascar (2009)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475716.mkv" },
  { name: "Alice in Wonderland (1999)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475715.mkv" },
  { name: "The Boss Baby 3", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475714.mkv" },
  { name: "La película del Pato Lucas: Isla Fantástica (1983)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475713.mkv" },
  { name: "Trolls vamos a festejar (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475712.mkv" },
  { name: "Robo (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475711.mkv" },
  { name: "Guerra de magos 1977", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475710.mkv" },
  { name: "¿Quién engañó a Roger Rabbit? (1988)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475709.mkv" },
  { name: "The Wizard of Oz (1925)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475708.mkv" },
  { name: "La era de hielo: Choque de mundos (2016)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475707.mkv" },
  { name: "Cinderella (1997)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475706.mkv" },
  { name: "Dino Dana: La Película (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475705.mp4" },
  { name: "Bernardo y Bianca 2: En Cangurolandia (1990)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475704.mkv" },
  { name: "Mente indomable (1997)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475703.mkv" },
  { name: "Los tres caballeros (1944)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475702.mkv" },
  { name: "El Hijo De Pie Grande (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475701.mkv" },
  { name: "Un gran dinosaurio (2015)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475700.mkv" },
  { name: "Donde esta el dragon 2015", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/6q2q6p2D5G6o29H5FvhdvQz8LC9.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475699.mkv" },
  { name: "Los Locos Addams 2 (2021)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475698.mkv" },
  { name: "Navidad Xtraterrestre (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475697.mkv" },
  { name: "Despereaux: Un pequeño gran héroe (2008)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475696.mkv" },
  { name: "Woody Woodpecker (1941)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475695.mkv" },
  { name: "Buscando a Nemo (2003)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475694.mkv" },
  { name: "Como Perros y Gatos (2001)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475693.mkv" },
  { name: "Barbie en El Cascanueces (2001)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475692.mkv" },
  { name: "Jingle Jangle: Una mágica Navidad (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475691.mkv" },
  { name: "Minions: Cro Minion (2015)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475690.mkv" },
  { name: "Bob Esponja: La película (2004)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475689.mkv" },
  { name: "Rex: Un Dinosaurio En Nueva York (1993)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475688.mkv" },
  { name: "La guarderia de Papa 2003", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/uLA4TNQxlvEiZQ729Qrsp7Lagha.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475687.mkv" },
  { name: "La Espada en La Piedra (1963)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475686.mkv" },
  { name: "El progreso del peregrino (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475685.mkv" },
  { name: "Wifi Ralph (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475684.mkv" },
  { name: "Bambi 2 (2006)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475683.mkv" },
  { name: "La Vida Secreta De Tus Mascotas 2 (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475682.mkv" },
  { name: "Luis y los Alienígenas (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475681.mkv" },
  { name: "High School Musical: El Musical: Especial de Navidad (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475680.mkv" },
  { name: "A.R.C.H.I.E. 2: Misión Impowsible (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475679.mkv" },
  { name: "Tarzan (2013)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475678.mkv" },
  { name: "Jungle Book (1995)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475677.mkv" },
  { name: "Hannah Montana: La película (2009)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475676.mkv" },
  { name: "WALL.E 2008", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/pJfm3EggGLZToce08Obf7HQHXrP.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475675.mkv" },
  { name: "Valiente (2012)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475674.mkv" },
  { name: "Wombat al Combate (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475673.mkv" },
  { name: "Lego Ninjago: La película (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475672.mkv" },
  { name: "¡Aloha Scooby-Doo! (2005)", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/kgr5HVQx3wKFbiZmtWwLkfSz3WV.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475671.mkv" },
  { name: "Tom y Jerry: La pelicula (1992)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475670.mkv" },
  { name: "Vacas Vaqueras (2004)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475669.mkv" },
  { name: "Dragon Ball Z: La Batalla de los Dioses (2013)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475668.mkv" },
  { name: "Dragones: Equipo de rescate: Secretos de un Ala Musical (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475667.mkv" },
  { name: "Hop Rebeldes sin Pascua (2011)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475666.mkv" },
  { name: "Turbo (2013)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475665.mkv" },
  { name: "Salvaje (2021)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475664.mkv" },
  { name: "Tom y Jerry: Cazadores de tesoros (2006)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475663.mkv" },
  { name: "Hook: El Regreso del Capitán Garfio (1991)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475662.mkv" },
  { name: "Yanka y el espíritu del volcán (2018)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475661.mkv" },
  { name: "Barbie: Aventura de princesas (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475660.mkv" },
  { name: "Infectados (2009)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475659.mkv" },
  { name: "Enredados otra vez (2017)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475658.mkv" },
  { name: "El diario de un chico en apuros 2: Las reglas de Rodrick (2011)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475657.mkv" },
  { name: "Dragon Ball Z: Los Guerreros más Poderosos (1992)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475656.mkv" },
  { name: "Gnomeo y Julieta (2011)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475655.mkv" },
  { name: "Toy Story 3 2010", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/yBSISwqix2z0JiwIrM3r6fiI6Cm.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475654.mkv" },
  { name: "Una Navidad familiar con los Picapiedra (1993)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475653.mkv" },
  { name: "Pokémon Detective Pikachu (2019)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475652.mkv" },
  { name: "La noche de las narices frías (1961)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475651.mkv" },
  { name: "The Little Prince 1974", group: "Películas | Infantil", logo: "https://image.tmdb.org/t/p/w400/zmhU81wj0Fx8Thp6OIrxqpgUEA5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475650.mkv" },
  { name: "Tinker Bell y el tesoro perdido (2009)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475649.mkv" },
  { name: "Isle of Dogs (2010)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475648.mkv" },
  { name: "Aviones (2013)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475647.mkv" },
  { name: "Tinker Bell: Hadas y Piratas (2014)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475646.mkv" },
  { name: "Bob Esponja 3: Al Rescate (2020)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475645.mkv" },
  { name: "Dragon Ball Z: La Resurrección de Freezer (2015)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475644.mkv" },
  { name: "Los Supersonicos y la WWE Robo-WrestleMania 2017", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475643.mkv" },
  { name: "Bambi (1942)", group: "Películas | Infantil", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/475642.mkv" },
  { name: "La Tristeza (2021) (D)", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/4v9k8RsDyNReR1iM93CN8LyRteO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/558710.mp4" },
  { name: "Scream 6 (2023)", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/zh0JffFtxcWEJBLKayH3d34WnNT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/468302.mp4" },
  { name: "Carrie (2002)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461771.mkv" },
  { name: "Aliens (1982)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461770.mkv" },
  { name: "Mauvaise lune (2011)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461769.mkv" },
  { name: "Yo no soy un asesino en serie (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461767.mkv" },
  { name: "Mimic (1997)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461766.mkv" },
  { name: "Holocausto Caníbal (1980)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461765.mp4" },
  { name: "Posesiones (2022)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461764.mp4" },
  { name: "The Lodger 1944", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/doZfcApY5P66HENT1r2pb2Iyko8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461763.mkv" },
  { name: "En La Boca Del Miedo (1995)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461762.mkv" },
  { name: "No mires al Demonio (2022)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461761.mp4" },
  { name: "El Aro 0: Nacimiento (2000)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461759.mkv" },
  { name: "Dawning Of The Dead (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461758.mkv" },
  { name: "The Good Nanny (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461757.mkv" },
  { name: "Frankenstein (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461756.mkv" },
  { name: "Voraz (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461755.mkv" },
  { name: "La película de los Banana Splits (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461754.mkv" },
  { name: "Golem: La leyenda (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461753.mkv" },
  { name: "Silencio en el lago (2008)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461752.mkv" },
  { name: "Children of the Corn 2020", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/ooZbBL28oXDHfc8xSt2VRHU8jkO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461751.mkv" },
  { name: "El dia que me perdi 2020", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/moCnnkbzhMPp8YkxCakXDdi2Y5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461750.mkv" },
  { name: "Tokyo Ghoul (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461749.mkv" },
  { name: "El Abogado del Diablo (1997)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461748.mp4" },
  { name: "Deadsight (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461747.mkv" },
  { name: "Visions (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461746.mkv" },
  { name: "El Destripador La Historia no Contada (2021)\\" tvg-logo=\\"http://mundo2.pro:80/images/4657595be1c337e54df23b31f1a035ac.jpg\\" group-title=\\"⏩ TERROR PREMIUM ⏪\\",Jack, El Destripador La Historia no Contada (2021)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461744.mp4" },
  { name: "4 Halloween (2023)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461743.mkv" },
  { name: "Los misteriosos asesinatos de Limehouse (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461741.mkv" },
  { name: "Silencio (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461740.mkv" },
  { name: "Vuelo 7500 (2014)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461738.mkv" },
  { name: "Messe basse (2021)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461736.mkv" },
  { name: "Asesinos Del Mas Allá (1991)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461735.mkv" },
  { name: "El ataque del tiburón de dos cabezas (2012)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461734.mkv" },
  { name: "Cucuy: The Boogeyman (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461733.mkv" },
  { name: "La Cumbre Escarlata (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461732.mp4" },
  { name: "El Faro 2019", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/atwJGO4Ks8k9aUcGN968YFvnwbB.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461731.mkv" },
  { name: "Especies (1995)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461730.mkv" },
  { name: "Robert: El muñeco siniestro (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461729.mkv" },
  { name: "La Horca 2015", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/6wW5j1k6rN9s6jgwRKBqIHUs4wH.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461727.mp4" },
  { name: "The Reaping 1913", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461726.mkv" },
  { name: "Stop Over in Hell (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461725.mp4" },
  { name: "El Fin de los Tiempos (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461724.mkv" },
  { name: "Apolo 18 (2011)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461723.mp4" },
  { name: "Black Box (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461722.mkv" },
  { name: "Ladronas de Almas (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461721.mkv" },
  { name: "Salem’s Lot", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461720.mkv" },
  { name: "Delirium (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461718.mkv" },
  { name: "Cujo (1983)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461717.mkv" },
  { name: "Paranormal (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461716.mkv" },
  { name: "Cementerio de mascotas (1989)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461715.mkv" },
  { name: "La marca del demonio (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461714.mkv" },
  { name: "Miseria (1990)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461713.mkv" },
  { name: "Negra Navidad (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461712.mkv" },
  { name: "Puertas al infierno (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461711.mkv" },
  { name: "A garota com todos os dons (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461710.mkv" },
  { name: "Línea mortal: al límite (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461708.mp4" },
  { name: "Hush", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461707.mp4" },
  { name: "Apartamento 143 (2011)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461706.mkv" },
  { name: "Maldición Ancestral (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461705.mkv" },
  { name: "Jóvenes Brujas: La Nueva Hermandad (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461704.mkv" },
  { name: "Killer Commandos 1988", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461702.mkv" },
  { name: "Conspiración diabólica (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461701.mkv" },
  { name: "Iniciación (2021)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461700.mp4" },
  { name: "El exorcismo de Anna Ecklund (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461699.mkv" },
  { name: "Vienen por ti (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461697.mkv" },
  { name: "La casa del fin de los tiempos (2013)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461696.mkv" },
  { name: "Están entre nosotros (2004)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461695.mkv" },
  { name: "La masacre de Texas El origen de Leatherface 2017", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/94oFoEdRdg8Xlz4f5PvHY0SHZi5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461693.mkv" },
  { name: "Krampus (2012)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461692.mkv" },
  { name: "April Fool's Day (1997)", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461691.mkv" },
  { name: "Once Halloween 2 (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461689.mkv" },
  { name: "El despertar del miedo (2003)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461688.mkv" },
  { name: "Venus (2022)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461687.mp4" },
  { name: "El manicomio: La cuna del terror (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461686.mkv" },
  { name: "Containment (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461685.mkv" },
  { name: "El cazador de sueños (2003)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461684.mkv" },
  { name: "Pesadilla Siniestra (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461683.mkv" },
  { name: "Heredero del Diablo (2014)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461682.mkv" },
  { name: "Veronica (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461680.mkv" },
  { name: "Juguetes de Terror (2021)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461679.mkv" },
  { name: "Mira como corren (2022)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461678.mp4" },
  { name: "El bebé de Rosemary (1968)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461677.mkv" },
  { name: "Terror en Chernóbil (2012)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461676.mkv" },
  { name: "El Descenso: Parte 2 (2009)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461674.mkv" },
  { name: "Viuda de sangre 2014", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/y74qbogS4r32ypQIEBpzLR4bMtq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461672.mkv" },
  { name: "El camino del diablo (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461671.mkv" },
  { name: "La Noche de la Expiación (2013)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461670.mkv" },
  { name: "SACRIFICIO", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461669.mkv" },
  { name: "Halloween: El inicio (2007)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461668.mkv" },
  { name: "Halloween H2O: Veinte años después (1998)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461667.mkv" },
  { name: "Deadly Night 5 The Toy Maker 1991", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/aLFPTRcRUXZ6q68d50Bk1cHUH7i.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461666.mp4" },
  { name: "Midsommar: el terror no espera la noche (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461665.mkv" },
  { name: "Spontaneous (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461664.mp4" },
  { name: "El espinazo del diablo (2001)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461663.mkv" },
  { name: "Victor Frankenstein (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461662.mkv" },
  { name: "El Ciempiés Humano: Primera secuencia (2009)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461661.mp4" },
  { name: "Romina (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461660.mkv" },
  { name: "The Real Amityville Horror (2005)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461659.mkv" },
  { name: "Grito al Diablo (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461658.mkv" },
  { name: "Historias de miedo para contar en la oscuridad (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461657.mkv" },
  { name: "Los Muchachos Perdidos 3: La Sed (2010)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461656.mkv" },
  { name: "Muerte en el mar (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461655.mkv" },
  { name: "Belzebuth (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461654.mkv" },
  { name: "Maggie (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461653.mkv" },
  { name: "Mal de ojo 2020", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/3KVwganYfJgrLXu26BuW82BJo73.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461652.mkv" },
  { name: "Z (1969)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461651.mkv" },
  { name: "Los mensajeros 2 (2009)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461650.mkv" },
  { name: "La Dama de Negro (2012)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461648.mkv" },
  { name: "The Caller 2011", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/uO7yMRrHo1ruBa291b0pKhifqUx.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461647.mkv" },
  { name: "El Exorcismo De Dios (2022)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461646.mp4" },
  { name: "La monja 2005", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/pNJzVDTgr0ihebEaQU4xlxc2VT5.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461645.mkv" },
  { name: "Miedo a la Lluvia (2021)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461644.mp4" },
  { name: "La casa de los demonios (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461643.mkv" },
  { name: "Parte IV El ultimo capitulo 1984", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/tYSBsTqBR1FGBnahTf3ACyRM3gn.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461642.mkv" },
  { name: "Mandy (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461641.mkv" },
  { name: "El aro 3 2017", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/4tHz11wp4VxuhbqT1VAUHmyzmOT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461639.mkv" },
  { name: "Exorcismo en el Vaticano (2015)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461638.mkv" },
  { name: "DEFY2 Wolves At The Door (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461637.mkv" },
  { name: "El legado del diablo (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461636.mkv" },
  { name: "La Niña De La Mina (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461635.mkv" },
  { name: "La sirena: La leyenda jamás contada (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461634.mkv" },
  { name: "Cuentos de la oscuridad 1990", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/7YR0SU05k6F4LJStMxBvFk8NEis.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461633.mkv" },
  { name: "El Secreto del Bosque (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461632.mkv" },
  { name: "El cocodrilo 6: Legado (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461631.mkv" },
  { name: "Un demonio interior (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461630.mkv" },
  { name: "El exorcista: Creyentes (2023)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461629.mkv" },
  { name: "El aro 1998", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/o1RzJqZfjzkYHK81ZKp7b4YP6TI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461625.mkv" },
  { name: "Historias del barrio negro 2 (2018)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461624.mkv" },
  { name: "Alucinaciones del pasado (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461623.mp4" },
  { name: "Tiburones del río Mississippi (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461621.mkv" },
  { name: "El día del apocalipsis (2010)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461619.mkv" },
  { name: "La Leyenda de la Viuda (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461618.mp4" },
  { name: "Mentiras peligrosas (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461614.mkv" },
  { name: "Maligno (2019)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461613.mkv" },
  { name: "Terror en Silent Hill 2: La revelación (2012)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461612.mkv" },
  { name: "Battle of the Damned (2013)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461611.mp4" },
  { name: "Ouija 2: El origen del mal (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461610.mp4" },
  { name: "El aro 2 1999", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/7u8yJohwvS3ftF7nVepAWfwseQW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461609.mkv" },
  { name: "El Descenso (2005)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461608.mp4" },
  { name: "It Eso 2017", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w400/sSrj4lnhrb113DOPEPTaO2jaDk3.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461607.mkv" },
  { name: "El ascenso del diablo (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461606.mkv" },
  { name: "The Grudge 1.5 (2006)", group: "Películas | Terror", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461605.mkv" },
  { name: "Antibirth (2016)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461604.mkv" },
  { name: "La Condesa (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461603.mp4" },
  { name: "Actividad Paranormal 4 (2012)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461601.mkv" },
  { name: "Contactos de cuarto tipo (2009)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461600.mkv" },
  { name: "Still Born (2017)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461596.mkv" },
  { name: "Grindhouse (2007)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461594.mkv" },
  { name: "Al morir la matinée (2020)", group: "Películas | Terror", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/461593.mp4" },
  { name: "Herbie: Cupido motorizado (1997) (D)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/2V6aoZvvcjZcvT9050zuLa38jxW.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/560614.mp4" },
  { name: "Beethoven: Una aventura navideña (2011) (D)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/y9lB7wV0TGsuKsDj3JrlgegyIdh.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542658.mp4" },
  { name: "Beethoven y el tesoro del pirata (2014) (D)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/iORmyini1D3QwDkuTGYBYomskfc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542655.mp4" },
  { name: "Beethoven 6: La gran oportunidad (2008) (D)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/n6BFaobIdGWQhYI1uiq9gmY4FBq.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542652.mp4" },
  { name: "Beethoven 5: El perro buscatesoros (2003) (D)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/tyV3eGe7WmRr7Dai2BeWq33J1df.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542649.mp4" },
  { name: "Beethoven 4: Enredo en la familia (2001) (D)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/dvw8mJlEjxvBggoiAbiPkXfvbFO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542646.mp4" },
  { name: "Beethoven 3: De excursión con la familia (2000) (D)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1se0w1IwJj7APH94qwbnmgnHjI.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/542631.mp4" },
  { name: "Quien son los Miller 2013", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/e6ITLpsQP9FMBF4jDyvHpWUYV64.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464234.mkv" },
  { name: "Cantantes en guerra (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464233.mkv" },
  { name: "Pork Pie (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464230.mkv" },
  { name: "Amar (2009)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464228.mkv" },
  { name: "En las rocas (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464227.mkv" },
  { name: "HIGH", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464226.mkv" },
  { name: "Mi Primer Beso (1991)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464225.mkv" },
  { name: "Sextillizos (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464224.mkv" },
  { name: "Bajo el sol de Riccione (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464223.mkv" },
  { name: "Five (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464222.mkv" },
  { name: "The Buckett List (2020)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464221.mkv" },
  { name: "Modern Life Is Rubbish (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464218.mkv" },
  { name: "La Casa de Huéspedes (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464216.mkv" },
  { name: "Un detective en el kinder 2 (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464215.mkv" },
  { name: "Rebelión de los Godínez (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464214.mkv" },
  { name: "Sintonía de amor (1993)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464213.mkv" },
  { name: "A La Mierda Con Los Zombis (2015)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464212.mkv" },
  { name: "When We First Met (1984)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464211.mkv" },
  { name: "Todo Mal (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464210.mkv" },
  { name: "El dia llegara 2019", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/rk3Z0X5SnkwimBZj2AQjb5DHHI1.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464209.mkv" },
  { name: "Stockholm (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464208.mkv" },
  { name: "Inclina Navidad de lucha (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464207.mkv" },
  { name: "Money Trap (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464206.mkv" },
  { name: "El día que me muera (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464205.mkv" },
  { name: "Esperando la carroza (1985)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464203.mkv" },
  { name: "Amor y otras drogas 2010", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/bzXczujSYdsddv9FZBmVhPUN65z.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464201.mkv" },
  { name: "Pepe (1960)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464200.mkv" },
  { name: "Night Before (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464199.mkv" },
  { name: "Misión Secreta (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464198.mkv" },
  { name: "Mi abuela (2015)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464197.mkv" },
  { name: "Love Locks (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464196.mkv" },
  { name: "Un gran mentiroso 2 (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464195.mkv" },
  { name: "Todos a Bailar 2011", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/o6aYS5DEN58E3lVe4BIb2b1Fidl.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464194.mkv" },
  { name: "Mi otro yo (2013)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464193.mkv" },
  { name: "Ni en tus suenos 2019", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/d5SjdpTAyn0zLzJYSAJ1AzosHh8.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464192.mkv" },
  { name: "Un hombre ordinario (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464191.mkv" },
  { name: "Eres mi pasión (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464189.mkv" },
  { name: "Puente de espías (2015)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464188.mp4" },
  { name: "Loca Academia De Policía 2: Su Primera Misión (1985)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464187.mkv" },
  { name: "Scooby-Doo! y el Fantasma Gourmet (2018)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/wcvGYgGGh4bAGQ2aC1dgcIO5daJ.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464186.mkv" },
  { name: "Grandes Amigos (2015)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464184.mkv" },
  { name: "Cazando Salvajes (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464182.mkv" },
  { name: "Que Paso Ayer Parte II 2011", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/u8B1a1AEhZ0k2mvPvzOYSJDnlge.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464181.mp4" },
  { name: "Quick Change (2013)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464180.mkv" },
  { name: "En qué Piensan los Hombres 2 (2014)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464179.mkv" },
  { name: "Sandy Wexler (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464178.mkv" },
  { name: "Las aventuras de Jim West 1999", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/ouXYnBoBKZO8tiZrj2qK1c5308O.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464177.mkv" },
  { name: "Nunca entre amigos (2015)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464176.mkv" },
  { name: "Trabajo Sucio (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464174.mkv" },
  { name: "Héroe a la fuerza (1941)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464173.mkv" },
  { name: "Cuando Harry conoció a Sally (1989)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464172.mkv" },
  { name: "Xun zhao Cheng Long 2009", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464171.mkv" },
  { name: "Evitando el Amor (2013)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464170.mkv" },
  { name: "Beetlejuice 2", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/kWJw7dCWHcfMLr0irTHAPIKrJ4I.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464169.mkv" },
  { name: "Probable Asesino (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464168.mkv" },
  { name: "Despido procedente (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464166.mkv" },
  { name: "La boda de Valentina (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464165.mkv" },
  { name: "Y donde esta el policia 2 12 1991", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464164.mkv" },
  { name: "5 Weddings (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464163.mkv" },
  { name: "Definitivamente (Talvez) (2022)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464160.mkv" },
  { name: "Tenacious D: La Pua del Destino (2006)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/1jGeMgWa1FkFwfNzZq3X0frgdNc.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464158.mkv" },
  { name: "¡He matado a mi marido! (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464157.mkv" },
  { name: "20 Años No Importan (2013)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464156.mkv" },
  { name: "Ha vuelto (2015)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464155.mkv" },
  { name: "Pequeño demonio (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464154.mkv" },
  { name: "Diecisiete (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464153.mkv" },
  { name: "Jingle All the Way (2011)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464152.mkv" },
  { name: "16 Deseos (2010)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464151.mkv" },
  { name: "Banana Split Un Postre Compartido (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464150.mkv" },
  { name: "Una noche de locura (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464149.mkv" },
  { name: "Laggies (2014)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464148.mkv" },
  { name: "Baby: El aprendiz del crimen (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464147.mkv" },
  { name: "Soy Yo 2010", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/5vTTejFAV6EKjZsoFlPGTUyIsES.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464146.mkv" },
  { name: "Operación Elefante (1995)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464145.mkv" },
  { name: "Los Fantasmas de mis Ex (2009)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464144.mkv" },
  { name: "Fe de etarras (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464143.mkv" },
  { name: "La ultima chica 2015", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/qWYt9JKWOt03yvG6nV4Hg9tju5h.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464142.mkv" },
  { name: "Solteras (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464141.mkv" },
  { name: "La Verdad Sobre las Mentiras (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464140.mkv" },
  { name: "Ayuda del grupo (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464139.mkv" },
  { name: "Una Mente Canina (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464138.mkv" },
  { name: "Election 1999", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/8OetgQOUc4VRhj2tgjOUWwywh9K.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464137.mkv" },
  { name: "Paulette (2012)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464136.mkv" },
  { name: "La última fiesta (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464135.mkv" },
  { name: "Kingpin (1985)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464134.mkv" },
  { name: "La Acompanante 2015", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/wtugqbc1KelBti5zhWdlKsb8urT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464133.mkv" },
  { name: "Pequeñas Zorras (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464132.mkv" },
  { name: "Primavera (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464131.mkv" },
  { name: "El Buen Sam (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464130.mkv" },
  { name: "Paddington (2014)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464129.mkv" },
  { name: "Mujeres arriba (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464128.mkv" },
  { name: "2011", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464127.mkv" },
  { name: "Stuber: Locos al volante (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464126.mkv" },
  { name: "El Supersabio (1948)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464125.mkv" },
  { name: "Secuestro en Venice (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464124.mkv" },
  { name: "Realmente amor (2003)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464123.mkv" },
  { name: "Los anos azules 2017", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/f8ixMOIEmXqW0sI8Gcp9H9EO8Ft.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464122.mkv" },
  { name: "A toda madre (2012)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464121.mkv" },
  { name: "Un Hombre a la Altura (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464120.mkv" },
  { name: "Fin de curso (2011)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464119.mkv" },
  { name: "Yo y El 2018", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/rpAkySUQOe8H3yw1DDO5VnJwMws.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464118.mkv" },
  { name: "Hear No Evil (2014)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464116.mkv" },
  { name: "Dobles vidas (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464113.mkv" },
  { name: "the Spy 2000", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/6QyOlwOMojFcdaLBSqSGhpQETfG.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464112.mkv" },
  { name: "The D Train 2015", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/34sJQxmJT42jioSiabF5QobG0NC.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464111.mkv" },
  { name: "Excess Baggage (1928)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464110.mkv" },
  { name: "Espias como nosotros 1985", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/7mJJnqQhwFJJGXk7guEawNn8nui.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464109.mkv" },
  { name: "Simone (2013)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464108.mkv" },
  { name: "Hotel Transylvania 3: Monstruos de vacaciones (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464107.mkv" },
  { name: "Texas 1999", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/rEswYdWlg7pV9CR7yHcQVM5QePT.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464106.mkv" },
  { name: "Pequeño cupido (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464105.mkv" },
  { name: "Gracias por compartir (2013)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464104.mkv" },
  { name: "The Marrying Man 1991", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/rGxfycd0jI3JKd1oJ5t93407gU0.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464103.mkv" },
  { name: "El Super Agente 86 (2008)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464102.mkv" },
  { name: "Casi fiel (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464101.mkv" },
  { name: "Los Cazanovias (2005)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464100.mkv" },
  { name: "Tripulación Dave (2008)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464099.mkv" },
  { name: "Alex Strangelove (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464098.mkv" },
  { name: "Las toninas van al Este (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464097.mkv" },
  { name: "Peluda Venganza (2010)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464096.mkv" },
  { name: "Greed Ambicion 2020", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/mZPmDFlVp1BSGQD4QCKHOwbXLfv.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464095.mkv" },
  { name: "Shifting Gears (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464094.mkv" },
  { name: "Tiro al blanco (1990)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464093.mkv" },
  { name: "Welcome to the Jungle (2007)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464091.mkv" },
  { name: "Delincuente (1984)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464090.mkv" },
  { name: "Duelo de Pasiones (1996)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464089.mkv" },
  { name: "Locuras de verano (2009)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464088.mkv" },
  { name: "Las aventuras de Timmy Fracaso (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464087.mkv" },
  { name: "Game Night (2021)", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w600_and_h900_bestv2", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464086.mkv" },
  { name: "Los Mios y Los Nuestros 2005", group: "Películas | Comedia", logo: "https://image.tmdb.org/t/p/w400/pjrZSAKsnA7IlCOsVEZkntsNXqO.jpg", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464085.mkv" },
  { name: "Una navidad en apuros (2014)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464084.mkv" },
  { name: "La boda de mi mejor amigo (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464083.mkv" },
  { name: "A Cinderella Christmas (2016)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464082.mkv" },
  { name: "Intercambio de Princesas 2 (2020)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464081.mkv" },
  { name: "Mis otros yo (1996)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464080.mkv" },
  { name: "Amor en obras (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464079.mkv" },
  { name: "Le manoir (2003)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464078.mkv" },
  { name: "Problemos (2017)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464077.mkv" },
  { name: "Te Juro Que Yo No Fui (2018)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464076.mkv" },
  { name: "Guardería de Ancianos (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464075.mkv" },
  { name: "My Boyfriend's Back: Wedding March 5 (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464074.mkv" },
  { name: "La Nueva Filosofía de Phil (2019)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464072.mkv" },
  { name: "Chicas Pesadas 2 (2011)", group: "Películas | Comedia", logo: "", url: "http://goldtv.lat:8080/movie/CSM_JULIO/Julionova/464071.mkv" },
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
    "http://190.14.238.117:8000/play/a035/index.m3u8",
    "http://181.118.153.15:8000/play/zu33/index.m3u8?hls",
    "http://181.78.8.199:8000/play/a0ah/index.m3u8",
    "http://181.209.38.115:8000/play/a06g/index.m3u8",
    "http://181.209.80.115:8000/hls/adult_swim_hd/index.m3u8",
  ],
  adultswim: [
    "http://190.14.238.117:8000/play/a035/index.m3u8",
    "http://181.118.153.15:8000/play/zu33/index.m3u8?hls",
    "http://181.78.8.199:8000/play/a0ah/index.m3u8",
    "http://181.209.38.115:8000/play/a06g/index.m3u8",
    "http://181.209.80.115:8000/hls/adult_swim_hd/index.m3u8",
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
    const logoVersion = ch.logoVersion ? `?v=${encodeURIComponent(ch.logoVersion)}` : "";
    const logoUrl = `${baseUrl}/logos/${ch.chno}.png${logoVersion}`;
    lines.push(
      `#EXTINF:-1 tvg-name="${ch.name}"${chNo} tvg-logo="${logoUrl}" group-title="${ch.group}",${ch.name}`
    );

    const streamUrl = ch.directUrl || `${baseUrl}/live.m3u8?slug=${ch.slug}&key=${apiKey}`;
    lines.push(streamUrl);
  }

  // ─── VOD Películas (GoldTV) ──────────────────────────────────────────────────
  if (!filterGroup) {
    for (const movie of VOD_MOVIES) {
      const logo = movie.logo || "";
      lines.push(
        `#EXTINF:-1 tvg-name="${movie.name}" tvg-logo="${logo}" group-title="${movie.group}",${movie.name}`
      );
      lines.push(movie.url);
    }
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
    const sourceKey = index === 0 ? streamKey : `${streamKey}:backup-${index}`;
    const needsWarmup = index === 0 && (streamKey === "adult-swim" || streamKey === "adultswim");
    const attempts = needsWarmup ? 8 : 1;

    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await resolveHlsStream(sourceUrl, sourceKey);
      } catch (err) {
        const emptyWarmup = err.message.includes("sin fragmentos") && attempt < attempts - 1;
        if (emptyWarmup) {
          await new Promise((resolve) => setTimeout(resolve, 750));
          continue;
        }
        errors.push(`${sourceUrl}: ${err.message}`);
        break;
      }
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

// ─── StreamTP Dynamic Resolver (Disney+ / Star+ Event Feeds) ─────────────────
const streamTpCache = new Map();
const STREAMTP_TOKEN_TTL = 10 * 60 * 1000;
const STREAMTP_MANIFEST_TTL = 1500;

export async function resolveStreamTPM3U8(
  streamId,
  proxyBaseUrl = null,
  apiKey = API_KEY_DEFAULT,
  forceRefresh = false,
) {
  const now = Date.now();
  const cacheKey = `streamtp_${streamId}_${proxyBaseUrl ? "proxy" : "raw"}`;
  if (forceRefresh) {
    streamTpCache.delete(streamId);
    manifestCache.delete(cacheKey);
  }
  const cachedManifest = manifestCache.get(cacheKey);
  if (cachedManifest && now - cachedManifest.time < STREAMTP_MANIFEST_TTL && cachedManifest.content) {
    return cachedManifest.content;
  }

  let masterUrl = null;
  const cachedToken = streamTpCache.get(streamId);
  if (cachedToken && now - cachedToken.time < STREAMTP_TOKEN_TTL && cachedToken.url) {
    masterUrl = cachedToken.url;
  } else {
    const pageUrl = `https://streamtp-golden1.click/global1.php?stream=${streamId}`;
    const pageRes = await fetch(pageUrl, {
      headers: {
        "user-agent": UA,
        "referer": "https://playvi.org/",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!pageRes.ok) throw new Error(`StreamTP retornó HTTP ${pageRes.status}`);
    const html = await pageRes.text();
    const m = html.match(/playbackURL\s*=\s*["']([^"']+)["']/);
    if (!m) throw new Error(`No se encontró playbackURL para ${streamId}`);
    masterUrl = m[1].replace(/\\\//g, "/");
    streamTpCache.set(streamId, { url: masterUrl, time: now });
  }

  const res = await fetch(masterUrl, {
    headers: { "user-agent": UA, "referer": "https://streamtp-golden1.click/" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) {
    streamTpCache.delete(streamId);
    throw new Error(`StreamTP master retornó HTTP ${res.status}`);
  }
  const text = await res.text();
  let subUrl = masterUrl;
  let subText = text;

  if (text.includes("#EXT-X-STREAM-INF")) {
    const subLine = text.split("\n").find(l => l.trim() && !l.trim().startsWith("#"));
    if (subLine) {
      const base = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);
      subUrl = subLine.trim().startsWith("http") ? subLine.trim() : `${base}${subLine.trim()}`;
      const subRes = await fetch(subUrl, {
        headers: { "user-agent": UA, "referer": "https://streamtp-golden1.click/" },
        signal: AbortSignal.timeout(6000),
      });
      if (subRes.ok) subText = await subRes.text();
    }
  }

  const subBase = subUrl.substring(0, subUrl.lastIndexOf("/") + 1);
  const segmentCount = subText
    .split("\n")
    .filter((line) => line.trim() && !line.trim().startsWith("#"))
    .length;
  const outLines = [];
  let segmentIndex = 0;
  for (const line of subText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) {
      outLines.push(trimmed);
    } else {
      const fullTs = trimmed.startsWith("http") ? trimmed : `${subBase}${trimmed}`;
      outLines.push(proxySegmentUrl(
        fullTs,
        "https://streamtp-golden1.click/",
        streamId,
        segmentIndex - segmentCount,
        proxyBaseUrl,
        apiKey,
      ));
      segmentIndex += 1;
    }
  }
  const finalM3u8 = outLines.join("\n");
  manifestCache.set(cacheKey, { content: finalM3u8, time: now });
  return finalM3u8;
}

// ─── Capo Deportes Dynamic Resolver (Instreams / In-streams CA1) ─────────────
const capoCache = new Map();
const CAPO_TOKEN_TTL = 10 * 60 * 1000;
const CAPO_MANIFEST_TTL = 1500;

export async function resolveCapoM3U8(streamId = "CA1") {
  const now = Date.now();
  const cacheKey = `capo_${streamId}`;
  const cachedManifest = manifestCache.get(cacheKey);
  if (cachedManifest && now - cachedManifest.time < CAPO_MANIFEST_TTL && cachedManifest.content) {
    return cachedManifest.content;
  }

  let streamM3u8 = null;
  const cached = capoCache.get(streamId);
  if (cached && now - cached.time < CAPO_TOKEN_TTL && cached.url) {
    streamM3u8 = cached.url;
  } else {
    const pageUrl = `https://in-streams.click/capo.php?stream=${streamId}`;
    const pageRes = await fetch(pageUrl, {
      headers: { "user-agent": UA, "referer": "https://playvi.org/" },
      signal: AbortSignal.timeout(6000),
    });
    if (!pageRes.ok) throw new Error(`In-streams retornó HTTP ${pageRes.status}`);
    const html = await pageRes.text();
    const m = html.match(/https:\/\/instreams\.[^"'\s<>]+\.m3u8\?[^"'\s<>]+/);
    if (!m) throw new Error("No se encontró instreams m3u8 para Capo Deportes");
    streamM3u8 = m[0].replace(/\\u0026/g, "&");
    capoCache.set(streamId, { url: streamM3u8, time: now });
  }

  const res = await fetch(streamM3u8, {
    headers: { "user-agent": UA, "referer": "https://in-streams.click/" },
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) {
    capoCache.delete(streamId);
    throw new Error(`Capo manifest retornó HTTP ${res.status}`);
  }
  const text = await res.text();
  const base = streamM3u8.substring(0, streamM3u8.lastIndexOf("/") + 1);
  const outLines = [];
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) {
      outLines.push(trimmed);
    } else {
      const fullTs = trimmed.startsWith("http") ? trimmed : `${base}${trimmed}`;
      outLines.push(fullTs);
    }
  }
  const finalM3u8 = outLines.join("\n");
  manifestCache.set(cacheKey, { content: finalM3u8, time: now });
  return finalM3u8;
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

  // 2. Capo Deportes (Instreams CA1)
  if (cleanSlug === "capodeportes" || cleanSlug === "capo-deportes" || cleanSlug === "ca1") {
    try {
      return await resolveCapoM3U8("CA1");
    } catch (err) {
      console.warn(`[Capo Deportes Error]:`, err.message);
    }
  }

  // 3. Disney+ / Star+ Event Streams (StreamTP: disney1 .. disney10)
  if (cleanSlug.startsWith("disney") || cleanSlug.startsWith("streamtp-")) {
    try {
      const streamId = cleanSlug.replace("streamtp-", "");
      return await resolveStreamTPM3U8(streamId, proxyBaseUrl, apiKey);
    } catch (err) {
      console.warn(`[StreamTP Disney+ Error] ${cleanSlug}:`, err.message);
    }
  }

  // 4. PelotaLibre / TVF90 1080p Flussonic cluster (fallback)
  const tvf90Id = TVF90_MAP[cleanSlug];
  if (tvf90Id) {
    try {
      return await resolveTvf90M3U8(tvf90Id, cleanSlug, proxyBaseUrl, apiKey);
    } catch (err) {
      console.warn(`[TVF90 fallback] ${cleanSlug} (${tvf90Id}):`, err.message);
    }
  }

  // 5. Direct stream ID (e.g. H94, H95, H96) or mapped slug
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

  // 6. Fallback to tvplusgratis handshake if exists
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
