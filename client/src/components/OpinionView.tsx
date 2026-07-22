'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OpinionView({ disputeId }: { disputeId: string }) {
  const [opinion, setOpinion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`/api/opinions/${disputeId}/opinion`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => { setOpinion(data.opinion); setLoading(false); })
      .catch(() => router.push('/dashboard'));
  }, [disputeId, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!opinion) return <div className="p-8">Opinion not available yet.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-2">Your Dispute Analysis</h1>
      <p className="text-sm text-gray-600 mb-6">Confidence: {Math.round((opinion.overall_confidence || 0) * 100)}%</p>
      <div className="prose">
        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded">{JSON.stringify(opinion.encrypted_content, null, 2)}</pre>
      </div>
      <a href={`/api/opinions/${disputeId}/opinion/pdf`} className="mt-4 inline-block bg-primary text-white rounded py-2 px-4">Download PDF</a>
    </div>
  );
}
