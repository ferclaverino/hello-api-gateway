import { toProducerRecord } from "../../adapters/kafka/producer-record.mapper";
import { DomainEvent } from "../../domain/events";
import { EventBus } from "../../domain/ports/event-bus";
import type { KafkaClient } from "./kafka-client";

export class KafkaEventBus implements EventBus {
  constructor(private readonly kafkaClient: KafkaClient) {}

  publish<T extends DomainEvent>(event: T): void {
    this.kafkaClient.producer.send(toProducerRecord(event)).catch(() => {
      console.error(`Failed to publish event: ${event.constructor.name}`);
    });
  }
}
