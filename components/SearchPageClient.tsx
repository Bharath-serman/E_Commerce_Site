'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

interface SearchPageClientProps {
  initialProducts: any[];
  initialQuery: string;
}

export default function SearchPageClient({
  initialProducts,
  initialQuery,
}: SearchPageClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const [, startTransition] = useTransition();

  const handleQueryChange = (val: string) => {
    setQuery(val);
    startTransition(() => {
      if (val.trim()) {
        router.replace(`/search?q=${encodeURIComponent(val.trim())}`, { scroll: false });
      } else {
        router.replace('/search', { scroll: false });
      }
    });
  };

  const filteredProducts = initialProducts.filter((product) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      product.name?.toLowerCase().includes(q) ||
      product.category?.toLowerCase().includes(q) ||
      product.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8 min-h-[calc(100vh-16rem)] w-full flex-grow">
      {/* Search Header & Live Input */}
      <div className="mb-12 border-b border-zinc-200 pb-8">
        <h1 className="text-3xl font-playfair font-medium text-black tracking-tight mb-6">
          {query ? `Search results for "${query}"` : 'All Products'}
        </h1>

        <div className="relative max-w-xl">
          <input
            type="text"
            placeholder="Type to filter products instantly..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-300 focus:border-black focus:bg-white rounded-full py-3 pl-12 pr-10 text-sm outline-none transition-all placeholder:text-zinc-400 text-zinc-900 shadow-sm"
          />
          <div className="absolute left-4 top-3.5 text-zinc-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          {query && (
            <button
              onClick={() => handleQueryChange('')}
              className="absolute right-4 top-3.5 text-zinc-400 hover:text-black transition-colors"
              title="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>

        <p className="mt-4 text-xs uppercase tracking-widest font-bold text-zinc-400">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>
      </div>

      {/* Live Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {filteredProducts.map((product) => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg font-medium mb-6">
            We couldn&apos;t find any products matching &ldquo;{query}&rdquo;.
          </p>
          <button
            onClick={() => handleQueryChange('')}
            className="text-xs uppercase tracking-widest font-bold border-b-2 border-black pb-1 text-black hover:text-zinc-600 hover:border-zinc-600 transition-all"
          >
            Show All Products
          </button>
        </div>
      )}
    </div>
  );
}
