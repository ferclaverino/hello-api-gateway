import { z } from "zod";

export const statusSchema = {
  response: {
    200: z.object({
      topics: z.array(
        z.object({
          topic: z.string(),
          partitions: z.array(
            z.object({
              partition: z.number().int(),
              leader: z.number().int(),
              replicas: z.array(z.number().int()),
              isr: z.array(z.number().int()),
              offlineReplicas: z.array(z.number().int()).optional(),
              low: z.string(),
              high: z.string(),
              offset: z.string(),
            }),
          ),
        }),
      ),
    }),
  },
};

export type StatusResponse = z.infer<(typeof statusSchema.response)["200"]>;
