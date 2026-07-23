'use client';
import { useState } from 'react';

interface BriefFormProps {
  disputeId: string;
  partyId: string;
  initialSections?: Record<string, string>;
  onSubmitted?: () => void;
}

export function BriefForm({ disputeId, partyId, initialSections = {}, onSubmitted }: BriefFormProps) {
  const [sections, setSections] = useState({
    factual_background: initialSections.factual_background ?? '',
    my_position: initialSections.my_position ?? '',
    supporting_arguments: initialSections.supporting_arguments ?? '',
    acknowledgment_of_opposing: initialSections.acknowledgment_of_opposing ?? '',
    desired_resolution: initialSections.desired_resolution ?? '',
  });

  const [status, setStatus] = useState<'draft' | 'submitted'>('draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(() => countWords(sections));

  function countWords(s: Record<string, string>) {
    return Object.values(s).join(' ').split(/\s+/).filter((w) => w.length > 0).length;
  }

  function updateSection(key: string, value: string) {
    const next = { ...sections, [key]: value };
    setSections(next);
    setWordCount(countWords(next));
  }

  async function saveDraft() {
    setLoading(true);
    setError('');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${disputeId}/parties/${partyId}/brief/draft`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ sections }),
      });
      setStatus('draft');
    } catch (err: any) {
      setError(err.message ?? 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  }

  async function submitBrief() {
    for (const key of Object.keys(sections)) {
      if (!sections[key]?.trim()) {
        setError(`Section "${key.replace(/_/g, ' ')}" is required`);
        return;
      }
    }

    if (wordCount > 5000) {
      setError('Brief exceeds 5000 word limit');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${disputeId}/parties/${partyId}/brief/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ sections }),
      });
      setStatus('submitted');
      onSubmitted?.();
    } catch (err: any) {
      setError(err.message ?? 'Failed to submit brief');
    } finally {
      setLoading(false);
    }
  }

  if (status === 'submitted') {
    return (
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-2">Brief Submitted</h2>
        <p className="text-gray-700">Your brief has been submitted. Proceed to payment to begin analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Your Brief</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="space-y-4">
        {[
          { key: 'factual_background', label: '1. Factual Background', placeholder: 'What happened?' },
          { key: 'my_position', label: '2. My Position', placeholder: 'What I claim' },
          { key: 'supporting_arguments', label: '3. Supporting Arguments', placeholder: 'Why my position is correct' },
          { key: 'acknowledgment_of_opposing', label: '4. Acknowledgment of Opposing Position', placeholder: 'What the other party will say' },
          { key: 'desired_resolution', label: '5. Desired Resolution', placeholder: 'What outcome I want' },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <textarea
              value={sections[key as keyof typeof sections]}
              onChange={(e) => updateSection(key, e.target.value)}
              placeholder={placeholder}
              className="w-full rounded border px-3 py-2"
              rows={4}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">Words: {wordCount} / 5000</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={saveDraft}
            disabled={loading}
            className="rounded border px-4 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={submitBrief}
            disabled={loading}
            className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Submit Brief
          </button>
        </div>
      </div>
    </div>
  );
}
