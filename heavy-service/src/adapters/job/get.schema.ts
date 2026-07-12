import { z } from "zod";

export const getQuerySchema = z.object({
  jobId: z.string().min(1),
});

export const getSchema = {
  querystring: getQuerySchema,
  response: {
    200: z.object({
      jobId: z.string(),
      status: z.string(),
      result: z.unknown(),
    }),
    404: z.object({
      error: z.string(),
    }),
  },
};

export type GetResponse = z.infer<(typeof getSchema.response)["200"]>;
export type GetNotFoundResponse = z.infer<(typeof getSchema.response)["404"]>;
