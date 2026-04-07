import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { 
  apiVersion: '2023-10-16' 
});

export async function POST(req: Request) {
  try {
    const { items, discountCode } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Apply discount if provided
    let discountAmount = 0;
    let appliedDiscount = null;
    
    if (discountCode) {
      try {
        const discountsRes = await fetch(`${baseUrl}/api/discounts`);
        const discountsData = await discountsRes.json();
        
        if (discountsData.success) {
          const discount = discountsData.data.find((d: any) => 
            d.isActive && 
            new Date() >= new Date(d.startDate) && 
            new Date() <= new Date(d.endDate) &&
            d.usageLimit && d.usedCount < d.usageLimit
          );
          
          if (discount) {
            const cartTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
            
            // Check if discount applies to all items or specific items
            const applicableItems = items.filter((item: any) => 
              discount.applicableProducts.length === 0 || 
              discount.applicableProducts.includes(item.name)
            );
            
            if (applicableItems.length > 0) {
              if (discount.minOrderValue && cartTotal < discount.minOrderValue) {
                return NextResponse.json({ error: `Minimum order value of $${discount.minOrderValue} required` }, { status: 400 });
              }
              
              appliedDiscount = discount;
              discountAmount = applicableItems.reduce((sum: number, item: any) => {
                const itemTotal = item.price * item.quantity;
                if (discount.type === 'percentage') {
                  return sum + (itemTotal * discount.value / 100);
                } else {
                  return sum + Math.min(discount.value, itemTotal);
                }
              }, 0);
            }
          }
        }
      } catch (error) {
        console.error('Error applying discount:', error);
      }
    }

    const line_items = items.map((item: any) => {
      let finalPrice = item.price;
      
      if (appliedDiscount) {
        const isApplicable = appliedDiscount.applicableProducts.length === 0 || 
                         appliedDiscount.applicableProducts.includes(item.name);
        
        if (isApplicable) {
          if (appliedDiscount.type === 'percentage') {
            finalPrice = item.price * (1 - appliedDiscount.value / 100);
          } else {
            finalPrice = Math.max(0, item.price - appliedDiscount.value);
          }
        }
      }
      
      return {
        price_data: {
          currency: 'usd',
          product_data: { 
            name: item.name,
            images: [item.image],
            description: appliedDiscount ? `Discount applied: ${appliedDiscount.name}` : undefined,
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
        discountApplied: appliedDiscount ? appliedDiscount.name : 'none',
        discountAmount: appliedDiscount ? discountAmount.toString() : '0',
        originalTotal: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0).toString(),
        discountedTotal: items.reduce((sum: number, item: any) => {
          const finalPrice = appliedDiscount ? 
            (appliedDiscount.applicableProducts.length === 0 || appliedDiscount.applicableProducts.includes(item.name)) ?
              (appliedDiscount.type === 'percentage' ? item.price * (1 - appliedDiscount.value / 100) : Math.max(0, item.price - appliedDiscount.value))
            : item.price
          : item.price;
          return sum + (finalPrice * item.quantity);
        }, 0).toString()
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
