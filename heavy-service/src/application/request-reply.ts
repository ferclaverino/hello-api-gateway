import type { WorkPayload, WorkReply } from "../domain/execute-request";
import type { RequestReplyPorts } from "./ports/request-reply-ports";

export class TimeoutError extends Error {
  constructor(public readonly jobId: string) {
    super("reply timeout");
    this.name = "TimeoutError";
  }
}

export class RequestReply {
  constructor(
    private readonly ports: RequestReplyPorts,
    private readonly timeoutMs: number,
  ) {}

  async execute(
    payload: WorkPayload,
  ): Promise<{ jobId: string; reply: WorkReply }> {
    const jobId = await this.ports.publishWork(payload);
    const replyPromise = this.ports.registerPending(jobId);

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        this.ports.rejectPending(jobId, new TimeoutError(jobId));
      }, this.timeoutMs);
    });

    const reply = await Promise.race<WorkReply | never>([replyPromise, timeout]);
    return { jobId, reply };
  }
}
