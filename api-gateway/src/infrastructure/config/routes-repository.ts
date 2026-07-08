import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";
import { parseBackendUrl } from "../../domain/backend-url";

export function loadRoutes(
  filePath: string,
): Record<string, URL[]> | undefined {
  try {
    const content = readFileSync(resolve(filePath), "utf-8");
    const doc = YAML.parse(content);
    if (doc?.routes && typeof doc.routes === "object") {
      const raw = doc.routes as Record<string, string[]>;
      const parsed: Record<string, URL[]> = {};
      for (const [path, backends] of Object.entries(raw)) {
        parsed[path] = backends.map(parseBackendUrl);
      }
      return parsed;
    }
    return undefined;
  } catch {
    return undefined;
  }
}
