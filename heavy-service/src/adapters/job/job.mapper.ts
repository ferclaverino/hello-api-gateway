import { Job, JobId, JobStatus } from "../../domain/job";

export interface JobRecord {
  jobId: JobId;
  status: JobStatus;
  result: unknown;
}

export function toJobRecord(job: Job): JobRecord {
  return {
    jobId: job.jobId,
    status: job.getStatus(),
    result: job.result,
  };
}
