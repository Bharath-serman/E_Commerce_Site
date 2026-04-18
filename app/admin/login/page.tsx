'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('redirected') === 'true') {
      setShowRedirectMessage(true);
    }
  }, [searchParams]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      
        <div className="w-[500px] justify-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest uppercase text-black">
            AESTHETIC ADMIN PANEL
          </h1>
          <h2 className="text-2xl font-medium text-zinc-900 mt-6">Sign In</h2>
          <p className="text-zinc-500 mt-2">Welcome to Aesthetic's Admin Page</p>
        </div>
      

        <div className="bg-white border border-zinc-200 rounded-lg shadow-sm p-8">
          {showRedirectMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 mb-6 rounded-sm text-sm">
              Please sign in to access the admin panel.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 rounded-sm text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-blue-50 border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="admin@aesthetic.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-blue-50 border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
