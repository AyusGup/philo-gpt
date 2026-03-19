import { Redis } from '@upstash/redis';
import { 
  RATE_LIMIT_WINDOW_MS, 
  RATE_LIMIT_REQUESTS 
} from './constants';
import { logger } from './logger';

// Initialize Upstash Redis client
// These variables must be in your .env.local
const redis = Redis.fromEnv();

interface RateLimitResult {
  limited: boolean;
  retryAfter: number;
}

/**
 * Sliding Window Rate Limiter using Lua Script for atomicity.
 * This is 100% persistent across Vercel serverless instances.
 */
export async function isRateLimited(ip: string): Promise<RateLimitResult> {
  const key = `ratelimit:stoa:${ip}`;
  const now = Date.now();
  const limit = RATE_LIMIT_REQUESTS;
  const window = RATE_LIMIT_WINDOW_MS;

  const slidingWindowLua = `
    local key = KEYS[1]
    local now = tonumber(ARGV[1])
    local window = tonumber(ARGV[2])
    local limit = tonumber(ARGV[3])

    local windowStart = now - window

    -- Remove expired requests outside the window
    redis.call("ZREMRANGEBYSCORE", key, 0, windowStart)

    -- Count active requests in window
    local current = redis.call("ZCARD", key)

    if current >= limit then
      return 0
    end

    -- Add current request
    redis.call("ZADD", key, now, now)

    -- Set expiry for the whole bucket to save memory
    redis.call("EXPIRE", key, math.ceil(window / 1000) + 10)

    return 1
  `;

  try {
    const allowed = await redis.eval(
      slidingWindowLua,
      [key],
      [now.toString(), window.toString(), limit.toString()]
    );

    if (allowed === 0) {
      // Get the oldest record to calculate a better retryAfter
      const oldestArr: string[] = await redis.zrange(key, 0, 0);
      const oldest = oldestArr.length > 0 ? parseInt(oldestArr[0]) : (now - window);
      const retryAfter = Math.ceil((oldest + window - now) / 1000);
      
      logger.warn(`Rate limit HIT for IP: ${ip}. Retry after: ${retryAfter}s`);
      return { limited: true, retryAfter: Math.max(1, retryAfter) };
    }

    return { limited: false, retryAfter: 0 };
  } catch (error) {
    // If Redis is down, we fail-safe (let the request through but log error)
    logger.error('Redis Rate Limit Error:', error);
    return { limited: false, retryAfter: 0 };
  }
}
