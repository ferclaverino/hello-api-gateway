import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { executeSchema } from "../../adapters/execute/execute.schema";
import {
  toExecuteResponse,
  toTimeoutResponse,
} from "../../adapters/execute/execute.mapper";
import { executeUseCase, TimeoutError } from "../../application/execute-use-case";

export function registerExecuteRoute(app: FastifyInstance): void {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/execute",
    schema: executeSchema,
    handler: async (request, reply) => {
      const { task } = request.body;
      try {
        const { jobId, reply: workReply } = await executeUseCase({ task });
        return reply.send(toExecuteResponse(jobId, workReply));
      } catch (err) {
        if (err instanceof TimeoutError) {
          return reply.code(504).send(toTimeoutResponse(err.jobId));
        }
        throw err;
      }
    },
  });
}
