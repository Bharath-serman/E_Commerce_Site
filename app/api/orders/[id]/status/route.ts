import { NextResponse } from 'next/server';
import { OrderService } from '@/lib/supabaseModels';
import { sql } from '@/lib/db';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // Validate status
    const validStatuses = ['pending', 'paid', 'completed', 'failed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') 
      }, { status: 400 });
    }

    // Direct SQL update for guaranteed reliability
    try {
      const result = await sql`
        UPDATE orders
        SET status = ${status}
        WHERE id = ${id}
        RETURNING *
      `;
      if (result && result.length > 0) {
        return NextResponse.json({ 
          success: true, 
          data: result[0],
          message: `Order status updated to ${status}`
        });
      }
    } catch (sqlErr) {
      console.warn('Direct SQL update failed, trying OrderService:', sqlErr);
    }

    // Update order status via Supabase client fallback
    const updatedOrder = await OrderService.update(id, { status });

    return NextResponse.json({ 
      success: true, 
      data: updatedOrder,
      message: `Order status updated to ${status}`
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const order = await OrderService.getById(id);
    
    if (!order) {
      return NextResponse.json({ 
        error: 'Order not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      data: order 
    });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
