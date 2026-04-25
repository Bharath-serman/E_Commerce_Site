import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY_ID',
  key_secret: process.env.RAZORPAY_SECRET_KEY || 'rzp_test_YOUR_SECRET_KEY'
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Apply both sale discounts and regular discounts automatically
    let discountAmount = 0;
    let discountResult: any = null;
    let appliedDiscounts: any[] = [];
    
    try {
      // Apply sale discounts
      const { SupabaseSaleDiscountService } = await import('@/lib/supabaseSaleDiscountService');
      const saleDiscountResult = await SupabaseSaleDiscountService.calculateCartDiscount(items);
      
      // Apply regular discounts
      const { DiscountService } = await import('@/lib/discountService');
      const regularDiscountResult = await DiscountService.calculateCartDiscount(items);
      
      console.log('Checkout - Sale discounts:', saleDiscountResult);
      console.log('Checkout - Regular discounts:', regularDiscountResult);
      
      // Combine results and find best discount for each item
      const combinedDiscountedItems = items.map((item: any) => {
        const saleItem = saleDiscountResult.discountedItems.find((d: any) => d.id === item.id);
        const regularItem = regularDiscountResult.discountedItems.find((d: any) => d.id === item.id);
        
        // Find the best price (lowest)
        let bestItem = item;
        let bestPrice = item.price;
        let bestDiscount = null;
        
        if (saleItem && saleItem.discountedPrice < bestPrice) {
          bestPrice = saleItem.discountedPrice;
          bestDiscount = saleItem.discount;
        }
        
        if (regularItem && regularItem.discountedPrice < bestPrice) {
          bestPrice = regularItem.discountedPrice;
          bestDiscount = regularItem.discount;
        }
        
        return {
          id: item.id,
          name: item.name,
          originalPrice: item.price,
          discountedPrice: bestPrice,
          quantity: item.quantity,
          discount: bestDiscount
        };
      });
      
      // Calculate total discount
      discountResult = {
        discountedItems: combinedDiscountedItems,
        totalDiscount: combinedDiscountedItems.reduce((total: number, item: any) => {
          return total + ((item.originalPrice - item.discountedPrice) * item.quantity);
        }, 0)
      };
      
      discountAmount = discountResult.totalDiscount;
      appliedDiscounts = discountResult.discountedItems
        .filter((item: any) => item.discount)
        .map((item: any) => item.discount);
        
      console.log('Checkout - Final combined discounts:', discountResult);
    } catch (error) {
      console.error('Error applying discounts:', error);
    }

    // Calculate total amount in paise (Razorpay uses paise for INR, or smallest currency unit)
    const totalAmount = discountResult ? discountResult.discountedItems.reduce((sum: number, item: any) => sum + (item.discountedPrice * item.quantity), 0) : items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const amountInPaise = Math.round(totalAmount * 100); // Convert to paise for INR

    // Create Razorpay order
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        discountApplied: appliedDiscounts.length > 0 ? appliedDiscounts.map((d: any) => d.title).join(', ') : 'none',
        discountAmount: discountAmount.toString(),
        originalTotal: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toString(),
        discountedTotal: totalAmount.toString(),
        items: JSON.stringify(items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedSize: item.selectedSize
        })))
      }
    };

    const order = await razorpay.orders.create(options);

    // Return order details to client
    return NextResponse.json({ 
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
  } catch (error: any) {
    console.error("Razorpay Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
