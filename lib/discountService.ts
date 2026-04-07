interface Discount {
  _id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  applicableProducts: string[];
  minOrderValue?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

export class DiscountService {
  static getActiveDiscounts(): Promise<Discount[]> {
    return fetch('/api/discounts')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          return data.data.filter((discount: Discount) => 
            discount.isActive && 
            new Date() >= new Date(discount.startDate) && 
            new Date() <= new Date(discount.endDate)
          );
        }
        return [];
      })
      .catch(error => {
        console.error('Error fetching discounts:', error);
        return [];
      });
  }

  static getApplicableDiscount(discount: Discount, productName: string, cartTotal: number): Discount | null {
    // Check if discount applies to this product
    if (discount.applicableProducts.length > 0 && !discount.applicableProducts.includes(productName)) {
      return null;
    }

    // Check minimum order value
    if (discount.minOrderValue && cartTotal < discount.minOrderValue) {
      return null;
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
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

  static async calculateCartDiscount(cartItems: Array<{name: string, price: number, quantity: number}>): Promise<{
    totalDiscount: number;
    discountedItems: Array<{
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

    for (const item of cartItems) {
      const itemTotal = item.price * item.quantity;
      let bestDiscount: Discount | null = null;
      let bestDiscountedPrice = item.price;

      // Find the best discount for this item
      for (const discount of activeDiscounts) {
        const applicableDiscount = this.getApplicableDiscount(discount, item.name, itemTotal);
        if (applicableDiscount) {
          const discountedPrice = this.calculateDiscountedPrice(item.price, applicableDiscount);
          if (bestDiscount === null || discountedPrice < bestDiscountedPrice) {
            bestDiscount = applicableDiscount;
            bestDiscountedPrice = discountedPrice;
          }
        }
      }

      if (bestDiscount) {
        const itemDiscount = (item.price - bestDiscountedPrice) * item.quantity;
        totalDiscount += itemDiscount;
      }

      discountedItems.push({
        name: item.name,
        originalPrice: item.price,
        discountedPrice: bestDiscountedPrice,
        quantity: item.quantity,
        discount: bestDiscount
      });
    }

    return { totalDiscount, discountedItems };
  }
}
