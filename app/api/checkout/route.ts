import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { 
  apiVersion: '2023-10-16' 
});

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Apply sale discounts automatically
    let discountAmount = 0;
    let discountResult: any = null;
    let appliedDiscounts: any[] = [];
    
    try {
      const { SaleDiscountService } = await import('@/lib/saleDiscountService');
      discountResult = await SaleDiscountService.calculateCartDiscount(items);
      discountAmount = discountResult.totalDiscount;
      appliedDiscounts = discountResult.discountedItems
        .filter((item: any) => item.discount)
        .map((item: any) => item.discount);
    } catch (error) {
      console.error('Error applying sale discounts:', error);
    }

    const line_items = items.map((item: any) => {
      // Find the discounted price for this item
      const discountedItem = discountResult?.discountedItems.find((d: any) => d.id === item.id);
      const finalPrice = discountedItem ? discountedItem.discountedPrice : item.price;
      const itemDiscount = discountedItem?.discount;
      
      return {
        price_data: {
          currency: 'usd',
          product_data: { 
            name: item.name,
            images: [item.image],
            description: itemDiscount ? `Sale discount applied: ${itemDiscount.discountValue}% OFF` : undefined,
          },
          unit_amount: Math.round(finalPrice * 100), // Stripe expects cents
        },
        quantity: item.quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      metadata: {
        discountApplied: appliedDiscounts.length > 0 ? appliedDiscounts.map((d: any) => d.title).join(', ') : 'none',
        discountAmount: discountAmount.toString(),
        originalTotal: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toString(),
        discountedTotal: discountResult ? discountResult.discountedItems.reduce((sum: number, item: any) => sum + (item.discountedPrice * item.quantity), 0).toString() : items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toString()
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
