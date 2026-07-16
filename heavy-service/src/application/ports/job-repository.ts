import { Job, JobId } from "../../domain/job";

export interface JobRepository {
  save(job: Job): void;
  getById(jobId: JobId): Promise<Job | null>;
}
