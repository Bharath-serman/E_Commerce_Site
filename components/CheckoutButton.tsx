'use client';

import { useState } from 'react';
import { useCart, CartItem } from '@/contexts/CartContext';

interface CheckoutButtonProps {
  productId?: string; // Optional for single product checkout
  product?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  isCart?: boolean; // If true, uses all items in the cart
}

export default function CheckoutButton({ productId, product, isCart = false }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { items } = useCart();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // Determine what items to send to Stripe
      let checkoutItems: any[] = [];
      
      if (isCart) {
        checkoutItems = items;
      } else if (product) {
        checkoutItems = [{ ...product, quantity: 1 }];
      } else if (productId) {
        // Fallback for single product ID if product object isn't provided
        // In a real app, you'd fetch details from DB here or pass the object
        checkoutItems = [{ id: productId, name: 'Premium Item', price: 0, image: '', quantity: 1 }];
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: checkoutItems }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong with the checkout.");
    } finally {
      setLoading(false);
    }
  };

  const buttonText = isCart ? "Proceed to Checkout" : "Purchase Now";

  return (
    <button
      onClick={handleCheckout}
      disabled={loading || (isCart && items.length === 0)}
      className="w-full bg-black text-white px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold rounded-sm hover:bg-zinc-800 transition-all disabled:bg-zinc-300 disabled:cursor-not-allowed shadow-lg"
    >
      {loading ? "Redirecting..." : buttonText}
    </button>
  );
}
