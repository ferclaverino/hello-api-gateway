import { Config, EnvConfigSchema } from "./config.schema";
import { buildBackends } from "./build-backends";
import { loadRoutes } from "./routes-repository";

const env = EnvConfigSchema.parse(process.env);
const routes = loadRoutes(env.ROUTES_FILE);
const fallbackBackends = buildBackends(env);

export const config: Config = {
  ...env,
  fallbackBackends: fallbackBackends,
  routes,
};
