import type { FastifyInstance } from "fastify";
import type { RouteTable } from "../../domain/route-table";
import { handleProxyRequest } from "../../application/proxy-route";

export function registerProxyHook(app: FastifyInstance, routeTable: RouteTable): void {
  app.addHook("onRequest", async (request, reply) => {
    if (request.url === "/health") return;
    await handleProxyRequest(app, request, reply, routeTable);
  });
}
