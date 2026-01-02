'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

// Types
import type { Branch, Service, UpdateBranchRequest } from '@/lib/api'

// API Imports
import { MediaService } from '@/lib/api'

// Components
import GalleryUpload from '@/components/media/GalleryUpload'
import GooglePlacesAutocomplete from '@/views/RegisterWizard/components/GooglePlacesAutocomplete'
import GoogleMapPicker from '@/views/RegisterWizard/components/GoogleMapPicker'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: UpdateBranchRequest) => void
  branch: Branch
  services: Service[]
}

const EditBranchDialog = ({ open, onClose, onSubmit, branch, services }: Props) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [formData, setFormData] = useState<UpdateBranchRequest>({
    id: branch.id,
    name: branch.name,
    address: branch.address || '',
    mobile: branch.mobile || '',
    serviceIds: branch.services?.map(service => service.id) || [],
    gallery: branch.gallery || []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Extended address fields for map integration
  const [addressDetails, setAddressDetails] = useState({
    formattedAddress: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined
  })

  // Parse existing address when branch changes
  useEffect(() => {
    setFormData({
      id: branch.id,
      name: branch.name,
      address: branch.address || '',
      mobile: branch.mobile || '',
      serviceIds: branch.services?.map(service => service.id) || [],
      gallery: branch.gallery || []
    })

    // Parse the address if available
    if (branch.address) {
      const parts = branch.address.split(',').map(s => s.trim())
      setAddressDetails({
        formattedAddress: branch.address,
        addressLine1: parts[0] || '',
        addressLine2: '',
        city: parts[1] || '',
        state: parts[2] || '',
        postalCode: parts[3] || '',
        country: parts[4] || '',
        latitude: undefined,
        longitude: undefined
      })
    }
  }, [branch])

  const handlePlaceSelected = (place: google.maps.places.PlaceResult) => {
    const addressComponents = place.address_components || []
    const extractComponent = (type: string) => {
      const component = addressComponents.find(comp => comp.types.includes(type))
      return component?.long_name || ''
    }

    // Extract street number and route
    const streetNumber = extractComponent('street_number')
    const route = extractComponent('route')
    const premise = extractComponent('premise')

    // Build addressLine1
    let addressLine1 = ''
    if (streetNumber && route) {
      addressLine1 = `${streetNumber} ${route}`.trim()
    } else if (route) {
      addressLine1 = route
    } else if (premise) {
      addressLine1 = premise
    } else {
      addressLine1 = place.formatted_address?.split(',')[0] || ''
    }

    const city = extractComponent('locality') || extractComponent('administrative_area_level_2') || extractComponent('sublocality')
    const state = extractComponent('administrative_area_level_1') || extractComponent('administrative_area_level_2') || ''
    const postalCode = extractComponent('postal_code') || ''
    const country = extractComponent('country') || ''

    const newDetails = {
      formattedAddress: place.formatted_address || '',
      addressLine1,
      addressLine2: '',
      city,
      state,
      postalCode,
      country,
      latitude: place.geometry?.location?.lat(),
      longitude: place.geometry?.location?.lng()
    }

    setAddressDetails(newDetails)

    // Build complete address string
    const fullAddress = [
      addressLine1,
      city,
      state,
      postalCode,
      country
    ].filter(Boolean).join(', ')

    setFormData(prev => ({ ...prev, address: fullAddress }))
    setErrors(prev => ({ ...prev, address: '' }))
  }

  const handleMapLocationChange = (lat: number, lng: number, address: string) => {
    setAddressDetails(prev => ({
      ...prev,
      formattedAddress: address,
      addressLine1: address.split(',')[0] || address,
      latitude: lat,
      longitude: lng
    }))
    setFormData(prev => ({ ...prev, address }))
    setErrors(prev => ({ ...prev, address: '' }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Branch name is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
    setErrors({})
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  const handleGalleryChange = (imageIds: string[]) => {
    setFormData(prev => ({ ...prev, gallery: imageIds }))
  }

  const handleImageDeleted = async (imageId: string) => {
    try {
      await MediaService.deleteAsset(imageId)
      console.log('✅ Deleted branch gallery image:', imageId)
    } catch (error) {
      console.warn('Failed to delete branch gallery image:', error)
      // Don't block the UI, just log the warning
    }

    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery?.filter(id => id !== imageId) || []
    }))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth fullScreen={fullScreen}>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Branch</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Branch Name'
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            {/* Location Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Branch Location
                </Typography>
              </Divider>
            </Grid>

            {/* Google Places Search */}
            <Grid item xs={12}>
              <GooglePlacesAutocomplete
                value={addressDetails.formattedAddress || addressDetails.addressLine1 || ''}
                onChange={value => setAddressDetails(prev => ({ ...prev, addressLine1: value, formattedAddress: '' }))}
                onPlaceSelected={handlePlaceSelected}
                error={!!errors.address}
                helperText={errors.address || 'Search for your branch address'}
                label='Search Address'
                placeholder='Start typing to search...'
              />
            </Grid>

            {/* Google Map */}
            <Grid item xs={12}>
              <GoogleMapPicker
                latitude={addressDetails.latitude}
                longitude={addressDetails.longitude}
                onLocationChange={handleMapLocationChange}
                height='300px'
              />
            </Grid>

            {/* Address Details - directly below map */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Street Address'
                value={addressDetails.addressLine1}
                onChange={e => {
                  const value = e.target.value
                  setAddressDetails(prev => ({ ...prev, addressLine1: value }))
                  // Update formData.address
                  const fullAddress = [
                    value,
                    addressDetails.city,
                    addressDetails.state,
                    addressDetails.postalCode,
                    addressDetails.country
                  ].filter(Boolean).join(', ')
                  setFormData(prev => ({ ...prev, address: fullAddress }))
                }}
                placeholder='e.g., 123 Main Street'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                value={addressDetails.city}
                onChange={e => {
                  const value = e.target.value
                  setAddressDetails(prev => ({ ...prev, city: value }))
                  const fullAddress = [
                    addressDetails.addressLine1,
                    value,
                    addressDetails.state,
                    addressDetails.postalCode,
                    addressDetails.country
                  ].filter(Boolean).join(', ')
                  setFormData(prev => ({ ...prev, address: fullAddress }))
                }}
                placeholder='e.g., Cairo'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State/Region (Optional)'
                value={addressDetails.state}
                onChange={e => {
                  const value = e.target.value
                  setAddressDetails(prev => ({ ...prev, state: value }))
                  const fullAddress = [
                    addressDetails.addressLine1,
                    addressDetails.city,
                    value,
                    addressDetails.postalCode,
                    addressDetails.country
                  ].filter(Boolean).join(', ')
                  setFormData(prev => ({ ...prev, address: fullAddress }))
                }}
                placeholder='e.g., Cairo Governorate'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Postal Code (Optional)'
                value={addressDetails.postalCode}
                onChange={e => {
                  const value = e.target.value
                  setAddressDetails(prev => ({ ...prev, postalCode: value }))
                  const fullAddress = [
                    addressDetails.addressLine1,
                    addressDetails.city,
                    addressDetails.state,
                    value,
                    addressDetails.country
                  ].filter(Boolean).join(', ')
                  setFormData(prev => ({ ...prev, address: fullAddress }))
                }}
                placeholder='e.g., 12345'
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Country (Optional)'
                value={addressDetails.country}
                onChange={e => {
                  const value = e.target.value
                  setAddressDetails(prev => ({ ...prev, country: value }))
                  const fullAddress = [
                    addressDetails.addressLine1,
                    addressDetails.city,
                    addressDetails.state,
                    addressDetails.postalCode,
                    value
                  ].filter(Boolean).join(', ')
                  setFormData(prev => ({ ...prev, address: fullAddress }))
                }}
                placeholder='e.g., Egypt'
              />
            </Grid>

            {/* Other Details Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Additional Details
                </Typography>
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mobile Number'
                value={formData.mobile || ''}
                onChange={e => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder='e.g., +1234567890'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={formData.serviceIds || []}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      serviceIds: typeof e.target.value === 'string' ? [e.target.value] : e.target.value
                    }))
                  }
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(id => (
                        <Chip key={id} label={services.find(service => service.id === id)?.name || id} size='small' />
                      ))}
                    </Box>
                  )}
                >
                  {services.map(service => (
                    <MenuItem key={service.id} value={service.id}>
                      <Checkbox checked={(formData.serviceIds || []).includes(service.id)} />
                      <ListItemText primary={service.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <GalleryUpload
                currentImageIds={formData.gallery || []}
                currentImageUrls={
                  (formData.gallery || [])
                    .map(imageId => {
                      // Find the index of this imageId in the original branch.gallery
                      const originalIndex = (branch.gallery || []).indexOf(imageId)
                      // If found, return the corresponding URL, otherwise return empty string for new uploads
                      return originalIndex >= 0 ? (branch.galleryUrls || [])[originalIndex] : ''
                    })
                    .filter(url => url !== null && url !== undefined && url !== '') as string[]
                }
                onImagesUploaded={handleGalleryChange}
                onImageDeleted={handleImageDeleted}
                label='Branch Gallery'
                description='Upload images showcasing your branch location'
                maxImages={10}
                maxSizeMB={5}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' variant='contained'>
            Save Changes
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditBranchDialog
