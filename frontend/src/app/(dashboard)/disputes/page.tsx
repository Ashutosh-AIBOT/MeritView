'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';

interface Dispute {
  id: string;
  title: string;
  state: string;
  category: string;
  createdAt: string;
  priceUsd: number;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load disputes');
        const data = await res.json();
        setDisputes(data.disputes ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Disputes</h1>
        <Link href="/dashboard/disputes/new" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          New Dispute
        </Link>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : disputes.length === 0 ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No disputes yet</h2>
          <p className="text-gray-600 mb-4">Start by creating your first dispute analysis.</p>
          <Link href="/dashboard/disputes/new" className="text-blue-600 hover:underline">
            Create your first dispute →
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-lg divide-y">
          {disputes.map((d) => (
            <Link
              key={d.id}
              href={`/dashboard/disputes/${d.id}`}
              className="flex justify-between items-center p-4 hover:bg-gray-50"
            >
              <div>
                <h3 className="font-semibold">{d.title}</h3>
                <p className="text-sm text-gray-600 capitalize">{d.state.replace(/_/g, ' ')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">${d.priceUsd}</p>
                <p className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
