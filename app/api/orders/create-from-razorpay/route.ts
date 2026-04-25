import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { orderId, paymentId } = await req.json();

    if (!orderId || !paymentId) {
      return NextResponse.json({ success: false, error: 'Missing orderId or paymentId' }, { status: 400 });
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_SECRET_KEY || ''
    });

    // Fetch order details from Razorpay
    const orderDetails = await razorpay.orders.fetch(orderId);
    const notes = orderDetails.notes || {};
    const items = notes.items ? JSON.parse(notes.items as string) : [];

    // Fetch payment details to get customer info
    const paymentDetails = await razorpay.payments.fetch(paymentId);

    // Create order in database
    const order = await OrderService.create({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      transaction_id: paymentId,
      customer_name: paymentDetails.notes?.customer_name || paymentDetails.email?.split('@')[0] || 'Guest',
      customer_email: paymentDetails.email || paymentDetails.notes?.customer_email || '',
      items: items,
      total_amount: (orderDetails.amount as number) / 100, // Convert from paise
      currency: orderDetails.currency,
      status: 'paid',
      discount_applied: (notes.discountApplied as string) || 'none',
      discount_amount: parseFloat(String(notes.discountAmount || '0')),
      original_total: parseFloat(String(notes.originalTotal || '0')),
      discounted_total: parseFloat(String(notes.discountedTotal || '0'))
    });

    console.log('Order created from Razorpay:', orderId);

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error creating order from Razorpay:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
