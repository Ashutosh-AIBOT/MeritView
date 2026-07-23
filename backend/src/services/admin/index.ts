import { getPendingAggregations } from '../../services/opinions/index.ts';

export async function listPending() {
  return getPendingAggregations();
}
