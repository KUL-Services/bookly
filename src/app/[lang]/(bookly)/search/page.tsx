'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import {
  SearchFilters,
  type FilterState,
  type FilterOptions
} from '@/bookly/components/organisms/search-filters/search-filters.component'
import { Pagination, PaginationInfo } from '@/bookly/components/ui/pagination'
import { LocationFilters } from '@/bookly/components/molecules/location-filters/location-filters.component'
import { ViewToggle, type ViewMode } from '@/bookly/components/molecules/view-toggle/view-toggle.component'
import { BusinessMap } from '@/bookly/components/organisms/business-map/business-map.component'
import { BusinessList } from '@/bookly/components/organisms/business-list/business-list.component'

// API Imports
import { CategoriesService } from '@/lib/api'
import type { Category } from '@/lib/api'
import { fetchBusinessesMock } from '@/lib/api/services/businesses.mock'
import type { BusinessLocation } from '@/mocks/businesses'

// Component Imports
import { SearchResultsSkeleton, ButtonLoader } from '@/components/LoadingStates'

export default function SearchPage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const searchParams = useSearchParams()

  const [businesses, setBusinesses] = useState<BusinessLocation[]>([])
  const [categoriesData, setCategoriesData] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersLoading, setFiltersLoading] = useState(false)

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('view') as ViewMode) || 'list')

  // Location state
  const [selectedCountry, setSelectedCountry] = useState(searchParams.get('country') || '')
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '')
  const [selectedRegion, setSelectedRegion] = useState(searchParams.get('region') || '')

  // Business interaction state
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)
  const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    q: searchParams.get('search') || searchParams.get('name') || searchParams.get('q') || '',
    category: searchParams.get('categoryId') ? [searchParams.get('categoryId')!] : [],
    priceMin: searchParams.get('priceFrom') ? Number(searchParams.get('priceFrom')) : undefined,
    priceMax: searchParams.get('priceTo') ? Number(searchParams.get('priceTo')) : undefined,
    rating: Number(searchParams.get('rating') || 0),
    sort: (searchParams.get('sort') as string) || 'recommended',
    available: true,
    timeOfDay: []
  })

  // Fetch data
  const fetchData = async (applyFilters = false) => {
    try {
      if (applyFilters) {
        setFiltersLoading(true)
      } else {
        setLoading(true)
      }

      // Fetch businesses and categories
      const [businessesResponse, categoriesResponse] = await Promise.all([
        fetchBusinessesMock({
          country: selectedCountry || undefined,
          city: selectedCity || undefined,
          region: selectedRegion || undefined,
          search: filters.q || undefined,
          category: filters.category[0] || undefined
        }),
        CategoriesService.getCategories()
      ])

      setBusinesses(businessesResponse)
      setCategoriesData(categoriesResponse.data || [])
      setError(null)
    } catch (err) {
      console.error('Fetch failed:', err)
      setError('Failed to load businesses')
    } finally {
      setLoading(false)
      setFiltersLoading(false)
    }
  }

  // Fetch initial data
  useEffect(() => {
    fetchData()
  }, [])

  // Update URL with current filters
  const updateUrl = () => {
    const sp = new URLSearchParams()
    if (filters.q) sp.set('search', filters.q)
    if (selectedCountry) sp.set('country', selectedCountry)
    if (selectedCity) sp.set('city', selectedCity)
    if (selectedRegion) sp.set('region', selectedRegion)
    if (filters.category[0]) sp.set('categoryId', filters.category[0])
    if (filters.priceMin !== undefined && filters.priceMin > 0) sp.set('priceFrom', String(filters.priceMin))
    if (filters.priceMax !== undefined && filters.priceMax > 0) sp.set('priceTo', String(filters.priceMax))
    if (filters.rating > 0) sp.set('rating', String(filters.rating))
    if (filters.sort && filters.sort !== 'recommended') sp.set('sort', filters.sort)
    if (currentPage > 1) sp.set('page', String(currentPage))
    if (viewMode !== 'list') sp.set('view', viewMode)

    router.push(`/${params?.lang}/search?${sp.toString()}`)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1)
    updateUrl()
    fetchData(true)
  }

  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      q: '',
      category: [],
      priceMin: undefined,
      priceMax: undefined,
      rating: 0,
      sort: 'recommended',
      available: true,
      timeOfDay: []
    }
    setFilters(resetFilters)
    setSelectedCountry('')
    setSelectedCity('')
    setSelectedRegion('')
    setCurrentPage(1)
    setViewMode('list')
    router.push(`/${params?.lang}/search`)
    fetchData(true)
  }

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    const sp = new URLSearchParams(searchParams.toString())
    if (view !== 'list') {
      sp.set('view', view)
    } else {
      sp.delete('view')
    }
    router.push(`/${params?.lang}/search?${sp.toString()}`)
  }

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country)
    setSelectedCity('') // Reset city when country changes
    setSelectedRegion('') // Reset region when country changes
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    setSelectedRegion('') // Reset region when city changes
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
  }

  const handleBusinessClick = (businessId: string | null) => {
    // Just highlight the business, don't navigate
    if (businessId === null) {
      setSelectedBusinessId(null)
    } else {
      setSelectedBusinessId(businessId === selectedBusinessId ? null : businessId)
    }
  }

  const handleBusinessHover = (businessId: string | null) => {
    setHoveredBusinessId(businessId)
  }

  const handleBookNow = (businessId: string) => {
    // Navigate to business detail page with booking intent
    router.push(`/${params?.lang}/business/${businessId}#book`)
  }

  // Filter options
  const filterOptions: FilterOptions = {
    categories: categoriesData.map(cat => ({
      id: cat.name.toLowerCase().replace(/\s+/g, '-'),
      name: cat.name,
      count: undefined
    })),
    priceRange: { min: 0, max: 1000 },
    sortOptions: [
      { value: 'recommended', label: 'Recommended' },
      { value: 'rating:desc', label: 'Rating: High to Low' },
      { value: 'price:asc', label: 'Price: Low to High' },
      { value: 'price:desc', label: 'Price: High to Low' },
      { value: 'name:asc', label: 'Name: A to Z' }
    ],
    timeSlots: [
      { value: 'morning', label: 'Morning (6AM - 12PM)' },
      { value: 'afternoon', label: 'Afternoon (12PM - 6PM)' },
      { value: 'evening', label: 'Evening (6PM - 12AM)' }
    ],
    durationOptions: [
      { value: 30, label: '30 minutes' },
      { value: 60, label: '1 hour' },
      { value: 90, label: '1.5 hours' },
      { value: 120, label: '2 hours' },
      { value: 180, label: '3+ hours' }
    ]
  }

  // Paginated businesses
  const paginatedBusinesses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return businesses.slice(start, end)
  }, [businesses, currentPage, itemsPerPage])

  const totalPages = Math.ceil(businesses.length / itemsPerPage)

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/10 to-cyan-50/5 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900'>
        <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-teal-100/50 dark:border-gray-700/50 sticky top-0 z-40'>
          <div className='mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4'>
            <div className='flex gap-3'>
              <div className='flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
              <div className='w-32 h-12 bg-teal-200 dark:bg-teal-700 rounded-lg animate-pulse'></div>
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6'>
          <SearchResultsSkeleton items={8} />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/10 to-cyan-50/5 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900'>
      {/* Top search bar */}
      <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-teal-100/50 dark:border-gray-700/50 sticky top-0 z-40'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <SearchInput
              value={filters.q}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              placeholderProps={{ plainText: 'Search businesses or services...' }}
              className='flex-1 dark:bg-gray-700/50 dark:text-white dark:border-gray-600'
            />
            <Button
              onClick={handleApplyFilters}
              buttonText={{
                plainText: filtersLoading ? '' : 'Search',
                startIcon: filtersLoading ? <ButtonLoader size={16} /> : undefined
              }}
              disabled={filtersLoading}
              className='bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6'>
          {/* Sidebar Filters */}
          <aside className='space-y-4'>
            {/* Location Filters */}
            <div className='bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700'>
              <h3 className='font-semibold text-gray-900 dark:text-white mb-4'>Location</h3>
              <LocationFilters
                selectedCountry={selectedCountry}
                selectedCity={selectedCity}
                selectedRegion={selectedRegion}
                onCountryChange={handleCountryChange}
                onCityChange={handleCityChange}
                onRegionChange={handleRegionChange}
              />
            </div>

            {/* Other Filters */}
            <SearchFilters
              filters={filters}
              options={filterOptions}
              onFiltersChange={setFilters}
              onApplyFilters={handleApplyFilters}
              onResetFilters={handleResetFilters}
              loading={filtersLoading}
            />
          </aside>

          {/* Main Content */}
          <main className='relative'>
            {filtersLoading && (
              <div className='absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl'>
                <div className='flex flex-col items-center space-y-3'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600'></div>
                  <p className='text-gray-600 dark:text-gray-300 text-sm font-medium'>Searching...</p>
                </div>
              </div>
            )}

            {/* Header with view toggle */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
              <PaginationInfo
                page={currentPage}
                limit={itemsPerPage}
                total={businesses.length}
                totalPages={totalPages}
                hasNext={currentPage < totalPages}
                hasPrev={currentPage > 1}
              />
              <ViewToggle currentView={viewMode} onViewChange={handleViewChange} />
            </div>

            {/* Content based on view mode */}
            {viewMode === 'list' ? (
              <>
                <BusinessList
                  businesses={paginatedBusinesses}
                  selectedBusinessId={selectedBusinessId}
                  hoveredBusinessId={hoveredBusinessId}
                  onBusinessClick={handleBusinessClick}
                  onBusinessHover={handleBusinessHover}
                  onBookNow={handleBookNow}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='mt-8 flex justify-center'>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      disabled={filtersLoading}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className='space-y-4'>
                {/* Desktop: Side by side */}
                <div className='hidden lg:grid lg:grid-cols-2 gap-4 h-[calc(100vh-200px)]'>
                  <div className='overflow-y-auto'>
                    <BusinessList
                      businesses={businesses}
                      selectedBusinessId={selectedBusinessId}
                      hoveredBusinessId={hoveredBusinessId}
                      onBusinessClick={handleBusinessClick}
                      onBusinessHover={handleBusinessHover}
                      onBookNow={handleBookNow}
                    />
                  </div>
                  <div className='sticky top-0 h-full'>
                    <BusinessMap
                      businesses={businesses}
                      selectedBusinessId={selectedBusinessId}
                      hoveredBusinessId={hoveredBusinessId}
                      onMarkerClick={handleBusinessClick}
                      onMarkerHover={handleBusinessHover}
                      onBookNow={handleBookNow}
                      className='h-full'
                    />
                  </div>
                </div>

                {/* Mobile: Stacked with toggle */}
                <div className='lg:hidden space-y-4'>
                  <div className='flex justify-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-lg'>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'list'
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        viewMode === 'map'
                          ? 'bg-teal-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Map
                    </button>
                  </div>

                  {viewMode === 'map' ? (
                    <BusinessMap
                      businesses={businesses}
                      selectedBusinessId={selectedBusinessId}
                      hoveredBusinessId={hoveredBusinessId}
                      onMarkerClick={handleBusinessClick}
                      onMarkerHover={handleBusinessHover}
                      onBookNow={handleBookNow}
                      className='h-[600px]'
                    />
                  ) : (
                    <BusinessList
                      businesses={paginatedBusinesses}
                      selectedBusinessId={selectedBusinessId}
                      hoveredBusinessId={hoveredBusinessId}
                      onBusinessClick={handleBusinessClick}
                      onBusinessHover={handleBusinessHover}
                      onBookNow={handleBookNow}
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
