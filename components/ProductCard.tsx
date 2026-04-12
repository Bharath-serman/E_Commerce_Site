'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import DiscountBadge from './DiscountBadge';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

  useEffect(() => {
    const fetchDiscountedPrice = async () => {
      try {
        const res = await fetch('/api/sale-discounts');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Find applicable sale for this product
            const applicableSale = data.data.find((sale: any) => {
              if (sale.discountType === 'site-wide') return true;
              if (sale.discountType === 'category' && product.category) {
                return sale.applicableCategories.includes(product.category);
              }
              if (sale.discountType === 'product-specific') {
                console.log('Product-specific sale check:', {
                  productId: product._id,
                  applicableProducts: sale.applicableProducts,
                  includes: sale.applicableProducts.includes(product._id)
                });
                return sale.applicableProducts.includes(product._id);
              }
              return false;
            });
            
            if (applicableSale) {
              const discountAmount = product.price * (applicableSale.discountValue / 100);
              const price = Math.max(0, product.price - discountAmount);
              setDiscountedPrice(price);
            } else {
              setDiscountedPrice(null);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching discounted price:', error);
      }
    };

    fetchDiscountedPrice();
  }, [product._id, product.name, product.category, product.price]);

  return (
    <Link href={`/product/${product._id}`} className="group block">
      <div className="relative w-full aspect-[4/5] bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200 shadow-sm transition-shadow hover:shadow-xl">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" 
        />
        <DiscountBadge 
          productId={product._id} 
          productName={product.name} 
          price={product.price} 
          category={product.category}
        />
      </div>
      <div className="mt-6 flex justify-between items-center text-zinc-900">
        <h3 className="text-sm uppercase tracking-wider font-semibold">{product.name}</h3>
        <div className="text-right">
          {discountedPrice !== null ? (
            <div>
              <p className="text-sm font-medium text-red-600">${discountedPrice.toFixed(2)}</p>
              <p className="text-xs text-zinc-400 line-through">${product.price.toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-sm font-medium">${product.price.toFixed(2)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
