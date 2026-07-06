import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { z } from "zod";
import { buildHelloResponse } from "../../application/hello.js";

const helloSchema = {
  response: {
    200: z.object({
      message: z.string(),
      instance: z.number(),
    }),
  },
};

export function registerHelloRoute(app: FastifyInstance, port: number): void {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get("/hello", { schema: helloSchema }, async () => {
      return buildHelloResponse(port);
    });
}
