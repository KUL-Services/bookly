# Staff Management Enhancement - Implementation Plan

## Overview
This document outlines the comprehensive plan for enhancing the staff management system with new features including service assignments to resources, a new rooms management tab, and various UX improvements across the staff management interface.

---

## 📋 Architecture Analysis Summary

### Current System Structure

#### Data Models
- **Resource**: `{ id, branchId, name, capacity, floor, amenities, color }`
- **StaffShift**: `{ id, start, end, breaks }`
- **WeeklyStaffHours**: Map of days to working hours with shifts
- **StaffServiceAssignments**: `Record<staffId, serviceIds[]>`

#### Key Components
- `StaffManagement.tsx` - Main container with 4 tabs
- `staff-members-tab.tsx` - Staff listing with service assignments
- `shifts-tab.tsx` - Shift scheduling with Day/Week views
- `resources-tab.tsx` - Resource management by branch
- `staff-store.ts` - Zustand store for state management

#### UI Patterns
- **Branch Navigation**: Two-level (branch selection → resource management)
- **Modals**: Dialog-based for editing
- **Accordion Pattern**: Used for grouping (services by category)
- **Timeline View**: Used in shifts tab with drag-and-drop

---

## 🎯 Implementation Tasks

### Phase 1: Service Assignment System

#### 1.1 Update Type Definitions
**File**: `src/bookly/features/calendar/types.ts`

```typescript
// Add service assignments to Resource interface
export interface Resource {
  id: string
  branchId: string
  name: string
  capacity: number
  floor?: string
  amenities: string[]
  color?: string
  serviceIds: string[]  // NEW: Services assigned to this resource
}

// NEW: Room-specific interface extending Resource
export interface Room extends Resource {
  weeklySchedule: WeeklyRoomSchedule  // NEW: Weekly shift pattern
  shiftOverrides: RoomShiftInstance[]  // NEW: Date-specific overrides
}

// NEW: Room shift pattern
export interface RoomShift {
  id: string
  start: string  // "HH:MM"
  end: string    // "HH:MM"
  serviceIds: string[]  // Services available during this shift
}

// NEW: Weekly room schedule
export interface WeeklyRoomSchedule {
  [day in DayOfWeek]: {
    isAvailable: boolean
    shifts: RoomShift[]
  }
}

// NEW: Room shift override
export interface RoomShiftInstance extends RoomShift {
  date: string  // "YYYY-MM-DD"
  reason?: 'manual' | 'copy'
}
```

#### 1.2 Update Store
**File**: `src/bookly/features/staff-management/staff-store.ts`

**Add to State Interface:**
```typescript
export interface StaffManagementState {
  // ... existing fields

  // NEW: Resource service assignments
  resourceServiceAssignments: Record<string, string[]>  // resourceId -> serviceIds[]

  // NEW: Room management
  rooms: Room[]
  roomShiftOverrides: Record<string, RoomShiftInstance[]>  // roomId -> overrides[]

  // NEW: Service assignment validation
  getServiceResourceAssignments: () => Record<string, string>  // serviceId -> resourceId
  isServiceAssigned: (serviceId: string) => boolean
  getResourceForService: (serviceId: string) => string | null

  // NEW: Room actions
  createRoom: (room: Omit<Room, 'id'>) => void
  updateRoom: (id: string, updates: Partial<Room>) => void
  deleteRoom: (id: string) => void
  getRoomsForBranch: (branchId: string) => Room[]
  updateRoomSchedule: (roomId: string, day: DayOfWeek, schedule: WeeklyRoomSchedule[DayOfWeek]) => void
  getRoomSchedule: (roomId: string, day: DayOfWeek) => WeeklyRoomSchedule[DayOfWeek]
  updateRoomShiftInstance: (roomId: string, shift: RoomShiftInstance) => void
  duplicateRoomShifts: (roomId: string, fromDate: string, toRange: { start: string; end: string }) => void

  // Modified: Resource actions with service validation
  assignServicesToResource: (resourceId: string, serviceIds: string[]) => { success: boolean; conflicts?: string[] }
  getResourceServices: (resourceId: string) => string[]
}
```

