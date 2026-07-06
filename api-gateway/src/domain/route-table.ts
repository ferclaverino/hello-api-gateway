import type { RouteEntry } from "./routing";
import { parseBackendUrl, createRoundRobin } from "./round-robin";

export class RouteTable {
  private entries: RouteEntry[];

  constructor(routes: Record<string, string[]>) {
    this.entries = Object.entries(routes)
      .map(([path, backends]) => ({
        path,
        backends: backends.map(parseBackendUrl),
        robin: createRoundRobin(backends.map(parseBackendUrl)),
      }))
      .sort((a, b) => b.path.length - a.path.length);
  }

  match(url: string): RouteEntry | undefined {
    return this.entries.find(
      (e) =>
        url === e.path ||
        url.startsWith(e.path + "/") ||
        url.startsWith(e.path + "?"),
    );
  }

  getEntries(): RouteEntry[] {
    return this.entries;
  }
}
