import type {
  ExecuteResponse,
  ExecuteTimeoutResponse,
} from "./execute.schema";
import type { WorkReply } from "../../domain/execute-request";

export function toExecuteResponse(
  jobId: string,
  reply: WorkReply,
): ExecuteResponse {
  return {
    jobId,
    workerId: reply.workerId,
    durationMs: reply.durationMs,
  };
}

export function toTimeoutResponse(jobId: string): ExecuteTimeoutResponse {
  return { error: "timeout", jobId };
}
