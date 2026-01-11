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
import type { CalendarEvent, AppointmentStatus, PaymentStatus, PaymentMethod } from './types'
import { mockStaff, mockRooms } from '@/bookly/data/mock-data'
import { useMediaQuery, useTheme } from '@mui/material'
import { buildEventColors, isBookingInPast, getRecommendedStatusFromPayment } from './utils'
import { TimeSelectField } from '@/bookly/features/staff-management/time-select-field'

// Payment method labels
const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  bank_transfer: 'Bank Transfer',
  cash_on_arrival: 'Cash on Arrival',
  card_on_arrival: 'Card on Arrival',
  online_payment: 'Online Payment',
  instapay: 'Instapay'
}

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
      attended: 'Attended',
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

    // Auto-update booking status based on payment (unless already attended/no-show/cancelled)
    let newStatus = status
    const isPast = isBookingInPast(event.end)
    if (!isPast && !['attended', 'no_show', 'cancelled'].includes(status)) {
      newStatus = getRecommendedStatusFromPayment(newPaymentStatus, extendedProps.paymentMethod)
      setStatus(newStatus)
    }

    const updatedEvent: CalendarEvent = {
      ...event,
      extendedProps: {
        ...extendedProps,
        paymentStatus: newPaymentStatus,
        status: newStatus
      }
    }
    updateEvent(updatedEvent)
  }

  // Check if booking is in the past (for showing attended/no-show options)
  const isPastBooking = event ? isBookingInPast(event.end) : false

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
          {isPastBooking && (
            <>
              <Typography variant='caption' sx={{ px: 2, py: 0.5, color: 'text.secondary', display: 'block' }}>
                Past Booking Status
              </Typography>
              <MuiMenuItem onClick={() => handleStatusChange('attended')} sx={{ bgcolor: status === 'attended' ? 'action.selected' : undefined }}>
                <i className='ri-check-double-line' style={{ marginRight: 8, color: 'green' }} />
                Attended
              </MuiMenuItem>
              <MuiMenuItem onClick={() => handleStatusChange('no_show')} sx={{ bgcolor: status === 'no_show' ? 'action.selected' : undefined }}>
                <i className='ri-user-unfollow-line' style={{ marginRight: 8, color: 'red' }} />
                No Show
              </MuiMenuItem>
              <Divider sx={{ my: 1 }} />
              <Typography variant='caption' sx={{ px: 2, py: 0.5, color: 'text.secondary', display: 'block' }}>
                Other Status
              </Typography>
            </>
          )}
          {(['confirmed', 'pending', 'need_confirm', 'cancelled'] as AppointmentStatus[]).map(s => (
            <MuiMenuItem key={s} onClick={() => handleStatusChange(s)} sx={{ bgcolor: status === s ? 'action.selected' : undefined }}>
              {getStatusLabel(s)}
            </MuiMenuItem>
          ))}
          {!isPastBooking && (
            <>
              <Divider sx={{ my: 1 }} />
              {(['attended', 'no_show'] as AppointmentStatus[]).map(s => (
                <MuiMenuItem key={s} onClick={() => handleStatusChange(s)} sx={{ bgcolor: status === s ? 'action.selected' : undefined }}>
                  {getStatusLabel(s)}
                </MuiMenuItem>
              ))}
            </>
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
                  <TimeSelectField label='Start' value={startTime} onChange={setStartTime} size='small' fullWidth />
                  <TimeSelectField label='End' value={endTime} onChange={setEndTime} size='small' fullWidth />
                </Box>
              ) : (
                <Typography variant='body2' color='text.secondary'>
                  {formatTimeRange(event.start, event.end)}
                  {!canEditTime && <Chip label='Time locked to slot' size='small' sx={{ ml: 1, height: 20 }} />}
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Customer & Staff - Compact Layout */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {/* Customer */}
              <Box sx={{ flex: 1, minWidth: 180 }}>
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
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                      {customerName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant='body2' fontWeight={500}>
                        {customerName}
                      </Typography>
                      {(extendedProps.customerEmail || extendedProps.customerPhone) && (
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', lineHeight: 1.2 }}>
                          {extendedProps.customerPhone && <span><i className='ri-phone-line' style={{ fontSize: '0.65rem', marginRight: 2 }} />{extendedProps.customerPhone}</span>}
                          {extendedProps.customerEmail && extendedProps.customerPhone && ' • '}
                          {extendedProps.customerEmail && <span>{extendedProps.customerEmail}</span>}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Staff */}
              <Box sx={{ flex: 1, minWidth: 180 }}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  STAFF
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
                    <Avatar src={staff?.photo} sx={{ width: 28, height: 28, fontSize: '0.8rem' }}>
                      {staffName.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant='body2' fontWeight={500}>
                      {staffName}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Divider />

            {/* Price & Party Size Row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              {/* Price */}
              <Box sx={{ flex: 1 }}>
                <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                  PRICE
                </Typography>
                <Typography variant='body1' fontWeight={600} color='primary.main'>
                  ${extendedProps.price}
                </Typography>
              </Box>

              {/* Party Size for Static Mode */}
              {isStaticSlotBooking && (
                <Box sx={{ flex: 1 }}>
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
              )}

              {/* Room for Static Mode - in main tab */}
              {room && !isStaticSlotBooking && (
                <Box sx={{ flex: 1 }}>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                    ROOM
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <i className='ri-home-4-line' style={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                    <Typography variant='body2' fontWeight={500}>{room.name}</Typography>
                  </Box>
                </Box>
              )}
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

            {/* References */}
            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, p: 1.5 }}>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 1 }}>
                REFERENCES
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant='caption' color='text.secondary'>Booking Ref:</Typography>
                  <Typography variant='body2' fontFamily='monospace' fontWeight={600}>
                    {extendedProps.bookingReference || extendedProps.bookingId}
                  </Typography>
                </Box>
                {extendedProps.paymentReference && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='caption' color='text.secondary'>Payment Ref:</Typography>
                    <Typography variant='body2' fontFamily='monospace' fontWeight={600}>
                      {extendedProps.paymentReference}
                    </Typography>
                  </Box>
                )}
                {extendedProps.paymentMethod && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant='caption' color='text.secondary'>Payment Method:</Typography>
                    <Chip
                      label={PAYMENT_METHOD_LABELS[extendedProps.paymentMethod as PaymentMethod] || extendedProps.paymentMethod}
                      size='small'
                      sx={{ height: 22, fontSize: '0.7rem' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>

            <Divider />

            {/* Room Info for Static */}
            {room && (
              <>
                <Box>
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                    ROOM
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-home-4-line' style={{ color: theme.palette.text.secondary }} />
                    <Typography variant='body1' fontWeight={500}>
                      {room.name}
                    </Typography>
                    {(room as any).capacity && (
                      <Chip label={`Capacity: ${(room as any).capacity}`} size='small' sx={{ height: 20, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                </Box>
                <Divider />
              </>
            )}

            {/* Booked By */}
            <Box>
              <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mb: 0.5 }}>
                BOOKED BY
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className={extendedProps.bookedBy === 'client' ? 'ri-user-line' : 'ri-store-line'} />
                <Typography variant='body2'>
                  {extendedProps.bookedBy === 'client' ? 'Client (Online)' : 'Business (In-House)'}
                </Typography>
                {requestedByClient && (
                  <Chip
                    icon={<i className='ri-heart-fill' style={{ fontSize: '0.7rem', color: 'var(--mui-palette-customColors-coral)' }} />}
                    label='Staff Requested'
                    size='small'
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Quick Actions for Past Bookings */}
      {isPastBooking && !isEditing && !['attended', 'no_show', 'cancelled'].includes(status) && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'warning.lighter',
            borderTop: 1,
            borderColor: 'warning.main',
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Typography variant='caption' color='warning.dark' fontWeight={600}>
            <i className='ri-time-line' style={{ marginRight: 4 }} />
            This booking is in the past. Did the customer show up?
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='contained'
              color='success'
              size='small'
              fullWidth
              startIcon={<i className='ri-check-double-line' />}
              onClick={() => handleStatusChange('attended')}
            >
              Attended
            </Button>
            <Button
              variant='outlined'
              color='error'
              size='small'
              fullWidth
              startIcon={<i className='ri-user-unfollow-line' />}
              onClick={() => handleStatusChange('no_show')}
            >
              No Show
            </Button>
          </Box>
        </Box>
      )}

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
