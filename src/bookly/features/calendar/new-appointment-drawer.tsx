'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
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
  Tab,
  Tabs,
  Checkbox,
  FormControlLabel,
  Chip,
  InputAdornment
} from '@mui/material'
import { mockStaff, mockServices, mockBookings } from '@/bookly/data/mock-data'
import type { DateRange } from './types'
import type { User } from '@/bookly/data/types'
import { useCalendarStore } from './state'
import { isStaffAvailable, hasConflict, getServiceDuration, getStaffAvailableCapacity, getCapacityColor } from './utils'
import ClientPickerDialog from './client-picker-dialog'

// Helper function to get 2 initials from a name
const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return parts[0].substring(0, 2).toUpperCase()
}

interface NewAppointmentDrawerProps {
  open: boolean
  initialDate?: Date | null
  initialDateRange?: DateRange | null
  initialStaffId?: string | null
  onClose: () => void
  onSave?: (appointment: any) => void
}

export default function NewAppointmentDrawer({
  open,
  initialDate,
  initialDateRange,
  initialStaffId,
  onClose,
  onSave
}: NewAppointmentDrawerProps) {
  const [activeTab, setActiveTab] = useState(0)
  const events = useCalendarStore(state => state.events)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)
  const branchFilters = useCalendarStore(state => state.branchFilters)
  const getSlotsForDate = useCalendarStore(state => state.getSlotsForDate)
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const getRoomsByBranch = useCalendarStore(state => state.getRoomsByBranch)
  const staticSlots = useCalendarStore(state => state.staticSlots) // Subscribe to slots for reactivity

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
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null)
  const [capacityWarning, setCapacityWarning] = useState<string | null>(null)
  const [staffCapacityInfo, setStaffCapacityInfo] = useState<{available: number, max: number, isLow: boolean} | null>(null)
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false)

  // Static mode state
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [partySize, setPartySize] = useState(1)

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

  // Update state when props change
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate)
    }
    if (initialDateRange) {
      const start = new Date(initialDateRange.start)
      const end = new Date(initialDateRange.end)
      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    if (initialStaffId) {
      setStaffId(initialStaffId)
      setStaffManuallyChosen(true)
    }
  }, [initialDate, initialDateRange, initialStaffId, open])

  // Check availability in real-time and show as warning
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

    // Check for conflicts
    const conflict = hasConflict(events, staffId, date, startTime, endTime)
    if (conflict.conflict) {
      const conflictStart = new Date(conflict.conflictingEvent!.start)
      const conflictEnd = new Date(conflict.conflictingEvent!.end)
      const conflictTimeStr = `${conflictStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - ${conflictEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
      setAvailabilityWarning(`Conflicts with existing appointment (${conflictTimeStr})`)
      return
    }

    // Check capacity for dynamic staff in dynamic mode
    if (schedulingMode === 'dynamic') {
      const staff = mockStaff.find(s => s.id === staffId)
      if (staff && staff.staffType === 'dynamic') {
        const appointmentTime = new Date(date)
        const [hours, minutes] = startTime.split(':').map(Number)
        appointmentTime.setHours(hours, minutes, 0, 0)

        const availableCapacity = getStaffAvailableCapacity(staffId, appointmentTime, mockBookings)
        const maxCapacity = staff.maxConcurrentBookings || 1

        if (availableCapacity !== null) {
          const isLowCapacity = availableCapacity > 0 && availableCapacity < maxCapacity * 0.3
          setStaffCapacityInfo({
            available: availableCapacity,
            max: maxCapacity,
            isLow: isLowCapacity
          })

          if (availableCapacity === 0) {
            setCapacityWarning(`No capacity available at this time. ${staff.name} has ${maxCapacity} concurrent booking(s) already booked.`)
          } else if (isLowCapacity) {
            setCapacityWarning(`Limited capacity. Only ${availableCapacity} slot(s) remaining.`)
          } else {
            setCapacityWarning(null)
          }
        }
      }
    }

    setAvailabilityWarning(null)
  }, [staffId, date, startTime, endTime, events, schedulingMode])

  const handleSave = () => {
    // Clear previous validation errors
    setValidationError(null)

    // Validation for static mode
    if (schedulingMode === 'static') {
      if (!selectedSlotId) {
        setValidationError('Please select a time slot')
        return
      }
      // Check slot availability and capacity
      const { available, remainingCapacity } = isSlotAvailable(selectedSlotId, date)
      if (!available) {
        setValidationError('Selected slot is fully booked')
        return
      }
      if (partySize > remainingCapacity) {
        setValidationError(`Not enough capacity: Only ${remainingCapacity} spot(s) remaining, but ${partySize} requested`)
        return
      }
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

      // Validate time format and order
      if (startTime >= endTime) {
        setValidationError('End time must be after start time')
        return
      }
    }

    // Note: Availability and conflict checks are shown as warnings, not blocking errors
    // This allows booking outside normal hours if needed (emergency bookings, etc.)

    const appointment = {
      date,
      startTime,
      endTime,
      staffId,
      clientName,
      clientEmail,
      clientPhone,
      service,
      servicePrice,
      notes,
      requestedByClient,
      staffManuallyChosen,
      // Static mode fields
      ...(schedulingMode === 'static' && {
        slotId: selectedSlotId,
        roomId: selectedRoomId,
        partySize: partySize
      })
    }
    onSave?.(appointment)
    handleClose()
  }

  const handleServiceChange = (newServiceId: string) => {
    const selectedService = mockServices.find(s => s.id === newServiceId)
    if (selectedService) {
      setServiceId(newServiceId)
      setService(selectedService.name)
      setServicePrice(selectedService.price)

      // In dynamic mode, auto-calculate end time based on service duration
      if (schedulingMode === 'dynamic' && startTime) {
        const [hours, minutes] = startTime.split(':').map(Number)
        const startMinutes = hours * 60 + minutes
        const endMinutes = startMinutes + selectedService.duration
        const endHours = Math.floor(endMinutes / 60)
        const endMins = endMinutes % 60
        setEndTime(`${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`)
      }
    } else {
      setServiceId(newServiceId)
      setService(newServiceId)
      setServicePrice(servicePrices[newServiceId] || 0)
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
    } else {
      // Walk-in - clear fields
      setClientName('')
      setClientEmail('')
      setClientPhone('')
    }
  }

  const handleClose = () => {
    // Reset form
    setActiveTab(0)
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
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5" fontWeight={600}>
            New Appointment
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <i className="ri-close-line" />
          </IconButton>
        </Box>

        {/* Client Selection */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box
            onClick={() => setIsClientPickerOpen(true)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 2,
              border: '2px dashed',
              borderColor: selectedClient ? 'primary.main' : 'divider',
              borderRadius: 2,
              cursor: 'pointer',
              bgcolor: selectedClient ? 'action.selected' : 'transparent',
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'action.hover'
              }
            }}
          >
            <Avatar
              src={selectedClient?.profileImage}
              sx={{ width: 56, height: 56, bgcolor: 'grey.200' }}
            >
              {selectedClient ? (
                `${selectedClient.firstName[0]}${selectedClient.lastName[0]}`
              ) : (
                <i className="ri-user-line" style={{ fontSize: '2rem', color: '#999' }} />
              )}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              {selectedClient ? (
                <>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedClient.firstName} {selectedClient.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedClient.email}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Select a client or leave empty for walk-in
                </Typography>
              )}
            </Box>
            <IconButton onClick={e => {
              e.stopPropagation()
              if (selectedClient) {
                setSelectedClient(null)
                setClientName('')
                setClientEmail('')
                setClientPhone('')
              } else {
                setIsClientPickerOpen(true)
              }
            }}>
              <i className={selectedClient ? 'ri-close-line' : 'ri-add-line'} />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
            <Tab label="APPOINTMENT" />
            <Tab label="NOTES & INFO" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Date */}
              <Box>
                <Typography variant="h6" sx={{ mb: 1.5 }}>
                  {formatDate(date)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<i className="ri-group-line" />}
                    sx={{ textTransform: 'none' }}
                  >
                    Group Booking
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<i className="ri-repeat-line" />}
                    sx={{ textTransform: 'none' }}
                  >
                    Recurring
                  </Button>
                </Box>
              </Box>

              <Divider />

              {/* STATIC MODE: Slot Selection */}
              {schedulingMode === 'static' && (
                <>
                  <FormControl fullWidth>
                    <TextField
                      select
                      label="Select Time Slot"
                      value={selectedSlotId || ''}
                      onChange={(e) => handleSlotSelect(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <i className="ri-arrow-right-s-line" />
                          </InputAdornment>
                        )
                      }}
                    >
                      <MenuItem value="">Select a slot</MenuItem>
                      {getSlotsForDate(date).map((slot) => {
                        const { available, remainingCapacity, total } = isSlotAvailable(slot.id, date)
                        const roomName = getRoomsByBranch(slot.branchId).find(r => r.id === slot.roomId)?.name || 'Unknown Room'
                        const isFull = !available
                        const isLowCapacity = available && remainingCapacity < total * 0.3

                        return (
                          <MenuItem
                            key={slot.id}
                            value={slot.id}
                            disabled={!available}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                              <Box sx={{ flex: 1, mr: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2" fontWeight={600}>
                                    {slot.serviceName} - {roomName}
                                  </Typography>
                                  {isFull && (
                                    <Chip
                                      label="FULL"
                                      size="small"
                                      color="error"
                                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                    />
                                  )}
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {slot.startTime} - {slot.endTime}
                                </Typography>
                              </Box>
                              <Chip
                                icon={<i className="ri-user-line" style={{ fontSize: '0.75rem' }} />}
                                label={`${remainingCapacity}/${total}`}
                                size="small"
                                color={isFull ? 'error' : isLowCapacity ? 'warning' : 'success'}
                                sx={{
                                  fontWeight: 600,
                                  '& .MuiChip-icon': { marginLeft: '4px' }
                                }}
                              />
                            </Box>
                          </MenuItem>
                        )
                      })}
                    </TextField>
                  </FormControl>

                  {/* Party Size Input */}
                  {selectedSlotId && (
                    <Box>
                      <TextField
                        fullWidth
                        type="number"
                        label="Party Size"
                        value={partySize}
                        onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{ min: 1, max: 50 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <i className="ri-group-line" />
                            </InputAdornment>
                          )
                        }}
                        helperText="Number of people for this booking"
                      />

                      {/* Capacity Info Display */}
                      {(() => {
                        const { available, remainingCapacity, total } = isSlotAvailable(selectedSlotId, date)
                        const isLowCapacity = available && remainingCapacity < total * 0.3
                        const exceedsCapacity = partySize > remainingCapacity

                        return (
                          <Box
                            sx={{
                              mt: 1,
                              p: 2,
                              borderRadius: 1,
                              bgcolor: exceedsCapacity ? 'error.lighter' : isLowCapacity ? 'warning.lighter' : 'success.lighter',
                              border: 1,
                              borderColor: exceedsCapacity ? 'error.main' : isLowCapacity ? 'warning.main' : 'success.main'
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="body2" fontWeight={600} color={exceedsCapacity ? 'error.dark' : isLowCapacity ? 'warning.dark' : 'success.dark'}>
                                <i className={`ri-${exceedsCapacity ? 'error-warning' : isLowCapacity ? 'alert' : 'checkbox-circle'}-line`} style={{ marginRight: 4 }} />
                                Capacity Status
                              </Typography>
                              <Chip
                                icon={<i className="ri-user-line" style={{ fontSize: '0.7rem' }} />}
                                label={`${remainingCapacity}/${total} available`}
                                size="small"
                                color={exceedsCapacity ? 'error' : isLowCapacity ? 'warning' : 'success'}
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                              {exceedsCapacity
                                ? `Cannot book ${partySize} spot(s) - only ${remainingCapacity} remaining`
                                : isLowCapacity
                                ? `Limited availability - only ${remainingCapacity} spot(s) left`
                                : `${remainingCapacity} spot(s) available for booking`}
                            </Typography>
                          </Box>
                        )
                      })()}
                    </Box>
                  )}
                </>
              )}

              {/* DYNAMIC MODE: Service Selection */}
              {schedulingMode === 'dynamic' && (
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Select service"
                    value={serviceId}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <i className="ri-arrow-right-s-line" />
                        </InputAdornment>
                      )
                    }}
                  >
                    <MenuItem value="">Select service</MenuItem>
                    {mockServices.map((svc) => (
                      <MenuItem key={svc.id} value={svc.id}>
                        {svc.name} - ${svc.price} ({svc.duration} min)
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              )}

              {/* Time Selection */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="START"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }} // 15 min intervals
                  disabled={schedulingMode === 'static' && !!selectedSlotId}
                />
                <TextField
                  label="END"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ step: 900 }}
                  disabled={schedulingMode === 'static' && !!selectedSlotId}
                />
              </Box>

              {/* Staff Selection (only show in dynamic mode or if slot doesn't have instructor) */}
              {(schedulingMode === 'dynamic' || (schedulingMode === 'static' && !staffId)) && (
                <FormControl fullWidth>
                  <InputLabel>STAFF</InputLabel>
                  <Select
                    value={staffId}
                    label="STAFF"
                    onChange={(e) => {
                      setStaffId(e.target.value)
                      setStaffManuallyChosen(true)
                    }}
                  >
                    {mockStaff.slice(0, 7).map((staff) => {
                      // Calculate capacity for dynamic staff in dynamic mode
                      const showCapacity = schedulingMode === 'dynamic' && staff.staffType === 'dynamic' && startTime && endTime
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
                            <Avatar sx={{ width: 24, height: 24 }}>
                              {getInitials(staff.name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              {staff.name}
                            </Box>
                            {showCapacity && availableCapacity !== null && (
                              <Chip
                                icon={<i className="ri-user-line" style={{ fontSize: '0.65rem' }} />}
                                label={`${availableCapacity}/${staff.maxConcurrentBookings || 1}`}
                                size="small"
                                color={availableCapacity === 0 ? 'error' : availableCapacity < (staff.maxConcurrentBookings || 1) * 0.3 ? 'warning' : 'success'}
                                sx={{
                                  fontWeight: 600,
                                  height: 20,
                                  fontSize: '0.65rem',
                                  '& .MuiChip-icon': { marginLeft: '2px' }
                                }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      )
                    })}
                  </Select>
                </FormControl>
              )}

              {/* Show assigned staff in static mode */}
              {schedulingMode === 'static' && staffId && selectedSlotId && (
                <Box sx={{ p: 2, bgcolor: 'action.selected', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 40, height: 40 }}>
                    {getInitials(mockStaff.find(s => s.id === staffId)?.name || '')}
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Instructor</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {mockStaff.find(s => s.id === staffId)?.name}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Warning if staff not available */}
              {availabilityWarning && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: theme => (theme.palette.mode === 'dark' ? 'warning.dark' : 'warning.light'),
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: theme => `1px solid ${theme.palette.warning.main}`
                  }}
                >
                  <i className="ri-information-line" />
                  <Typography variant="body2" color="warning.dark">
                    {availabilityWarning}
                  </Typography>
                </Box>
              )}

              {/* Capacity Display - Dynamic Staff */}
              {schedulingMode === 'dynamic' && staffCapacityInfo && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: staffCapacityInfo.available === 0
                      ? theme => (theme.palette.mode === 'dark' ? 'error.dark' : 'error.light')
                      : staffCapacityInfo.isLow
                      ? theme => (theme.palette.mode === 'dark' ? 'warning.dark' : 'warning.light')
                      : theme => (theme.palette.mode === 'dark' ? 'success.dark' : 'success.light'),
                    border: 1,
                    borderColor: staffCapacityInfo.available === 0
                      ? 'error.main'
                      : staffCapacityInfo.isLow
                      ? 'warning.main'
                      : 'success.main'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight={600} color={staffCapacityInfo.available === 0 ? 'error.dark' : staffCapacityInfo.isLow ? 'warning.dark' : 'success.dark'}>
                      <i className={`ri-${staffCapacityInfo.available === 0 ? 'error-warning' : staffCapacityInfo.isLow ? 'alert' : 'checkbox-circle'}-line`} style={{ marginRight: 4 }} />
                      Staff Capacity Status
                    </Typography>
                    <Chip
                      icon={<i className="ri-user-line" style={{ fontSize: '0.7rem' }} />}
                      label={`${staffCapacityInfo.available}/${staffCapacityInfo.max} available`}
                      size="small"
                      color={staffCapacityInfo.available === 0 ? 'error' : staffCapacityInfo.isLow ? 'warning' : 'success'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                    {staffCapacityInfo.available === 0
                      ? `This staff member is fully booked at this time (${staffCapacityInfo.max} concurrent bookings)`
                      : staffCapacityInfo.isLow
                      ? `Limited availability - ${staffCapacityInfo.available} concurrent booking slot(s) remaining`
                      : `${staffCapacityInfo.available} concurrent booking slot(s) available`}
                  </Typography>
                </Box>
              )}

              {/* Capacity Warning for Dynamic Staff */}
              {capacityWarning && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: theme => (theme.palette.mode === 'dark' ? 'error.dark' : 'error.light'),
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    border: theme => `1px solid ${theme.palette.error.main}`
                  }}
                >
                  <i className="ri-alert-line" />
                  <Typography variant="body2" color="error.dark">
                    {capacityWarning}
                  </Typography>
                </Box>
              )}

              {/* Staff Selection Options */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-user-settings-line" />
                <Typography variant="body2">
                  Staff Member chosen manually
                </Typography>
              </Box>

              {/* Requested by Client */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Checkbox
                  checked={requestedByClient}
                  onChange={(e) => setRequestedByClient(e.target.checked)}
                  icon={<i className="ri-heart-line" style={{ fontSize: '1.5rem' }} />}
                  checkedIcon={<i className="ri-heart-fill" style={{ fontSize: '1.5rem', color: '#f44336' }} />}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2">
                    Requested by client
                  </Typography>
                  <IconButton size="small">
                    <i className="ri-question-line" />
                  </IconButton>
                </Box>
              </Box>

              {/* Add Another Service */}
              <Button
                variant="text"
                startIcon={<i className="ri-add-line" />}
                sx={{ justifyContent: 'flex-start', textTransform: 'none', color: 'text.secondary' }}
              >
                ADD ANOTHER SERVICE
              </Button>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Client Information */}
              <TextField
                fullWidth
                label="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter client name"
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="client@example.com"
              />
              <TextField
                fullWidth
                label="Phone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />

              {/* Notes */}
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the appointment..."
              />
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          {/* Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Total
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                ${servicePrice.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                To be paid
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                ${servicePrice.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              onClick={handleClose}
              sx={{ textTransform: 'none' }}
            >
              Discard
            </Button>
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSave}
              color="primary"
              sx={{ textTransform: 'none' }}
            >
              Save
            </Button>
          </Box>

          {/* Validation Error */}
          {validationError && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: theme => (theme.palette.mode === 'dark' ? 'error.dark' : 'error.light'),
                borderRadius: 1,
                border: theme => `1px solid ${theme.palette.error.main}`
              }}
            >
              <Typography variant="body2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-error-warning-line" />
                {validationError}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Client Picker Dialog */}
      <ClientPickerDialog
        open={isClientPickerOpen}
        onClose={() => setIsClientPickerOpen(false)}
        onSelect={handleClientSelect}
        selectedClientId={selectedClient?.id}
      />
    </Drawer>
  )
}
