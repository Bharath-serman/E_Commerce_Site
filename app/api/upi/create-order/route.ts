import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';

export async function POST(req: NextRequest) {
  try {
    const { items, customerName, customerEmail, customerPhone, shippingAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items in order' }, { status: 400 });
    }

    if (!customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Customer name and email are required' },
        { status: 400 }
      );
    }

    // Apply sale & discount services
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
          selectedSize: item.selectedSize,
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
    } catch (discountErr) {
      console.warn('Could not compute custom discounts:', discountErr);
    }

    const totalAmount = discountResult
      ? discountResult.discountedItems.reduce(
          (sum: number, item: any) => sum + item.discountedPrice * item.quantity,
          0
        )
      : items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const formattedAmount = totalAmount.toFixed(2);
    // Generate unique transaction reference (e.g. BETHY782910)
    const txnId = `BETHY${Date.now().toString().slice(-6)}${Math.floor(100 + Math.random() * 900)}`;
    const orderRef = txnId;

    const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'bharathserman@oksbi';
    const upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'Bethy Store';

    // Standard NPCI UPI URI with encrypted unique Order and Txn reference
    const transactionNote = `Order_${orderRef}`;
    const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      upiName
    )}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${orderRef}`;

    // Create the order with pending status
    const newOrder = await OrderService.create({
      customer_name: customerName,
      customer_email: customerEmail,
      transaction_id: orderRef,
      total_amount: totalAmount,
      currency: 'INR',
      status: 'pending',
      items: items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        image: item.image,
      })),
      discount_applied: appliedDiscounts.length > 0 ? appliedDiscounts.map((d: any) => d.title).join(', ') : 'none',
      discount_amount: discountAmount,
      original_total: items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0),
      discounted_total: totalAmount,
    });

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      orderRef,
      upiUrl,
      upiId,
      upiName,
      amount: totalAmount,
    });
  } catch (error: any) {
    console.error('Error creating UPI order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create UPI order' },
      { status: 500 }
    );
  }
}
