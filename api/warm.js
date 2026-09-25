// api/warm.js — Pre-warmer to keep top channel resolvers hot in memory
import { fetchLiveStreamM3U8, getBaseUrl } from "./_core.js";

const TOP_CHANNELS = [
  "movistardeportes",
  "foxsports1",
  "foxsports2",
  "foxsports3",
  "dsports",
  "dsports2",
  "dsportsplus",
  "liga1max",
  "espnpremium",
  "claro-sports",
  "tntsports",
  "winplus",
  "tycsports",
  "paramount",
  "adult-swim",
  "capodeportes",
  "disney7",
];

export default async function handler(req, res) {
  const start = Date.now();
  const results = {};
  const baseUrl = getBaseUrl(req);
  const apiKey = process.env.API_KEY || "televisor2024";

  await Promise.allSettled(
    TOP_CHANNELS.map(async (slug) => {
      try {
        const t0 = Date.now();
        await fetchLiveStreamM3U8(slug, "127.0.0.1", baseUrl, apiKey);
        results[slug] = `${Date.now() - t0}ms OK`;
      } catch (err) {
        results[slug] = `FAIL: ${err.message}`;
      }
    })
  );

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-cache");
  res.status(200).json({
    status: "pre-warmed",
    totalElapsed: `${Date.now() - start}ms`,
    channels: results
  });
}
