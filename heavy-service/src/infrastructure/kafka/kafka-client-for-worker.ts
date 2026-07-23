import { createKafka, type Admin, type Consumer } from "./kafka-client";
import { config } from "../config/config-loader";
import { getTopicName, mappers } from "../../adapters/kafka/event.mapper";

export class KafkaClientForWorker {
  readonly consumer: Consumer;

  private readonly kafka = createKafka();
  private readonly admin: Admin;

  constructor() {
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
