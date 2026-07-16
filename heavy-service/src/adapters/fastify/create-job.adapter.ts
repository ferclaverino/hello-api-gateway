import { CreateJobResponse } from "../../infrastructure/fastify/schemas/create-job.schema";

export function toCreateJobResponse(jobId: string): CreateJobResponse {
  return { jobId };
}
