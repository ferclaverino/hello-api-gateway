import { createClient } from "redis";
import { config } from "../config/config-loader";

export const redis = createClient({ url: config.REDIS_URL });

export async function connectRedis(): Promise<void> {
  await redis.connect();
}

export async function disconnectRedis(): Promise<void> {
  await redis.disconnect().catch(() => {});
}
