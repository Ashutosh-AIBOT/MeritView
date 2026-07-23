export const DISPUTE_STATE_MACHINE: Record<string, string[]> = {
  draft: ['brief_submitted', 'withdrawn'],
  brief_submitted: ['payment_pending', 'draft'],
  payment_pending: ['under_analysis', 'draft', 'failed'],
  under_analysis: ['awaiting_aggregation', 'failed'],
  awaiting_aggregation: ['completed', 'failed'],
  completed: [],
  failed: [],
  withdrawn: [],
};

export const PRICE_USD = 49.0;
export const BRIEF_WORD_CAP = 5000;
export const RETENTION_MONTHS_DISPUTES = 12;
export const RETENTION_YEARS_PAYMENTS = 7;
