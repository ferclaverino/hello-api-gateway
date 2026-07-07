import type { FastifyInstance } from "fastify";
import { handleProxyRequest } from "./handle-proxy-request";
import { RouteTable } from "../../domain/route-table";

export function registerProxyHook(
  app: FastifyInstance,
  routeTable: RouteTable,
): void {
  app.addHook("onRequest", async (request, reply) => {
    if (request.url === "/health") return;
    await handleProxyRequest(app, request, reply, routeTable);
  });
}
