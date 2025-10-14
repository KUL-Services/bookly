'use client'

import { BaseCard, H2 } from '@/bookly/components/atoms'
import { CategoryCard, BusinessCard } from '@/bookly/components/molecules'
import { categories, mockBusinesses } from '@/bookly/data/mock-data'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CategoriesService } from '@/lib/api/services/categories.service'
import type { Category } from '@/lib/api/types'

export const ExploreSection = () => {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const [categoriesData, setCategoriesData] = useState(categories)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoriesService.getCategories()
        if (response.data && Array.isArray(response.data)) {
          // Map API categories to component format
          const apiCategories = response.data.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
            image: cat.image || '/images/categories/default.jpg',
            icon: cat.icon || 'default-icon'
          }))
          setCategoriesData(apiCategories)
        }
      } catch (error) {
        console.warn('Failed to fetch categories from API, using fallback data:', error)
        // Keep using mock categories as fallback
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleCategoryClick = (slug: string) => {
    router.push(`/${params?.lang}/category/${slug}`)
  }
  return (
    <>
      {/* Categories Section */}
      <section className='container mx-auto py-8 sm:py-12 lg:py-16'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6'>
          <H2
            stringProps={{ localeKey: 'categories.title' }}
            className='text-xl sm:text-2xl lg:text-3xl font-bold text-center text-gray-900 dark:text-white mb-6 sm:mb-8 lg:mb-12'
          />
        </div>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-8 px-4 sm:px-6'>
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className='animate-pulse'>
                <div className='bg-gray-200 dark:bg-gray-700 rounded-lg h-20 sm:h-24 w-full mb-2'></div>
                <div className='bg-gray-200 dark:bg-gray-700 rounded h-3 sm:h-4 w-3/4 mx-auto'></div>
              </div>
            ))
          ) : (
            categoriesData.map(category => (
              <CategoryCard key={category.id} category={category} onClick={() => handleCategoryClick(category.slug)} />
            ))
          )}
        </div>
      </section>
    </>
  )
}
