# Televisor Server 📺

Servidor cloud auto-actualizable para streaming de TV en vivo. Desplegado en Render.com (gratis 24/7).

## Rutas disponibles

Todas las rutas requieren autenticación con `?key=TU_API_KEY` o header `X-API-Key`.

| Ruta | Descripción |
|---|---|
| `/lista.m3u` | Lista completa de canales |
| `/deportes.m3u` | Solo canales deportivos |
| `/peru.m3u` | Solo canales peruanos |
| `/eventos.m3u` | Eventos en vivo de pirlotv.la (se actualiza cada 5 min) |
| `/live.m3u8?slug=espn` | Stream directo de un canal |
| `/health` | Health check |

## Cómo usar

### En VLC
```
Media → Abrir URL de red → https://televisor-proxy.onrender.com/eventos.m3u?key=TU_KEY
```

### En Smart TV (TiViMate, IPTV Smarters)
```
URL: https://televisor-proxy.onrender.com/lista.m3u?key=TU_KEY
```

### En el navegador
```
https://televisor-proxy.onrender.com/eventos.m3u?key=TU_KEY
```

## Arquitectura

```
pirlotv.la/home.php
  → Eventos en vivo con canales
  → Cada canal: playvi.org → live4.lat/streamx305.sbs
  → streamx305: JS ofuscado con array ne[] + decode k1+k2
  → Stream real: envivoslatam99.sbs/global/{canal}/index.m3u8
```

## Variables de entorno (Render)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (default 10000) |
| `API_KEY` | Clave de acceso (generada automáticamente) |
| `SERVER_URL` | URL pública del servidor en Render |
