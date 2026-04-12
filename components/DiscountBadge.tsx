'use client';

import { useEffect, useState } from 'react';

interface DiscountBadgeProps {
  productId: string;
  productName: string;
  price: number;
  category?: string;
}

export default function DiscountBadge({ productId, productName, price, category }: DiscountBadgeProps) {
  const [sale, setSale] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleDiscount = async () => {
      try {
        const res = await fetch('/api/sale-discounts');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // Find applicable sale for this product by checking all active sales
            const applicableSale = data.data.find((sale: any) => {
              if (sale.discountType === 'site-wide') return true;
              if (sale.discountType === 'category' && category) {
                return sale.applicableCategories.includes(category);
              }
              if (sale.discountType === 'product-specific') {
                return sale.applicableProducts.includes(productId);
              }
              return false;
            });
            setSale(applicableSale || null);
          }
        }
      } catch (error) {
        console.error('Error fetching sale discount:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleDiscount();
  }, [productId, productName, category]);

  if (loading || !sale) {
    return null;
  }

  const calculateDiscountedPrice = () => {
    const discountAmount = price * (sale.discountValue / 100);
    return Math.max(0, price - discountAmount);
  };

  const discountedPrice = calculateDiscountedPrice();
  const savings = price - discountedPrice;

  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="bg-red-500 text-white px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg">
        {sale.discountValue}% OFF
      </div>
      <div className="mt-1 bg-green-600 text-white px-2 py-1 rounded-sm text-xs font-bold">
        Save ${savings.toFixed(2)}
      </div>
    </div>
  );
}
