'use client'

import { useState, useEffect } from 'react'
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
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'

import type { StepProps, Branch } from '../types'
import { TIMEZONES } from '../types'
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
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null)
  const [tempBranch, setTempBranch] = useState<Partial<Branch>>({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'EG',
    timezone: 'Africa/Cairo',
    phone: ''
  })

  // Initialize first branch from legacy data if branches are empty
  useEffect(() => {
    if ((!formData.branches || formData.branches.length === 0) && formData.addressLine1) {
      const mainBranch: Branch = {
        id: 'branch-1',
        name: `${formData.businessName} - Main Location` || 'Main Location',
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country || 'EG',
        timezone: formData.timezone || 'Africa/Cairo',
        isMainBranch: true,
        latitude: formData.latitude,
        longitude: formData.longitude,
        placeId: formData.placeId,
        formattedAddress: formData.formattedAddress
      }
      updateFormData({ branches: [mainBranch] })
    }
  }, [])

  const handlePlaceSelected = (place: google.maps.places.PlaceResult, isForDialog: boolean = false) => {
    const addressComponents = place.address_components || []
    const extractComponent = (type: string) => {
      const component = addressComponents.find(comp => comp.types.includes(type))
      return component?.long_name || ''
    }

    // Extract street number and route
    const streetNumber = extractComponent('street_number')
    const route = extractComponent('route')
    const premise = extractComponent('premise')

    // Build addressLine1 - use premise if no street address available
    let addressLine1 = ''
    if (streetNumber && route) {
      addressLine1 = `${streetNumber} ${route}`.trim()
    } else if (route) {
      addressLine1 = route
    } else if (premise) {
      addressLine1 = premise
    } else {
      // Fallback to the first part of formatted address
      addressLine1 = place.formatted_address?.split(',')[0] || ''
    }

    const city = extractComponent('locality') ||
      extractComponent('administrative_area_level_2') ||
      extractComponent('sublocality')
    const state = extractComponent('administrative_area_level_1') || extractComponent('administrative_area_level_2') || ''
    const postalCode = extractComponent('postal_code') || ''
    const country = extractComponent('country') || 'EG'

    const addressData = {
      formattedAddress: place.formatted_address || '',
      placeId: place.place_id || '',
      addressLine1: addressLine1,
      city: city,
      state: state,
      postalCode: postalCode,
      country: country,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng()
    }

    if (isForDialog) {
      setTempBranch(prev => ({ ...prev, ...addressData }))
    } else {
      // Always update formData when not in dialog mode
      updateFormData(addressData)
      setValidationErrors({})
    }
  }

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranchId(branch.id)
      setTempBranch(branch)
    } else {
      setEditingBranchId(null)
      setTempBranch({
        name: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'EG',
        timezone: 'Africa/Cairo',
        phone: ''
      })
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingBranchId(null)
    setTempBranch({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'EG',
      timezone: 'Africa/Cairo',
      phone: ''
    })
  }

  const handleSaveBranch = () => {
    if (
      !tempBranch.name ||
      !tempBranch.addressLine1 ||
      !tempBranch.city ||
      !tempBranch.state ||
      !tempBranch.postalCode
    ) {
      return
    }

    const currentBranches = formData.branches || []

    if (editingBranchId) {
      // Edit existing branch
      const updatedBranches = currentBranches.map(b =>
        b.id === editingBranchId ? ({ ...tempBranch, id: editingBranchId } as Branch) : b
      )
      updateFormData({ branches: updatedBranches })
    } else {
      // Add new branch
      const newBranch: Branch = {
        ...tempBranch,
        id: `branch-${Date.now()}`,
        isMainBranch: currentBranches.length === 0
      } as Branch
      updateFormData({ branches: [...currentBranches, newBranch] })
    }

    handleCloseDialog()
  }

  const handleDeleteBranch = (id: string) => {
    if (!formData.branches) return

    const branch = formData.branches.find(b => b.id === id)
    if (branch?.isMainBranch && formData.branches.length > 1) {
      alert('Cannot delete main branch. Set another branch as main first.')
      return
    }

    const updatedBranches = formData.branches.filter(b => b.id !== id)
    updateFormData({ branches: updatedBranches })
  }

  const handleSetMainBranch = (id: string) => {
    if (!formData.branches) return

    const updatedBranches = formData.branches.map(b => ({
      ...b,
      isMainBranch: b.id === id
    }))
    updateFormData({ branches: updatedBranches })
  }

  const validate = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.mobileOnly) {
      if (formData.hasMultipleBranches) {
        if (!formData.branches || formData.branches.length === 0) {
          errors.branches = 'Please add at least one branch location'
        }
      } else {
        if (!formData.addressLine1) errors.addressLine1 = 'Address is required'
        if (!formData.city) errors.city = 'City is required'
        // State and postal code are optional for some addresses
        if (formData.postalCode) {
          const postalError = validatePostalCode(formData.postalCode, formData.country)
          if (postalError) errors.postalCode = postalError
        }
      }
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleContinue = () => {
    if (validate()) {
      // If single branch mode, ensure branches array has the data
      if (
        !formData.hasMultipleBranches &&
        formData.addressLine1 &&
        (!formData.branches || formData.branches.length === 0)
      ) {
        const mainBranch: Branch = {
          id: 'branch-1',
          name: formData.businessName ? `${formData.businessName} - Main Location` : 'Main Location',
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2 || '',
          city: formData.city,
          state: formData.state || '',
          postalCode: formData.postalCode || '',
          country: formData.country || 'EG',
          timezone: formData.timezone || 'Africa/Cairo',
          isMainBranch: true,
          latitude: formData.latitude,
          longitude: formData.longitude,
          placeId: formData.placeId,
          formattedAddress: formData.formattedAddress
        }
        updateFormData({ branches: [mainBranch] })
      }
      handleNext()
    }
  }

  const handleMultipleBranchesChange = (checked: boolean) => {
    updateFormData({ hasMultipleBranches: checked })
    setValidationErrors({})
  }

  return (
    <div className='flex flex-col gap-5'>
      <div className='text-center mb-2'>
        <Typography variant='h5' className='mb-2'>
          Where Are You Located?
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Let customers know where to find you
        </Typography>
      </div>

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.mobileOnly}
            onChange={e => {
              updateFormData({ mobileOnly: e.target.checked })
              if (e.target.checked) setValidationErrors({})
            }}
          />
        }
        label='I provide mobile services only (no fixed location)'
      />

      {!formData.mobileOnly && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasMultipleBranches}
                onChange={e => handleMultipleBranchesChange(e.target.checked)}
              />
            }
            label='I have multiple business locations'
          />

          {formData.hasMultipleBranches ? (
            <>
              {/* Multi-Branch Management */}
              {validationErrors.branches && <Alert severity='error'>{validationErrors.branches}</Alert>}

              <div className='flex flex-col gap-3'>
                {formData.branches &&
                  formData.branches.map(branch => (
                    <Card key={branch.id} variant='outlined' className='shadow-sm'>
                      <CardContent className='flex items-center justify-between gap-3 p-4'>
                        <Box className='flex items-center gap-3 flex-1'>
                          <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary'>
                            <i className='ri-map-pin-line text-xl' />
                          </div>
                          <Box className='flex-1'>
                            <Typography variant='body1' className='font-medium'>
                              {branch.name}
                              {branch.isMainBranch && (
                                <Chip label='Main' size='small' color='primary' className='ml-2' />
                              )}
                            </Typography>
                            <Typography variant='body2' color='text.secondary' className='text-sm'>
                              {branch.addressLine1}, {branch.city}, {branch.state}
                            </Typography>
                          </Box>
                        </Box>

                        <Box className='flex gap-1'>
                          {!branch.isMainBranch && (
                            <IconButton
                              size='small'
                              onClick={() => handleSetMainBranch(branch.id)}
                              title='Set as main branch'
                            >
                              <i className='ri-star-line' />
                            </IconButton>
                          )}
                          <IconButton size='small' onClick={() => handleOpenDialog(branch)} className='text-primary'>
                            <i className='ri-pencil-line' />
                          </IconButton>
                          {formData.branches && formData.branches.length > 1 && (
                            <IconButton
                              size='small'
                              onClick={() => handleDeleteBranch(branch.id)}
                              className='text-error'
                            >
                              <i className='ri-delete-bin-line' />
                            </IconButton>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <Button
                fullWidth
                variant='outlined'
                onClick={() => handleOpenDialog()}
                startIcon={<i className='ri-add-line' />}
                className='border-2 border-dashed'
              >
                Add Branch Location
              </Button>
            </>
          ) : (
            <>
              {/* Single Branch Location */}
              <GooglePlacesAutocomplete
                value={formData.formattedAddress || formData.addressLine1 || ''}
                onChange={value => updateFormData({ addressLine1: value, formattedAddress: '' })}
                onPlaceSelected={place => handlePlaceSelected(place, false)}
                error={!!validationErrors.addressLine1}
                helperText={validationErrors.addressLine1 || 'Start typing to search for your address'}
                label='Search Your Address'
                placeholder='Start typing your address...'
              />

              <GoogleMapPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng, address) => {
                  updateFormData({
                    latitude: lat,
                    longitude: lng,
                    formattedAddress: address,
                    addressLine1: address.split(',')[0] || address
                  })
                  setValidationErrors({})
                }}
                height='min(400px, 50vh)'
              />

              {/* Address Details - Always visible below map */}
              <TextField
                fullWidth
                label='Street Address'
                value={formData.addressLine1 || ''}
                onChange={e => {
                  updateFormData({ addressLine1: e.target.value })
                  if (validationErrors.addressLine1) {
                    setValidationErrors({ ...validationErrors, addressLine1: '' })
                  }
                }}
                error={!!validationErrors.addressLine1}
                helperText={validationErrors.addressLine1 || 'Street address, P.O. box'}
                placeholder='e.g., 7 Ali Hasan Ateya'
              />

              <Box className='flex flex-col sm:flex-row gap-3'>
                <TextField
                  fullWidth
                  label='City'
                  value={formData.city || ''}
                  onChange={e => {
                    updateFormData({ city: e.target.value })
                    if (validationErrors.city) {
                      setValidationErrors({ ...validationErrors, city: '' })
                    }
                  }}
                  error={!!validationErrors.city}
                  helperText={validationErrors.city}
                  placeholder='e.g., Agouza'
                />

                <TextField
                  fullWidth
                  label='State / Province (Optional)'
                  value={formData.state || ''}
                  onChange={e => {
                    updateFormData({ state: e.target.value })
                  }}
                  helperText='State, province, or region'
                  placeholder='e.g., Giza Governorate'
                />
              </Box>

              <Box className='flex flex-col sm:flex-row gap-3'>
                <TextField
                  fullWidth
                  label='Postal Code (Optional)'
                  value={formData.postalCode || ''}
                  onChange={e => {
                    updateFormData({ postalCode: e.target.value })
                    if (validationErrors.postalCode) {
                      setValidationErrors({ ...validationErrors, postalCode: '' })
                    }
                  }}
                  error={!!validationErrors.postalCode}
                  helperText={validationErrors.postalCode || 'ZIP or postal code'}
                  placeholder='e.g., 3755151'
                />

                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={formData.country || 'EG'}
                    label='Country'
                    onChange={e => updateFormData({ country: e.target.value })}
                  >
                    {COUNTRIES.map(country => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
        </>
      )}

      {formData.mobileOnly && (
        <Box className='p-4 bg-primary/10 rounded-lg'>
          <Typography variant='body2' color='text.secondary'>
            Great! You can still accept bookings from customers in your service area.
          </Typography>
        </Box>
      )}

      {/* Branch Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth='md' fullWidth>
        <DialogTitle>{editingBranchId ? 'Edit Branch' : 'Add Branch Location'}</DialogTitle>
        <DialogContent className='pt-4'>
          <div className='flex flex-col gap-4'>
            <TextField
              fullWidth
              label='Branch Name'
              value={tempBranch.name}
              onChange={e => setTempBranch({ ...tempBranch, name: e.target.value })}
              placeholder='e.g., Downtown Location, West Side Branch'
              required
            />

            <TextField
              fullWidth
              label='Address Line 1'
              value={tempBranch.addressLine1}
              onChange={e => setTempBranch({ ...tempBranch, addressLine1: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label='Address Line 2'
              value={tempBranch.addressLine2 || ''}
              onChange={e => setTempBranch({ ...tempBranch, addressLine2: e.target.value })}
            />

            <Box className='flex gap-3'>
              <TextField
                fullWidth
                label='City'
                value={tempBranch.city}
                onChange={e => setTempBranch({ ...tempBranch, city: e.target.value })}
                required
              />

              <TextField
                fullWidth
                label='State'
                value={tempBranch.state}
                onChange={e => setTempBranch({ ...tempBranch, state: e.target.value })}
                required
              />
            </Box>

            <TextField
              fullWidth
              label='Postal Code'
              value={tempBranch.postalCode}
              onChange={e => setTempBranch({ ...tempBranch, postalCode: e.target.value })}
              required
            />

            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={tempBranch.country || 'EG'}
                label='Country'
                onChange={e => setTempBranch({ ...tempBranch, country: e.target.value })}
              >
                {COUNTRIES.map(country => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Timezone</InputLabel>
              <Select
                value={tempBranch.timezone || 'Africa/Cairo'}
                label='Timezone'
                onChange={e => setTempBranch({ ...tempBranch, timezone: e.target.value })}
              >
                {TIMEZONES.map(tz => (
                  <MenuItem key={tz} value={tz}>
                    {tz}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label='Phone (Optional)'
              value={tempBranch.phone || ''}
              onChange={e => setTempBranch({ ...tempBranch, phone: e.target.value })}
              placeholder='+20 123 456 7890'
            />
          </div>
        </DialogContent>
        <DialogActions className='p-4'>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleSaveBranch}
            disabled={
              !tempBranch.name ||
              !tempBranch.addressLine1 ||
              !tempBranch.city ||
              !tempBranch.state ||
              !tempBranch.postalCode
            }
          >
            {editingBranchId ? 'Save Changes' : 'Add Branch'}
          </Button>
        </DialogActions>
      </Dialog>

      <Box className='flex gap-3 justify-between mt-4'>
        <Button variant='outlined' onClick={handlePrev}>
          Back
        </Button>
        <Button variant='contained' onClick={handleContinue}>
          Continue
        </Button>
      </Box>
    </div>
  )
}

export default LocationStep
