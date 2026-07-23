import type { KafkaJS } from "@confluentinc/kafka-javascript";
import { DomainEvent, JobCreatedEvent } from "../../domain/events";

interface EventMapper<E extends DomainEvent> {
  topic: string;
  toMessage(event: E): string;
  fromMessage(message: string): E;
}

export const mappers: Record<string, EventMapper<DomainEvent>> = {
  [JobCreatedEvent.name]: {
    topic: "job.created",
    toMessage: (event: JobCreatedEvent) =>
      JSON.stringify({ jobId: event.jobId }),
    fromMessage: (message: string) => {
      const parsed = JSON.parse(message);
      return new JobCreatedEvent(parsed.jobId);
    },
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

export function fromMessage<E extends DomainEvent>(
  topic: string,
  message: string,
): E {
  const mapper: EventMapper<DomainEvent> | undefined = Object.values(
    mappers,
  ).find((m) => m.topic === topic);
  if (!mapper) {
    throw new Error(`Unhandled topic: ${topic}`);
  }
  return mapper.fromMessage(message) as E;
}

export function getTopicName(eventName: string): string {
  const mapper: EventMapper<DomainEvent> | undefined = mappers[eventName];
  if (!mapper) {
    throw new Error(`Unhandled event type: ${eventName}`);
  }
  return mapper.topic;
}
