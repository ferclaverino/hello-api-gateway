export type JobId = string;

export enum JobStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Completed = "completed",
  Failed = "failed",
}

export class Job {
  private status: JobStatus = JobStatus.Pending;
  result: unknown = null;

  constructor(readonly jobId: JobId) {}

  start() {
    this.status = JobStatus.InProgress;
  }

  complete(result: unknown) {
    this.status = JobStatus.Completed;
    this.result = result;
  }

  fail() {
    this.status = JobStatus.Failed;
  }

  getStatus(): JobStatus {
    return this.status;
  }
}
