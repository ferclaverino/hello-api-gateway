import { Job, JobId, JobStatus } from "../../domain/job";
import { Result } from "../../domain/result";
import { RedisItem } from "../../infrastructure/redis/redis-item";

export function toJobKey(jobId: JobId): string {
  return `job:${jobId}`;
}

export function toRedisItem(job: Job): RedisItem {
  const key = toJobKey(job.id);
  const value = JSON.stringify({
    id: job.id,
    status: job.getStatus(),
    result: job.getResult(),
  });
  return {
    key,
    value,
  };
}

export function toJob(raw: string | null): Job | null {
  if (!raw) return null;
  const parsed = JSON.parse(raw) as {
    id: JobId;
    status: JobStatus;
    result: Result | null;
  };
  return new Job(parsed.id, {
    status: parsed.status,
    result: parsed.result,
  });
}
