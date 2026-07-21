export abstract class DomainEvent {}

export class JobCreatedEvent extends DomainEvent {
  constructor(readonly jobId: string) {
    super();
  }
}
