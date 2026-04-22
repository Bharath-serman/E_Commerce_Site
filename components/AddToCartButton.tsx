'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { authClient } from '@/lib/auth-client';
import AuthModal from './AuthModal';

type ProductProps = {
  id: string;
  name: string;
  price: number;
  image: string;
  selectedSize?: string;
};

export default function AddToCartButton({ product, disabled }: { product: ProductProps; disabled?: boolean }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const data = await authClient.getSession();
        setSession(data.data);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  const handleAdd = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      selectedSize: product.selectedSize
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <button
        disabled
        className="w-full bg-zinc-200 text-zinc-400 px-8 py-4 rounded-sm text-xs tracking-[0.2em] uppercase font-bold cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={handleAdd}
        disabled={disabled || added}
        className={`w-full ${added ? 'bg-green-600 text-white' : disabled ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed' : 'bg-white border border-zinc-900 text-zinc-900 hover:bg-zinc-100'} px-8 py-4 rounded-sm transition-colors duration-300 text-xs tracking-[0.2em] uppercase font-bold`}
      >
        {added ? 'Added to Cart ✓' : disabled ? 'Select Size' : 'Add to Cart'}
      </button>
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Please sign in to add items to your cart."
      />
    </>
  );
}
