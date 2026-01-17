'use client'

import { useRef, useEffect } from 'react'
import type { BusinessLocation } from '@/mocks/businesses'

export interface BusinessListProps {
  businesses: BusinessLocation[]
  selectedBusinessId?: string | null
  hoveredBusinessId?: string | null
  selectionSource?: 'map' | 'list' | null
  onBusinessClick?: (businessId: string | null) => void
  onBusinessHover?: (businessId: string | null) => void
  onBookNow?: (businessId: string) => void
  className?: string
}

export function BusinessList({
  businesses,
  selectedBusinessId,
  hoveredBusinessId,
  selectionSource,
  onBusinessClick,
  onBusinessHover,
  onBookNow,
  className = ''
}: BusinessListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Scroll to selected business only when selection comes from map
  useEffect(() => {
    if (selectedBusinessId && selectionSource === 'map' && itemRefs.current[selectedBusinessId]) {
      itemRefs.current[selectedBusinessId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }, [selectedBusinessId, selectionSource])

  if (businesses.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center p-12 bg-white dark:bg-[#202c39] rounded-lg`}>
        <div className='text-center'>
          <svg
            className='w-16 h-16 text-[#77b6a3]/50 mx-auto mb-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
            />
          </svg>
          <h3 className='text-lg font-semibold text-[#0a2c24] dark:text-white mb-2'>No businesses found</h3>
          <p className='text-[#0a2c24]/70 dark:text-white/70'>Try adjusting your filters to find more results</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={listRef} className={`${className} space-y-4`}>
      {businesses.map((business, index) => {
        const isSelected = business.id === selectedBusinessId
        const isHovered = business.id === hoveredBusinessId

        return (
          <div
            key={business.id}
            ref={el => {
              itemRefs.current[business.id] = el
            }}
            onClick={() => onBusinessClick?.(business.id)}
            onMouseEnter={() => onBusinessHover?.(business.id)}
            onMouseLeave={() => onBusinessHover?.(null)}
            className={`
              group bg-white dark:bg-[#202c39] rounded-xl p-4 sm:p-6 border cursor-pointer
              card-hover will-change-transform
              ${
                isSelected
                  ? 'border-[#77b6a3] shadow-lg'
                  : isHovered
                    ? 'border-[#77b6a3]/50 shadow-md'
                    : 'border-[#0a2c24]/10 dark:border-white/10 hover:border-[#77b6a3]/30'
              }
              animate-card-entrance
            `}
            style={{ animationDelay: `${Math.min(index * 50, 400)}ms`, animationFillMode: 'forwards' }}
          >
            <div className='flex flex-col sm:flex-row gap-4'>
              {/* Business Image/Avatar */}
              <div className='w-full sm:w-24 h-32 sm:h-24 flex-shrink-0'>
                {business.imageUrl ? (
                  <div
                    className={`
                    w-full h-full rounded-xl shadow-md overflow-hidden
                    transition-all duration-300
                    ${isSelected || isHovered ? 'scale-105 shadow-lg ring-2 ring-[#77b6a3]' : ''}
                  `}
                  >
                    <img
                      src={business.imageUrl}
                      alt={business.name}
                      className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300'
                      onError={e => {
                        // Fallback to gradient if image fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full bg-[#77b6a3]/20 dark:bg-[#77b6a3]/10 flex items-center justify-center">
                              <div class="text-center p-2">
                                <div class="text-sm font-bold text-[#0a2c24] dark:text-[#77b6a3] line-clamp-2">${business.name}</div>
                              </div>
                            </div>
                          `
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`
                    w-full h-full rounded-xl shadow-md flex items-center justify-center
                    transition-all duration-300
                    ${isSelected || isHovered ? 'scale-105 shadow-lg' : ''}
                    bg-[#77b6a3]/20 dark:bg-[#77b6a3]/10
                  `}
                  >
                    <div className='text-center p-2'>
                      <div className='text-sm font-bold text-[#0a2c24] dark:text-[#77b6a3] line-clamp-2'>
                        {business.name}
                      </div>
                      <div className='text-xs text-[#0a2c24]/70 dark:text-[#77b6a3]/70 mt-1'>★ {business.rating}/5</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-1'>{business.name}</h3>

                    <div className='flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-2 font-mono'>
                      <div className='flex items-center'>
                        <span className='text-yellow-500 mr-1'>★</span>
                        <span className='font-medium'>{business.rating}</span>
                      </div>
                      <span className='text-gray-400'>•</span>
                      <span>{business.servicesCount} services</span>
                      <span className='text-gray-400'>•</span>
                      <span className='text-primary-800 dark:text-sage-400 font-medium'>
                        ${business.priceRange.min} - ${business.priceRange.max}
                      </span>
                    </div>

                    <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3'>{business.description}</p>

                    <div className='flex flex-wrap items-center gap-2 text-xs'>
                      <div className='flex items-center text-gray-500 dark:text-gray-400 font-mono'>
                        <svg className='w-4 h-4 mr-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
                        {business.region}, {business.city}
                      </div>
                      {business.categories.map((category, idx) => (
                        <span
                          key={idx}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#77b6a3]/20 dark:bg-[#77b6a3]/10 text-[#0a2c24] dark:text-[#77b6a3] font-mono'
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className='flex-shrink-0'>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onBookNow?.(business.id)
                      }}
                      className='btn-primary-enhanced btn-press px-6 py-2.5 rounded-lg text-sm font-semibold'
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
