'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, OverlayView, MarkerF } from '@react-google-maps/api'
import { BusinessLocation } from '@/mocks/businesses'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import GreenIcon from '@/assets/logos/icons/Green_Icon_filled_transparent.png'

type SearchMapProps = {
  businesses: BusinessLocation[]
  height?: string
}

const containerStyle = {
  width: '100%',
  height: '100%'
}

// Default center (Cairo)
const defaultCenter = {
  lat: 30.0444,
  lng: 31.2357
}

const libraries: ('places' | 'geometry')[] = ['places', 'geometry']

// ... existing code ...

// Memoized Marker Component to prevent re-renders
// Memoized Marker Component to prevent re-renders
const MapMarker = memo(function MapMarker({
  business,
  isActive,
  onHover,
  onClick
}: {
  business: BusinessLocation
  isActive: boolean
  onHover: (id: string | null) => void
  onClick: (id: string) => void
}) {
  if (!business.coordinates) return null

  const icon = {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: '#0a2c24',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
    scale: 2,
    anchor: new google.maps.Point(12, 22)
  }

  return (
    <MarkerF
      position={{ lat: business.coordinates.lat, lng: business.coordinates.lng }}
      icon={icon}
      onClick={e => {
        if (e.domEvent) {
          e.domEvent.stopPropagation()
        }
        onClick(business.id)
      }}
      onMouseOver={() => onHover(business.id)}
      onMouseOut={() => onHover(null)}
      zIndex={isActive ? 1000 : 1}
      animation={isActive ? google.maps.Animation.BOUNCE : undefined}
    />
  )
})

export function SearchMap({ businesses, height = '600px' }: SearchMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries
  })

  // Calculate center based on first business
  const center = useMemo(() => {
    return businesses.length > 0 && businesses[0].coordinates
      ? { lat: businesses[0].coordinates.lat, lng: businesses[0].coordinates.lng }
      : defaultCenter
  }, [businesses])

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [hoveredBusinessId, setHoveredBusinessId] = useState<string | null>(null)
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null)

  // Optimize icon object
  const markerIcon = useMemo(() => {
    if (!isLoaded || !window.google) return undefined
    return {
      url: GreenIcon.src,
      scaledSize: new google.maps.Size(50, 50),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(25, 50)
    }
  }, [isLoaded])

  const activeBusinessId = selectedBusinessId || hoveredBusinessId

  const activeBusiness = useMemo(() => businesses.find(b => b.id === activeBusinessId), [businesses, activeBusinessId])

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Close popup when clicking on the map
  const onMapClick = useCallback(() => {
    setSelectedBusinessId(null)
    setHoveredBusinessId(null)
  }, [])

  // Marker Click Handler - Stable callback
  const onMarkerClick = useCallback((businessId: string) => {
    setSelectedBusinessId(prev => (prev === businessId ? null : businessId))
  }, [])

  // Hover Handler - Stable callback
  const onMarkerHover = useCallback((businessId: string | null) => {
    setSelectedBusinessId(prevSelected => {
      if (!prevSelected) {
        setHoveredBusinessId(businessId)
      }
      return prevSelected
    })
  }, [])

  if (!isLoaded) {
    return (
      <div
        className='w-full rounded-lg overflow-hidden shadow-lg border border-gray-200 bg-gray-100 flex items-center justify-center'
        style={{ height }}
      >
        <p className='text-gray-500'>Loading Map...</p>
      </div>
    )
  }

  return (
    <div className='w-full rounded-lg overflow-hidden shadow-lg border border-gray-200' style={{ height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={onMapClick}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          clickableIcons: false, // Disables clicking on default POIs
          gestureHandling: 'greedy', // Standard specific map gesture handling
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {/* Render Markers */}
        {businesses.map(business => (
          <MapMarker
            key={business.id}
            business={business}
            isActive={activeBusinessId === business.id}
            onHover={onMarkerHover}
            onClick={onMarkerClick}
          />
        ))}

        {/* Popup Card - Rendered when selected */}
        {activeBusiness && activeBusiness.coordinates && (
          <OverlayView
            position={{ lat: activeBusiness.coordinates.lat, lng: activeBusiness.coordinates.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              className='absolute bottom-full left-1/2 -translate-x-1/2 w-64 z-50 pb-4 flex flex-col justify-end cursor-default'
              onClick={e => e.stopPropagation()} // Prevent closing when clicking inside popup
            >
              <div className='bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5 transform transition-all duration-200 scale-100 origin-bottom'>
                {/* Image Section */}
                <div className='relative h-32 w-full'>
                  <img
                    src={activeBusiness.coverImageUrl}
                    className='w-full h-full object-cover'
                    alt={activeBusiness.name}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                  <button
                    onClick={() => {
                      setSelectedBusinessId(null)
                      setHoveredBusinessId(null)
                    }}
                    className='absolute top-2 right-2 p-1 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors'
                  >
                    <MapPin className='w-4 h-4 rotate-45' /> {/* Close Icon as rotated pin or X */}
                  </button>
                </div>

                {/* Content Section */}
                <div className='p-4 text-left'>
                  <h3 className='font-bold text-lg text-gray-900 line-clamp-1 mb-0.5'>{activeBusiness.name}</h3>
                  <p className='text-sm text-gray-500 line-clamp-1 mb-3'>{activeBusiness.address}</p>

                  <Link
                    href={`/en/business/${activeBusiness.id}`} // Should ideally use current lang from context/params
                    className='inline-flex items-center justify-center w-full px-4 py-2.5 bg-[#0a2c24] text-white text-sm font-bold rounded-lg hover:bg-[#0a2c24]/90 transition-all active:scale-95 shadow-md'
                  >
                    View Profile
                  </Link>
                </div>
              </div>

              {/* Decorative Down Arrow */}
              <div className='absolute bottom-[44px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm -z-10 rounded-sm' />
            </div>
          </OverlayView>
        )}
      </GoogleMap>
    </div>
  )
}
