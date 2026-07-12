import { kafka } from "./kafka-client";
import { config } from "../config/config-loader";

export const admin = kafka.admin();

const producer = kafka.producer({ allowAutoTopicCreation: false });

export async function connectKafka(): Promise<void> {
  await admin.connect();
  await createTopicsIfMissing();
  await producer.connect();
}

async function createTopicsIfMissing(): Promise<void> {
  const topics = await admin.listTopics();
  const missing: { topic: string; numPartitions: number }[] = [];

  if (!topics.includes(config.WORK_TOPIC)) {
    missing.push({ topic: config.WORK_TOPIC, numPartitions: 2 });
  }
  if (!topics.includes(config.REPLY_TOPIC)) {
    missing.push({ topic: config.REPLY_TOPIC, numPartitions: 4 });
  }
  if (!topics.includes(config.JOB_REQUESTS_TOPIC)) {
    missing.push({ topic: config.JOB_REQUESTS_TOPIC, numPartitions: 2 });
  }

  if (missing.length > 0) {
    await admin.createTopics({
      topics: missing.map((t) => ({
        topic: t.topic,
        numPartitions: t.numPartitions,
        replicationFactor: 1,
      })),
    });
  }
}

export async function disconnectKafka(): Promise<void> {
  await producer.disconnect().catch(() => {});
  await admin.disconnect().catch(() => {});
}

export { producer };
