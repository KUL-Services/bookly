'use client'

import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'
import { ensureGoogleMapsLoaded } from './google-maps-loader'

interface GoogleMapPickerProps {
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number, address: string) => void
  height?: string
}

/**
 * Interactive Google Map with draggable marker
 * Allows user to select location by dragging marker or map will update when address is searched
 */
const GoogleMapPicker = ({
  latitude = 30.0444, // Default: Cairo, Egypt
  longitude = 31.2357,
  onLocationChange,
  height = '400px'
}: GoogleMapPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>('')

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current) return

    try {
      const result = await geocoderRef.current.geocode({
        location: { lat, lng }
      })

      if (result.results && result.results[0]) {
        const address = result.results[0].formatted_address
        setCurrentAddress(address)
        onLocationChange(lat, lng, address)
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err)
    }
  }

  useEffect(() => {
    let isCancelled = false

    const initMap = async () => {
      setIsLoading(true)
      setError(null)

      try {
        await ensureGoogleMapsLoaded({ libraries: ['places'] })

        let tries = 0
        while (!isCancelled && !mapRef.current && tries < 40) {
          await new Promise(resolve => setTimeout(resolve, 50))
          tries += 1
        }

        if (isCancelled) return
        if (!mapRef.current) {
          throw new Error('Map container is not ready yet.')
        }

        mapRef.current.innerHTML = ''

        const isMobile = window.innerWidth < 768

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: isMobile ? 14 : 15,
          mapTypeControl: !isMobile,
          mapTypeControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          streetViewControl: false,
          fullscreenControl: !isMobile,
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP
          },
          zoomControl: true,
          zoomControlOptions: {
            position: isMobile
              ? window.google.maps.ControlPosition.RIGHT_BOTTOM
              : window.google.maps.ControlPosition.RIGHT_CENTER
          },
          gestureHandling: 'greedy',
          disableDefaultUI: false,
          clickableIcons: false,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        })

        mapInstanceRef.current = map
        geocoderRef.current = new window.google.maps.Geocoder()

        const marker = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: 'Drag to select location'
        })

        markerRef.current = marker

        marker.addListener('dragend', () => {
          const position = marker.getPosition()
          if (!position) return
          reverseGeocode(position.lat(), position.lng())
        })

        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (!e.latLng) return
          const lat = e.latLng.lat()
          const lng = e.latLng.lng()
          marker.setPosition(e.latLng)
          map.panTo(e.latLng)
          reverseGeocode(lat, lng)
        })

        reverseGeocode(latitude, longitude)

        if (!isCancelled) {
          setIsLoading(false)
          setError(null)
        }
      } catch (err) {
        if (isCancelled) return
        console.error('Failed to initialize Google Map:', err)
        setError('Failed to load map. Please try again.')
        setIsLoading(false)
      }
    }

    initMap()

    return () => {
      isCancelled = true
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      if (mapInstanceRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(mapInstanceRef.current)
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update map when coordinates change externally (from search)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
      const newPosition = { lat: latitude, lng: longitude }
      markerRef.current.setPosition(newPosition)
      mapInstanceRef.current.panTo(newPosition)
      mapInstanceRef.current.setZoom(17) // Zoom in when location is selected via search
      reverseGeocode(latitude, longitude)
    }
  }, [latitude, longitude])

  return (
    <Box className="relative">
      {/* Map Container */}
      <Box className="relative w-full rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden" style={{ height }}>
        {/* Loading overlay - separate from map div */}
        {isLoading && (
          <Box className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
            <div className="text-center">
              <CircularProgress size={40} className="mb-3" />
              <Typography variant="body2" color="text.secondary">
                Loading map...
              </Typography>
            </div>
          </Box>
        )}
        {/* Map div - Google Maps will manage its children */}
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ minHeight: height }}
        />
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" className="mt-3">
          {error}
        </Alert>
      )}

      {/* Current Location Display */}
      {!isLoading && !error && currentAddress && (
        <Box className="mt-3 flex items-start gap-2">
          <i className="ri-map-pin-2-fill text-primary text-xl" />
          <Box className="flex-1">
            <Typography variant="body2" className="font-medium mb-1">
              Selected Location
            </Typography>
            <Typography variant="body2" color="text.secondary" className="text-sm">
              {currentAddress}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Instructions */}
      {!isLoading && !error && (
        <Box className="mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Chip
              icon={<i className="ri-information-line" />}
              label="Tip"
              size="small"
              color="primary"
              variant="outlined"
            />
          </div>
          <Typography variant="body2" color="text.secondary" className="text-xs">
            • Drag the marker to adjust your location
            <br />
            • Click anywhere on the map to move the marker
            <br />
            • Use the search above to find your address
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default GoogleMapPicker
