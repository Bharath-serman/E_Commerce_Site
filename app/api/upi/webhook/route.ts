import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const text = await req.text();
      body = { rawText: text };
    }

    console.log('Received UPI Webhook/Notification:', body);

    const { orderId, txnId, orderRef, amount, utr, rawText } = body;

    let targetOrderId = orderId;

    // 1. If explicit orderId provided
    if (targetOrderId) {
      const updated = await sql`
        UPDATE orders
        SET status = 'paid',
            transaction_id = COALESCE(${utr || txnId}, transaction_id),
            updated_at = NOW()
        WHERE id = ${targetOrderId}
        RETURNING id, status, transaction_id
      `;

      if (updated.length > 0) {
        console.log(`✅ Order ${targetOrderId} marked as PAID via webhook`);
        return NextResponse.json({
          success: true,
          message: 'Order updated to paid',
          order: updated[0],
        });
      }
    }

    // 2. If txnId or orderRef provided (e.g. BETHY839201)
    const refToMatch = txnId || orderRef;
    if (refToMatch) {
      const updated = await sql`
        UPDATE orders
        SET status = 'paid',
            transaction_id = COALESCE(${utr}, transaction_id, ${refToMatch}),
            updated_at = NOW()
        WHERE transaction_id = ${refToMatch}
        RETURNING id, status, transaction_id
      `;

      if (updated.length > 0) {
        console.log(`✅ Order matched by reference ${refToMatch} marked as PAID`);
        return NextResponse.json({
          success: true,
          message: 'Order updated to paid via ref',
          order: updated[0],
        });
      }
    }

    // 3. If rawText provided (SMS from Bank like SBI, HDFC, ICICI, etc.)
    if (rawText) {
      // Look for BETHY reference in the SMS text
      const refMatch = rawText.match(/BETHY[A-Za-z0-9_-]+/i);
      if (refMatch) {
        const foundRef = refMatch[0];
        const updated = await sql`
          UPDATE orders
          SET status = 'paid',
              updated_at = NOW()
          WHERE transaction_id ILIKE ${'%' + foundRef + '%'}
          RETURNING id, status, transaction_id
        `;

        if (updated.length > 0) {
          console.log(`✅ Order matched from bank SMS text: ${foundRef}`);
          return NextResponse.json({
            success: true,
            message: 'Order updated from bank SMS',
            order: updated[0],
          });
        }
      }

      // Fallback: look for amount in SMS and match the most recent pending order with that exact amount
      const amountMatch = rawText.match(/(?:rs\.?|inr)\s*([\d,]+(?:\.\d{1,2})?)/i);
      if (amountMatch) {
        const parsedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
        if (parsedAmount > 0) {
          const updated = await sql`
            UPDATE orders
            SET status = 'paid',
                updated_at = NOW()
            WHERE id IN (
              SELECT id FROM orders
              WHERE status = 'pending' AND ABS(total_amount - ${parsedAmount}) < 0.01
              ORDER BY created_at DESC
              LIMIT 1
            )
            RETURNING id, status, transaction_id
          `;

          if (updated.length > 0) {
            console.log(`✅ Order matched by SMS amount ₹${parsedAmount}`);
            return NextResponse.json({
              success: true,
              message: 'Order updated by amount match',
              order: updated[0],
            });
          }
        }
      }
    }

    // If nothing matched
    return NextResponse.json(
      { success: false, error: 'Could not match order with provided notification data' },
      { status: 404 }
    );
  } catch (error: any) {
    console.error('Error processing UPI webhook:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
