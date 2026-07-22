import { LLMProvider } from '@meritview/llm-abstraction';
import Groq from 'groq-sdk';

export class GroqProvider implements LLMProvider {
  readonly providerId = 'groq';
  readonly modelId: string;
  readonly capabilities = {
    contextWindow: 8192,
    maxOutputTokens: 4096,
    streaming: true,
    systemPrompt: true,
    toolCalling: false,
    dataResidency: ['US'],
    noTrainingGuarantee: true,
  };

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  async generateCompletion(prompt: unknown): Promise<unknown> {
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await client.chat.completions.create({
      model: this.modelId,
      messages: [{ role: 'user', content: JSON.stringify(prompt) }],
    });
    return response.choices[0]?.message?.content || '';
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      await client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async estimateCost(prompt: unknown): Promise<number> {
    const inputTokens = JSON.stringify(prompt).length / 4;
    const costPer1K = 0.0001;
    return (inputTokens / 1000) * costPer1K;
  }
}
