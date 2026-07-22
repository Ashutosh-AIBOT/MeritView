'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`/api/payments/${params.id}/payment-intent`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.intent?.client_secret) setClientSecret(data.intent.client_secret);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load payment');
        setLoading(false);
      });
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Pay $49</h1>
      {clientSecret ? (
        <form onSubmit={(e) => { e.preventDefault(); alert('Stripe Elements integration requires Stripe.js'); }} className="space-y-4">
          <div className="border rounded p-4">Stripe Elements mount point</div>
          <button type="submit" className="w-full bg-primary text-white rounded py-2">Pay Now</button>
        </form>
      ) : (
        <p>No payment pending.</p>
      )}
    </div>
  );
}
