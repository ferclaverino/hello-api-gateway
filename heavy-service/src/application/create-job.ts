import { v7 as uuidv7 } from "uuid";
import { Job, JobId } from "../domain/job";
import { JobRepository } from "../domain/ports/job-repository";
import { EventBus } from "../domain/ports/event-bus";
import { JobCreatedEvent } from "../domain/events";

export class CreateJob {
  constructor(
    private jobRepository: JobRepository,
    private eventBus: EventBus,
  ) {}

  execute(): JobId {
    const jobId = this.generateJobId();
    const job = new Job(jobId);

    this.jobRepository.save(job);
    this.eventBus.publish(new JobCreatedEvent(jobId));

    return jobId;
  }

  private generateJobId(): JobId {
    return uuidv7();
  }
}
