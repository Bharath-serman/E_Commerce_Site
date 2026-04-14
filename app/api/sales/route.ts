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
    
    // Update products to reference this sale for product-specific sales
    if (saleData.applicableProducts && saleData.applicableProducts.length > 0 && saleData.discountType === 'product-specific') {
      const { ProductService } = await import('@/lib/supabaseModels');
      console.log('Updating sale_id for products:', saleData.applicableProducts);
      
      for (const productId of saleData.applicableProducts) {
        await ProductService.update(productId, { sale_id: newSale.id });
      }
      console.log('Sale_id updated for products');
    }
    
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
    
    // First, get the current sale to see which products were previously associated
    const currentSale = await SaleService.getById(id);
    if (!currentSale) {
      return NextResponse.json({ success: false, error: 'Sale not found' }, { status: 404 });
    }
    
    // Convert frontend naming to database naming
    const dbUpdateData = {
      title: updateData.title,
      description: updateData.description,
      banner_text: updateData.bannerText,
      discount_type: updateData.discountType,
      discount_value: updateData.discountValue,
      start_date: new Date(updateData.startDate).toISOString(),
      end_date: new Date(updateData.endDate).toISOString(),
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
    
    // Handle product relationships for product-specific sales
    if (updateData.discountType === 'product-specific') {
      const { ProductService } = await import('@/lib/supabaseModels');
      
      const oldProducts = currentSale.applicable_products || [];
      const newProducts = updateData.applicableProducts || [];
      
      console.log('Managing sale product relationships:', { oldProducts, newProducts });
      
      // Remove sale_id from products that are no longer selected
      const productsToRemove = oldProducts.filter((productId: string) => !newProducts.includes(productId));
      if (productsToRemove.length > 0) {
        console.log('Removing sale_id from products:', productsToRemove);
        for (const productId of productsToRemove) {
          await ProductService.update(productId, { sale_id: undefined });
        }
      }
      
      // Add sale_id to newly selected products
      const productsToAdd = newProducts.filter((productId: string) => !oldProducts.includes(productId));
      if (productsToAdd.length > 0) {
        console.log('Adding sale_id to products:', productsToAdd);
        for (const productId of productsToAdd) {
          await ProductService.update(productId, { sale_id: id });
        }
      }
    } else {
      // If sale type is not product-specific, remove sale_id from all previously associated products
      if (currentSale.applicable_products && currentSale.applicable_products.length > 0) {
        const { ProductService } = await import('@/lib/supabaseModels');
        console.log('Removing sale_id from all products (sale type changed from product-specific)');
        for (const productId of currentSale.applicable_products) {
          await ProductService.update(productId, { sale_id: undefined });
        }
      }
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
    
    console.log('DELETE request received for sale ID:', id);
    
    if (!id) {
      console.log('No ID provided in request');
      return NextResponse.json({ success: false, error: 'Sale ID required' }, { status: 400 });
    }
    
    console.log('Attempting to delete sale:', id);
    
    // First, remove sale_id from all products that reference this sale
    const { ProductService } = await import('@/lib/supabaseModels');
    console.log('Removing sale_id from products...');
    await ProductService.updateBySaleId(id, { sale_id: null });
    console.log('Sale_id removed from products');
    
    // Now delete the sale
    await SaleService.delete(id);
    console.log('Sale deleted successfully:', id);
    
    return NextResponse.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error: any) {
    console.error('Delete sale error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error.details,
      code: error.code
    }, { status: 500 });
  }
}
