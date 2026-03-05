import redis from "./redis.js";

export async function acquireLock(lockKey, lockValue) {

  const result = await redis.set(lockKey, lockValue, {
    nx: true,
    ex: 10
  });

  return result === "OK";
}

export async function releaseLock(lockKey, lockValue) {

  const currentValue = await redis.get(lockKey);

  if (currentValue === lockValue) {
    await redis.del(lockKey);
  }

}