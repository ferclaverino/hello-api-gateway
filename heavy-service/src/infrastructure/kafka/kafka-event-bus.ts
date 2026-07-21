import { toProducerRecord } from "../../adapters/kafka/producer-record.mapper";
import { DomainEvent } from "../../domain/events";
import { EventBus } from "../../domain/ports/event-bus";
import { producer } from "./kafka-connection";

export class KafkaEventBus implements EventBus {
  publish<T extends DomainEvent>(event: T): void {
    producer.send(toProducerRecord(event)).catch(() => {
      console.error(`Failed to publish event: ${event.constructor.name}`);
    });
  }
}
