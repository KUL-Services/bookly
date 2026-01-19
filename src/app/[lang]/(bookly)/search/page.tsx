'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MOCK_BUSINESSES, BusinessLocation } from '@/mocks/businesses'
import { BusinessCard } from '@/bookly/components/marketplace/business-card'
import { SearchMap } from '@/bookly/components/marketplace/search-map'
import { Button } from '@/bookly/components/ui/button'
import { Map, Filter, ChevronDown, Search, MapPin, Calendar } from 'lucide-react'
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
      <div className='lg:hidden bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-3 flex items-center justify-between'>
        <h1 className='font-bold text-lg text-gray-900'>Results</h1>
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter className='w-4 h-4 mr-2' /> Filter
          </Button>
          <Button size='sm' variant='ghost' onClick={() => setView(view === 'list' ? 'map' : 'list')}>
            {view === 'list' ? <Map className='w-4 h-4' /> : <Filter className='w-4 h-4' />}
            {/* Icon logic strictly for toggle visual */}
          </Button>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 py-6'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Sidebar Filters (Desktop) */}
          <div className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'}`}>
            <div className='sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar'>
              <SearchFilters
                filters={filters}
                options={filterOptions}
                onFiltersChange={setFilters}
                onApplyFilters={() => {
                  setIsFilterOpen(false) // Close mobile menu if open
                  // Logic handles auto-update in useEffect, but we could add manual trigger here
                }}
                onResetFilters={handleResetFilters}
                className='shadow-sm'
              />
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
                  size='sm'
                  onClick={() => setView('list')}
                  className={view === 'list' ? 'bg-[#0a2c24] text-white' : ''}
                >
                  List
                </Button>
                <Button
                  variant={view === 'map' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setView('map')}
                  className={view === 'map' ? 'bg-[#0a2c24] text-white' : ''}
                >
                  Map
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
              <div className='h-[600px] rounded-lg overflow-hidden border border-gray-200 shadow-sm'>
                <SearchMap businesses={results} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
