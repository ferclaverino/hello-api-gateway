import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import YAML from "yaml";

export function loadRoutes(filePath: string): Record<string, string[]> | undefined {
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
