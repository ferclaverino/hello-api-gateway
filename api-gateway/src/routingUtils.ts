import type { BackendUrl, RouteEntry, RouteTable } from "./types";

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
