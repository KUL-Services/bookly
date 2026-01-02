'use client'

import { useState } from 'react'

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
import InputAdornment from '@mui/material/InputAdornment'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'

// Types
import type { Category, Branch, CreateServiceRequest } from '@/lib/api'

// API Imports
import { MediaService } from '@/lib/api'

// Components
import GalleryUpload from '@/components/media/GalleryUpload'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateServiceRequest) => void
  categories: Category[]
  branches: Branch[]
}

const CreateServiceDialog = ({ open, onClose, onSubmit, categories, branches }: Props) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))

  const [formData, setFormData] = useState<CreateServiceRequest>({
    name: '',
    description: '',
    location: '',
    price: '' as any, // Use empty string to avoid 0 placeholder issue
    duration: '' as any, // Use empty string to avoid 0 placeholder issue
    categoryIds: [],
    branchIds: [],
    gallery: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Service name is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Price must be greater than 0'
    if (!formData.duration || Number(formData.duration) <= 0) newErrors.duration = 'Duration must be greater than 0'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      ...formData,
      price: Number(formData.price),
      duration: Number(formData.duration)
    })
    handleClose()
  }

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      price: '' as any,
      duration: '' as any,
      categoryIds: [],
      branchIds: [],
      gallery: []
    })
    setErrors({})
    onClose()
  }

  const handleGalleryChange = (imageIds: string[]) => {
    setFormData(prev => ({ ...prev, gallery: imageIds }))
  }

  const handleImageDeleted = async (imageId: string) => {
    try {
      await MediaService.deleteAsset(imageId)
      console.log('✅ Deleted service gallery image:', imageId)
    } catch (error) {
      console.warn('Failed to delete service gallery image:', error)
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
        <DialogTitle>Create New Service</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Service Name'
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Location'
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                error={!!errors.location}
                helperText={errors.location}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                multiline
                rows={3}
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Price'
                type='number'
                value={formData.price}
                onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                error={!!errors.price}
                helperText={errors.price}
                placeholder='Enter price (e.g., 25.00)'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Duration'
                type='number'
                value={formData.duration}
                onChange={e => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                error={!!errors.duration}
                helperText={errors.duration}
                placeholder='Enter duration (e.g., 30)'
                InputProps={{
                  endAdornment: <InputAdornment position='end'>minutes</InputAdornment>
                }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Categories</InputLabel>
                <Select
                  multiple
                  value={formData.categoryIds || []}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      categoryIds: typeof e.target.value === 'string' ? [e.target.value] : e.target.value
                    }))
                  }
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(id => (
                        <Chip key={id} label={categories.find(cat => cat.id === id)?.name || id} size='small' />
                      ))}
                    </Box>
                  )}
                >
                  {categories.map(category => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={(formData.categoryIds || []).includes(category.id)} />
                      <ListItemText primary={category.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Branches</InputLabel>
                <Select
                  multiple
                  value={formData.branchIds || []}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      branchIds: typeof e.target.value === 'string' ? [e.target.value] : e.target.value
                    }))
                  }
                  renderValue={selected => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map(id => (
                        <Chip key={id} label={branches.find(branch => branch.id === id)?.name || id} size='small' />
                      ))}
                    </Box>
                  )}
                >
                  {branches.map(branch => (
                    <MenuItem key={branch.id} value={branch.id}>
                      <Checkbox checked={(formData.branchIds || []).includes(branch.id)} />
                      <ListItemText primary={branch.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <GalleryUpload
                currentImageIds={formData.gallery || []}
                currentImageUrls={[]}
                onImagesUploaded={handleGalleryChange}
                onImageDeleted={handleImageDeleted}
                label='Service Gallery'
                description='Upload images showcasing your service'
                maxImages={8}
                maxSizeMB={5}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type='submit' variant='contained'>
            Create Service
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CreateServiceDialog
