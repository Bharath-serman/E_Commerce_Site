import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/supabaseModels';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete product using Supabase
    await ProductService.delete(id);

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { variants, ...productData } = body;

    // Update product using Supabase
    const updatedProduct = await ProductService.update(id, productData);

    // If clothing, update variants server-side using admin client
    if (productData.product_type === 'clothing' && variants && Array.isArray(variants)) {
      const adminClient = getSupabaseAdmin();
      
      // Delete existing variants for this product
      await adminClient
        .from('product_variants')
        .delete()
        .eq('product_id', id);
      
      // Insert new variants
      for (const variant of variants) {
        const { error } = await adminClient
          .from('product_variants')
          .insert({
            product_id: id,
            size: variant.size,
            stock: variant.stock,
            in_stock: variant.in_stock
          });
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
