import { NextRequest, NextResponse } from 'next/server'
import mockData from '@/bookly/data/mock-booking-data.json'

// Mock addons endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const serviceId = searchParams.get('serviceId')

  // Return addons from mock data
  return NextResponse.json(mockData.addons)
}
