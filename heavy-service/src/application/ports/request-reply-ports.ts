import type { WorkPayload, WorkReply } from "../../domain/execute-request";

export interface RequestReplyPorts {
  publishWork: (payload: WorkPayload) => Promise<string>;
  registerPending: (correlationId: string) => Promise<WorkReply>;
  rejectPending: (correlationId: string, err: Error) => void;
}
