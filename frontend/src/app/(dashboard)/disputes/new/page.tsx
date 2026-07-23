'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function NewDisputePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', summary: '', estimated_stakes_usd: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await apiClient.post('/disputes', {
        category: 'contract_interpretation',
        title: form.title,
        summary: form.summary || undefined,
        estimated_stakes_usd: form.estimated_stakes_usd ? parseFloat(form.estimated_stakes_usd) : undefined,
      });

      router.push(`/dashboard/disputes/${(result as any).dispute.id}`);
    } catch (err: any) {
      setError(err.message ?? 'Failed to create dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">New Dispute</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4">
        {error && <p className="text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium mb-1">Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Client refusing to pay $8,500 consulting invoice"
            className="w-full rounded border px-3 py-2"
            required
            minLength={5}
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Summary</label>
          <textarea
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Brief summary of the dispute"
            className="w-full rounded border px-3 py-2"
            rows={3}
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Estimated Stakes (USD)</label>
          <input
            type="number"
            value={form.estimated_stakes_usd}
            onChange={(e) => setForm({ ...form, estimated_stakes_usd: e.target.value })}
            placeholder="e.g. 8500"
            className="w-full rounded border px-3 py-2"
            min="0"
            step="0.01"
          />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm text-blue-800">Analysis fee: <strong>$49.00</strong> (collected when you submit your brief)</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Dispute'}
        </button>
      </form>
    </div>
  );
}
