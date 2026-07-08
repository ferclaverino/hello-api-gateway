export function buildUpstreamHeaders(
  requestHeaders: Record<string, string | string[] | undefined>,
  backendUrl: URL,
): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(requestHeaders)) {
    if (value !== undefined) {
      headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
  }
  headers.set("host", backendUrl.host);
  return headers;
}
