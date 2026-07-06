import type { RouteTable } from "../domain/route-table";
import type { HealthResponse } from "../infrastructure/schemas/health.schema";

export function buildHealthResponse(
  routeTable: RouteTable | undefined,
  fallbackBackends: readonly string[],
): HealthResponse {
  const routePaths = routeTable?.getEntries().map((e) => e.path) ?? [];
  return {
    status: "ok",
    backends: routePaths.length ? routePaths : [...fallbackBackends],
  };
}
