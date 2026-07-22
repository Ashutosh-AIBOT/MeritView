'use client';

import { useEffect, useState } from 'react';

export function useEvaluation(disputeId: string) {
  const [status, setStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`/api/opinions/${disputeId}/opinion/status`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setStatus(data.status?.state || 'unknown'); setLoading(false); })
      .catch(() => setLoading(false));
  }, [disputeId]);

  return { status, loading };
}
