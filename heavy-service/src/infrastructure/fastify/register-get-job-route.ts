import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { getJobSchema } from "./schemas/get-job.schema";
import { GetJob } from "../../application/get-job";
import { toGetJobResponse } from "../../adapters/fastify/get-job.adapter";

export function registerGetJobRoute(
  app: FastifyInstance,
  getJob: GetJob,
): void {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/job/:jobId",
    schema: getJobSchema,
    handler: async (request, reply) => {
      const { jobId } = request.params;
      const job = await getJob.execute(jobId);
      if (!job) {
        return reply.code(404).send({ error: "not found" });
      }
      return reply.send(toGetJobResponse(job));
    },
  });
}
