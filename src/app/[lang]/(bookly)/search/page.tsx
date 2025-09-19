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
import { mockBusinesses, mockServices as services, mockCategories as categories } from '@/bookly/data/mock-data'

type SortKey = 'recommended' | 'rating_desc' | 'price_asc' | 'price_desc'
type TimeOfDay = 'morning' | 'afternoon' | 'evening'

export default function SearchPage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const searchParams = useSearchParams()

  const [businesses, setBusinesses] = useState<Business[]>([])
  const [servicesData, setServicesData] = useState<Service[]>([])
  const [categoriesData, setCategoriesData] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [q, setQ] = useState<string>(searchParams.get('q') || '')
  const [loc, setLoc] = useState<string>(searchParams.get('loc') || '')
  const [priceMin, setPriceMin] = useState<number>(Number(searchParams.get('min') || 0))
  const [priceMax, setPriceMax] = useState<number>(Number(searchParams.get('max') || 200))
  const [sort, setSort] = useState<SortKey>((searchParams.get('sort') as SortKey) || 'recommended')
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<TimeOfDay[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  const categorySlug = searchParams.get('category')
  const categoryId = useMemo(() => {
    if (!categorySlug) return undefined
    return categoriesData.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === categorySlug)?.id
  }, [categorySlug, categoriesData])

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
        setServicesData(servicesResponse.data || [])
        setCategoriesData(categoriesResponse.data || [])
        setError(null)
      } catch (err) {
        console.warn('API fetch failed, using fallback data:', err)
        // Use fallback mock data when API fails
        setBusinesses(mockBusinesses)
        setServicesData(services)
        setCategoriesData(categories)
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
    const businessServices = servicesData.filter(s => s.businessId === businessId)
    const prices = businessServices.map(s => s.price)
    return prices.length ? Math.min(...prices) : undefined
  }

  const getBusinessServices = (businessId: string) => {
    return servicesData.filter(s => s.businessId === businessId)
  }

  const filtered = useMemo(() => {
    let list = businesses.filter(business => {
      // Category filter
      if (categoryId) {
        const businessServices = servicesData.filter(s => s.businessId === business.id)
        const hasCategory = businessServices.some(service =>
          service.categories?.some(cat => cat.id === categoryId)
        )
        if (!hasCategory) return false
      }

      // Query filter
      const businessText = (business.name + ' ' + (business.about || '')).toLowerCase()
      const serviceText = servicesData
        .filter(s => s.businessId === business.id)
        .map(s => s.name.toLowerCase())
        .join(' ')

      const matchesQ = q ?
        businessText.includes(q.toLowerCase()) || serviceText.includes(q.toLowerCase()) :
        true
      if (!matchesQ) return false

      // Location filter (simple name/city match)
      const matchesLoc = loc ?
        business.name.toLowerCase().includes(loc.toLowerCase()) ||
        business.city.toLowerCase().includes(loc.toLowerCase()) ||
        business.address.toLowerCase().includes(loc.toLowerCase()) :
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
  }, [businesses, servicesData, categoryId, q, loc, priceMin, priceMax, sort])

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
    <div className='min-h-screen w-full bg-gray-50'>
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

      <div className='mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6'>
        {/* Filters */}
        <aside className='bg-white border rounded-lg p-6 h-fit'>
          <div className='flex items-center gap-2 mb-6'>
            <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z' />
            </svg>
            <h3 className='font-semibold text-gray-900'>Filters</h3>
          </div>

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Sort by</label>
            <select
              className='w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
              value={sort}
              onChange={e => setSort(e.target.value as SortKey)}
            >
              <option value='recommended'>Recommended</option>
              <option value='rating_desc'>Rating: High to Low</option>
              <option value='price_asc'>Price: Low to High</option>
              <option value='price_desc'>Price: High to Low</option>
            </select>
          </div>

          <div className='mb-6'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>Time of day</h4>
            <div className='space-y-2'>
              {[
                { value: 'morning', label: 'Morning' },
                { value: 'afternoon', label: 'Afternoon' },
                { value: 'evening', label: 'Evening' }
              ].map(time => (
                <label key={time.value} className='flex items-center gap-2'>
                  <input
                    type='checkbox'
                    checked={selectedTimeOfDay.includes(time.value as TimeOfDay)}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedTimeOfDay([...selectedTimeOfDay, time.value as TimeOfDay])
                      } else {
                        setSelectedTimeOfDay(selectedTimeOfDay.filter(t => t !== time.value))
                      }
                    }}
                    className='w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500'
                  />
                  <span className='text-sm text-gray-700'>{time.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className='mb-6'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>Price range</h4>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                value={priceMin}
                onChange={e => setPriceMin(Number(e.target.value || 0))}
                className='w-20 border border-gray-300 rounded-md px-2 py-1 text-sm'
                min={0}
                placeholder='0'
              />
              <span className='text-gray-400'>-</span>
              <input
                type='number'
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value || 200))}
                className='w-20 border border-gray-300 rounded-md px-2 py-1 text-sm'
                min={0}
                placeholder='200'
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
                setPriceMax(200)
                setSort('recommended')
                setSelectedTimeOfDay([])
                router.push(`/${params?.lang}/search`)
              }}
            />
          </div>
        </aside>

        {/* Results */}
        <section>
          <div className='flex items-center justify-between mb-4'>
            <div className='text-sm text-gray-600'>Showing {filtered.length} face services</div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-teal-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 10h16M4 14h16M4 18h16' />
                </svg>
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 text-sm rounded-md flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-teal-500 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7' />
                </svg>
                Map
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No businesses found</h3>
              <p className='text-gray-600'>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {filtered.map(business => {
                const businessServices = getBusinessServices(business.id)
                const minPrice = businessMinPrice(business.id)
                return (
                  <div key={business.id} className='bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow'>
                    <div
                      className='cursor-pointer'
                      onClick={() => router.push(`/${params?.lang}/business/${encodeURIComponent(business.name.toLowerCase().replace(/\s+/g, '-'))}`)}
                    >
                      <div className='flex gap-4 p-4'>
                        <div className='w-32 h-24 flex-shrink-0'>
                          <img
                            src={business.coverImage}
                            alt={business.name}
                            className='w-full h-full object-cover rounded-lg'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <h3 className='text-lg font-semibold text-gray-900'>{business.name}</h3>
                              <div className='text-sm text-gray-600 mb-2'>{business.categories?.[0] || 'Service'}</div>

                              <div className='flex items-center gap-2 mb-2'>
                                <div className='flex items-center'>
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className='text-yellow-400 text-sm'>
                                      {i < Math.floor(business.averageRating) ? '★' : '☆'}
                                    </span>
                                  ))}
                                </div>
                                <span className='text-sm font-medium'>{business.averageRating}</span>
                                <span className='text-sm text-gray-500'>({business.totalRatings} reviews)</span>
                              </div>

                              <div className='flex items-center gap-1 text-sm text-gray-500 mb-3'>
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
                                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                                </svg>
                                {business.address}, {business.city}
                              </div>

                              <p className='text-sm text-gray-600 line-clamp-2'>{business.about}</p>

                              {businessServices.length > 0 && (
                                <div className='mt-3'>
                                  <div className='text-xs text-gray-500 mb-1'>Services offered:</div>
                                  <div className='flex flex-wrap gap-1'>
                                    {businessServices.slice(0, 3).map(service => (
                                      <span key={service.id} className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800'>
                                        {service.name} - £{service.price}
                                      </span>
                                    ))}
                                    {businessServices.length > 3 && (
                                      <span className='text-xs text-gray-500'>+{businessServices.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className='text-sm text-gray-600 mt-2'>
                                Open today: 8:00 AM - 7:00 PM
                              </div>
                            </div>
                            <div className='text-right ml-4'>
                              <button className='bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors'>
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}