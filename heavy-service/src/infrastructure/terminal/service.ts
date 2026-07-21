import { createServer } from "../fastify/create-server";
import { config } from "../config/config-loader";
import { registerMakeResultRoute as registerMakeResultRoute } from "../fastify/register-make-result-route";
import { registerCreateJobRoute } from "../fastify/register-create-job-route";
import { registerGetJobRoute } from "../fastify/register-get-job-route";
import { registerStatusRoute } from "../fastify/register-status-route";
import { KafkaClientForService } from "../kafka/kafka-client";
import { CreateJob } from "../../application/create-job";
import { GetJob } from "../../application/get-job";
import { RedisJobRepository } from "../redis/redis-job-repository";
import { connectRedis, disconnectRedis } from "../redis/redis-client";
import { MakeResult } from "../../application/make-result";
import { KafkaEventBus } from "../kafka/kafka-event-bus";

const { PORT, HOST } = config;

const app = createServer();

const kafkaClient = new KafkaClientForService();

const makeResult = new MakeResult(config.MAKE_RESULT_DELAY_MS);

const jobRepository = new RedisJobRepository();
const kafkaEventBus = new KafkaEventBus(kafkaClient.producer);
const createJob = new CreateJob(jobRepository, kafkaEventBus);
const getJob = new GetJob(jobRepository);

async function main() {
  await kafkaClient.connect();
  app.log.info("Kafka connected");

  await connectRedis();
  app.log.info("Redis connected");

  registerMakeResultRoute(app, makeResult);
  registerCreateJobRoute(app, createJob);
  registerGetJobRoute(app, getJob);
  registerStatusRoute(app, kafkaClient.admin);

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Heavy service listening on port ${PORT}`);
}

async function shutdown(signal: string) {
  app.log.info(`${signal} received, shutting down`);
  await app.close().catch(() => {});
  await disconnectRedis();
  await kafkaClient.disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

main().catch((err) => {
  app.log.error(err);
  process.exit(1);
});
