'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function OpinionPage() {
  const params = useParams();
  const disputeId = params.id as string;
  const [opinion, setOpinion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${disputeId}/opinion`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            setError('Opinion not ready yet. Analysis is still in progress.');
          } else {
            setError('Failed to load opinion');
          }
          return;
        }
        const data = await res.json();
        setOpinion(data.opinion);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [disputeId]);

  if (loading) return <div className="p-8">Loading opinion...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!opinion) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Analysis Opinion</h1>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <h3 className="font-bold text-yellow-800 mb-2">Important Disclaimer</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
            <li>This is AI-generated analysis, not legal advice.</li>
            <li>This opinion does not constitute a binding judgment or arbitration award.</li>
            <li>Consult a qualified attorney for legal advice specific to your situation.</li>
            <li>Analysis is based on the information provided and may not reflect all relevant facts or legal nuances.</li>
          </ul>
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-bold mb-3">Executive Summary</h2>
          {opinion.content && (
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded border text-sm">
              {JSON.stringify(opinion.content, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/disputes/${disputeId}/opinion/pdf`}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Download PDF
        </a>
      </div>
    </div>
  );
}
