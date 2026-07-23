export type DisputeState =
  | 'draft' | 'brief_submitted' | 'payment_pending' | 'under_analysis'
  | 'awaiting_aggregation' | 'completed' | 'failed' | 'withdrawn';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  role: string;
  accountType: string;
  marketingOptIn: boolean;
  preferredLlmProvider?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Dispute {
  id: string;
  category: 'contract_interpretation';
  title: string;
  summary?: string;
  estimatedStakesUsd?: number;
  state: DisputeState;
  initiatorUserId: string;
  priceUsd: number;
  createdAt: string;
}

export interface Brief {
  id: string;
  disputeId: string;
  partyId: string;
  status: string;
  wordCount: number;
  submittedAt?: string;
}

export interface Payment {
  id: string;
  disputeId: string;
  userId: string;
  amountUsd: number;
  status: string;
  createdAt: string;
}

export interface EvaluatorOutput {
  id: string;
  disputeId: string;
  llmProvider: string;
  modelId: string;
  promptVersion: string;
  structuredOutput: unknown;
  rawOutput?: string;
  parseSuccess: boolean;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  durationMs: number;
  attemptNumber: number;
}

export interface Opinion {
  id: string;
  disputeId: string;
  evalPromptVersion: string;
  aggPromptVersion: string;
  evaluatorOutputIds: string[];
  interEvaluatorAgreement?: number;
  overallConfidence?: number;
  aggregatorProvider: string;
  aggregatorModelId: string;
  totalCostUsd: number;
  pdfStorageKey?: string;
  pdfGeneratedAt?: string;
  createdAt: string;
  deliveredAt?: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  display_name?: string;
  accept_terms: boolean;
  marketing_opt_in?: boolean;
  preferred_llm_provider?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface DisputeCreateInput {
  category: 'contract_interpretation';
  title: string;
  summary?: string;
  estimated_stakes_usd?: number;
}

export interface DisputeUpdateInput {
  title?: string;
  summary?: string;
  estimated_stakes_usd?: number;
}
