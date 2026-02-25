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
  Divider,
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  Alert
} from '@mui/material'
import { useStaffManagementStore } from './staff-store'
import type { Resource } from '../calendar/types'

interface ResourceEditorDrawerProps {
  open: boolean
  onClose: () => void
  resource: Resource | null
  selectedBranchId?: string | null
}

export function ResourceEditorDrawer({ open, onClose, resource, selectedBranchId }: ResourceEditorDrawerProps) {
  const { createResource, updateResource, resources, apiBranches, apiServices } = useStaffManagementStore()

  const [name, setName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [capacity, setCapacity] = useState(1)
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [bookingMode, setBookingMode] = useState<'STATIC' | 'DYNAMIC'>('DYNAMIC')

  // Load resource data if editing
  useEffect(() => {
    if (resource) {
      setName(resource.name)
      setBranchId(resource.branchId)
      setCapacity(resource.capacity)
      setServiceIds(resource.serviceIds || [])
      setBookingMode((resource as any).bookingMode || 'DYNAMIC')
    } else {
      // Reset for new resource - use selectedBranchId if available
      setName('')
      setBranchId(selectedBranchId || apiBranches[0]?.id || '')
      setCapacity(1)
      setServiceIds([])
      setBookingMode('DYNAMIC')
    }
  }, [resource, open, selectedBranchId, apiBranches])

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
        serviceIds,
        bookingMode
      })
    } else {
      // Create new
      createResource({
        name,
        branchId,
        capacity,
        serviceIds,
        bookingMode
      })
    }

    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  // Check if a service is already assigned to another resource in the same branch
  const isServiceAssignedToOther = (serviceId: string): boolean => {
    if (resource && resource.serviceIds?.includes(serviceId)) {
      return false // Current resource can keep its services
    }

    // Only check for conflicts within the same branch
    const resourcesInSameBranch = resources.filter(r => r.branchId === branchId && r.id !== resource?.id)
    return resourcesInSameBranch.some(r => r.serviceIds?.includes(serviceId))
  }

  const getServiceConflict = (serviceId: string): string | null => {
    // Only check for conflicts within the same branch
    const resourcesInSameBranch = resources.filter(r => r.branchId === branchId && r.id !== resource?.id)
    const conflictResource = resourcesInSameBranch.find(r => r.serviceIds?.includes(serviceId))
    return conflictResource ? conflictResource.name : null
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500 } }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant='h5' fontWeight={600}>
            {resource ? 'Edit Resource' : 'Add Resource'}
          </Typography>
          <IconButton onClick={handleCancel}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Name */}
          <TextField
            label='Resource Name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='e.g., Styling Chair #1, Massage Table #2'
            required
            fullWidth
          />

          {/* Branch */}
          <FormControl fullWidth required>
            <InputLabel>Branch</InputLabel>
            <Select
              value={branchId}
              onChange={e => setBranchId(e.target.value)}
              label='Branch'
              disabled={!!resource || !!selectedBranchId}
            >
              {apiBranches.map(branch => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Capacity */}
          <TextField
            type='number'
            label='Capacity'
            value={capacity}
            onChange={e => setCapacity(Number(e.target.value))}
            InputProps={{
              startAdornment: <i className='ri-group-line' style={{ marginRight: 8, opacity: 0.5 }} />
            }}
            helperText='Maximum number of people'
            required
            fullWidth
          />

          <Divider />

          {/* Booking Mode */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Booking Mode
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Booking Mode</InputLabel>
            <Select
              value={bookingMode}
              onChange={e => setBookingMode(e.target.value as 'STATIC' | 'DYNAMIC')}
              label='Booking Mode'
              renderValue={value => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i
                    className={value === 'STATIC' ? 'ri-calendar-check-line' : 'ri-time-line'}
                    style={{ opacity: 0.7 }}
                  />
                  {value === 'STATIC' ? 'Fixed (Pre-defined Sessions)' : 'Flex (Flexible Appointments)'}
                </Box>
              )}
            >
              <MenuItem value='DYNAMIC'>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <i className='ri-time-line' style={{ marginTop: 2, opacity: 0.7 }} />
                  <Box>
                    <Typography variant='body2' fontWeight={500}>
                      Flex (Flexible Appointments)
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Clients can book any available time slot
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <MenuItem value='STATIC'>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <i className='ri-calendar-check-line' style={{ marginTop: 2, opacity: 0.7 }} />
                  <Box>
                    <Typography variant='body2' fontWeight={500}>
                      Fixed (Pre-defined Sessions)
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Clients join pre-defined sessions with fixed times
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          <Alert severity='info' sx={{ py: 0.5 }}>
            <Typography variant='caption'>
              {bookingMode === 'STATIC'
                ? 'Sessions must be created after adding the resource. Clients will see and join available sessions.'
                : 'Clients can choose any time slot based on resource availability.'}
            </Typography>
          </Alert>

          <Divider />

          {/* Service Assignment */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Service Assignment
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Assigned Services</InputLabel>
            <Select
              multiple
              value={serviceIds}
              onChange={e => {
                const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                // Check for conflicts
                const conflicts = value.filter(id => isServiceAssignedToOther(id))
                if (conflicts.length > 0) {
                  const conflictNames = conflicts
                    .map(id => {
                      const service = apiServices.find(s => s.id === id)
                      const conflictResource = getServiceConflict(id)
                      return `${service?.name} (assigned to ${conflictResource})`
                    })
                    .join(', ')
                  alert(`Cannot assign: ${conflictNames}. Services can only be assigned to one resource.`)
                  return
                }
                setServiceIds(value)
              }}
              input={<OutlinedInput label='Assigned Services' />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => {
                    const service = apiServices.find(s => s.id === value)
                    return <Chip key={value} label={service?.name || value} size='small' />
                  })}
                </Box>
              )}
            >
              {apiServices.map(service => {
                const assigned = isServiceAssignedToOther(service.id)
                const conflictResource = getServiceConflict(service.id)
                const isSelected = serviceIds.includes(service.id)
                return (
                  <MenuItem key={service.id} value={service.id} disabled={assigned}>
                    <Checkbox checked={isSelected} disabled={assigned} />
                    <ListItemText primary={service.name} />
                    {assigned && conflictResource && (
                      <Chip
                        label={`In ${conflictResource}`}
                        size='small'
                        sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </MenuItem>
                )
              })}
            </Select>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
              Services assigned to this resource will be scheduled here
            </Typography>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' onClick={handleCancel} fullWidth>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSave} fullWidth>
            {resource ? 'Save Changes' : 'Add Resource'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
