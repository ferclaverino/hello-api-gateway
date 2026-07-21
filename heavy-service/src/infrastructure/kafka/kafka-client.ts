import {
  Kafka,
  logLevel,
  type Admin,
  type Producer,
  type Consumer,
} from "kafkajs";
import { kafkaBrokers, config } from "../config/config-loader";
import { getTopicName } from "../../adapters/kafka/event.mapper";
import { JobCreatedEvent } from "../../domain/events";

export function createKafka(): Kafka {
  return new Kafka({
    clientId: config.KAFKA_CLIENT_ID,
    brokers: kafkaBrokers,
    logLevel: logLevel.WARN,
  });
}

export class KafkaClientForService {
  readonly admin: Admin;
  readonly producer: Producer;

  private readonly kafka: Kafka;

  constructor() {
    this.kafka = createKafka();
    this.admin = this.kafka.admin();
    this.producer = this.kafka.producer({ allowAutoTopicCreation: false });
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

    const jobCreatedTopic = getTopicName(JobCreatedEvent.name);
    if (!topics.includes(jobCreatedTopic)) {
      missing.push({
        topic: jobCreatedTopic,
        numPartitions: config.KAFKA_TOPIC_PARTITIONS,
      });
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

export class KafkaClientForWorker {
  readonly consumer: Consumer;

  private readonly kafka: Kafka;

  constructor() {
    this.kafka = createKafka();
    this.consumer = this.kafka.consumer({
      groupId: config.GROUP_ID,
      allowAutoTopicCreation: false,
    });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect().catch(() => {});
  }
}
