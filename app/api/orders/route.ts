import { NextResponse } from 'next/server';
import { connectMongo } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function POST(req: Request) {
  try {
    const { stripeSessionId, transactionId, customerName, customerEmail, items, totalAmount } = await req.json();
    
    await connectMongo();
    
    // Check if order already exists to prevent duplicates on page refresh
    const existingOrder = await Order.findOne({ stripeSessionId });
    if (existingOrder) {
      return NextResponse.json({ success: true, message: 'Order already recorded' });
    }
    
    const newOrder = await Order.create({
      stripeSessionId,
      transactionId,
      customerName,
      customerEmail,
      items,
      totalAmount
    });
    
    return NextResponse.json({ success: true, data: newOrder });
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function GET() {
  try {
    await connectMongo();
    // Return newest orders first
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
