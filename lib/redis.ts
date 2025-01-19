import Redis from "ioredis";

const redis = new Redis(process.env.UPSTASH_REDIS_URL!);

// Log errors
redis.on("error", (error) => {
  console.error(`[Redis Error]: ${error.message}`);
});

// Log successful connection
redis.on("connect", () => {
  console.log("Connected to Upstash Redis");
});

export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`[Redis Get Error]: ${error}`);
    return null;
  }
}

export async function setToCache<T>(key: string, value: T, ttl: number): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch (error) {
    console.error(`[Redis Set Error]: ${error}`);
  }
}

export async function deleteFromCache(key: string): Promise<void> {
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`[Redis Delete Error]: ${error}`);
  }
}

export default redis;
