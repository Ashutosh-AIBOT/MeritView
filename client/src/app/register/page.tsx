'use client';

import { useState } from 'react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, display_name: displayName, accept_terms: acceptTerms }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.message || 'Registration failed');
      return;
    }

    window.location.href = '/login?registered=1';
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h1 className="text-2xl font-bold mb-4">Create your MeritView account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border rounded p-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Display Name</label>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full border rounded p-2" required minLength={8} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
          I accept the terms of service
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full bg-primary text-white rounded py-2">Create account</button>
      </form>
      <p className="mt-4 text-sm text-center">Already have an account? <a href="/login" className="text-primary">Log in</a></p>
    </div>
  );
}
