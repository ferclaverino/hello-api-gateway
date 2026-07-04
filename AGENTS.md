# AGENTS.md

## Project Structure

- `light-service/` — Fastify + TypeScript hello world microservice
- `api-gateway/` — Fastify + TypeScript round-robin load balancing proxy
- `start.sh` — Launches N instances of light-service + API gateway

## Quick Start

```bash
./start.sh 3        # Start 3 light-service instances + gateway
./start.sh          # Default: 2 instances
```

This starts:
- N light-service instances on ports 3001, 3002, ... 3000+N
- API gateway on port 3000 with round-robin across all backends

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /hello` | Returns `{ message: "Hello World", instance: <port> }` |
| `GET /health` | Returns gateway status and backend list |

## Run Manually

```bash
# light-service
cd light-service && npm install
PORT=3001 npx tsx src/index.ts

# api-gateway
cd api-gateway && npm install
BACKENDS=http://127.0.0.1:3001,http://127.0.0.1:3002 npx tsx src/index.ts
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
