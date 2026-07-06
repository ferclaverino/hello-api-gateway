import { createServer } from "./server.js";
import { config } from "./config.js";
import { registerHelloRoute } from "./adapters/routes/hello.js";

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
