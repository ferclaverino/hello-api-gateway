import { KafkaJS } from "@confluentinc/kafka-javascript";
import { kafkaBrokers, config } from "../config/config-loader";

export type Kafka = KafkaJS.Kafka;
export type Admin = KafkaJS.Admin;
export type Producer = KafkaJS.Producer;
export type Consumer = KafkaJS.Consumer;

export function createKafka(): Kafka {
  return new KafkaJS.Kafka({
    kafkaJS: {
      clientId: config.KAFKA_CLIENT_ID,
      brokers: kafkaBrokers,
      logLevel: KafkaJS.logLevel.WARN,
    },
  });
}
