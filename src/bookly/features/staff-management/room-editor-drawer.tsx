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
  Divider,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Checkbox,
  ListItemText
} from '@mui/material'
import { mockBranches, mockServices } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { ManagedRoom } from '../calendar/types'

interface RoomEditorDrawerProps {
  open: boolean
  onClose: () => void
  room: ManagedRoom | null
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
  'Wheelchair Accessible',
  'Natural Lighting',
  'Privacy Curtains',
  'Massage Tables',
  'Salon Chairs',
  'Styling Stations'
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

export function RoomEditorDrawer({ open, onClose, room, selectedBranchId }: RoomEditorDrawerProps) {
  const { createRoom, updateRoom, rooms } = useStaffManagementStore()

  const [name, setName] = useState('')
  const [branchId, setBranchId] = useState('')
  const [capacity, setCapacity] = useState(10)
  const [floor, setFloor] = useState('')
  const [amenities, setAmenities] = useState<string[]>([])
  const [color, setColor] = useState('#1976d2')
  const [serviceIds, setServiceIds] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [customAmenity, setCustomAmenity] = useState('')
  const [roomType, setRoomType] = useState<'dynamic' | 'static'>('dynamic')

  // Load room data if editing
  useEffect(() => {
    if (room) {
      setName(room.name)
      setBranchId(room.branchId)
      setCapacity(room.capacity)
      setFloor(room.floor || '')
      setAmenities(room.amenities || [])
      setColor(room.color || '#1976d2')
      setServiceIds(room.serviceIds || [])
      setDescription(room.description || '')
      setRoomType(room.roomType || 'dynamic')
    } else {
      // Reset for new room - use selectedBranchId if available
      setName('')
      setBranchId(selectedBranchId || mockBranches[0]?.id || '')
      setCapacity(10)
      setFloor('')
      setAmenities([])
      setColor('#1976d2')
      setServiceIds([])
      setDescription('')
      setRoomType('dynamic')
    }
  }, [room, open, selectedBranchId])

  const handleSave = () => {
    if (!name || !branchId) {
      alert('Please fill in all required fields (Name and Branch)')
      return
    }

    const roomData = {
      name,
      branchId,
      capacity,
      floor: floor || undefined,
      amenities,
      color,
      serviceIds,
      description: description || undefined,
      roomType
    }

    if (room) {
      // Update existing
      updateRoom(room.id, roomData)
    } else {
      // Create new
      createRoom(roomData)
    }

    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const handleAddCustomAmenity = () => {
    const trimmed = customAmenity.trim()
    if (trimmed && !amenities.includes(trimmed)) {
      setAmenities([...amenities, trimmed])
      setCustomAmenity('')
    }
  }

  // Check if a service is already assigned to another room in the same branch
  const isServiceAssigned = (serviceId: string): boolean => {
    if (room && room.serviceIds?.includes(serviceId)) {
      return false // Current room can keep its services
    }
    // Only check for conflicts within the same branch
    const roomsInSameBranch = rooms.filter(r => r.branchId === branchId && r.id !== room?.id)
    return roomsInSameBranch.some(r => r.serviceIds?.includes(serviceId))
  }

  const getServiceConflict = (serviceId: string): string | null => {
    // Only check for conflicts within the same branch
    const roomsInSameBranch = rooms.filter(r => r.branchId === branchId && r.id !== room?.id)
    const conflictRoom = roomsInSameBranch.find(r => r.serviceIds?.includes(serviceId))
    return conflictRoom ? conflictRoom.name : null
  }

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 520 } }
      }}
    >
      <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant='h5' fontWeight={600}>
            {room ? 'Edit Room' : 'Add Room'}
          </Typography>
          <IconButton onClick={handleCancel}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Form */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Basic Information */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Basic Information
          </Typography>

          <TextField
            label='Room Name'
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='e.g., Main Studio, Yoga Room'
            required
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <i className='ri-hotel-bed-line' />
                </InputAdornment>
              )
            }}
          />

          <FormControl fullWidth required>
            <InputLabel>Branch</InputLabel>
            <Select value={branchId} onChange={e => setBranchId(e.target.value)} label='Branch' disabled={!!room}>
              {mockBranches.map(branch => (
                <MenuItem key={branch.id} value={branch.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-building-line' style={{ fontSize: 16 }} />
                    {branch.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {room && (
              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                Branch cannot be changed after room creation
              </Typography>
            )}
          </FormControl>

          {/* Scheduling Type */}
          <Box>
            <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
              Capacity Mode
            </Typography>
            <ToggleButtonGroup
              value={roomType}
              exclusive
              onChange={(_, value) => value && setRoomType(value)}
              fullWidth
              sx={{ mb: 1 }}
            >
              <ToggleButton value='dynamic' sx={{ textTransform: 'none', py: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <i className='ri-equalizer-line' style={{ fontSize: 20 }} />
                  <Typography variant='body2' fontWeight={600}>
                    Flexible
                  </Typography>
                </Box>
              </ToggleButton>
              <ToggleButton value='static' sx={{ textTransform: 'none', py: 1.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                  <i className='ri-lock-line' style={{ fontSize: 20 }} />
                  <Typography variant='body2' fontWeight={600}>
                    Fixed
                  </Typography>
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
            <Alert severity='info' sx={{ py: 0.5 }}>
              <Typography variant='caption'>
                {roomType === 'dynamic'
                  ? 'Capacity can vary per time slot or service. Ideal for rooms with different configurations.'
                  : 'Single fixed capacity for all bookings. The room always has the same capacity.'}
              </Typography>
            </Alert>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type='number'
              label={roomType === 'static' ? 'Fixed Capacity' : 'Default Capacity'}
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-group-line' />
                  </InputAdornment>
                )
              }}
              helperText={
                roomType === 'static'
                  ? 'This capacity applies to all bookings'
                  : 'Default capacity (can be overridden per slot)'
              }
              required
              fullWidth
            />

            <TextField
              label='Floor'
              value={floor}
              onChange={e => setFloor(e.target.value)}
              placeholder='e.g., 1st Floor'
              fullWidth
            />
          </Box>

          <TextField
            label='Description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            multiline
            rows={2}
            placeholder='Brief description of the room...'
            fullWidth
          />

          <Divider />

          {/* Appearance */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Appearance
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Calendar Color</InputLabel>
            <Select
              value={color}
              onChange={e => setColor(e.target.value)}
              label='Calendar Color'
              renderValue={value => (
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
              {COLOR_OPTIONS.map(colorOption => (
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
                const conflicts = value.filter(id => isServiceAssigned(id))
                if (conflicts.length > 0) {
                  const conflictNames = conflicts
                    .map(id => {
                      const service = mockServices.find(s => s.id === id)
                      const conflictRoom = getServiceConflict(id)
                      return `${service?.name} (assigned to ${conflictRoom})`
                    })
                    .join(', ')
                  alert(`Cannot assign: ${conflictNames}. Services can only be assigned to one room.`)
                  return
                }
                setServiceIds(value)
              }}
              input={<OutlinedInput label='Assigned Services' />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => {
                    const service = mockServices.find(s => s.id === value)
                    return <Chip key={value} label={service?.name || value} size='small' />
                  })}
                </Box>
              )}
            >
              {mockServices.map(service => {
                const assigned = isServiceAssigned(service.id)
                const conflictRoom = getServiceConflict(service.id)
                const isSelected = serviceIds.includes(service.id)
                return (
                  <MenuItem key={service.id} value={service.id} disabled={assigned}>
                    <Checkbox checked={isSelected} disabled={assigned} />
                    <ListItemText primary={service.name} />
                    {assigned && conflictRoom && (
                      <Chip label={`In ${conflictRoom}`} size='small' sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                    )}
                  </MenuItem>
                )
              })}
            </Select>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
              Services assigned to this room will be scheduled here
            </Typography>
          </FormControl>

          <Divider />

          {/* Amenities */}
          <Typography variant='subtitle1' fontWeight={600} color='primary'>
            Amenities
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Amenities</InputLabel>
            <Select
              multiple
              value={amenities}
              onChange={e =>
                setAmenities(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
              }
              input={<OutlinedInput label='Amenities' />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map(value => (
                    <Chip key={value} label={value} size='small' />
                  ))}
                </Box>
              )}
            >
              {AMENITIES_OPTIONS.map(amenity => (
                <MenuItem key={amenity} value={amenity}>
                  <Checkbox checked={amenities.includes(amenity)} />
                  <ListItemText primary={amenity} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Add Custom Amenity */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              label='Add Other Amenity'
              value={customAmenity}
              onChange={e => setCustomAmenity(e.target.value)}
              placeholder='e.g., Coffee Machine'
              size='small'
              fullWidth
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCustomAmenity()
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      onClick={handleAddCustomAmenity}
                      edge='end'
                      size='small'
                      disabled={!customAmenity.trim()}
                    >
                      <i className='ri-add-line' />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>

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
            <Typography variant='caption' color='info.dark'>
              <strong>Note:</strong> Rooms are physical spaces where services are performed. Assign services to rooms to
              enable room-based scheduling. You can configure the room's weekly availability schedule after creation.
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' onClick={handleCancel} fullWidth>
            Cancel
          </Button>
          <Button variant='contained' onClick={handleSave} fullWidth>
            {room ? 'Save Changes' : 'Add Room'}
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}
