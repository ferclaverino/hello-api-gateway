import type { KafkaJS } from "@confluentinc/kafka-javascript";
import { config } from "../config/config-loader";
import { RunJob } from "../../application/run-job";
import { JobCreatedEvent } from "../../domain/events";
import { getTopicName } from "../../adapters/kafka/event.mapper";

export async function startWorker(
  consumer: KafkaJS.Consumer,
  runJob: RunJob,
): Promise<void> {
  await consumer.subscribe({
    topic: getTopicName(JobCreatedEvent.name),
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const jobId = message.value?.toString();

      console.log(`[${config.WORKER_ID}] received job ${jobId}`);

      runJob.execute(jobId as string).then((job) => {
        if (job) {
          console.log(`[${config.WORKER_ID}] completed job ${job.id}`);
        } else {
          console.log(`[${config.WORKER_ID}] job ${jobId} not found`);
        }
      });
    },
  });
}
