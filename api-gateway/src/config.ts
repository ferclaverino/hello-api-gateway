import { z } from "zod";
import { parseBackendUrl } from "./types.js";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("127.0.0.1"),
  BACKENDS: z.string().optional(),
  BACKEND_COUNT: z.coerce.number().int().positive().default(2),
  BACKEND_BASE_PORT: z.coerce.number().int().positive().default(3001),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

function buildBackends(config: EnvConfig): readonly string[] {
  if (config.BACKENDS) {
    return config.BACKENDS.split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map(parseBackendUrl);
  }
  return Array.from(
    { length: config.BACKEND_COUNT },
    (_, i) => parseBackendUrl(`http://${config.HOST}:${config.BACKEND_BASE_PORT + i}`),
  );
}

const env = EnvSchema.parse(process.env);
export const config = { ...env, backends: buildBackends(env) };
