import { Config, EnvConfigSchema } from "./config.schema";

const env = EnvConfigSchema.parse(process.env);

export const config: Config = {
  ...env,
};
