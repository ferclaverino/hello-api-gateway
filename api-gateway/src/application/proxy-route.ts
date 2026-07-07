import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import type { RouteTable } from "../domain/route-table";
import { proxyToBackend } from "../infrastructure/http/proxy";

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
  await proxyToBackend(app, request, reply, backend);
}
