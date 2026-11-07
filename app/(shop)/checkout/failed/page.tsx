'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function FailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const reason = searchParams.get('reason') || 'The transaction could not be completed or was cancelled.';

  return (
    <div className="max-w-xl mx-auto px-4 py-20 min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center w-full bg-white">
      <div className="w-full bg-white border border-zinc-200 rounded-sm shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-red-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>

        <h1 className="text-3xl font-playfair font-medium text-black tracking-tight mb-2">
          Payment Incomplete
        </h1>
        <p className="text-sm text-zinc-600 mb-6 font-light">{reason}</p>

        {orderId && (
          <div className="bg-zinc-50 border border-zinc-200 rounded p-3 mb-6 text-xs text-zinc-500 font-mono">
            Reference Order: #{orderId.slice(0, 12)}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="bg-black text-white px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-zinc-800 transition-colors rounded-sm"
          >
            Try Again
          </Link>
          <Link
            href="/cart"
            className="border border-zinc-300 text-zinc-800 px-6 py-3 text-xs uppercase tracking-widest font-medium hover:bg-zinc-50 transition-colors rounded-sm"
          >
            Return to Cart
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-zinc-400">
          Loading...
        </div>
      }
    >
      <FailedContent />
    </Suspense>
  );
}
