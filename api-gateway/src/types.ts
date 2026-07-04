import type { FromSchema } from "json-schema-to-ts";

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

export function parseBackendUrl(raw: string): BackendUrl {
  try {
    new URL(raw);
    return raw as BackendUrl;
  } catch {
    throw new Error(`Invalid backend URL: ${raw}`);
  }
}

export function createRoundRobin(backends: readonly string[]) {
  let index = 0;
  return {
    next(): BackendUrl {
      return backends[index++ % backends.length] as BackendUrl;
    },
  };
}
