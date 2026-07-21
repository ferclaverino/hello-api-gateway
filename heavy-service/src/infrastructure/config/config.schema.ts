import { z } from "zod";

export const EnvConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3010),
  HOST: z.string().default("127.0.0.1"),
  KAFKA_BROKERS: z.string().default("127.0.0.1:9092"),
  KAFKA_CLIENT_ID: z.string().default("heavy-service"),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  GROUP_ID: z.string().default("heavy-workers"),
  WORKER_ID: z.string().default("worker-1"),
  MAKE_RESULT_DELAY_MS: z.coerce.number().int().positive().default(10000),
  KAFKA_JOB_TOPIC_PARTITIONS: z.coerce.number().int().positive().default(1),
  KAFKA_JOB_TOPIC_REPLICATION_FACTOR: z.coerce
    .number()
    .int()
    .positive()
    .default(1),
  KAFKA_JOB_TOPIC_WAIT_FOR_LEADERS: z
    .union([z.boolean(), z.literal("true"), z.literal("false")])
    .transform((v) => v === true || v === "true")
    .default(true),
});

export type Config = z.infer<typeof EnvConfigSchema>;
