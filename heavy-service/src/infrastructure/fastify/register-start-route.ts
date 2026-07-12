import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { startSchema } from "../../adapters/job/start.schema";
import { StartJob } from "../../application/start-job";

export function registerStartRoute(
  app: FastifyInstance,
  startJob: StartJob,
): void {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/start",
    schema: startSchema,
    handler: async (_request, reply) => {
      const jobId = startJob.execute();
      return reply.code(201).send({ jobId });
    },
  });
}
