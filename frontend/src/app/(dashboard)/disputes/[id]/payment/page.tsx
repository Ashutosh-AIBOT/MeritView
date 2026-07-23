'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PaymentPage() {
  const params = useParams();
  const disputeId = params.id as string;
  const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${disputeId}/payment-intent`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to initialize payment');
        const data = await res.json();
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        setError(err.message);
        setStatus('error');
      });
  }, [disputeId]);

  const handlePay = async () => {
    setStatus('processing');
    setError('');

    // In production, use Stripe.js to confirm the card payment
    // and then call the backend confirm endpoint
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/disputes/${disputeId}/payment/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ payment_intent_id: clientSecret }),
      });

      if (!res.ok) throw new Error('Payment confirmation failed');
      setStatus('success');
      setTimeout(() => window.location.href = `/dashboard/disputes/${disputeId}`, 1500);
    } catch (err: any) {
      setError(err.message ?? 'Payment failed');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-gray-700">Your dispute analysis is now in progress.</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white border rounded-lg p-8">
        <h1 className="text-2xl font-bold mb-4">Complete Payment</h1>
        <p className="text-gray-700 mb-6">Analysis fee: <strong>$49.00</strong></p>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {status === 'pending' && (
          <button
            onClick={handlePay}
            className="w-full rounded bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
          >
            Pay $49.00
          </button>
        )}

        {status === 'processing' && (
          <p className="text-gray-600">Processing payment...</p>
        )}
      </div>
    </div>
  );
}
