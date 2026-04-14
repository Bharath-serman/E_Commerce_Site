import { NextResponse } from 'next/server';
import { SaleService } from '@/lib/supabaseModels';

export async function POST(req: Request) {
  try {
    const saleData = await req.json();
    
    // Convert frontend naming to database naming
    const dbSaleData = {
      title: saleData.title,
      description: saleData.description,
      banner_text: saleData.bannerText,
      discount_type: saleData.discountType,
      discount_value: saleData.discountValue,
      start_date: saleData.startDate,
      end_date: saleData.endDate,
      is_active: saleData.isActive,
      banner_image: saleData.bannerImage,
      background_color: saleData.backgroundColor,
      text_color: saleData.textColor,
      show_countdown: saleData.showCountdown,
      priority: saleData.priority,
      applicable_categories: saleData.applicableCategories,
      applicable_products: saleData.applicableProducts
    };
    
    const newSale = await SaleService.create(dbSaleData);
    
    return NextResponse.json({ success: true, data: newSale });
  } catch (error: any) {
    console.error("Sale creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const sales = await SaleService.getActive();
    
    return NextResponse.json({ success: true, data: sales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    
    // Convert frontend naming to database naming
    const dbUpdateData = {
      title: updateData.title,
      description: updateData.description,
      banner_text: updateData.bannerText,
      discount_type: updateData.discountType,
      discount_value: updateData.discountValue,
      start_date: updateData.startDate,
      end_date: updateData.endDate,
      is_active: updateData.isActive,
      banner_image: updateData.bannerImage,
      background_color: updateData.backgroundColor,
      text_color: updateData.textColor,
      show_countdown: updateData.showCountdown,
      priority: updateData.priority,
      applicable_categories: updateData.applicableCategories,
      applicable_products: updateData.applicableProducts
    };
    
    const sale = await SaleService.update(id, dbUpdateData);
    
    if (!sale) {
      return NextResponse.json({ success: false, error: 'Sale not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: sale });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Sale ID required' }, { status: 400 });
    }
    
    await SaleService.delete(id);
    
    return NextResponse.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
