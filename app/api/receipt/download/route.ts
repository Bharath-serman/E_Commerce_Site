import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { receiptUrl } = await req.json();

    if (!receiptUrl) {
      return NextResponse.json({ error: 'Receipt URL is required' }, { status: 400 });
    }

    console.log('Fetching receipt from Stripe:', receiptUrl);

    // Fetch the receipt from Stripe
    const response = await fetch(receiptUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch receipt from Stripe: ${response.status} ${response.statusText}`);
    }

    // Check if we got PDF content
    const contentType = response.headers.get('content-type');
    console.log('Stripe response content type:', contentType);
    
    // Get the PDF content as buffer
    const pdfBuffer = await response.arrayBuffer();
    console.log('PDF buffer size:', pdfBuffer.byteLength);
    
    // Return the PDF as a downloadable file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="receipt.pdf"',
        'Content-Length': pdfBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    console.error('Error downloading receipt:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
