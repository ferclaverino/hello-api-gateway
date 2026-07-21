import { Job, JobId } from "../job";

export interface JobRepository {
  save(job: Job): void;
  getById(jobId: JobId): Promise<Job | null>;
}
