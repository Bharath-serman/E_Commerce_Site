import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Connect to database
    await connectMongo();
    
    // Create new product
    const product = await Product.create(body);
    
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectMongo();
    const products = await Product.find({});
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
