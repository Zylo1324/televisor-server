# Multi-stage Docker build for Hugging Face Spaces
FROM rust:1.80-slim as builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src

RUN cargo build --release

# Final runtime container
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

# Hugging Face runs with non-root user 1000
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PORT=7860 \
    RUST_LOG=info

WORKDIR /app
COPY --from=builder /app/target/release/televisor-server /app/televisor-server

EXPOSE 7860

CMD ["/app/televisor-server"]
