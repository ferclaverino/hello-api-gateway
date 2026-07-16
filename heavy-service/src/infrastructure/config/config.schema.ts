import { z } from "zod";

export const EnvConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3010),
  HOST: z.string().default("127.0.0.1"),
  KAFKA_BROKERS: z.string().default("127.0.0.1:9092"),
  KAFKA_CLIENT_ID: z.string().default("heavy-service"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  // TODO use job.create from domain events
  JOB_REQUESTS_TOPIC: z.string().default("job.requests"),
  GROUP_ID: z.string().default("heavy-workers"),
  WORKER_ID: z.string().default("worker-1"),
  MAKE_RESULT_DELAY_MS: z.coerce.number().int().positive().default(10000),
});

export type Config = z.infer<typeof EnvConfigSchema>;
