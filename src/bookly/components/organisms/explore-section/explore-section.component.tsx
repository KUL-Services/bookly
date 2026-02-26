'use client'

import { H2 } from '@/bookly/components/atoms'
import { CategoryCard } from '@/bookly/components/molecules'
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

const DEFAULT_CATEGORIES = [
  { id: 'beauty', name: 'Beauty', slug: 'beauty', icon: 'ri-heart-pulse-line', image: '/images/categories/beauty.jpg' },
  { id: 'fitness', name: 'Fitness', slug: 'fitness', icon: 'ri-run-line', image: '/images/categories/fitness.jpg' },
  { id: 'wellness', name: 'Wellness', slug: 'wellness', icon: 'ri-heart-pulse-line', image: '/images/categories/wellness.jpg' },
  { id: 'education', name: 'Education', slug: 'education', icon: 'ri-book-open-line', image: '/images/categories/education.jpg' }
]

export const ExploreSection = () => {
  const params = useParams<{ lang: string }>()
  const lang = params?.lang || 'en'
  const [categoriesData, setCategoriesData] = useState(DEFAULT_CATEGORIES)
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
        // Keep local defaults as fallback
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
          <div className='lg:hidden mb-4'>
            <p className='text-[10px] uppercase tracking-[0.22em] text-white/65 mb-2'>Explore</p>
            <div className='flex items-end justify-between gap-3'>
              <h2 className='text-2xl font-semibold text-white leading-tight'>Popular categories</h2>
              <span className='text-xs text-white/60'>Swipe</span>
            </div>
          </div>

          <H2
            stringProps={{ localeKey: 'categories.title' }}
            className='hidden lg:block text-xl sm:text-2xl lg:text-3xl font-semibold text-left text-white mb-8'
          />
        </div>

        {/* Mobile Horizontal Scroll Carousel */}
        <div className='lg:hidden px-4 sm:px-6 overflow-x-auto pb-4 scrollbar-hide'>
          <div className='flex gap-3 snap-x snap-mandatory scroll-pl-4'>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='animate-pulse min-w-[108px] rounded-[24px] bg-white/[0.08] p-3 snap-start'>
                  <div className='w-12 h-12 bg-white/20 rounded-2xl mx-auto mb-2.5' />
                  <div className='w-16 h-3 bg-white/20 rounded mx-auto' />
                </div>
              ))
            : categoriesData.map(category => (
                <Link
                  key={category.id}
                  href={`/${lang}/search?category=${category.slug}`}
                  className='snap-start'
                >
                  <CategoryCard category={category} mobile />
                </Link>
              ))}
          </div>
        </div>

        <div className='lg:hidden px-4 sm:px-6'>
          <div className='h-px bg-white/20' />
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
                      href={`/${lang}/search?category=${category.slug}`}
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
