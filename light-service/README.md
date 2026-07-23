# light-service

A minimal Fastify microservice that returns a hello message with its instance port. Its purpose: prove that horizontal scaling and load balancing work as expected.

[← Back to main README](../README.md)

## Architecture

```
adapters ← infrastructure
```

This service is intentionally simple — no domain or application layers needed. It demonstrates that even a trivial service benefits from separating HTTP concerns (schemas, response mapping) from infrastructure (Fastify, config).

| Layer | What lives here |
|-------|-----------------|
| `adapters` | Hello endpoint schemas and response mappers |
| `infrastructure` | Fastify server, Zod config validation |

### Why no domain layer?

If a service has no business rules beyond "return a response," adding a domain layer would be over-engineering. The architecture scales *down* as well as up — use only what you need.

## Setup

```bash
pnpm install
```

## Run

```bash
pnpm start
```

The server starts on `http://127.0.0.1:3001` by default.

Run a second instance for load balancing:

```bash
PORT=3002 pnpm start
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /hello` | Returns `{ "message": "Hello World!", "instance": <port> }` |

The `instance` field in the response is the key — it lets you verify that the API gateway is distributing traffic across instances.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `HOST` | `127.0.0.1` | Bind address |

### Examples

```bash
# Run on port 4000
PORT=4000 pnpm start

# Bind to all interfaces
HOST=0.0.0.0 pnpm start
```

## Test

```bash
curl http://127.0.0.1:3001/hello
# {"message":"Hello World!","instance":3001}
```
