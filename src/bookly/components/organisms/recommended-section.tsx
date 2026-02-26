'use client'

import { BusinessCard } from '@/bookly/components/marketplace/business-card'
import { MOCK_BUSINESSES } from '@/mocks/businesses'
import { BusinessService } from '@/lib/api/services/business.service'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface RecommendedBusiness {
  id: string
  slug?: string
  name: string
  rating: number
  reviewCount: number
  address: string
  image: string
}

export function RecommendedSection() {
  const params = useParams<{ lang: string }>()
  const [businesses, setBusinesses] = useState<RecommendedBusiness[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const response = await BusinessService.getApprovedBusinesses({ page: 1, pageSize: 4 })
        if (response.data && response.data.length > 0) {
          const mapped = response.data.map(b => ({
            id: b.id,
            slug: b.slug,
            name: b.name,
            rating: b.rating ?? 0,
            reviewCount: b.reviews?.length ?? 0,
            address: b.branches?.[0]?.address ?? '',
            image: b.logoUrl || b.coverImageUrl || b.logo || '',
          }))
          setBusinesses(mapped)
        } else {
          // Fallback to mock data if API returns empty
          const fallback = MOCK_BUSINESSES.slice(0, 4).map(b => ({
            id: b.id,
            slug: b.slug,
            name: b.name,
            rating: b.rating ?? 0,
            reviewCount: 0,
            address: b.address ?? '',
            image: b.coverImageUrl || b.imageUrl || '',
          }))
          setBusinesses(fallback)
        }
      } catch {
        // Fallback to mock
        const fallback = MOCK_BUSINESSES.slice(0, 4).map(b => ({
          id: b.id,
          slug: b.slug,
          name: b.name,
          rating: b.rating ?? 0,
          reviewCount: 0,
          address: b.address ?? '',
          image: b.coverImageUrl || b.imageUrl || '',
        }))
        setBusinesses(fallback)
      } finally {
        setLoading(false)
      }
    }
    fetchBusinesses()
  }, [])

  if (loading) {
    return (
      <section className='py-8 sm:py-16 md:py-20 bg-gray-50 dark:bg-[#0a2c24]/5'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='sm:hidden overflow-x-auto overflow-y-visible pt-4 pb-2 -mx-4 px-4'>
            <div className='flex gap-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className='animate-pulse min-w-[86vw] max-w-[340px] h-28 bg-white dark:bg-gray-800 rounded-2xl'
                />
              ))}
            </div>
          </div>

          <div className='hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='animate-pulse bg-white dark:bg-gray-800 rounded-2xl h-72' />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (businesses.length === 0) return null

  return (
    <section className='py-8 sm:py-16 md:py-20 bg-gray-50 dark:bg-[#0a2c24]/5'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-end mb-6 md:mb-12'>
          <div>
            <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-[#0a2c24] dark:text-white mb-2'>
              Recommended for you
            </h2>
            <p className='text-sm sm:text-lg text-gray-600 dark:text-gray-300'>Top rated professionals in your area</p>
          </div>
          <Link href={`/${params?.lang ?? 'en'}/search`} className='inline-flex sm:hidden'>
            <div className='inline-flex items-center text-sm text-[#0a2c24] font-semibold'>
              <span className='mr-1'>All</span>
              <ArrowRight className='w-4 h-4' />
            </div>
          </Link>
          <Link href={`/${params?.lang ?? 'en'}/search`} className='hidden sm:block'>
            <div className='inline-flex items-center text-[#0a2c24] font-semibold hover:text-[#0a2c24]/80 transition-colors'>
              <span className='mr-2'>View All</span>
              <ArrowRight className='w-4 h-4' />
            </div>
          </Link>
        </div>

        <div className='sm:hidden overflow-x-auto overflow-y-visible pt-4 pb-2 -mx-4 px-4'>
          <div className='flex items-start gap-3 snap-x snap-mandatory py-1'>
            {businesses.map((business, index) => (
              <div key={business.id} className='min-w-[86vw] max-w-[340px] snap-start'>
                <BusinessCard
                  id={business.id}
                  slug={business.slug}
                  name={business.name}
                  rating={business.rating}
                  reviewCount={business.reviewCount}
                  address={business.address}
                  image={business.image}
                  isPromoted={index % 3 === 0}
                  mobile
                />
              </div>
            ))}
          </div>
        </div>

        <div className='hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-6'>
          {businesses.map((business, index) => (
            <BusinessCard
              key={business.id}
              id={business.id}
              slug={business.slug}
              name={business.name}
              rating={business.rating}
              reviewCount={business.reviewCount}
              address={business.address}
              image={business.image}
              isPromoted={index % 3 === 0}
            />
          ))}
        </div>

        <div className='mt-4 text-center sm:hidden'>
          <Link
            href={`/${params?.lang ?? 'en'}/search`}
            className='block w-full bg-transparent border border-[#0a2c24] text-[#0a2c24] font-semibold py-3 rounded-xl hover:bg-[#0a2c24] hover:text-white transition-colors'
          >
            View All Businesses
          </Link>
        </div>
      </div>
    </section>
  )
}
