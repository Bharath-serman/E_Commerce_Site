import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { OrderService } from '@/lib/supabaseModels';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET not set, skipping webhook verification');
    }
    
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        console.error('Invalid Razorpay webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    }
    
    const event = JSON.parse(body);
    console.log('Received Razorpay webhook event:', event);
    
    // Handle payment.captured event (successful payment)
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100; // Convert from paise to currency units
      const currency = payment.currency;
      const status = payment.status;
      
      // Check if order already exists
      const existingOrder = await OrderService.getByRazorpayOrderId(orderId);
      
      if (existingOrder) {
        console.log('Order already exists for Razorpay order:', orderId);
        return NextResponse.json({ success: true });
      }
      
      // Get order details from Razorpay to retrieve notes (cart items)
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_SECRET_KEY || ''
      });
      
      const orderDetails = await razorpay.orders.fetch(orderId);
      const notes = orderDetails.notes;
      const items = notes.items ? JSON.parse(notes.items) : [];
      
      // Create order in database
      await OrderService.create({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        transaction_id: paymentId,
        customer_name: payment.notes?.customer_name || 'Guest',
        customer_email: payment.notes?.customer_email || '',
        items: items,
        total_amount: amount,
        currency: currency,
        status: status === 'captured' ? 'paid' : 'failed',
        discount_applied: notes.discountApplied || 'none',
        discount_amount: parseFloat(notes.discountAmount || '0'),
        original_total: parseFloat(notes.originalTotal || '0'),
        discounted_total: parseFloat(notes.discountedTotal || '0')
      });
      
      console.log('Order created successfully for Razorpay order:', orderId);
    }
    
    // Handle payment.failed event
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount / 100;
      const currency = payment.currency;
      const error = payment.error;
      
      // Create failed order record
      await OrderService.create({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        transaction_id: paymentId,
        customer_name: payment.notes?.customer_name || 'Guest',
        customer_email: payment.notes?.customer_email || '',
        items: payment.notes?.items ? JSON.parse(payment.notes.items) : [],
        total_amount: amount,
        currency: currency,
        status: 'failed',
        discount_applied: payment.notes?.discountApplied || 'none',
        discount_amount: parseFloat(payment.notes?.discountAmount || '0'),
        original_total: parseFloat(payment.notes?.originalTotal || '0'),
        discounted_total: parseFloat(payment.notes?.discountedTotal || '0'),
        error: error?.description || 'Payment failed'
      });
      
      console.log('Failed order recorded for Razorpay order:', orderId);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
