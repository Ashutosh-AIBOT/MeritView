export interface Prompt {
  system?: string;
  user: string;
}
export interface CompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
}
export interface CompletionChunk { delta: string }
export interface HealthStatus { healthy: boolean; latencyMs?: number }
export interface CostEstimate { estimatedUsd: number }
