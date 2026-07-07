import { z } from "zod";

export const helloSchema = {
  response: {
    200: z.object({
      message: z.string(),
      instance: z.number(),
    }),
  },
};

export type HelloResponse = z.infer<(typeof helloSchema.response)["200"]>;
