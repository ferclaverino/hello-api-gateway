import type { LoadBalancer } from "./route-entry";

export function createRoundRobinLoadBalancer(
  backends: readonly URL[],
): LoadBalancer {
  let index = 0;
  return {
    next(): URL {
      return backends[index++ % backends.length];
    },
  };
}
