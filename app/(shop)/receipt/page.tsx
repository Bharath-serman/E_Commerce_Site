'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ReceiptPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/checkout/${sessionId}`);
        const data = await response.json();
        
        if (data.success) {
          setOrderDetails(data);
        } else {
          setError('Failed to load receipt details');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId]);

  const downloadReceipt = async () => {
    if (!orderDetails?.receiptUrl) return;

    try {
      setDownloading(true);
      
      const response = await fetch('/api/receipt/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ receiptUrl: orderDetails.receiptUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${sessionId?.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Receipt not found'}</p>
          <Link 
            href="/success" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Return to Order Summary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Receipt</h1>
              <p className="text-gray-600 mt-1">Transaction ID: {orderDetails.transactionId}</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={downloadReceipt}
                disabled={downloading}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {downloading ? 'Downloading...' : 'Download Receipt'}
              </button>
              <Link
                href="/success"
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Order
              </Link>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-medium">{orderDetails.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Email</p>
                <p className="font-medium">{orderDetails.customerEmail}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Items Ordered</h3>
              <div className="space-y-3">
                {orderDetails.lineItems.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{item.description}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ${(item.amount_total / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${(orderDetails.total / 100).toFixed(2)}</span>
                </div>
                
                {orderDetails.metadata?.discountApplied && orderDetails.metadata.discountApplied !== 'none' && (
                  <>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount Applied</span>
                      <span>-{orderDetails.metadata.discountAmount ? (parseFloat(orderDetails.metadata.discountAmount) / 100).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Original Total</span>
                      <span>${orderDetails.metadata.originalTotal ? (parseFloat(orderDetails.metadata.originalTotal) / 100).toFixed(2) : '0.00'}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total Paid</span>
                  <span>${(orderDetails.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Status</span>
              <span className="text-sm font-medium text-green-600">Paid</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Payment Method</span>
              <span className="text-sm font-medium">Credit Card</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Order Date</span>
              <span className="text-sm font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
