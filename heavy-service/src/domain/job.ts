import { Result } from "./result";

export type JobId = string;

export enum JobStatus {
  Pending = "pending",
  InProgress = "in-progress",
  Completed = "completed",
  Failed = "failed",
}

export interface JobState {
  status: JobStatus;
  result: Result | null;
}

export class Job {
  private status: JobStatus = JobStatus.Pending;
  private result: Result | null = null;

  constructor(
    readonly jobId: JobId,
    state?: JobState,
  ) {
    if (state) {
      this.status = state.status;
      this.result = state.result;
    }
  }

  start() {
    this.status = JobStatus.InProgress;
  }

  complete(result: Result) {
    this.status = JobStatus.Completed;
    this.result = result;
  }

  fail() {
    this.status = JobStatus.Failed;
  }

  getStatus(): JobStatus {
    return this.status;
  }

  getResult(): Result | null {
    return this.result;
  }
}
