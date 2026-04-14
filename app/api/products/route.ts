import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/supabaseModels';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Create new product using Supabase
    const product = await ProductService.create(body);
    
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
