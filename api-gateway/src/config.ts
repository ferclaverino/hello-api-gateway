import { EnvSchema } from "./model/config.model";
import { RouteTable } from "./model/routing.model";
import { buildBackends } from "./util/config.util";
import { loadRoutes } from "./data/config.data";

const env = EnvSchema.parse(process.env);
const yamlRoutes = loadRoutes(env.ROUTES_FILE);

const routeTable = yamlRoutes ? new RouteTable(yamlRoutes) : undefined;

const fallbackBackends = buildBackends(env);

export const config = {
  ...env,
  backends: fallbackBackends,
  routeTable,
};
