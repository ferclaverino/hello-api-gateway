import { Readable } from "node:stream";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { RouteTable } from "../../domain/route-table";
import { buildUpstreamHeaders } from "../http/headers";

export async function handleProxyRequest(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
  routeTable: RouteTable,
): Promise<void> {
  const route = routeTable.match(request.url);
  if (!route) {
    reply.code(404).send({ error: "Not Found" });
    return;
  }

  const backend = route.loadBalancer.next();
  await proxyToBackend(app, request, reply, backend, route.path);
}

async function proxyToBackend(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
  backend: URL,
  prefix: string,
): Promise<void> {
  const suffix = request.url.slice(prefix.length);
  const target = `${backend.href}${suffix}`;
  const headers = buildUpstreamHeaders(request.headers, backend);
  const hasBody = !["GET", "HEAD"].includes(request.method);

  try {
    const res = await fetch(target, {
      method: request.method,
      headers,
      body: hasBody ? (Readable.toWeb(request.raw) as ReadableStream) : undefined,
      // @ts-expect-error: duplex required for streaming request bodies in undici
      duplex: "half",
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
    reply.code(502).send({ error: "Bad Gateway", backend });
  }
}
