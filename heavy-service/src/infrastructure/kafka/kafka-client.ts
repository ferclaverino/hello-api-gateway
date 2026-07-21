import {
  Kafka,
  logLevel,
  type Admin,
  type Producer,
  type Consumer,
} from "kafkajs";
import { kafkaBrokers, config } from "../config/config-loader";

export class KafkaClient {
  readonly admin: Admin;
  readonly producer: Producer;
  readonly consumer: Consumer;

  private readonly kafka: Kafka;
  private adminConnected = false;
  private producerConnected = false;
  private consumerConnected = false;

  constructor() {
    this.kafka = new Kafka({
      clientId: config.KAFKA_CLIENT_ID,
      brokers: kafkaBrokers,
      logLevel: logLevel.WARN,
    });
    this.admin = this.kafka.admin();
    this.producer = this.kafka.producer({ allowAutoTopicCreation: true });
    this.consumer = this.kafka.consumer({
      groupId: config.GROUP_ID,
      allowAutoTopicCreation: true,
    });
  }

  async connectAdmin(): Promise<void> {
    await this.admin.connect();
    this.adminConnected = true;
  }

  async connectProducer(): Promise<void> {
    await this.producer.connect();
    this.producerConnected = true;
  }

  async connectConsumer(): Promise<void> {
    await this.consumer.connect();
    this.consumerConnected = true;
  }

  async disconnect(): Promise<void> {
    if (this.producerConnected)
      await this.producer.disconnect().catch(() => {});
    if (this.consumerConnected)
      await this.consumer.disconnect().catch(() => {});
    if (this.adminConnected) await this.admin.disconnect().catch(() => {});
  }
}
