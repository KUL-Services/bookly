import { useCallback, useMemo } from 'react'
import { GoogleMap, OverlayView, useJsApiLoader } from '@react-google-maps/api'
import type { Branch } from '@/lib/api'
import GreenIcon from '@/assets/logos/icons/Green_Icon_filled_transparent.png'

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

  return (
    <GoogleMap
      mapContainerStyle={{ height: '300px', width: '100%' }}
      center={center}
      zoom={15}
      options={mapOptions}
      onLoad={onMapLoad}
    >
      <OverlayView position={center} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
        <div className='relative flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2 group'>
          {/* Pulse Effect */}
          <div className='absolute w-full h-full bg-[#0a2c24]/30 rounded-full animate-ping' />

          {/* Main Marker */}
          <div className='relative w-14 h-14 bg-white dark:bg-[#202c39] rounded-full border-[3px] border-[#0a2c24] shadow-[0_8px_20px_rgba(10,44,36,0.3)] flex items-center justify-center p-3 transition-transform duration-300 hover:scale-110 cursor-pointer overflow-hidden'>
            <img src={GreenIcon.src} alt={branch.name} className='w-full h-full object-contain' />
          </div>

          {/* Ground Shadow */}
          <div className='w-4 h-1 bg-black/20 rounded-full blur-[2px] mt-2' />
        </div>
      </OverlayView>
    </GoogleMap>
  )
}

export default BranchMapView
