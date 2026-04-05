'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { totalItems } = useCart();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="w-full bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-zinc-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-widest uppercase text-black font-playfair flex-shrink-0">
          Aesthetic
        </Link>
        
        {/* Amazon-like Search Bar merged with Premium Look */}
        <div className="hidden md:flex flex-1 max-w-xl mx-8">
          <form onSubmit={handleSearch} className="w-full relative group">
            <input 
              type="text" 
              placeholder="Search for premium essentials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 hover:bg-zinc-200 border border-transparent focus:border-zinc-300 focus:bg-white rounded-full py-2.5 px-6 text-sm outline-none transition-all placeholder:text-zinc-500 text-zinc-900"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-zinc-900 text-white hover:bg-black transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>
        </div>

        {/* Global actions */}
        <div className="flex gap-6 items-center">
          <Link href="/search" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors block md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </Link>
          <Link href="/cart" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors relative flex items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-black transition-colors"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
