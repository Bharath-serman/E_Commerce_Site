'use client';

import { authClient } from '@/lib/auth-client';
import { useState, useEffect } from 'react';

export default function AuthButton() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const data = await authClient.getSession();
        setSession(data.data);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return null;
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-zinc-700">
            {session.user.name || session.user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <a
        href="/sign-in"
        className="text-xs font-bold uppercase tracking-widest text-zinc-600 hover:text-black transition-colors"
      >
        Sign In
      </a>
      <a
        href="/sign-up"
        className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors rounded-sm"
      >
        Sign Up
      </a>
    </div>
  );
}
