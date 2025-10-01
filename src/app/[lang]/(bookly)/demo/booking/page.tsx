'use client'

import { H1, H3 } from '@/bookly/components/atoms'
import { ServiceCardWithBooking } from '@/bookly/components/molecules/service-card/service-card-with-booking.component'
import mockBookingData from '@/bookly/data/mock-booking-data.json'

export default function BookingDemoPage() {
  const services = mockBookingData.services
  const business = mockBookingData.businesses[0]

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900'>
      {/* Business Header */}
      <div className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='flex items-center gap-6'>
            <div className='w-24 h-24 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold'>
              {business.name.charAt(0)}
            </div>
            <div className='flex-1'>
              <H1 stringProps={{ plainText: business.name }} className='text-3xl font-bold mb-2' />
              <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                <span>⭐ {business.rating}</span>
                <span>•</span>
                <span>{business.totalRatings} reviews</span>
                <span>•</span>
                <span>{business.address}</span>
              </div>
              <p className='mt-2 text-gray-600 dark:text-gray-300'>{business.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <H3 stringProps={{ plainText: 'Popular Services' }} className='text-2xl font-bold mb-6' />
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {services.map(service => (
            <ServiceCardWithBooking
              key={service.id}
              service={service}
              branchId={service.branchIds?.[0]}
              className='h-full'
            />
          ))}
        </div>
      </div>

      {/* Coupon Codes Info */}
      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-6'>
          <H3 stringProps={{ plainText: 'Test Coupon Codes' }} className='text-xl font-bold mb-4' />
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {Object.values(mockBookingData.coupons).map(coupon => (
              <div key={coupon.code} className='bg-white dark:bg-gray-800 rounded-lg p-3 text-center'>
                <div className='font-mono font-bold text-teal-600 dark:text-teal-400'>{coupon.code}</div>
                <div className='text-sm text-gray-600 dark:text-gray-400 mt-1'>{coupon.discountPercent}% off</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
