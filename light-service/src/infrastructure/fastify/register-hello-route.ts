import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { helloSchema } from "../../adapters/hello/hello.schema";
import { toHelloResponse } from "../../adapters/hello/hello.mapper";

export function registerHelloRoute(app: FastifyInstance, port: number): void {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/hello", { schema: helloSchema }, async () => {
      return toHelloResponse(port);
    });
}