**Implementation:**
```typescript
// Service assignment validation
getServiceResourceAssignments: () => {
  const assignments: Record<string, string> = {}
  const state = get()

  // Check resources
  Object.entries(state.resourceServiceAssignments).forEach(([resourceId, serviceIds]) => {
    serviceIds.forEach(serviceId => {
      assignments[serviceId] = resourceId
    })
  })

  // Check rooms
  state.rooms.forEach(room => {
    room.serviceIds.forEach(serviceId => {
      assignments[serviceId] = room.id
    })
  })

  return assignments
},

isServiceAssigned: (serviceId) => {
  const assignments = get().getServiceResourceAssignments()
  return serviceId in assignments
},

getResourceForService: (serviceId) => {
  const assignments = get().getServiceResourceAssignments()
  return assignments[serviceId] || null
},

assignServicesToResource: (resourceId, serviceIds) => {
  const currentAssignments = get().getServiceResourceAssignments()
  const conflicts: string[] = []

  // Check for conflicts
  serviceIds.forEach(serviceId => {
    if (currentAssignments[serviceId] && currentAssignments[serviceId] !== resourceId) {
      conflicts.push(serviceId)
    }
  })

  if (conflicts.length > 0) {
    return { success: false, conflicts }
  }

  set(state => ({
    resourceServiceAssignments: {
      ...state.resourceServiceAssignments,
      [resourceId]: serviceIds
    }
  }))

  return { success: true }
},

// Room management actions
createRoom: (room) => {
  set(state => ({
    rooms: [
      ...state.rooms,
      {
        ...room,
        id: `room-${Date.now()}`,
        serviceIds: [],
        weeklySchedule: {
          Sun: { isAvailable: false, shifts: [] },
          Mon: { isAvailable: false, shifts: [] },
          Tue: { isAvailable: false, shifts: [] },
          Wed: { isAvailable: false, shifts: [] },
          Thu: { isAvailable: false, shifts: [] },
          Fri: { isAvailable: false, shifts: [] },
          Sat: { isAvailable: false, shifts: [] }
        },
        shiftOverrides: []
      }
    ]
  }))
},

updateRoomSchedule: (roomId, day, schedule) => {
  set(state => ({
    rooms: state.rooms.map(room =>
      room.id === roomId
        ? {
            ...room,
            weeklySchedule: {
              ...room.weeklySchedule,
              [day]: schedule
            }
          }
        : room
    )
  }))
},

duplicateRoomShifts: (roomId, fromDate, toRange) => {
  const room = get().rooms.find(r => r.id === roomId)
  if (!room) return

  // Get source shift (check override first, then weekly template)
  const overrides = get().roomShiftOverrides[roomId] || []
  let sourceShift = overrides.find(o => o.date === fromDate)

  if (!sourceShift) {
    const dateObj = new Date(fromDate)
    const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const day = dayNames[dateObj.getDay()]
    const daySchedule = room.weeklySchedule[day]

    if (daySchedule.shifts.length > 0) {
      sourceShift = daySchedule.shifts[0] as RoomShiftInstance
    }
  }

  if (!sourceShift) return

  const start = new Date(toRange.start)
  const end = new Date(toRange.end)
  const newOverrides: RoomShiftInstance[] = []

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0]
    newOverrides.push({
      ...sourceShift,
      date: dateStr,
      reason: 'copy'
    })
  }

  set(state => ({
    roomShiftOverrides: {
      ...state.roomShiftOverrides,
      [roomId]: [...(state.roomShiftOverrides[roomId] || []), ...newOverrides]
    }
  }))
}
```

---

### Phase 2: Resources Tab Enhancement

#### 2.1 Update Resources Tab
**File**: `src/bookly/features/staff-management/resources-tab.tsx`

**Changes:**
1. Add "Assign Services" button to resource cards
2. Display assigned services count on cards
3. Show service chips on resource cards
4. Open service assignment modal

**Implementation:**
```tsx
// In resource card (grid view), add after capacity chip:
<Chip
  size="small"
  icon={<i className="ri-service-line" />}
  label={`${resource.serviceIds?.length || 0} services`}
  color="primary"
  variant="outlined"
/>

// In CardActions, add before Edit button:
<Button
  size="small"
  startIcon={<i className="ri-service-line" />}
  onClick={() => handleAssignServices(resource)}
>
  Services
</Button>
```

#### 2.2 Create Service Assignment Modal for Resources
**New File**: `src/bookly/features/staff-management/resource-assign-services-modal.tsx`

**Pattern**: Similar to `edit-services-modal.tsx` but with validation

