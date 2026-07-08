import { config } from "../infrastructure/config/config-loader";
import { publishWork } from "../infrastructure/kafka/work-producer";
import {
  registerPending,
  rejectPending,
} from "../infrastructure/kafka/reply-consumer";
import type { WorkPayload, WorkReply } from "../domain/execute-request";

export class TimeoutError extends Error {
  constructor(public readonly jobId: string) {
    super("reply timeout");
    this.name = "TimeoutError";
  }
}

export async function executeUseCase(
  payload: WorkPayload,
): Promise<{ jobId: string; reply: WorkReply }> {
  const jobId = await publishWork(payload);
  const replyPromise = registerPending(jobId);

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      rejectPending(jobId, new TimeoutError(jobId));
    }, config.REPLY_TIMEOUT_MS);
  });

  const reply = await Promise.race<WorkReply | never>([replyPromise, timeout]);
  return { jobId, reply };
}
