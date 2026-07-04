import Fastify from "fastify";

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "127.0.0.1";

const app = Fastify({ logger: true });

app.get("/hello", async () => {
  return { message: "Hello World!", instance: PORT };
});

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
