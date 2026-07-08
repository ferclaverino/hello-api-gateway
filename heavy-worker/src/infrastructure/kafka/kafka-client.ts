import { Kafka, logLevel } from "kafkajs";
import { kafkaBrokers } from "../config/config-loader";
import { config } from "../config/config-loader";

export const kafka = new Kafka({
  clientId: config.KAFKA_CLIENT_ID,
  brokers: kafkaBrokers,
  logLevel: logLevel.WARN,
});

export const consumer = kafka.consumer({ groupId: config.GROUP_ID });
export const producer = kafka.producer({ allowAutoTopicCreation: false });
