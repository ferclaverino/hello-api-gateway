# hello-api-gateway

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Fastify](https://img.shields.io/badge/Fastify-5.3-000000?logo=fastify)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-7.6-231F20?logo=apachekafka)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Zod](https://img.shields.io/badge/Zod-4.4-3068B7?logo=zod)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js)
![KRaft](https://img.shields.io/badge/Kafka-KRaft-231F20)

A microservices reference architecture demonstrating API gateway routing, round-robin load balancing, and asynchronous request-reply over Apache Kafka — built with Fastify, TypeScript, and clean architecture principles.

## Overview

This project implements a multi-service system designed to showcase production-grade patterns in distributed systems:

- An **API gateway** that serves as the single entry point, routing synchronous traffic across load-balanced backend instances and dispatching heavy work to an async pipeline
- A **lightweight service** that serves as a horizontal-scalability proof of concept
- A **heavy service** that bridges HTTP to Kafka, implementing the request-reply messaging pattern with correlation IDs and timeout handling
- **Background workers** that consume work from Kafka topics and reply asynchronously, demonstrating consumer-group-based horizontal scaling

The entire stack runs via Docker Compose (7 containers) and is fully observable through health endpoints and response metadata.

## Architecture

```
                                ┌─────────────────────────────────────┐
                                │           API Gateway               │
                                │         (port 3000)                 │
                                │   Single entry point                │
                                │   YAML-configurable routing         │
                                │                                     │
                                │   /hello        → light-service     │
                                │   /job/execute  → heavy-service     │
                                └──────┬──────────┬──────────┬────────┘
                                       │          │          │
                          ┌────────────┘          │          └────────────┐
                          ▼                       ▼                       ▼
                ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
                │  light-service   │    │  light-service   │    │  heavy-service   │
                │   (port 3001)    │    │   (port 3002)    │    │   (port 3010)    │
                │  Instance 1      │    │  Instance 2      │    │  HTTP-Kafka      │
                └──────────────────┘    └──────────────────┘    └────────┬─────────┘
                                                                        │
                                                              ┌─────────▼─────────┐
                                                              │   Kafka Broker     │
                                                              │   (KRaft mode)     │
                                                              │                    │
                                                              │  heavy-work topic  │
                                                              │  heavy-reply topic │
                                                              └──┬─────────────┬──┘
                                                                 │             │
                                                    ┌────────────┘             └────────────┐
                                                    ▼                                       ▼
                                          ┌──────────────────┐                   ┌──────────────────┐
                                          │  heavy-worker-1  │                   │  heavy-worker-2  │
                                          │  Consumer Group  │                   │  Consumer Group  │
                                          │  "heavy-workers" │                   │  "heavy-workers" │
                                          └──────────────────┘                   └──────────────────┘
```

All client traffic enters through the API gateway. The gateway dispatches synchronous requests to light-service via round-robin load balancing and routes heavy work to the heavy-service, which bridges into Kafka's async request-reply pipeline.

## Services

| Service | Description | Port |
|---------|-------------|------|
| `api-gateway` | Reverse proxy with YAML-configurable routing. Routes `/hello` to light-service and `/job/execute` to heavy-service | 3000 |
| `light-service` | Minimal microservice returning instance identity — verifies load balancing works | 3001, 3002 |
| `heavy-service` | HTTP-to-Kafka bridge implementing request-reply with correlation IDs and timeout | 3010 (debug only) |
| `heavy-worker` | Background Kafka consumer that processes work and replies asynchronously | — |

## Key Patterns & Design Decisions

### Clean Architecture

Each service follows a layered architecture with inward-only dependency direction:

```
domain ← application ← adapters ← infrastructure
```

- **domain** — core business concepts and rules (pure functions, no framework dependencies)
- **application** — use-case orchestration (e.g., execute-use-case with timeout racing)
- **adapters** — protocol-specific concerns (Zod schemas, request/response mappers)
- **infrastructure** — framework integration (Fastify, KafkaJS, config, logging)

This separation ensures business logic remains testable and framework-independent.

### Round-Robin Load Balancing

The gateway uses a pure-function round-robin load balancer (`createRoundRobinLoadBalancer()`) that cycles through backends using modular arithmetic. This was chosen over weighted or least-connections strategies because:

- No state persistence required between requests
- Predictable distribution across healthy instances
- Simple to reason about and verify via the `/hello` response `instance` field

Route configuration is loaded from `routes.yaml` at startup, supporting YAML-driven routing rules without code changes.

### Kafka Request-Reply Pattern

The heavy service implements the **request-reply over messaging** pattern for work that exceeds typical HTTP timeouts:

1. Client sends `POST /job/execute` to the API gateway
2. Gateway forwards to heavy-service, which publishes work to the `heavy-work` topic with a UUID correlation ID
3. Heavy-service registers a pending Promise keyed by correlation ID
4. Worker consumes the message, performs work, publishes reply to `heavy-reply` with the same correlation ID
5. Reply consumer resolves the pending Promise, which the HTTP handler returns to the client
6. If no reply arrives within the timeout (default 15s), the request fails with HTTP 504

This decouples synchronous HTTP from asynchronous processing while maintaining a simple client API.

### Horizontal Scaling via Consumer Groups

Both worker instances share the Kafka consumer group `heavy-workers`. Kafka's partition-assignment mechanism distributes messages across available consumers automatically. Adding a third worker instance requires zero configuration changes — Kafka rebalances partitions automatically.

### Zod-First Configuration

Every service validates all environment variables at startup using Zod schemas. Invalid or missing configuration causes an immediate, descriptive error rather than a runtime failure deep in request processing. This fail-fast approach is critical in containerized environments where misconfigured pods should crash early.

### KRaft Mode (No Zookeeper)

The Kafka broker runs in KRaft mode (Kafka Raft metadata mode), eliminating the Zookeeper dependency. This simplifies the development environment to a single Kafka container while maintaining the same topic/partition/consumer-group semantics used in production Kafka deployments.

## Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Language** | TypeScript 5.8 | Type-safe development with strict mode |
| **Runtime** | Node.js 22 | ES2022 target, native fetch() |
| **HTTP Framework** | Fastify 5.3 | High-performance HTTP server with hook-based middleware |
| **Schema Validation** | Zod 4.4 | Runtime type validation for config, requests, and responses |
| **Message Broker** | Apache Kafka 7.6 | Asynchronous messaging with KRaft mode (no Zookeeper) |
| **Kafka Client** | KafkaJS 2.2 | TypeScript-native Kafka producer/consumer |
| **Containerization** | Docker Compose | Multi-service orchestration (7 containers) |
| **Module System** | ESNext / Node16 | Modern ESM with TypeScript path resolution |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 22+ (for local development)

### Quick Start

```bash
docker compose up
```

This starts all 7 containers: 1 Kafka broker, 2 light-service instances, 1 api-gateway, 1 heavy-service, and 2 heavy-workers.

### Manual Start (Local Development)

```bash
# Terminal 1 — light-service instances
cd light-service && npm install && npm start        # port 3001
PORT=3002 npm start                                 # port 3002

# Terminal 2 — api-gateway
cd api-gateway && npm install && npm start          # port 3000

# Terminal 3 — Kafka broker (Docker)
docker compose up kafka

# Terminal 4 — heavy-service (accessed via gateway)
cd heavy-service && npm install && npm start        # port 3010

# Terminal 5 — heavy-workers
cd heavy-worker && npm install && npm start         # worker-1
WORKER_ID=worker-2 npm start                        # worker-2
```

### Build

```bash
npm run build    # Compiles TypeScript to dist/
npm run dev      # Runs with tsx (no build needed)
```

## Testing

All traffic goes through the API gateway (single entry point):

```bash
# Round-robin load balancing — observe the "instance" field
curl http://127.0.0.1:3000/hello
# {"message":"Hello from light-service!","instance":"127.0.0.1:3001"}

curl http://127.0.0.1:3000/hello
# {"message":"Hello from light-service!","instance":"127.0.0.1:3002"}

# Heavy work via gateway — blocks ~10s while worker processes
curl -X POST http://127.0.0.1:3000/job/execute
# {"status":"completed","workerId":"worker-1","duration":"10003ms"}

# Health check
curl http://127.0.0.1:3000/health
# {"status":"ok","routes":[...],"fallbackBackends":[...]}
```

## Project Structure

```
├── api-gateway/                  # Reverse proxy + load balancer
│   └── src/
│       ├── domain/               # RoundRobinLoadBalancer, RouteTable, BackendUrl
│       ├── adapters/             # Health endpoint schemas + mappers
│       └── infrastructure/       # Fastify server, proxy hook, config, routes.yaml
│
├── light-service/                # Hello world microservice
│   └── src/
│       ├── adapters/             # Hello endpoint schemas + mappers
│       └── infrastructure/       # Fastify server, config
│
├── heavy-service/                # HTTP-to-Kafka bridge
│   └── src/
│       ├── domain/               # WorkPayload, WorkReply interfaces
│       ├── application/          # executeUseCase (timeout racing, pending registry)
│       ├── adapters/             # Execute endpoint schemas + mappers
│       └── infrastructure/       # Fastify server, Kafka client, producer, consumer
│
├── heavy-worker/                 # Background Kafka worker
│   └── src/
│       ├── domain/               # WorkPayload, WorkReply interfaces
│       └── infrastructure/       # Kafka consumer + producer, config
│
└── docker-compose.yml            # Full stack orchestration (7 containers)
```

## AI Skills

This project uses [autoskills](https://github.com/midudev/autoskills) to automatically install AI agent skills based on the detected tech stack.

```bash
npx autoskills
```
