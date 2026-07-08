import { Config, EnvConfigSchema } from "./config.schema";

const env = EnvConfigSchema.parse(process.env);

export const config: Config = {
  ...env,
};

export const kafkaBrokers = config.KAFKA_BROKERS.split(",").map((b) => b.trim());
