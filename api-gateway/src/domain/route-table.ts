import type { RouteEntry } from "./route-entry";
import { RoundRobinLoadBalancer } from "./round-robin-load-balancer";

export class RouteTable {
  private entries: RouteEntry[];

  constructor(routes: Record<string, URL[]>) {
    this.entries = Object.entries(routes)
      .map(([path, backends]) => ({
        path,
        backends,
        loadBalancer: new RoundRobinLoadBalancer(backends),
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
