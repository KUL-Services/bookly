import { NextRequest, NextResponse } from 'next/server'

// Mock payment endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, amount } = body

    // Mock payment processing
    const mockPayment = {
      success: true,
      transactionId: `txn-${Date.now()}`,
      bookingId,
      amount,
      timestamp: new Date().toISOString()
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    return NextResponse.json(mockPayment)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: 'Payment failed'
      },
      { status: 400 }
    )
  }
}
