import { NextResponse } from 'next/server';
import { ProductService, ProductVariantService } from '@/lib/supabaseModels';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variants, ...productData } = body;

    // Create new product using Supabase
    const product = await ProductService.create(productData);

    // If clothing, create variants server-side using admin client
    if (productData.product_type === 'clothing' && variants && Array.isArray(variants)) {
      const adminClient = getSupabaseAdmin();
      for (const variant of variants) {
        const { error } = await adminClient
          .from('product_variants')
          .insert({
            product_id: product.id,
            size: variant.size,
            stock: variant.stock,
            in_stock: variant.in_stock
          });
        if (error) throw error;
      }
    }

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const products = await ProductService.getAll();
    
    // Return full product data for admin interface
    const formattedProducts = products.map(product => ({
      _id: product.id,
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      details: product.details,
      category: product.category || 'uncategorized'
    }));
    
    return NextResponse.json({ success: true, data: formattedProducts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
