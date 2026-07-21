import { ProducerRecord } from "kafkajs";
import { DomainEvent, JobCreatedEvent } from "../../domain/events";

interface EventMapper<E extends DomainEvent> {
  topic: string;
  toMessage(event: E): string;
}

const mappers: Record<string, EventMapper<DomainEvent>> = {
  [JobCreatedEvent.name]: {
    topic: "job.created",
    toMessage: (event: JobCreatedEvent) =>
      JSON.stringify({ jobId: event.jobId }),
  },
};

export function toProducerRecord(domainEvent: DomainEvent): ProducerRecord {
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
