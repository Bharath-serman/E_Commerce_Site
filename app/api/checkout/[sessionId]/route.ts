import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', { 
  apiVersion: '2023-10-16' 
});

export async function GET(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    const resolvedParams = await params;
    // We strictly use expand to ask Stripe to join the PaymentIntent and line_items to our Session
    const session = await stripe.checkout.sessions.retrieve(resolvedParams.sessionId, {
      expand: ['payment_intent', 'payment_intent.latest_charge', 'line_items']
    });

    // Traverse the expanded objects securely to pull the hosted receipt URL and line items
    let receiptUrl = null;
    const paymentIntent = session.payment_intent as any;
    const lineItems = session.line_items?.data || [];
    const total = session.amount_total;
    const currency = session.currency;
    
    if (paymentIntent && paymentIntent.latest_charge && typeof paymentIntent.latest_charge !== 'string') {
      receiptUrl = paymentIntent.latest_charge.receipt_url;
    }

    const customerName = session.customer_details?.name || 'Valued Customer';
    const customerEmail = session.customer_details?.email || 'No email provided';
    const transactionId = paymentIntent?.id || session.id;

    return NextResponse.json({ success: true, receiptUrl, lineItems, total, currency, customerName, customerEmail, transactionId });
  } catch (error: any) {
    console.error("Error retrieving Stripe session:", error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve secure session' }, { status: 500 });
  }
}
