import { createServer } from "./server";
import { config } from "./config";
import { registerProxyHook } from "./adapters/hooks/proxy-hook";
import { registerHealthRoute } from "./adapters/routes/health";

const { PORT, HOST, backends, routeTable } = config;

const app = createServer();

if (routeTable) {
  registerProxyHook(app, routeTable);
}

registerHealthRoute(app, routeTable, backends);

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
    app.log.info(`Backends: ${backends.join(", ")}`);
  }
});
