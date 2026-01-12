'use client'

import { useEffect, useMemo, useRef, useCallback } from 'react'
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api'
import type { BusinessLocation, BusinessBranch } from '@/mocks/businesses'

export interface BusinessMapImplProps {
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

// Interface for branch markers with business info
interface BranchMarker extends BusinessBranch {
  business: BusinessLocation
}

// Custom marker SVG path for pin icon (similar to previous implementation)
const createMarkerIcon = (isSelected: boolean, isHovered: boolean) => {
  const color = isSelected || isHovered ? '#0a2c24' : '#202c39'
  return {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: color,
    fillOpacity: 1,
    strokeColor: '#f7f8f9',
    strokeWeight: 2,
    scale: 1.5,
    anchor: new google.maps.Point(12, 22)
  }
}

export function BusinessMapImpl({
  businesses,
  selectedBusinessId,
  selectedBranchId,
  hoveredBusinessId,
  hoveredBranchId,
  onMarkerClick,
  onMarkerHover,
  onBookNow,
  className = ''
}: BusinessMapImplProps) {
  const mapRef = useRef<google.maps.Map | null>(null)

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: 'google-map-script'
  })

  // Flatten all branches from all businesses
  const branchMarkers = useMemo<BranchMarker[]>(() => {
    return businesses.flatMap(business =>
      business.branches.map(branch => ({
        ...branch,
        business
      }))
    )
  }, [businesses])

  // Calculate center and zoom based on all branch markers
  const { center, zoom } = useMemo(() => {
    if (branchMarkers.length === 0) {
      return { center: { lat: 25.2048, lng: 55.2708 }, zoom: 5 } // Dubai as default
    }

    if (branchMarkers.length === 1) {
      return {
        center: { lat: branchMarkers[0].latitude, lng: branchMarkers[0].longitude },
        zoom: 12
      }
    }

    // Calculate center from all branch markers
    const avgLat = branchMarkers.reduce((sum, b) => sum + b.latitude, 0) / branchMarkers.length
    const avgLng = branchMarkers.reduce((sum, b) => sum + b.longitude, 0) / branchMarkers.length

    return { center: { lat: avgLat, lng: avgLng }, zoom: 8 }
  }, [branchMarkers])

  // Map options
  const mapOptions: google.maps.MapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: true,
      styles: [] // You can add custom map styles here if needed
    }),
    []
  )

  // Fit bounds to show all markers
  const fitBounds = useCallback(() => {
    if (!mapRef.current || branchMarkers.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    branchMarkers.forEach(marker => {
      bounds.extend({ lat: marker.latitude, lng: marker.longitude })
    })

    mapRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 })

    // Don't zoom in too much for single marker
    if (branchMarkers.length === 1) {
      const listener = google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
        if (mapRef.current && mapRef.current.getZoom()! > 13) {
          mapRef.current.setZoom(13)
        }
      })
    }
  }, [branchMarkers])

  // Handle map load
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      fitBounds()
    },
    [fitBounds]
  )

  // Center on selected branch
  useEffect(() => {
    if (selectedBranchId && mapRef.current) {
      const selectedBranch = branchMarkers.find(m => m.id === selectedBranchId)
      if (selectedBranch) {
        mapRef.current.panTo({
          lat: selectedBranch.latitude,
          lng: selectedBranch.longitude
        })
        mapRef.current.setZoom(15)
      }
    }
  }, [selectedBranchId, branchMarkers])

  // Update bounds when branch markers change
  useEffect(() => {
    if (mapRef.current && branchMarkers.length > 0) {
      fitBounds()
    }
  }, [branchMarkers, fitBounds])

  if (loadError) {
    return (
      <div className={`${className} bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center p-4`}>
        <div className='text-red-600 dark:text-red-400 text-center'>
          <p className='font-semibold'>Failed to load Google Maps</p>
          <p className='text-sm mt-1'>Please check your API key configuration</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center`}>
        <div className='text-gray-500 dark:text-gray-400'>Loading map...</div>
      </div>
    )
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700`}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onMapLoad}
        onClick={() => onMarkerClick?.(null)}
      >
        {branchMarkers.map(marker => {
          const business = marker.business
          // Only highlight this specific branch if it's selected or hovered
          const isSelected = selectedBranchId ? marker.id === selectedBranchId : false
          const isHovered = hoveredBranchId ? marker.id === hoveredBranchId : false
          const showInfoWindow = isSelected || isHovered

          return (
            <MarkerF
              key={marker.id}
              position={{ lat: marker.latitude, lng: marker.longitude }}
              icon={createMarkerIcon(isSelected, isHovered)}
              onClick={(e) => {
                if (e.domEvent) {
                  e.domEvent.stopPropagation()
                }
                onMarkerClick?.(business.id, marker.id)
              }}
              onMouseOver={() => onMarkerHover?.(business.id, marker.id)}
              onMouseOut={() => onMarkerHover?.(null)}
              animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
            >
              {showInfoWindow && (
                <InfoWindowF
                  position={{ lat: marker.latitude, lng: marker.longitude }}
                  options={{ maxWidth: 300, minWidth: 280, disableAutoPan: false }}
                >
                  <div className='p-3'>
                    {/* Branch & Business Header */}
                    <div className='mb-3'>
                      <h3 className='font-bold text-lg text-gray-900 mb-1'>{business.name}</h3>
                      <p className='text-sm text-primary-800 font-semibold mb-2'>{marker.branchName}</p>
                      <div className='flex items-center gap-2 text-sm text-gray-600 mb-2'>
                        <div className='flex items-center gap-1'>
                          <span className='text-yellow-500'>★</span>
                          <span className='font-semibold'>{business.rating}</span>
                        </div>
                        <span className='text-gray-400'>•</span>
                        <span>{business.servicesCount} services</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className='text-sm text-gray-600 mb-3 line-clamp-2'>{business.description}</p>

                    {/* Branch Address */}
                    <div className='flex items-start gap-1 text-xs text-gray-500 mb-2'>
                      <svg className='w-4 h-4 flex-shrink-0 mt-0.5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
                      </svg>
                      <span>{marker.address}</span>
                    </div>

                    {/* Phone */}
                    {marker.phone && (
                      <div className='flex items-center gap-1 text-xs text-gray-500 mb-2'>
                        <svg className='w-4 h-4 flex-shrink-0' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' />
                        </svg>
                        <span>{marker.phone}</span>
                      </div>
                    )}

                    {/* Price Range */}
                    <div className='text-sm font-semibold text-primary-800 mb-3'>
                      ${business.priceRange.min} - ${business.priceRange.max}
                    </div>

                    {/* Categories */}
                    <div className='flex flex-wrap gap-1 mb-3'>
                      {business.categories.slice(0, 3).map((category, idx) => (
                        <span
                          key={idx}
                          className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-200 text-primary-900'
                        >
                          {category}
                        </span>
                      ))}
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        onBookNow?.(business.id)
                      }}
                      className='w-full bg-primary-700 hover:bg-primary-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg'
                    >
                      Book Now
                    </button>
                  </div>
                </InfoWindowF>
              )}
            </MarkerF>
          )
        })}
      </GoogleMap>
    </div>
  )
}
