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

This project follows a pragmatic Clean Architecture approach with four layers:

- `domain`: core business concepts and rules. Must not depend on other layers.
- `application`: use cases and application orchestration. May depend only on `domain`.
- `adapters`: protocol and interface adapters (HTTP schemas, mappers, handlers, DTOs). May depend on `application` and `domain`.
- `infrastructure`: frameworks, libraries, configuration, Fastify, HTTP clients, YAML parsing, environment variables, logging, etc. May depend on any inner layer.

Dependency direction must always point inward.

### Guidelines

- Do not introduce abstractions unless they provide clear value.
- Prefer simple code over strict architectural purity.
- Keep business logic in `domain`.
- Keep use-case orchestration in `application`.
- Keep HTTP-specific concerns (schemas, request/response mapping) in `adapters`.
- Keep Fastify, configuration, external services, and technical details in `infrastructure`.
- Avoid creating repositories, services, DTOs, or interfaces unless there is a concrete need.
- For small features, favor readability and maintainability over additional layers.

### Rule of Thumb

If a component would still exist without HTTP, Fastify, YAML, or environment variables, it likely belongs in `domain` or `application`.

If it depends on a framework, protocol, or external system, it belongs in `adapters` or `infrastructure`.

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
