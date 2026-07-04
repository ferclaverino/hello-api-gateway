import Fastify from "fastify";
import { config } from "./config.js";
import { helloSchema, type HelloResponse } from "./types.js";

const { PORT, HOST } = config;

const app = Fastify({ logger: true });

app.get("/hello", { schema: helloSchema }, async (): Promise<HelloResponse> => {
  return { message: "Hello World!", instance: PORT };
});

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
