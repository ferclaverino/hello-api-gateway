import Fastify from "fastify";

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "127.0.0.1";

const backends: string[] = (() => {
  const env = process.env.BACKENDS;
  if (env) return env.split(",").map((s) => s.trim());
  const count = Number(process.env.BACKEND_COUNT) || 2;
  const basePort = Number(process.env.BACKEND_BASE_PORT) || 3001;
  return Array.from({ length: count }, (_, i) => `http://${HOST}:${basePort + i}`);
})();

let currentIndex = 0;

function nextBackend(): string {
  const backend = backends[currentIndex % backends.length];
  currentIndex++;
  return backend;
}

const app = Fastify({ logger: true });

app.addHook("onRequest", async (request, reply) => {
  if (request.url === "/health") return;

  const backend = nextBackend();
  const target = `${backend}${request.url}`;

  try {
    const res = await fetch(target, {
      method: request.method,
      headers: { ...request.headers, host: new URL(backend).host },
    });

    reply.code(res.status);
    res.headers.forEach((value, key) => {
      if (key !== "transfer-encoding") {
        reply.header(key, value);
      }
    });

    reply.send(await res.text());
  } catch (err) {
    app.log.error(err, `Failed to proxy to ${target}`);
    reply.code(502).send({ error: "Bad Gateway", backend });
  }
});

app.get("/health", async () => {
  return { status: "ok", backends };
});

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`API Gateway listening on port ${PORT}`);
  app.log.info(`Backends: ${backends.join(", ")}`);
});
