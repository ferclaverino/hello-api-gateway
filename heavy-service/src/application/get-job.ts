import { Job, JobId } from "../domain/job";
import { JobRepository } from "./ports/job-repository";

export class GetJob {
  constructor(private jobRepository: JobRepository) {}

  async execute(jobId: JobId): Promise<Job | null> {
    return this.jobRepository.getById(jobId);
  }
}
