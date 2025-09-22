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

// Types
import type { Branch, Service, UpdateBranchRequest } from '@/lib/api'

// Components
import GalleryUpload from '@/components/media/GalleryUpload'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: UpdateBranchRequest) => void
  branch: Branch
  services: Service[]
}

const EditBranchDialog = ({ open, onClose, onSubmit, branch, services }: Props) => {
  const [formData, setFormData] = useState<UpdateBranchRequest>({
    id: branch.id,
    name: branch.name,
    address: branch.address || '',
    mobile: branch.mobile || '',
    serviceIds: branch.services?.map(service => service.id) || [],
    gallery: branch.gallery || []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      id: branch.id,
      name: branch.name,
      address: branch.address || '',
      mobile: branch.mobile || '',
      serviceIds: branch.services?.map(service => service.id) || [],
      gallery: branch.gallery || []
    })
  }, [branch])

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

  const handleImageDeleted = (imageId: string) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery?.filter(id => id !== imageId) || []
    }))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Branch</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Branch Name'
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Address'
                multiline
                rows={2}
                value={formData.address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder='Enter the complete address of this branch'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Mobile Number'
                value={formData.mobile || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder='e.g., +1234567890'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Services</InputLabel>
                <Select
                  multiple
                  value={formData.serviceIds || []}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    serviceIds: typeof e.target.value === 'string' ? [e.target.value] : e.target.value
                  }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((id) => (
                        <Chip
                          key={id}
                          label={services.find(service => service.id === id)?.name || id}
                          size='small'
                        />
                      ))}
                    </Box>
                  )}
                >
                  {services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <GalleryUpload
                currentImageIds={formData.gallery || []}
                onImagesUploaded={handleGalleryChange}
                onImageDeleted={handleImageDeleted}
                label="Branch Gallery"
                description="Upload images showcasing your branch location"
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