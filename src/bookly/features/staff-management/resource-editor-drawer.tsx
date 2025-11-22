'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  IconButton,
  Divider
} from '@mui/material'
import { mockBranches } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { Resource } from '../calendar/types'

interface ResourceEditorDrawerProps {
  open: boolean
  onClose: () => void
  resource: Resource | null
  selectedBranchId?: string | null
}

const AMENITIES_OPTIONS = [
  'Air Conditioning',
  'Heating',
  'Mirrors',
  'Sound System',
  'Projector',
  'Yoga Mats',
  'Weights',
  'Cardio Equipment',
  'Showers',
  'Lockers',
  'Water Fountain',
  'WiFi',
  'Parking',
  'Wheelchair Accessible'
]

const COLOR_OPTIONS = [
  { value: '#1976d2', label: 'Blue' },
  { value: '#388e3c', label: 'Green' },
  { value: '#d32f2f', label: 'Red' },
  { value: '#f57c00', label: 'Orange' },
  { value: '#7b1fa2', label: 'Purple' },
  { value: '#0097a7', label: 'Cyan' },
  { value: '#c2185b', label: 'Pink' },
  { value: '#5d4037', label: 'Brown' },
  { value: '#455a64', label: 'Blue Grey' },
  { value: '#f9a825', label: 'Yellow' }
]

export function ResourceEditorDrawer({ open, onClose, resource, selectedBranchId }: ResourceEditorDrawerProps) {
  const { createResource, updateResource } = useStaffManagementStore()

  const [name, setName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [floor, setFloor] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [color, setColor] = useState('#1976d2')

  // Load resource data if editing
  useEffect(() => {
    if (resource) {
      setName(resource.name)
      setBranchId(resource.branchId)
      setCapacity(resource.capacity)
      setFloor(resource.floor || '')
      setAmenities(resource.amenities)
      setColor(resource.color || '#1976d2')
    } else {
      // Reset for new resource - use selectedBranchId if available
      setName('')
      setBranchId(selectedBranchId || mockBranches[0]?.id || '')
      setCapacity(10)
      setFloor('')
      setAmenities([])
      setColor('#1976d2')
    }
  }, [resource, open, selectedBranchId])

  const handleSave = () => {
    if (!name || !branchId) {
      alert('Please fill in all required fields')
      return
    }

    if (resource) {
      // Update existing
      updateResource(resource.id, {
        name,
        branchId,
        capacity,
        floor: floor || undefined,
        amenities,
        color
      })
    } else {
      // Create new
      createResource({
        name,
        branchId,
        capacity,
        floor: floor || undefined,
        amenities,
        color
      })
    }

    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" fontWeight={600}>
            {resource ? 'Edit Resource' : 'Add Resource'}
          </Typography>
          <IconButton onClick={handleCancel}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Name */}
          <TextField
            label="Resource Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Main Studio, Yoga Room"
            required
            fullWidth
          />

          {/* Branch */}
          <FormControl fullWidth required>
            <InputLabel>Branch</InputLabel>
            <Select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              label="Branch"
            >
              {mockBranches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Capacity */}
          <TextField
            type="number"
            label="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            InputProps={{
              startAdornment: <i className="ri-group-line" style={{ marginRight: 8, opacity: 0.5 }} />
            }}
            helperText="Maximum number of people"
            required
            fullWidth
          />

          {/* Floor */}
          <TextField
            label="Floor"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="e.g., 1st Floor, Basement"
            fullWidth
          />

          {/* Color */}
          <FormControl fullWidth>
            <InputLabel>Color</InputLabel>
            <Select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              label="Color"
              renderValue={(value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 1,
                      bgcolor: value,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  {COLOR_OPTIONS.find(c => c.value === value)?.label}
                </Box>
              )}
            >
              {COLOR_OPTIONS.map((colorOption) => (
                <MenuItem key={colorOption.value} value={colorOption.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: 1,
                        bgcolor: colorOption.value,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    {colorOption.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Amenities */}
          <FormControl fullWidth>
            <InputLabel>Amenities</InputLabel>
            <Select
              multiple
              value={amenities}
              onChange={(e) => setAmenities(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
              input={<OutlinedInput label="Amenities" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {AMENITIES_OPTIONS.map((amenity) => (
                <MenuItem key={amenity} value={amenity}>
                  {amenity}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Info Box */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'info.50',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.main'
            }}
          >
            <Typography variant="caption" color="info.dark">
              <strong>Tip:</strong> Resources are used for static scheduling mode. They represent
              physical spaces like studios, rooms, or facilities where classes or group sessions are held.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            fullWidth
          >
            {resource ? 'Save Changes' : 'Add Resource'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
