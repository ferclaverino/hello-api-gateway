export interface WorkPayload {
  task: string;
}

export interface WorkReply {
  workerId: string;
  durationMs: number;
}
