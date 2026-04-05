'use client';

import { useState } from 'react';
import { useCart } from '@/contexts/CartContext';

type ProductProps = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export default function AddToCartButton({ product }: { product: ProductProps }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button 
      onClick={handleAdd}
      className={`w-full ${added ? 'bg-green-600 text-white' : 'bg-white border border-zinc-900 text-zinc-900 hover:bg-zinc-100'} px-8 py-4 rounded-sm transition-colors duration-300 text-xs tracking-[0.2em] uppercase font-bold`}
    >
      {added ? 'Added to Cart ✓' : 'Add to Basket'}
    </button>
  );
}
