import { kafka } from "./kafka-client";

export const admin = kafka.admin();

const producer = kafka.producer({ allowAutoTopicCreation: true });

// TODO singleton
export async function connectKafka(): Promise<void> {
  await admin.connect();
  await producer.connect();
}

export async function disconnectKafka(): Promise<void> {
  await producer.disconnect().catch(() => {});
  await admin.disconnect().catch(() => {});
}

export { producer };
