# hello-api-gateway

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Fastify](https://img.shields.io/badge/Fastify-5.3-000000?logo=fastify)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-7.6-231F20?logo=apachekafka)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Zod](https://img.shields.io/badge/Zod-4.4-3068B7?logo=zod)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js)

A reference architecture for applying **clean code principles to distributed systems** — showing that scalable, production-grade services don't have to sacrifice readability, testability, or maintainability.

## Why this project?

Distributed systems tend to accumulate accidental complexity fast: framework coupling, duplicated business logic, scattered configuration. This project proves that with the right design boundaries, you can have **both** — a system that scales horizontally _and_ code that is easy to understand, change, and test.

### What good design buys you

- **Agnostic domain** — Business rules live in pure functions with zero framework dependencies. You can swap Fastify for Express, Kafka for RabbitMQ, or Redis for Postgres — without touching the core logic.
- **Easy to change** — Need a new protocol? Add an adapter. New infrastructure? Swap the implementation. The layers enforce a one-way dependency flow that makes changes predictable.
- **Testable by default** — Domain logic and use cases can be unit-tested without starting a server, connecting to Kafka, or spinning up Docker.
- **Observable** — Every request carries metadata (instance ID, timing), every service exposes health endpoints, and the gateway provides a single point of entry for monitoring.

## The services

```
                          ┌─────────────────────┐
                          │     API Gateway      │
                          │     (port 3000)      │
                          └─────┬──────────┬─────┘
                                │          │
                    ┌───────────┘          └───────────┐
                    ▼                                   ▼
          ┌─────────────────┐               ┌─────────────────┐
          │  light-service  │               │  heavy-service  │
          │  (×2 instances) │               │  HTTP → Kafka   │
          └─────────────────┘               └────────┬────────┘
                                                     │
                                                Kafka + Redis
                                                (async workers)
```

| Service         | Role                                                                       | Docs                             |
| --------------- | -------------------------------------------------------------------------- | -------------------------------- |
| `api-gateway`   | Single entry point. Round-robin load balancing, YAML-configurable routing  | [api-gateway/](api-gateway/)     |
| `light-service` | Minimal HTTP service — proves horizontal scaling works                     | [light-service/](light-service/) |
| `heavy-service` | HTTP-to-Kafka bridge + background worker (same codebase, two entry points) | [heavy-service/](heavy-service/) |

Each service follows the same layered architecture:

```
domain ← application ← adapters ← infrastructure
```

Dependency direction always points inward. Details and rationale live in each service's README.

## Quick start

```bash
docker compose up
```

Starts all containers: Kafka (KRaft mode), Redis, gateway, 2 light-service instances, heavy-service, and 2 background workers.

## Test it

```bash
# Round-robin — the "instance" field changes each call
curl http://127.0.0.1:3000/hello
curl http://127.0.0.1:3000/hello

# Async job — returns immediately with a job ID
curl -X POST http://127.0.0.1:3000/job
curl http://127.0.0.1:3000/job/<jobId>

# Health
curl http://127.0.0.1:3000/health
```
