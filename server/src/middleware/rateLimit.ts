import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';

const redisClient = createClient({ url: process.env.REDIS_URL });
redisClient.connect();

export const createRateLimiter = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    store: new (RedisStore as any)({ client: redisClient as any }),
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: message ? { error: { code: 'RATE_LIMIT_EXCEEDED', message } } : undefined,
  } as any);
};
