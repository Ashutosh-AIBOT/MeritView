export interface LLMProvider {
  readonly providerId: string;
  readonly modelId: string;
  readonly capabilities: {
    contextWindow: number;
    maxOutputTokens: number;
    streaming: boolean;
    systemPrompt: boolean;
    toolCalling: boolean;
    dataResidency: string[];
    noTrainingGuarantee: boolean;
  };
  generateCompletion(prompt: unknown): Promise<unknown>;
  generateStreamingCompletion?(prompt: unknown): AsyncIterable<unknown>;
  healthCheck(): Promise<boolean>;
  estimateCost?(prompt: unknown): Promise<number>;
}
