import test from "node:test";
import assert from "node:assert/strict";
import {
  CHANNELS,
  generateM3U,
  resolveHlsStream,
  resolveHlsStreamWithFallback,
} from "../api/_core.js";

function mediaPlaylist(sequence, count = 8) {
  return [
    "#EXTM3U",
    "#EXT-X-VERSION:3",
    `#EXT-X-MEDIA-SEQUENCE:${sequence}`,
    "#EXT-X-TARGETDURATION:3",
    ...Array.from({ length: count }, (_, index) => [
      "#EXTINF:2.9,",
      `segment-${sequence + index}.ts`,
    ]).flat(),
  ].join("\n");
}

test("direct HLS preserves upstream sequence and reuses the variant URL", async () => {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = 1000;
  let sequence = 100;
  const calls = [];
  Date.now = () => now;
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url === "https://origin.example/master.m3u8") {
      return new Response("#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1000000\nvariant.m3u8");
    }
    assert.equal(url, "https://origin.example/variant.m3u8");
    return new Response(mediaPlaylist(sequence));
  };

  try {
    const first = await resolveHlsStream("https://origin.example/master.m3u8", "test-direct-sequence");
    assert.match(first, /#EXT-X-MEDIA-SEQUENCE:101\n/);
    assert.match(first, /https:\/\/origin\.example\/segment-106\.ts/);
    assert.doesNotMatch(first, /segment-107\.ts/);
    assert.doesNotMatch(first, /#EXT-X-START/);
    assert.equal(calls.length, 2);

    now = 3000;
    sequence = 108;
    const second = await resolveHlsStream("https://origin.example/master.m3u8", "test-direct-sequence");
    assert.match(second, /#EXT-X-MEDIA-SEQUENCE:109\n/);
    assert.equal(calls.length, 3);
    assert.equal(calls[2], "https://origin.example/variant.m3u8");
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
});

test("expired variant falls back to a fresh master playlist", async () => {
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = 1000;
  let variantFails = false;
  const calls = [];
  Date.now = () => now;
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url === "https://origin.example/fallback.m3u8") {
      return new Response("#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=1000000\nfallback-variant.m3u8");
    }
    assert.equal(url, "https://origin.example/fallback-variant.m3u8");
    if (variantFails) {
      variantFails = false;
      return new Response("Not found", { status: 404 });
    }
    return new Response(mediaPlaylist(200, 4));
  };

  try {
    await resolveHlsStream("https://origin.example/fallback.m3u8", "test-direct-fallback");
    now = 3000;
    variantFails = true;
    const refreshed = await resolveHlsStream("https://origin.example/fallback.m3u8", "test-direct-fallback");
    assert.match(refreshed, /#EXT-X-MEDIA-SEQUENCE:200\n/);
    assert.deepEqual(calls.slice(-3), [
      "https://origin.example/fallback-variant.m3u8",
      "https://origin.example/fallback.m3u8",
      "https://origin.example/fallback-variant.m3u8",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
  }
});

test("direct HLS uses its next source when the primary fails", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(url);
    if (url === "https://primary.example/master.m3u8") {
      return { ok: false, status: 503, url, text: async () => "Unavailable" };
    }
    if (url === "https://backup.example/master.m3u8") {
      return new Response("#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=3000000\nvideo/1080.m3u8");
    }
    assert.equal(url, "https://backup.example/video/1080.m3u8");
    return new Response(mediaPlaylist(300, 4));
  };

  try {
    const result = await resolveHlsStreamWithFallback([
      "https://primary.example/master.m3u8",
      "https://backup.example/master.m3u8",
    ], "test-source-fallback");
    assert.deepEqual(calls, [
      "https://primary.example/master.m3u8",
      "https://backup.example/master.m3u8",
      "https://backup.example/video/1080.m3u8",
    ]);
    assert.match(result, /#EXT-X-MEDIA-SEQUENCE:300/);
    assert.match(result, /https:\/\/backup\.example\/video\/segment-302\.ts/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the main playlist gives every channel a same-origin PNG logo", () => {
  const m3u = generateM3U(null, "https://televisor.example", "key");
  const logoLines = m3u.split("\n").filter((line) => line.startsWith("#EXTINF"));
  assert.equal(logoLines.length, CHANNELS.length);
  for (const channel of CHANNELS) {
    assert.ok(logoLines.some((line) => line.includes(
      `tvg-chno="${channel.chno}" tvg-logo="https://televisor.example/logos/${channel.chno}.png"`,
    )));
  }
});
