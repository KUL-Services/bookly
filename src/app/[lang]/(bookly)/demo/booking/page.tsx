'use client'

import { useEffect, useState } from 'react'
import { H1, H3 } from '@/bookly/components/atoms'
import { ServiceCardWithBooking } from '@/bookly/components/molecules/service-card/service-card-with-booking.component'
import { BusinessService } from '@/lib/api/services/business.service'
import { ServicesService } from '@/lib/api/services/services.service'
import type { Business, Service } from '@/lib/api/types'

export default function BookingDemoPage() {
  const [business, setBusiness] = useState<Business | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch first approved business
        const bizResult = await BusinessService.getApprovedBusinesses({ pageSize: 1 })
        const businesses = Array.isArray(bizResult.data)
          ? bizResult.data
          : (bizResult.data as any)?.data || []

        if (businesses.length > 0) {
          setBusiness(businesses[0])
        }

        // Fetch services
        const svcResult = await ServicesService.getServices()
        const svcList = Array.isArray(svcResult.data) ? svcResult.data : []
        setServices(svcList)
      } catch (err) {
        console.warn('Failed to load demo booking data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <p className='text-gray-500'>Loading...</p>
      </div>
    )
  }

  if (!business) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
        <p className='text-gray-500'>No businesses available for demo.</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 font-sans'>
      {/* Demo Banner */}
      <div className='bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-center'>
        <span className='text-sm text-amber-700 dark:text-amber-300 font-medium'>
          Demo Page — Showing live business data
        </span>
      </div>

      {/* Business Header */}
      <div className='bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-7xl mx-auto px-4 py-8'>
          <div className='flex items-center gap-6'>
            <div className='w-24 h-24 rounded-full bg-primary-700 flex items-center justify-center text-white text-3xl font-bold'>
              {business.name.charAt(0)}
            </div>
            <div className='flex-1'>
              <H1 stringProps={{ plainText: business.name }} className='text-3xl font-bold mb-2' />
              <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                {business.description && <span>{business.description}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <H3 stringProps={{ plainText: 'Services' }} className='text-2xl font-bold mb-6' />
        {services.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {services.map(service => (
              <ServiceCardWithBooking
                key={service.id}
                service={service}
                branchId={(service as any).branchIds?.[0] || (service as any).branchId}
                className='h-full'
              />
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>No services available.</p>
        )}
      </div>
    </div>
  )
}
