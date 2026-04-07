import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Sale from '@/models/Sale';

export async function POST(req: Request) {
  try {
    const saleData = await req.json();
    
    await connectMongo();
    
    const newSale = await Sale.create(saleData);
    
    return NextResponse.json({ success: true, data: newSale });
  } catch (error: any) {
    console.error("Sale creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectMongo();
    
    const sales = await Sale.find({ isActive: true }).sort({ priority: -1, createdAt: -1 });
    
    return NextResponse.json({ success: true, data: sales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    
    await connectMongo();
    
    const sale = await Sale.findByIdAndUpdate(id, updateData, { new: true });
    
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
    
    await connectMongo();
    
    const sale = await Sale.findByIdAndDelete(id);
    
    if (!sale) {
      return NextResponse.json({ success: false, error: 'Sale not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Sale deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
