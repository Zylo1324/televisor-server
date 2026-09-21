---
title: Televisor Server
emoji: 📺
colorFrom: red
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Televisor Server 📺

Servidor cloud auto-actualizable para streaming de TV en vivo. Desplegado en Hugging Face Spaces (gratis 24/7, sin tarjeta).

## Rutas disponibles

Todas las rutas requieren autenticación con `?key=TU_API_KEY` o header `X-API-Key`.

| Ruta | Descripción |
|---|---|
| `/lista.m3u` | Lista completa de canales |
| `/deportes.m3u` | Solo canales deportivos |
| `/peru.m3u` | Solo canales peruanos |
| `/eventos.m3u` | Eventos en vivo de pirlotv.la divididos por partido (auto-actualizado) |
| `/live.m3u8?slug=espn` | Stream directo con auto-renovación |
| `/health` | Health check |

## Cómo usar en reproductores

### En VLC
```text
Media → Abrir emisión de red → https://TU-ESPACIO.hf.space/eventos.m3u?key=televisor2024
```

### En Smart TV (TiViMate, IPTV Smarters)
```text
URL M3U: https://TU-ESPACIO.hf.space/lista.m3u?key=televisor2024
```
