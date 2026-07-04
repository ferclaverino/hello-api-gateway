import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3001),
  HOST: z.string().default("127.0.0.1"),
});

export type EnvConfig = z.infer<typeof EnvSchema>;
export const config = EnvSchema.parse(process.env);
