import { Job, JobId } from "../domain/job";
import { MakeResult } from "./make-result";
import { Queue } from "./ports/job-queue";
import { JobRepository } from "./ports/job-repository";

export class ExecuteJob {
  constructor(
    private jobResultQueue: Queue<Job>,
    private jobRepository: JobRepository,
    private makeResult: MakeResult,
  ) {}

  async execute(jobId: JobId, workerId: string): Promise<void> {
    const job = await this.jobRepository.getById(jobId);

    if (!job) return;

    job.start();
    this.jobRepository.save(job);

    const result = await this.makeResult.execute(workerId);
    job.complete(result);
    this.jobRepository.save(job);

    // For request-reply
    // TODO remove
    this.jobResultQueue.publish(job);
  }
}
