import { NextRequest, NextResponse } from 'next/server'

// Mock bookings endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Mock booking creation
    const mockBooking = {
      id: `booking-${Date.now()}`,
      ...body,
      totalCents: body.totalCents || 700, // Default price
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return NextResponse.json(mockBooking)
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to create booking'
      },
      { status: 400 }
    )
  }
}
