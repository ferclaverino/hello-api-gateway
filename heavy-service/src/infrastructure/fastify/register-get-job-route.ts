import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { getSchema } from "../../adapters/job/get.schema";
import { GetJob } from "../../application/get-job";

export function registerGetJobRoute(
  app: FastifyInstance,
  getJob: GetJob,
): void {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/job/:jobId",
    schema: getSchema,
    handler: async (request, reply) => {
      const { jobId } = request.params;
      const job = await getJob.execute(jobId);
      if (!job) {
        return reply.code(404).send({ error: "not found" });
      }
      return reply.send({
        jobId: job.jobId,
        status: job.getStatus(),
        result: job.getResult(),
      });
    },
  });
}
