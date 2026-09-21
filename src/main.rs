mod pirlotv;
mod channels;

use axum::{
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    routing::get,
    Router,
};
use std::{
    collections::HashMap,
    sync::Arc,
    time::Duration,
};
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

// ─── shared state ────────────────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    api_key: String,
    http: reqwest::Client,
}

// ─── main ────────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
        )
        .init();

    let port = std::env::var("PORT").unwrap_or_else(|_| "10000".into());
    let api_key = std::env::var("API_KEY").unwrap_or_else(|_| "televisor2024".into());

    let http = reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36")
        .timeout(Duration::from_secs(15))
        .gzip(true)
        .build()
        .expect("http client");

    let state = Arc::new(AppState { api_key, http });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/health", get(health))
        .route("/lista.m3u",    get(route_lista))
        .route("/deportes.m3u", get(route_deportes))
        .route("/peru.m3u",     get(route_peru))
        .route("/eventos.m3u",  get(route_eventos))
        .route("/live.m3u8",    get(route_live))
        .layer(cors)
        .with_state(state);

    let addr = format!("0.0.0.0:{port}");
    info!("🚀 Servidor arrancado en http://{addr}");
    let listener = TcpListener::bind(&addr).await.expect("bind");
    axum::serve(listener, app).await.expect("serve");
}

// ─── auth helper ─────────────────────────────────────────────────────────────

fn check_auth(state: &AppState, headers: &HeaderMap, params: &HashMap<String, String>) -> bool {
    // Accept key via header X-API-Key OR query param ?key=
    let from_header = headers
        .get("x-api-key")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("");
    let from_query = params.get("key").map(|s| s.as_str()).unwrap_or("");
    from_header == state.api_key || from_query == state.api_key
}

fn unauthorized() -> Response {
    (StatusCode::UNAUTHORIZED, "401 Unauthorized — pasa ?key=TU_API_KEY\n").into_response()
}

fn get_base_url(headers: &HeaderMap) -> String {
    if let Ok(server_url) = std::env::var("SERVER_URL") {
        if !server_url.is_empty() {
            return server_url;
        }
    }
    let proto = headers
        .get("x-forwarded-proto")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("https");
    let host = headers
        .get("x-forwarded-host")
        .or_else(|| headers.get("host"))
        .and_then(|v| v.to_str().ok())
        .unwrap_or("localhost:7860");

    format!("{}://{}", proto, host)
}

// ─── routes ──────────────────────────────────────────────────────────────────

async fn health() -> &'static str {
    "OK"
}

async fn route_lista(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Query(params): Query<HashMap<String, String>>,
) -> Response {
    if !check_auth(&state, &headers, &params) { return unauthorized(); }
    let base_url = get_base_url(&headers);
    let m3u = channels::generate_m3u(None, &base_url, &state.api_key);
    m3u_response(m3u)
}

async fn route_deportes(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Query(params): Query<HashMap<String, String>>,
) -> Response {
    if !check_auth(&state, &headers, &params) { return unauthorized(); }
    let base_url = get_base_url(&headers);
    let m3u = channels::generate_m3u(Some("Deportes"), &base_url, &state.api_key);
    m3u_response(m3u)
}

async fn route_peru(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Query(params): Query<HashMap<String, String>>,
) -> Response {
    if !check_auth(&state, &headers, &params) { return unauthorized(); }
    let base_url = get_base_url(&headers);
    let m3u = channels::generate_m3u(Some("Peru"), &base_url, &state.api_key);
    m3u_response(m3u)
}

async fn route_eventos(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Query(params): Query<HashMap<String, String>>,
) -> Response {
    if !check_auth(&state, &headers, &params) { return unauthorized(); }

    match pirlotv::fetch_eventos_m3u(&state.http).await {
        Ok(m3u) => m3u_response(m3u),
        Err(e) => {
            tracing::error!("Error scraping pirlotv: {e}");
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Error al obtener eventos: {e}\n"),
            )
                .into_response()
        }
    }
}

#[derive(serde::Deserialize)]
struct LiveParams {
    slug: Option<String>,
    key: Option<String>,
}

async fn route_live(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Query(params): Query<LiveParams>,
) -> Response {
    // Auth via query key or header
    let key_ok = params.key.as_deref() == Some(state.api_key.as_str())
        || headers
            .get("x-api-key")
            .and_then(|v| v.to_str().ok())
            == Some(state.api_key.as_str());
    if !key_ok {
        return unauthorized();
    }

    let slug = match &params.slug {
        Some(s) => s.clone(),
        None => return (StatusCode::BAD_REQUEST, "Falta ?slug=canal\n").into_response(),
    };

    match channels::resolve_tvplusgratis_stream(&state.http, &slug).await {
        Ok(m3u8_url) => {
            // Redirect the client to the real M3U8 URL (302)
            (
                StatusCode::FOUND,
                [(axum::http::header::LOCATION, m3u8_url)],
                "",
            )
                .into_response()
        }
        Err(e) => (
            StatusCode::BAD_GATEWAY,
            format!("No se pudo resolver stream: {e}\n"),
        )
            .into_response(),
    }
}

fn m3u_response(body: String) -> Response {
    (
        StatusCode::OK,
        [
            ("content-type", "application/x-mpegurl; charset=utf-8"),
            ("cache-control", "no-cache, no-store, must-revalidate"),
        ],
        body,
    )
        .into_response()
}
