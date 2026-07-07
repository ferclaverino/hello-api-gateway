import { parseBackendUrl } from "../../domain/backend-url";
import type { EnvConfig } from "./config.schema";

export function buildBackends(config: EnvConfig): readonly URL[] {
  if (config.BACKENDS) {
    return config.BACKENDS.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(parseBackendUrl);
  }
  return Array.from({ length: config.BACKEND_COUNT }, (_, i) =>
    parseBackendUrl(`http://${config.HOST}:${config.BACKEND_BASE_PORT + i}`),
  );
}
