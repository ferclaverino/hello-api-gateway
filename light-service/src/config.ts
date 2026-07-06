import { EnvSchema } from "./infrastructure/config/env.schema.js";

const env = EnvSchema.parse(process.env);

export const config = {
  ...env,
};
