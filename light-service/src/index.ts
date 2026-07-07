import { createServer } from "./infrastructure/fastify/create-server";
import { config } from "./infrastructure/config/config-loader";
import { registerHelloRoute } from "./infrastructure/fastify/register-hello-route";

const { PORT, HOST } = config;

const app = createServer();

registerHelloRoute(app, PORT);

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Light service listening on port ${PORT}`);
});
