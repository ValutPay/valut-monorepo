import { NextResponse } from 'next/server';

// Artificial delay to simulate network latency (5 seconds)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { amount, paymentMethod, recipientId, recipientName, description } = body;
    
    // Validate required parameters
    if (!amount || !recipientId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Simulate delay for realistic transaction experience (5 seconds as requested)
    await delay(5000);
    
    // Always return the same transaction ID as requested
    return NextResponse.json({
      success: true,
      data: {
        transactionId: 'LYPDL5M7K4V3GP1',
        amount,
        recipientId,
        recipientName: recipientName || recipientId,
        description: description || '',
        timestamp: new Date().toISOString(),
        status: 'completed',
        paymentMethod: paymentMethod || 'UPI'
      }
    });
  } catch (error) {
    console.error('Transaction API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process transaction' },
      { status: 500 }
    );
  }
}