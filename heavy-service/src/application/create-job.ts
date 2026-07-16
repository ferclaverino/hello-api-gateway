import { v7 as uuidv7 } from "uuid";
import { Job, JobId } from "../domain/job";
import { Queue } from "./ports/job-queue";
import { JobRepository } from "./ports/job-repository";

export class CreateJob {
  constructor(
    private jobRequestQueue: Queue<Job>,
    private jobRepository: JobRepository,
  ) {}

  execute(): JobId {
    const jobId = this.generateJobId();
    const job = new Job(jobId);

    this.jobRequestQueue.publish(job);
    this.jobRepository.save(job);

    return jobId;
  }

  private generateJobId(): JobId {
    return uuidv7();
  }
}
