import type { Consumer } from "kafkajs";
import { kafka } from "./kafka-client";
import { config } from "../config/config-loader";
import type { WorkReply } from "../../domain/execute-request";

type PendingEntry = {
  resolve: (reply: WorkReply) => void;
  reject: (err: Error) => void;
};

const pending = new Map<string, PendingEntry>();

export function registerPending(
  correlationId: string,
): Promise<WorkReply> {
  return new Promise<WorkReply>((resolve, reject) => {
    pending.set(correlationId, { resolve, reject });
  });
}

export function rejectPending(correlationId: string, err: Error): void {
  const entry = pending.get(correlationId);
  if (entry) {
    pending.delete(correlationId);
    entry.reject(err);
  }
}

const consumer: Consumer = kafka.consumer({
  groupId: config.REPLY_CONSUMER_GROUP,
});

export async function startReplyConsumer(): Promise<void> {
  await consumer.connect();
  await consumer.subscribe({
    topic: config.REPLY_TOPIC,
    fromBeginning: false,
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const correlationId =
        (message.headers?.correlationId as Buffer | string | undefined)?.toString() ??
        "";
      const entry = pending.get(correlationId);
      if (!entry) return;

      const reply = JSON.parse(message.value?.toString() ?? "{}") as WorkReply;
      pending.delete(correlationId);
      entry.resolve(reply);
    },
  });
}

export async function stopReplyConsumer(): Promise<void> {
  await consumer.disconnect().catch(() => {});
}
