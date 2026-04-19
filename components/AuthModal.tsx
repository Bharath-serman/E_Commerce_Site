'use client';

import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({ isOpen, onClose, message }: AuthModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleCancel = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Sign In Required</h3>
        <p className="text-zinc-600 mb-6">
          {message || 'Please sign in to continue with your purchase.'}
        </p>
        <button
          onClick={handleSignIn}
          className="w-full bg-black text-white py-3 px-6 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={handleCancel}
          className="w-full mt-3 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
