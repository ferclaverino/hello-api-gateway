import type { Consumer } from "kafkajs";
import { config } from "../config/config-loader";

export async function startWorker(consumer: Consumer): Promise<void> {
  await consumer.subscribe({
    topic: "job.created",
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const jobId = message.value?.toString();

      console.log(`[${config.WORKER_ID}] received job ${jobId}`);
    },
  });
}
