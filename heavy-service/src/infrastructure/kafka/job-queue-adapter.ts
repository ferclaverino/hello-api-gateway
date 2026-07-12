import { producer } from "./kafka-connection";
import { config } from "../config/config-loader";
import { toJobRecord } from "../../adapters/job/job.mapper";
import type { Queue } from "../../application/ports/job-queue";
import type { Job } from "../../domain/job";

export class KafkaJobQueue implements Queue<Job> {
  publish(job: Job): void {
    producer
      .send({
        topic: config.JOB_REQUESTS_TOPIC,
        messages: [
          {
            key: job.jobId,
            value: JSON.stringify(toJobRecord(job)),
            headers: { jobId: job.jobId },
          },
        ],
      })
      .catch(() => {});
  }
}
