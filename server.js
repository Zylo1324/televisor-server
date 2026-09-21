import http from "node:http";
import listaHandler from "./api/lista.js";
import deportesHandler from "./api/deportes.js";
import peruHandler from "./api/peru.js";
import eventosHandler from "./api/eventos.js";
import liveHandler from "./api/live.js";
import pirlotvHandler from "./api/pirlotv.js";
import streamHandler from "./api/stream.js";
import healthHandler from "./api/health.js";

const PORT = process.env.PORT || 10002;

const server = http.createServer(async (req, res) => {
  // Polyfill status, send, redirect
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (body) => {
    res.end(body);
  };
  res.redirect = (status, url) => {
    res.writeHead(status, { Location: url });
    res.end();
  };

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  if (pathname === "/health") {
    return healthHandler(req, res);
  }
  if (pathname === "/lista.m3u" || pathname === "/api/lista") {
    return listaHandler(req, res);
  }
  if (pathname === "/deportes.m3u" || pathname === "/api/deportes") {
    return deportesHandler(req, res);
  }
  if (pathname === "/peru.m3u" || pathname === "/api/peru") {
    return peruHandler(req, res);
  }
  if (pathname === "/pirlotv.m3u" || pathname === "/api/pirlotv") {
    return pirlotvHandler(req, res);
  }
  if (pathname === "/eventos.m3u" || pathname === "/api/eventos") {
    return eventosHandler(req, res);
  }
  if (pathname === "/live.m3u8" || pathname === "/api/live") {
    return liveHandler(req, res);
  }
  if (pathname === "/stream.m3u8" || pathname === "/api/stream") {
    return streamHandler(req, res);
  }

  res.status(404).send("Not Found");
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
