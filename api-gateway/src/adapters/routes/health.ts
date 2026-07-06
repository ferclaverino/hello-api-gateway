import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { healthSchema } from "../../infrastructure/schemas/health.schema";
import { buildHealthResponse } from "../../application/health-check";
import type { RouteTable } from "../../domain/route-table";

export function registerHealthRoute(
  app: FastifyInstance,
  routeTable: RouteTable | undefined,
  fallbackBackends: readonly string[],
): void {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/health", { schema: healthSchema }, async () => {
      return buildHealthResponse(routeTable, fallbackBackends);
    });
}
