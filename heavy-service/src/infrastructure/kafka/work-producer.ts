import { v4 as uuid } from "uuid";
import { producer } from "./kafka-connection";
import { config } from "../config/config-loader";
import type { WorkPayload } from "../../domain/execute-request";

export async function startJob(
  payload: WorkPayload,
): Promise<string> {
  const correlationId = uuid();
  await producer.send({
    topic: config.WORK_TOPIC,
    messages: [
      {
        key: correlationId,
        value: JSON.stringify(payload),
        headers: { correlationId },
      },
    ],
  });
  return correlationId;
}
