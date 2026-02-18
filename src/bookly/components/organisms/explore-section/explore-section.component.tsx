'use client'

import { H2 } from '@/bookly/components/atoms'
import { CategoryCard } from '@/bookly/components/molecules'
import { categories } from '@/bookly/data/mock-data'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CategoriesService } from '@/lib/api/services/categories.service'

const DEFAULT_ICONS: Record<string, string> = {
  'health': 'ri-heart-pulse-line',
  'beauty': 'ri-heart-pulse-line',
  'sports': 'ri-run-line',
  'fitness': 'ri-run-line',
  'education': 'ri-book-open-line',
  'professional': 'ri-briefcase-line',
  'services': 'ri-briefcase-line',
  'home': 'ri-home-line',
  'auto': 'ri-car-line',
  'automotive': 'ri-car-line',
  'medical': 'ri-hospital-line',
  'dental': 'ri-hospital-line',
  'legal': 'ri-scales-line',
  'spa': 'ri-heart-pulse-line',
  'wellness': 'ri-heart-pulse-line',
}

function getIconForCategory(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, icon] of Object.entries(DEFAULT_ICONS)) {
    if (lower.includes(key)) return icon
  }
  return 'ri-apps-line'
}

function getSlugForCategory(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const ExploreSection = () => {
  const params = useParams<{ lang: string }>()
  const [categoriesData, setCategoriesData] = useState(categories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await CategoriesService.getCategories()
        if (response.data && response.data.length > 0) {
          const mapped = response.data.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: getSlugForCategory(cat.name),
            icon: getIconForCategory(cat.name),
            image: `/images/categories/${getSlugForCategory(cat.name)}.jpg`,
          }))
          setCategoriesData(mapped)
        }
      } catch {
        // On error, keep mock categories as fallback
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  return (
    <>
      {/* Categories Section */}
      <section className='container mx-auto py-8 sm:py-12 lg:py-16'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <H2
            stringProps={{ localeKey: 'categories.title' }}
            className='hidden lg:block text-xl sm:text-2xl lg:text-3xl font-semibold text-left text-white mb-8'
          />
        </div>

        {/* Mobile Horizontal Scroll Carousel */}
        <div className='lg:hidden px-4 -mx-4 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory flex gap-4 scroll-pl-4'>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='animate-pulse flex flex-col items-center gap-2 min-w-[72px] snap-start'>
                  <div className='w-[72px] h-[72px] bg-white/10 rounded-full' />
                  <div className='w-12 h-3 bg-white/10 rounded' />
                </div>
              ))
            : categoriesData.map(category => (
                <Link
                  key={category.id}
                  href={`/${params?.lang}/search?category=${category.slug}`}
                  className='min-w-[80px] snap-start flex flex-col items-center'
                >
                  <CategoryCard category={category} mobile />
                </Link>
              ))}
        </div>

        {/* Desktop Horizontal Scroll Carousel */}
        <div className='hidden lg:block mt-6 sm:mt-8 relative'>
          <div className='flex gap-4 sm:gap-6 lg:gap-8 overflow-x-auto px-4 sm:px-6 pb-8 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
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
