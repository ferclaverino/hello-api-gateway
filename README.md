# hello-api-gateway

![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Fastify](https://img.shields.io/badge/Fastify-5.3-000000?logo=fastify)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-7.6-231F20?logo=apachekafka)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Zod](https://img.shields.io/badge/Zod-4.4-3068B7?logo=zod)
![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js)
![KRaft](https://img.shields.io/badge/Kafka-KRaft-231F20)

A microservices reference architecture demonstrating API gateway routing, round-robin load balancing, and asynchronous job processing over Apache Kafka — built with Fastify, TypeScript, and clean architecture principles.

## Overview

This project implements a multi-service system designed to showcase production-grade patterns in distributed systems:

- An **API gateway** that serves as the single entry point, routing synchronous traffic across load-balanced backend instances and dispatching heavy work to an async pipeline
- A **lightweight service** that serves as a horizontal-scalability proof of concept
- A **heavy service** that bridges HTTP to Kafka, publishing jobs to a Kafka topic for background processing, and ships a **background worker** process (`src/worker.ts`) that consumes work from Kafka topics, demonstrating consumer-group-based horizontal scaling — both processes share a single codebase

The entire stack runs via Docker Compose (8 containers) and is fully observable through health endpoints and response metadata.

## Architecture

```
                                ┌─────────────────────────────────────┐
                                │           API Gateway               │
                                │         (port 3000)                 │
                                │   Single entry point                │
                                │   YAML-configurable routing         │
                                │                                     │
                                │   /hello        → light-service     │
                                │   /job          → heavy-service     │
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
                                                               │  job.requests      │
                                                               │  topic             │
                                                               └──┬─────────────┬──┘
                                                                 │             │
                                                    ┌────────────┘             └────────────┐
                                                    ▼                                       ▼
                                          ┌──────────────────┐                   ┌──────────────────┐
                                          │  heavy-worker-1  │                   │  heavy-worker-2  │
                                          │  Consumer Group  │                   │  Consumer Group  │
                                          │  "heavy-workers" │                   │  "heavy-workers" │
                                          └──────────────────┘                   └──────────────────┘
                                ┌──────────────────┐
                                │      Redis        │
                                │  (port 6379)      │
                                │  Job state store  │
                                └──────────────────┘
```

All client traffic enters through the API gateway. The gateway dispatches synchronous requests to light-service via round-robin load balancing and routes heavy work to the heavy-service, which publishes jobs to Kafka for background processing.

## Services

| Service         | Description                                                                                                         | Port       |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | ---------- |
| `api-gateway`   | Reverse proxy with YAML-configurable routing. Routes `/hello` to light-service and `/job` to heavy-service          | 3000       |
| `light-service` | Minimal microservice returning instance identity — verifies load balancing works                                    | 3001, 3002 |
| `heavy-service` | HTTP-to-Kafka bridge that publishes jobs to Kafka; also ships the background Kafka worker process (`src/worker.ts`) | 3010       |

## Key Patterns & Design Decisions

### Clean Architecture

Each service follows a layered architecture with inward-only dependency direction:

```
domain ← application ← adapters ← infrastructure
```

- **domain** — core business concepts and rules (pure functions, no framework dependencies)
- **application** — use-case orchestration
- **adapters** — protocol-specific concerns (Zod schemas, request/response mappers)
- **infrastructure** — framework integration (Fastify, KafkaJS, config, logging)

This separation ensures business logic remains testable and framework-independent.

### Round-Robin Load Balancing

The gateway uses a pure-function round-robin load balancer (`createRoundRobinLoadBalancer()`) that cycles through backends using modular arithmetic. This was chosen over weighted or least-connections strategies because:

- No state persistence required between requests
- Predictable distribution across healthy instances
- Simple to reason about and verify via the `/hello` response `instance` field

Route configuration is loaded from `routes.yaml` at startup, supporting YAML-driven routing rules without code changes.

### Kafka Job Processing

The heavy service publishes jobs to Kafka for background processing:

1. Client sends `POST /job` to the API gateway
2. Gateway forwards to heavy-service, which creates a job in Redis and publishes the job ID to the `job.requests` Kafka topic
3. The HTTP response returns the job ID immediately
4. Worker instances (consumer group `heavy-workers`) receive the job ID from Kafka
5. Client can poll `GET /job/:jobId` to check job status and result

For synchronous work simulation, `POST /job/execute` calls `MakeResult` directly (sleeps for a configurable delay, returns result without Kafka).

### Horizontal Scaling via Consumer Groups

Both worker instances share the Kafka consumer group `heavy-workers`. Kafka's partition-assignment mechanism distributes messages across available consumers automatically. Adding a third worker instance requires zero configuration changes — Kafka rebalances partitions automatically.

### Zod-First Configuration

Every service validates all environment variables at startup using Zod schemas. Invalid or missing configuration causes an immediate, descriptive error rather than a runtime failure deep in request processing. This fail-fast approach is critical in containerized environments where misconfigured pods should crash early.

### KRaft Mode (No Zookeeper)

The Kafka broker runs in KRaft mode (Kafka Raft metadata mode), eliminating the Zookeeper dependency. This simplifies the development environment to a single Kafka container while maintaining the same topic/partition/consumer-group semantics used in production Kafka deployments.

## Tech Stack

| Category              | Technology       | Purpose                                                     |
| --------------------- | ---------------- | ----------------------------------------------------------- |
| **Language**          | TypeScript 5.8   | Type-safe development with strict mode                      |
| **Runtime**           | Node.js 24       | ES2022 target, native fetch()                               |
| **HTTP Framework**    | Fastify 5.3      | High-performance HTTP server with hook-based middleware     |
| **Schema Validation** | Zod 4.4          | Runtime type validation for config, requests, and responses |
| **Message Broker**    | Apache Kafka 7.6 | Asynchronous messaging with KRaft mode (no Zookeeper)       |
| **Kafka Client**      | KafkaJS 2.2      | TypeScript-native Kafka producer/consumer                   |
| **State Store**       | Redis 7          | Job state storage for background job tracking               |
| **Containerization**  | Docker Compose   | Multi-service orchestration (8 containers)                  |
| **Module System**     | ESNext / Node16  | Modern ESM with TypeScript path resolution                  |

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 24+ (for local development)

### Quick Start

```bash
docker compose up
```

This starts all 8 containers: 1 Kafka broker, 1 Redis, 2 light-service instances, 1 api-gateway, 1 heavy-service (HTTP bridge), and 2 heavy-worker processes (scaled consumers built from the same `heavy-service/` codebase).

### Manual Start (Local Development)

```bash
# Terminal 1 — light-service instances
cd light-service && pnpm install && pnpm start        # port 3001
PORT=3002 pnpm start                                 # port 3002

# Terminal 2 — api-gateway
cd api-gateway && pnpm install && pnpm start          # port 3000

# Terminal 3 — Kafka broker + Redis (Docker)
docker compose up kafka redis

# Terminal 4 — heavy-service (accessed via gateway)
cd heavy-service && pnpm install && pnpm run start:service  # port 3010

# Terminal 5 — heavy-workers (same codebase, different process)
cd heavy-service && pnpm run start:worker                  # worker-1
WORKER_ID=worker-2 pnpm run start:worker                   # worker-2
```

### Build

```bash
pnpm build    # Compiles TypeScript to dist/
pnpm dev      # Runs with tsx (no build needed)
```

## Testing

All traffic goes through the API gateway (single entry point):

```bash
# Round-robin load balancing — observe the "instance" field
curl http://127.0.0.1:3000/hello
# {"message":"Hello World!","instance":3001}

curl http://127.0.0.1:3000/hello
# {"message":"Hello World!","instance":3002}

# Synchronous work simulation via gateway — blocks ~10s
curl -X POST http://127.0.0.1:3000/job/execute -H "Content-Type: application/json" -d '{"task":"my-task"}'
# {"message":"Job completed successfully","durationMs":10003,"workerId":"worker-1"}

# Background job — returns immediately with a job ID
curl -X POST http://127.0.0.1:3000/job
# {"jobId":"..."}

# Get job status
curl http://127.0.0.1:3000/job/<jobId>
# {"id":"...","status":"completed","result":{...}}

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
├── heavy-service/                # HTTP-to-Kafka bridge + background Kafka worker
│   └── src/
│       ├── service.ts             # HTTP service entry point
│       ├── worker.ts              # Background worker entry point
│       ├── domain/               # Job entity, Result value object
│       ├── application/          # CreateJob, GetJob, ExecuteJob, MakeResult use cases
│       ├── adapters/             # Fastify response mappers, Redis job mapper
│       └── infrastructure/       # Fastify server, Kafka client/producer/consumer, Redis, config
│
└── docker-compose.yml            # Full stack orchestration (8 containers)
```
