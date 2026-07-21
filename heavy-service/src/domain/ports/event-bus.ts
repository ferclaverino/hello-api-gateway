import { DomainEvent } from "../events";

export interface EventBus {
  publish<T extends DomainEvent>(event: T): void;
}
