'use client'

import { BaseCard, H2 } from '@/bookly/components/atoms'
import { CategoryCard, BusinessCard } from '@/bookly/components/molecules'
import { categories, mockBusinesses } from '@/bookly/data/mock-data'
import { useRouter } from 'next/navigation'

export const ExploreSection = () => {
  const router = useRouter()

  const handleCategoryClick = (slug: string) => {
    router.push(`/category/${slug}`)
  }
  return (
    <>
      {/* Categories Section */}
      <section className='container mx-auto py-16'>
        <div className='max-w-6xl mx-auto px-6'>
          <H2
            stringProps={{ plainText: 'Explore by category' }}
            className='text-2xl font-bold text-center text-gray-900 mb-12'
          />
        </div>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8'>
          {categories.map(category => (
            <CategoryCard key={category.id} category={category} onClick={() => handleCategoryClick(category.slug)} />
          ))}
        </div>
      </section>
    </>
  )
}
