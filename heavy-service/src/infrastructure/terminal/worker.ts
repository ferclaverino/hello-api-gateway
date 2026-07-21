import { startWorker } from "../kafka/work-consumer";
import { KafkaClient } from "../kafka/kafka-client";
import { config } from "../config/config-loader";

const kafkaClient = new KafkaClient();

async function main() {
  console.log(
    `Starting heavy-worker id=${config.WORKER_ID} group=${config.GROUP_ID}`,
  );
  await kafkaClient.connectConsumer();
  await startWorker(kafkaClient.consumer);
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
