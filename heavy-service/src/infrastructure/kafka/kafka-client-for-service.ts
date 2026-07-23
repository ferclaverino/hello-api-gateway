import { createKafka, type Admin, type Producer } from "./kafka-client";
import { config } from "../config/config-loader";
import { getTopicName, mappers } from "../../adapters/kafka/event.mapper";

export class KafkaClientForService {
  readonly admin: Admin;
  readonly producer: Producer;

  private readonly kafka = createKafka();

  constructor() {
    this.admin = this.kafka.admin();
    this.producer = this.kafka.producer({ kafkaJS: { allowAutoTopicCreation: false } });
  }

  async connect(): Promise<void> {
    await this.admin.connect();
    await this.producer.connect();

    await this.createTopicsIfMissing();
  }

  async disconnect(): Promise<void> {
    await this.admin.disconnect().catch(() => {});
    await this.producer.disconnect().catch(() => {});
  }

  private async createTopicsIfMissing(): Promise<void> {
    const topics = await this.admin.listTopics();
    const missing: { topic: string; numPartitions: number }[] = [];

    for (const name of Object.keys(mappers)) {
      const topic = getTopicName(name);
      if (!topics.includes(topic)) {
        missing.push({
          topic,
          numPartitions: config.KAFKA_TOPIC_PARTITIONS,
        });
      }
    }

    if (missing.length > 0) {
      await this.admin.createTopics({
        topics: missing.map((t) => ({
          topic: t.topic,
          numPartitions: t.numPartitions,
          replicationFactor: 1,
        })),
      });
    }
  }
}
