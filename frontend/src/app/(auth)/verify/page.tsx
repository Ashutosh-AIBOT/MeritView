'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await apiClient.post('/auth/verify-email', { token });
      setMessage('Email verified successfully!');
    } catch (err: any) {
      setError(err.message ?? 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Verify Email</h1>
        {message ? (
          <p className="text-green-600">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600">{error}</p>}
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="mt-1 block w-full rounded border px-3 py-2 bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Verification Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 block w-full rounded border px-3 py-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
