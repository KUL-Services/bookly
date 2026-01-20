'use client'

import { useCallback, useMemo } from 'react'
import { GoogleMap, MarkerF, InfoWindowF, useJsApiLoader } from '@react-google-maps/api'
import type { Branch } from '@/lib/api'

interface BranchMapViewProps {
  branch: Branch
}

// Define libraries outside component to prevent re-render issues
const LIBRARIES: ('places' | 'geometry')[] = ['places', 'geometry']

const BranchMapView = ({ branch }: BranchMapViewProps) => {
  // Load Google Maps (use same id and libraries as business-map to avoid conflicts)
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    id: 'google-map-script',
    libraries: LIBRARIES
  })

  // Extract coordinates from branch or use default (Cairo coordinates as fallback)
  const latitude = (branch as any).latitude || 30.0444
  const longitude = (branch as any).longitude || 31.2357
  const center = useMemo(() => ({ lat: latitude, lng: longitude }), [latitude, longitude])

  const onMapLoad = useCallback((map: google.maps.Map) => {
    // Map loaded successfully
  }, [])

  if (loadError) {
    return (
      <div className='bg-red-50 dark:bg-red-900/20 rounded-lg h-64 flex items-center justify-center p-4'>
        <div className='text-red-600 dark:text-red-400 text-center'>
          <p className='font-semibold'>Failed to load Google Maps</p>
          <p className='text-sm mt-1'>Please check your API key configuration</p>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className='bg-gray-100 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center'>
        <div className='text-gray-500 dark:text-gray-400'>Loading map...</div>
      </div>
    )
  }

  // Map options (after isLoaded check)
  const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    scrollwheel: false,
    styles: []
  }

  // Custom marker icon (red pin) - created after isLoaded check
  const markerIcon = {
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    fillColor: '#e88682',
    fillOpacity: 1,
    strokeColor: '#f7f8f9',
    strokeWeight: 2,
    scale: 1.5,
    anchor: new google.maps.Point(12, 22)
  }

  return (
    <GoogleMap
      mapContainerStyle={{ height: '300px', width: '100%' }}
      center={center}
      zoom={15}
      options={mapOptions}
      onLoad={onMapLoad}
    >
      <MarkerF position={center} icon={markerIcon} title={branch.name}>
        <InfoWindowF
          position={center}
          options={{
            maxWidth: 250,
            pixelOffset: new google.maps.Size(0, 0),
            headerDisabled: true
          }}
        >
          <div className='p-3'>
            <h3 className='font-semibold text-gray-900 text-sm mb-1'>{branch.name}</h3>
            <p className='text-xs text-gray-600 leading-relaxed'>{branch.address}</p>
          </div>
        </InfoWindowF>
      </MarkerF>
    </GoogleMap>
  )
}

export default BranchMapView
