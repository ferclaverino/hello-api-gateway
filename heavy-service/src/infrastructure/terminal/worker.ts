import { startWorker } from "../kafka/job-worker";
import { KafkaClient } from "../kafka/kafka-client";
import { config } from "../config/config-loader";
import { RunJob } from "../../application/run-job";
import { RedisJobRepository } from "../redis/redis-job-repository";
import { MakeResult } from "../../application/make-result";

const kafkaClient = new KafkaClient();
const makeResult = new MakeResult(config.MAKE_RESULT_DELAY_MS);
const jobRepository = new RedisJobRepository();
const runJob = new RunJob(jobRepository, makeResult);

async function main() {
  console.log(
    `Starting heavy-worker id=${config.WORKER_ID} group=${config.GROUP_ID}`,
  );
  await kafkaClient.connectConsumer();
  await startWorker(kafkaClient.consumer, runJob);
  console.log(`heavy-worker ${config.WORKER_ID} ready`);
}

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down worker ${config.WORKER_ID}`);
  await kafkaClient.disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
