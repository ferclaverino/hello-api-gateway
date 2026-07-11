import type { LoadBalancer } from "./route-entry";

export class RoundRobinLoadBalancer implements LoadBalancer {
  private index = 0;

  constructor(private readonly backends: readonly URL[]) {}

  next(): URL {
    return this.backends[this.index++ % this.backends.length];
  }
}
