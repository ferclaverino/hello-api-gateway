import { Job, JobId } from "../domain/job";
import { Result } from "../domain/result";
import { Queue } from "./ports/job-queue";
import { JobRepository } from "./ports/job-repository";

export class ExecuteJob {
  constructor(
    private jobResultQueue: Queue<Job>,
    private jobRepository: JobRepository,
  ) {}

  async execute(
    jobId: JobId,
    workerId: string,
    delayMs: number,
  ): Promise<void> {
    const job = await this.jobRepository.getById(jobId);

    if (!job) return;

    job.start();
    this.jobRepository.save(job);

    const result = await this.makeResult(workerId, delayMs);
    job.complete(result);
    this.jobRepository.save(job);

    // For request-reply
    this.jobResultQueue.publish(job);
  }

  private async makeResult(workerId: string, delayMs: number): Promise<Result> {
    const start = Date.now();
    await this.sleep(delayMs);
    const durationMs = Date.now() - start;

    return new Result(
      { message: "Job completed successfully" },
      workerId,
      durationMs,
    );
  }

  private async sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }
}
