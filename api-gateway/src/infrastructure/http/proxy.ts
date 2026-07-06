import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { buildUpstreamHeaders } from "./headers";

export async function proxyToBackend(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
  backend: string,
): Promise<void> {
  const target = `${backend}${request.url}`;
  const headers = buildUpstreamHeaders(request.headers, backend);

  try {
    const res = await fetch(target, { method: request.method, headers });

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
    reply.code(502).send({ error: "Bad Gateway", backend });
  }
}
