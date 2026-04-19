'use client';

import { authClient } from '@/lib/auth-client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function AuthButton() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:bg-zinc-100 rounded-lg px-3 py-2 transition-colors"
        >
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm font-medium text-zinc-700">
            {session.user.name || session.user.email}
          </span>
          <svg
            className={`w-4 h-4 text-zinc-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
              onClick={() => setShowDropdown(false)}
            >
              Contact
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
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
