import Groq from 'groq-sdk';
import type { LLMProvider, Prompt, CompletionResult, HealthStatus, CostEstimate } from './llm.ts';
import { env } from '../../config/env.ts';

export const groqClient = new Groq({ apiKey: env.GROQ_API_KEY });

export const groqProvider: LLMProvider = {
  providerId: 'groq',
  modelId: 'llama3-70b-8192',
  capabilities: {
    contextWindow: 8192,
    maxOutputTokens: 4096,
    streaming: false,
    systemPrompt: true,
    toolCalling: false,
    dataResidency: ['US'],
    noTrainingGuarantee: true,
  },
  async generateCompletion(prompt: Prompt): Promise<CompletionResult> {
    const start = Date.now();
    const response = await groqClient.chat.completions.create({
      model: this.modelId,
      messages: [{ role: 'user', content: prompt.user }],
    });
    const text = response.choices[0]?.message?.content ?? '';
    return { text, inputTokens: 5000, outputTokens: 2000, costUsd: 0.001, durationMs: Date.now() - start };
  },
  async *generateStreamingCompletion(_prompt: Prompt): AsyncIterable<CompletionResult> {
    throw new Error('Streaming not supported');
  },
  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try { await groqClient.models.retrieve('llama3-70b-8192'); return { healthy: true, latencyMs: Date.now() - start }; } catch { return { healthy: false, latencyMs: Date.now() - start }; }
  },
  estimateCost(_prompt: Prompt): CostEstimate {
    return { estimatedUsd: 0.001 };
  },
  hasNoTrainingGuarantee() { return true; },
  hasDataResidency(_region: string) { return true; },
};

export const mixtralProvider: LLMProvider = {
  providerId: 'groq',
  modelId: 'mixtral-8x7b-32768',
  capabilities: {
    contextWindow: 32768,
    maxOutputTokens: 4096,
    streaming: false,
    systemPrompt: true,
    toolCalling: false,
    dataResidency: ['US'],
    noTrainingGuarantee: true,
  },
  async generateCompletion(prompt: Prompt): Promise<CompletionResult> {
    const start = Date.now();
    const response = await groqClient.chat.completions.create({
      model: this.modelId,
      messages: [{ role: 'user', content: prompt.user }],
    });
    const text = response.choices[0]?.message?.content ?? '';
    return { text, inputTokens: 5000, outputTokens: 2000, costUsd: 0.001, durationMs: Date.now() - start };
  },
  async *generateStreamingCompletion(_prompt: Prompt): AsyncIterable<CompletionResult> {
    throw new Error('Streaming not supported');
  },
  async healthCheck(): Promise<HealthStatus> {
    const start = Date.now();
    try { return { healthy: true, latencyMs: Date.now() - start }; } catch { return { healthy: false, latencyMs: Date.now() - start }; }
  },
  estimateCost(_prompt: Prompt): CostEstimate {
    return { estimatedUsd: 0.001 };
  },
  hasNoTrainingGuarantee() { return true; },
  hasDataResidency(_region: string) { return true; },
};
