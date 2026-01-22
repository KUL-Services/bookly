'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MOCK_BUSINESSES, BusinessLocation } from '@/mocks/businesses'
import { BusinessCard } from '@/bookly/components/marketplace/business-card'
import { SearchMap } from '@/bookly/components/marketplace/search-map'
import { Button } from '@/bookly/components/ui/button'
import { Input } from '@/bookly/components/ui/input'
import { Map, Filter, ChevronDown, Search, MapPin, Calendar, LayoutList } from 'lucide-react'
import { SearchFilters, FilterState } from '@/bookly/components/organisms/search-filters/search-filters.component'
export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const initialCategory = searchParams.get('category')
  const initialLoc = searchParams.get('loc') || ''

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [view, setView] = useState<'list' | 'map'>('list')

  // Filter Options
  const filterOptions = {
    categories: [
      { id: 'hair', name: 'Hair', count: 12 },
      { id: 'nails', name: 'Nails', count: 8 },
      { id: 'barbers', name: 'Barbers', count: 5 },
      { id: 'face', name: 'Face', count: 6 },
      { id: 'massage', name: 'Massage', count: 4 }
    ],
    priceRange: { min: 0, max: 500 },
    sortOptions: [
      { value: 'recommended', label: 'Recommended' },
      { value: 'price_asc', label: 'Price: Low to High' },
      { value: 'price_desc', label: 'Price: High to Low' },
      { value: 'rating_desc', label: 'Highest Rated' },
      { value: 'most_reviewed', label: 'Most Reviewed' }
    ],
    timeSlots: [
      { value: 'morning', label: 'Morning (before 12pm)' },
      { value: 'afternoon', label: 'Afternoon (12pm - 5pm)' },
      { value: 'evening', label: 'Evening (after 5pm)' }
    ],
    locations: [],
    durationOptions: []
  }

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    q: initialQ,
    category: initialCategory ? [initialCategory] : [],
    priceMin: undefined,
    priceMax: undefined,
    rating: 0,
    sort: 'recommended',
    available: false,
    timeOfDay: [],
    location: initialLoc
  })

  // Results State
  const [results, setResults] = useState<BusinessLocation[]>([])

  // Mock Licensing/Filtering Logic
  useEffect(() => {
    let filtered = MOCK_BUSINESSES

    // Text Search
    if (filters.q) {
      const qLower = filters.q.toLowerCase()
      filtered = filtered.filter(
        b => b.name.toLowerCase().includes(qLower) || b.description.toLowerCase().includes(qLower)
      )
    }

    // Location Search
    if (filters.location) {
      const locLower = filters.location.toLowerCase()
      filtered = filtered.filter(
        b => b.city.toLowerCase().includes(locLower) || b.address.toLowerCase().includes(locLower)
      )
    }

    // Category Filter
    if (filters.category.length > 0) {
      filtered = filtered.filter(b =>
        b.categories.some(
          cat =>
            filters.category.includes(cat.toLowerCase()) ||
            filters.category.some(fc => cat.toLowerCase().includes(fc.toLowerCase()))
        )
      )
    }

    // Rating Filter
    if (filters.rating > 0) {
      filtered = filtered.filter(b => b.rating >= filters.rating)
    }

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (filters.sort) {
        case 'price_asc':
          return (a.priceRange?.min || 0) - (b.priceRange?.min || 0)
        case 'price_desc':
          return (b.priceRange?.min || 0) - (a.priceRange?.min || 0)
        case 'rating_desc':
          return b.rating - a.rating
        case 'most_reviewed':
          return 124 - 124 // Mock review count is static currently
        default:
          return 0
      }
    })

    setResults(filtered)
  }, [filters])

  const handleResetFilters = () => {
    setFilters({
      q: '',
      category: [],
      priceMin: undefined,
      priceMax: undefined,
      rating: 0,
      sort: 'recommended',
      available: false,
      timeOfDay: [],
      location: ''
    })
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile Top Bar */}
      <div className='lg:hidden bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30 px-4 py-3 space-y-3 shadow-sm transition-all duration-300'>
        <div className='flex items-center gap-3'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
            <Input
              placeholder='Search services...'
              className='pl-10 bg-gray-100/50 border-none rounded-2xl h-11 focus:ring-2 focus:ring-[#0a2c24]/20 text-base transition-all duration-300'
              value={filters.q}
              onChange={e => setFilters(prev => ({ ...prev, q: e.target.value }))}
            />
          </div>
          <Button
            size='icon'
            className='h-11 w-11 rounded-full bg-[#0a2c24] text-white hover:bg-[#0a2c24]/90 shadow-md transition-all'
            onClick={() => setView(view === 'list' ? 'map' : 'list')}
          >
            {view === 'list' ? <Map className='w-5 h-5' /> : <LayoutList className='w-5 h-5' />}
          </Button>
        </div>

        <div className='flex items-center justify-between px-1'>
          <span className='text-xs font-semibold text-gray-400 uppercase tracking-wide'>{results.length} RESULTS</span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className='rounded-full text-xs font-semibold h-8 border-gray-200 bg-white/50 hover:bg-white transition-all mr-1 shadow-sm'
          >
            <Filter className='w-3 h-3 mr-1.5' /> Filters
          </Button>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Sidebar Filters (Desktop) / Overlay (Mobile) */}
          <div
            className={`
              fixed inset-0 z-50 bg-white lg:bg-transparent lg:static lg:z-auto lg:w-1/4 lg:block
              ${isFilterOpen ? 'block animate-in fade-in slide-in-from-bottom-10 duration-300' : 'hidden'}
            `}
          >
            {/* Mobile Filter Header */}
            <div className='lg:hidden sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 py-4 flex items-center justify-between z-10'>
              <h2 className='text-lg font-bold text-[#0a2c24]'>Filters</h2>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setIsFilterOpen(false)}
                className='rounded-full h-8 w-8 p-0'
              >
                <ChevronDown className='w-5 h-5' />
              </Button>
            </div>

            <div className='h-full lg:h-auto overflow-y-auto lg:overflow-visible p-4 lg:p-0 pb-20 lg:pb-0 custom-scrollbar lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]'>
              <SearchFilters
                filters={filters}
                options={filterOptions}
                onFiltersChange={setFilters}
                onApplyFilters={() => {
                  setIsFilterOpen(false) // Close mobile menu if open
                }}
                onResetFilters={handleResetFilters}
                className='shadow-none p-0 bg-transparent lg:bg-white lg:dark:bg-[#202c39] lg:p-6 lg:shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
              />
              {/* Mobile Footer Spacing/Actions could go here */}
            </div>
          </div>

          {/* Results Area */}
          <div className='flex-1'>
            {/* Desktop View Toggle & Count */}
            <div className='hidden lg:flex items-center justify-between mb-4'>
              <h2 className='text-xl font-bold text-gray-900'>{results.length} results found</h2>
              <div className='flex items-center gap-2'>
                <Button
                  variant={view === 'list' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => setView('list')}
                  className={`w-10 h-10 rounded-full ${view === 'list' ? 'bg-[#0a2c24] text-white' : ''}`}
                  title='List View'
                >
                  <LayoutList className='w-4 h-4' />
                </Button>
                <Button
                  variant={view === 'map' ? 'default' : 'outline'}
                  size='icon'
                  onClick={() => setView('map')}
                  className={`w-10 h-10 rounded-full ${view === 'map' ? 'bg-[#0a2c24] text-white' : ''}`}
                  title='Map View'
                >
                  <Map className='w-4 h-4' />
                </Button>
              </div>
            </div>

            {view === 'list' ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {results.map(b => (
                  <BusinessCard
                    key={b.id}
                    id={b.id}
                    name={b.name}
                    rating={b.rating}
                    reviewCount={124}
                    address={b.address}
                    image={b.coverImageUrl || b.imageUrl || ''}
                    isPromoted={Math.random() > 0.8}
                  />
                ))}
                {results.length === 0 && (
                  <div className='col-span-full bg-white rounded-lg border border-gray-200 p-12 text-center'>
                    <div className='mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                      <Search className='w-6 h-6 text-gray-400' />
                    </div>
                    <h3 className='text-lg font-bold text-gray-900 mb-1'>No results found</h3>
                    <p className='text-gray-500'>Try adjusting your filters or search terms</p>
                    <Button variant='link' onClick={handleResetFilters} className='mt-2 text-[#0a2c24]'>
                      Clear all filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className='h-[600px] rounded-lg overflow-hidden border border-gray-200'>
                <SearchMap businesses={results} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
