'use client'

import { BusinessCard } from '@/bookly/components/marketplace/business-card'
import { Button } from '@/bookly/components/molecules'
import { MOCK_BUSINESSES } from '@/mocks/businesses'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function RecommendedSection() {
  // Use a subset of mock businesses
  const businesses = MOCK_BUSINESSES.slice(0, 4)

  return (
    <section className='py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-[#0a2c24]/5'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-end mb-8 md:mb-12'>
          <div>
            <h2 className='text-3xl md:text-4xl font-bold text-[#0a2c24] dark:text-white mb-2'>Recommended for you</h2>
            <p className='text-gray-600 dark:text-gray-300 text-lg'>Top rated professionals in your area</p>
          </div>
          <Link href='/en/search' className='hidden sm:block'>
            <div className='inline-flex items-center text-[#0a2c24] font-semibold hover:text-[#0a2c24]/80 transition-colors'>
              <span className='mr-2'>View All</span>
              <ArrowRight className='w-4 h-4' />
            </div>
          </Link>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {businesses.map((business, index) => (
            <BusinessCard
              key={business.id}
              id={business.id}
              name={business.name}
              rating={business.rating}
              reviewCount={124}
              address={business.address}
              image={business.coverImageUrl || business.imageUrl || ''}
              isPromoted={index % 3 === 0}
            />
          ))}
        </div>

        <div className='mt-8 text-center sm:hidden'>
          <Link
            href='/en/search'
            className='block w-full bg-[#0a2c24] text-white font-semibold py-3 rounded-xl hover:bg-[#0a2c24]/90 transition-colors'
          >
            View All Businesses
          </Link>
        </div>
      </div>
    </section>
  )
}
