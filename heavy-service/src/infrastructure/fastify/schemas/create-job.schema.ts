import { z } from "zod";

export const createJobSchema = {
  response: {
    201: z.object({
      jobId: z.string(),
    }),
  },
};

export type CreateJobResponse = z.infer<
  (typeof createJobSchema.response)["201"]
>;
