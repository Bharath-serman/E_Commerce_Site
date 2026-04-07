'use client';

import { useEffect, useState } from 'react';

interface DiscountBadgeProps {
  productName: string;
  price: number;
}

export default function DiscountBadge({ productName, price }: DiscountBadgeProps) {
  const [discount, setDiscount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await fetch('/api/discounts');
        const data = await res.json();
        
        if (data.success) {
          const applicableDiscount = data.data.find((d: any) => 
            d.isActive && 
            new Date() >= new Date(d.startDate) && 
            new Date() <= new Date(d.endDate) &&
            (d.applicableProducts.length === 0 || d.applicableProducts.includes(productName))
          );
          
          setDiscount(applicableDiscount);
        }
      } catch (error) {
        console.error('Error fetching discount:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscount();
  }, [productName]);

  if (loading || !discount) {
    return null;
  }

  const calculateDiscountedPrice = () => {
    if (discount.type === 'percentage') {
      return price * (1 - discount.value / 100);
    } else {
      return Math.max(0, price - discount.value);
    }
  };

  const discountedPrice = calculateDiscountedPrice();
  const savings = price - discountedPrice;

  return (
    <div className="absolute top-2 right-2 z-10">
      <div className="bg-red-500 text-white px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg">
        {discount.type === 'percentage' ? `${discount.value}% OFF` : `$${discount.value} OFF`}
      </div>
      <div className="mt-1 bg-green-600 text-white px-2 py-1 rounded-sm text-xs font-bold">
        Save ${savings.toFixed(2)}
      </div>
    </div>
  );
}
