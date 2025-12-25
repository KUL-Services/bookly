'use client'

import { useState } from 'react'
import { cn } from '@/bookly/lib/utils'
import { BaseCard } from '@/bookly/components/atoms/base-card/base-card.component'
import Button from '../button/button.component'
import BookingModalV2Fixed from '@/bookly/components/organisms/booking-modal/booking-modal-v2-fixed'

// Simplified Service type for display
interface ServiceData {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  location?: string
  business?: {
    id?: string
    name?: string
  }
}

interface ServiceCardWithBookingProps {
  service: ServiceData
  branchId?: string
  className?: string
}

export const ServiceCardWithBooking = ({ service, branchId, className }: ServiceCardWithBookingProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  // Convert service to the format expected by modal
  const modalService = {
    ...service,
    business: service.business || { name: service.location || 'Unknown Business' }
  }

  return (
    <>
      <div className={cn('hover:shadow-md transition-shadow', className)}>
        <BaseCard
          className='h-full flex flex-col'
          titleProps={{ plainText: service.name }}
          descriptionProps={{ plainText: service.description }}
          contentClassName='p-4 flex-1'
          footerClassName='p-4 border-t border-gray-200 dark:border-gray-700'
          footerContent={
            <div className='flex justify-between items-center w-full'>
              <div className='space-y-1'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-2xl font-bold text-gray-900 dark:text-white'>
                    £{(service.price / 100).toFixed(2)}
                  </span>
                </div>
                <div className='text-sm text-gray-500 dark:text-gray-400'>{service.duration}min</div>
              </div>
              <Button
                variant='contained'
                onClick={() => setIsBookingModalOpen(true)}
                className='bg-primary-700 hover:bg-primary-800 text-white px-6 py-2 rounded-xl'
                buttonText={{ plainText: 'Book' }}
              />
            </div>
          }
        />
      </div>

      <BookingModalV2Fixed
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialService={modalService as any}
        branchId={branchId}
      />
    </>
  )
}
