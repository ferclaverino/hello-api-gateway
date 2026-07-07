import type { HelloResponse } from "./hello.schema";

export function toHelloResponse(port: number): HelloResponse {
  return { message: "Hello World!", instance: port };
}
