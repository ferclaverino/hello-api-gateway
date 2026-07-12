import { Job, JobId, JobStatus } from "../../domain/job";
import { Result } from "../../domain/result";

export interface JobRecord {
  jobId: JobId;
  status: JobStatus;
  result: Result | null;
}

export function toJobRecord(job: Job): JobRecord {
  return {
    jobId: job.jobId,
    status: job.getStatus(),
    result: job.getResult(),
  };
}
