'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BriefForm } from '@/components/BriefForm';

export default function BriefPage() {
  const params = useParams();
  const disputeId = params.id as string;
  const [partyId, setPartyId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${disputeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load dispute');
        const data = await res.json();
        const party = data.dispute?.parties?.[0];
        if (party) setPartyId(party.id);
      })
      .catch((err) => setError(err.message));
  }, [disputeId]);

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!partyId) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Prepare Your Brief</h1>
      <BriefForm disputeId={disputeId} partyId={partyId} />
    </div>
  );
}
