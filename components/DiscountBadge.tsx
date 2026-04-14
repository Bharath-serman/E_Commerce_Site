'use client';

import { useEffect, useState } from 'react';

interface DiscountBadgeProps {
  productId: string;
  productName: string;
  price: number;
  category?: string;
  sale_id?: string;
}

export default function DiscountBadge({ productId, productName, price, category, sale_id }: DiscountBadgeProps) {
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
              if (sale.discount_type === 'site-wide') return true;
              if (sale.discount_type === 'category' && category) {
                return sale.applicable_categories.includes(category);
              }
              if (sale.discount_type === 'product-specific') {
                console.log('DiscountBadge product-specific sale check:', {
                  productId,
                  productSaleId: sale_id,
                  saleId: sale.id,
                  result: sale_id === sale.id
                });
                return sale_id === sale.id;
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
  }, [productId, productName, category, sale_id]);

  if (loading || !sale) {
    return null;
  }

  const calculateDiscountedPrice = () => {
    const discountAmount = price * (sale.discount_value / 100);
    return Math.max(0, price - discountAmount);
  };

  const discountedPrice = calculateDiscountedPrice();
  const savings = price - discountedPrice;

  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="bg-red-500 text-white px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg">
        {sale.discount_value}% OFF
      </div>
      <div className="mt-1 bg-green-600 text-white px-2 py-1 rounded-sm text-xs font-bold">
        Save ${savings.toFixed(2)}
      </div>
    </div>
  );
}
