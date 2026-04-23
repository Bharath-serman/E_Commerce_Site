import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await OrderService.getByRazorpayOrderId(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error fetching order by Razorpay order ID:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