```tsx
'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Typography,
  Chip,
  Alert,
  Tooltip
} from '@mui/material'
import { mockServices, categories } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'

interface ResourceAssignServicesModalProps {
  open: boolean
  onClose: () => void
  resourceId: string
  resourceName: string
}

export function ResourceAssignServicesModal({
  open,
  onClose,
  resourceId,
  resourceName
}: ResourceAssignServicesModalProps) {
  const {
    getResourceServices,
    assignServicesToResource,
    isServiceAssigned,
    getResourceForService,
    resources,
    rooms
  } = useStaffManagementStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedServices, setSelectedServices] = useState<string[]>(() =>
    getResourceServices(resourceId)
  )
  const [conflicts, setConflicts] = useState<string[]>([])

  // Filter services by search
  const filteredServices = useMemo(() => {
    return mockServices.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  // Group services by category
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, typeof mockServices> = {}

    filteredServices.forEach(service => {
      if (!grouped[service.category]) {
        grouped[service.category] = []
      }
      grouped[service.category].push(service)
    })

    return grouped
  }, [filteredServices])

  const handleToggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
    // Clear conflicts when user changes selection
    setConflicts([])
  }

  const handleSave = () => {
    const result = assignServicesToResource(resourceId, selectedServices)

    if (!result.success && result.conflicts) {
      setConflicts(result.conflicts)
      return
    }

    onClose()
  }

  const handleCancel = () => {
    setSelectedServices(getResourceServices(resourceId))
    setConflicts([])
    onClose()
  }

  const isServiceInConflict = (serviceId: string) => {
    return isServiceAssigned(serviceId) && getResourceForService(serviceId) !== resourceId
  }

  const getConflictResourceName = (serviceId: string) => {
    const assignedResourceId = getResourceForService(serviceId)
    if (!assignedResourceId) return ''

    const resource = resources.find(r => r.id === assignedResourceId)
    if (resource) return resource.name

    const room = rooms.find(r => r.id === assignedResourceId)
    if (room) return room.name

    return 'Unknown'
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Assign Services
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Assign services to {resourceName}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Conflict Alert */}
        {conflicts.length > 0 && (
          <Alert severity="error" sx={{ m: 2 }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              Service Assignment Conflict
            </Typography>
            <Typography variant="body2">
              The following services are already assigned to other resources:
            </Typography>
            <Box component="ul" sx={{ mt: 1, mb: 0 }}>
              {conflicts.map(serviceId => {
                const service = mockServices.find(s => s.id === serviceId)
                return (
                  <li key={serviceId}>
                    {service?.name} (assigned to {getConflictResourceName(serviceId)})
                  </li>
                )
              })}
            </Box>
          </Alert>
        )}

        {/* Search & Actions Bar */}
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <i className="ri-search-line" />
                </InputAdornment>
              )
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${selectedServices.length} selected`}
              color="primary"
              size="small"
            />
          </Box>
        </Box>

        {/* Services by Category */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {Object.entries(servicesByCategory).map(([categoryName, services]) => {
            const categoryInfo = categories.find(c => c.name === categoryName)
            const allSelected = services.every(s => selectedServices.includes(s.id))
            const someSelected = services.some(s => selectedServices.includes(s.id))

            return (
              <Accordion
                key={categoryName}
                defaultExpanded
                sx={{ mb: 1, '&:before': { display: 'none' } }}
              >
                <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {categoryInfo?.icon} {categoryName}
                    </Typography>
                    <Chip
                      size="small"
                      label={services.length}
                      sx={{ ml: 'auto', mr: 2 }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {services.map((service) => {
                      const inConflict = isServiceInConflict(service.id)
                      const isDisabled = inConflict

                      return (
                        <Tooltip
                          key={service.id}
                          title={inConflict ? `Already assigned to ${getConflictResourceName(service.id)}` : ''}
                          placement="top"
                        >
                          <FormControlLabel
                            disabled={isDisabled}
                            control={
                              <Checkbox
                                checked={selectedServices.includes(service.id)}
                                onChange={() => handleToggleService(service.id)}
                              />
                            }
                            label={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {service.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {service.duration} min • ${service.price}
                                    {inConflict && (
                                      <Chip
                                        size="small"
                                        label={`Assigned to ${getConflictResourceName(service.id)}`}
                                        color="error"
                                        sx={{ ml: 1, height: 18, fontSize: '0.65rem' }}
                                      />
                                    )}
                                  </Typography>
                                </Box>
                              </Box>
                            }
                            sx={{
                              ml: 0,
                              mr: 0,
                              py: 0.5,
                              px: 2,
                              borderRadius: 1,
                              '&:hover': {
                                bgcolor: isDisabled ? 'transparent' : 'action.hover'
                              },
                              opacity: isDisabled ? 0.5 : 1
                            }}
                          />
                        </Tooltip>
                      )
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" autoFocus>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )
}
```

---

### Phase 3: New Rooms Tab

#### 3.1 Create Rooms Tab Component
**New File**: `src/bookly/features/staff-management/rooms-tab.tsx`

**Design**: Combination of shifts-tab.tsx timeline approach + resources-tab.tsx navigation pattern

```tsx
'use client'

import { useState, useMemo } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  ToggleButtonGroup,
  ToggleButton,
  Avatar,
  Select,
  MenuItem,
  FormControl
} from '@mui/material'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { mockBranches } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { RoomEditorDrawer } from './room-editor-drawer'
import { RoomShiftEditorModal } from './room-shift-editor-modal'
import type { Room } from '../calendar/types'

type ViewMode = 'grid' | 'list' | 'shifts'
type NavigationView = 'branch-selection' | 'room-management'

export function RoomsTab() {
  const [navigationView, setNavigationView] = useState<NavigationView>('branch-selection')
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [shiftsViewMode, setShiftsViewMode] = useState<'Day' | 'Week'>('Day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [isShiftEditorOpen, setIsShiftEditorOpen] = useState(false)
  const [shiftEditorContext, setShiftEditorContext] = useState<{
    roomId: string
    roomName: string
    date: Date
  } | null>(null)

  const { rooms, deleteRoom } = useStaffManagementStore()

  // Filter rooms for selected branch
  const filteredRooms = useMemo(() => {
    if (!selectedBranchId) return []

    return rooms.filter(room => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.amenities.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesBranch = room.branchId === selectedBranchId
      return matchesSearch && matchesBranch
    })
  }, [rooms, searchQuery, selectedBranchId])

  // Get room counts per branch
  const branchRoomCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mockBranches.forEach(branch => {
      counts[branch.id] = rooms.filter(r => r.branchId === branch.id).length
    })
    return counts
  }, [rooms])

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: ViewMode | null) => {
    if (newView !== null) {
      setViewMode(newView)
    }
  }

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId)
    setNavigationView('room-management')
    setSearchQuery('')
  }

  const handleBackToBranches = () => {
    setNavigationView('branch-selection')
    setSelectedBranchId(null)
    setSearchQuery('')
  }

  const handleAddRoom = () => {
    setEditingRoom(null)
    setIsEditorOpen(true)
  }

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room)
    setIsEditorOpen(true)
  }

  const handleDeleteRoom = (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      deleteRoom(id)
    }
  }

  const handleCloseEditor = () => {
    setIsEditorOpen(false)
    setEditingRoom(null)
  }

  const selectedBranch = selectedBranchId ? mockBranches.find(b => b.id === selectedBranchId) : null

  // Render branch selection view (same as resources-tab)
  if (navigationView === 'branch-selection') {
    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Branch Selection Header */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant='h5' fontWeight={600} gutterBottom>
            Select a Branch
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Choose a branch to view and manage its rooms
          </Typography>
        </Paper>

        {/* Branch Cards */}
        <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'auto', p: 3 }}>
          <Grid container spacing={3}>
            {mockBranches.map(branch => (
              <Grid item xs={12} sm={6} md={4} key={branch.id}>
                <Card variant='outlined' sx={{ height: '100%', cursor: 'pointer', '&:hover': { boxShadow: 4, borderColor: 'primary.main' } }} onClick={() => handleSelectBranch(branch.id)}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <i className='ri-door-open-line' style={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant='h6' fontWeight={600}>{branch.name}</Typography>
                        <Typography variant='body2' color='text.secondary'>{branch.address}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Chip size='small' icon={<i className='ri-door-line' />} label={`${branchRoomCounts[branch.id] || 0} rooms`} color='primary' variant='outlined' />
                      <Chip size='small' icon={<i className='ri-map-pin-line' />} label={branch.city} variant='outlined' />
                    </Box>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button fullWidth variant='contained' endIcon={<i className='ri-arrow-right-line' />}>
                      View Rooms
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    )
  }

  // Render room management view
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Header with Back Button */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant='outlined' startIcon={<i className='ri-arrow-left-line' />} onClick={handleBackToBranches} sx={{ textTransform: 'none' }}>
          Back to All Branches
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className='ri-building-line' style={{ fontSize: 20, opacity: 0.6 }} />
          <Typography variant='h6' fontWeight={600}>{selectedBranch?.name}</Typography>
        </Box>
      </Paper>

      {/* Room Controls */}
      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          size='small'
          placeholder='Search rooms...'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='ri-search-line' />
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size='small'>
          <ToggleButton value='grid'>
            <i className='ri-grid-line' />
          </ToggleButton>
          <ToggleButton value='list'>
            <i className='ri-list-check' />
          </ToggleButton>
          <ToggleButton value='shifts'>
            <i className='ri-calendar-line' />
          </ToggleButton>
        </ToggleButtonGroup>

        <Chip label={`${filteredRooms.length} room${filteredRooms.length !== 1 ? 's' : ''}`} variant='outlined' />
      </Paper>

      {/* Rooms Content */}
      {viewMode === 'grid' || viewMode === 'list' ? (
        <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'auto', p: 3 }}>
          {filteredRooms.length === 0 ? (
            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
              <Box sx={{ textAlign: 'center' }}>
                <i className='ri-door-line' style={{ fontSize: 64, opacity: 0.3 }} />
                <Typography variant='h6' sx={{ mt: 2 }}>No rooms found</Typography>
                <Typography variant='body2'>{searchQuery ? 'Try adjusting your search' : `Add your first room to ${selectedBranch?.name}`}</Typography>
                {!searchQuery && (
                  <Button variant='contained' startIcon={<i className='ri-add-line' />} onClick={handleAddRoom} sx={{ mt: 3 }}>
                    Add Room
                  </Button>
                )}
              </Box>
            </Box>
          ) : viewMode === 'grid' ? (
            <Grid container spacing={3}>
              {filteredRooms.map(room => (
                <Grid item xs={12} sm={6} md={4} key={room.id}>
                  <Card variant='outlined' sx={{ height: '100%', borderRadius: 2, '&:hover': { boxShadow: 2 } }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: room.color || 'primary.main', width: 48, height: 48 }}>
                          <i className='ri-door-line' />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant='h6' fontWeight={600}>{room.name}</Typography>
                          <Typography variant='caption' color='text.secondary'>{selectedBranch?.name}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip size='small' icon={<i className='ri-group-line' />} label={`${room.capacity} capacity`} variant='outlined' />
                        {room.floor && <Chip size='small' label={room.floor} variant='outlined' />}
                        <Chip size='small' icon={<i className='ri-service-line' />} label={`${room.serviceIds.length} services`} color='primary' variant='outlined' />
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {room.amenities.slice(0, 4).map(amenity => (
                          <Chip key={amenity} label={amenity} size='small' sx={{ fontSize: '0.7rem', height: 20 }} />
                        ))}
                        {room.amenities.length > 4 && (
                          <Chip label={`+${room.amenities.length - 4}`} size='small' sx={{ fontSize: '0.7rem', height: 20 }} />
                        )}
                      </Box>
                    </CardContent>

                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Button size='small' startIcon={<i className='ri-edit-line' />} onClick={() => handleEditRoom(room)}>
                        Edit
                      </Button>
                      <IconButton size='small' color='error' onClick={() => handleDeleteRoom(room.id)}>
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredRooms.map(room => (
                <Paper key={room.id} variant='outlined' sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                  <Avatar sx={{ bgcolor: room.color || 'primary.main', width: 40, height: 40 }}>
                    <i className='ri-door-line' />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant='subtitle1' fontWeight={600}>{room.name}</Typography>
                    <Typography variant='caption' color='text.secondary'>{selectedBranch?.name}{room.floor && ` • ${room.floor}`}</Typography>
                  </Box>
                  <Chip size='small' icon={<i className='ri-group-line' />} label={`${room.capacity} capacity`} variant='outlined' />
                  <Chip size='small' icon={<i className='ri-service-line' />} label={`${room.serviceIds.length} services`} color='primary' variant='outlined' />
                  <Button size='small' variant='outlined' startIcon={<i className='ri-edit-line' />} onClick={() => handleEditRoom(room)}>
                    Edit
                  </Button>
                  <IconButton size='small' color='error' onClick={() => handleDeleteRoom(room.id)}>
                    <i className='ri-delete-bin-line' />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>
      ) : (
        // Shifts View - Similar to shifts-tab.tsx timeline
        <Paper elevation={0} sx={{ flexGrow: 1, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {/* Shifts Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <FormControl size='small' sx={{ minWidth: 120 }}>
              <Select value={shiftsViewMode} onChange={e => setShiftsViewMode(e.target.value as 'Day' | 'Week')}>
                <MenuItem value='Day'>Day</MenuItem>
                <MenuItem value='Week'>Week</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size='small' onClick={() => setSelectedDate(shiftsViewMode === 'Week' ? subWeeks(selectedDate, 1) : subDays(selectedDate, 1))}>
                <i className='ri-arrow-left-s-line' />
              </IconButton>
              <Typography variant='body2' fontWeight={600}>{format(selectedDate, 'EEE, dd MMM')}</Typography>
              <IconButton size='small' onClick={() => setSelectedDate(shiftsViewMode === 'Week' ? addWeeks(selectedDate, 1) : addDays(selectedDate, 1))}>
                <i className='ri-arrow-right-s-line' />
              </IconButton>
            </Box>
          </Box>

          {/* Shifts Timeline Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <Typography variant='caption' color='text.secondary'>
              Room shift timeline will be displayed here (similar to staff shifts tab)
            </Typography>
            {/* TODO: Implement room shift timeline similar to shifts-tab.tsx */}
          </Box>
        </Paper>
      )}

      {/* Add Room FAB */}
      <Fab color='primary' sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={handleAddRoom}>
        <i className='ri-add-line' />
      </Fab>

      {/* Room Editor Drawer */}
      <RoomEditorDrawer open={isEditorOpen} onClose={handleCloseEditor} room={editingRoom} selectedBranchId={selectedBranchId} />

      {/* Room Shift Editor Modal */}
      <RoomShiftEditorModal open={isShiftEditorOpen} onClose={() => setIsShiftEditorOpen(false)} context={shiftEditorContext} />
    </Box>
  )
}
```

#### 3.2 Create Room Editor Drawer
**New File**: `src/bookly/features/staff-management/room-editor-drawer.tsx`

Pattern: Similar to `resource-editor-drawer.tsx` with additional fields for services and schedules

#### 3.3 Add Rooms Tab to Main Container
**File**: `src/views/apps/bookly/staff/StaffManagement.tsx`

```tsx
// Add import
import { RoomsTab } from '@/bookly/features/staff-management/rooms-tab'

// Update tabs
<Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ px: 3 }}>
  <Tab label='STAFF MEMBERS' />
  <Tab label='SHIFTS' />
  <Tab label='RESOURCES' />
  <Tab label='ROOMS' />  {/* NEW */}
  <Tab label='COMMISSIONS' />
</Tabs>

// Add TabPanel
<TabPanel value={currentTab} index={3}>
  <RoomsTab />
</TabPanel>
```

---

### Phase 4: Staff Members Tab Improvements

#### 4.1 Collapse Services Categories by Default
**File**: `src/bookly/features/staff-management/edit-services-modal.tsx`

**Change:**
```tsx
// Line 183: Change defaultExpanded to false and add expanded state
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

// Replace defaultExpanded with controlled expansion
<Accordion
  key={categoryName}
  expanded={expandedCategories.has(categoryName)}
  onChange={(_, isExpanded) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (isExpanded) {
        next.add(categoryName)
      } else {
        next.delete(categoryName)
      }
      return next
    })
  }}
  sx={{ mb: 1, '&:before': { display: 'none' } }}
>
```

#### 4.2 Add Service Filter and Grouping
**File**: `src/bookly/features/staff-management/staff-members-tab.tsx`

**Add State:**
```tsx
const [serviceFilter, setServiceFilter] = useState<string | null>(null)
const [groupBy, setGroupBy] = useState<'branch' | 'service'>('branch')
```

**Add Filter UI:**
```tsx
// After search field, add service filter
<FormControl size='small' sx={{ width: 300, mt: 1 }}>
  <Select
    value={serviceFilter || ''}
    onChange={e => setServiceFilter(e.target.value || null)}
    displayEmpty
  >
    <MenuItem value=''>All Services</MenuItem>
    {mockServices.map(service => (
      <MenuItem key={service.id} value={service.id}>
        {service.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

<ToggleButtonGroup value={groupBy} exclusive onChange={(_, val) => val && setGroupBy(val)} size='small'>
  <ToggleButton value='branch'>Group by Branch</ToggleButton>
  <ToggleButton value='service'>Group by Service</ToggleButton>
</ToggleButtonGroup>
```

**Update Grouping Logic:**
```tsx
// Filter by service
const filteredStaffByService = filteredStaff.filter(staff => {
  if (!serviceFilter) return true
  const assignedServiceIds = getStaffServices(staff.id)
  return assignedServiceIds.includes(serviceFilter)
})

// Group by service
const staffByService = filteredStaffByService.reduce((acc, staff) => {
  const assignedServiceIds = getStaffServices(staff.id)

  if (groupBy === 'service') {
    // Group by each service
    assignedServiceIds.forEach(serviceId => {
      const service = mockServices.find(s => s.id === serviceId)
      if (service) {
        if (!acc[service.name]) {
          acc[service.name] = []
        }
        acc[service.name].push(staff)
      }
    })
  } else {
    // Group by branch
    const branchId = staff.branchId
    if (!acc[branchId]) {
      acc[branchId] = []
    }
    acc[branchId].push(staff)
  }

  return acc
}, {} as Record<string, typeof mockStaff>)
```

---

### Phase 5: Shifts Tab Improvements

#### 5.1 Group by Branches Sorted by Shift Start Time
**File**: `src/bookly/features/staff-management/shifts-tab.tsx`

**Update Staff Rendering (Line 643+):**
```tsx
// Group staff by branches
const staffByBranchSorted = useMemo(() => {
  const grouped = displayStaff.reduce((acc, staff) => {
    const branchId = staff.branchId
    if (!acc[branchId]) {
      acc[branchId] = []
    }
    acc[branchId].push(staff)
    return acc
  }, {} as Record<string, typeof mockStaff>)

  // Sort staff within each branch by shift start time
  Object.keys(grouped).forEach(branchId => {
    grouped[branchId].sort((a, b) => {
      const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][selectedDate.getDay()] as DayOfWeek

      const aHours = getStaffWorkingHours(a.id, dayOfWeek)
      const bHours = getStaffWorkingHours(b.id, dayOfWeek)

      if (!aHours.isWorking) return 1
      if (!bHours.isWorking) return -1

      const aStart = aHours.shifts[0]?.start || '23:59'
      const bStart = bHours.shifts[0]?.start || '23:59'

      return aStart.localeCompare(bStart)
    })
  })

  return grouped
}, [displayStaff, selectedDate, getStaffWorkingHours])

// Render grouped staff
{Object.entries(staffByBranchSorted).map(([branchId, branchStaff]) => {
  const branch = mockBranches.find(b => b.id === branchId)

  return (
    <Box key={branchId}>
      {/* Branch Header */}
      <Box sx={{ px: 2, py: 1, bgcolor: 'action.hover', borderBottom: 1, borderColor: 'divider', position: 'sticky', top: 0, zIndex: 1 }}>
        <Typography variant='caption' fontWeight={600} color='text.secondary' sx={{ textTransform: 'uppercase' }}>
          {branch?.name || branchId}
        </Typography>
      </Box>

      {/* Staff Rows */}
      {branchStaff.map(renderEnhancedStaffRow)}
    </Box>
  )
})}
```

#### 5.2 Adjust Metadata Display for Views
**File**: `src/bookly/features/staff-management/shifts-tab.tsx`

**Update Metadata Display (Lines 684-689):**
```tsx
// Replace hardcoded metadata with dynamic calculation
const getMetadataDisplay = (viewMode: 'Day' | 'Week') => {
  if (viewMode === 'Day') {
    // Show only day hours
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', fontSize: '0.65rem', color: 'text.secondary', ml: 'auto' }}>
        <Typography variant='caption'>D 9h/9h</Typography>
      </Box>
    )
  } else if (viewMode === 'Week') {
    // Show week days summary
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', fontSize: '0.65rem', color: 'text.secondary', ml: 'auto' }}>
        <Typography variant='caption'>D 9h/9h</Typography>
        <Typography variant='caption'>W 45h/45h</Typography>
      </Box>
    )
  }

  // For month view, show days not hours
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', fontSize: '0.65rem', color: 'text.secondary', ml: 'auto' }}>
      <Typography variant='caption'>W 5d/5d</Typography>
      <Typography variant='caption'>M 20d</Typography>
    </Box>
  )
}

// Use in staff row
<Box sx={{ display: 'flex', flexDirection: 'column', fontSize: '0.65rem', color: 'text.secondary', ml: 'auto' }}>
  {getMetadataDisplay(viewMode)}
</Box>
```

#### 5.3 Business Hours Validation in Shift Editor
**File**: `src/bookly/features/staff-management/shift-editor-modal.tsx`

**Add Validation Logic:**
```tsx
// Add business hours context
const { getBusinessHours } = useStaffManagementStore()

// Calculate if shift is outside business hours
const isOutsideBusinessHours = useMemo(() => {
  if (!date) return false

  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] as DayOfWeek
  const businessHours = getBusinessHours(dayOfWeek)

  if (!businessHours.isOpen) return true
  if (businessHours.shifts.length === 0) return true

  const bizShift = businessHours.shifts[0]
  const [bizStartH, bizStartM] = bizShift.start.split(':').map(Number)
  const [bizEndH, bizEndM] = bizShift.end.split(':').map(Number)

  const [shiftStartH, shiftStartM] = startTime.split(':').map(Number)
  const [shiftEndH, shiftEndM] = endTime.split(':').map(Number)

  const bizStartMinutes = bizStartH * 60 + bizStartM
  const bizEndMinutes = bizEndH * 60 + bizEndM
  const shiftStartMinutes = shiftStartH * 60 + shiftStartM
  const shiftEndMinutes = shiftEndH * 60 + shiftEndM

  return shiftStartMinutes < bizStartMinutes || shiftEndMinutes > bizEndMinutes
}, [date, startTime, endTime, getBusinessHours])

