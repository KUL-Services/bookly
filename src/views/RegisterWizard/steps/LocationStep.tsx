'use client'

import { useState } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import Divider from '@mui/material/Divider'

import type { StepProps } from '../types'
import { validatePostalCode } from '../utils'
import GooglePlacesAutocomplete from '../components/GooglePlacesAutocomplete'
import GoogleMapPicker from '../components/GoogleMapPicker'

const COUNTRIES = [
  { code: 'EG', name: 'Egypt' },
  { code: 'US', name: 'United States' },
  { code: 'UK', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'AE', name: 'United Arab Emirates' }
]

const LocationStep = ({
  handleNext,
  handlePrev,
  formData,
  updateFormData,
  validationErrors,
  setValidationErrors
}: StepProps) => {
  const [useManualEntry, setUseManualEntry] = useState(false)

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    console.log('Selected place:', place)

    // Extract address components
    const addressComponents = place.address_components || []
    const extractComponent = (type: string) => {
      const component = addressComponents.find((comp) => comp.types.includes(type))
      return component?.long_name || ''
    }

    // Update form data with extracted address
    updateFormData({
      formattedAddress: place.formatted_address || '',
      placeId: place.place_id || '',
      addressLine1: `${extractComponent('street_number')} ${extractComponent('route')}`.trim() || extractComponent('premise') || '',
      city: extractComponent('locality') || extractComponent('administrative_area_level_2'),
      state: extractComponent('administrative_area_level_1'),
      postalCode: extractComponent('postal_code'),
      country: extractComponent('country'),
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng()
    })

    // Clear any validation errors
    setValidationErrors({})
  }

  const handleMapLocationChange = (lat: number, lng: number, address: string) => {
    console.log('Map location changed:', { lat, lng, address })

    // Update coordinates and formatted address from map
    updateFormData({
      latitude: lat,
      longitude: lng,
      formattedAddress: address,
      addressLine1: address.split(',')[0] || address // Use first part as address line 1
    })

    // Clear validation errors
    setValidationErrors({})
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.mobileOnly) {
      if (!formData.addressLine1) errors.addressLine1 = 'Address is required'
      if (!formData.city) errors.city = 'City is required'
      if (!formData.state) errors.state = 'State/Province is required'
      if (!formData.postalCode) errors.postalCode = 'Postal code is required'
      else {
        const postalError = validatePostalCode(formData.postalCode, formData.country)
        if (postalError) errors.postalCode = postalError
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      handleNext()
    }
  }

  const handleMobileOnlyChange = (checked: boolean) => {
    updateFormData({ mobileOnly: checked })
    if (checked) {
      // Clear validation errors when switching to mobile-only
      setValidationErrors({})
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center mb-2">
        <Typography variant="h5" className="mb-2">
          Where Are You Located?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Let customers know where to find you
        </Typography>
      </div>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.mobileOnly}
            onChange={(e) => handleMobileOnlyChange(e.target.checked)}
          />
        }
        label="I provide mobile services only (no fixed location)"
      />

      {!formData.mobileOnly && (
        <>
          {/* Google Places Autocomplete */}
          {!useManualEntry ? (
            <>
              <Alert severity="info" className="flex items-center justify-between">
                <span>Search for your address using Google Maps</span>
                <Button size="small" onClick={() => setUseManualEntry(true)}>
                  Enter Manually
                </Button>
              </Alert>

              <GooglePlacesAutocomplete
                value={formData.formattedAddress || formData.addressLine1}
                onChange={(value) => updateFormData({ addressLine1: value })}
                onPlaceSelected={handlePlaceSelected}
                error={!!validationErrors.addressLine1}
                helperText={validationErrors.addressLine1 || 'Start typing to search for your address'}
                label="Search Your Address"
                placeholder="123 Main Street, Cairo..."
              />

              <Divider className="my-4">
                <Typography variant="body2" color="text.secondary">
                  or select on map
                </Typography>
              </Divider>

              {/* Interactive Map - Responsive height */}
              <GoogleMapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={handleMapLocationChange}
                height="min(400px, 50vh)" // Responsive: max 400px or 50% viewport height
              />

              {/* Show filled fields after selection */}
              {formData.formattedAddress && (
                <Box className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <Typography variant="body2" className="font-medium mb-1">
                    <i className="ri-checkbox-circle-line text-success mr-1" />
                    Address Confirmed
                  </Typography>
                  <Typography variant="body2" color="text.secondary" className="text-sm">
                    {formData.formattedAddress}
                  </Typography>
                  <Button size="small" onClick={() => setUseManualEntry(true)} className="mt-2">
                    Edit Details Manually
                  </Button>
                </Box>
              )}
            </>
          ) : (
            <>
              <Alert severity="info" className="flex items-center justify-between">
                <span>Manual address entry mode</span>
                <Button size="small" onClick={() => setUseManualEntry(false)}>
                  Use Google Maps
                </Button>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.country}
                  label="Country"
                  onChange={(e) => updateFormData({ country: e.target.value })}
                >
                  {COUNTRIES.map((country) => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(e) => {
                  updateFormData({ addressLine1: e.target.value })
                  if (validationErrors.addressLine1) {
                    setValidationErrors({ ...validationErrors, addressLine1: '' })
                  }
                }}
                error={!!validationErrors.addressLine1}
                helperText={validationErrors.addressLine1 || 'Street address, P.O. box'}
                required
              />

              <TextField
                fullWidth
                label="Address Line 2"
                value={formData.addressLine2}
                onChange={(e) => updateFormData({ addressLine2: e.target.value })}
                helperText="Apartment, suite, unit, building, floor, etc. (optional)"
              />

              <Box className="flex flex-col sm:flex-row gap-3">
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={(e) => {
                    updateFormData({ city: e.target.value })
                    if (validationErrors.city) {
                      setValidationErrors({ ...validationErrors, city: '' })
                    }
                  }}
                  error={!!validationErrors.city}
                  helperText={validationErrors.city}
                  required
                />

                <TextField
                  fullWidth
                  label="State / Province"
                  value={formData.state}
                  onChange={(e) => {
                    updateFormData({ state: e.target.value })
                    if (validationErrors.state) {
                      setValidationErrors({ ...validationErrors, state: '' })
                    }
                  }}
                  error={!!validationErrors.state}
                  helperText={validationErrors.state}
                  required
                />
              </Box>

              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => {
                  updateFormData({ postalCode: e.target.value })
                  if (validationErrors.postalCode) {
                    setValidationErrors({ ...validationErrors, postalCode: '' })
                  }
                }}
                error={!!validationErrors.postalCode}
                helperText={validationErrors.postalCode}
                required
              />
            </>
          )}
        </>
      )}

      {formData.mobileOnly && (
        <Box className="p-4 bg-primary/10 rounded-lg">
          <Typography variant="body2" color="text.secondary">
            Great! You can still accept bookings from customers in your service area. You'll be able to
            specify your coverage zones in the next steps.
          </Typography>
        </Box>
      )}

      <Box className="flex gap-3 justify-between mt-4">
        <Button variant="outlined" onClick={handlePrev}>
          Back
        </Button>
        <Button variant="contained" onClick={handleContinue}>
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default LocationStep
