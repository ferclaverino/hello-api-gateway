# AGENTS.md

## Project Structure

- `light-service/` — Fastify + TypeScript hello world microservice
- `api-gateway/` — Fastify + TypeScript round-robin load balancing proxy

## Quick Start

```bash
# Terminal 1 — light-service
cd light-service && npm install && npm start

# Terminal 2 — api-gateway
cd api-gateway && npm install && npm start
```

This starts:
- light-service on port 3001
- API gateway on port 3000 with round-robin across backends

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /hello` | Returns `{ message: "Hello World", instance: <port> }` |
| `GET /health` | Returns gateway status and backend list |

## Run Manually

```bash
# light-service
cd light-service && npm install
PORT=3001 npm start

# api-gateway
cd api-gateway && npm install
BACKENDS=http://127.0.0.1:3001,http://127.0.0.1:3002 npm start
```

## Environment Variables

**light-service:**
- `PORT` — Server port (default: 3001)
- `HOST` — Bind address (default: 127.0.0.1)

**api-gateway:**
- `PORT` — Server port (default: 3000)
- `HOST` — Bind address (default: 127.0.0.1)
- `BACKENDS` — Comma-separated backend URLs (e.g., `http://127.0.0.1:3001,http://127.0.0.1:3002`)
- `BACKEND_COUNT` — Auto-generate N backends on consecutive ports (default: 2)
- `BACKEND_BASE_PORT` — Starting port for auto-generated backends (default: 3001)

## Testing

```bash
curl http://127.0.0.1:3000/hello     # Hit via gateway
curl http://127.0.0.1:3000/health    # Check gateway health
```

Observe the `instance` field in the response to verify load balancing.
