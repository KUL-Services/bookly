'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Divider,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Paper
} from '@mui/material'
import { mockStaff, mockServices, mockBookings, mockRooms } from '@/bookly/data/mock-data'
import type { DateRange, CalendarEvent } from './types'
import type { User } from '@/bookly/data/types'
import { useCalendarStore } from './state'
import { isStaffAvailable, hasConflict, getStaffAvailableCapacity, getStaffRoomAssignment } from './utils'
import ClientPickerDialog from './client-picker-dialog'
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'
import { DatePickerField } from '@/bookly/features/staff-management/date-picker-field'

// Helper function to get 2 initials from a name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

// Generate booking reference
const generateBookingReference = () => {
  const prefix = 'BK'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Type for client in static slot
interface SlotClient {
  id: string
  name: string
  email: string
  phone: string
  bookedAt: string
  status: 'confirmed' | 'no_show' | 'completed'
  arrivalTime?: string
}

interface UnifiedBookingDrawerProps {
  open: boolean
  mode: 'create' | 'edit'
  initialDate?: Date | null
  initialDateRange?: DateRange | null
  initialStaffId?: string | null
  initialServiceId?: string | null
  existingEvent?: CalendarEvent | null
  onClose: () => void
  onSave?: (booking: any) => void
  onDelete?: (bookingId: string) => void
}

export default function UnifiedBookingDrawer({
  open,
  mode,
  initialDate,
  initialDateRange,
  initialStaffId,
  initialServiceId,
  existingEvent,
  onClose,
  onSave,
  onDelete
}: UnifiedBookingDrawerProps) {
  const events = useCalendarStore(state => state.events)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)
  const getSlotsForDate = useCalendarStore(state => state.getSlotsForDate)
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const getRoomsByBranch = useCalendarStore(state => state.getRoomsByBranch)

  // Dynamic mode form state
  const [bookingReference, setBookingReference] = useState('')
  const [date, setDate] = useState(initialDate || new Date())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('09:30')
  const [staffId, setStaffId] = useState(initialStaffId || '')
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [servicePrice, setServicePrice] = useState(0)
  const [serviceDuration, setServiceDuration] = useState(30)
  const [requestedByClient, setRequestedByClient] = useState(false)
  const [status, setStatus] = useState<'confirmed' | 'no_show' | 'completed'>('confirmed')
  const [starred, setStarred] = useState(false)

  // Static mode state
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [slotClients, setSlotClients] = useState<SlotClient[]>([])
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [newClientEmail, setNewClientEmail] = useState('')
  const [newClientPhone, setNewClientPhone] = useState('')

  // UI state
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null)

  // Get only dynamic staff for selection
  const dynamicStaff = mockStaff.filter(s => s.staffType === 'dynamic')

  // Determine if this event is from a static slot (overrides global schedulingMode)
  // Check by:
  // 1. Event properties (slotId or isStaticSlot)
  // 2. Staff type (if staffId is for a static staff member)
  // 3. Room type (if roomId is for a fixed/static room)
  const isStaticSlotEvent = (() => {
    if (mode === 'edit' && existingEvent && existingEvent.extendedProps) {
      const props = existingEvent.extendedProps as any

      // Check for explicit slot properties
      if (props.slotId || props.isStaticSlot) {
        return true
      }

      // Check if the staff is static type
      const eventStaff = mockStaff.find(s => s.id === props.staffId)
      if (eventStaff?.staffType === 'static') {
        return true
      }

      // Check if the room is static/fixed type
      const eventRoom = mockRooms.find(r => r.id === props.roomId)
      if (eventRoom?.roomType === 'static') {
        return true
      }
    }
    return false
  })()

  // Use event-specific mode if available, otherwise fall back to global
  const effectiveSchedulingMode = isStaticSlotEvent ? 'static' : schedulingMode

  // Reset form when drawer opens in create mode
  useEffect(() => {
    if (open && mode === 'create') {
      setBookingReference(generateBookingReference())
      setDate(initialDate || new Date())
      setStartTime('09:00')
      setEndTime('09:30')
      setStaffId(initialStaffId || '')
      setSelectedClient(null)
      setClientName('')
      setClientEmail('')
      setClientPhone('')
      setServiceId('')
      setServiceName('')
      setServicePrice(0)
      setServiceDuration(30)
      setRequestedByClient(false)
      setStatus('confirmed')
      setStarred(false)
      setSelectedSlotId(null)
      setSlotClients([])
      setValidationError(null)
      setAvailabilityWarning(null)
    }
  }, [open, mode, initialDate, initialStaffId])

  // Load existing event data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingEvent && existingEvent.extendedProps && open) {
      const props = existingEvent.extendedProps as any
      const start = new Date(existingEvent.start)
      const end = new Date(existingEvent.end)
      setDate(start)
      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setStaffId(props.staffId || '')
      setClientName(props.customerName || '')
      setClientEmail(props.email || props.customerEmail || '')
      setClientPhone(props.phone || props.customerPhone || '')
      setServiceName(props.serviceName || '')
      setServicePrice(props.price || 0)
      setRequestedByClient(props.selectionMethod === 'by_client')

      // Map status to our limited options
      const existingStatus = props.status || 'confirmed'
      if (['confirmed', 'no_show', 'completed'].includes(existingStatus)) {
        setStatus(existingStatus as 'confirmed' | 'no_show' | 'completed')
      } else {
        setStatus('confirmed')
      }

      setStarred(props.starred || false)
      setBookingReference(props.bookingId || existingEvent.id || '')

      // Load service details
      const existingServiceId = props.serviceId
      if (existingServiceId) {
        setServiceId(existingServiceId)
        const svc = mockServices.find(s => s.id === existingServiceId)
        if (svc) setServiceDuration(svc.duration)
      }

      // Load slot data if static mode
      if (props.slotId || props.isStaticSlot) {
        setSelectedSlotId(props.slotId || existingEvent.id)
        // Load slot clients (in real app, this would come from API)
        // For now, create mock clients if none exist
        if (props.slotClients && props.slotClients.length > 0) {
          setSlotClients(props.slotClients)
        } else {
          // Create mock client from the booking data for static slots
          const mockClient: SlotClient = {
            id: `client-${Date.now()}`,
            name: props.customerName || clientName || 'Walk-in Client',
            email: props.email || props.customerEmail || clientEmail || '',
            phone: props.phone || props.customerPhone || clientPhone || '',
            bookedAt: new Date(existingEvent.start).toISOString(),
            status: ['confirmed', 'no_show', 'completed'].includes(props.status) ? props.status : 'confirmed',
            arrivalTime: props.arrivalTime || ''
          }
          setSlotClients([mockClient])
        }
      }
    }
  }, [mode, existingEvent, open])

  // Auto-calculate end time when service or start time changes
  useEffect(() => {
    if (serviceId && startTime && mode === 'create') {
      const [hours, minutes] = startTime.split(':').map(Number)
      const startMinutes = hours * 60 + minutes
      const endMinutes = startMinutes + serviceDuration
      const endHours = Math.floor(endMinutes / 60)
      const endMins = endMinutes % 60
      setEndTime(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`)
    }
  }, [serviceId, startTime, serviceDuration, mode])

  // Check availability for dynamic mode
  useEffect(() => {
    if (effectiveSchedulingMode !== 'dynamic' || mode === 'edit') return
    if (!staffId || !startTime || !endTime) {
      setAvailabilityWarning(null)
      return
    }

    const availability = isStaffAvailable(staffId, date, startTime, endTime)
    if (!availability.available) {
      setAvailabilityWarning(availability.reason || 'Staff is not available at this time')
      return
    }

    const conflict = hasConflict(events, staffId, date, startTime, endTime)
    if (conflict.conflict) {
      const conflictStart = new Date(conflict.conflictingEvent!.start)
      const conflictEnd = new Date(conflict.conflictingEvent!.end)
      const conflictTimeStr = `${conflictStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${conflictEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      setAvailabilityWarning(`Conflicts with existing appointment (${conflictTimeStr})`)
      return
    }

    setAvailabilityWarning(null)
  }, [staffId, date, startTime, endTime, events, effectiveSchedulingMode, mode])

  const handleServiceChange = (newServiceId: string) => {
    const selectedService = mockServices.find(s => s.id === newServiceId)
    if (selectedService) {
      setServiceId(newServiceId)
      setServiceName(selectedService.name)
      setServicePrice(selectedService.price)
      setServiceDuration(selectedService.duration)
    }
  }

  const handleClientSelect = (client: User | null) => {
    setSelectedClient(client)
    if (client) {
      const fullName = `${client.firstName} ${client.lastName}`
      setClientName(fullName)
      setClientEmail(client.email)
      setClientPhone(client.phone || '')

      // If in static mode and adding client, add to slot clients list
      if (effectiveSchedulingMode === 'static' && isAddingClient) {
        const newClient: SlotClient = {
          id: `client-${Date.now()}`,
          name: fullName,
          email: client.email,
          phone: client.phone || '',
          bookedAt: new Date().toISOString(),
          status: 'confirmed'
        }
        setSlotClients([...slotClients, newClient])
        setIsAddingClient(false)
        setNewClientName('')
        setNewClientEmail('')
        setNewClientPhone('')
      }
    }
  }

  const handleAddClientToSlot = () => {
    if (!newClientName.trim()) {
      setValidationError('Please enter client name')
      return
    }

    // Capacity validation
    const totalCapacity = 20 // Mock capacity - in real app from slot data
    const availableCapacity = totalCapacity - slotClients.length

    if (availableCapacity === 0) {
      setValidationError('Cannot add client: Slot is at maximum capacity')
      return
    }

    const newClient: SlotClient = {
      id: `client-${Date.now()}`,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      bookedAt: new Date().toISOString(),
      status: 'confirmed'
    }

    setSlotClients([...slotClients, newClient])
    setNewClientName('')
    setNewClientEmail('')
    setNewClientPhone('')
    setIsAddingClient(false)
  }

  const handleRemoveClientFromSlot = (clientId: string) => {
    setSlotClients(slotClients.filter(c => c.id !== clientId))
  }

  const handleClientStatusChange = (clientId: string, newStatus: SlotClient['status']) => {
    setSlotClients(slotClients.map(c => (c.id === clientId ? { ...c, status: newStatus } : c)))
  }

  const handleClientArrivalChange = (clientId: string, arrivalTime: string) => {
    setSlotClients(slotClients.map(c => (c.id === clientId ? { ...c, arrivalTime } : c)))
  }

  const handleSave = () => {
    setValidationError(null)

    if (effectiveSchedulingMode === 'dynamic') {
      if (!clientName.trim()) {
        setValidationError('Please enter client name')
        return
      }
      if (!serviceId) {
        setValidationError('Please select a service')
        return
      }
      if (!staffId) {
        setValidationError('Please select a staff member')
        return
      }
    }

    const booking = {
      bookingReference,
      date,
      startTime,
      endTime,
      staffId,
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      serviceName,
      servicePrice,
      serviceDuration,
      requestedByClient,
      status,
      starred,
      ...(effectiveSchedulingMode === 'static' && {
        slotId: selectedSlotId,
        slotClients
      })
    }

    onSave?.(booking)
    handleClose()
  }

  const handleClose = () => {
    setValidationError(null)
    setAvailabilityWarning(null)
    onClose()
  }

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatShortDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  // Status chip color
  const getStatusColor = (s: string) => {
    switch (s) {
      case 'confirmed':
        return 'success'
      case 'no_show':
        return 'error'
      case 'completed':
        return 'info'
      default:
        return 'default'
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' }
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box>
            <Typography variant='h6' fontWeight={600}>
              {mode === 'create'
                ? effectiveSchedulingMode === 'static'
                  ? 'Add to Slot'
                  : 'New Appointment'
                : effectiveSchedulingMode === 'static'
                  ? 'Manage Slot'
                  : 'Booking Details'}
            </Typography>
            {mode === 'create' && (
              <Typography variant='caption' color='text.secondary'>
                Ref: {bookingReference}
              </Typography>
            )}
          </Box>
          <IconButton onClick={handleClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          {/* ===== DYNAMIC/FLEXIBLE MODE ===== */}
          {effectiveSchedulingMode === 'dynamic' && (
            <>
              {mode === 'create' ? (
                // CREATE MODE - Full editable form
                <Stack spacing={2.5}>
                  {/* Booking Reference (read-only) */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      BOOKING REFERENCE
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {bookingReference}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Client Selection */}
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={600}
                      sx={{ mb: 1, display: 'block' }}
                    >
                      CLIENT INFORMATION
                    </Typography>
                    <Box
                      onClick={() => setIsClientPickerOpen(true)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 1.5,
                        border: '1px dashed',
                        borderColor: selectedClient ? 'primary.main' : 'divider',
                        borderRadius: 1,
                        cursor: 'pointer',
                        mb: 2,
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                      }}
                    >
                      <Avatar sx={{ width: 40, height: 40, bgcolor: selectedClient ? 'primary.main' : 'grey.300' }}>
                        {selectedClient ? (
                          getInitials(`${selectedClient.firstName} ${selectedClient.lastName}`)
                        ) : (
                          <i className='ri-user-add-line' />
                        )}
                      </Avatar>
                      <Typography variant='body2' color={selectedClient ? 'text.primary' : 'text.secondary'}>
                        {selectedClient
                          ? `${selectedClient.firstName} ${selectedClient.lastName}`
                          : 'Select existing client or enter manually'}
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      <TextField
                        fullWidth
                        label='Client Name'
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        size='small'
                        required
                      />
                      <TextField
                        fullWidth
                        label='Phone Number'
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        size='small'
                      />
                      <TextField
                        fullWidth
                        label='Email'
                        type='email'
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                        size='small'
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Service Selection */}
                  <FormControl fullWidth size='small' required>
                    <InputLabel>Service</InputLabel>
                    <Select value={serviceId} label='Service' onChange={e => handleServiceChange(e.target.value)}>
                      <MenuItem value=''>Select service</MenuItem>
                      {mockServices.map(svc => (
                        <MenuItem key={svc.id} value={svc.id}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                            <span>{svc.name}</span>
                            <Typography variant='caption' color='text.secondary'>
                              {svc.duration}min • ${svc.price}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Staff Selection (only dynamic staff) */}
                  <FormControl fullWidth size='small' required>
                    <InputLabel>Staff Member</InputLabel>
                    <Select value={staffId} label='Staff Member' onChange={e => setStaffId(e.target.value)}>
                      <MenuItem value=''>Select staff</MenuItem>
                      {dynamicStaff.map(staff => (
                        <MenuItem key={staff.id} value={staff.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {getInitials(staff.name)}
                            </Avatar>
                            {staff.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  {/* Date Selection */}
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={600}
                      sx={{ mb: 1, display: 'block' }}
                    >
                      APPOINTMENT DATE & TIME
                    </Typography>
                    <DatePickerField label='Appointment Date' value={date} onChange={setDate} size='small' fullWidth />

                    {/* Start Time (end time auto-calculated) */}
                    <Box sx={{ mt: 1.5 }}>
                      <TimeSelectField
                        label='Start Time'
                        value={startTime}
                        onChange={setStartTime}
                        size='small'
                        fullWidth
                      />
                    </Box>
                    {serviceId && (
                      <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5, display: 'block' }}>
                        End time: {endTime} (based on {serviceDuration}min service duration)
                      </Typography>
                    )}
                  </Box>

                  {/* Availability Warning */}
                  {availabilityWarning && (
                    <Paper sx={{ p: 1.5, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.main' }}>
                      <Typography variant='body2' color='warning.dark'>
                        <i className='ri-alert-line' style={{ marginRight: 8 }} />
                        {availabilityWarning}
                      </Typography>
                    </Paper>
                  )}

                  {/* Requested by Client */}
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={requestedByClient}
                        onChange={e => setRequestedByClient(e.target.checked)}
                        icon={<i className='ri-heart-line' />}
                        checkedIcon={<i className='ri-heart-fill' style={{ color: '#f44336' }} />}
                      />
                    }
                    label='Requested by client'
                  />
                </Stack>
              ) : (
                // EDIT MODE - Read-only with editable status and starred
                <Stack spacing={2.5}>
                  {/* Booking Reference */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      BOOKING REFERENCE
                    </Typography>
                    <Typography variant='body1' fontWeight={600}>
                      {bookingReference}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Client Information (read-only) */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      CLIENT
                    </Typography>
                    <Typography variant='body1'>{clientName || 'N/A'}</Typography>
                    {clientPhone && (
                      <Typography variant='body2' color='text.secondary'>
                        <i className='ri-phone-line' style={{ marginRight: 4 }} />
                        {clientPhone}
                      </Typography>
                    )}
                    {clientEmail && (
                      <Typography variant='body2' color='text.secondary'>
                        <i className='ri-mail-line' style={{ marginRight: 4 }} />
                        {clientEmail}
                      </Typography>
                    )}
                  </Box>

                  <Divider />

                  {/* Service (read-only) */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      SERVICE
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant='body1'>{serviceName || 'N/A'}</Typography>
                      <Typography variant='h6' color='primary.main' fontWeight={600}>
                        ${servicePrice.toFixed(2)}
                      </Typography>
                    </Box>
                    <Typography variant='caption' color='text.secondary'>
                      Duration: {serviceDuration} minutes
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Staff (read-only) */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      STAFF MEMBER
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                        {getInitials(mockStaff.find(s => s.id === staffId)?.name || '')}
                      </Avatar>
                      <Typography variant='body1'>{mockStaff.find(s => s.id === staffId)?.name || 'N/A'}</Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Date & Time (read-only) */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      DATE & TIME
                    </Typography>
                    <Typography variant='body1'>
                      {formatShortDate(date)} • {startTime} - {endTime}
                    </Typography>
                  </Box>

                  {requestedByClient && (
                    <>
                      <Divider />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <i className='ri-heart-fill' style={{ color: '#f44336' }} />
                        <Typography variant='body2'>Requested by client</Typography>
                      </Box>
                    </>
                  )}

                  <Divider />

                  {/* EDITABLE SECTION */}
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      fontWeight={600}
                      sx={{ mb: 1.5, display: 'block' }}
                    >
                      EDITABLE FIELDS
                    </Typography>

                    {/* Status (editable) */}
                    <FormControl fullWidth size='small' sx={{ mb: 2 }}>
                      <InputLabel>Status</InputLabel>
                      <Select value={status} label='Status' onChange={e => setStatus(e.target.value as typeof status)}>
                        <MenuItem value='confirmed'>Confirmed</MenuItem>
                        <MenuItem value='no_show'>No Show</MenuItem>
                        <MenuItem value='completed'>Completed</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Starred (editable) */}
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={starred}
                          onChange={e => setStarred(e.target.checked)}
                          icon={<i className='ri-star-line' />}
                          checkedIcon={<i className='ri-star-fill' style={{ color: '#FFD700' }} />}
                        />
                      }
                      label='Star this booking'
                    />
                  </Box>
                </Stack>
              )}
            </>
          )}

          {/* ===== STATIC/FIXED MODE ===== */}
          {effectiveSchedulingMode === 'static' &&
            (() => {
              // Calculate capacity at the top level for reuse
              const totalCapacity = 20 // Mock capacity - in real app from slot data
              const bookedCount = slotClients.length
              const availableCapacity = totalCapacity - bookedCount
              const isLow = availableCapacity < totalCapacity * 0.3
              const isFull = availableCapacity === 0

              return (
                <Stack spacing={2.5}>
                  {/* Slot Info Header */}
                  <Box>
                    <Typography variant='caption' color='text.secondary' fontWeight={600}>
                      SLOT INFORMATION
                    </Typography>
                    <Typography variant='body1' fontWeight={500}>
                      {serviceName || 'Group Session'} • {formatShortDate(date)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      {startTime} - {endTime}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Capacity Display */}
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: isFull ? 'error.lighter' : isLow ? 'warning.lighter' : 'success.lighter',
                      border: 1,
                      borderColor: isFull ? 'error.main' : isLow ? 'warning.main' : 'success.main'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant='body2' fontWeight={600}>
                          Capacity Status
                        </Typography>
                        <Typography variant='caption' color='text.secondary'>
                          {bookedCount} booked • {availableCapacity} spots remaining
                        </Typography>
                      </Box>
                      <Chip
                        label={`${availableCapacity}/${totalCapacity}`}
                        size='small'
                        color={isFull ? 'error' : isLow ? 'warning' : 'success'}
                        icon={<i className='ri-user-line' style={{ fontSize: '0.75rem' }} />}
                      />
                    </Box>
                  </Paper>

                  <Divider />

                  {/* Client List - Fully Editable */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant='caption' color='text.secondary' fontWeight={600}>
                        BOOKED CLIENTS ({slotClients.length})
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      {slotClients.length === 0 ? (
                        <Paper sx={{ p: 3, textAlign: 'center' }} variant='outlined'>
                          <Typography variant='body2' color='text.secondary'>
                            No clients booked yet
                          </Typography>
                        </Paper>
                      ) : (
                        slotClients.map((client, index) => (
                          <Paper key={client.id} sx={{ p: 2 }} variant='outlined'>
                            {/* Client Header with Remove */}
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                                mb: 1.5
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', bgcolor: 'primary.main' }}>
                                  {getInitials(client.name)}
                                </Avatar>
                                <Box>
                                  <Typography variant='body2' fontWeight={600}>
                                    {client.name}
                                  </Typography>
                                  <Typography variant='caption' color='text.secondary'>
                                    Added: {new Date(client.bookedAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <IconButton
                                size='small'
                                onClick={() => handleRemoveClientFromSlot(client.id)}
                                sx={{ color: 'error.main' }}
                              >
                                <i className='ri-delete-bin-line' />
                              </IconButton>
                            </Box>

                            {/* Client Contact Info */}
                            <Stack spacing={1} sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='ri-mail-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                                <Typography variant='body2' color={client.email ? 'text.primary' : 'text.secondary'}>
                                  {client.email || 'No email'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <i className='ri-phone-line' style={{ fontSize: '1rem', opacity: 0.6 }} />
                                <Typography variant='body2' color={client.phone ? 'text.primary' : 'text.secondary'}>
                                  {client.phone || 'No phone'}
                                </Typography>
                              </Box>
                            </Stack>

                            {/* Editable Status and Arrival Time */}
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                              <FormControl size='small' sx={{ minWidth: 130 }}>
                                <InputLabel>Status</InputLabel>
                                <Select
                                  value={client.status}
                                  label='Status'
                                  onChange={e =>
                                    handleClientStatusChange(client.id, e.target.value as SlotClient['status'])
                                  }
                                >
                                  <MenuItem value='confirmed'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <i className='ri-checkbox-circle-line' style={{ color: '#4caf50' }} />
                                      Confirmed
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value='no_show'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <i className='ri-close-circle-line' style={{ color: '#f44336' }} />
                                      No Show
                                    </Box>
                                  </MenuItem>
                                  <MenuItem value='completed'>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <i className='ri-check-double-line' style={{ color: '#2196f3' }} />
                                      Completed
                                    </Box>
                                  </MenuItem>
                                </Select>
                              </FormControl>
                              <TimeSelectField
                                label='Arrival Time'
                                value={client.arrivalTime || ''}
                                onChange={time => handleClientArrivalChange(client.id, time)}
                                size='small'
                                fullWidth={false}
                              />
                            </Box>
                          </Paper>
                        ))
                      )}

                      {/* Add New Client Section */}
                      {isAddingClient ? (
                        <Paper sx={{ p: 2, border: '2px solid', borderColor: 'primary.main' }} variant='outlined'>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant='body2' fontWeight={600}>
                              Add New Client to Slot
                            </Typography>
                            <IconButton size='small' onClick={() => setIsAddingClient(false)}>
                              <i className='ri-close-line' />
                            </IconButton>
                          </Box>

                          {/* Option to select existing client */}
                          <Box
                            onClick={() => setIsClientPickerOpen(true)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              p: 1.5,
                              mb: 2,
                              border: '1px dashed',
                              borderColor: 'divider',
                              borderRadius: 1,
                              cursor: 'pointer',
                              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
                            }}
                          >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300' }}>
                              <i className='ri-user-search-line' />
                            </Avatar>
                            <Typography variant='body2' color='text.secondary'>
                              Search existing clients...
                            </Typography>
                          </Box>

                          <Typography
                            variant='caption'
                            color='text.secondary'
                            sx={{ display: 'block', mb: 1.5, textAlign: 'center' }}
                          >
                            — or enter manually —
                          </Typography>

                          <Stack spacing={1.5}>
                            <TextField
                              fullWidth
                              label='Client Name'
                              value={newClientName}
                              onChange={e => setNewClientName(e.target.value)}
                              size='small'
                              required
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <TextField
                                fullWidth
                                label='Email'
                                value={newClientEmail}
                                onChange={e => setNewClientEmail(e.target.value)}
                                size='small'
                              />
                              <TextField
                                fullWidth
                                label='Phone'
                                value={newClientPhone}
                                onChange={e => setNewClientPhone(e.target.value)}
                                size='small'
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Button variant='outlined' size='small' onClick={() => setIsAddingClient(false)}>
                                Cancel
                              </Button>
                              <Button variant='contained' size='small' onClick={handleAddClientToSlot}>
                                Add to Slot
                              </Button>
                            </Box>
                          </Stack>
                        </Paper>
                      ) : (
                        <Button
                          fullWidth
                          variant='outlined'
                          startIcon={<i className='ri-user-add-line' />}
                          onClick={() => setIsAddingClient(true)}
                          disabled={isFull}
                          sx={{
                            borderStyle: 'dashed',
                            py: 1.5,
                            '&:hover': { borderStyle: 'solid' }
                          }}
                        >
                          {isFull ? 'Slot Full - Cannot Add Clients' : 'Add Client to Slot'}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              )
            })()}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
          {/* Validation Error */}
          {validationError && (
            <Paper sx={{ p: 1.5, mb: 2, bgcolor: 'error.lighter', border: 1, borderColor: 'error.main' }}>
              <Typography variant='body2' color='error.dark'>
                <i className='ri-error-warning-line' style={{ marginRight: 8 }} />
                {validationError}
              </Typography>
            </Paper>
          )}

          {/* Price Display for Dynamic Mode */}
          {effectiveSchedulingMode === 'dynamic' && servicePrice > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                Total
              </Typography>
              <Typography variant='h6' fontWeight={700}>
                ${servicePrice.toFixed(2)}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {mode === 'edit' && (
              <Button
                variant='outlined'
                color='error'
                onClick={() => {
                  onDelete?.(existingEvent?.id || '')
                  handleClose()
                }}
              >
                Cancel Booking
              </Button>
            )}
            <Box sx={{ flex: 1 }} />
            <Button variant='outlined' onClick={handleClose}>
              {mode === 'edit' ? 'Close' : 'Discard'}
            </Button>
            {(mode === 'create' || effectiveSchedulingMode === 'static') && (
              <Button variant='contained' onClick={handleSave}>
                {mode === 'create' ? 'Create Booking' : 'Save Changes'}
              </Button>
            )}
            {mode === 'edit' && effectiveSchedulingMode === 'dynamic' && (
              <Button variant='contained' onClick={handleSave}>
                Update Status
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Client Picker Dialog */}
      <ClientPickerDialog
        open={isClientPickerOpen}
        onClose={() => setIsClientPickerOpen(false)}
        onSelect={handleClientSelect}
        selectedClientId={selectedClient?.id}
      />
    </Dialog>
  )
}
