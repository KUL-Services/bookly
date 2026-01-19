'use client'

// React Imports
import { useEffect } from 'react'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import { MarketplaceHero } from '@/bookly/components/marketplace/marketplace-hero'
import { CategoryNav } from '@/bookly/components/marketplace/category-nav'
import { BusinessCard } from '@/bookly/components/marketplace/business-card'
import { useSettings } from '@core/hooks/useSettings'
import { MOCK_BUSINESSES } from '@/mocks/businesses'
import { Button } from '@/bookly/components/ui/button'
import Link from 'next/link'
import Footer from '@/components/layout/front-pages/Footer'

const LandingPageWrapper = ({ mode }: { mode: Mode }) => {
  // Hooks
  const { updatePageSettings } = useSettings()

  // For Page specific settings
  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Use recommended businesses
  const recommendedBusinesses = MOCK_BUSINESSES.slice(0, 4)

  return (
    <div className='bg-white min-h-screen'>
      {/* 1. Hero with Search (Responsive Desktop/Mobile) */}
      <MarketplaceHero />

      {/* 2. Categories (Sticky/Horizontal) */}
      <CategoryNav />

      {/* 3. Recommended Section */}
      <section className='py-12 md:py-16 max-w-7xl mx-auto px-4'>
        <div className='flex justify-between items-end mb-8'>
          <div>
            <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-2'>Recommended near you</h2>
            <p className='text-gray-500'>Top rated professionals in your area</p>
          </div>
          <Button variant='link' className='text-teal-600 font-semibold' asChild>
            <Link href='/en/search'>See all</Link>
          </Button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
          {recommendedBusinesses.map(business => (
            <BusinessCard
              key={business.id}
              id={business.id}
              name={business.name}
              rating={business.rating}
              reviewCount={120}
              address={business.address}
              image={business.coverImageUrl || business.imageUrl || ''}
              isPromoted={Math.random() > 0.7}
            />
          ))}
        </div>
      </section>

      {/* 4. Promotional Banner (Provider Acquisition) */}
      <section className='bg-gray-50 py-16 md:py-24 border-t border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 text-center'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>Grow your business with Bookly</h2>
          <p className='text-gray-500 mb-8 max-w-2xl mx-auto text-lg'>
            Join thousands of beauty and wellness professionals who use Bookly to manage their appointments and grow
            their client base.
          </p>
          <div className='flex gap-4 justify-center'>
            <Button size='lg' className='bg-gray-900 text-white hover:bg-gray-800'>
              List your Business
            </Button>
            <Button size='lg' variant='outline' className='border-gray-300 text-gray-700 hover:bg-white'>
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPageWrapper
