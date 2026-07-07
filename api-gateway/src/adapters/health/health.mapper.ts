import type { RouteTable } from "../../domain/route-table";
import type { HealthResponse } from "./health.schema";

export function toHealthResponse(
  routeTable: RouteTable | undefined,
  fallbackBackends: readonly URL[],
): HealthResponse {
  const routes =
    routeTable?.getEntries().map((r) => ({
      path: r.path,
      backends: r.backends.map((b) => b.toString()),
    })) ?? [];
  return {
    status: "ok",
    routes,
    fallbackBackends: fallbackBackends.map((backend) => backend.toString()),
  };
}
