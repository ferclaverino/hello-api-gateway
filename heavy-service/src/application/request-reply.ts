import type { WorkPayload, WorkReply } from "../domain/execute-request";
import type { WorkerPorts } from "./ports/worker-ports";

export class TimeoutError extends Error {
  constructor(public readonly jobId: string) {
    super("reply timeout");
    this.name = "TimeoutError";
  }
}

export class RequestReply {
  constructor(
    private readonly ports: WorkerPorts,
    private readonly timeoutMs: number,
  ) {}

  async execute(
    payload: WorkPayload,
  ): Promise<{ jobId: string; reply: WorkReply }> {
    const jobId = await this.ports.startJob(payload);
    const replyPromise = this.ports.registerJob(jobId);

    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => {
        this.ports.rejectJob(jobId, new TimeoutError(jobId));
      }, this.timeoutMs);
    });

    const reply = await Promise.race<WorkReply | never>([replyPromise, timeout]);
    return { jobId, reply };
  }
}
