'use client'

import { H2 } from '@/bookly/components/atoms'
import { BusinessCard } from '@/bookly/components/molecules'
import { mockBusinesses } from '@/bookly/data/mock-data'
import { useRouter } from 'next/navigation'

export const FeaturesSection = () => {
  const router = useRouter()

  const handleBusinessClick = (id: string) => {
    router.push(`/business/${id}`)
  }

  return (
    <>
      {/* Featured Businesses Section */}
      <section className='py-8 sm:py-12 lg:py-16 container mx-auto'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <H2
            stringProps={{ plainText: 'Check out top businesses ' }}
            className='text-xl sm:text-2xl lg:text-3xl font-semibold text-left text-gray-900 dark:text-white'
          />
        </div>

        <div className='mx-auto mt-6 sm:mt-8 px-4 sm:px-6 flex gap-4 overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 lg:gap-8 md:overflow-visible'>
          {mockBusinesses.map(business => (
            <BusinessCard
              key={business.id}
              business={business}
              className='min-w-[260px] sm:min-w-[300px]'
              onClick={() => handleBusinessClick(business.id)}
            />
          ))}
        </div>
      </section>
    </>
  )
}
