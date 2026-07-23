import type { CompletionChunk, CompletionResult, CostEstimate, HealthStatus, Prompt } from './types.ts';

export interface ProviderCapabilities {
  contextWindow: number;
  maxOutputTokens: number;
  streaming: boolean;
  systemPrompt: boolean;
  toolCalling: boolean;
  dataResidency: string[];
  noTrainingGuarantee: boolean;
}

export interface LLMProvider {
  readonly providerId: string;
  readonly modelId: string;
  readonly capabilities: ProviderCapabilities;
  generateCompletion(prompt: Prompt): Promise<CompletionResult>;
  generateStreamingCompletion(prompt: Prompt): AsyncIterable<CompletionChunk>;
  healthCheck(): Promise<HealthStatus>;
  estimateCost(prompt: Prompt): CostEstimate;
  hasNoTrainingGuarantee(): boolean;
  hasDataResidency(region: string): boolean;
}
