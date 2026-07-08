# hello-api-gateway

A simple API gateway with round-robin load balancing, built with Fastify + TypeScript.

## Architecture

```
Client → api-gateway (port 3000) → light-service (port 3001, 3002, ...)

Client ─POST /execute─▶ heavy-service (port 3010) ─▶ Kafka (heavy-work)
                              ▲                          │
                              │                          ▼
                              └─heavy-reply─ heavy-worker x2 (sleep 10s, reply)
```

## Services

| Service | Description | Docs |
|---------|-------------|------|
| `light-service` | Hello world microservice | [README.md](./light-service/README.md) |
| `api-gateway` | Round-robin load balancing proxy | [README.md](./api-gateway/README.md) |
| `heavy-service` | Kafka request-reply service exposing `POST /execute` | — |
| `heavy-worker` | Consumes `heavy-work`, sleeps 10s, publishes to `heavy-reply` | — |

## Quick Start

```bash
# Terminal 1 — light-service
cd light-service && npm install && npm start

# Terminal 2 — api-gateway
cd api-gateway && npm install && npm start

# Terminal 3 — Kafka + heavy services (docker-compose)
docker compose up kafka heavy-service heavy-worker-1 heavy-worker-2
```

Or run everything with Docker:

```bash
docker compose up
```

## Test

```bash
curl http://127.0.0.1:3000/hello     # Hit via gateway
curl http://127.0.0.1:3000/health    # Check gateway health
curl -X POST http://127.0.0.1:3010/execute      # ~10s wait, returns workerId
curl -X POST http://127.0.0.1:3010/execute -H 'content-type: application/json' -d '{"task":"foo"}'
```

Observe the `instance` field in `/hello` responses to verify load balancing.

## AI Skills

This project uses [autoskills](https://github.com/midudev/autoskills) to automatically install AI agent skills based on the detected tech stack.

```bash
npx autoskills
```
