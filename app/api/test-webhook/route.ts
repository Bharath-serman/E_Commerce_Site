import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    console.log('Testing webhook for session:', sessionId);

    // Find the order by Stripe session ID
    const order = await OrderService.getByStripeSessionId(sessionId);
    
    if (!order) {
      console.warn('No order found for session:', sessionId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log('Found order:', order.id, 'current status:', order.status);

    // Update order status to completed
    const updatedOrder = await OrderService.update(order.id, {
      status: 'completed'
    });

    console.log('Order status updated to completed:', updatedOrder.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Order status updated to completed',
      order: updatedOrder
    });
  } catch (error: any) {
    console.error('Error in test webhook:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
