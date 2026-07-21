import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { createJobSchema } from "./schemas/create-job.schema";
import { CreateJob } from "../../application/create-job";
import { toCreateJobResponse } from "../../adapters/fastify/create-job.mapper";

export function registerCreateJobRoute(
  app: FastifyInstance,
  createJob: CreateJob,
): void {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/job",
    schema: createJobSchema,
    handler: async (_request, reply) => {
      const jobId = createJob.execute();
      return reply.code(201).send(toCreateJobResponse(jobId));
    },
  });
}
