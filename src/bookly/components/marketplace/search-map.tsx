'use client'

import { useState, useCallback, memo, useMemo } from 'react'
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api'
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

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
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
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        }}
      >
        {businesses.map(
          business =>
            business.coordinates && (
              <OverlayView
                key={business.id}
                position={{ lat: business.coordinates.lat, lng: business.coordinates.lng }}
                mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
              >
                <div
                  className='absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-full cursor-pointer'
                  style={{ zIndex: hoveredBusinessId === business.id ? 100 : 1 }} // Bring hovered element to front
                  onMouseEnter={() => setHoveredBusinessId(business.id)}
                  onMouseLeave={() => setHoveredBusinessId(null)}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Marker Icon */}
                  <div className='transform transition-transform duration-200 hover:scale-110 relative z-10'>
                    <img src={GreenIcon.src} alt='Location' className='w-12 h-12 object-contain drop-shadow-md' />
                  </div>

                  {/* Popup */}
                  {hoveredBusinessId === business.id && (
                    <div
                      className='absolute bottom-full left-1/2 -translate-x-1/2 w-64 z-50 pb-3 flex flex-col justify-end cursor-default'
                      // cursor-default prevents the pointer hand from showing on the text
                    >
                      {/* Inner Content Container */}
                      <div className='bg-white rounded-xl shadow-2xl overflow-hidden ring-1 ring-black/5'>
                        {/* Image Section */}
                        <div className='relative h-32 w-full'>
                          <img
                            src={business.coverImageUrl}
                            className='w-full h-full object-cover'
                            alt={business.name}
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                        </div>

                        {/* Content Section */}
                        <div className='p-4 text-left'>
                          <h3 className='font-bold text-lg text-gray-900 line-clamp-1 mb-0.5'>{business.name}</h3>
                          <p className='text-sm text-gray-500 line-clamp-1 mb-3'>{business.address}</p>

                          <Link
                            href={`/${window.location.pathname.split('/')[1]}/business/${business.id}`}
                            className='inline-flex items-center justify-center w-full px-4 py-2.5 bg-[#0a2c24] text-white text-sm font-bold rounded-lg hover:bg-[#0a2c24]/90 transition-all active:scale-95 shadow-md'
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>

                      {/* Decorative Down Arrow (Centered below card) */}
                      <div className='absolute bottom-[4px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-sm -z-10 translate-y-[-50%] rounded-sm'></div>
                    </div>
                  )}
                </div>
              </OverlayView>
            )
        )}
      </GoogleMap>
    </div>
  )
}
