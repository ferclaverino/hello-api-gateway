import Fastify from "fastify";
import { config } from "./config.js";
import {
  errorSchema,
  healthSchema,
  type ErrorResponse,
  type HealthResponse,
} from "./types.js";

const { PORT, HOST, backends, routeTable } = config;

const app = Fastify({ logger: true });

app.addHook("onRequest", async (request, reply) => {
  if (request.url === "/health") return;

  const route = routeTable?.match(request.url);

  if (!route) {
    reply.code(404).send({ error: "Not Found" });
    return;
  }

  const backend = route.robin.next();
  const target = `${backend}${request.url}`;

  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }
    headers.set("host", new URL(backend).host);

    const res = await fetch(target, {
      method: request.method,
      headers,
    });

    reply.code(res.status);
    res.headers.forEach((value, key) => {
      if (key !== "transfer-encoding") {
        reply.header(key, value);
      }
    });

    reply.send(await res.text());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    app.log.error({ err: new Error(message) }, `Failed to proxy to ${target}`);
    const body: ErrorResponse = { error: "Bad Gateway", backend };
    reply.code(502).send(body);
  }
});

app.get("/health", { schema: healthSchema }, async () => {
  const routePaths = routeTable?.entries.map((e) => e.path) ?? [];
  const body: HealthResponse = { status: "ok", backends: routePaths.length ? routePaths : [...backends] };
  return body;
});

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`API Gateway listening on port ${PORT}`);
  if (routeTable) {
    for (const entry of routeTable.entries) {
      app.log.info(`  ${entry.path} -> ${entry.backends.join(", ")}`);
    }
  } else {
    app.log.info(`Backends: ${backends.join(", ")}`);
  }
});
