'use client'

import { H2 } from '@/bookly/components/atoms'
import { CategoryCard } from '@/bookly/components/molecules'
import { categories } from '@/bookly/data/mock-data'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Category } from '@/bookly/data/types'

export const ExploreSection = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const [categoriesData, setCategoriesData] = useState(categories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock categories till connected with backend
    const mockCategoriesData: (Category & { image: string })[] = [
      {
        id: '1',
        name: 'Health & Beauty',
        slug: 'health-beauty',
        icon: 'ri-heart-pulse-line',
        image: '/images/categories/health.jpg'
      },
      {
        id: '2',
        name: 'Sports & Fitness',
        slug: 'sports-fitness',
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
        slug: 'professional-services',
        icon: 'ri-briefcase-line',
        image: '/images/categories/professional.jpg'
      },
      {
        id: '5',
        name: 'Home & Garden',
        slug: 'home-garden',
        icon: 'ri-home-line',
        image: '/images/categories/home.jpg'
      },
      { id: '6', name: 'Automotive', slug: 'automotive', icon: 'ri-car-line', image: '/images/categories/auto.jpg' },
      { id: '7', name: 'Medical', slug: 'medical', icon: 'ri-hospital-line', image: '/images/categories/medical.jpg' },
      { id: '8', name: 'Legal', slug: 'legal', icon: 'ri-scales-line', image: '/images/categories/legal.jpg' }
    ]
    setCategoriesData(mockCategoriesData)
    setLoading(false)
  }, [])

  const handleCategoryClick = (slug: string) => {
    router.push(`/${params?.lang}/category/${slug}`)
  }
  return (
    <>
      {/* Categories Section */}
      <section className='container mx-auto py-8 sm:py-12 lg:py-16'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 flex items-end justify-between gap-4'>
          <H2
            stringProps={{ localeKey: 'categories.title' }}
            className='text-xl sm:text-2xl lg:text-3xl font-semibold text-left text-gray-900 dark:text-white'
          />
        </div>
        <div className='mt-6 sm:mt-8'>
          <div className='flex gap-3 sm:gap-4 lg:gap-6 overflow-x-auto px-4 sm:px-6 pb-4 snap-x snap-mandatory'>
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
                    <CategoryCard
                      key={category.id}
                      category={category}
                      onClick={() => handleCategoryClick(category.slug)}
                      className='min-w-[160px] sm:min-w-[190px] lg:min-w-[210px] snap-start'
                      variant={variant}
                    />
                  )
                })}
          </div>
        </div>
      </section>
    </>
  )
}
