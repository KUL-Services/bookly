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


export function ResourceEditorDrawer({ open, onClose, resource, selectedBranchId }: ResourceEditorDrawerProps) {
  const { createResource, updateResource } = useStaffManagementStore()

  const [name, setName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [capacity, setCapacity] = useState(1)

  // Load resource data if editing
  useEffect(() => {
    if (resource) {
      setName(resource.name)
      setBranchId(resource.branchId)
      setCapacity(resource.capacity)
    } else {
      // Reset for new resource - use selectedBranchId if available
      setName('')
      setBranchId(selectedBranchId || mockBranches[0]?.id || '')
      setCapacity(1)
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
        capacity
      })
    } else {
      // Create new
      createResource({
        name,
        branchId,
        capacity
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
            placeholder="e.g., Styling Chair #1, Massage Table #2"
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
              disabled={!!resource}
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
