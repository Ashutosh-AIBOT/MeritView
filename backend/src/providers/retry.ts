export async function retryWithBackoff<T>(fn: () => Promise<T>, maxAttempts = 2): Promise<T> {
  let attempt = 0;
  let lastErr: unknown;
  while (attempt <= maxAttempts) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const delay = 1000 * 2 ** attempt;
      await new Promise((r) => setTimeout(r, delay));
      attempt++;
    }
  }
  throw lastErr;
}
