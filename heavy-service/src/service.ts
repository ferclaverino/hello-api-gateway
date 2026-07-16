import { createServer } from "./infrastructure/fastify/create-server";
import { config } from "./infrastructure/config/config-loader";
import { registerMakeResultRoute as registerMakeResultRoute } from "./infrastructure/fastify/register-make-result-route";
import { registerCreateJobRoute } from "./infrastructure/fastify/register-create-job-route";
import { registerGetJobRoute } from "./infrastructure/fastify/register-get-job-route";
import {
  connectKafka,
  disconnectKafka,
} from "./infrastructure/kafka/kafka-connection";
import { CreateJob } from "./application/create-job";
import { GetJob } from "./application/get-job";
import { KafkaJobQueue } from "./infrastructure/kafka/kafka-job-queue";
import { RedisJobRepository } from "./infrastructure/redis/redis-job-repository";
import {
  connectRedis,
  disconnectRedis,
} from "./infrastructure/redis/redis-client";
import { MakeResult } from "./application/make-result";

const { PORT, HOST } = config;

const app = createServer();

const makeResult = new MakeResult(config.MAKE_RESULT_DELAY_MS);

const jobQueue = new KafkaJobQueue();
const jobRepository = new RedisJobRepository();
const createJob = new CreateJob(jobQueue, jobRepository);
const getJob = new GetJob(jobRepository);

async function main() {
  await connectKafka();
  app.log.info("Kafka connected");

  await connectRedis();
  app.log.info("Redis connected");

  registerMakeResultRoute(app, makeResult);
  registerCreateJobRoute(app, createJob);
  registerGetJobRoute(app, getJob);

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Heavy service listening on port ${PORT}`);
}

async function shutdown(signal: string) {
  app.log.info(`${signal} received, shutting down`);
  await app.close().catch(() => {});
  await disconnectRedis();
  await disconnectKafka();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
