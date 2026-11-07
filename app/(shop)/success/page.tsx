'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { jsPDF } from 'jspdf';

function SuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');

  const [mounted, setMounted] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const downloadPdfInvoice = () => {
    if (!orderDetails) return;

    try {
      setDownloading(true);
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Top Brand Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('AESTHETIC / BETHY', 20, 24);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(110, 110, 110);
      doc.text('OFFICIAL ORDER RECEIPT & TAX INVOICE', 20, 31);

      // Horizontal Divider
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.5);
      doc.line(20, 36, pageWidth - 20, 36);

      // Order & Customer Details (2 columns)
      doc.setFontSize(9);
      doc.setTextColor(40, 40, 40);

      const refId = orderDetails.transactionId || orderDetails.transaction_id || orderDetails.id || orderId || 'N/A';
      const orderDate = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      doc.text(`Order Reference: #${String(refId).slice(-12).toUpperCase()}`, 20, 46);
      doc.text(`Order Date: ${orderDate}`, 20, 52);
      doc.text(`Payment Status: PAID`, 20, 58);

      doc.text(`Customer: ${orderDetails.customer_name || 'Customer'}`, pageWidth - 80, 46);
      doc.text(`Email: ${orderDetails.customer_email || 'N/A'}`, pageWidth - 80, 52);

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 68, pageWidth - 40, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Item Description', 25, 74);
      doc.text('Qty', pageWidth - 70, 74);
      doc.text('Amount (INR)', pageWidth - 45, 74);

      // Items Rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      let y = 85;

      const items = orderDetails.lineItems || [];
      items.forEach((item: any, idx: number) => {
        const itemText = `${idx + 1}. ${item.description || 'Product'}`;
        doc.text(itemText, 25, y);
        doc.text(String(item.quantity || 1), pageWidth - 68, y);
        doc.text(`Rs. ${(item.amount_total / 100).toFixed(2)}`, pageWidth - 45, y);
        y += 8;
      });

      // Bottom Divider
      doc.line(20, y + 2, pageWidth - 20, y + 2);
      y += 12;

      // Totals
      const subtotalFormatted = (orderDetails.total / 100).toFixed(2);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', pageWidth - 85, y);
      doc.text(`Rs. ${subtotalFormatted}`, pageWidth - 45, y);
      y += 7;

      doc.text('Shipping:', pageWidth - 85, y);
      doc.text('FREE', pageWidth - 45, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Total Paid:', pageWidth - 85, y);
      doc.text(`Rs. ${subtotalFormatted}`, pageWidth - 45, y);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('Thank you for shopping with Aesthetic / Bethy Store.', 20, y + 25);
      doc.text('For queries regarding your order, contact support@bethy.com', 20, y + 30);

      doc.save(`Bill_${orderId?.slice(0, 8) || 'Order'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF bill:', err);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    // Basic setup
    setMounted(true);

    // Clear cart context on successful arrival
    clearCart();

    // Handle Razorpay or UPI order payment
    if (orderId) {
      setLoading(true);
      // Try to fetch existing order first (by Razorpay ID or direct ID)
      const fetchOrder = async () => {
        try {
          let res = await fetch(`/api/orders/by-razorpay/${orderId}`);
          let data = await res.json();

          if (!data.success) {
            // Try fetching by primary order ID
            res = await fetch(`/api/orders/${orderId}`);
            data = await res.json();
          }

          if (data.success && data.data) {
            const ord = data.data;
            setOrderDetails({
              ...ord,
              transactionId: paymentId || ord.transaction_id || ord.razorpay_payment_id || 'CONFIRMED',
              total: ord.total_amount * 100,
              lineItems: (ord.items || []).map((item: any) => ({
                description: item.name,
                quantity: item.quantity,
                amount_total: (item.price || 0) * 100,
              })),
              metadata: {
                discountApplied: ord.discount_applied,
                discountAmount: (ord.discount_amount || 0) * 100,
                originalTotal: (ord.original_total || ord.total_amount) * 100,
              },
            });
            return;
          }

          // If not in database and paymentId exists, try create from Razorpay
          if (paymentId) {
            const createRes = await fetch('/api/orders/create-from-razorpay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId, paymentId }),
            });
            const createData = await createRes.json();
            if (createData?.success && createData.data) {
              const ord = createData.data;
              setOrderDetails({
                ...ord,
                transactionId: paymentId,
                total: ord.total_amount * 100,
                lineItems: (ord.items || []).map((item: any) => ({
                  description: item.name,
                  quantity: item.quantity,
                  amount_total: (item.price || 0) * 100,
                })),
                metadata: {
                  discountApplied: ord.discount_applied,
                  discountAmount: (ord.discount_amount || 0) * 100,
                  originalTotal: (ord.original_total || ord.total_amount) * 100,
                },
              });
            }
          }
        } catch (err) {
          console.error('Error fetching order receipt:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderId, paymentId, clearCart]);

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
                      ₹{(item.amount_total / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-zinc-200 space-y-4">
                <div className="flex justify-between text-sm text-zinc-500">
                  <span>Subtotal</span>
                  <span>₹{(orderDetails.total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-black pt-2">
                  <span className="uppercase tracking-widest">Total Paid</span>
                  <span>₹{(orderDetails.total / 100).toFixed(2)}</span>
                </div>
                
                {orderDetails.metadata?.discountApplied && orderDetails.metadata.discountApplied !== 'none' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-800">Discount Applied</span>
                      <span className="text-sm font-bold text-green-600">{orderDetails.metadata.discountApplied}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-green-700">Original Total</span>
                      <span className="text-sm font-medium">₹{orderDetails.metadata.originalTotal ? (parseFloat(orderDetails.metadata.originalTotal) / 100).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-green-700">Discount Amount</span>
                      <span className="text-sm font-medium text-green-600">-₹{orderDetails.metadata.discountAmount ? (parseFloat(orderDetails.metadata.discountAmount) / 100).toFixed(2) : '0.00'}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 items-center">
                <button
                  type="button"
                  disabled={downloading}
                  onClick={downloadPdfInvoice}
                  className="w-full sm:w-auto bg-black text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm shadow-lg hover:bg-zinc-800 transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  {downloading ? 'Preparing PDF...' : 'Download Bill (PDF)'}
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto border border-zinc-300 text-zinc-800 px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:bg-zinc-50 transition-all text-center"
                >
                  Back to Home Screen
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
