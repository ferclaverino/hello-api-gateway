import Fastify from "fastify";
import type { ZodTypeProvider } from "@fastify/type-provider-zod";
import { serializerCompiler, validatorCompiler } from "@fastify/type-provider-zod";
import { config } from "./config.js";
import { helloSchema, type HelloResponse } from "./types.js";

const { PORT, HOST } = config;

const app = Fastify({ logger: true });
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.withTypeProvider<ZodTypeProvider>().get("/hello", { schema: helloSchema }, async (): Promise<HelloResponse> => {
  return { message: "Hello World!", instance: PORT };
});

app.listen({ port: PORT, host: HOST }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
