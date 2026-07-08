import { consumer, producer } from "./kafka-client";
import { config } from "../config/config-loader";
import type { WorkPayload, WorkReply } from "../../domain/work-job";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function startWorker(): Promise<void> {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({
    topic: config.WORK_TOPIC,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const correlationId =
        (message.headers?.correlationId as Buffer | string | undefined)?.toString() ??
        "";
      const payload = JSON.parse(
        message.value?.toString() ?? "{}",
      ) as WorkPayload;

      console.log(
        `[${config.WORKER_ID}] received job ${correlationId} task="${payload.task}"`,
      );

      const start = Date.now();
      await sleep(config.WORK_DELAY_MS);
      const durationMs = Date.now() - start;

      const reply: WorkReply = {
        workerId: config.WORKER_ID,
        durationMs,
      };

      await producer.send({
        topic: config.REPLY_TOPIC,
        messages: [
          {
            key: correlationId,
            value: JSON.stringify(reply),
            headers: { correlationId },
          },
        ],
      });

      console.log(
        `[${config.WORKER_ID}] replied to ${correlationId} in ${durationMs}ms`,
      );
    },
  });
}

export async function stopWorker(): Promise<void> {
  await consumer.disconnect().catch(() => {});
  await producer.disconnect().catch(() => {});
}
