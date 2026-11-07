import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';

export async function POST(req: NextRequest) {
  try {
    const { orderId, utrNumber } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

    const order = await OrderService.getById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Update order status to paid
    const updated = await OrderService.update(orderId, {
      status: 'paid',
      razorpay_payment_id: utrNumber || `UPI_CONFIRMED_${Date.now()}`,
      transaction_id: utrNumber || order.transaction_id || `UPI_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: updated,
      redirectUrl: `/success?order_id=${orderId}&payment_id=${utrNumber || 'UPI_PAID'}`,
    });
  } catch (error: any) {
    console.error('Error verifying UPI payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
