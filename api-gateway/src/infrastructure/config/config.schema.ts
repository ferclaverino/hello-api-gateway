import { z } from "zod";

export const EnvConfigSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("127.0.0.1"),
  BACKENDS: z.string().optional(),
  BACKEND_COUNT: z.coerce.number().int().positive().default(2),
  BACKEND_BASE_PORT: z.coerce.number().int().positive().default(3001),
  ROUTES_FILE: z.string().default("routes.yaml"),
});

export type EnvConfig = z.infer<typeof EnvConfigSchema>;

export type Config = EnvConfig & {
  fallbackBackends: readonly URL[];
  routes?: Record<string, URL[]>;
};
