import { NextRequest, NextResponse } from 'next/server'
import mockData from '@/bookly/data/mock-booking-data.json'

// Mock coupon validation endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, serviceId } = body

    // Get coupon from mock data
    const coupon = mockData.coupons[code.toUpperCase() as keyof typeof mockData.coupons]

    if (coupon) {
      return NextResponse.json({
        valid: true,
        discountPercent: coupon.discountPercent,
        description: coupon.description
      })
    }

    return NextResponse.json({
      valid: false
    })
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
