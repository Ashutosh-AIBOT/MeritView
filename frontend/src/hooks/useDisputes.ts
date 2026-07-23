import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function useDisputes() {
  return useQuery({ queryKey: ['disputes'], queryFn: () => apiClient.get('/disputes') });
}
