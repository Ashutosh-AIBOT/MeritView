export class LLMProviderError extends Error {
  constructor(public providerId: string, message: string, public retryable = true) {
    super(message);
  }
}
