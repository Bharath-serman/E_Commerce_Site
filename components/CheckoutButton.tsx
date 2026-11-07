'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  const handleCheckout = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    try {
      if (isCart) {
        if (items.length === 0) {
          alert("Your cart is empty");
          setLoading(false);
          return;
        }
        router.push('/checkout');
      } else {
        const itemToCheckout = product || (productId ? {
          id: productId,
          name: 'Selected Product',
          price: 0,
          image: '',
          quantity: 1
        } : null);

        if (itemToCheckout) {
          sessionStorage.setItem('direct_checkout_item', JSON.stringify({
            ...itemToCheckout,
            quantity: 1
          }));
          router.push('/checkout?direct=true');
        } else {
          router.push('/checkout');
        }
      }
    } catch (err) {
      console.error('Navigation to checkout failed:', err);
      setLoading(false);
    }
  };

  const buttonText = isCart ? "Proceed to Checkout" : "Buy Now";

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
        disabled={disabled || loading || (isCart && items.length === 0)}
        className="w-full bg-black text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:bg-zinc-800 transition-all disabled:bg-zinc-300 disabled:text-zinc-500 disabled:cursor-not-allowed shadow-lg"
      >
        {loading ? "Redirecting to Checkout..." : disabled ? "Unavailable" : buttonText}
      </button>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in to complete your purchase."
      />
    </>
  );
}
