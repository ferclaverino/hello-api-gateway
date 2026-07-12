import { Job } from "../../domain/job";

export interface JobQueue {
  publish(job: Job): void;
}
