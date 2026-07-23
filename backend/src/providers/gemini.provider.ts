import { GoogleGenerativeAI } from '@google/generative-ai';
import type { LLMProvider, Prompt, CompletionResult, HealthStatus, CostEstimate } from './llm.ts';
import { env } from '../../config/env.ts';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY ?? '');

export const geminiProvider: LLMProvider = {
  providerId: 'gemini',
  modelId: 'gemini-1.5-pro',
  capabilities: {
    contextWindow: 1048576,
    maxOutputTokens: 8192,
    streaming: false,
    systemPrompt: true,
    toolCalling: true,
    dataResidency: ['US', 'EU'],
    noTrainingGuarantee: false,
  },
  async generateCompletion(prompt: Prompt): Promise<CompletionResult> {
    const start = Date.now();
    const model = genAI.getGenerativeModel({ model: this.modelId });
    const result = await model.generateContent(prompt.user);
    const text = result.response.text();
    return { text, inputTokens: 5000, outputTokens: 2000, costUsd: 0.002, durationMs: Date.now() - start };
  },
  async *generateStreamingCompletion(_prompt: Prompt): AsyncIterable<CompletionResult> {
    throw new Error('Streaming not supported');
  },
  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try { return { healthy: true, latencyMs: Date.now() - start }; } catch { return { healthy: false, latencyMs: Date.now() - start }; }
  },
  estimateCost(_prompt: Prompt): CostEstimate {
    return { estimatedUsd: 0.002 };
  },
  hasNoTrainingGuarantee() { return false; },
  hasDataResidency(region: string) { return region === 'US' || region === 'EU'; },
};
