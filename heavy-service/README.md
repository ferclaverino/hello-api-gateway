# heavy-service

HTTP-to-Kafka bridge implementing request-reply with correlation IDs and timeout handling.

[← Back to main README](../README.md)

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

The service starts on `http://127.0.0.1:3010` by default.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /job/execute` | Dispatches work to Kafka and waits for reply with correlation ID |
| `POST /start` | Starts a background job, publishes it to Kafka, and returns the job ID |
| `GET /get?jobId=<id>` | Retrieves the status and result of a job by ID |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3010` | Server port |
| `HOST` | `127.0.0.1` | Bind address |
| `KAFKA_BROKERS` | `127.0.0.1:9092` | Comma-separated Kafka broker addresses |
| `KAFKA_CLIENT_ID` | `heavy-service` | Kafka client identifier |
| `WORK_TOPIC` | `heavy-work` | Kafka topic for dispatching work |
| `REPLY_TOPIC` | `heavy-reply` | Kafka topic for receiving replies |
| `REPLY_CONSUMER_GROUP` | `heavy-service-replies` | Consumer group for reply topic |
| `REPLY_TIMEOUT_MS` | `15000` | Timeout for waiting for worker reply (ms) |
| `REDIS_URL` | `redis://127.0.0.1:6379` | Redis connection URL |
| `JOB_REQUESTS_TOPIC` | `job.requests` | Kafka topic for job requests |

### Examples

```bash
# Run with default configuration
npm start

# Run with custom Kafka brokers
KAFKA_BROKERS=broker1:9092,broker2:9092 npm start

# Run with custom timeout
REPLY_TIMEOUT_MS=30000 npm start
```

## Test

```bash
curl -X POST http://127.0.0.1:3010/job/execute -H "Content-Type: application/json" -d '{"task":"my-task"}'
```

The service will dispatch the work to Kafka and wait for a worker to process it and send a reply. If no reply arrives within the timeout period (default 15s), the request will fail with HTTP 504.

```bash
# Start a background job
curl -X POST http://127.0.0.1:3010/start

# Get job status
curl "http://127.0.0.1:3010/get?jobId=<jobId>"
```