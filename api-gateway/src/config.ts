import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import { EnvSchema } from "./model/config";
import type { EnvConfig } from "./model/config";
import { RouteTable } from "./model/routing";
import { parseBackendUrl } from "./routingUtils";

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
  ? new RouteTable(yamlRoutes)
  : undefined;

const fallbackBackends = buildBackends(env);

export const config = {
  ...env,
  backends: fallbackBackends,
  routeTable,
};
