'use client'

import { useEffect, useRef, useState } from 'react'
import type { BusinessLocation } from '@/mocks/businesses'

export interface BusinessMapProps {
  businesses: BusinessLocation[]
  selectedBusinessId?: string | null
  selectedBranchId?: string | null
  hoveredBusinessId?: string | null
  hoveredBranchId?: string | null
  onMarkerClick?: (businessId: string | null, branchId?: string) => void
  onMarkerHover?: (businessId: string | null, branchId?: string) => void
  onBookNow?: (businessId: string) => void
  className?: string
}

// Dynamic import helper to avoid SSR issues
let MapComponent: React.ComponentType<BusinessMapProps> | null = null

export function BusinessMap(props: BusinessMapProps) {
  const [isClient, setIsClient] = useState(false)
  const [MapImpl, setMapImpl] = useState<React.ComponentType<BusinessMapProps> | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Dynamically import the map implementation
    import('./business-map-impl').then(module => {
      setMapImpl(() => module.BusinessMapImpl)
    })
  }, [])

  if (!isClient || !MapImpl) {
    return (
      <div className={`${props.className} bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center`}>
        <div className='text-gray-500 dark:text-gray-400'>Loading map...</div>
      </div>
    )
  }

  return <MapImpl {...props} />
}
