import { startWorker, stopWorker } from "./infrastructure/kafka/work-consumer";
import { config } from "./infrastructure/config/config-loader";

async function main() {
  console.log(
    `Starting heavy-worker id=${config.WORKER_ID} group=${config.GROUP_ID}`,
  );
  await startWorker();
  console.log(`heavy-worker ${config.WORKER_ID} ready`);
}

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down worker ${config.WORKER_ID}`);
  await stopWorker();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
