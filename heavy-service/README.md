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