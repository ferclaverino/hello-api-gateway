import type { WorkPayload, WorkReply } from "../../domain/execute-request";

export interface WorkerPorts {
  startJob: (payload: WorkPayload) => Promise<string>;
  registerJob: (correlationId: string) => Promise<WorkReply>;
  rejectJob: (correlationId: string, err: Error) => void;
}
