import { Job, JobId } from "../domain/job";
import { JobQueue } from "./ports/job-queue";
import { JobRepository } from "./ports/job-repository";

export class StartJob {
  constructor(
    private jobCommands: JobQueue,
    private jobRepository: JobRepository,
  ) {}

  execute(): JobId {
    const jobId = this.generateJobId();
    const job = new Job(jobId);

    this.jobCommands.publish(job);
    this.jobRepository.save(job);

    return jobId;
  }

  private generateJobId(): JobId {
    throw new Error("Method not implemented.");
  }
}
