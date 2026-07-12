import { Job, JobId } from "../domain/job";
import { JobRepository } from "./ports/job-repository";

export class GetJob {
  constructor(private jobRepository: JobRepository) {}

  execute(jobId: JobId): Job | undefined {
    return this.jobRepository.getById(jobId);
  }
}
