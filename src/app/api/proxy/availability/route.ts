import { NextRequest, NextResponse } from 'next/server'
import mockData from '@/bookly/data/mock-booking-data.json'

// Mock availability endpoint
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const providerId = searchParams.get('providerId')
  const serviceId = searchParams.get('serviceId')
  const date = searchParams.get('date')

  // Get slots for the requested date from mock data
  let slots = mockData.timeSlots[date as keyof typeof mockData.timeSlots] || []

  // Filter by provider if specified and not "no-preference"
  if (providerId && providerId !== 'no-preference' && providerId !== 'any') {
    slots = slots.filter((slot: any) => slot.providerId === providerId)
  }

  // If no specific provider, return all unique time slots
  if (!providerId || providerId === 'no-preference' || providerId === 'any') {
    const uniqueSlots = slots.reduce((acc: any[], slot: any) => {
      const existing = acc.find(s => s.time === slot.time)
      if (!existing || (!existing.available && slot.available)) {
        return [...acc.filter(s => s.time !== slot.time), { time: slot.time, available: slot.available }]
      }
      return acc
    }, [])
    slots = uniqueSlots
  }

  return NextResponse.json({ slots })
}
