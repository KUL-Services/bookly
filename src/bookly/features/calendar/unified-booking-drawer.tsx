'use client'

import { useState, useEffect, useMemo } from 'react'
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
  InputAdornment,
  Alert,
  Stack
} from '@mui/material'
import { mockStaff, mockServices, mockBookings, mockRooms } from '@/bookly/data/mock-data'
import type { DateRange, StaticServiceSlot, CalendarEvent } from './types'
import type { User } from '@/bookly/data/types'
import { useCalendarStore } from './state'
import {
  isStaffAvailable,
  hasConflict,
  getServiceDuration,
  getStaffAvailableCapacity,
  getCapacityColor,
  getStaffRoomAssignment
} from './utils'
import ClientPickerDialog from './client-picker-dialog'
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'

// Helper function to get 2 initials from a name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

interface UnifiedBookingDrawerProps {
  open: boolean
  mode: 'create' | 'edit' // create = new booking, edit = existing booking
  initialDate?: Date | null
  initialDateRange?: DateRange | null
  initialStaffId?: string | null
  initialServiceId?: string | null // Pre-select service when opening
  existingEvent?: CalendarEvent | null // For edit mode
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
  const branchFilters = useCalendarStore(state => state.branchFilters)
  const getSlotsForDate = useCalendarStore(state => state.getSlotsForDate)
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const getRoomsByBranch = useCalendarStore(state => state.getRoomsByBranch)
  const staticSlots = useCalendarStore(state => state.staticSlots)

  // Form state
  const [date, setDate] = useState(initialDate || new Date())
  const [startTime, setStartTime] = useState('11:15')
  const [endTime, setEndTime] = useState('11:30')
  const [staffId, setStaffId] = useState(initialStaffId || '')
  const [selectedClient, setSelectedClient] = useState<User | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [service, setService] = useState('')
  const [serviceId, setServiceId] = useState('')
  const [servicePrice, setServicePrice] = useState(0)
  const [notes, setNotes] = useState('')
  const [requestedByClient, setRequestedByClient] = useState(false)
  const [staffManuallyChosen, setStaffManuallyChosen] = useState(!!initialStaffId)
  const [status, setStatus] = useState<
    'confirmed' | 'pending' | 'completed' | 'cancelled' | 'need_confirm' | 'no_show'
  >('confirmed')
  const [starred, setStarred] = useState(false)
  const [arrivalTime, setArrivalTime] = useState('')
  const [bookingReferenceNumber, setBookingReferenceNumber] = useState('')
  const [instapayReferenceNumber, setInstapayReferenceNumber] = useState('')

