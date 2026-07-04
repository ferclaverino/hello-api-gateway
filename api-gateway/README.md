# api-gateway

A round-robin load balancing proxy built with Fastify.

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

The gateway starts on `http://127.0.0.1:3000` by default.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /hello` | Proxied to a backend via round-robin |
| `GET /health` | Returns gateway status and backend list |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `127.0.0.1` | Bind address |
| `BACKENDS` | — | Comma-separated backend URLs (e.g. `http://127.0.0.1:3001,http://127.0.0.1:3002`) |
| `BACKEND_COUNT` | `2` | Auto-generate N backends on consecutive ports (used when `BACKENDS` is not set) |
| `BACKEND_BASE_PORT` | `3001` | Starting port for auto-generated backends |

### Examples

```bash
# Use defaults (2 backends on ports 3001, 3002)
npm start

# Specify backends explicitly
BACKENDS=http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:3003 npm start

# Auto-generate 4 backends starting at port 4000
BACKEND_COUNT=4 BACKEND_BASE_PORT=4000 npm start
```

## Test

```bash
curl http://127.0.0.1:3000/hello
curl http://127.0.0.1:3000/health
```

Observe the `instance` field in `/hello` responses to verify load balancing across backends.
