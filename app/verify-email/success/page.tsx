'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export default function VerifyEmailSuccessPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await authClient.getSession();
        if (session.data) {
          setIsSignedIn(true);
          // Redirect to main page after a short delay
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          setIsSignedIn(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsSignedIn(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest uppercase text-black font-playfair">
            Aesthetic
          </h1>
        </div>

        <div className="bg-white border border-zinc-200 rounded-sm p-8">
          {isChecking ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black mb-4"></div>
              <p className="text-zinc-600">Verifying your email...</p>
            </div>
          ) : isSignedIn ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6 rounded-sm text-sm">
                Email verified successfully!
              </div>
              <p className="text-zinc-700 mb-4">
                You are now signed in. Redirecting to the main page...
              </p>
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6 rounded-sm text-sm">
                Email verified successfully!
              </div>
              <p className="text-zinc-700 mb-6">
                Your email has been verified. Please sign in to continue.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/sign-in')}
                  className="block w-full bg-black text-white py-3 px-4 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors text-center"
                >
                  Go to Sign In
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="block w-full text-sm text-zinc-600 hover:text-black text-center"
                >
                  ← Back to home
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
