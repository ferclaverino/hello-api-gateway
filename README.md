# hello-api-gateway

A simple API gateway with round-robin load balancing, built with Fastify + TypeScript.

## Architecture

```
Client → api-gateway (port 3000) → light-service (port 3001, 3002, ...)
```

## Services

| Service | Description | Docs |
|---------|-------------|------|
| `light-service` | Hello world microservice | [README.md](./light-service/README.md) |
| `api-gateway` | Round-robin load balancing proxy | [README.md](./api-gateway/README.md) |

## Quick Start

```bash
# Terminal 1 — light-service
cd light-service && npm install && npm start

# Terminal 2 — api-gateway
cd api-gateway && npm install && npm start
```

## Test

```bash
curl http://127.0.0.1:3000/hello     # Hit via gateway
curl http://127.0.0.1:3000/health    # Check gateway health
```

Observe the `instance` field in `/hello` responses to verify load balancing.

## AI Skills

This project uses [autoskills](https://github.com/midudev/autoskills) to automatically install AI agent skills based on the detected tech stack.

```bash
npx autoskills
```
