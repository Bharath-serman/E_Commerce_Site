import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';

export async function POST(req: NextRequest) {
  try {
    const { receiptUrl } = await req.json();

    if (!receiptUrl) {
      return NextResponse.json({ error: 'Receipt URL is required' }, { status: 400 });
    }

    // Fetch the receipt from the external URL
    const response = await fetch(receiptUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch receipt');
    }

    const orderData = await response.json();

    // Create PDF
    const doc = new jsPDF();
    
    let y = 20;
    
    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEIPT', 105, y, { align: 'center' });
    y += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your purchase', 105, y, { align: 'center' });
    y += 20;
    
    // Add transaction ID
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Transaction ID: ${orderData.transactionId || 'N/A'}`, 20, y);
    y += 10;
    
    // Add items
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Summary', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (orderData.lineItems && Array.isArray(orderData.lineItems)) {
      orderData.lineItems.forEach((item: any) => {
        doc.text(`${item.description} x${item.quantity}`, 20, y);
        doc.text(`$${(item.amount_total / 100).toFixed(2)}`, 150, y);
        y += 8;
      });
    }
    
    // Add total
    y += 12;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Paid: $${((orderData.total || 0) / 100).toFixed(2)}`, 20, y);
    
    // Add payment info
    y += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${orderData.customerName || 'N/A'}`, 20, y);
    y += 8;
    doc.text(`Email: ${orderData.customerEmail || 'N/A'}`, 20, y);
    
    // Generate PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=receipt.pdf',
      },
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    return NextResponse.json({ error: 'Failed to generate receipt' }, { status: 500 });
  }
}
