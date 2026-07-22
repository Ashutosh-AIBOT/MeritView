'use client';

import { useDisputes } from '@/hooks/useDisputes';

export default function DisputeForm() {
  const { disputes, loading } = useDisputes();

  if (loading) return <div className="p-8">Loading disputes...</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">My Disputes</h1>
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
