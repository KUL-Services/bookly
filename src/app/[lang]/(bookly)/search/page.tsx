'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import { BusinessCard } from '@/bookly/components/molecules/business-card/business-card.component'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { BranchDetailsModal } from '@/bookly/components/molecules/branch-details-modal/branch-details-modal.component'

// API Imports
import { BusinessService, ServicesService, CategoriesService } from '@/lib/api'
import type { Business, Service, Category } from '@/lib/api'
// Fallback data imports
import { mockBusinesses, mockServices as services, categories } from '@/bookly/data/mock-data'

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
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [branchModalOpen, setBranchModalOpen] = useState(false)

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
        const hasCategory = businessServices.some(service => service.categories?.some(cat => cat.id === categoryId))
        if (!hasCategory) return false
      }

      // Query filter
      const businessText = (business.name + ' ' + (business.about || '')).toLowerCase()
      const serviceText = servicesData
        .filter(s => s.businessId === business.id)
        .map(s => s.name.toLowerCase())
        .join(' ')

      const matchesQ = q ? businessText.includes(q.toLowerCase()) || serviceText.includes(q.toLowerCase()) : true
      if (!matchesQ) return false

      // Location filter (simple name/city match)
      const matchesLoc = loc
        ? business.name.toLowerCase().includes(loc.toLowerCase()) ||
          business.city.toLowerCase().includes(loc.toLowerCase()) ||
          business.address.toLowerCase().includes(loc.toLowerCase())
        : true
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
          <Button buttonText={{ plainText: 'Try Again' }} onClick={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/10 to-cyan-50/5'>
      {/* Top search bar - mobile optimized */}
      <div className='bg-white/90 backdrop-blur-sm border-b border-teal-100/50 sticky top-0 z-40'>
        <div className='mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <SearchInput
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholderProps={{ plainText: 'What are you looking for? (e.g. haircut, nails)' }}
              className='flex-1 text-sm sm:text-base'
            />
            <SearchInput
              value={loc}
              onChange={e => setLoc(e.target.value)}
              placeholderProps={{ plainText: 'Location' }}
              className='flex-1 text-sm sm:text-base'
            />
            <Button
              onClick={applyToUrl}
              buttonText={{ plainText: 'Search' }}
              className='bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200'
            />
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-4 sm:gap-6'>
        {/* Filters - mobile optimized */}
        <aside className='bg-white/80 backdrop-blur-sm border border-teal-100/50 rounded-xl p-4 sm:p-6 h-fit shadow-lg lg:sticky lg:top-24'>
          <div className='flex items-center gap-2 mb-6'>
            <svg className='w-5 h-5 text-gray-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
              />
            </svg>
            <h3 className='font-semibold text-gray-900'>Filters</h3>
          </div>

          <div className='mb-6'>
            <label className='block text-sm font-medium text-gray-700 mb-3'>Sort by</label>
            <select
              className='w-full border border-teal-200 rounded-lg px-3 py-3 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200'
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
                <label key={time.value} className='flex items-center gap-3 cursor-pointer hover:bg-teal-50 p-2 rounded-lg transition-colors duration-200'>
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
                    className='w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2'
                  />
                  <span className='text-sm text-gray-700 font-medium'>{time.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className='mb-6'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>Categories</h4>
            <div className='space-y-1 max-h-48 overflow-y-auto'>
              <label className='flex items-center gap-3 cursor-pointer hover:bg-teal-50 p-2 rounded-lg transition-colors duration-200'>
                <input
                  type='radio'
                  name='category'
                  checked={!categoryId}
                  onChange={() => {
                    const sp = new URLSearchParams(searchParams.toString())
                    sp.delete('category')
                    router.push(`/${params?.lang}/search?` + sp.toString())
                  }}
                  className='w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2'
                />
                <span className='text-sm text-gray-700 font-medium'>All Categories</span>
              </label>
              {categoriesData.map(category => (
                <label key={category.id} className='flex items-center gap-3 cursor-pointer hover:bg-teal-50 p-2 rounded-lg transition-colors duration-200'>
                  <input
                    type='radio'
                    name='category'
                    checked={categoryId === category.id}
                    onChange={() => {
                      const sp = new URLSearchParams(searchParams.toString())
                      const slug = category.name.toLowerCase().replace(/\s+/g, '-')
                      sp.set('category', slug)
                      router.push(`/${params?.lang}/search?` + sp.toString())
                    }}
                    className='w-5 h-5 text-teal-600 border-gray-300 focus:ring-teal-500 focus:ring-2'
                  />
                  <span className='text-sm text-gray-700 font-medium'>{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className='mb-6'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>Price Range</h4>
            <div className='space-y-3'>
              {/* Mobile: Stacked Layout */}
              <div className='block md:hidden space-y-2'>
                <input
                  type='number'
                  value={priceMin}
                  onChange={e => setPriceMin(Number(e.target.value || 0))}
                  className='w-full border border-teal-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200'
                  min={0}
                  placeholder='Minimum price'
                />
                <input
                  type='number'
                  value={priceMax}
                  onChange={e => setPriceMax(Number(e.target.value || 200))}
                  className='w-full border border-teal-200 rounded-lg px-4 py-3 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200'
                  min={0}
                  placeholder='Maximum price'
                />
              </div>

              {/* Desktop: Side by Side Layout */}
              <div className='hidden md:flex items-center gap-3'>
                <div className='flex-1'>
                  <input
                    type='number'
                    value={priceMin}
                    onChange={e => setPriceMin(Number(e.target.value || 0))}
                    className='w-full border border-teal-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200'
                    min={0}
                    placeholder='Min'
                  />
                </div>
                <span className='text-gray-400 font-medium text-sm flex-shrink-0'>to</span>
                <div className='flex-1'>
                  <input
                    type='number'
                    value={priceMax}
                    onChange={e => setPriceMax(Number(e.target.value || 200))}
                    className='w-full border border-teal-200 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200'
                    min={0}
                    placeholder='Max'
                  />
                </div>
              </div>

              <div className='text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2'>
                Range: ${priceMin} - ${priceMax === 0 ? '∞' : `$${priceMax}`}
              </div>
            </div>
          </div>

          <div className='flex gap-3'>
            <Button
              onClick={applyToUrl}
              variant='contained'
              buttonText={{ plainText: 'Apply' }}
              className='flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200'
            />
            <Button
              variant='outlined'
              buttonText={{ plainText: 'Reset' }}
              className='flex-1 border-teal-200 text-teal-600 hover:bg-teal-50 py-2 rounded-lg transition-all duration-200'
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

        {/* Results - mobile optimized */}
        <section>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6'>
            <div className='text-sm text-gray-600'>
              <span className='font-medium text-gray-900'>
                Showing {filtered.length}{' '}
                {categoryId
                  ? categoriesData.find(c => c.id === categoryId)?.name.toLowerCase() + ' services'
                  : 'businesses'}
              </span>
              {categoryId && (
                <span className='ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-800 font-medium'>
                  {categoriesData.find(c => c.id === categoryId)?.name}
                  <button
                    onClick={() => {
                      const sp = new URLSearchParams(searchParams.toString())
                      sp.delete('category')
                      router.push(`/${params?.lang}/search?` + sp.toString())
                    }}
                    className='ml-2 text-teal-600 hover:text-teal-800 font-bold'
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white border border-teal-200 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 10h16M4 14h16M4 18h16'
                  />
                </svg>
                <span className='hidden sm:inline'>List</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'map'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white border border-teal-200 text-gray-700 hover:bg-teal-50 hover:border-teal-300'
                }`}
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7'
                  />
                </svg>
                <span className='hidden sm:inline'>Map</span>
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>No businesses found</h3>
              <p className='text-gray-600'>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className='space-y-4 sm:space-y-6'>
              {filtered.map((business, index) => {
                const businessServices = getBusinessServices(business.id)
                const minPrice = businessMinPrice(business.id)
                return (
                  <div
                    key={business.id}
                    className='group bg-white/80 backdrop-blur-sm border border-teal-100/50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-4 duration-500'
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className='cursor-pointer'
                      onClick={() =>
                        router.push(
                          `/${params?.lang}/business/${encodeURIComponent(business.name.toLowerCase().replace(/\s+/g, '-'))}`
                        )
                      }
                    >
                      <div className='flex flex-col sm:flex-row gap-4 p-4 sm:p-6'>
                        <div className='w-full sm:w-32 h-48 sm:h-24 flex-shrink-0'>
                          <BusinessAvatar
                            businessName={business.name}
                            imageSrc={business.coverImage}
                            imageAlt={business.name}
                            className='w-full h-full rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105'
                            size='xl'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
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
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                                  />
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                                  />
                                </svg>
                                {business.address}, {business.city}
                              </div>

                              <p className='text-sm text-gray-600 line-clamp-2'>{business.about}</p>

                              {businessServices.length > 0 && (
                                <div className='mt-3'>
                                  <div className='text-xs text-gray-500 mb-1'>Services offered:</div>
                                  <div className='flex flex-wrap gap-1'>
                                    {businessServices.slice(0, 3).map(service => (
                                      <span
                                        key={service.id}
                                        className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800'
                                      >
                                        {service.name} - £{service.price}
                                      </span>
                                    ))}
                                    {businessServices.length > 3 && (
                                      <span className='text-xs text-gray-500'>+{businessServices.length - 3} more</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className='text-sm text-gray-600 mt-2'>Open today: 8:00 AM - 7:00 PM</div>
                            </div>
                            <div className='flex sm:flex-col gap-2 sm:ml-4'>
                              <button className='flex-1 sm:flex-none bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4 py-2 sm:py-3 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200'>
                                Book Now
                              </button>
                              {business.branches && business.branches.length > 0 && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    setSelectedBusiness(business)
                                    setSelectedBranch(business.branches[0])
                                    setBranchModalOpen(true)
                                  }}
                                  className='flex-1 sm:flex-none bg-white border border-teal-200 text-teal-600 hover:bg-teal-50 hover:border-teal-300 px-4 py-2 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-200'
                                >
                                  <span className='hidden sm:inline'>View Branches ({business.branches.length})</span>
                                  <span className='sm:hidden'>Branches ({business.branches.length})</span>
                                </button>
                              )}
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

      {/* Branch Details Modal */}
      {selectedBranch && selectedBusiness && (
        <BranchDetailsModal
          isOpen={branchModalOpen}
          onClose={() => {
            setBranchModalOpen(false)
            setSelectedBranch(null)
            setSelectedBusiness(null)
          }}
          branch={selectedBranch}
          businessName={selectedBusiness.name}
          businessImage={selectedBusiness.coverImage}
          services={servicesData.filter(s => s.businessId === selectedBusiness.id)}
          staff={[]} // TODO: Add staff data if available
          allBranches={selectedBusiness.branches || []}
          onBranchChange={newBranch => {
            setSelectedBranch(newBranch)
          }}
          onBookService={serviceId => {
            console.log('Booking service:', serviceId)
            // TODO: Implement booking logic
          }}
        />
      )}
    </div>
  )
}
