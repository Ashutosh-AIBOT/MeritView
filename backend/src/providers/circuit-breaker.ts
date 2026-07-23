export class CircuitBreaker {
  private failures = 0;
  constructor(private threshold = 3, private cooldownMs = 30_000) {}
  private openedAt: number | null = null;

  isOpen() {
    if (this.openedAt === null) return false;
    if (Date.now() - this.openedAt > this.cooldownMs) {
      this.openedAt = null;
      this.failures = 0;
      return false;
    }
    return true;
  }
  recordSuccess() { this.failures = 0; this.openedAt = null; }
  recordFailure() {
    this.failures++;
    if (this.failures >= this.threshold) this.openedAt = Date.now();
  }
}
