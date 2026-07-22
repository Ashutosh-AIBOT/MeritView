'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDisputePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [estimatedStakes, setEstimatedStakes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    const res = await fetch('/api/disputes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ category: 'contract_interpretation', title, summary, estimated_stakes_usd: Number(estimatedStakes) }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error?.message || 'Failed to create dispute');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">New Dispute</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border rounded p-2" required minLength={5} maxLength={200} />
        </div>
        <div>
          <label className="block text-sm font-medium">Summary</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="mt-1 block w-full border rounded p-2" maxLength={500} />
        </div>
        <div>
          <label className="block text-sm font-medium">Estimated Stakes (USD)</label>
          <input type="number" value={estimatedStakes} onChange={(e) => setEstimatedStakes(e.target.value)} className="mt-1 block w-full border rounded p-2" min={0} />
        </div>
        <button type="submit" className="bg-primary text-white rounded py-2 px-4">Create Dispute</button>
      </form>
    </div>
  );
}
