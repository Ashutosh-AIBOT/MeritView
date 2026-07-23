import type { LLMProvider } from './llm.ts';

export class ProviderRegistry {
  private providers: LLMProvider[] = [];
  register(p: LLMProvider) { this.providers.push(p); }
  all() { return this.providers; }
}
