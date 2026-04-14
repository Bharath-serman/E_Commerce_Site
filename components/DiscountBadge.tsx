'use client';

import { useEffect, useState } from 'react';
import { DiscountService } from '@/lib/discountService';

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
    const fetchDiscounts = async () => {
      try {
        // Check both sales and discounts
        const [salesRes, discounts] = await Promise.all([
          fetch('/api/sale-discounts'),
          DiscountService.getActiveDiscounts()
        ]);

        let bestDiscount: any = null;
        let bestSavings = 0;

        // Check sales
        if (salesRes.ok) {
          const salesData = await salesRes.json();
          if (salesData.success) {
            const applicableSale = salesData.data.find((sale: any) => {
              if (sale.discount_type === 'site-wide') return true;
              if (sale.discount_type === 'category' && category) {
                return sale.applicable_categories.includes(category);
              }
              if (sale.discount_type === 'product-specific') {
                return sale.applicable_products?.includes(productId) || sale_id === sale.id;
              }
              return false;
            });
            
            if (applicableSale) {
              const savings = price * (applicableSale.discount_value / 100);
              if (savings > bestSavings) {
                bestDiscount = { ...applicableSale, type: 'sale' };
                bestSavings = savings;
              }
            }
          }
        }

        // Check discounts
        if (discounts.length > 0) {
          const applicableDiscount = discounts.find(discount => 
            DiscountService.getApplicableDiscount(discount, productId, price)
          );
          
          if (applicableDiscount) {
            const discountedPrice = DiscountService.calculateDiscountedPrice(price, applicableDiscount);
            const savings = price - discountedPrice;
            if (savings > bestSavings) {
              bestDiscount = { ...applicableDiscount, type: 'discount' };
              bestSavings = savings;
            }
          }
        }

        setSale(bestDiscount);
      } catch (error) {
        console.error('Error fetching discounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscounts();
  }, [productId, productName, price, category, sale_id]);

  if (loading || !sale) {
    return null;
  }

  const calculateSavings = () => {
    if (sale.type === 'sale') {
      const discountAmount = price * (sale.discount_value / 100);
      return {
        percentage: `${sale.discount_value}%`,
        savings: discountAmount
      };
    } else {
      const discountedPrice = DiscountService.calculateDiscountedPrice(price, sale);
      const savings = price - discountedPrice;
      return {
        percentage: sale.type === 'percentage' ? `${sale.value}%` : `$${sale.value}`,
        savings: savings
      };
    }
  };

  const { percentage, savings } = calculateSavings();

  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="bg-red-500 text-white px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg">
        {percentage} OFF
      </div>
      <div className="mt-1 bg-green-600 text-white px-2 py-1 rounded-sm text-xs font-bold">
        Save ${savings.toFixed(2)}
      </div>
    </div>
  );
}
