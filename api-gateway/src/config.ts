import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import YAML from "yaml";
import { parseBackendUrl, createRouteTable, type RouteTable } from "./types.js";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("127.0.0.1"),
  BACKENDS: z.string().optional(),
  BACKEND_COUNT: z.coerce.number().int().positive().default(2),
  BACKEND_BASE_PORT: z.coerce.number().int().positive().default(3001),
  ROUTES_FILE: z.string().default("routes.yaml"),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

function buildBackends(config: EnvConfig): readonly string[] {
  if (config.BACKENDS) {
    return config.BACKENDS.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(parseBackendUrl);
  }
  return Array.from(
    { length: config.BACKEND_COUNT },
    (_, i) => parseBackendUrl(`http://${config.HOST}:${config.BACKEND_BASE_PORT + i}`),
  );
}

function loadRoutes(filePath: string): Record<string, string[]> | undefined {
  try {
    const content = readFileSync(resolve(filePath), "utf-8");
    const doc = YAML.parse(content);
    if (doc?.routes && typeof doc.routes === "object") {
      return doc.routes as Record<string, string[]>;
    }
    return undefined;
  } catch {
    return undefined;
  }
}

const env = EnvSchema.parse(process.env);
const yamlRoutes = loadRoutes(env.ROUTES_FILE);

const routeTable = yamlRoutes
  ? createRouteTable(yamlRoutes)
  : undefined;

const fallbackBackends = buildBackends(env);

export const config = {
  ...env,
  backends: fallbackBackends,
  routeTable,
};
