import type { EnvConfig } from "./env.schema";
import { parseBackendUrl } from "../../domain/round-robin";

export function buildBackends(config: EnvConfig): readonly string[] {
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
