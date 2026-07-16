# light-service

A simple Fastify "Hello World" microservice.

[← Back to main README](../README.md)

## Setup

```bash
npm install
```

## Run

```bash
npm start
```

The server starts on `http://127.0.0.1:3001` by default.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /hello` | Returns `{ "message": "Hello World!", "instance": <port> }` |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `HOST` | `127.0.0.1` | Bind address |

### Examples

```bash
# Run on port 4000
PORT=4000 npm start

# Bind to all interfaces
HOST=0.0.0.0 npm start
```

## Test

```bash
curl http://127.0.0.1:3001/hello
```
