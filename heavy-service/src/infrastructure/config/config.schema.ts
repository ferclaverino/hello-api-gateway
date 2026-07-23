import { z } from "zod";

export const EnvConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3010),
  HOST: z.string().default("127.0.0.1"),
  KAFKA_BROKERS: z.string().default("127.0.0.1:9092"),
  KAFKA_CLIENT_ID: z.string().default("heavy-service"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  KAFKA_GROUP_ID: z.string().default("heavy-workers"),
  WORKER_ID: z.string().default("worker-1"),
  MAKE_RESULT_DELAY_MS: z.coerce.number().int().positive().default(10000),
  KAFKA_TOPIC_PARTITIONS: z.coerce.number().int().positive().default(4),
  KAFKA_WAIT_FOR_TOPIC_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(2000),
  KAFKA_WAIT_FOR_TOPIC_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .positive()
    .default(60000),
});

export type Config = z.infer<typeof EnvConfigSchema>;
