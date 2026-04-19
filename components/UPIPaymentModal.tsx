'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  upiId: string;
  merchantName: string;
  onConfirm: (transactionId: string) => void;
}

export default function UPIPaymentModal({
  isOpen,
  onClose,
  amount,
  upiId,
  merchantName,
  onConfirm,
}: UPIPaymentModalProps) {
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // UPI QR code format: upi://pay?pa=vpa&pn=name&am=amount&cu=INR
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;

  const handleConfirm = () => {
    if (!transactionId.trim()) {
      alert('Please enter the transaction ID');
      return;
    }
    setLoading(true);
    onConfirm(transactionId);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-zinc-900">UPI Payment</h2>
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

        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-zinc-600 mb-2">Scan QR code to pay</p>
            <div className="bg-white p-4 inline-block rounded-lg border border-zinc-200">
              <QRCodeSVG value={upiLink} size={200} level="M" includeMargin={false} />
            </div>
          </div>

          <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-zinc-600">Amount:</span>
              <span className="text-sm font-bold text-zinc-900">₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-600">UPI ID:</span>
              <span className="text-sm font-medium text-zinc-900">{upiId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-zinc-600">Merchant:</span>
              <span className="text-sm font-medium text-zinc-900">{merchantName}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="transactionId" className="block text-sm font-medium text-zinc-700">
              Transaction ID *
            </label>
            <input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter UTR/Transaction ID from your payment app"
              className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
              required
            />
            <p className="text-xs text-zinc-500">
              After completing payment in your UPI app, enter the transaction ID here to confirm.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full bg-black text-white py-3 px-4 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Confirming...' : 'Confirm Payment'}
          </button>

          <div className="text-center">
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
  );
}
