import { z } from "zod";

export const getJobSchema = {
  params: z.object({
    jobId: z.string().min(1),
  }),
  response: {
    200: z.object({
      id: z.string(),
      status: z.string(),
      result: z
        .object({
          payload: z.unknown(),
          durationMs: z.number().int(),
          workerId: z.string().optional(),
        })
        .optional(),
    }),
    404: z.object({
      error: z.string(),
    }),
  },
};

export type GetJobResponse = z.infer<(typeof getJobSchema.response)["200"]>;
export type GetJobNotFoundResponse = z.infer<
  (typeof getJobSchema.response)["404"]
>;
