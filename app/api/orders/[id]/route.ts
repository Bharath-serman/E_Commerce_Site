import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required' }, { status: 400 });
    }

    const order = await OrderService.getById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error fetching order by ID:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
