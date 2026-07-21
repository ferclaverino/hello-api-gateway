import { Job, JobId } from "../domain/job";
import { JobRepository } from "../domain/ports/job-repository";
import { MakeResult } from "./make-result";

export class RunJob {
  constructor(
    private jobRepository: JobRepository,
    private makeResult: MakeResult,
  ) {}

  async execute(jobId: JobId): Promise<Job | null> {
    const job = await this.jobRepository.getById(jobId);
    if (!job) {
      return null;
    }

    job.start();
    this.jobRepository.save(job);

    const result = await this.makeResult.execute();

    job.complete(result);
    this.jobRepository.save(job);

    return job;
  }
}
