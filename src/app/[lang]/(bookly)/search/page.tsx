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
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null)
  const [hoveredBranchId, setHoveredBranchId] = useState<string | null>(null)
  const [selectionSource, setSelectionSource] = useState<'map' | 'list' | null>(null)

  // Branch selection modal state
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [branchModalBusinessId, setBranchModalBusinessId] = useState<string | null>(null)

  // Mobile filter drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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

  const handleBusinessClick = (businessId: string | null, source: 'map' | 'list' = 'list') => {
    if (businessId === null) {
      setSelectedBusinessId(null)
      setSelectedBranchId(null)
      setSelectionSource(null)
    } else {
      // If clicking from list, show branch selection modal
      if (source === 'list') {
        setBranchModalBusinessId(businessId)
        setShowBranchModal(true)
      } else {
        // If clicking from map, just select the business
        setSelectedBusinessId(businessId === selectedBusinessId ? null : businessId)
        setSelectionSource(source)
      }
    }
  }

  const handleBranchClick = (branchId: string) => {
    const business = businesses.find(b => b.branches.some(br => br.id === branchId))
    if (business) {
      setSelectedBusinessId(business.id)
      setSelectedBranchId(branchId)
      setSelectionSource('list')
      setShowBranchModal(false)
    }
  }

  const handleMarkerClick = (businessId: string | null, branchId?: string) => {
    if (businessId === null) {
      setSelectedBusinessId(null)
      setSelectedBranchId(null)
      setSelectionSource(null)
    } else {
      setSelectedBusinessId(businessId)
      setSelectedBranchId(branchId || null)
      setSelectionSource('map')
    }
  }

  const handleBusinessHover = (businessId: string | null) => {
    setHoveredBusinessId(businessId)
    setHoveredBranchId(null)
  }

  const handleMarkerHover = (businessId: string | null, branchId?: string) => {
    setHoveredBusinessId(businessId)
    setHoveredBranchId(branchId || null)
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
      <div className='min-h-screen w-full bg-gray-50 dark:bg-gray-900'>
        <div className='bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-primary-100/30 dark:border-gray-700/30 sticky top-0 z-40'>
          <div className='mx-auto max-w-7xl px-3 sm:px-4 py-2 sm:py-3'>
            <div className='flex gap-2'>
              <div className='flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
              <div className='w-24 h-10 bg-primary-200 dark:bg-primary-900 rounded-lg animate-pulse'></div>
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-7xl px-3 sm:px-4 py-3 sm:py-4'>
          <SearchResultsSkeleton items={8} />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-gray-50 dark:bg-gray-900'>
      {/* Top search bar - Full width stretch */}
      <div className='bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-b border-primary-100/30 dark:border-gray-700/30 sticky top-0 z-40'>
        <div className='w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <SearchInput
              value={filters.q}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              placeholderProps={{ plainText: 'Search businesses or services...' }}
              className='flex-1 h-12 text-base dark:bg-gray-700/50 dark:text-white dark:border-gray-600'
            />
            <Button
              onClick={handleApplyFilters}
              buttonText={{
                plainText: filtersLoading ? '' : 'Search',
                startIcon: filtersLoading ? <ButtonLoader size={16} /> : undefined
              }}
              disabled={filtersLoading}
              className='bg-primary-700 hover:bg-primary-800 text-white font-semibold px-8 py-3 h-12 text-base rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>
        </div>
      </div>

      <div className='w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
        <div className='grid grid-cols-1 lg:grid-cols-[300px,1fr] xl:grid-cols-[320px,1fr] gap-4 lg:gap-6'>
          {/* Sidebar Filters - Hidden on mobile, show as drawer or modal */}
          <aside className='hidden lg:block space-y-4'>
            {/* Location Filters */}
            <div className='bg-white/90 dark:bg-gray-800/90 rounded-xl p-4 shadow-sm border border-gray-200/50 dark:border-gray-700/50'>
              <h3 className='font-semibold text-base text-gray-900 dark:text-white mb-3'>Location</h3>
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
              <div className='absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg'>
                <div className='flex flex-col items-center space-y-2'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary-800'></div>
                  <p className='text-gray-600 dark:text-gray-300 text-xs font-medium'>Searching...</p>
                </div>
              </div>
            )}

            {/* Header with view toggle */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4'>
              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className='lg:hidden flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors touch-manipulation'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                  />
                </svg>
                Filters
              </button>
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
                  selectionSource={selectionSource}
                  onBusinessClick={handleBusinessClick}
                  onBusinessHover={handleBusinessHover}
                  onBookNow={handleBookNow}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='mt-6 flex justify-center'>
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
                      selectionSource={selectionSource}
                      onBusinessClick={handleBusinessClick}
                      onBusinessHover={handleBusinessHover}
                      onBookNow={handleBookNow}
                    />
                  </div>
                  <div className='sticky top-0 h-full'>
                    <BusinessMap
                      businesses={businesses}
                      selectedBusinessId={selectedBusinessId}
                      selectedBranchId={selectedBranchId}
                      hoveredBusinessId={hoveredBusinessId}
                      hoveredBranchId={hoveredBranchId}
                      onMarkerClick={handleMarkerClick}
                      onMarkerHover={handleMarkerHover}
                      onBookNow={handleBookNow}
                      className='h-full'
                    />
                  </div>
                </div>

                {/* Mobile: Stacked with toggle */}
                <div className='lg:hidden space-y-4'>
                  <div className='flex justify-center gap-2 bg-white/90 dark:bg-gray-800/90 p-1.5 rounded-xl'>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                        viewMode === 'list'
                          ? 'bg-primary-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      List
                    </button>
                    <button
                      onClick={() => setViewMode('map')}
                      className={`flex-1 px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                        viewMode === 'map'
                          ? 'bg-primary-700 text-white'
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
                      selectedBranchId={selectedBranchId}
                      hoveredBusinessId={hoveredBusinessId}
                      hoveredBranchId={hoveredBranchId}
                      onMarkerClick={handleMarkerClick}
                      onMarkerHover={handleMarkerHover}
                      onBookNow={handleBookNow}
                      className='h-[600px]'
                    />
                  ) : (
                    <BusinessList
                      businesses={paginatedBusinesses}
                      selectedBusinessId={selectedBusinessId}
                      hoveredBusinessId={hoveredBusinessId}
                      selectionSource={selectionSource}
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

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          {/* Backdrop */}
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={() => setShowMobileFilters(false)} />

          {/* Drawer - Full width on mobile, larger on tablet */}
          <div className='absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto animate-slide-in-right'>
            {/* Header */}
            <div className='sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center justify-between z-10'>
              <h2 className='text-lg font-bold text-gray-900 dark:text-white'>Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors touch-manipulation'
              >
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                </svg>
              </button>
            </div>

            {/* Filter Content */}
            <div className='p-4 space-y-4'>
              {/* Location Filters */}
              <div className='bg-gray-50 dark:bg-gray-900 rounded-xl p-4'>
                <h3 className='font-semibold text-base text-gray-900 dark:text-white mb-4'>Location</h3>
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
                onApplyFilters={() => {
                  handleApplyFilters()
                  setShowMobileFilters(false)
                }}
                onResetFilters={() => {
                  handleResetFilters()
                  setShowMobileFilters(false)
                }}
                loading={filtersLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Branch Selection Modal */}
      {showBranchModal && branchModalBusinessId && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-auto max-h-[85vh] overflow-y-auto'>
            <div className='p-4 sm:p-5'>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>Select a Branch</h3>
                <button
                  onClick={() => setShowBranchModal(false)}
                  className='p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors touch-manipulation'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                  </svg>
                </button>
              </div>

              {businesses
                .find(b => b.id === branchModalBusinessId)
                ?.branches.map((branch, index) => (
                  <button
                    key={branch.id}
                    onClick={() => handleBranchClick(branch.id)}
                    className='w-full text-left p-2.5 mb-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-700 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all touch-manipulation'
                  >
                    <div className='flex items-start gap-2.5'>
                      <div className='flex-shrink-0 w-7 h-7 bg-primary-100 dark:bg-primary-900/50 rounded-full flex items-center justify-center text-primary-800 dark:text-sage-400 font-semibold text-xs'>
                        {index + 1}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-sm text-gray-900 dark:text-white mb-0.5'>
                          {branch.branchName}
                        </h4>
                        <div className='flex items-start gap-1 text-xs text-gray-600 dark:text-gray-400'>
                          <svg
                            className='w-3 h-3 flex-shrink-0 mt-0.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
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
                          <span className='break-words line-clamp-2'>{branch.address}</span>
                        </div>
                        {branch.phone && (
                          <div className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-0.5'>
                            <svg
                              className='w-3 h-3 flex-shrink-0'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                              />
                            </svg>
                            <span>{branch.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
