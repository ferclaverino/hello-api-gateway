import { z } from "zod";

export const healthSchema = {
  response: {
    200: z.object({
      status: z.literal("ok"),
      routes: z.array(
        z.object({
          path: z.string(),
          backends: z.array(z.url()),
        }),
      ),
      fallbackBackends: z.array(z.url()),
    }),
  },
};

export type HealthResponse = z.infer<(typeof healthSchema.response)["200"]>;
