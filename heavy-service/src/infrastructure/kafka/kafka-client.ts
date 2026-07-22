import { KafkaJS } from "@confluentinc/kafka-javascript";
import { kafkaBrokers, config } from "../config/config-loader";
import { getTopicName, mappers } from "../../adapters/kafka/event.mapper";

type Kafka = KafkaJS.Kafka;
type Admin = KafkaJS.Admin;
type Producer = KafkaJS.Producer;
type Consumer = KafkaJS.Consumer;

export function createKafka(): Kafka {
  return new KafkaJS.Kafka({
    kafkaJS: {
      clientId: config.KAFKA_CLIENT_ID,
      brokers: kafkaBrokers,
      logLevel: KafkaJS.logLevel.WARN,
    },
  });
}

export class KafkaClientForService {
  readonly admin: Admin;
  readonly producer: Producer;

  private readonly kafka: Kafka;

  constructor() {
    this.kafka = createKafka();
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

export class KafkaClientForWorker {
  readonly consumer: Consumer;

  private readonly kafka: Kafka;
  private readonly admin: Admin;

  constructor() {
    this.kafka = createKafka();
    this.admin = this.kafka.admin();
    this.consumer = this.kafka.consumer({
      kafkaJS: {
        groupId: config.GROUP_ID,
        allowAutoTopicCreation: false,
      },
    });
  }

  async connect(): Promise<void> {
    await this.admin.connect();
    await this.waitForTopic();
    await this.admin.disconnect().catch(() => {});

    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.admin.disconnect().catch(() => {});
    await this.consumer.disconnect().catch(() => {});
  }

  private async waitForTopic(): Promise<void> {
    const expected = Object.keys(mappers).map((name) => getTopicName(name));

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const deadline = Date.now() + config.KAFKA_TOPIC_WAIT_TIMEOUT_MS;
    while (Date.now() < deadline) {
      const topics = await this.admin.listTopics();
      if (expected.every((t) => topics.includes(t))) {
        return;
      }
      await sleep(config.KAFKA_TOPIC_WAIT_INTERVAL_MS);
    }

    throw new Error(
      `Timed out waiting for Kafka topics: ${expected.join(", ")}`,
    );
  }
}
