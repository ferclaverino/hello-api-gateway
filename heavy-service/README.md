# heavy-service

HTTP-to-Kafka bridge implementing request-reply with correlation IDs and timeout handling, plus a background Kafka worker process. Both processes share a single codebase (`src/service.ts` and `src/worker.ts`).

[← Back to main README](../README.md)

## Setup

```bash
npm install
```

## Run

```bash
npm run start:service   # HTTP bridge (default port 3010)
npm run start:worker    # background Kafka worker
```

The service starts on `http://127.0.0.1:3010` by default. Multiple worker instances can run concurrently with distinct `WORKER_ID` values.

## Endpoints

| Endpoint            | Description                                                            |
| ------------------- | ---------------------------------------------------------------------- |
| `POST /job/execute` | Dispatches work to Kafka and waits for reply with correlation ID       |
| `POST /job`         | Starts a background job, publishes it to Kafka, and returns the job ID |
| `GET /job/:jobId`   | Retrieves the status and result of a job by ID                         |

## Environment Variables

| Variable             | Default                  | Description                                 |
| -------------------- | ------------------------ | ------------------------------------------- |
| `PORT`               | `3010`                   | Server port                                 |
| `HOST`               | `127.0.0.1`              | Bind address                                |
| `KAFKA_BROKERS`      | `127.0.0.1:9092`         | Comma-separated Kafka broker addresses      |
| `KAFKA_CLIENT_ID`    | `heavy-service`          | Kafka client identifier                     |
| `REDIS_URL`          | `redis://127.0.0.1:6379` | Redis connection URL                        |
| `JOB_REQUESTS_TOPIC` | `job.requests`           | Kafka topic for job requests                |
| `GROUP_ID`           | `heavy-workers`          | Kafka consumer group for the worker process |
| `WORKER_ID`          | `worker-1`               | Identifier for the worker process instance  |

### Examples

```bash
# Run with default configuration
npm run start:service

# Run with custom Kafka brokers
KAFKA_BROKERS=broker1:9092,broker2:9092 npm run start:service

# Run a worker instance
WORKER_ID=worker-1 npm run start:worker
```

## Test

```bash
curl -X POST http://127.0.0.1:3010/job/execute -H "Content-Type: application/json" -d '{"task":"my-task"}'
```

The service will dispatch the work to Kafka and wait for a worker to process it and send a reply. If no reply arrives within the timeout period (default 15s), the request will fail with HTTP 504.

```bash
# Start a background job
curl -X POST http://127.0.0.1:3010/job

# Get job status
curl http://127.0.0.1:3010/job/<jobId>
```
