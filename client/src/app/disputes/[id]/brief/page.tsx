'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SECTIONS = [
  { key: 'factual_background', label: 'Factual Background', placeholder: 'What happened?' },
  { key: 'my_position', label: 'My Position', placeholder: 'What I claim?' },
  { key: 'supporting_arguments', label: 'Supporting Arguments', placeholder: 'Why is my position correct?' },
  { key: 'acknowledgment_of_opposing', label: 'Acknowledgment of Opposing', placeholder: 'What the other party will say?' },
  { key: 'desired_resolution', label: 'Desired Resolution', placeholder: 'What outcome I want?' },
] as const;

type SectionKey = typeof SECTIONS[number]['key'];

type FormValues = Record<SectionKey, string>;

export default function BriefForm({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    factual_background: '',
    my_position: '',
    supporting_arguments: '',
    acknowledgment_of_opposing: '',
    desired_resolution: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const token = localStorage.getItem('access_token');
    const res = await fetch(`/api/briefs/${disputeId}/parties/party_me/brief/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message || 'Failed to submit brief');
      setSubmitting(false);
      return;
    }

    router.push(`/disputes/${disputeId}/payment`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {SECTIONS.map((section) => (
        <div key={section.key}>
          <label className="block text-sm font-medium">{section.label}</label>
          <textarea
            value={values[section.key]}
            onChange={(e) => setValues({ ...values, [section.key]: e.target.value })}
            className="mt-1 block w-full border rounded p-2"
            rows={4}
            required
          />
        </div>
      ))}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="bg-primary text-white rounded py-2 px-4 disabled:opacity-50">
        {submitting ? 'Submitting...' : 'Submit Brief'}
      </button>
    </form>
  );
}
