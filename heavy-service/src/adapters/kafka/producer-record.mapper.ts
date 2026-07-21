import { ProducerRecord } from "kafkajs";
import { DomainEvent, JobCreatedEvent } from "../../domain/events";

export function toProducerRecord(domainEvent: DomainEvent): ProducerRecord {
  const topic = toTopicName(domainEvent);
  const messageValue = JSON.stringify(domainEvent);

  return {
    topic,
    messages: [
      {
        value: messageValue,
      },
    ],
  };
}

export function toTopicName(domainEvent: DomainEvent): string {
  if (domainEvent instanceof JobCreatedEvent) {
    return "job.created";
  }
  throw new Error(`Unhandled event type: ${domainEvent.constructor.name}`);
}

export function toMessage(domainEvent: DomainEvent): string {
  return JSON.stringify(domainEvent);
}
