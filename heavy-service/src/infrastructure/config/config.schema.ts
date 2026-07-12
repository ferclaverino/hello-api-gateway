import { z } from "zod";

export const EnvConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3010),
  HOST: z.string().default("127.0.0.1"),
  KAFKA_BROKERS: z.string().default("127.0.0.1:9092"),
  KAFKA_CLIENT_ID: z.string().default("heavy-service"),
  WORK_TOPIC: z.string().default("heavy-work"),
  REPLY_TOPIC: z.string().default("heavy-reply"),
  REPLY_CONSUMER_GROUP: z.string().default("heavy-service-replies"),
  REPLY_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  REDIS_URL: z.string().default("redis://127.0.0.1:6379"),
  JOB_REQUESTS_TOPIC: z.string().default("job.requests"),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

export type Config = EnvConfig;
