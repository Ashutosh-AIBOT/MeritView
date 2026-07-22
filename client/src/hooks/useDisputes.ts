'use client';

import { useEffect, useState } from 'react';

export function useDisputes() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/disputes', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setDisputes(data.disputes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { disputes, loading };
}
