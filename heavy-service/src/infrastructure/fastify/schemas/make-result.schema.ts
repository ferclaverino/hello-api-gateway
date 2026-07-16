import { z } from "zod";

export const makeResultSchema = {
  response: {
    200: z.object({
      payload: z.unknown(),
      durationMs: z.number().int(),
      workerId: z.string().optional(),
    }),
  },
};

export type MakeResultResponse = z.infer<
  (typeof makeResultSchema.response)["200"]
>;
