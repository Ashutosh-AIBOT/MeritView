'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BriefForm from '@/components/BriefForm';

export default function DisputeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`/api/disputes/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        setDispute(data.dispute);
        setLoading(false);
      })
      .catch(() => router.push('/dashboard'));
  }, [params.id, router]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!dispute) return <div className="p-8">Dispute not found</div>;

  if (dispute.state === 'draft') {
    return (
      <div className="max-w-3xl mx-auto mt-10 p-6 border rounded">
        <h1 className="text-2xl font-bold mb-2">{dispute.title}</h1>
        <p className="text-sm text-gray-600 mb-6">Status: {dispute.state}</p>
        <BriefForm disputeId={dispute.id} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-2">{dispute.title}</h1>
      <p className="text-sm text-gray-600 mb-6">Status: {dispute.state}</p>
      <p>Continue to brief preparation.</p>
    </div>
  );
}
