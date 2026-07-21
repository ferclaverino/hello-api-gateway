import { Job } from "../../domain/job";
import {
  GetJobNotFoundResponse,
  GetJobResponse,
} from "../../infrastructure/fastify/schemas/get-job.schema";

export function toGetJobResponse(job: Job): GetJobResponse {
  return {
    id: job.id,
    status: job.getStatus(),
    result: job.getResult() ?? undefined,
  };
}

export function toGetJobNotFoundResponse(): GetJobNotFoundResponse {
  return { error: "not found" };
}
