import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Discount from '@/models/Discount';

export async function POST(req: Request) {
  try {
    const discountData = await req.json();
    
    await connectMongo();
    
    const newDiscount = await Discount.create(discountData);
    
    return NextResponse.json({ success: true, data: newDiscount });
  } catch (error: any) {
    console.error("Discount creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectMongo();
    
    const discounts = await Discount.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: discounts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    
    await connectMongo();
    
    const discount = await Discount.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!discount) {
      return NextResponse.json({ success: false, error: 'Discount not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: discount });
  } catch (error: any) {
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
    
    await connectMongo();
    
    const discount = await Discount.findByIdAndDelete(id);
    
    if (!discount) {
      return NextResponse.json({ success: false, error: 'Discount not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Discount deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
