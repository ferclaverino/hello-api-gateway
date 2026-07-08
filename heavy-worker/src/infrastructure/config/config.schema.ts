import { z } from "zod";

export const EnvConfigSchema = z.object({
  KAFKA_BROKERS: z.string().default("127.0.0.1:9092"),
  KAFKA_CLIENT_ID: z.string().default("heavy-worker"),
  WORK_TOPIC: z.string().default("heavy-work"),
  REPLY_TOPIC: z.string().default("heavy-reply"),
  GROUP_ID: z.string().default("heavy-workers"),
  WORKER_ID: z.string().default("worker-1"),
  WORK_DELAY_MS: z.coerce.number().int().positive().default(10000),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

export type Config = EnvConfig;
