'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [mounted, setMounted] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Basic setup
    setMounted(true);

    // Clear cart context on successful arrival
    clearCart();

    // Fetch securely generated Stripe session details if ID exists
    if (sessionId) {
      setLoading(true);
      fetch(`/api/checkout/${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOrderDetails(data);
            
            // Sync with our database
            fetch('/api/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                stripeSessionId: sessionId,
                transactionId: data.transactionId,
                customerName: data.customerName,
                customerEmail: data.customerEmail, 
                items: data.lineItems,
                totalAmount: data.total / 100
              })
            }).catch(err => console.error("Database sync failed:", err));
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [sessionId, clearCart]);

  if (!mounted) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20 min-h-[calc(100vh-16rem)] flex flex-col items-center w-full bg-white">
      <div className="w-full bg-white border border-zinc-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
        {/* Receipt Header */}
        <div className="bg-zinc-50 border-b border-zinc-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1 className="text-3xl font-playfair font-medium text-black tracking-tight">
            Payment Successful
          </h1>
          <p className="text-zinc-500 text-sm mt-2 uppercase tracking-widest font-light">THANK YOU FOR YOUR PURCHASE</p>
        </div>

        {/* Receipt Body */}
        <div className="p-8 md:p-12">
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-6 h-6 border-2 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400 text-xs tracking-widest uppercase">Fetching Order Details...</p>
            </div>
          ) : orderDetails ? (
            <div className="w-full">
              <div className="flex flex-col gap-6 mb-10 pb-6 border-b border-zinc-100">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Transaction ID</span>
                  <span className="text-[10px] text-black font-mono font-bold bg-zinc-50 px-2 py-1 border border-zinc-100 rounded-sm">
                    {orderDetails.transactionId}
                  </span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Order Summary</span>
                  <span className="text-xs text-zinc-400 font-mono italic flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    SECURE SESSION ACTIVE
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {orderDetails.lineItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-base font-medium text-black">{item.description}</span>
                      <span className="text-sm text-zinc-500 font-light">Qty: {item.quantity}</span>
                    </div>
                    <span className="text-base font-medium text-black">
                      ${(item.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-200 space-y-4">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span>${(orderDetails.total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-black pt-2">
                  <span className="uppercase tracking-widest">Total Paid</span>
                  <span>${(orderDetails.total / 100).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
                {orderDetails.receiptUrl && (
                  <a
                    href={orderDetails.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-black text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm shadow-lg hover:bg-zinc-800 transition-all text-center"
                  >
                    Download Receipt
                  </a>
                )}
                <Link
                  href="/"
                  className="w-full sm:w-auto border border-zinc-200 text-black px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:bg-zinc-50 transition-all text-center"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-zinc-500 mb-8 font-light">Unable to load receipt details.</p>
              <Link href="/" className="bg-black text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm shadow-xl">
                Return to Home
              </Link>
            </div>
          )}
        </div>

        {/* Receipt Footer */}
        <div className="bg-zinc-50 p-6 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 uppercase tracking-[0.3em] font-medium italic">Hand-crafted for the modern lifestyle</p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-32 text-center min-h-[calc(100vh-16rem)] flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-black rounded-full animate-spin"></div>
        <p className="mt-4 text-zinc-500 text-sm tracking-widest uppercase">Checking Status...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
