import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

    const order = await OrderService.getById(orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'paid') {
      await OrderService.update(orderId, {
        status: 'cancelled',
        error: 'User cancelled payment',
      });
    }

    return NextResponse.json({ success: true, message: 'Order marked as cancelled' });
  } catch (error: any) {
    console.error('Error cancelling UPI order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
