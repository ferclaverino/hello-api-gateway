import type { FromSchema } from "json-schema-to-ts";

export const helloSchema = {
  response: {
    200: {
      type: "object",
      properties: {
        message: { type: "string" },
        instance: { type: "number" },
      },
      required: ["message", "instance"],
    },
  },
} as const;

export type HelloResponse = FromSchema<typeof helloSchema.response["200"]>;
