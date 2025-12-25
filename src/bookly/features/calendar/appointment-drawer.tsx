'use client'

import { useState, useEffect } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Avatar,
  Divider,
  Chip,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem as MuiMenuItem,
  Alert
} from '@mui/material'
import { useCalendarStore } from './state'
import type { CalendarEvent, AppointmentStatus, PaymentStatus } from './types'
import { mockStaff, mockRooms } from '@/bookly/data/mock-data'
import { useMediaQuery, useTheme } from '@mui/material'
import { buildEventColors } from './utils'

export default function AppointmentDrawer() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  // Zustand store
  const isOpen = useCalendarStore(state => state.isAppointmentDrawerOpen)
  const event = useCalendarStore(state => state.selectedEvent)
  const updateEvent = useCalendarStore(state => state.updateEvent)
  const deleteEvent = useCalendarStore(state => state.deleteEvent)
  const toggleStarred = useCalendarStore(state => state.toggleStarred)
  const closeAppointmentDrawer = useCalendarStore(state => state.closeAppointmentDrawer)
  const schedulingMode = useCalendarStore(state => state.schedulingMode)
  const colorScheme = useCalendarStore(state => state.colorScheme)
  const isSlotAvailable = useCalendarStore(state => state.isSlotAvailable)
  const staticSlots = useCalendarStore(state => state.staticSlots)
  const lastActionError = useCalendarStore(state => state.lastActionError)
  const clearError = useCalendarStore(state => state.clearError)

  // UI state
  const [activeTab, setActiveTab] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null)

  // Form state
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [staffId, setStaffId] = useState('')
  const [staffName, setStaffName] = useState('')
  const [status, setStatus] = useState<AppointmentStatus>('confirmed')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes] = useState('')
  const [requestedByClient, setRequestedByClient] = useState(false)
  const [starred, setStarred] = useState(false)
  const [partySize, setPartySize] = useState(1)

  // Update local state when event changes
  useEffect(() => {
    if (event && event.extendedProps) {
      const start = new Date(event.start)
      const end = new Date(event.end)

      setStartTime(start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setEndTime(end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
      setStaffId(event.extendedProps.staffId)
      setStaffName(event.extendedProps.staffName)
      setStatus(event.extendedProps.status)
      setPaymentStatus(event.extendedProps.paymentStatus)
      setCustomerName(event.extendedProps.customerName || '')
      setNotes(event.extendedProps.notes || '')
      setRequestedByClient(event.extendedProps.selectionMethod === 'by_client')
      setStarred(event.extendedProps.starred || false)
      setPartySize(event.extendedProps.partySize || 1)
      setIsEditing(false)
      setActiveTab(0)
    }
  }, [event, isOpen])

  // Clear error when drawer closes
  useEffect(() => {
    if (!isOpen) {
      clearError()
    }
  }, [isOpen, clearError])

  if (!event || !event.extendedProps) return null

  const { extendedProps } = event

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTimeRange = (start: Date, end: Date) => {
    const startStr = new Date(start).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    const endStr = new Date(end).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    return `${startStr} - ${endStr}`
  }

  const getStatusLabel = (status: AppointmentStatus): string => {
    const labels: Record<AppointmentStatus, string> = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      completed: 'Completed',
      cancelled: 'Cancelled',
      need_confirm: 'Need Confirmation',
      no_show: 'No Show'
    }
    return labels[status]
  }

  const getStatusColor = (status: AppointmentStatus) => {
    const colors = buildEventColors(colorScheme, status)
    return colors
  }

  const handleSave = () => {
    if (!event) return

    // Parse times
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const newStart = new Date(event.start)
    newStart.setHours(startHour, startMin, 0, 0)

    const newEnd = new Date(event.end)
    newEnd.setHours(endHour, endMin, 0, 0)

    const updatedEvent: CalendarEvent = {
      ...event,
      start: newStart,
      end: newEnd,
      extendedProps: {
        ...extendedProps,
        staffId,
        staffName,
        status,
        paymentStatus,
        customerName,
        notes,
        selectionMethod: requestedByClient ? 'by_client' : 'automatically',
        starred,
        partySize: schedulingMode === 'static' && extendedProps.slotId ? partySize : 1
      }
    }

    updateEvent(updatedEvent)

    // Check if update was successful (no error)
    setTimeout(() => {
      if (!useCalendarStore.getState().lastActionError) {
        setIsEditing(false)
      }
    }, 100)
  }

  const handleDelete = () => {
    if (event && confirm('Are you sure you want to delete this appointment?')) {
      deleteEvent(event.id)
      closeAppointmentDrawer()
    }
  }

  const handleToggleStar = () => {
    if (event) {
      toggleStarred(event.id)
      setStarred(!starred)
    }
  }

  const handleTogglePayment = () => {
    if (!event) return
    const newPaymentStatus = paymentStatus === 'paid' ? 'unpaid' : 'paid'
    setPaymentStatus(newPaymentStatus)

    const updatedEvent: CalendarEvent = {
      ...event,
      extendedProps: {
        ...extendedProps,
        paymentStatus: newPaymentStatus
      }
    }
    updateEvent(updatedEvent)
  }

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    setStatus(newStatus)
    setStatusMenuAnchor(null)

    if (!event) return

    const updatedEvent: CalendarEvent = {
      ...event,
      extendedProps: {
        ...extendedProps,
        status: newStatus
      }
    }
    updateEvent(updatedEvent)
  }

  // Get capacity info for static mode
  const capacityInfo =
    schedulingMode === 'static' && extendedProps.slotId
      ? isSlotAvailable(extendedProps.slotId, new Date(event.start))
      : null

  const slot =
    schedulingMode === 'static' && extendedProps.slotId ? staticSlots.find(s => s.id === extendedProps.slotId) : null

  const room = extendedProps.roomId ? mockRooms.find(r => r.id === extendedProps.roomId) : null

  const staff = mockStaff.find(s => s.id === extendedProps.staffId)

  const isStaticSlotBooking = schedulingMode === 'static' && !!extendedProps.slotId
  const canEditTime = !isStaticSlotBooking

  const statusColors = getStatusColor(status)

  const drawer = (
    <Box sx={{ width: { xs: '100vw', sm: 480 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: statusColors.bg,
          color: statusColors.text
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={handleToggleStar}
              size='small'
              sx={{ color: starred ? 'var(--mui-palette-customColors-coral)' : 'currentColor' }}
            >
              <i className={starred ? 'ri-star-fill' : 'ri-star-line'} />
            </IconButton>
            <Typography variant='h6' fontWeight={600}>
              {extendedProps.serviceName || 'Appointment'}
            </Typography>
          </Box>
          <IconButton onClick={closeAppointmentDrawer} size='small' sx={{ color: 'currentColor' }}>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        {/* Status and Payment */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={getStatusLabel(status)}
            size='small'
            onClick={e => setStatusMenuAnchor(e.currentTarget)}
            onDelete={() => setStatusMenuAnchor(document.getElementById('status-chip-' + event.id) as HTMLElement)}
            deleteIcon={<i className='ri-arrow-down-s-line' style={{ fontSize: '1rem' }} />}
            id={'status-chip-' + event.id}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'currentColor',
              fontWeight: 600
            }}
          />
          <Chip
            label={paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            size='small'
            onClick={handleTogglePayment}
            icon={
              <i
                className={paymentStatus === 'paid' ? 'ri-check-line' : 'ri-close-line'}
                style={{ fontSize: '1rem' }}
              />
            }
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'currentColor',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          />
        </Box>

        {/* Status Menu */}
        <Menu anchorEl={statusMenuAnchor} open={Boolean(statusMenuAnchor)} onClose={() => setStatusMenuAnchor(null)}>
          {(['confirmed', 'pending', 'completed', 'cancelled', 'need_confirm', 'no_show'] as AppointmentStatus[]).map(
            s => (
              <MuiMenuItem key={s} onClick={() => handleStatusChange(s)}>
                {getStatusLabel(s)}
              </MuiMenuItem>
            )
          )}
        </Menu>
      </Box>

      {/* Error Alert */}
      {lastActionError && (
        <Alert severity='error' onClose={clearError} sx={{ m: 2, mb: 0 }}>
          {lastActionError}
        </Alert>
      )}

      {/* Static Slot Info */}
      {isStaticSlotBooking && slot && capacityInfo && (
        <Box sx={{ p: 2, bgcolor: 'info.lighter', borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='body2' fontWeight={600} color='info.dark'>
                <i className='ri-calendar-event-line' style={{ marginRight: 4 }} />
                Static Slot Booking
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {slot.startTime} - {slot.endTime}
                {room && ` • ${room.name}`}
              </Typography>
            </Box>
            <Chip
              label={`${capacityInfo.remainingCapacity}/${capacityInfo.total} spots`}
              size='small'
              color={capacityInfo.available ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        <Tab label='Appointment' />
        <Tab label='Notes & Info' />
      </Tabs>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {activeTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Date & Time */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                DATE & TIME
              </Typography>
              <Typography variant='body1' fontWeight={500}>
                {formatDate(event.start)}
              </Typography>
              {isEditing && canEditTime ? (
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    label='Start'
                    type='time'
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label='End'
                    type='time'
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    size='small'
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {formatTimeRange(event.start, event.end)}
                  {!canEditTime && <Chip label='Time locked to slot' size='small' sx={{ ml: 1, height: 20 }} />}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Customer */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                CUSTOMER
              </Typography>
              {isEditing ? (
                <TextField
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  size='small'
                  fullWidth
                  placeholder='Customer name'
                />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {customerName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant='body1' fontWeight={500}>
                    {customerName}
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider />

            {/* Staff */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                STAFF MEMBER
              </Typography>
              {isEditing ? (
                <TextField
                  select
                  value={staffId}
                  onChange={e => {
                    setStaffId(e.target.value)
                    const selectedStaff = mockStaff.find(s => s.id === e.target.value)
                    if (selectedStaff) setStaffName(selectedStaff.name)
                  }}
                  size='small'
                  fullWidth
                >
                  {mockStaff.map(s => (
                    <MuiMenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MuiMenuItem>
                  ))}
                </TextField>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={staff?.photo} sx={{ width: 32, height: 32 }}>
                    {staffName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant='body1' fontWeight={500}>
                    {staffName}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Party Size for Static Mode */}
            {isStaticSlotBooking && (
              <>
                <Divider />
                <Box>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                    PARTY SIZE
                  </Typography>
                  {isEditing ? (
                    <TextField
                      type='number'
                      value={partySize}
                      onChange={e => setPartySize(Math.max(1, parseInt(e.target.value) || 1))}
                      size='small'
                      fullWidth
                      inputProps={{ min: 1, max: capacityInfo?.total || 1 }}
                    />
                  ) : (
                    <Typography variant='body1' fontWeight={500}>
                      {partySize} {partySize === 1 ? 'person' : 'people'}
                    </Typography>
                  )}
                </Box>
              </>
            )}

            <Divider />

            {/* Price */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                PRICE
              </Typography>
              <Typography variant='h6' fontWeight={600} color='primary.main'>
                ${extendedProps.price}
              </Typography>
            </Box>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Notes */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                NOTES
              </Typography>
              {isEditing ? (
                <TextField
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  placeholder='Add notes...'
                />
              ) : (
                <Typography variant='body2' color={notes ? 'text.primary' : 'text.secondary'}>
                  {notes || 'No notes'}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Selection Method */}
            {isEditing && (
              <FormControlLabel
                control={
                  <Checkbox checked={requestedByClient} onChange={e => setRequestedByClient(e.target.checked)} />
                }
                label='Requested by client'
              />
            )}

            {/* Booking ID */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                BOOKING ID
              </Typography>
              <Typography variant='body2' fontFamily='monospace'>
                {extendedProps.bookingId}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 1,
          bgcolor: 'background.paper'
        }}
      >
        {isEditing ? (
          <>
            <Button variant='outlined' onClick={() => setIsEditing(false)} fullWidth>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleSave} fullWidth>
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button
              variant='outlined'
              color='error'
              onClick={handleDelete}
              startIcon={<i className='ri-delete-bin-line' />}
            >
              Delete
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button variant='contained' onClick={() => setIsEditing(true)} startIcon={<i className='ri-edit-line' />}>
              Edit
            </Button>
          </>
        )}
      </Box>
    </Box>
  )

  return (
    <Drawer
      anchor='right'
      open={isOpen}
      onClose={closeAppointmentDrawer}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 480 },
          maxWidth: '100%'
        }
      }}
    >
      {drawer}
    </Drawer>
  )
}
