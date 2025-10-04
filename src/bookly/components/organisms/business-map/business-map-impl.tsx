'use client'

import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { BusinessLocation } from '@/mocks/businesses'

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

// Custom marker icons
const createCustomIcon = (isSelected: boolean, isHovered: boolean) => {
  const color = isSelected || isHovered ? '#14b8a6' : '#6366f1'
  const html = `
    <div style="
      background-color: ${color};
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      border: 3px solid white;
      transform: rotate(-45deg);
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: white;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
  })
}

// Component to fit map bounds to markers
function MapBoundsUpdater({ businesses }: { businesses: BusinessLocation[] }) {
  const map = useMap()

  useEffect(() => {
    if (businesses.length > 0) {
      const bounds = L.latLngBounds(businesses.map(b => [b.coordinates.lat, b.coordinates.lng]))
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 })
    }
  }, [businesses, map])

  return null
}

export interface BusinessMapImplProps {
  businesses: BusinessLocation[]
  selectedBusinessId?: string | null
  hoveredBusinessId?: string | null
  onMarkerClick?: (businessId: string) => void
  onMarkerHover?: (businessId: string | null) => void
  onBookNow?: (businessId: string) => void
  className?: string
}

export function BusinessMapImpl({
  businesses,
  selectedBusinessId,
  hoveredBusinessId,
  onMarkerClick,
  onMarkerHover,
  onBookNow,
  className = ''
}: BusinessMapImplProps) {
  const mapRef = useRef<L.Map | null>(null)

  // Calculate center and zoom based on businesses
  const { center, zoom } = useMemo(() => {
    if (businesses.length === 0) {
      return { center: [25.2048, 55.2708] as [number, number], zoom: 5 } // Dubai as default
    }

    if (businesses.length === 1) {
      return {
        center: [businesses[0].coordinates.lat, businesses[0].coordinates.lng] as [number, number],
        zoom: 12
      }
    }

    // Calculate center from all businesses
    const avgLat = businesses.reduce((sum, b) => sum + b.coordinates.lat, 0) / businesses.length
    const avgLng = businesses.reduce((sum, b) => sum + b.coordinates.lng, 0) / businesses.length

    return { center: [avgLat, avgLng] as [number, number], zoom: 8 }
  }, [businesses])

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />

        <MapBoundsUpdater businesses={businesses} />

        {businesses.map(business => {
          const isSelected = business.id === selectedBusinessId
          const isHovered = business.id === hoveredBusinessId

          return (
            <Marker
              key={business.id}
              position={[business.coordinates.lat, business.coordinates.lng]}
              icon={createCustomIcon(isSelected, isHovered)}
              eventHandlers={{
                click: () => onMarkerClick?.(business.id),
                mouseover: () => onMarkerHover?.(business.id),
                mouseout: () => onMarkerHover?.(null)
              }}
            >
              <Popup maxWidth={300} minWidth={280}>
                <div className='p-3'>
                  {/* Business Header */}
                  <div className='mb-3'>
                    <h3 className='font-bold text-lg text-gray-900 mb-1'>{business.name}</h3>
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

                  {/* Location */}
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
                    <span>{business.address}</span>
                  </div>

                  {/* Price Range */}
                  <div className='text-sm font-semibold text-teal-600 mb-3'>
                    ${business.priceRange.min} - ${business.priceRange.max}
                  </div>

                  {/* Categories */}
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {business.categories.slice(0, 3).map((category, idx) => (
                      <span
                        key={idx}
                        className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800'
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
                    className='w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg'
                  >
                    Book Now
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
