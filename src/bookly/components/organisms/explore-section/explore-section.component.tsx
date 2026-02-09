'use client'

import { H2 } from '@/bookly/components/atoms'
import { CategoryCard } from '@/bookly/components/molecules'
import { categories } from '@/bookly/data/mock-data'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Category } from '@/bookly/data/types'

export const ExploreSection = () => {
  const params = useParams<{ lang: string }>()
  const [categoriesData, setCategoriesData] = useState(categories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock categories till connected with backend
    const mockCategoriesData: (Category & { image: string })[] = [
      {
        id: '1',
        name: 'Health & Beauty',
        slug: 'beauty',
        icon: 'ri-heart-pulse-line',
        image: '/images/categories/health.jpg'
      },
      {
        id: '2',
        name: 'Sports & Fitness',
        slug: 'fitness',
        icon: 'ri-run-line',
        image: '/images/categories/sports.jpg'
      },
      {
        id: '3',
        name: 'Education',
        slug: 'education',
        icon: 'ri-book-open-line',
        image: '/images/categories/education.jpg'
      },
      {
        id: '4',
        name: 'Professional Services',
        slug: 'services',
        icon: 'ri-briefcase-line',
        image: '/images/categories/professional.jpg'
      },
      {
        id: '5',
        name: 'Home & Garden',
        slug: 'home',
        icon: 'ri-home-line',
        image: '/images/categories/home.jpg'
      },
      { id: '6', name: 'Automotive', slug: 'auto', icon: 'ri-car-line', image: '/images/categories/auto.jpg' },
      { id: '7', name: 'Medical', slug: 'dental', icon: 'ri-hospital-line', image: '/images/categories/medical.jpg' },
      { id: '8', name: 'Legal', slug: 'legal', icon: 'ri-scales-line', image: '/images/categories/legal.jpg' }
    ]
    setCategoriesData(mockCategoriesData)
    setLoading(false)
  }, [])

  return (
    <>
      {/* Categories Section */}
      <section className='container mx-auto py-8 sm:py-12 lg:py-16'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          {/* Title - Hidden on mobile for cleaner integration with hero */}
          <H2
            stringProps={{ localeKey: 'categories.title' }}
            className='hidden lg:block text-xl sm:text-2xl lg:text-3xl font-semibold text-left text-white mb-8'
          />
        </div>

        {/* Mobile Grid Layout - 4 columns of circular cards */}
        <div className='lg:hidden px-4'>
          <div className='grid grid-cols-4 gap-4'>
            {loading
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className='animate-pulse flex flex-col items-center gap-2'>
                    <div className='w-[72px] h-[72px] bg-white/10 rounded-full' />
                    <div className='w-12 h-3 bg-white/10 rounded' />
                  </div>
                ))
              : categoriesData.map(category => (
                  <Link key={category.id} href={`/${params?.lang}/search?category=${category.slug}`}>
                    <CategoryCard category={category} mobile />
                  </Link>
                ))}
          </div>
        </div>

        {/* Desktop Horizontal Scroll Carousel */}
        <div className='hidden lg:block mt-6 sm:mt-8 relative'>
          <div className='flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto px-4 sm:px-6 pb-8 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            {loading
              ? // Loading skeleton
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className='animate-pulse min-w-[160px] sm:min-w-[190px] lg:min-w-[210px] snap-start'>
                    <div className='bg-gray-200 dark:bg-gray-700 rounded-[24px] h-24 sm:h-28 w-full mb-2'></div>
                    <div className='bg-gray-200 dark:bg-gray-700 rounded h-3 sm:h-4 w-3/4 mx-auto'></div>
                  </div>
                ))
              : categoriesData.map((category, index) => {
                  const variants: ('sage' | 'coral' | 'teal')[] = ['sage', 'coral', 'teal']
                  const variant = variants[index % variants.length]
                  return (
                    <Link
                      key={category.id}
                      href={`/${params?.lang}/search?category=${category.slug}`}
                      className='min-w-[160px] sm:min-w-[190px] lg:min-w-[210px] snap-start'
                    >
                      <CategoryCard category={category} variant={variant} />
                    </Link>
                  )
                })}
          </div>
        </div>
      </section>
    </>
  )
}
