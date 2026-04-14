import { NextResponse } from 'next/server';
import { SupabaseSaleDiscountService } from '@/lib/supabaseSaleDiscountService';

export async function GET() {
  try {
    const activeSales = await SupabaseSaleDiscountService.getActiveSales();
    return NextResponse.json({ success: true, data: activeSales });
  } catch (error: any) {
    console.error('Error fetching sale discounts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items array' }, { status: 400 });
    }

    const discountResult = await SupabaseSaleDiscountService.calculateCartDiscount(items);
    return NextResponse.json({ success: true, data: discountResult });
  } catch (error: any) {
    console.error('Error calculating cart discount:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
