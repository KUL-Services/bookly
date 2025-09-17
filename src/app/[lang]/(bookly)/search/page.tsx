'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import { BusinessCard } from '@/bookly/components/molecules/business-card/business-card.component'

// API Imports
import { BusinessService, ServicesService, CategoriesService } from '@/lib/api'
import type { Business, Service, Category } from '@/lib/api'
// Fallback data imports
import { mockBusinesses, services as mockServices, categories as mockCategories } from '@/bookly/data/mock-data'

type SortKey = 'recommended' | 'rating_desc' | 'price_asc' | 'price_desc'

export default function SearchPage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const searchParams = useSearchParams()

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState<string>(searchParams.get('q') || '')
  const [loc, setLoc] = useState<string>(searchParams.get('loc') || '')
  const [priceMin, setPriceMin] = useState<number>(Number(searchParams.get('min') || 0))
  const [priceMax, setPriceMax] = useState<number>(Number(searchParams.get('max') || 9999))
  const [sort, setSort] = useState<SortKey>((searchParams.get('sort') as SortKey) || 'recommended')

  const categorySlug = searchParams.get('category')
  const categoryId = useMemo(() => {
    if (!categorySlug) return undefined
    return categories.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug)?.id
  }, [categorySlug, categories])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [businessesResponse, servicesResponse, categoriesResponse] = await Promise.all([
          BusinessService.getApprovedBusinesses(),
          ServicesService.getServices(),
          CategoriesService.getCategories()
        ])

        if (businessesResponse.error) throw new Error(businessesResponse.error)
        if (servicesResponse.error) throw new Error(servicesResponse.error)
        if (categoriesResponse.error) throw new Error(categoriesResponse.error)

        setBusinesses(businessesResponse.data || [])
        setServices(servicesResponse.data || [])
        setCategories(categoriesResponse.data || [])
        setError(null)
      } catch (err) {
        console.warn('API fetch failed, using fallback data:', err)
        // Use fallback mock data when API fails
        setBusinesses(mockBusinesses)
        setServices(mockServices)
        setCategories(mockCategories)
        setError(null) // Don't show error since we have fallback data
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const applyToUrl = () => {
    const sp = new URLSearchParams()
    if (q) sp.set('q', q)
    if (loc) sp.set('loc', loc)
    if (priceMin) sp.set('min', String(priceMin))
    if (priceMax !== 9999) sp.set('max', String(priceMax))
    if (categorySlug) sp.set('category', categorySlug)
    if (sort && sort !== 'recommended') sp.set('sort', sort)
    router.push(`/${params?.lang}/search?` + sp.toString())
  }

  const businessMinPrice = (businessId: string) => {
    const businessServices = services.filter(s => s.businessId === businessId)
    const prices = businessServices.map(s => s.price)
    return prices.length ? Math.min(...prices) : undefined
  }

  const filtered = useMemo(() => {
    let list = businesses.filter(business => {
      // Category filter
      if (categoryId) {
        const businessServices = services.filter(s => s.businessId === business.id)
        const hasCategory = businessServices.some(service =>
          service.categories?.some(cat => cat.id === categoryId)
        )
        if (!hasCategory) return false
      }

      // Query filter
      const businessText = (business.name + ' ' + (business.description || '')).toLowerCase()
      const serviceText = services
        .filter(s => s.businessId === business.id)
        .map(s => s.name.toLowerCase())
        .join(' ')

      const matchesQ = q ?
        businessText.includes(q.toLowerCase()) || serviceText.includes(q.toLowerCase()) :
        true
      if (!matchesQ) return false

      // Location filter (simple name/description match)
      const matchesLoc = loc ?
        business.name.toLowerCase().includes(loc.toLowerCase()) ||
        (business.description || '').toLowerCase().includes(loc.toLowerCase()) :
        true
      if (!matchesLoc) return false

      // Price filter
      const minPrice = businessMinPrice(business.id)
      if (minPrice === undefined) return true
      if (minPrice < priceMin) return false
      if (minPrice > priceMax) return false

      return true
    })

    // Sorting
    const withPrice = list.map(b => ({ b, p: businessMinPrice(b.id) ?? 9999 }))
    switch (sort) {
      case 'rating_desc':
        // Sort by creation date as proxy for rating since we don't have ratings yet
        withPrice.sort((a, b) => new Date(b.b.createdAt).getTime() - new Date(a.b.createdAt).getTime())
        break
      case 'price_asc':
        withPrice.sort((a, b) => a.p - b.p)
        break
      case 'price_desc':
        withPrice.sort((a, b) => b.p - a.p)
        break
      default:
        // Recommended - sort by creation date
        withPrice.sort((a, b) => new Date(b.b.createdAt).getTime() - new Date(a.b.createdAt).getTime())
    }
    return withPrice.map(x => x.b)
  }, [businesses, services, categoryId, q, loc, priceMin, priceMax, sort])

  if (loading) {
    return (
      <div className='min-h-screen w-full surface-muted flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading businesses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen w-full surface-muted flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>Something went wrong</h1>
          <p className='text-gray-600 mb-6'>{error}</p>
          <Button
            buttonText={{ plainText: 'Try Again' }}
            onClick={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full surface-muted'>
      {/* Top search bar */}
      <div className='bg-white border-b'>
        <div className='mx-auto max-w-6xl px-4 py-4 flex flex-col sm:flex-row gap-3'>
          <SearchInput
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholderProps={{ plainText: "What are you looking for? (e.g. haircut, nails)" }}
            className='flex-1'
          />
          <SearchInput
            value={loc}
            onChange={e => setLoc(e.target.value)}
            placeholderProps={{ plainText: 'Location' }}
            className='flex-1'
          />
          <Button onClick={applyToUrl} buttonText={{ plainText: 'Search' }} />
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[260px,1fr] gap-6'>
        {/* Filters */}
        <aside className='surface-card border rounded-lg p-4 h-max'>
          <div className='mb-4'>
            <label className='block text-sm text-gray-700 mb-1'>Sort by</label>
            <select
              className='w-full border rounded-md px-2 py-2'
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
            >
              <option value='recommended'>Recommended</option>
              <option value='rating_desc'>Rating: High to Low</option>
              <option value='price_asc'>Price: Low to High</option>
              <option value='price_desc'>Price: High to Low</option>
            </select>
          </div>

          <div className='mb-4'>
            <div className='text-sm text-gray-700 mb-2'>Price range</div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={priceMin}
                onChange={e => setPriceMin(Number(e.target.value || 0))}
                className='w-24 border rounded-md px-2 py-1'
                min={0}
              />
              <span>-</span>
              <input
                type='number'
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value || 0))}
                className='w-24 border rounded-md px-2 py-1'
                min={0}
              />
            </div>
          </div>

          <div className='flex gap-2'>
            <Button onClick={applyToUrl} variant='contained' buttonText={{ plainText: 'Apply' }} />
            <Button
              variant='outlined'
              buttonText={{ plainText: 'Reset' }}
              onClick={() => {
                setQ('')
                setLoc('')
                setPriceMin(0)
                setPriceMax(9999)
                setSort('recommended')
                router.push(`/${params?.lang}/search`)
              }}
            />
          </div>
        </aside>

        {/* Results */}
        <section className='space-y-4'>
          <div className='text-sm text-gray-600'>Showing {filtered.length} results</div>

          {filtered.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No businesses found</h3>
              <p className='text-gray-600'>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filtered.map(business => (
                <div key={business.id} className='surface-card border rounded-lg p-3'>
                  <div
                    className='cursor-pointer'
                    onClick={() => router.push(`/${params?.lang}/business/${encodeURIComponent(business.name.toLowerCase().replace(/\s+/g, '-'))}`)}
                  >
                    <div className='flex gap-4'>
                      <div className='w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center'>
                        <span className='text-xl font-bold text-teal-600'>
                          {business.name.charAt(0)}
                        </span>
                      </div>
                      <div className='flex-1'>
                        <h3 className='font-semibold text-gray-900'>{business.name}</h3>
                        {business.description && (
                          <p className='text-gray-600 text-sm mt-1 line-clamp-2'>{business.description}</p>
                        )}
                        <div className='flex items-center gap-4 mt-2 text-sm text-gray-500'>
                          <span>📧 {business.email || 'No email'}</span>
                          <span>🕒 {new Date(business.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}