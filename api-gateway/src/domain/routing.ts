export type BackendUrl = string & { readonly __brand: unique symbol };

export interface RoundRobin {
  next(): BackendUrl;
}

export interface RouteEntry {
  path: string;
  backends: readonly string[];
  robin: RoundRobin;
}
