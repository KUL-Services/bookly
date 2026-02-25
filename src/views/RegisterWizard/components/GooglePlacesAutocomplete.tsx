'use client'

import { useEffect, useRef, useState } from 'react'
import TextField from '@mui/material/TextField'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import IconButton from '@mui/material/IconButton'
import { ensureGoogleMapsLoaded } from './google-maps-loader'

interface GooglePlacesAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void
  error?: boolean
  helperText?: string
  label?: string
  placeholder?: string
}

const GooglePlacesAutocomplete = ({
  value,
  onChange,
  onPlaceSelected,
  error,
  helperText,
  label = 'Address',
  placeholder = 'Start typing your address...'
}: GooglePlacesAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const isSelectingPlace = useRef(false)
  const lastExternalValue = useRef(value)

  // Sync input value when external value changes (e.g., from map picker)
  useEffect(() => {
    if (inputRef.current && value !== lastExternalValue.current) {
      // Only update if the change came from external source (not from typing)
      if (!isSelectingPlace.current) {
        inputRef.current.value = value
      }
      lastExternalValue.current = value
    }
  }, [value])

  useEffect(() => {
    let isCancelled = false

    const initializeAutocomplete = async () => {
      setIsLoading(true)
      setApiError(null)

      try {
        await ensureGoogleMapsLoaded({ libraries: ['places'] })

        let tries = 0
        while (!isCancelled && !inputRef.current && tries < 40) {
          await new Promise(resolve => setTimeout(resolve, 50))
          tries += 1
        }

        if (isCancelled) return
        if (!inputRef.current) {
          throw new Error('Address input is not ready yet.')
        }

        if (autocompleteRef.current && window.google?.maps?.event) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
          autocompleteRef.current = null
        }

        autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          fields: ['address_components', 'formatted_address', 'geometry', 'place_id', 'name']
        })

        autocompleteRef.current.addListener('place_changed', () => {
          isSelectingPlace.current = true
          const place = autocompleteRef.current?.getPlace()

          if (place && place.formatted_address && inputRef.current) {
            inputRef.current.value = place.formatted_address
            onChange(place.formatted_address)
            onPlaceSelected(place)

            setTimeout(() => {
              isSelectingPlace.current = false
            }, 100)
          } else {
            isSelectingPlace.current = false
          }
        })

        setIsLoading(false)
      } catch (error) {
        if (isCancelled) return
        console.error('Failed to initialize Google Places Autocomplete:', error)
        setApiError('Failed to load address autocomplete. Please enter manually.')
        setIsLoading(false)
      }
    }

    initializeAutocomplete()

    return () => {
      isCancelled = true
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [])

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      onChange('')
      // Focus the input after clearing so user can immediately start typing
      inputRef.current.focus()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't interfere if user is selecting from autocomplete dropdown
    if (isSelectingPlace.current) {
      return
    }
    onChange(e.target.value)
  }

  return (
    <Box className='relative'>
      <TextField
        fullWidth
        inputRef={inputRef}
        label={label}
        placeholder={value ? '' : placeholder}
        defaultValue={value}
        InputLabelProps={{ shrink: true }}
        onChange={handleInputChange}
        onKeyDown={e => {
          // Prevent form submission on Enter when selecting from dropdown
          if (e.key === 'Enter') {
            e.preventDefault()
          }
        }}
        error={error}
        helperText={helperText}
        disabled={isLoading}
        inputProps={{
          inputMode: 'text',
          autoComplete: 'off',
          'aria-autocomplete': 'list'
        }}
        InputProps={{
          endAdornment: (
            <>
              {isLoading ? (
                <CircularProgress size={20} />
              ) : value ? (
                <IconButton size='small' onClick={handleClear} edge='end'>
                  <i className='ri-close-circle-line' />
                </IconButton>
              ) : (
                <i className='ri-map-pin-line text-gray-400' />
              )}
            </>
          )
        }}
      />

      {apiError && (
        <Alert severity='warning' className='mt-2 text-sm'>
          {apiError}
        </Alert>
      )}
    </Box>
  )
}

export default GooglePlacesAutocomplete