  // State for capacity and warnings
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null)
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null)
  const [staffCapacityInfo, setStaffCapacityInfo] = useState<{ available: number; max: number; isLow: boolean } | null>(
    null
  )

  // Static mode state
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [partySize, setPartySize] = useState(1)
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false)

  // Service pricing map
  const servicePrices: Record<string, number> = {
    haircut: 65,
    manicure: 35,
    massage: 80,
    color: 120,
    pedicure: 40,
    facial: 90,
    waxing: 45
  }

  // Determine if this is static or dynamic resource
  const selectedStaff = mockStaff.find(s => s.id === staffId)
  const isStaticStaff = selectedStaff?.staffType === 'static'
  const isDynamicStaff = selectedStaff?.staffType === 'dynamic'
  const isStaticRoom = selectedRoomId && mockRooms.find(r => r.id === selectedRoomId)?.roomType === 'static'
  const isDynamicRoom = selectedRoomId && mockRooms.find(r => r.id === selectedRoomId)?.roomType === 'dynamic'

  // Load existing event data in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingEvent && existingEvent.extendedProps) {
      const start = new Date(existingEvent.start)
      const end = new Date(existingEvent.end)
      setDate(start)
      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setStaffId(existingEvent.extendedProps.staffId)
      setClientName(existingEvent.extendedProps.customerName || '')

      // Pre-select service - use serviceId if available, otherwise find by name
      const existingServiceId = existingEvent.extendedProps.serviceId
      const serviceName = existingEvent.extendedProps.serviceName || ''
      setService(serviceName)
      setServicePrice(existingEvent.extendedProps.price || 0)

      if (existingServiceId) {
        // Use existing serviceId directly
        setServiceId(existingServiceId)
      } else if (serviceName) {
        // Find and set the service ID based on service name
        const matchingService = mockServices.find(s => s.name === serviceName)
        if (matchingService) {
          setServiceId(matchingService.id)
        }
      }

      setNotes(existingEvent.extendedProps.notes || '')
      setRequestedByClient(existingEvent.extendedProps.selectionMethod === 'by_client')
      setStatus(existingEvent.extendedProps.status || 'confirmed')
      setStarred(existingEvent.extendedProps.starred || false)
      setArrivalTime(existingEvent.extendedProps.arrivalTime || '')
      setPartySize(existingEvent.extendedProps.partySize || 1)
      setBookingReferenceNumber(existingEvent.extendedProps.bookingReference || existingEvent.id || '')
      setInstapayReferenceNumber(existingEvent.extendedProps.instapayReference || '')
      if (existingEvent.extendedProps.slotId) {
        setSelectedSlotId(existingEvent.extendedProps.slotId)
      }
      if (existingEvent.extendedProps.roomId) {
        setSelectedRoomId(existingEvent.extendedProps.roomId)
      }
    }
  }, [mode, existingEvent])

  // Pre-select service when drawer opens with initialServiceId
  useEffect(() => {
    if (open && initialServiceId && mode === 'create') {
      const selectedService = mockServices.find(s => s.id === initialServiceId)
      if (selectedService) {
        setServiceId(initialServiceId)
        setService(selectedService.name)
        setServicePrice(selectedService.price)

        // Auto-calculate end time for dynamic mode
        if (schedulingMode === 'dynamic' && startTime) {
          const [hours, minutes] = startTime.split(':').map(Number)
          const startMinutes = hours * 60 + minutes
          const endMinutes = startMinutes + selectedService.duration
          const endHours = Math.floor(endMinutes / 60)
          const endMins = endMinutes % 60
          setEndTime(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`)
        }
      }
    }
  }, [open, initialServiceId, mode, schedulingMode, startTime])

  // Check availability in real-time
  useEffect(() => {
    if (!staffId || !startTime || !endTime) {
      setAvailabilityWarning(null)
      setCapacityWarning(null)
      setStaffCapacityInfo(null)
      return
    }

    // Check staff availability
    const availability = isStaffAvailable(staffId, date, startTime, endTime)
    if (!availability.available) {
      setAvailabilityWarning(availability.reason || 'Staff is not available at this time')
      return
    }

    // Check for conflicts (exclude current event if editing)
    const conflict = hasConflict(
      mode === 'edit' ? events.filter(e => e.id !== existingEvent?.id) : events,
      staffId,
      date,
      startTime,
      endTime
    )
    if (conflict.conflict) {
      const conflictStart = new Date(conflict.conflictingEvent!.start)
      const conflictEnd = new Date(conflict.conflictingEvent!.end)
      const conflictTimeStr = `${conflictStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${conflictEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      setAvailabilityWarning(`Conflicts with existing appointment (${conflictTimeStr})`)
      return
    }

    // Check capacity for dynamic staff
    if (schedulingMode === 'dynamic' && isDynamicStaff) {
      const appointmentTime = new Date(date)
      const [hours, minutes] = startTime.split(':').map(Number)
      appointmentTime.setHours(hours, minutes, 0, 0)

      const availableCapacity = getStaffAvailableCapacity(staffId, appointmentTime, mockBookings)
      const maxCapacity = selectedStaff.maxConcurrentBookings || 1

      if (availableCapacity !== null) {
        const isLowCapacity = availableCapacity > 0 && availableCapacity < maxCapacity * 0.3
        setStaffCapacityInfo({
          available: availableCapacity,
          max: maxCapacity,
          isLow: isLowCapacity
        })

        if (availableCapacity === 0) {
          setCapacityWarning(
            `No capacity available at this time. ${selectedStaff.name} has ${maxCapacity} concurrent booking(s) already booked.`
          )
        } else if (isLowCapacity) {
          setCapacityWarning(`Limited capacity. Only ${availableCapacity} slot(s) remaining.`)
        } else {
          setCapacityWarning(null)
        }
      }
    }

    setAvailabilityWarning(null)
  }, [staffId, date, startTime, endTime, events, schedulingMode, isDynamicStaff, selectedStaff, mode, existingEvent])

  const handleSave = () => {
    setValidationError(null)

    // Validation for static mode
    if (schedulingMode === 'static') {
      if (!selectedSlotId) {
        setValidationError('Please select a time slot')
        return
      }

      // For static mode, can only edit existing bookings in slots, can't create new ones
      if (mode === 'create') {
        setValidationError('New bookings in static mode must be created from available slots')
        return
      }

      const { available, remainingCapacity } = isSlotAvailable(selectedSlotId, date)
      if (partySize < 1) {
        setValidationError('Party size must be at least 1')
        return
      }
    } else {
      // Validation for dynamic mode
      if (!staffId) {
        setValidationError('Please select a staff member')
        return
      }

      if (startTime >= endTime) {
        setValidationError('End time must be after start time')
        return
      }
    }

    const booking = {
      date,
      startTime,
      endTime,
      staffId,
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      service,
      servicePrice,
      notes,
      requestedByClient,
      staffManuallyChosen,
      status,
      paymentStatus,
      starred,
      arrivalTime,
      partySize,
      ...(schedulingMode === 'static' && {
        slotId: selectedSlotId,
        roomId: selectedRoomId
      })
    }

    onSave?.(booking)
    handleClose()
  }

  const handleServiceChange = (newServiceId: string) => {
    const selectedService = mockServices.find(s => s.id === newServiceId)
    if (selectedService) {
      setServiceId(newServiceId)
      setService(selectedService.name)
      setServicePrice(selectedService.price)

      if (schedulingMode === 'dynamic' && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number)
        const startMinutes = hours * 60 + minutes
        const endMinutes = startMinutes + selectedService.duration
        const endHours = Math.floor(endMinutes / 60)
        const endMins = endMinutes % 60
        setEndTime(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`)
      }
    }
  }

  const handleSlotSelect = (slotId: string) => {
    const availableSlots = getSlotsForDate(date)
    const slot = availableSlots.find(s => s.id === slotId)

    if (slot) {
      setSelectedSlotId(slotId)
      setSelectedRoomId(slot.roomId)
      setStartTime(slot.startTime)
      setEndTime(slot.endTime)
      setServiceId(slot.serviceId)
      setService(slot.serviceName)
      setServicePrice(slot.price)
      if (slot.instructorStaffId) {
        setStaffId(slot.instructorStaffId)
      }
    }
  }

  const handleClientSelect = (client: User | null) => {
    setSelectedClient(client)
    if (client) {
      setClientName(`${client.firstName} ${client.lastName}`)
      setClientEmail(client.email)
      setClientPhone(client.phone || '')
    }
  }

  const handleClose = () => {
    setSelectedClient(null)
    setClientName('')
    setClientEmail('')
    setClientPhone('')
    setService('')
    setServiceId('')
    setServicePrice(0)
    setNotes('')
    setRequestedByClient(false)
    setValidationError(null)
    setAvailabilityWarning(null)
    setCapacityWarning(null)
    setStaffCapacityInfo(null)
    setSelectedSlotId(null)
    setSelectedRoomId(null)
    setPartySize(1)
    setStatus('confirmed')
    setStarred(false)
    setArrivalTime('')
    setBookingReferenceNumber('')
    setInstapayReferenceNumber('')
    onClose()
  }

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant='h6' fontWeight={600}>
          {mode === 'create' ? 'New Booking' : 'Edit Booking'}
        </Typography>
        <IconButton onClick={handleClose} size='small'>
          <i className='ri-close-line' />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, py: 2, maxHeight: '70vh', overflow: 'auto' }}>
        {mode === 'edit' ? (
          // EDIT MODE: READ-ONLY INFORMATIVE VIEW
          <Stack spacing={3}>
            {/* Booking Reference */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Booking Reference
              </Typography>
              <Typography variant='body1' fontWeight={600} sx={{ mt: 0.5 }}>
                {bookingReferenceNumber || 'N/A'}
              </Typography>
            </Box>

            <Divider />

            {/* Client Information */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Client Information
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Name
                  </Typography>
                  <Typography variant='body2'>{clientName || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Email
                  </Typography>
                  <Typography variant='body2'>{clientEmail || 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Phone
                  </Typography>
                  <Typography variant='body2'>{clientPhone || 'N/A'}</Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Service Details */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Service Details
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='caption' color='text.secondary'>
                      Service Name
                    </Typography>
                    <Typography variant='body2'>{service || 'N/A'}</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant='caption' color='text.secondary'>
                      Price
                    </Typography>
                    <Typography variant='body2' fontWeight={600}>
                      ${servicePrice.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* Staff and Appointment Details */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                Appointment Details
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Staff Assigned
                  </Typography>
                  <Typography variant='body2'>
                    {mockStaff.find(s => s.id === staffId)?.name || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Date & Time
                  </Typography>
                  <Typography variant='body2'>
                    {formatDate(date)} • {startTime} - {endTime}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Requested by Client
                  </Typography>
                  <Typography variant='body2'>
                    {requestedByClient ? 'Yes' : 'No'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Divider />

            {/* InstaPay Reference */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
                InstaPay Reference
              </Typography>
              <Typography variant='body2' sx={{ mt: 0.5 }}>
                {instapayReferenceNumber || 'N/A'}
              </Typography>
            </Box>

            <Divider />

            {/* Editable Sections */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ textTransform: 'uppercase', fontWeight: 600, mb: 1.5, display: 'block' }}>
                Status & Notes
              </Typography>
              <Stack spacing={2}>
                {/* Status */}
                <FormControl fullWidth size='small'>
                  <InputLabel>Status</InputLabel>
                  <Select value={status} label='Status' onChange={e => setStatus(e.target.value as any)}>
                    <MenuItem value='confirmed'>Confirmed</MenuItem>
                    <MenuItem value='need_confirm'>Need Confirm</MenuItem>
                    <MenuItem value='completed'>Completed</MenuItem>
                    <MenuItem value='cancelled'>Cancelled</MenuItem>
                  </Select>
                </FormControl>

                {/* Starred Checkbox */}
                <FormControlLabel
                  control={<Checkbox checked={starred} onChange={e => setStarred(e.target.checked)} />}
                  label='Star this booking'
                />

                {/* Notes */}
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label='Notes'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder='Add notes...'
                  size='small'
                />
              </Stack>
            </Box>
          </Stack>
        ) : (
          // CREATE MODE: FULL EDITABLE FORM
          <Stack spacing={3}>
            {/* Date */}
            <Box>
              <Typography variant='subtitle2' color='text.secondary' sx={{ mb: 0.5 }}>
                Appointment Date
              </Typography>
              <Typography variant='body1' fontWeight={600}>
                {formatDate(date)}
              </Typography>
            </Box>

            {/* Service Selection */}
            {schedulingMode === 'dynamic' && (
              <FormControl fullWidth size='small'>
                <InputLabel>Service</InputLabel>
                <Select
                  value={serviceId}
                  label='Service'
                  onChange={e => handleServiceChange(e.target.value)}
                >
                  <MenuItem value=''>Select service</MenuItem>
                  {mockServices.map(svc => (
                    <MenuItem key={svc.id} value={svc.id}>
                      {svc.name} - ${svc.price} ({svc.duration} min)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Time Selection */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TimeSelectField
                label='Start Time'
                value={startTime}
                onChange={setStartTime}
                size='small'
                fullWidth
              />
              <TimeSelectField
                label='End Time'
                value={endTime}
                onChange={setEndTime}
                size='small'
                fullWidth
              />
            </Box>

            {/* Staff Selection */}
            {schedulingMode === 'dynamic' && (
              <FormControl fullWidth size='small'>
                <InputLabel>Staff</InputLabel>
                <Select
                  value={staffId}
                  label='Staff'
                  onChange={e => {
                    const newStaffId = e.target.value
                    setStaffId(newStaffId)
                    setStaffManuallyChosen(true)
                    if (date) {
                      const roomAssignment = getStaffRoomAssignment(newStaffId, date)
                      if (roomAssignment) {
                        setSelectedRoomId(roomAssignment.roomId)
                      }
                    }
                  }}
                >
                  <MenuItem value=''>Select staff</MenuItem>
                  {mockStaff.slice(0, 7).map(staff => {
                    const showCapacity = staff.staffType === 'dynamic' && startTime && endTime
                    let availableCapacity = null
                    if (showCapacity) {
                      const appointmentTime = new Date(date)
                      const [hours, minutes] = startTime.split(':').map(Number)
                      appointmentTime.setHours(hours, minutes, 0, 0)
                      availableCapacity = getStaffAvailableCapacity(staff.id, appointmentTime, mockBookings)
                    }

                    return (
                      <MenuItem key={staff.id} value={staff.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Avatar sx={{ width: 24, height: 24 }}>{getInitials(staff.name)}</Avatar>
                          <Box sx={{ flex: 1 }}>{staff.name}</Box>
                          {showCapacity && availableCapacity !== null && (
                            <Chip
                              icon={<i className='ri-user-line' style={{ fontSize: '0.65rem' }} />}
                              label={`${availableCapacity}/${staff.maxConcurrentBookings || 1}`}
                              size='small'
                              color={availableCapacity === 0 ? 'error' : availableCapacity < (staff.maxConcurrentBookings || 1) * 0.3 ? 'warning' : 'success'}
                              sx={{ fontWeight: 600, height: 20, fontSize: '0.65rem', '& .MuiChip-icon': { marginLeft: '2px' } }}
                            />
                          )}
                        </Box>
                      </MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            )}

            {/* Availability Warning */}
            {availabilityWarning && (
              <Alert severity='warning' icon={<i className='ri-alert-line' />}>
                {availabilityWarning}
              </Alert>
            )}

            {/* Capacity Warning */}
            {capacityWarning && (
              <Alert severity='error' icon={<i className='ri-error-warning-line' />}>
                {capacityWarning}
              </Alert>
            )}

            {/* Client Selection */}
            <Box
              onClick={() => setIsClientPickerOpen(true)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                border: '2px dashed',
                borderColor: selectedClient ? 'primary.main' : 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                bgcolor: selectedClient ? 'action.selected' : 'transparent',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' }
              }}
            >
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'grey.200' }}>
                {selectedClient ? `${selectedClient.firstName[0]}${selectedClient.lastName[0]}` : <i className='ri-user-line' style={{ fontSize: '1.5rem', color: '#999' }} />}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                {selectedClient ? (
                  <>
                    <Typography variant='body2' fontWeight={600}>
                      {selectedClient.firstName} {selectedClient.lastName}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {selectedClient.email}
                    </Typography>
                  </>
                ) : (
                  <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                    Select client or walk-in
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Client Information */}
            <TextField
              fullWidth
              label='Name'
              value={clientName}
              onChange={e => setClientName(e.target.value)}
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
            <TextField
              fullWidth
              label='Phone'
              value={clientPhone}
              onChange={e => setClientPhone(e.target.value)}
              size='small'
            />

            {/* Requested by Client */}
            <FormControlLabel
              control={<Checkbox checked={requestedByClient} onChange={e => setRequestedByClient(e.target.checked)} />}
              label='Requested by client'
            />

            {/* Notes */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label='Notes'
              value={notes}
              onChange={e => setNotes(e.target.value)}
              size='small'
            />
          </Stack>
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          justifyContent: 'flex-end'
        }}
      >
        {mode === 'edit' && (
          <Button
            variant='outlined'
            color='error'
            onClick={() => {
              onDelete?.(existingEvent?.id || '')
              handleClose()
            }}
          >
            Delete
          </Button>
        )}
        <Button variant='outlined' onClick={handleClose}>
          {mode === 'edit' ? 'Cancel' : 'Discard'}
        </Button>
        <Button variant='contained' onClick={handleSave}>
          {mode === 'create' ? 'Create' : 'Save'}
        </Button>
      </Box>

      {validationError && (
        <Box sx={{ px: 3, pb: 2 }}>
          <Alert severity='error' icon={<i className='ri-error-warning-line' />}>
            {validationError}
          </Alert>
        </Box>
      )}

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
