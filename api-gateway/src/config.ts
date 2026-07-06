import { EnvSchema } from "./infrastructure/config/env.schema";
import { RouteTable } from "./domain/route-table";
import { buildBackends } from "./infrastructure/config/build-backends";
import { loadRoutes } from "./infrastructure/config/yaml-loader";

const env = EnvSchema.parse(process.env);
const yamlRoutes = loadRoutes(env.ROUTES_FILE);

const routeTable = yamlRoutes ? new RouteTable(yamlRoutes) : undefined;

const fallbackBackends = buildBackends(env);

export const config = {
  ...env,
  backends: fallbackBackends,
  routeTable,
};
