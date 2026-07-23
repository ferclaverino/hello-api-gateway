import type { KafkaJS } from "@confluentinc/kafka-javascript";
import { config } from "../config/config-loader";
import { RunJob } from "../../application/run-job";
import { JobCreatedEvent } from "../../domain/events";
import { fromMessage, getTopicName } from "../../adapters/kafka/event.mapper";

export class JobWorker {
  constructor(
    private consumer: KafkaJS.Consumer,
    private runJob: RunJob,
  ) {}

  async start(): Promise<void> {
    await this.consumer.subscribe({
      topic: getTopicName(JobCreatedEvent.name),
    });

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const jobId = message.value?.toString();
        const jobCreatedEvent = fromMessage<JobCreatedEvent>(
          getTopicName(JobCreatedEvent.name),
          jobId as string,
        );
        console.log(
          `[${config.WORKER_ID}] received job ${jobCreatedEvent.jobId}`,
        );

        this.runJob.execute(jobCreatedEvent.jobId).then((job) => {
          if (job) {
            console.log(`[${config.WORKER_ID}] completed job ${job.id}`);
          } else {
            console.log(`[${config.WORKER_ID}] job ${jobId} not found`);
          }
        });
      },
    });
  }
}
