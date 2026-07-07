export interface LoadBalancer {
  next(): URL;
}

export interface RouteEntry {
  path: string;
  backends: readonly URL[];
  loadBalancer: LoadBalancer;
}
