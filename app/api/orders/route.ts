import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';

export async function POST(req: Request) {
  try {
    const { razorpayOrderId, transactionId, customerName, customerEmail, items, totalAmount } = await req.json();
    
    console.log('Creating order with data:', {
      razorpayOrderId,
      transactionId,
      customerName,
      customerEmail,
      totalAmount,
      itemsCount: items?.length
    });
    
    // Check if order already exists to prevent duplicates on page refresh
    if (razorpayOrderId) {
      const existingOrder = await OrderService.getByRazorpayOrderId(razorpayOrderId);
      if (existingOrder) {
        console.log('Order already exists for Razorpay order:', razorpayOrderId);
        return NextResponse.json({ success: true, message: 'Order already recorded' });
      }
    }
    
    const orderData = {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: transactionId,
      transaction_id: transactionId,
      customer_name: customerName,
      customer_email: customerEmail,
      items: items,
      total_amount: totalAmount,
      status: 'paid'
    };
    
    console.log('Order data to insert:', orderData);
    
    const newOrder = await OrderService.create(orderData);
    
    console.log('Order created successfully:', newOrder.id);
    return NextResponse.json({ success: true, data: newOrder });
  } catch (error: any) {
    console.error("Order creation error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code,
      details: error.details
    }, { status: 400 });
  }
}

export async function GET() {
  try {
    // Return newest orders first
    const orders = await OrderService.getAll();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
