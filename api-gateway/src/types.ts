import type { FromSchema } from "json-schema-to-ts";
import type { createRoundRobin } from "./routingUtils";

export const healthSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string", enum: ["ok"] },
        backends: { type: "array", items: { type: "string" } },
      },
      required: ["status", "backends"],
    },
  },
} as const;

export const errorSchema = {
  response: {
    502: {
      type: "object",
      properties: {
        error: { type: "string" },
        backend: { type: "string" },
      },
      required: ["error", "backend"],
    },
  },
} as const;

export type HealthResponse = FromSchema<typeof healthSchema.response["200"]>;
export type ErrorResponse = FromSchema<typeof errorSchema.response["502"]>;

export type BackendUrl = string & { readonly __brand: unique symbol };

export interface RouteEntry {
  path: string;
  backends: readonly string[];
  robin: ReturnType<typeof createRoundRobin>;
}

export interface RouteTable {
  entries: RouteEntry[];
  match(url: string): RouteEntry | undefined;
}