// Add warning in modal
{isOutsideBusinessHours && (
  <Alert severity="warning" sx={{ mb: 2 }}>
    <Typography variant="body2" fontWeight={600}>
      Outside Business Hours
    </Typography>
    <Typography variant="body2">
      This shift is outside the configured business hours for this day.
    </Typography>
  </Alert>
)}
```

---

## 🔧 Testing Plan

### Manual Testing Checklist

#### Resources Tab
- [ ] Assign services to a resource
- [ ] Verify service exclusivity (cannot assign same service to two resources)
- [ ] Display assigned services on resource cards
- [ ] Edit service assignments
- [ ] Remove service assignments

#### Rooms Tab
- [ ] Create new room with capacity and amenities
- [ ] Assign services to room
- [ ] Set up weekly schedule for room
- [ ] Override specific dates
- [ ] Copy shifts to multiple dates
- [ ] View room shifts in Day/Week view
- [ ] Display services assigned to room in shift boxes
- [ ] Delete room

#### Staff Members Tab
- [ ] Verify all service categories collapsed on modal open
- [ ] Filter staff by service
- [ ] Group staff by service
- [ ] Group staff by branch (default)
- [ ] Verify service assignment still works

#### Shifts Tab
- [ ] Verify staff grouped by branch
- [ ] Verify staff sorted by shift start time within branch
- [ ] Check metadata display in Day view (hrs only)
- [ ] Check metadata display in Week view (days not hrs)
- [ ] Verify business hours warning when editing shift outside hours

---

## 📚 Implementation Order

1. **Phase 1**: Service Assignment System (Types + Store)
2. **Phase 2**: Resources Tab Enhancement
3. **Phase 3**: Rooms Tab (New Tab)
4. **Phase 4**: Staff Members Tab Improvements
5. **Phase 5**: Shifts Tab Improvements

---

## ⚠️ Important Considerations

### Data Consistency
- Ensure service assignments are validated across resources and rooms
- Handle edge cases when deleting resources/rooms with assigned services
- Sync state changes with calendar store using `syncWithCalendar()`

### Performance
- Use `useMemo` for filtered and grouped data
- Debounce search inputs
- Lazy load shift data for date ranges

### UX Patterns
- Keep consistent UI patterns across tabs
- Use existing component patterns (Accordion, Modal, Drawer)
- Follow Material-UI design system
- Maintain responsive design for mobile views

### State Management
- All state changes go through Zustand store
- Keep UI state (modals, selections) local to components
- Persist important data to store immediately

---

## 📝 Notes

- Current Resources are basic (amenities, capacity)
- Rooms extend Resources with scheduling capabilities
- Service assignments are exclusive (one resource/room per service)
- Weekly schedules can be overridden for specific dates
- Shift timeline uses business hours for range calculation
- All date formats: "YYYY-MM-DD", time formats: "HH:MM"

---

**End of Implementation Plan**
