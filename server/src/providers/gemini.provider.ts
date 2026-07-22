import { LLMProvider } from '@meritview/llm-abstraction';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiProvider implements LLMProvider {
  readonly providerId = 'gemini';
  readonly modelId: string;
  readonly capabilities = {
    contextWindow: 1048000,
    maxOutputTokens: 8192,
    streaming: true,
    systemPrompt: true,
    toolCalling: true,
    dataResidency: ['US', 'EU'],
    noTrainingGuarantee: false,
  };

  constructor(modelId: string) {
    this.modelId = modelId;
  }

  async generateCompletion(prompt: unknown): Promise<unknown> {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = client.getGenerativeModel({ model: this.modelId });
    const result = await model.generateContent(JSON.stringify(prompt));
    const response = await result.response;
    return response.text();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = client.getGenerativeModel({ model: this.modelId });
      await model.generateContent('ping');
      return true;
    } catch {
      return false;
    }
  }

  async estimateCost(prompt: unknown): Promise<number> {
    const inputTokens = JSON.stringify(prompt).length / 4;
    const costPer1K = 0.00035;
    return (inputTokens / 1000) * costPer1K;
  }
}
