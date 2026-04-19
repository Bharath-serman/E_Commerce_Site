import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
