interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

/**
 * Checks if an action is within rate limits.
 * Default: 5 attempts per 5 minutes per key.
 */
export function checkRateLimit(
  key: string,
  maxAttempts = 5,
  windowMs = 5 * 60 * 1000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    memoryStore.set(key, { attempts: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxAttempts - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.attempts >= maxAttempts) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  record.attempts += 1;
  return {
    allowed: true,
    remaining: maxAttempts - record.attempts,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}

/**
 * Resets the rate limit for a given key after a successful action (e.g. valid login)
 */
export function resetRateLimit(key: string) {
  memoryStore.delete(key);
}
