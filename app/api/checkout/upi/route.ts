import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { items, transactionId, discountCode } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    // Apply discounts (same logic as Stripe checkout)
    let discountAmount = 0;
    let discountResult: any = null;
    let appliedDiscounts: any[] = [];

    try {
      const { SupabaseSaleDiscountService } = await import('@/lib/supabaseSaleDiscountService');
      const saleDiscountResult = await SupabaseSaleDiscountService.calculateCartDiscount(items);

      const { DiscountService } = await import('@/lib/discountService');
      const regularDiscountResult = await DiscountService.calculateCartDiscount(items);

      const combinedDiscountedItems = items.map((item: any) => {
        const saleItem = saleDiscountResult.discountedItems.find((d: any) => d.id === item.id);
        const regularItem = regularDiscountResult.discountedItems.find((d: any) => d.id === item.id);

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
    } catch (error) {
      console.error('Error applying discounts:', error);
    }

    const totalAmount = discountResult
      ? discountResult.discountedItems.reduce((sum: number, item: any) => sum + (item.discountedPrice * item.quantity), 0)
      : items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order with UPI payment details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_name: 'UPI Customer',
        customer_email: 'upi@customer.com',
        stripe_session_id: transactionId, // Using transaction ID as session ID
        total_amount: totalAmount,
        status: 'pending',
        items: items,
        payment_method: 'upi',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      order
    });
  } catch (error: any) {
    console.error("UPI Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
