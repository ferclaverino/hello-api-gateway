import { createServer } from "./infrastructure/fastify/create-server";
import { config } from "./infrastructure/config/config-loader";
import { registerProxyHook } from "./infrastructure/fastify/register-proxy-hook";
import { registerHealthRoute } from "./infrastructure/fastify/register-health-route";
import { RouteTable } from "./domain/route-table";

const { PORT, HOST, fallbackBackends, routes } = config;
const routeTable = routes ? new RouteTable(routes) : undefined;

const app = createServer();

if (routeTable) {
  registerProxyHook(app, routeTable);
}

registerHealthRoute(app, routeTable, fallbackBackends);

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`API Gateway listening on port ${PORT}`);
  if (routeTable) {
    for (const entry of routeTable.getEntries()) {
      app.log.info(`  ${entry.path} -> ${entry.backends.join(", ")}`);
    }
  } else {
    app.log.info(`Fallback backends: ${fallbackBackends.join(", ")}`);
  }
});
