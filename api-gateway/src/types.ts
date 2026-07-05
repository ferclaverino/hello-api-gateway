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

export interface RouteEntry {
  path: string;
  backends: readonly string[];
  robin: ReturnType<typeof createRoundRobin>;
}

export interface RouteTable {
  entries: RouteEntry[];
  match(url: string): RouteEntry | undefined;
}

export function createRouteTable(routes: Record<string, string[]>): RouteTable {
  const entries: RouteEntry[] = Object.entries(routes)
    .map(([path, backends]) => ({
      path,
      backends: backends.map(parseBackendUrl),
      robin: createRoundRobin(backends.map(parseBackendUrl)),
    }))
    .sort((a, b) => b.path.length - a.path.length);

  return {
    entries,
    match(url: string): RouteEntry | undefined {
      return entries.find((e) => url === e.path || url.startsWith(e.path + "/") || url.startsWith(e.path + "?"));
    },
  };
}
