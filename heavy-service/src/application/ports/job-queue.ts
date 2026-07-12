import { Job } from "../../domain/job";

export interface Queue<T> {
  publish(payload: T): void;
}
