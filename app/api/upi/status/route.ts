import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, paid: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const [order] = await sql`
      SELECT id, status, transaction_id, total_amount, updated_at
      FROM orders
      WHERE id = ${orderId}
      LIMIT 1
    `;

    if (!order) {
      return NextResponse.json(
        { success: false, paid: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const isPaid = order.status === 'paid';

    return NextResponse.json({
      success: true,
      paid: isPaid,
      status: order.status,
      orderId: order.id,
      transactionId: order.transaction_id,
      amount: order.total_amount,
    });
  } catch (error: any) {
    console.error('Error polling order status:', error);
    return NextResponse.json(
      { success: false, paid: false, error: error.message },
      { status: 500 }
    );
  }
}
