import { redis } from "../redis/redis-client";
import { toJobRecord, type JobRecord } from "../../adapters/job/job.mapper";
import { Job } from "../../domain/job";
import type { JobRepository } from "../../application/ports/job-repository";
import type { JobId } from "../../domain/job";

export class RedisJobRepository implements JobRepository {
  private getKey(jobId: JobId): string {
    return `job:${jobId}`;
  }

  save(job: Job): void {
    redis
      .set(this.getKey(job.jobId), JSON.stringify(toJobRecord(job)))
      .catch(() => {});
  }

  async getById(jobId: JobId): Promise<Job | undefined> {
    const raw = await redis.get(this.getKey(jobId));
    if (!raw) return undefined;
    const record = JSON.parse(raw) as JobRecord;
    return new Job(record.jobId, {
      status: record.status,
      result: record.result,
    });
  }
}
