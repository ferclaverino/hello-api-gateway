# AGENTS.md

## Project Overview

Two Fastify + TypeScript services:
- `light-service/` — Hello world microservice
- `api-gateway/` — Round-robin load balancing proxy

## Quick Start

```bash
# Terminal 1
cd light-service && npm install && npm start

# Terminal 2
cd api-gateway && npm install && npm start
```

## Conventions

- TypeScript with strict mode, ES2022 target, Node16 module resolution
- Fastify for HTTP (no Express)
- No linting or test framework configured yet
- No comments in code unless explicitly requested
- Env vars for configuration (PORT, HOST, BACKENDS, etc.)

## Architecture

Clean architecture with four layers:

```
src/
├── domain/           # Pure business logic, zero external deps
├── application/      # Use cases
├── infrastructure/   # I/O, external services
├── adapters/         # Framework wiring (Fastify hooks, routes)
├── server.ts         # Fastify instance creation
├── config.ts         # Composition root
└── index.ts          # Bootstrap entry point
```

Dependency rule:

```
adapters → application → domain
                ↓
          infrastructure
```

- Domain type files use specific names (`domain/routing.ts`), never `types.ts`
- `index.ts` only calls adapter registration + `app.listen()`
- Simple services can flatten; use full layers when business logic grows

## Testing

No test suite yet. Verify manually:
```bash
curl http://127.0.0.1:3001/hello
curl http://127.0.0.1:3000/hello
curl http://127.0.0.1:3000/health
```

## Build

```bash
npm run build    # Compiles TypeScript to dist/
npm run dev      # Runs with tsx (no build needed)
```
