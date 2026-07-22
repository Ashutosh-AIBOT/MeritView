import { LLMProvider } from '@meritview/llm-abstraction';
import { GroqProvider } from './groq.provider';
import { GeminiProvider } from './gemini.provider';

export class LLMProviderFactory {
  static create(providerId: string, modelId: string): LLMProvider {
    switch (providerId) {
      case 'groq':
        return new GroqProvider(modelId);
      case 'gemini':
        return new GeminiProvider(modelId);
      default:
        throw new Error(`Unknown provider: ${providerId}`);
    }
  }
}
