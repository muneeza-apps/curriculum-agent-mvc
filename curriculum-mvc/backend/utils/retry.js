// backend/utils/retry.js

export async function withRetry(fn, { maxAttempts = 3, baseDelayMs = 1500 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if ([400, 401, 403, 404].includes(err?.status)) throw err; // non-retryable
      if (attempt === maxAttempts) break;
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 300;
      console.warn(`[retry] Attempt ${attempt} failed (${err.message}). Retrying in ${Math.round(delay)}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error(`Failed after ${maxAttempts} attempts: ${lastError?.message}`);
}
