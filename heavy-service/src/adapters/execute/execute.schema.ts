import { z } from "zod";

export const executeBodySchema = z.object({
  task: z.string().min(1).default("default-task"),
});

export const executeSchema = {
  body: executeBodySchema,
  response: {
    200: z.object({
      jobId: z.string(),
      workerId: z.string(),
      durationMs: z.number(),
    }),
    504: z.object({
      error: z.string(),
      jobId: z.string(),
    }),
  },
};

export type ExecuteBody = z.infer<typeof executeBodySchema>;
export type ExecuteResponse = z.infer<(typeof executeSchema.response)["200"]>;
export type ExecuteTimeoutResponse = z.infer<
  (typeof executeSchema.response)["504"]
>;
