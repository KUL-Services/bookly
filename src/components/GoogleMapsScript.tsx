'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export function GoogleMapsScript() {
  const [apiKey, setApiKey] = useState<string | null>(null)

  useEffect(() => {
    // Ensure we only access process.env on the client side
    setApiKey(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '')
  }, [])

  if (!apiKey) return null

  return <Script src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`} strategy='lazyOnload' />
}
