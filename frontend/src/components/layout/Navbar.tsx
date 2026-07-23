'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email?: string; role?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => setUser(data))
        .catch(() => setUser(null));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/');
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">MeritView</Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/disputes" className={`text-sm ${pathname.startsWith('/dashboard') ? 'text-blue-600' : 'text-gray-700'}`}>
            My Disputes
          </Link>
          {user?.role === 'admin' && (
            <Link href="/admin" className={`text-sm ${pathname.startsWith('/admin') ? 'text-blue-600' : 'text-gray-700'}`}>
              Admin
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">Logout</button>
            </div>
          ) : (
            <Link href="/login" className="rounded bg-blue-600 px-4 py-2 text-white text-sm hover:bg-blue-700">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
