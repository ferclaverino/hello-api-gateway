import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { healthSchema } from "../../adapters/health/health.schema";
import { toHealthResponse } from "../../adapters/health/health.mapper";
import type { RouteTable } from "../../domain/route-table";

export function registerHealthRoute(
  app: FastifyInstance,
  routeTable: RouteTable | undefined,
  fallbackBackends: readonly URL[],
): void {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/health", { schema: healthSchema }, async () => {
      return toHealthResponse(routeTable, fallbackBackends);
    });
}
