import { redis } from "./redis-client";
import { Job } from "../../domain/job";
import type { JobRepository } from "../../application/ports/job-repository";
import type { JobId } from "../../domain/job";
import { toJob, toJobKey, toRedisItem } from "../../adapters/redis/job.mapper";

export class RedisJobRepository implements JobRepository {
  save(job: Job): void {
    const redisItem = toRedisItem(job);
    redis
      .set(redisItem.key, redisItem.value)
      .catch((error) => console.error("Failed to save job to Redis:", error));
  }

  async getById(jobId: JobId): Promise<Job | null> {
    const raw = await redis.get(toJobKey(jobId));
    return toJob(raw);
  }
}
