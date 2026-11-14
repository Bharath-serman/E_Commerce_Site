'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import AuthButton from './AuthButton';

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const isCheckoutPage = pathname.startsWith('/checkout');
  const { totalItems } = useCart();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Load recent searches from localStorage only on mount
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    setSearchQuery('');

    // Pre-fetch products for instant live search
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      })
      .catch((err) => console.error('Failed to load products for search:', err));
  }, []);

  useEffect(() => {
    // Clear search query when not on search page
    if (pathname !== '/search') {
      setSearchQuery('');
    }
  }, [pathname]);

  useEffect(() => {
    // Save recent searches to localStorage whenever they change
    if (isMounted) {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }, [recentSearches, isMounted]);

  useEffect(() => {
    // Click outside handler to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Add to recent searches if not already present
      setRecentSearches(prev => {
        const filtered = prev.filter(s => s.toLowerCase() !== searchQuery.toLowerCase());
        return [searchQuery, ...filtered].slice(0, 10); // Keep only last 10 searches
      });
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowDropdown(false);
    }
  };

  const handleRemoveSearch = (e: React.MouseEvent, searchToRemove: string) => {
    e.stopPropagation();
    setRecentSearches(prev => prev.filter(s => s.toLowerCase() !== searchToRemove.toLowerCase()));
  };

  const handleSearchClick = (search: string) => {
    setSearchQuery(search);
    setShowDropdown(false);
    router.push(`/search?q=${encodeURIComponent(search)}`);
  };

  const handleProductSelect = (product: any) => {
    if (product.name) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((s) => s.toLowerCase() !== product.name.toLowerCase());
        return [product.name, ...filtered].slice(0, 10);
      });
    }
    setShowDropdown(false);
    router.push(`/product/${product.id || product._id}`);
  };

  const handleLogoClick = () => {
    setSearchQuery('');
  };

  // Live matching products based on current search typing
  const filteredProducts = searchQuery.trim()
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      })
    : [];

  return (
    <nav className="w-full bg-white/90 backdrop-blur-lg sticky top-0 z-50 border-b border-zinc-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" onClick={handleLogoClick} className="text-2xl font-bold tracking-widest uppercase text-black font-playfair flex-shrink-0">
          Bethy
        </Link>
        
        {/* Amazon-like Search Bar merged with Premium Look */}
        {!isCheckoutPage && (
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative" ref={searchContainerRef}>
          <form onSubmit={handleSearch} className="w-full relative group">
            <input 
              type="text" 
              placeholder="Search for premium essentials..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              className="w-full bg-zinc-100 hover:bg-zinc-200 border border-transparent focus:border-zinc-300 focus:bg-white rounded-full py-2.5 px-6 text-sm outline-none transition-all placeholder:text-zinc-500 text-zinc-900"
            />
            <button type="submit" className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-zinc-900 text-white hover:bg-black transition-colors flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </form>
          
          {/* Search Dropdown (Instant Live Products + Recent Searches) */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden z-50 max-h-[460px] flex flex-col">
              {searchQuery.trim().length > 0 ? (
                <>
                  <div className="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Matching Products</span>
                    <span>{filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}</span>
                  </div>
                  <div className="overflow-y-auto divide-y divide-zinc-100 max-h-[340px]">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.slice(0, 6).map((product) => (
                        <div
                          key={product.id || product._id}
                          onClick={() => handleProductSelect(product)}
                          className="flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50 cursor-pointer transition-colors group"
                        >
                          {product.image ? (
                            <div className="w-12 h-12 bg-zinc-100 rounded border border-zinc-200 overflow-hidden flex-shrink-0 relative">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center text-zinc-400 flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate group-hover:text-black">
                              {product.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] uppercase font-bold text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                                {product.category || 'General'}
                              </span>
                              <span className="text-xs font-bold text-zinc-900">
                                ₹{product.price ? product.price.toFixed(2) : '0.00'}
                              </span>
                            </div>
                          </div>
                          <div className="text-zinc-300 group-hover:text-zinc-900 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-8 text-center text-zinc-500">
                        <p className="text-sm font-medium">No products found matching &ldquo;{searchQuery}&rdquo;</p>
                        <p className="text-xs text-zinc-400 mt-1">Try searching for a different keyword or category</p>
                      </div>
                    )}
                  </div>
                  {filteredProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => handleSearch(e)}
                      className="w-full px-4 py-2.5 bg-zinc-50 hover:bg-zinc-100 border-t border-zinc-100 text-center text-xs font-bold uppercase tracking-wider text-black transition-colors"
                    >
                      View all {filteredProducts.length} results for &ldquo;{searchQuery}&rdquo; →
                    </button>
                  )}
                </>
              ) : recentSearches.length > 0 ? (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-50 border-b border-zinc-100 flex justify-between items-center">
                    <span>Recent Searches</span>
                    <button
                      type="button"
                      onClick={() => setRecentSearches([])}
                      className="text-[10px] text-zinc-400 hover:text-black uppercase font-bold tracking-wider"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="divide-y divide-zinc-50">
                    {recentSearches.slice(0, 5).map((search, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-zinc-100 cursor-pointer group"
                      >
                        <div 
                          className="flex items-center gap-3 flex-1"
                          onClick={() => handleSearchClick(search)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                          </svg>
                          <span className="text-sm text-zinc-700 group-hover:text-black">{search}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveSearch(e, search)}
                          className="p-1 rounded-full hover:bg-zinc-200 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
        )}

        {/* Global actions */}
        <div className="flex gap-6 items-center">
          {!isCheckoutPage && (
            <Link href="/search" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors block md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </Link>
          )}
          <Link href="/cart" className="text-sm font-medium text-zinc-600 hover:text-black transition-colors relative flex items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-black transition-colors"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {isMounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                {totalItems}
              </span>
            )}
          </Link>
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}
