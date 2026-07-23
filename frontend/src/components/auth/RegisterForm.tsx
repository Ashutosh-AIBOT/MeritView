'use client';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    display_name: '',
    accept_terms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.post('/auth/register', {
        email: form.email,
        password: form.password,
        display_name: form.display_name || undefined,
        accept_terms: true,
      });
      router.push('/auth/verify-email?email=' + encodeURIComponent(form.email));
    } catch (err: any) {
      setError(err.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Create Account</h1>
      {error && <p className="text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="mt-1 block w-full rounded border px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Display Name (optional)</label>
        <input
          type="text"
          value={form.display_name}
          onChange={(e) => setForm({ ...form, display_name: e.target.value })}
          className="mt-1 block w-full rounded border px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="mt-1 block w-full rounded border px-3 py-2"
          required
          minLength={8}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="terms"
          checked={form.accept_terms}
          onChange={(e) => setForm({ ...form, accept_terms: e.target.checked })}
          required
        />
        <label htmlFor="terms" className="text-sm">I accept the Terms of Service</label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
      <p className="text-sm text-gray-600">
        <a href="/login" className="text-blue-600 hover:underline">Already have an account?</a>
      </p>
    </form>
  );
}
