'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('/api/disputes', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => { setDisputes(data.disputes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Disputes</h1>
        <a href="/disputes/new" className="bg-primary text-white rounded py-2 px-4">New Dispute</a>
      </div>
      {disputes.length === 0 ? (
        <p className="text-gray-600">You have no disputes yet.</p>
      ) : (
        <ul className="space-y-3">
          {disputes.map((dispute) => (
            <li key={dispute.id} className="border rounded p-4">
              <div className="font-semibold">{dispute.title}</div>
              <div className="text-sm text-gray-600 mt-1">Status: {dispute.state}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
