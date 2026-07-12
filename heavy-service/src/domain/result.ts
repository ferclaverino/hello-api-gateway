export class Result {
  constructor(
    readonly payload: unknown,
    readonly workerId: string,
    readonly durationMs: number,
  ) {}
}
