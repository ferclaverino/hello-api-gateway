import { parseBackendUrl, createRoundRobin } from "../util/routing.util";

export type BackendUrl = string & { readonly __brand: unique symbol };

export interface RoundRobin {
  next(): BackendUrl;
}

export interface RouteEntry {
  path: string;
  backends: readonly string[];
  robin: RoundRobin;
}

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
