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

    const line_items = items.map((item: any) => {
      // Find the discounted price for this item
      const discountedItem = discountResult?.discountedItems.find((d: any) => d.id === item.id);
      const finalPrice = discountedItem ? discountedItem.discountedPrice : item.price;
      const itemDiscount = discountedItem?.discount;
      
      console.log('Checkout - Processing item:', {
        name: item.name,
        id: item.id,
        discountedItem,
        itemDiscount,
        finalPrice
      });
      
      return {
        price_data: {
          currency: 'usd',
          product_data: { 
            name: item.name,
            images: [item.image],
            description: itemDiscount ? 
              (itemDiscount.discount_type ? 
                `Sale discount applied: ${itemDiscount.discount_value}% OFF` :
                `Discount applied: ${itemDiscount.type === 'percentage' ? itemDiscount.value + '%' : '$' + itemDiscount.value}`) 
              : undefined,
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
