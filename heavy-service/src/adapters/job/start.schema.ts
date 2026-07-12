import { z } from "zod";

export const startSchema = {
  response: {
    201: z.object({
      jobId: z.string(),
    }),
  },
};

export type StartResponse = z.infer<(typeof startSchema.response)["201"]>;
