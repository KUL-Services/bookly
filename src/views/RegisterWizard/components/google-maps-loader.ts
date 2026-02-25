'use client'

type GoogleMapsLoaderOptions = {
  libraries?: Array<'places'>
  timeoutMs?: number
}

let googleMapsLoadPromise: Promise<void> | null = null

const DEFAULT_TIMEOUT_MS = 15000
const SCRIPT_ID = 'zerv-google-maps-js'

const isGoogleMapsReady = (requiresPlaces: boolean) => {
  if (typeof window === 'undefined') return false
  if (!window.google?.maps) return false
  if (requiresPlaces && !window.google.maps.places) return false
  return true
}

export const ensureGoogleMapsLoaded = async ({
  libraries = ['places'],
  timeoutMs = DEFAULT_TIMEOUT_MS
}: GoogleMapsLoaderOptions = {}): Promise<void> => {
  const requiresPlaces = libraries.includes('places')

  if (isGoogleMapsReady(requiresPlaces)) return
  if (googleMapsLoadPromise) return googleMapsLoadPromise

  googleMapsLoadPromise = new Promise<void>((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      googleMapsLoadPromise = null
      reject(new Error('Google Maps API key is missing. Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.'))
      return
    }

    let timeoutHandle: ReturnType<typeof setTimeout> | null = null
    let intervalHandle: ReturnType<typeof setInterval> | null = null

    const cleanup = () => {
      if (timeoutHandle) clearTimeout(timeoutHandle)
      if (intervalHandle) clearInterval(intervalHandle)
    }

    const resolveIfReady = () => {
      if (isGoogleMapsReady(requiresPlaces)) {
        cleanup()
        resolve()
      }
    }

    const existingScript = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
    const genericExistingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    ) as HTMLScriptElement | null

    if (!existingScript && !genericExistingScript) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.async = true
      script.defer = true
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}`
      script.onerror = () => {
        cleanup()
        googleMapsLoadPromise = null
        reject(new Error('Failed to load Google Maps script.'))
      }
      document.head.appendChild(script)
    }

    intervalHandle = setInterval(resolveIfReady, 50)
    timeoutHandle = setTimeout(() => {
      cleanup()
      if (!isGoogleMapsReady(requiresPlaces)) {
        googleMapsLoadPromise = null
        reject(new Error('Google Maps did not finish loading in time.'))
      }
    }, timeoutMs)

    resolveIfReady()
  })

  return googleMapsLoadPromise
}
