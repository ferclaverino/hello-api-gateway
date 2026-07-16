import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { makeResultSchema } from "./schemas/make-result.schema";
import { MakeResult } from "../../application/make-result";

export function registerMakeResultRoute(
  app: FastifyInstance,
  makeResult: MakeResult,
): void {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/job/execute",
    schema: makeResultSchema,
    handler: async (request, reply) => {
      const result = await makeResult.execute();
      return reply.send(result);
    },
  });
}
