import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { OrderService } from '@/lib/supabaseModels';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { 
  apiVersion: '2023-10-16' 
});

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET not set, skipping webhook verification');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Received Stripe webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;

      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(failedPaymentIntent);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('Processing completed checkout session:', session.id);
    console.log('Session payment status:', session.payment_status);
    console.log('Session status:', session.status);

    // Find the order by Stripe session ID
    const order = await OrderService.getByStripeSessionId(session.id);
    
    if (!order) {
      console.warn('No order found for session:', session.id);
      return;
    }

    console.log('Found order:', order.id, 'current status:', order.status);

    // Update order status to completed if payment was successful
    if (session.payment_status === 'paid' || session.status === 'complete') {
      const updatedOrder = await OrderService.update(order.id, {
        status: 'completed'
      });

      console.log('Order status updated to completed:', updatedOrder.id);
    } else {
      console.log('Payment not completed, keeping status as pending');
    }

    // You could also send confirmation emails here
    // await sendOrderConfirmationEmail(order);

  } catch (error: any) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment succeeded:', paymentIntent.id);
    
    // Find order by payment intent ID (if you store it)
    // This would require updating the order schema to include payment_intent_id
    
  } catch (error: any) {
    console.error('Error handling payment intent succeeded:', error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('Payment failed:', paymentIntent.id);
    
    // Find order and update status to failed
    // This would require updating the order schema to include payment_intent_id
    
  } catch (error: any) {
    console.error('Error handling payment intent failed:', error);
    throw error;
  }
}
