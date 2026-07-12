# heavy-worker

Background Kafka consumer that processes work asynchronously and replies to the heavy-service.

[← Back to main README](../README.md)

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

The worker starts consuming messages from the `heavy-work` topic and processes them.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `KAFKA_BROKERS` | `127.0.0.1:9092` | Comma-separated Kafka broker addresses |
| `KAFKA_CLIENT_ID` | `heavy-worker` | Kafka client identifier |
| `WORK_TOPIC` | `heavy-work` | Kafka topic for receiving work |
| `REPLY_TOPIC` | `heavy-reply` | Kafka topic for publishing replies |
| `GROUP_ID` | `heavy-workers` | Consumer group for horizontal scaling |
| `WORKER_ID` | `worker-1` | Unique identifier for this worker instance |
| `WORK_DELAY_MS` | `10000` | Simulated processing delay (ms) |

### Examples

```bash
# Run with default configuration
npm start

# Run as worker-2 in the same consumer group
WORKER_ID=worker-2 npm start

# Run with custom processing delay
WORK_DELAY_MS=5000 npm start

# Run with multiple workers (in separate terminals)
WORKER_ID=worker-1 npm start  # Terminal 1
WORKER_ID=worker-2 npm start  # Terminal 2
```

## Test

Workers consume messages from the `heavy-work` topic and publish replies to the `heavy-reply` topic. To test the full flow, use the heavy-service endpoint:

```bash
curl -X POST http://127.0.0.1:3000/job/execute -H "Content-Type: application/json" -d '{"task":"my-task"}'
```

This will dispatch work to Kafka, which will be consumed by one of the workers in the consumer group. The worker will process the work and reply asynchronously.

## Horizontal Scaling

Multiple worker instances can run concurrently using the same consumer group (`heavy-workers`). Kafka automatically distributes messages across available consumers in the group. To scale horizontally:

1. Start multiple worker instances with different `WORKER_ID` values
2. All instances will share the workload
3. Kafka handles partition assignment and load distribution automatically