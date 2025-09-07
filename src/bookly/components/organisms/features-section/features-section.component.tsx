'use client'

import { BaseCard, H2 } from '@/bookly/components/atoms'
import { CategoryCard, BusinessCard } from '@/bookly/components/molecules'
import { categories, mockBusinesses } from '@/bookly/data/mock-data'
import { useRouter } from 'next/navigation'

export const FeaturesSection = () => {
  const router = useRouter()

  const handleBusinessClick = (id: string) => {
    router.push(`/business/${id}`)
  }

  return (
    <>
      {/* Featured Businesses Section */}
      <section className='py-16 container mx-auto'>
        <div className='max-w-6xl mx-auto px-6'>
          <H2
            stringProps={{ plainText: 'Check out top businesses ' }}
            className='text-2xl font-bold text-center text-gray-900 mb-12'
          />
        </div>

        <div className='mx-auto max-w-10/12 md:max-w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {mockBusinesses.map(business => (
            <BusinessCard
              key={business.id}
              business={business}
              className='bg-white rounded-2xl shadow-md overflow-hidden border-none'
              onClick={() => handleBusinessClick(business.id)}
            />
          ))}
        </div>
      </section>
    </>
  )
}
