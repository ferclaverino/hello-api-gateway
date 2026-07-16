import { producer } from "./kafka-connection";
import { config } from "../config/config-loader";
import type { Queue } from "../../application/ports/job-queue";
import type { Job } from "../../domain/job";

export class KafkaJobQueue implements Queue<Job> {
  publish(job: Job): void {
    producer
      .send({
        topic: config.JOB_REQUESTS_TOPIC,
        messages: [
          {
            value: job.id,
          },
        ],
      })
      .catch(() => {});
  }
}
