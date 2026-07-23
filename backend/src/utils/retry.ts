export async function withRetry<T>(fn: () => Promise<T>, attempts = 2, backoffMs = 1000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (i < attempts) await new Promise((r) => setTimeout(r, backoffMs * 2 ** i));
    }
  }
  throw lastErr;
}
