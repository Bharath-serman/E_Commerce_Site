interface Discount {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicable_products?: string[];
  min_order_value?: number;
  max_discount_amount?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit?: number;
  created_at: string;
}

export class DiscountService {
  static getActiveDiscounts(): Promise<Discount[]> {
    const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
    return fetch(`${baseUrl}/api/discounts`)
      .then(res => res.json())
      .then(data => {
        console.log('DiscountService raw discount data:', data);
        if (data.success) {
          const activeDiscounts = data.data.filter((discount: Discount) => {
            const now = new Date();
            const startDate = new Date(discount.start_date);
            const endDate = new Date(discount.end_date);
            
            // Convert to UTC for consistent comparison
            const nowUTC = new Date(now.toISOString());
            const startDateUTC = new Date(startDate.toISOString());
            const endDateUTC = new Date(endDate.toISOString());
            
            const isActive = discount.is_active && 
              nowUTC >= startDateUTC && 
              nowUTC <= endDateUTC;
              
            console.log('DiscountService checking discount:', {
              name: discount.name,
              isActive: discount.is_active,
              startDate: discount.start_date,
              endDate: discount.end_date,
              currentDate: now.toISOString(),
              startDateUTC: startDateUTC.toISOString(),
              endDateUTC: endDateUTC.toISOString(),
              nowUTC: nowUTC.toISOString(),
              meetsDateCriteria: nowUTC >= startDateUTC && nowUTC <= endDateUTC,
              finalActive: isActive,
              applicableProducts: discount.applicable_products
            });
            return isActive;
          });
          console.log('DiscountService active discounts:', activeDiscounts);
          return activeDiscounts;
        }
        return [];
      })
      .catch(error => {
        console.error('Error fetching discounts:', error);
        return [];
      });
  }

  static getApplicableDiscount(discount: Discount, productId: string, cartTotal: number): Discount | null {
    // Check if discount applies to this product
    if (discount.applicable_products && discount.applicable_products.length > 0 && !discount.applicable_products.includes(productId)) {
      return null;
    }

    // Check minimum order value
    if (discount.min_order_value && cartTotal < discount.min_order_value) {
      return null;
    }

    // Check usage limit
    // Usage tracking would need to be implemented in database
    // For now, we'll skip usage limit check
    if (false && discount.usage_limit) {
      return null;
    }

    return discount;
  }

  static calculateDiscountedPrice(originalPrice: number, discount: Discount): number {
    if (discount.type === 'percentage') {
      const discountedAmount = originalPrice * (discount.value / 100);
      return originalPrice - discountedAmount;
    } else {
      return Math.max(0, originalPrice - discount.value);
    }
  }

  static async calculateCartDiscount(cartItems: Array<{id: string, name: string, price: number, quantity: number}>): Promise<{
    totalDiscount: number;
    discountedItems: Array<{
      id: string;
      name: string;
      originalPrice: number;
      discountedPrice: number;
      quantity: number;
      discount: Discount | null;
    }>;
  }> {
    const activeDiscounts = await this.getActiveDiscounts();
    let totalDiscount = 0;
    const discountedItems = [];

    console.log('DiscountService.calculateCartDiscount - activeDiscounts:', activeDiscounts);
    console.log('DiscountService.calculateCartDiscount - cartItems:', cartItems);

    for (const item of cartItems) {
      const itemTotal = item.price * item.quantity;
      let bestDiscount: Discount | null = null;
      let bestDiscountedPrice = item.price;

      // Find the best discount for this item
      for (const discount of activeDiscounts) {
        console.log('DiscountService.calculateCartDiscount - checking discount:', discount.name, 'for item:', item.id);
        const applicableDiscount = this.getApplicableDiscount(discount, item.id, itemTotal);
        console.log('DiscountService.calculateCartDiscount - applicableDiscount:', applicableDiscount);
        if (applicableDiscount) {
          const discountedPrice = this.calculateDiscountedPrice(item.price, applicableDiscount);
          if (bestDiscount === null || discountedPrice < bestDiscountedPrice) {
            bestDiscount = applicableDiscount;
            bestDiscountedPrice = discountedPrice;
          }
        }
      }

      console.log('DiscountService.calculateCartDiscount - best discount for', item.name, ':', bestDiscount);

      if (bestDiscount) {
        const itemDiscount = (item.price - bestDiscountedPrice) * item.quantity;
        totalDiscount += itemDiscount;
      }

      discountedItems.push({
        id: item.id,
        name: item.name,
        originalPrice: item.price,
        discountedPrice: bestDiscountedPrice,
        quantity: item.quantity,
        discount: bestDiscount
      });
    }

    console.log('DiscountService.calculateCartDiscount - final result:', { totalDiscount, discountedItems });
    return { totalDiscount, discountedItems };
  }
}
