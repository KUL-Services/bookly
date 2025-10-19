'use client'

import { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Chip from '@mui/material/Chip'

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
    // Check if Google Maps API is loaded
    const checkGoogleMaps = () => {
      return typeof window !== 'undefined' && window.google && window.google.maps
    }

    const initMap = () => {
      if (!mapRef.current || !checkGoogleMaps()) return

      try {
        // Clear any existing content first
        if (mapRef.current) {
          mapRef.current.innerHTML = ''
        }

        // Detect mobile device
        const isMobile = window.innerWidth < 768

        // Initialize map with responsive options
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: isMobile ? 14 : 15, // Slightly zoomed out on mobile for better context
          mapTypeControl: !isMobile, // Hide map type control on mobile to save space
          mapTypeControlOptions: {
            position: window.google.maps.ControlPosition.TOP_RIGHT,
            style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU
          },
          streetViewControl: false, // Disabled for cleaner UI
          fullscreenControl: !isMobile, // Only show on desktop
          fullscreenControlOptions: {
            position: window.google.maps.ControlPosition.RIGHT_TOP
          },
          zoomControl: true,
          zoomControlOptions: {
            position: isMobile
              ? window.google.maps.ControlPosition.RIGHT_BOTTOM
              : window.google.maps.ControlPosition.RIGHT_CENTER
          },
          gestureHandling: 'greedy', // No need for Ctrl+scroll, better for mobile
          disableDefaultUI: false,
          clickableIcons: false, // Prevent clicking on POIs
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }] // Hide POI labels for cleaner look
            }
          ]
        })

        mapInstanceRef.current = map

        // Initialize geocoder
        geocoderRef.current = new window.google.maps.Geocoder()

        // Create draggable marker - default Google Maps marker (simple and recognizable)
        const marker = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
          title: 'Drag to select location'
        })

        markerRef.current = marker

        // Handle marker drag end
        marker.addListener('dragend', () => {
          const position = marker.getPosition()
          if (position) {
            const lat = position.lat()
            const lng = position.lng()
            reverseGeocode(lat, lng)
          }
        })

        // Handle map click to move marker
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            marker.setPosition(e.latLng)
            map.panTo(e.latLng)
            reverseGeocode(lat, lng)
          }
        })

        // Initial reverse geocode
        reverseGeocode(latitude, longitude)

        setIsLoading(false)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize Google Map:', err)
        setError('Failed to load map. Please try again.')
        setIsLoading(false)
      }
    }

    // Wait for Google Maps to load
    if (checkGoogleMaps()) {
      initMap()
    } else {
      const interval = setInterval(() => {
        if (checkGoogleMaps()) {
          clearInterval(interval)
          initMap()
        }
      }, 100)

      const timeout = setTimeout(() => {
        clearInterval(interval)
        if (!checkGoogleMaps()) {
          setError('Google Maps failed to load. Please check your internet connection.')
          setIsLoading(false)
        }
      }, 10000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
        markerRef.current = null
      }
      if (mapInstanceRef.current) {
        // Clear all event listeners
        window.google?.maps?.event?.clearInstanceListeners(mapInstanceRef.current)
        mapInstanceRef.current = null
      }
    }
  }, []) // Only run once on mount

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
