import { z } from "zod";

export const healthSchema = {
  response: {
    200: z.object({
      status: z.literal("ok"),
      backends: z.array(z.string()),
    }),
  },
};

export type HealthResponse = z.infer<typeof healthSchema.response["200"]>;
