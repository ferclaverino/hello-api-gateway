import Fastify from "fastify";
import { config } from "./config";
import { proxyToBackend } from "./proxyUtils";
import { healthSchema, type HealthResponse } from "./types";

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
  await proxyToBackend(app, request, reply, backend);
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
