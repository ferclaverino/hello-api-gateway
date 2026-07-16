export class Result {
  constructor(
    readonly payload: unknown,
    readonly durationMs: number,
    readonly workerId?: string,
  ) {}
}
