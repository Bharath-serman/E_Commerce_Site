'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';
import { authClient } from '@/lib/auth-client';
import AuthModal from './AuthModal';

interface CheckoutButtonProps {
  productId?: string; // Optional for single product checkout
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
    selectedSize?: string;
  };
  isCart?: boolean; // If true, uses all items in cart
  discountCode?: string; // Optional discount code
  disabled?: boolean;
}

export default function CheckoutButton({ productId, product, isCart = false, discountCode, disabled }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const { items } = useCart();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authClient.getSession();
        setSession(data.data);
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadRazorpayScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Razorpay) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () => reject());
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setRazorpayLoading(true);

    try {
      await loadRazorpayScript();
    } catch (error) {
      alert("Failed to load payment gateway. Please try again.");
      setLoading(false);
      setRazorpayLoading(false);
      return;
    }

    setRazorpayLoading(false);

    try {
      // Determine what items to send to Razorpay
      let checkoutItems: any[] = [];

      if (isCart) {
        checkoutItems = items;
      } else if (product) {
        checkoutItems = [{ ...product, quantity: 1 }];
      } else if (productId) {
        // Fallback for single product ID if product object isn't provided
        checkoutItems = [{ id: productId, name: 'Premium Item', price: 0, image: '', quantity: 1 }];
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: checkoutItems, discountCode }),
      });

      const data = await response.json();
      if (data.orderId) {
        // Generate product description for Razorpay
        const productDescription = checkoutItems.length === 1
          ? checkoutItems[0].name
          : `${checkoutItems.length} items: ${checkoutItems.map(item => item.name).join(', ')}`;

        // Initialize Razorpay checkout
        const options = {
          key: data.key_id,
          amount: data.amount,
          currency: data.currency,
          name: productDescription,
          description: `Total: ₹${(data.amount / 100).toFixed(2)}`,
          order_id: data.orderId,
          notes: {
            items: JSON.stringify(checkoutItems.map(item => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity
            })))
          },
          handler: function (response: any) {
            // Payment successful - redirect to success page
            window.location.href = `/success?order_id=${response.razorpay_order_id}&payment_id=${response.razorpay_payment_id}`;
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || '',
            contact: session?.user?.phone || ''
          },
          theme: {
            color: '#000000'
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        alert("Checkout failed: " + (data.error || "Unknown error"));
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong with the checkout.");
      setLoading(false);
    }
  };

  const buttonText = isCart ? "Proceed to Checkout" : "Purchase Now";

  if (authLoading) {
    return (
      <button
        disabled
        className="w-full bg-zinc-300 text-zinc-500 px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm cursor-not-allowed shadow-lg"
      >
        Loading...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleCheckout}
        disabled={disabled || loading || razorpayLoading || (isCart && items.length === 0)}
        className="w-full bg-black text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:bg-zinc-800 transition-all disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-lg"
      >
        {razorpayLoading ? "Loading Payment..." : loading ? "Redirecting..." : disabled ? "Purchase Now" : buttonText}
      </button>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in to complete your purchase."
      />
    </>
  );
}
