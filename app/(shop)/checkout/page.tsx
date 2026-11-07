'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { authClient } from '@/lib/auth-client';
import { QRCodeSVG } from 'qrcode.react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirect = searchParams.get('direct') === 'true';

  const { items: cartItems, discountedTotal: cartTotal, clearCart } = useCart();

  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Items to checkout
  const [checkoutItems, setCheckoutItems] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Customer & Shipping Form
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay'>('upi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UPI Order Details
  const [upiOrder, setUpiOrder] = useState<{
    orderId: string;
    orderRef: string;
    upiUrl: string;
    upiId: string;
    upiName: string;
    amount: number;
  } | null>(null);

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [verifyingUpi, setVerifyingUpi] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQrOnMobile, setShowQrOnMobile] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 minutes timer

  // Detect mobile & load session & items
  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent : '';
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      setIsMobile(mobileRegex.test(userAgent) || isTouch);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    authClient
      .getSession()
      .then((res: any) => {
        if (res?.data?.user) {
          setSession(res.data);
          setCustomerName(res.data.user.name || '');
          setCustomerEmail(res.data.user.email || '');
          if (res.data.user.phone) setCustomerPhone(res.data.user.phone);
        }
      })
      .catch(console.error);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine items and compute total
  useEffect(() => {
    if (!mounted) return;

    if (isDirect) {
      try {
        const stored = sessionStorage.getItem('direct_checkout_item');
        if (stored) {
          const item = JSON.parse(stored);
          setCheckoutItems([item]);
          setTotalAmount((item.price || 0) * (item.quantity || 1));
          return;
        }
      } catch (e) {
        console.error('Error reading direct checkout item:', e);
      }
    }

    // Default to cart items
    if (cartItems && cartItems.length > 0) {
      setCheckoutItems(cartItems);
      setTotalAmount(cartTotal);
    }
  }, [mounted, isDirect, cartItems, cartTotal]);

  // Step 1: Countdown timer (10 minutes)
  useEffect(() => {
    if (!upiOrder) return;
    setCountdown(600);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [upiOrder]);

  // Step 2: Live Continuous Long Polling (asks server every 1.5s if money arrived)
  useEffect(() => {
    if (!upiOrder?.orderId) return;

    let isSubscribed = true;

    const pollStatus = async () => {
      try {
        const res = await fetch(`/api/upi/status?orderId=${upiOrder.orderId}`);
        const data = await res.json();

        // ONLY redirect when the server database explicitly confirms paid: true
        if (data.paid && isSubscribed) {
          clearCart();
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('direct_checkout_item');
          }
          router.push(`/success?order_id=${upiOrder.orderId}&payment_id=${data.transactionId || upiOrder.orderRef}`);
        }
      } catch (err) {
        console.warn('Live poll error:', err);
      }
    };

    // Fast polling every 1.5 seconds
    const interval = setInterval(pollStatus, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [upiOrder, router, clearCart]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Helper: validate shipping info
  const validateForm = () => {
    if (!customerName.trim()) {
      setError('Please provide your full name');
      return false;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please provide a valid email address');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.length < 10) {
      setError('Please provide a valid 10-digit phone number');
      return false;
    }
    if (!address.trim() || !city.trim() || !pincode.trim()) {
      setError('Please complete the delivery address');
      return false;
    }
    setError(null);
    return true;
  };

  // Handle UPI Order Generation
  const handleInitiateUPI = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/upi/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: checkoutItems,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to initialize UPI order');
      }

      setUpiOrder(data);
      setCountdown(600);
    } catch (err: any) {
      setError(err.message || 'Error creating UPI transaction');
    } finally {
      setLoading(false);
    }
  };

  // Handle UPI Verification
  const handleVerifyUPI = async () => {
    if (!upiOrder) return;

    setVerifyingUpi(true);
    setError(null);

    try {
      const res = await fetch('/api/upi/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: upiOrder.orderId,
          utrNumber: utrNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Payment verification failed');
      }

      // Clear cart & session
      clearCart();
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('direct_checkout_item');
      }

      router.push(data.redirectUrl || `/success?order_id=${upiOrder.orderId}`);
    } catch (err: any) {
      setError(err.message || 'Payment not verified. If debited, please enter your 12-digit UTR number.');
    } finally {
      setVerifyingUpi(false);
    }
  };

  const handleSimulateBankNotification = async () => {
    if (!upiOrder) return;
    try {
      await fetch('/api/upi/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: upiOrder.orderId,
          txnId: upiOrder.orderRef,
          amount: upiOrder.amount,
        }),
      });
    } catch (e) {
      console.error('Error simulating bank webhook:', e);
    }
  };

  // Cancel UPI Order
  const handleCancelUPI = async () => {
    if (upiOrder) {
      try {
        await fetch('/api/upi/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: upiOrder.orderId }),
        });
      } catch (e) {
        console.warn(e);
      }
    }
    router.push('/checkout/failed?reason=Payment cancelled by user');
  };

  // Handle Razorpay (Keeping Razorpay as it is)
  const handleRazorpay = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      // Load Razorpay script if needed
      if (!(window as any).Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: checkoutItems }),
      });

      const data = await response.json();
      if (data.orderId) {
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: 'Bethy Store',
          description: `Total: ₹${(data.amount / 100).toFixed(2)}`,
          order_id: data.orderId,
          handler: function (res: any) {
            clearCart();
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('direct_checkout_item');
            }
            window.location.href = `/success?order_id=${res.razorpay_order_id}&payment_id=${res.razorpay_payment_id}`;
          },
          prefill: {
            name: customerName,
            email: customerEmail,
            contact: customerPhone,
          },
          theme: { color: '#000000' },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        throw new Error(data.error || 'Failed to initiate Razorpay order');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Razorpay');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (checkoutItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl font-playfair font-medium text-black mb-4">Your Checkout is Empty</h1>
        <p className="text-zinc-500 mb-8 font-light">Select products from the store or your cart to proceed.</p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-8 py-3 text-xs uppercase tracking-widest font-medium hover:bg-zinc-800 transition-colors"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  // Format countdown minutes:seconds
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-playfair font-medium text-black tracking-tight">Checkout</h1>
        <p className="text-sm text-zinc-500 font-light mt-1">Review your order and choose your payment method</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-8 rounded-sm text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Form & Payment */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Customer Details */}
          <div className="bg-white border border-zinc-200 p-6 rounded-sm shadow-sm">
            <h2 className="text-base font-medium text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">1</span>
              Contact & Delivery Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Fashion Street, Apt 4B"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider mb-1">State</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 uppercase tracking-wider mb-1">PIN Code</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="400001"
                  className="w-full border border-zinc-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white border border-zinc-200 p-6 rounded-sm shadow-sm">
            <h2 className="text-base font-medium text-zinc-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs">2</span>
              Payment Method
            </h2>

            {/* Select Method Tabs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('upi');
                  setUpiOrder(null);
                }}
                className={`p-4 border text-left rounded-sm transition-all ${
                  paymentMethod === 'upi'
                    ? 'border-black bg-zinc-50 ring-1 ring-black'
                    : 'border-zinc-200 hover:border-zinc-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-zinc-900">UPI Instant</span>
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded">FAST</span>
                </div>
                <p className="text-xs text-zinc-500 font-light mb-2">
                  GPay, PhonePe, Paytm & QR Code
                </p>
                <div className="flex gap-1.5 items-center">
                  <span className="text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-700 font-medium">GPay</span>
                  <span className="text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-purple-700 font-medium">PhonePe</span>
                  <span className="text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-blue-700 font-medium">Paytm</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('razorpay');
                  setUpiOrder(null);
                }}
                className={`p-4 border text-left rounded-sm transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-black bg-zinc-50 ring-1 ring-black'
                    : 'border-zinc-200 hover:border-zinc-400 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-zinc-900">Razorpay</span>
                  <span className="text-[10px] bg-zinc-100 text-zinc-700 font-bold px-1.5 py-0.5 rounded">CARDS / NB</span>
                </div>
                <p className="text-xs text-zinc-500 font-light mb-2">
                  Debit/Credit Cards, Net Banking & Wallets
                </p>
                <div className="flex gap-1.5 items-center">
                  <span className="text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-600">Visa</span>
                  <span className="text-[10px] bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-600">Mastercard</span>
                </div>
              </button>
            </div>

            {/* Payment Details Container */}
            {paymentMethod === 'razorpay' ? (
              <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-sm text-xs text-zinc-600">
                  You will be securely redirected to Razorpay checkout to complete your payment with Credit Card, Debit Card, or NetBanking.
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRazorpay}
                  className="w-full bg-black text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)} with Razorpay`}
                </button>
              </div>
            ) : (
              /* UPI Payment Flow */
              <div className="space-y-6">
                {!upiOrder ? (
                  <div>
                    <p className="text-xs text-zinc-500 font-light mb-4">
                      Pay instantly with any UPI App. Scan a dynamic QR code on Desktop/Laptop, or launch your installed UPI app directly on Mobile.
                    </p>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleInitiateUPI}
                      className="w-full bg-black text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Generating UPI Order...' : `Proceed to Pay ₹${totalAmount.toFixed(2)} via UPI`}
                    </button>
                  </div>
                ) : (
                  /* Active UPI Order View */
                  <div className="border border-zinc-200 rounded-sm p-6 bg-white space-y-6">
                    {/* Header with Countdown */}
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                      <div>
                        <span className="text-xs text-zinc-400 uppercase tracking-wider block">Order Reference</span>
                        <span className="text-xs font-mono font-bold text-zinc-800">{upiOrder.orderRef}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-zinc-400 uppercase tracking-wider block">Expires In</span>
                        <span className={`text-xs font-mono font-bold ${countdown < 60 ? 'text-red-600' : 'text-zinc-800'}`}>
                          {timeFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Amount Highlight */}
                    <div className="text-center py-2 bg-zinc-50 rounded-sm">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider block">Total Amount to Pay</span>
                      <span className="text-2xl font-bold font-playfair text-zinc-900">₹{upiOrder.amount.toFixed(2)}</span>
                    </div>

                    {countdown <= 0 ? (
                      /* QR Expired View */
                      <div className="p-8 text-center bg-zinc-50 border border-zinc-200 rounded-sm space-y-3">
                        <p className="text-sm font-semibold text-red-600">QR Code Expired</p>
                        <p className="text-xs text-zinc-500 font-light">The 10-minute payment window has elapsed. Please generate a fresh code.</p>
                        <button
                          type="button"
                          onClick={handleInitiateUPI}
                          className="bg-black text-white px-6 py-2.5 text-xs uppercase tracking-widest font-bold rounded-sm hover:bg-zinc-800"
                        >
                          Generate New QR Code
                        </button>
                      </div>
                    ) : isMobile && !showQrOnMobile ? (
                      /* Mobile View: Direct App Links */
                      <div className="space-y-3">
                        <p className="text-xs text-center text-zinc-600 font-medium">
                          Tap your preferred UPI app to pay:
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Google Pay */}
                          <a
                            href={upiOrder.upiUrl.replace('upi://', 'tez://')}
                            className="flex items-center justify-center gap-3 p-3 bg-white border border-zinc-300 rounded-sm hover:border-black transition-all shadow-sm"
                          >
                            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                            <span className="text-xs font-semibold text-zinc-800">Google Pay</span>
                          </a>

                          {/* PhonePe */}
                          <a
                            href={upiOrder.upiUrl.replace('upi://', 'phonepe://')}
                            className="flex items-center justify-center gap-3 p-3 bg-white border border-zinc-300 rounded-sm hover:border-black transition-all shadow-sm"
                          >
                            <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span>
                            <span className="text-xs font-semibold text-zinc-800">PhonePe</span>
                          </a>

                          {/* Paytm */}
                          <a
                            href={upiOrder.upiUrl.replace('upi://', 'paytmmp://')}
                            className="flex items-center justify-center gap-3 p-3 bg-white border border-zinc-300 rounded-sm hover:border-black transition-all shadow-sm"
                          >
                            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
                            <span className="text-xs font-semibold text-zinc-800">Paytm</span>
                          </a>

                          {/* Generic UPI Intent (Opens chooser) */}
                          <a
                            href={upiOrder.upiUrl}
                            className="flex items-center justify-center gap-3 p-3 bg-black text-white rounded-sm hover:bg-zinc-800 transition-all shadow-sm"
                          >
                            <span className="text-xs font-semibold tracking-wider uppercase">Other UPI Apps</span>
                          </a>
                        </div>

                        <div className="text-center pt-2">
                          <button
                            type="button"
                            onClick={() => setShowQrOnMobile(true)}
                            className="text-xs text-zinc-500 hover:text-black underline font-light"
                          >
                            Show QR Code instead
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Desktop View (or Mobile requested QR): QR Code Display */
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-white border-2 border-zinc-200 rounded-lg shadow-sm">
                          <QRCodeSVG
                            value={upiOrder.upiUrl}
                            size={210}
                            level="H"
                            includeMargin={true}
                          />
                        </div>

                        <p className="text-xs text-center text-zinc-600 max-w-xs font-light">
                          Scan this QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM) on your mobile phone to complete payment.
                        </p>

                        {isMobile && (
                          <button
                            type="button"
                            onClick={() => setShowQrOnMobile(false)}
                            className="text-xs text-zinc-500 hover:text-black underline font-light"
                          >
                            Back to UPI App Buttons
                          </button>
                        )}
                      </div>
                    )}

                    {/* Copy UPI ID details */}
                    <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-sm flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Merchant UPI ID</span>
                        <span className="font-mono font-medium text-zinc-800">{upiOrder.upiId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(upiOrder.upiId)}
                        className="border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-medium rounded hover:bg-zinc-100 transition-colors"
                      >
                        {copiedUpi ? 'Copied! ✓' : 'Copy'}
                      </button>
                    </div>

                    {/* Step 2 Continuous Polling & Live Status */}
                    <div className="pt-4 border-t border-zinc-100 space-y-4">
                      <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-4 text-center space-y-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                          <span className="text-xs font-semibold text-zinc-900 tracking-wide">
                            Listening for Bank Confirmation...
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-light max-w-xs mx-auto">
                          Checking automatically every second. The moment your transfer lands, your bill will appear.
                        </p>
                        <div className="pt-2 border-t border-zinc-100">
                          <button
                            type="button"
                            onClick={handleSimulateBankNotification}
                            className="text-[11px] text-zinc-500 hover:text-black underline font-light transition-colors"
                            title="Simulate bank SMS credit confirmation for this order"
                          >
                            ⚡ [Test Mode] Simulate Bank SMS Credit
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCancelUPI}
                        className="w-full text-zinc-400 hover:text-red-600 py-1.5 text-xs uppercase tracking-wider font-light transition-colors text-center"
                      >
                        Cancel Payment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-zinc-200 p-6 rounded-sm shadow-sm sticky top-24 space-y-6">
            <h2 className="text-base font-medium text-zinc-900 uppercase tracking-wider border-b border-zinc-100 pb-3">
              Order Summary ({checkoutItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items)
            </h2>

            {/* Items list */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {checkoutItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex gap-4 items-center border-b border-zinc-50 pb-3">
                  <div className="relative w-16 h-16 bg-zinc-100 rounded-sm overflow-hidden flex-shrink-0 border border-zinc-200">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-400">
                        Item
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-medium text-zinc-900 truncate">{item.name}</h3>
                    {item.selectedSize && (
                      <p className="text-[11px] text-zinc-500">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-[11px] text-zinc-500">Qty: {item.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-900">
                      ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="space-y-2 text-xs text-zinc-600 border-t border-zinc-100 pt-4 font-light">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-zinc-900">₹{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-green-600 uppercase">FREE</span>
              </div>
              <div className="border-t border-zinc-200 pt-3 flex justify-between items-center text-sm">
                <span className="font-semibold text-zinc-900">Total Payable</span>
                <span className="text-lg font-bold font-playfair text-zinc-900">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Trust badge */}
            <div className="bg-zinc-50 p-3 rounded-sm border border-zinc-100 text-[11px] text-zinc-500 text-center font-light">
              🔒 256-bit Encrypted Checkout. Direct UPI & Secure Payments.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-zinc-400">
          Loading checkout...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
