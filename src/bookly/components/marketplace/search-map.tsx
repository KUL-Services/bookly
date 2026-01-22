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

  const hoveredBusiness = useMemo(
    () => businesses.find(b => b.id === hoveredBusinessId),
    [businesses, hoveredBusinessId]
  )

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  // Close popup when clicking on the map
  const onMapClick = useCallback(() => {
    setHoveredBusinessId(null)
  }, [])

  // Mobile-friendly marker click handler
  const onMarkerClick = (businessId: string) => {
    setHoveredBusinessId(prev => (prev === businessId ? null : businessId))
  }

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
        {/* Custom Overlay Markers */}
        {businesses.map(business => {
          if (!business.coordinates) return null

          return (
            <OverlayView
              key={business.id}
              position={{ lat: business.coordinates.lat, lng: business.coordinates.lng }}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <div
                className='relative flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group'
                onMouseEnter={() => setHoveredBusinessId(business.id)}
                onClick={e => {
                  e.stopPropagation() // Prevent map click from closing immediately
                  onMarkerClick(business.id)
                }}
              >
                {/* Pulse Effect */}
                <div className='absolute w-full h-full bg-[#0a2c24]/30 rounded-full animate-ping' />

                {/* Main Marker */}
                <div className='relative w-14 h-14 bg-white dark:bg-[#202c39] rounded-full border-[3px] border-[#0a2c24] shadow-[0_8px_20px_rgba(10,44,36,0.3)] flex items-center justify-center p-3 transition-transform duration-300 hover:scale-110 cursor-pointer overflow-hidden'>
                  <img src={GreenIcon.src} alt={business.name} className='w-full h-full object-contain' />
                </div>

                {/* Ground Shadow */}
                <div className='w-4 h-1 bg-black/20 rounded-full blur-[2px] mt-2' />
              </div>
            </OverlayView>
          )
        })}

        {/* Popup Card - Rendered when selected */}
        {hoveredBusiness && hoveredBusiness.coordinates && (
          <OverlayView
            position={{ lat: hoveredBusiness.coordinates.lat, lng: hoveredBusiness.coordinates.lng }}
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
                    src={hoveredBusiness.coverImageUrl}
                    className='w-full h-full object-cover'
                    alt={hoveredBusiness.name}
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                  <button
                    onClick={() => setHoveredBusinessId(null)}
                    className='absolute top-2 right-2 p-1 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors'
                  >
                    <MapPin className='w-4 h-4 rotate-45' /> {/* Close Icon as rotated pin or X */}
                  </button>
                </div>

                {/* Content Section */}
                <div className='p-4 text-left'>
                  <h3 className='font-bold text-lg text-gray-900 line-clamp-1 mb-0.5'>{hoveredBusiness.name}</h3>
                  <p className='text-sm text-gray-500 line-clamp-1 mb-3'>{hoveredBusiness.address}</p>

                  <Link
                    href={`/en/business/${hoveredBusiness.id}`} // Should ideally use current lang from context/params
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
