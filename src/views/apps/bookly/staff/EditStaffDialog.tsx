'use client'

import { useState, useEffect } from 'react'

// MUI Imports
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'

// Types
import type { Staff, UpdateStaffRequest, Branch, Service } from '@/lib/api'

// Components
import ImageUpload from '@/components/media/ImageUpload'

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: UpdateStaffRequest) => void
  staff: Staff
  branches: Branch[]
  services?: Service[]
}

const EditStaffDialog = ({ open, onClose, onSubmit, staff, branches, services = [] }: Props) => {
  const [formData, setFormData] = useState<UpdateStaffRequest>({
    id: staff.id,
    name: staff.name,
    mobile: staff.mobile || '',
    branchId: staff.branchId || '',
    serviceIds: staff.services?.map(s => s.id) || [],
    profilePhoto: staff.profilePhoto || null
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setFormData({
      id: staff.id,
      name: staff.name,
      mobile: staff.mobile || '',
      branchId: staff.branchId || '',
      serviceIds: staff.services?.map(s => s.id) || [],
      profilePhoto: staff.profilePhoto || null
    })
  }, [staff])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim()) newErrors.name = 'Staff name is required'

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

  const handleProfilePhotoUploaded = (imageId: string) => {
    setFormData(prev => ({ ...prev, profilePhoto: imageId }))
  }

  const handleProfilePhotoDeleted = () => {
    setFormData(prev => ({ ...prev, profilePhoto: null }))
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Staff Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Full Name'
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
                label='Mobile Number'
                value={formData.mobile}
                onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                placeholder='e.g., +1234567890'
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign to Branch</InputLabel>
                <Select
                  value={formData.branchId}
                  onChange={(e) => setFormData(prev => ({ ...prev, branchId: e.target.value as string }))}
                >
                  {branches.map((branch) => (
                    <MenuItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Assign Services</InputLabel>
                <Select
                  multiple
                  value={formData.serviceIds || []}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceIds: e.target.value as string[] }))}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const service = services.find(s => s.id === value)
                        return (
                          <Chip key={value} label={service?.name || value} size="small" />
                        )
                      })}
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
              <ImageUpload
                currentImageId={formData.profilePhoto}
                onImageUploaded={handleProfilePhotoUploaded}
                onImageDeleted={handleProfilePhotoDeleted}
                label="Profile Photo"
                description="Upload staff member's profile picture"
                maxSizeMB={3}
                width={150}
                height={150}
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

export default EditStaffDialog