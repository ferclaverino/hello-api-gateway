import { Kafka, logLevel } from "kafkajs";
import { kafkaBrokers } from "../config/config-loader";

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID ?? "heavy-service",
  brokers: kafkaBrokers,
  logLevel: logLevel.WARN,
});
