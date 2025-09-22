'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { SearchInput } from '@/bookly/components/atoms/search-input/search-input.component'
import { Button } from '@/bookly/components/molecules'
import { BusinessCard } from '@/bookly/components/molecules/business-card/business-card.component'
import { BusinessAvatar } from '@/bookly/components/atoms/business-avatar/business-avatar.component'
import { BranchDetailsModal } from '@/bookly/components/molecules/branch-details-modal/branch-details-modal.component'
import { SearchFilters, type FilterState, type FilterOptions } from '@/bookly/components/organisms/search-filters/search-filters.component'
import { Pagination, PaginationInfo } from '@/bookly/components/ui/pagination'

// API Imports
import { BusinessService, CategoriesService } from '@/lib/api'
import type { Business, Category } from '@/lib/api'
// Component Imports
import { SearchResultsSkeleton, ButtonLoader } from '@/components/LoadingStates'

// Fallback data imports
import { mockServices as services, categories } from '@/bookly/data/mock-data'

type SortKey = 'recommended' | 'rating_desc' | 'price_asc' | 'price_desc'
type TimeOfDay = 'morning' | 'afternoon' | 'evening'

// Mock business data generator
const generateMockBusinesses = (): Business[] => {
  return [
    {
      id: 'business-1',
      name: 'Elegant Beauty Salon',
      email: 'info@elegantbeauty.com',
      description: 'Premium beauty salon offering hair styling, nail care, and spa treatments',
      approved: true,
      rating: 4.8,
      socialLinks: [
        { platform: 'Instagram', url: 'https://instagram.com/elegantbeauty' },
        { platform: 'Facebook', url: 'https://facebook.com/elegantbeauty' }
      ],
      services: [
        {
          id: 'service-1',
          name: 'Hair Cut & Style',
          description: 'Professional haircut and styling service',
          location: 'Downtown',
          price: 65,
          duration: 60,
          businessId: 'business-1',
          categories: [{ id: 'cat-1', name: 'Hair Care', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'service-2',
          name: 'Hair Color',
          description: 'Full hair coloring service with premium products',
          location: 'Downtown',
          price: 120,
          duration: 120,
          businessId: 'business-1',
          categories: [{ id: 'cat-1', name: 'Hair Care', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'service-3',
          name: 'Manicure',
          description: 'Classic manicure with nail polish',
          location: 'Downtown',
          price: 35,
          duration: 45,
          businessId: 'business-1',
          categories: [{ id: 'cat-2', name: 'Nail Care', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        }
      ]
    },
    {
      id: 'business-2',
      name: 'Wellness Spa & Massage',
      email: 'contact@wellnessspa.com',
      description: 'Relaxing spa treatments and therapeutic massage services',
      approved: true,
      rating: 4.6,
      socialLinks: [
        { platform: 'Instagram', url: 'https://instagram.com/wellnessspa' }
      ],
      services: [
        {
          id: 'service-4',
          name: 'Deep Tissue Massage',
          description: '60-minute therapeutic deep tissue massage',
          location: 'Midtown',
          price: 90,
          duration: 60,
          businessId: 'business-2',
          categories: [{ id: 'cat-3', name: 'Spa & Wellness', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'service-5',
          name: 'Facial Treatment',
          description: 'Rejuvenating facial with organic products',
          location: 'Midtown',
          price: 75,
          duration: 75,
          businessId: 'business-2',
          categories: [{ id: 'cat-3', name: 'Spa & Wellness', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        }
      ]
    },
    {
      id: 'business-3',
      name: 'Fit Life Gym',
      email: 'hello@fitlifegym.com',
      description: 'Modern fitness center with personal training and group classes',
      approved: true,
      rating: 4.4,
      socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/fitlifegym' },
        { platform: 'Instagram', url: 'https://instagram.com/fitlifegym' }
      ],
      services: [
        {
          id: 'service-6',
          name: 'Personal Training Session',
          description: 'One-on-one personal training session',
          location: 'Uptown',
          price: 80,
          duration: 60,
          businessId: 'business-3',
          categories: [{ id: 'cat-4', name: 'Fitness', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'service-7',
          name: 'Group Fitness Class',
          description: 'High-energy group fitness class',
          location: 'Uptown',
          price: 25,
          duration: 45,
          businessId: 'business-3',
          categories: [{ id: 'cat-4', name: 'Fitness', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        }
      ]
    },
    {
      id: 'business-4',
      name: 'The Barber Shop',
      email: 'info@thebarbershop.com',
      description: 'Traditional barbershop with modern styling techniques',
      approved: true,
      rating: 4.7,
      socialLinks: [
        { platform: 'Instagram', url: 'https://instagram.com/thebarbershop' }
      ],
      services: [
        {
          id: 'service-8',
          name: 'Classic Haircut',
          description: 'Traditional mens haircut and styling',
          location: 'Downtown',
          price: 45,
          duration: 30,
          businessId: 'business-4',
          categories: [{ id: 'cat-1', name: 'Hair Care', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'service-9',
          name: 'Beard Trim',
          description: 'Professional beard trimming and shaping',
          location: 'Downtown',
          price: 25,
          duration: 20,
          businessId: 'business-4',
          categories: [{ id: 'cat-1', name: 'Hair Care', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        }
      ]
    },
    {
      id: 'business-5',
      name: 'Dental Care Plus',
      email: 'appointments@dentalcareplus.com',
      description: 'Comprehensive dental care with modern technology',
      approved: true,
      rating: 4.9,
      socialLinks: [
        { platform: 'Facebook', url: 'https://facebook.com/dentalcareplus' }
      ],
      services: [
        {
          id: 'service-10',
          name: 'Dental Cleaning',
          description: 'Professional dental cleaning and examination',
          location: 'Medical District',
          price: 150,
          duration: 60,
          businessId: 'business-5',
          categories: [{ id: 'cat-5', name: 'Healthcare', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        },
        {
          id: 'service-11',
          name: 'Teeth Whitening',
          description: 'Professional teeth whitening treatment',
          location: 'Medical District',
          price: 300,
          duration: 90,
          businessId: 'business-5',
          categories: [{ id: 'cat-5', name: 'Healthcare', createdAt: '', updatedAt: '' }],
          createdAt: '',
          updatedAt: ''
        }
      ]
    }
  ]
}

interface SearchResponse {
  data: Business[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export default function SearchPage() {
  const router = useRouter()
  const params = useParams<{ lang: string }>()
  const searchParams = useSearchParams()

  const [businessesData, setBusinessesData] = useState<Business[]>([])
  const [categoriesData, setCategoriesData] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtersLoading, setFiltersLoading] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalResults, setTotalResults] = useState(0)

  // Filter state using the new FilterState interface
  const [filters, setFilters] = useState<FilterState>({
    q: searchParams.get('search') || searchParams.get('name') || searchParams.get('q') || '',
    location: searchParams.get('loc') || '',
    category: searchParams.get('categoryId') ? [searchParams.get('categoryId')!] : [],
    priceMin: searchParams.get('priceFrom') ? Number(searchParams.get('priceFrom')) : undefined,
    priceMax: searchParams.get('priceTo') ? Number(searchParams.get('priceTo')) : undefined,
    rating: Number(searchParams.get('rating') || 0),
    sort: (searchParams.get('sort') as string) || 'recommended',
    available: true,
    timeOfDay: []
  })

  // Update current page from URL
  useEffect(() => {
    const pageParam = searchParams.get('page')
    if (pageParam) {
      setCurrentPage(Number(pageParam))
    }
  }, [searchParams])

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedBranch, setSelectedBranch] = useState<any>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [branchModalOpen, setBranchModalOpen] = useState(false)

  // Convert category names to IDs for filtering
  const selectedCategoryIds = useMemo(() => {
    return filters.category
      .map(categoryName => categoriesData.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === categoryName)?.id)
      .filter(Boolean) as string[]
  }, [filters.category, categoriesData])

  // Fetch data with filters and pagination
  const fetchData = async (applyFilters = false) => {
    try {
      if (applyFilters) {
        setFiltersLoading(true)
      } else {
        setLoading(true)
      }

      // Build query parameters for Business API according to spec
      const queryParams: any = {
        page: currentPage,
        pageSize: itemsPerPage
      }

      // Add optional parameters only if they have values
      if (filters.q) {
        // Use 'search' parameter for general search term as per API spec
        queryParams.search = filters.q
      }
      if (selectedCategoryIds.length > 0) queryParams.categoryId = selectedCategoryIds[0] // API supports single categoryId

      // Add price filters only if they have meaningful values
      if (filters.priceMin !== undefined && filters.priceMin > 0) {
        queryParams.priceFrom = filters.priceMin
      }
      if (filters.priceMax !== undefined && filters.priceMax > 0) {
        queryParams.priceTo = filters.priceMax
      }

      console.log('🔍 Search page - Building query params:', {
        filters: filters,
        selectedCategoryIds,
        queryParams
      })

      const [businessResponse, categoriesResponse] = await Promise.all([
        BusinessService.getApprovedBusinesses(queryParams),
        CategoriesService.getCategories()
      ])

      if (businessResponse.error) throw new Error(businessResponse.error)
      if (categoriesResponse.error) throw new Error(categoriesResponse.error)

      // Handle business response
      const businessData = businessResponse.data || []

      // If API returns empty results, use mock data
      if (businessData.length === 0) {
        console.log('📋 API returned empty results, using mock businesses')
        const mockBusinesses = generateMockBusinesses()
        setBusinessesData(mockBusinesses)
        setTotalResults(mockBusinesses.length)
      } else {
        // API returns array of businesses directly
        setBusinessesData(businessData)
        setTotalResults(businessData.length) // TODO: API should return total count
      }

      setCategoriesData(categoriesResponse.data || [])

      setError(null)
    } catch (err) {
      console.warn('API fetch failed, using fallback data:', err)
      // Use fallback mock business data when API fails
      const mockBusinesses = generateMockBusinesses()
      setBusinessesData(mockBusinesses)
      setCategoriesData(categories)
      setTotalResults(mockBusinesses.length)
      setError(null) // Don't show error since we have fallback data
    } finally {
      setLoading(false)
      setFiltersLoading(false)
    }
  }

  // Fetch initial data
  useEffect(() => {
    fetchData()
  }, [currentPage])

  // Note: Removed automatic filtering on filter changes
  // Users must click "Search" or "Apply Filters" to trigger search

  const applyToUrl = () => {
    const sp = new URLSearchParams()
    if (filters.q) sp.set('search', filters.q) // Use 'search' parameter as per API spec
    // if (filters.location) sp.set('loc', filters.location) // Location temporarily disabled
    if (filters.priceMin !== undefined && filters.priceMin > 0) sp.set('priceFrom', String(filters.priceMin))
    if (filters.priceMax !== undefined && filters.priceMax > 0) sp.set('priceTo', String(filters.priceMax))
    if (selectedCategoryIds.length > 0) sp.set('categoryId', selectedCategoryIds[0])
    if (filters.rating > 0) sp.set('rating', String(filters.rating))
    if (filters.sort && filters.sort !== 'recommended') sp.set('sort', filters.sort)
    if (currentPage > 1) sp.set('page', String(currentPage))
    router.push(`/${params?.lang}/search?` + sp.toString())
  }

  // Filter options for the SearchFilters component
  const filterOptions: FilterOptions = {
    categories: categoriesData.map(cat => ({
      id: cat.name.toLowerCase().replace(/\s+/g, '-'),
      name: cat.name,
      count: undefined // TODO: Add count from API
    })),
    // Location filtering temporarily disabled
    // locations: [
    //   { value: 'london', label: 'London', count: undefined },
    //   { value: 'manchester', label: 'Manchester', count: undefined },
    //   { value: 'birmingham', label: 'Birmingham', count: undefined },
    //   { value: 'glasgow', label: 'Glasgow', count: undefined }
    // ],
    locations: [], // Empty array for now
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

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleApplyFilters = () => {
    setCurrentPage(1) // Reset to first page when applying new filters
    applyToUrl()
    fetchData(true)
  }

  const handleResetFilters = () => {
    const resetFilters: FilterState = {
      q: '',
      location: '',
      category: [],
      priceMin: undefined,
      priceMax: undefined,
      rating: 0,
      sort: 'recommended',
      available: true,
      timeOfDay: []
    }
    setFilters(resetFilters)
    setCurrentPage(1)
    router.push(`/${params?.lang}/search`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    applyToUrl()
  }

  // Use businesses data directly since API handles filtering
  const filteredBusinesses = useMemo(() => {
    return businessesData
  }, [businessesData])

  const totalPages = Math.ceil(totalResults / itemsPerPage)

  if (loading) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/10 to-cyan-50/5 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900'>
        {/* Top search bar - skeleton */}
        <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-teal-100/50 dark:border-gray-700/50 sticky top-0 z-40'>
          <div className='mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4'>
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='flex-1 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse'></div>
              <div className='w-32 h-12 bg-teal-200 dark:bg-teal-700 rounded-lg animate-pulse'></div>
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 sm:gap-6'>
          {/* Filters skeleton */}
          <div className='lg:sticky lg:top-24 space-y-4'>
            <div className='h-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'>
              <div className='space-y-4'>
                <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse'></div>
                <div className='space-y-2'>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className='h-4 bg-gray-100 dark:bg-gray-600 rounded animate-pulse'></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results skeleton */}
          <section>
            <SearchResultsSkeleton items={8} />
          </section>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Something went wrong</h1>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>{error}</p>
          <Button buttonText={{ plainText: 'Try Again' }} onClick={() => window.location.reload()} />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-teal-50/10 to-cyan-50/5 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900'>
      {/* Top search bar - mobile optimized */}
      <div className='bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-teal-100/50 dark:border-gray-700/50 sticky top-0 z-40'>
        <div className='mx-auto max-w-6xl px-4 sm:px-6 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row gap-3'>
            <SearchInput
              value={filters.q}
              onChange={e => setFilters({ ...filters, q: e.target.value })}
              placeholderProps={{ plainText: 'Search businesses or services (e.g. haircut, spa, dental)' }}
              className='flex-1 text-sm sm:text-base dark:bg-gray-700/50 dark:text-white dark:border-gray-600'
            />
            {/* Location search temporarily disabled */}
            {/* <SearchInput
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
              placeholderProps={{ plainText: 'Location' }}
              className='flex-1 text-sm sm:text-base'
            /> */}
            <Button
              onClick={handleApplyFilters}
              buttonText={{
                plainText: filtersLoading ? '' : 'Search',
                startIcon: filtersLoading ? <ButtonLoader size={16} /> : undefined
              }}
              disabled={filtersLoading}
              className='bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold px-6 py-2 sm:py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none'
            />
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4 sm:gap-6'>
        {/* Enhanced Filters */}
        <SearchFilters
          filters={filters}
          options={filterOptions}
          onFiltersChange={handleFiltersChange}
          onApplyFilters={handleApplyFilters}
          onResetFilters={handleResetFilters}
          loading={filtersLoading}
          className='lg:sticky lg:top-24'
        />

        {/* Results - mobile optimized */}
        <section className="relative">
          {filtersLoading && (
            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Searching...</p>
              </div>
            </div>
          )}

          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6'>
            <PaginationInfo
              page={currentPage}
              limit={itemsPerPage}
              total={totalResults}
              totalPages={totalPages}
              hasNext={currentPage < totalPages}
              hasPrev={currentPage > 1}
            />
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm rounded-lg flex items-center gap-2 transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700 hover:border-teal-300 dark:hover:border-gray-500'
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
                    : 'bg-white dark:bg-gray-800 border border-teal-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-gray-700 hover:border-teal-300 dark:hover:border-gray-500'
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

          {filteredBusinesses.length === 0 ? (
            <div className='text-center py-12'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>No businesses found</h3>
              <p className='text-gray-600 dark:text-gray-300'>Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className='space-y-4 sm:space-y-6'>
              {filteredBusinesses.map((business, index) => {
                const minPrice = business.services && business.services.length > 0
                  ? Math.min(...business.services.map(s => s.price))
                  : null
                const serviceCount = business.services?.length || 0

                return (
                  <div
                    key={business.id}
                    className='group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-teal-100/50 dark:border-gray-700/50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-500 hover:scale-[1.01] animate-in fade-in slide-in-from-bottom-4 duration-500'
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div
                      className='cursor-pointer'
                      onClick={() =>
                        router.push(
                          `/${params?.lang}/business/${business.id}`
                        )
                      }
                    >
                      <div className='flex flex-col sm:flex-row gap-4 p-4 sm:p-6'>
                        <div className='w-full sm:w-32 h-48 sm:h-24 flex-shrink-0'>
                          <div className='w-full h-full bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-800/50 dark:to-cyan-800/50 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center'>
                            <div className='text-center'>
                              <div className='text-lg font-bold text-teal-600 dark:text-teal-300'>{business.name}</div>
                              <div className='text-xs text-teal-500 dark:text-teal-400'>★ {business.rating || 0}/5</div>
                              {minPrice && (
                                <div className='text-xs text-teal-500 dark:text-teal-400'>From ${minPrice}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
                            <div className='flex-1'>
                              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{business.name}</h3>
                              <div className='text-sm text-gray-600 dark:text-gray-300 mb-2'>
                                {serviceCount > 0 ? `${serviceCount} services available` : 'Business'}
                              </div>

                              <div className='flex items-center gap-2 mb-2'>
                                <div className='flex items-center'>
                                  <span className='text-sm font-medium text-teal-600 dark:text-teal-400'>★ {business.rating || 0}/5</span>
                                  {business.email && (
                                    <>
                                      <span className='text-sm text-gray-500 dark:text-gray-400 mx-2'>•</span>
                                      <span className='text-sm text-gray-500 dark:text-gray-400'>{business.email}</span>
                                    </>
                                  )}
                                  {minPrice && (
                                    <>
                                      <span className='text-sm text-gray-500 dark:text-gray-400 mx-2'>•</span>
                                      <span className='text-sm font-medium text-teal-600 dark:text-teal-400'>From ${minPrice}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3'>{business.description}</p>

                              {/* Display services */}
                              {business.services && business.services.length > 0 && (
                                <div className='mt-3'>
                                  <div className='text-xs text-gray-500 dark:text-gray-400 mb-2'>Popular Services:</div>
                                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                                    {business.services.slice(0, 4).map(service => (
                                      <div
                                        key={service.id}
                                        className='bg-gray-50 dark:bg-gray-700 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'
                                      >
                                        <div className='flex items-center justify-between'>
                                          <span className='text-sm font-medium text-gray-900 dark:text-white'>{service.name}</span>
                                          <span className='text-sm font-bold text-teal-600 dark:text-teal-400'>${service.price}</span>
                                        </div>
                                        <div className='text-xs text-gray-500 dark:text-gray-400'>{service.duration}min</div>
                                      </div>
                                    ))}
                                  </div>
                                  {business.services.length > 4 && (
                                    <div className='text-xs text-gray-500 dark:text-gray-400 mt-2'>
                                      +{business.services.length - 4} more services
                                    </div>
                                  )}
                                </div>
                              )}

                              {business.socialLinks && business.socialLinks.length > 0 && (
                                <div className='mt-3'>
                                  <div className='text-xs text-gray-500 dark:text-gray-400 mb-1'>Social Links:</div>
                                  <div className='flex flex-wrap gap-1'>
                                    {business.socialLinks.map((link, linkIndex) => (
                                      <span
                                        key={linkIndex}
                                        className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 dark:bg-teal-800/50 text-teal-800 dark:text-teal-200'
                                      >
                                        {link.platform}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className='flex sm:flex-col gap-2 sm:ml-4'>
                              <button className='flex-1 sm:flex-none bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4 py-2 sm:py-3 rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200'>
                                View Business
                              </button>
                              {serviceCount > 0 && (
                                <button
                                  onClick={e => {
                                    e.stopPropagation()
                                    // Navigate to services or show services modal
                                    router.push(`/${params?.lang}/business/${business.id}#services`)
                                  }}
                                  className='flex-1 sm:flex-none bg-white dark:bg-gray-700 border border-teal-200 dark:border-teal-600/50 text-teal-600 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-800/30 hover:border-teal-300 dark:hover:border-teal-500 px-4 py-2 sm:py-3 rounded-lg text-sm font-semibold transition-all duration-200'
                                >
                                  <span className='hidden sm:inline'>View Services ({serviceCount})</span>
                                  <span className='sm:hidden'>Services ({serviceCount})</span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-8 flex justify-center'>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                disabled={filtersLoading}
              />
            </div>
          )}
        </section>
      </div>

      {/* Branch Details Modal - Removed since we're showing businesses now */}
    </div>
  )
}
