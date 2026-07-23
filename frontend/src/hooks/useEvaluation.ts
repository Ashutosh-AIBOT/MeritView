import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function useEvaluation(disputeId: string) {
  return useQuery({
    queryKey: ['opinion-status', disputeId],
    queryFn: () => apiClient.get(`/disputes/${disputeId}/opinion/status`),
  });
}
