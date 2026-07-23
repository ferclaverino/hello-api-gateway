# heavy-service

HTTP-to-Kafka bridge with a background worker process. Both share a single codebase — `src/service.ts` handles HTTP, `src/worker.ts` consumes from Kafka. This demonstrates that clean architecture lets you run the same domain logic through different protocols without duplication.

[← Back to main README](../README.md)

## Architecture

```
domain ← application ← adapters ← infrastructure
```

This is the most complete example of the layered architecture in the project.

| Layer | What lives here |
|-------|-----------------|
| `domain` | `Job` entity, `Result` value object, `EventBus` and `JobRepository` port interfaces — pure, no framework dependencies |
| `application` | Use cases: `CreateJob`, `GetJob`, `RunJob`, `MakeResult` — orchestrate domain logic |
| `adapters` | Fastify response mappers, Kafka event publisher adapter, Redis job repository adapter |
| `infrastructure` | Fastify server, KafkaJS producer/consumer, Redis client, Zod config validation |

### Ports & Adapters

The domain defines **ports** — interfaces like `EventBus` and `JobRepository`. Infrastructure provides the **adapters** — Kafka implements `EventBus`, Redis implements `JobRepository`. This means:

- Swap Kafka for RabbitMQ → change only the adapter
- Swap Redis for Postgres → change only the adapter
- Domain and application code stay untouched

### Kafka job processing flow

```
Client → POST /job → Gateway → heavy-service (HTTP)
    │
    ├─ Creates job in Redis (status: pending)
    ├─ Publishes job ID to Kafka topic "job.created"
    └─ Returns job ID immediately (HTTP 200)
            │
            ▼
    Worker instances (consumer group "heavy-workers")
    pick up the job ID from Kafka
            │
            ├─ Fetches job from Redis
    ├─ Runs the work (simulated sleep)
    ├─ Updates job in Redis (status: completed)
    └─ Client polls GET /job/:jobId for result
```

### Horizontal scaling via consumer groups

Both worker instances share the Kafka consumer group `heavy-workers`. Kafka's partition-assignment mechanism distributes messages across available consumers automatically. Adding a third worker requires zero configuration — Kafka rebalances partitions on its own.

## Setup

```bash
pnpm install
```

## Run

```bash
pnpm run start:service   # HTTP bridge (default port 3010)
pnpm run start:worker    # background Kafka worker
```

Multiple worker instances can run concurrently with distinct `WORKER_ID` values:

```bash
WORKER_ID=worker-1 pnpm run start:worker
WORKER_ID=worker-2 pnpm run start:worker
```

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /job/execute` | Simulates work by sleeping for `MAKE_RESULT_DELAY_MS`, then returns result directly (no Kafka) |
| `POST /job` | Creates a job in Redis, publishes to Kafka, returns job ID immediately |
| `GET /job/:jobId` | Retrieves job status and result by ID |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3010` | Server port |
| `HOST` | `127.0.0.1` | Bind address |
| `KAFKA_BROKERS` | `127.0.0.1:9092` | Comma-separated Kafka broker addresses |
| `KAFKA_CLIENT_ID` | `heavy-service` | Kafka client identifier |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection URL |
| `KAFKA_JOB_TOPIC_PARTITIONS` | `1` | Partitions for the `job.created` topic |
| `GROUP_ID` | `heavy-workers` | Kafka consumer group |
| `WORKER_ID` | `worker-1` | Worker instance identifier |
| `MAKE_RESULT_DELAY_MS` | `10000` | Simulated work duration in ms |

### Examples

```bash
# Default config
pnpm run start:service

# Custom Kafka brokers
KAFKA_BROKERS=broker1:9092,broker2:9092 pnpm run start:service

# Run a worker
WORKER_ID=worker-1 pnpm run start:worker
```

## Test

```bash
# Synchronous work simulation (blocks ~10s)
curl -X POST http://127.0.0.1:3010/job/execute

# Start a background job
curl -X POST http://127.0.0.1:3010/job

# Get job status
curl http://127.0.0.1:3010/job/<jobId>
```
