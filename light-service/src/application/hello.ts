import type { HelloResponse } from "../domain/hello.js";

export function buildHelloResponse(port: number): HelloResponse {
  return { message: "Hello World!", instance: port };
}
