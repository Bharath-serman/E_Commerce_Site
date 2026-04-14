import { NextResponse } from 'next/server';
import { SupabaseSaleDiscountService } from '@/lib/supabaseSaleDiscountService';

export async function GET() {
  try {
    const categories = await SupabaseSaleDiscountService.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
