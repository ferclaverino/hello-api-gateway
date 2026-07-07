export function parseBackendUrl(raw: string): URL {
  try {
    return new URL(raw);
  } catch {
    throw new Error(`Invalid backend URL: ${raw}`);
  }
}
