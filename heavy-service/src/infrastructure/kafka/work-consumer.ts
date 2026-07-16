import { kafka } from "./kafka-client";
import { config } from "../config/config-loader";
import { Job } from "../../domain/job";

const consumer = kafka.consumer({ groupId: config.GROUP_ID });
const producer = kafka.producer({ allowAutoTopicCreation: false });

export async function startWorker(): Promise<void> {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({
    topic: config.JOB_REQUESTS_TOPIC,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const jobId = message.value?.toString();

      console.log(`[${config.WORKER_ID}] received job ${jobId}`);
    },
  });
}

export async function stopWorker(): Promise<void> {
  await consumer.disconnect().catch(() => {});
  await producer.disconnect().catch(() => {});
}
