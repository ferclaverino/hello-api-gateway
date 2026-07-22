import type { KafkaJS } from "@confluentinc/kafka-javascript";
import { DomainEvent, JobCreatedEvent } from "../../domain/events";

interface EventMapper<E extends DomainEvent> {
  topic: string;
  toMessage(event: E): string;
}

export const mappers: Record<string, EventMapper<DomainEvent>> = {
  [JobCreatedEvent.name]: {
    topic: "job.created",
    toMessage: (event: JobCreatedEvent) =>
      JSON.stringify({ jobId: event.jobId }),
  },
};

export function toMessage(domainEvent: DomainEvent): KafkaJS.ProducerRecord {
  const mapper: EventMapper<DomainEvent> | undefined =
    mappers[domainEvent.constructor.name];
  if (!mapper) {
    throw new Error(`Unhandled event type: ${domainEvent.constructor.name}`);
  }
  return {
    topic: mapper.topic,
    messages: [{ value: mapper.toMessage(domainEvent) }],
  };
}

export function getTopicName(eventName: string): string {
  const mapper: EventMapper<DomainEvent> | undefined = mappers[eventName];
  if (!mapper) {
    throw new Error(`Unhandled event type: ${eventName}`);
  }
  return mapper.topic;
}
