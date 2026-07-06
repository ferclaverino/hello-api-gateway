import type { BackendUrl, RoundRobin } from "./routing";

export function parseBackendUrl(raw: string): BackendUrl {
  try {
    new URL(raw);
    return raw as BackendUrl;
  } catch {
    throw new Error(`Invalid backend URL: ${raw}`);
  }
}

export function createRoundRobin(backends: readonly string[]): RoundRobin {
  let index = 0;
  return {
    next(): BackendUrl {
      return backends[index++ % backends.length] as BackendUrl;
    },
  };
}
