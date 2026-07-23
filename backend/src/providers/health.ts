export async function pingProvider(fn: () => Promise<unknown>): Promise<{ healthy: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    await fn();
    return { healthy: true, latencyMs: Date.now() - start };
  } catch {
    return { healthy: false, latencyMs: Date.now() - start };
  }
}
