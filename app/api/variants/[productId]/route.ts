import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const adminClient = getSupabaseAdmin();

    const { data, error } = await adminClient
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('size', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching variants:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
