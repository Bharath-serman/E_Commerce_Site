'use client';

import { useState } from 'react';
import UPIPaymentModal from './UPIPaymentModal';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onStripeCheckout: () => void;
  onUPIPayment: (transactionId: string) => void;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  totalAmount,
  onStripeCheckout,
  onUPIPayment,
}: PaymentMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'upi' | null>(null);
  const [upiModalOpen, setUpiModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleUPIConfirm = (transactionId: string) => {
    onUPIPayment(transactionId);
    setUpiModalOpen(false);
    onClose();
  };

  const handleMethodSelect = (method: 'stripe' | 'upi') => {
    if (method === 'stripe') {
      onStripeCheckout();
      onClose();
    } else if (method === 'upi') {
      setSelectedMethod('upi');
      setUpiModalOpen(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-zinc-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-zinc-900">Select Payment Method</h2>
              <button
                onClick={onClose}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center mb-6">
              <p className="text-sm text-zinc-600">Total Amount</p>
              <p className="text-3xl font-bold text-zinc-900">${totalAmount.toFixed(2)}</p>
            </div>

            <button
              onClick={() => handleMethodSelect('stripe')}
              className="w-full flex items-center gap-4 p-4 border border-zinc-200 rounded-lg hover:border-black hover:bg-zinc-50 transition-all"
            >
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">Stripe</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-zinc-900">Card Payment</p>
                <p className="text-xs text-zinc-500">Pay with credit/debit card</p>
              </div>
            </button>

            <button
              onClick={() => handleMethodSelect('upi')}
              className="w-full flex items-center gap-4 p-4 border border-zinc-200 rounded-lg hover:border-black hover:bg-zinc-50 transition-all"
            >
              <div className="w-12 h-8 bg-green-600 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">UPI</span>
              </div>
              <div className="text-left">
                <p className="font-medium text-zinc-900">UPI Payment</p>
                <p className="text-xs text-zinc-500">Pay with GPay, PhonePe, Paytm</p>
              </div>
            </button>

            <div className="text-center pt-4">
              <button
                onClick={onClose}
                className="text-sm text-zinc-600 hover:text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <UPIPaymentModal
        isOpen={upiModalOpen}
        onClose={() => {
          setUpiModalOpen(false);
          setSelectedMethod(null);
        }}
        amount={totalAmount}
        upiId={process.env.NEXT_PUBLIC_UPI_ID || 'your-vpa@upi'}
        merchantName="Aesthetic"
        onConfirm={handleUPIConfirm}
      />
    </>
  );
}
