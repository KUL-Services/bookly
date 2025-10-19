// Next Imports
import type { Metadata } from 'next'
import Script from 'next/script'

// Component Imports
import RegisterWizard from '@views/RegisterWizard'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Business Registration',
  description: 'Register your business with Bookly'
}

const RegisterPage = () => {
  // Vars
  const mode = getServerMode()
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  return (
    <>
      {/* Google Maps JavaScript API for Places Autocomplete */}
      {googleMapsApiKey && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
          strategy="beforeInteractive"
        />
      )}

      <RegisterWizard mode={mode} />
    </>
  )
}

export default RegisterPage
