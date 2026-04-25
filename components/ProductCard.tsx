'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import DiscountBadge from './DiscountBadge';
import { DiscountService } from '@/lib/discountService';

interface ProductCardProps {
  product: {
    _id: string;
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
    sale_id?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

  useEffect(() => {
    console.log('ProductCard useEffect running for product:', product._id, product.name);
    const fetchDiscountedPrice = async () => {
      try {
        console.log('ProductCard starting discount fetch...');
        // Check both sales and discounts
        const [salesRes, discounts] = await Promise.all([
          fetch('/api/sale-discounts'),
          DiscountService.getActiveDiscounts()
        ]);

        console.log('ProductCard discounts data received:', discounts);
        console.log('ProductCard sales response:', salesRes);

        let bestPrice = product.price;
        let hasDiscount = false;

        // Check sales
        if (salesRes.ok) {
          const salesData = await salesRes.json();
          if (salesData.success) {
            const applicableSale = salesData.data.find((sale: any) => {
              if (sale.discount_type === 'site-wide') return true;
              if (sale.discount_type === 'category' && product.category) {
                return sale.applicable_categories.includes(product.category);
              }
              if (sale.discount_type === 'product-specific') {
                return sale.applicable_products?.includes(product._id) || product.sale_id === sale.id;
              }
              return false;
            });
            
            if (applicableSale) {
              const discountAmount = product.price * (applicableSale.discount_value / 100);
              bestPrice = Math.min(bestPrice, Math.max(0, product.price - discountAmount));
              hasDiscount = true;
            }
          }
        }

        // Check discounts
        if (discounts.length > 0) {
          console.log('ProductCard checking discounts:', {
            productId: product._id,
            productName: product.name,
            discountsCount: discounts.length,
            discounts: discounts.map(d => ({ 
              name: d.name, 
              type: d.type, 
              value: d.value,
              applicableProducts: d.applicable_products 
            }))
          });
          
          const applicableDiscount = discounts.find(discount => 
            DiscountService.getApplicableDiscount(discount, product._id, product.price)
          );
          
          console.log('ProductCard applicable discount found:', applicableDiscount);
          
          if (applicableDiscount) {
            const discountedPrice = DiscountService.calculateDiscountedPrice(product.price, applicableDiscount);
            console.log('ProductCard discounted price calculation:', {
              originalPrice: product.price,
              discountedPrice,
              bestPrice: bestPrice
            });
            bestPrice = Math.min(bestPrice, discountedPrice);
            hasDiscount = true;
          }
        }

        setDiscountedPrice(hasDiscount ? bestPrice : null);
      } catch (error) {
        console.error('Error fetching discounted price:', error);
      }
    };

    fetchDiscountedPrice();
  }, [product._id, product.name, product.category, product.price, product.sale_id]);

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
          sale_id={product.sale_id}
        />
      </div>
      <div className="mt-6 flex justify-between items-center text-zinc-900">
        <h3 className="text-sm uppercase tracking-wider font-semibold">{product.name}</h3>
        <div className="text-right">
          {discountedPrice !== null ? (
            <div>
              <p className="text-sm font-medium text-red-600">₹{discountedPrice.toFixed(2)}</p>
              <p className="text-xs text-zinc-400 line-through">₹{product.price.toFixed(2)}</p>
            </div>
          ) : (
            <p className="text-sm font-medium">₹{product.price.toFixed(2)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
