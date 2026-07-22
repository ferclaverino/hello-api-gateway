import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { statusSchema } from "./schemas/status.schema";
import { getTopicStats } from "../kafka/kafka-topic-stats";
import { toStatusResponse } from "../../adapters/fastify/status.mapper";
import type { KafkaJS } from "@confluentinc/kafka-javascript";

export function registerStatusRoute(app: FastifyInstance, admin: KafkaJS.Admin): void {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/status",
    schema: statusSchema,
    handler: async (_request, reply) => {
      const stats = await getTopicStats(admin);
      return reply.send(toStatusResponse(stats));
    },
  });
}
