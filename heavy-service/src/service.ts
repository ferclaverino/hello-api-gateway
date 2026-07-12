import { createServer } from "./infrastructure/fastify/create-server";
import { config } from "./infrastructure/config/config-loader";
import { registerExecuteRoute } from "./infrastructure/fastify/register-execute-route";
import { registerStartRoute } from "./infrastructure/fastify/register-start-route";
import { registerGetRoute } from "./infrastructure/fastify/register-get-route";
import { connectKafka, disconnectKafka } from "./infrastructure/kafka/kafka-connection";
import {
  startReplyConsumer,
  stopReplyConsumer,
  registerJob,
  rejectJob,
} from "./infrastructure/kafka/reply-consumer";
import { startJob } from "./infrastructure/kafka/work-producer";
import { RequestReply } from "./application/request-reply";
import { StartJob } from "./application/start-job";
import { GetJob } from "./application/get-job";
import { KafkaJobQueue } from "./infrastructure/kafka/job-queue-adapter";
import { RedisJobRepository } from "./infrastructure/redis/job-repository-adapter";
import { connectRedis, disconnectRedis } from "./infrastructure/redis/redis-client";

const { PORT, HOST } = config;

const app = createServer();

const requestReply = new RequestReply(
  { startJob, registerJob, rejectJob },
  config.REPLY_TIMEOUT_MS,
);

const jobQueue = new KafkaJobQueue();
const jobRepository = new RedisJobRepository();
const startJobUseCase = new StartJob(jobQueue, jobRepository);
const getJobUseCase = new GetJob(jobRepository);

async function main() {
  await connectKafka();
  app.log.info("Kafka connected");

  await connectRedis();
  app.log.info("Redis connected");

  await startReplyConsumer();
  app.log.info("Reply consumer started");

  registerExecuteRoute(app, requestReply);
  registerStartRoute(app, startJobUseCase);
  registerGetRoute(app, getJobUseCase);

  await app.listen({ port: PORT, host: HOST });
  app.log.info(`Heavy service listening on port ${PORT}`);
}

async function shutdown(signal: string) {
  app.log.info(`${signal} received, shutting down`);
  await app.close().catch(() => {});
  await stopReplyConsumer();
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
