import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('discounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const discountData = await req.json();
    
    const { data: discount, error } = await supabase
      .from('discounts')
      .insert({
        name: discountData.name,
        type: discountData.type,
        value: discountData.value,
        applicable_products: discountData.applicableProducts,
        min_order_value: discountData.minOrderValue,
        max_discount_amount: discountData.maxDiscountAmount,
        start_date: discountData.startDate,
        end_date: discountData.endDate,
        is_active: discountData.isActive,
        usage_limit: discountData.usageLimit
      })
      .select()
      .single();

    if (error) throw error;
    
    // Update products to reference this discount
    if (discountData.applicableProducts && discountData.applicableProducts.length > 0) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ discount_id: discount.id })
        .in('id', discountData.applicableProducts);

      if (updateError) throw updateError;
    }
    
    return NextResponse.json({ success: true, data: discount });
  } catch (error: any) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    
    // First, get the current discount to see which products were previously associated
    const { data: currentDiscount, error: fetchError } = await supabase
      .from('discounts')
      .select('applicable_products')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    
    // Update the discount
    const { data: discount, error } = await supabase
      .from('discounts')
      .update({
        name: updateData.name,
        type: updateData.type,
        value: updateData.value,
        applicable_products: updateData.applicableProducts,
        min_order_value: updateData.minOrderValue,
        max_discount_amount: updateData.maxDiscountAmount,
        start_date: updateData.startDate,
        end_date: updateData.endDate,
        is_active: updateData.isActive,
        usage_limit: updateData.usageLimit
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    if (!discount) {
      return NextResponse.json({ success: false, error: 'Discount not found' }, { status: 404 });
    }
    
    // Handle product relationships
    const oldProducts = currentDiscount?.applicable_products || [];
    const newProducts = updateData.applicableProducts || [];
    
    // Remove discount_id from products that are no longer selected
    const productsToRemove = oldProducts.filter((productId: string) => !newProducts.includes(productId));
    if (productsToRemove.length > 0) {
      await supabase
        .from('products')
        .update({ discount_id: null })
        .in('id', productsToRemove);
    }
    
    // Add discount_id to newly selected products
    const productsToAdd = newProducts.filter((productId: string) => !oldProducts.includes(productId));
    if (productsToAdd.length > 0) {
      await supabase
        .from('products')
        .update({ discount_id: id })
        .in('id', productsToAdd);
    }
    
    return NextResponse.json({ success: true, data: discount });
  } catch (error: any) {
    console.error('Error updating discount:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Discount ID required' }, { status: 400 });
    }
    
    // First, remove discount_id from all products that reference this discount
    await supabase
      .from('products')
      .update({ discount_id: null })
      .eq('discount_id', id);
    
    // Then delete the discount
    const { error } = await supabase
      .from('discounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: 'Discount deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting discount:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
