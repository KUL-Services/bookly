'use client'
import { useState } from 'react'
import { Card } from '../../ui/card'
import Button from '../button/button.component'
import { Badge } from '../../atoms/base-badge/badge'
import { H3, H4, KulIcon, P } from '../../atoms'
import { mockBusinesses } from '@/bookly/data/mock-data'
import { useRouter } from 'next/navigation'

const mockData = mockBusinesses[0]

const upcomingBookings = [
  {
    id: 1,
    businessName: 'Luxe Hair Studio',
    service: 'Haircut & Style',
    provider: 'Emma Johnson',
    date: 'Saturday, January 25, 2025',
    time: '2:00 PM (60 minutes)',
    price: '£65',
    status: 'Confirmed',
    notes: 'Please trim split ends and add light layers',
    image: `${mockData.galleryImages[1]}`
  },
  {
    id: 2,
    businessName: 'Bliss Nail Bar',
    service: 'Gel Manicure',
    provider: 'Lisa Chen',
    date: 'Tuesday, January 28, 2025',
    time: '11:00 AM (45 minutes)',
    price: '£35',
    status: 'Confirmed',
    notes: '',
    image: `${mockData.galleryImages[2]}`
  }
]

const pastBookings = [
  {
    id: 3,
    businessName: 'Zen Spa & Wellness',
    service: 'Deep Tissue Massage',
    provider: 'Michael Brown',
    date: 'Friday, January 17, 2025',
    time: '3:00 PM (90 minutes)',
    price: '£85',
    status: 'Completed',
    notes: '',
    image: `${mockBusinesses[2].galleryImages[1]}`
  },
  {
    id: 4,
    businessName: 'Urban Fitness Studio',
    service: 'Personal Training',
    provider: 'Sarah Wilson',
    date: 'Wednesday, January 15, 2025',
    time: '7:00 AM (60 minutes)',
    price: '£50',
    status: 'Completed',
    notes: '',
    image: `${mockBusinesses[1].galleryImages[0]}`
  }
]

function BookingsTabs() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const currentBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings

  const router = useRouter()
  return (
    <Card className='p-6 border border-gray-300'>
      <H3 stringProps={{ plainText: 'Your Bookings' }} className='text-xl font-bold text-gray-900 mb-4' />

      {/* Tabs */}
      <div className='py-4 flex border-b border-gray-200 mb-6 '>
        <Button
          variant='text'
          onClick={() => setActiveTab('upcoming')}
          className={`w-full px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'upcoming'
              ? 'border-teal-500 text-teal-600 bg-gray-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          buttonText={{ plainText: `Upcoming (${upcomingBookings.length})` }}
        />

        <Button
          variant='text'
          onClick={() => setActiveTab('past')}
          className={`w-full px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'past'
              ? 'border-teal-500 text-teal-600 bg-gray-50'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          buttonText={{ plainText: `Past (${pastBookings.length})` }}
        />
      </div>

      {/* Booking Cards */}
      <div className='space-y-4'>
        {currentBookings.map(booking => (
          <Card key={booking.id} className='p-6 border border-gray-200'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0'>
                <img
                  src={booking.image || '/placeholder.svg'}
                  alt={booking.businessName}
                  className='w-full h-full object-cover'
                />
              </div>

              <div className='flex-1 space-y-3'>
                <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-2'>
                  <div>
                    <H4
                      stringProps={{ plainText: `${booking.businessName}` }}
                      className='font-semibold text-gray-900'
                    />
                    <P stringProps={{ plainText: `${booking.service}` }} className='text-gray-600' />
                    <P stringProps={{ plainText: `with ${booking.provider}` }} className='text-sm text-gray-500' />
                  </div>
                  <Badge variant='secondary' className='bg-green-100 text-green-800 w-fit  py-2'>
                    {booking.status}
                  </Badge>
                </div>

                <div className='flex flex-col gap-4 text-sm text-gray-600'>
                  <div className='flex items-center gap-1'>
                    <KulIcon icon={'lucide:calendar'} />
                    <span>{booking.date}</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <KulIcon icon={'lucide:clock'} />
                    <span>{booking.time}</span>
                  </div>
                  <div className='font-semibold text-gray-900 text-lg'>{booking.price}</div>
                </div>

                {booking.notes && (
                  <div className='text-sm'>
                    <span className='font-medium text-gray-700'>Notes:</span>{' '}
                    <span className='text-gray-600'>{booking.notes}</span>
                  </div>
                )}

                {activeTab === 'upcoming' && (
                  <div className='flex gap-2 pt-2'>
                    <Button
                      variant='text'
                      size='sm'
                      buttonText={{ plainText: 'View Business' }}
                      onClick={() => router.push(`/buisnees/${2}`)}
                      className='bg-white border border-gray-300 text-gray-800 hover:bg-gray-300'
                    />

                    <Button
                      variant='text'
                      size='sm'
                      buttonText={{ plainText: 'Cancel' }}
                      className='bg-white border border-gray-300 text-red-800 hover:bg-white hover:border-red-400 hover:shadow-lg'
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  )
}
export default BookingsTabs
