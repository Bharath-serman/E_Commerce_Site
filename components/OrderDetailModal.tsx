'use client';

import { useState } from 'react';
import Image from 'next/image';
import { jsPDF } from 'jspdf';

interface OrderDetailModalProps {
  order: any | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (orderId: string) => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

export default function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onDelete,
  onStatusChange,
}: OrderDetailModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  if (!isOpen || !order) return null;

  const orderRef = order.razorpay_order_id
    ? `#${order.razorpay_order_id.slice(-8).toUpperCase()}`
    : order.id
    ? `#${order.id.slice(-8).toUpperCase()}`
    : '#N/A';

  const formattedDate = order.created_at
    ? new Date(order.created_at).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const downloadPdfInvoice = () => {
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

      const refId = order.transaction_id || order.razorpay_payment_id || order.id || 'N/A';

      doc.text(`Order Reference: ${orderRef}`, 20, 46);
      doc.text(`Order Date: ${formattedDate}`, 20, 52);
      doc.text(`Payment Status: ${(order.status || 'PAID').toUpperCase()}`, 20, 58);
      doc.text(`Transaction ID: ${refId}`, 20, 64);

      doc.text(`Customer: ${order.customer_name || 'Customer'}`, pageWidth - 80, 46);
      doc.text(`Email: ${order.customer_email || 'N/A'}`, pageWidth - 80, 52);

      // Table Header
      doc.setFillColor(245, 245, 245);
      doc.rect(20, 74, pageWidth - 40, 9, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Item Description', 25, 80);
      doc.text('Qty', pageWidth - 70, 80);
      doc.text('Amount (INR)', pageWidth - 45, 80);

      // Items Rows
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      let y = 91;

      const items = order.items || [];
      items.forEach((item: any, idx: number) => {
        const itemText = `${idx + 1}. ${item.description || item.name || 'Product'}${
          item.selectedSize ? ` (Size: ${item.selectedSize})` : ''
        }`;
        doc.text(itemText.slice(0, 45), 25, y);
        doc.text(String(item.quantity || 1), pageWidth - 68, y);
        const amount = item.price ? item.price * (item.quantity || 1) : 0;
        doc.text(`Rs. ${amount.toFixed(2)}`, pageWidth - 45, y);
        y += 8;
      });

      // Bottom Divider
      doc.line(20, y + 2, pageWidth - 20, y + 2);
      y += 12;

      // Totals
      const totalFormatted = (order.total_amount || 0).toFixed(2);
      doc.setFont('helvetica', 'normal');
      doc.text('Subtotal:', pageWidth - 85, y);
      doc.text(`Rs. ${totalFormatted}`, pageWidth - 45, y);
      y += 7;

      if (order.discount_applied && order.discount_applied !== 'none') {
        doc.text(`Discount (${order.discount_applied}):`, pageWidth - 85, y);
        doc.text(`-Rs. ${(order.discount_amount || 0).toFixed(2)}`, pageWidth - 45, y);
        y += 7;
      }

      doc.text('Shipping:', pageWidth - 85, y);
      doc.text('FREE', pageWidth - 45, y);
      y += 8;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('Total Paid:', pageWidth - 85, y);
      doc.text(`Rs. ${totalFormatted}`, pageWidth - 45, y);

      // Footer
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text('Thank you for shopping with Aesthetic / Bethy Store.', 20, y + 25);
      doc.text('For queries regarding your order, contact support@bethy.com', 20, y + 30);

      doc.save(`Bill_${order.id?.slice(0, 8) || 'Order'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF bill:', err);
      alert('Unable to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusChange) return;
    try {
      setUpdatingStatus(true);
      await onStatusChange(order.id, newStatus);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-sm shadow-2xl border border-zinc-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-zinc-50 border-b border-zinc-200 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold font-playfair tracking-tight text-zinc-900">
                Order {orderRef}
              </h2>
              <span
                className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full border ${
                  order.status === 'paid'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : order.status === 'cancelled'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {order.status || 'pending'}
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-light mt-1">Placed on {formattedDate}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-black flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-140px)] overflow-y-auto">
          {/* Customer & Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 border border-zinc-200 rounded-sm p-4 text-xs">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                Customer Information
              </span>
              <p className="font-semibold text-zinc-900 text-sm">{order.customer_name || 'N/A'}</p>
              <p className="text-zinc-600 font-light">{order.customer_email || 'N/A'}</p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
                Payment Information
              </span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Method:</span>
                <span className="font-medium text-zinc-800">
                  {order.razorpay_order_id ? 'Razorpay' : 'UPI Instant'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">Transaction ID:</span>
                <span className="font-mono text-zinc-800 bg-white px-1.5 py-0.5 border border-zinc-200 rounded text-[11px]">
                  {order.transaction_id || order.razorpay_payment_id || order.id || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Product Bill / Items Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-3">
              Order Bill / Items ({order.items?.length || 0})
            </h3>
            <div className="border border-zinc-200 rounded-sm overflow-hidden">
              <table className="w-full text-left text-xs divide-y divide-zinc-200">
                <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item: any, idx: number) => {
                      const itemPrice = item.price || 0;
                      const itemQty = item.quantity || 1;
                      return (
                        <tr key={idx} className="hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <div className="relative w-10 h-10 bg-zinc-100 rounded border border-zinc-200 overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.image}
                                    alt={item.name || item.description || 'Product'}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-zinc-900">
                                  {item.description || item.name || 'Product Item'}
                                </p>
                                {item.selectedSize && (
                                  <span className="text-[10px] text-zinc-500">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-zinc-700">{itemQty}</td>
                          <td className="px-4 py-3 text-right text-zinc-600">₹{itemPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-zinc-900">
                            ₹{(itemPrice * itemQty).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-zinc-400">
                        No item details stored for this order.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t border-zinc-200 pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>₹{(order.total_amount || 0).toFixed(2)}</span>
            </div>

            {order.discount_applied && order.discount_applied !== 'none' && (
              <div className="flex justify-between text-green-700 bg-green-50 p-2 rounded-sm border border-green-100">
                <span>Discount Applied ({order.discount_applied})</span>
                <span>-₹{(order.discount_amount || 0).toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-zinc-600">
              <span>Shipping</span>
              <span className="font-semibold text-green-600 uppercase">FREE</span>
            </div>

            <div className="flex justify-between items-center text-base font-bold text-zinc-900 border-t border-zinc-200 pt-3">
              <span className="uppercase tracking-widest text-xs">Total Amount</span>
              <span className="text-xl font-playfair font-bold">
                ₹{(order.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Status Changer */}
          {onStatusChange && (
            <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-4 flex items-center justify-between text-xs">
              <span className="text-zinc-600 font-medium">Update Order Status:</span>
              <div className="flex gap-2">
                {['pending', 'paid', 'cancelled'].map((statusOption) => (
                  <button
                    key={statusOption}
                    disabled={updatingStatus || order.status === statusOption}
                    onClick={() => handleStatusUpdate(statusOption)}
                    className={`px-3 py-1.5 uppercase font-bold text-[10px] tracking-wider rounded-sm transition-colors border ${
                      order.status === statusOption
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-black'
                    } disabled:opacity-50`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex flex-wrap justify-between items-center gap-3">
          {onDelete && (
            <button
              onClick={() => onDelete(order.id)}
              className="text-red-600 hover:text-red-400 hover:bg-zinc-300 border border-transparent hover:border-zinc-700 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete Order
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={downloadPdfInvoice}
              disabled={downloading}
              className="bg-zinc-900 text-white px-5 py-2.5 text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-zinc-800 transition-colors flex items-center gap-2"
            >
              {downloading ? 'Generating...' : 'Download Bill'}
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button
              onClick={onClose}
              className="border border-zinc-300 text-zinc-700 hover:text-white hover:bg-zinc-800 hover:border-zinc-800 px-5 py-2.5 text-xs uppercase tracking-widest font-bold rounded-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
