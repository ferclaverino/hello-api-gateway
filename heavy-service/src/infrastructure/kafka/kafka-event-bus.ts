import { Producer } from "kafkajs";
import { toMessage } from "../../adapters/kafka/event.mapper";
import { DomainEvent } from "../../domain/events";
import { EventBus } from "../../domain/ports/event-bus";

export class KafkaEventBus implements EventBus {
  constructor(private readonly producer: Producer) {}

  publish<T extends DomainEvent>(event: T): void {
    this.producer.send(toMessage(event)).catch(() => {
      console.error(`Failed to publish event: ${event.constructor.name}`);
    });
  }
}
