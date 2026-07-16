import { Result } from "../domain/result";

export class MakeResult {
  constructor(private delayMs: number) {}

  async execute(workerId?: string): Promise<Result> {
    const durationMs = await this.sleep();

    return new Result(
      { message: "Job completed successfully" },
      durationMs,
      workerId,
    );
  }

  private async sleep(): Promise<number> {
    const start = Date.now();
    await new Promise<void>((resolve) => setTimeout(resolve, this.delayMs));
    return Date.now() - start;
  }
}
