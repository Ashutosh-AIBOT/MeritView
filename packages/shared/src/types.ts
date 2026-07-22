export type UserId = string;
export type DisputeId = string;
export type PartyId = string;
export type BriefId = string;
export type EvaluationJobId = string;
export type EvaluatorOutputId = string;
export type OpinionId = string;
export type PaymentId = string;

export interface User {
  id: UserId;
  email: string;
  email_verified: boolean;
  display_name?: string;
  account_type: 'standard' | 'admin' | 'support';
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  last_login_at?: Date;
}

export interface Dispute {
  id: DisputeId;
  category: 'contract_interpretation';
  title: string;
  summary?: string;
  estimated_stakes_usd?: number;
  state: DisputeState;
  state_changed_at: Date;
  pricing_tier: 'standard';
  price_usd: number;
  initiator_user_id: UserId;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  deleted_at?: Date;
}

export type DisputeState =
  | 'draft'
  | 'brief_submitted'
  | 'payment_pending'
  | 'under_analysis'
  | 'awaiting_aggregation'
  | 'completed'
  | 'failed'
  | 'withdrawn';

export interface Party {
  id: PartyId;
  dispute_id: DisputeId;
  role: 'initiator';
  user_id?: UserId;
  brief_status: 'not_started' | 'in_progress' | 'submitted' | 'sealed';
  created_at: Date;
  updated_at: Date;
}

export interface Brief {
  id: BriefId;
  party_id: PartyId;
  dispute_id: DisputeId;
  encrypted_content: Buffer;
  content_encryption_key_id: string;
  word_count: number;
  supporting_document_ids: string[];
  status: 'draft' | 'submitted' | 'sealed';
  created_at: Date;
  updated_at: Date;
  submitted_at?: Date;
  sealed_at?: Date;
  seal_hash?: string;
  retention_expires_at?: Date;
}

export interface EvaluationJob {
  id: EvaluationJobId;
  dispute_id: DisputeId;
  state: 'pending' | 'running' | 'completed' | 'failed';
  prompt_version: string;
  created_at: Date;
  updated_at: Date;
}

export interface EvaluatorOutput {
  id: EvaluatorOutputId;
  dispute_id: DisputeId;
  llm_provider: string;
  model_id: string;
  prompt_version: string;
  structured_output: unknown;
  raw_output?: string;
  parse_success: boolean;
  parse_errors?: unknown;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  duration_ms: number;
  attempt_number: number;
  created_at: Date;
}

export interface Opinion {
  id: OpinionId;
  dispute_id: DisputeId;
  encrypted_content: Buffer;
  content_encryption_key_id: string;
  eval_prompt_version: string;
  agg_prompt_version: string;
  evaluator_output_ids: string[];
  inter_evaluator_agreement?: number;
  overall_confidence?: number;
  aggregator_provider: string;
  aggregator_model_id: string;
  total_cost_usd: number;
  pdf_storage_key?: string;
  pdf_generated_at?: Date;
  created_at: Date;
  delivered_at?: Date;
  retention_expires_at?: Date;
}

export interface Payment {
  id: PaymentId;
  dispute_id: DisputeId;
  user_id: UserId;
  amount_usd: number;
  currency: string;
  processor: 'stripe';
  processor_payment_id: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  refunded_amount_usd?: number;
  refund_reason?: string;
  refunded_at?: Date;
  idempotency_key?: string;
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface AuditEvent {
  id: string;
  event_type: string;
  actor_type: 'user' | 'admin' | 'support' | 'system';
  actor_id?: string;
  resource_type?: string;
  resource_id?: string;
  event_data: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  prev_event_id?: string;
  signature: string;
  created_at: Date;
}
