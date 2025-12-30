'use client'

import { Drawer, Box, Typography, IconButton, Divider, Button, Chip } from '@mui/material'
import { useCalendarStore } from './state'
import type { CalendarEvent, AppointmentStatus, PaymentStatus, PaymentMethod } from './types'

interface EventPopoverProps {
  anchorEl: HTMLElement | null
  event: CalendarEvent | null
  onClose: () => void
  onEdit?: (event: CalendarEvent) => void
}

export default function EventPopover({ anchorEl, event, onClose, onEdit }: EventPopoverProps) {
  const updateEvent = useCalendarStore(state => state.updateEvent)
  const toggleStarred = useCalendarStore(state => state.toggleStarred)
  const deleteEvent = useCalendarStore(state => state.deleteEvent)

  if (!event || !event.extendedProps) return null

  const { extendedProps } = event

  // Handle toggle starred
  const handleToggleStarred = () => {
    toggleStarred(event.id)
  }

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      deleteEvent(event.id)
      onClose()
    }
  }

  // Handle payment status toggle
  const handleTogglePayment = () => {
    const newPaymentStatus: PaymentStatus = extendedProps.paymentStatus === 'paid' ? 'unpaid' : 'paid'
    const updatedEvent: CalendarEvent = {
      ...event,
      extendedProps: {
        ...extendedProps,
        paymentStatus: newPaymentStatus
      }
    }
    updateEvent(updatedEvent)
  }

  // Handle status change
  const handleStatusChange = (newStatus: AppointmentStatus) => {
    const updatedEvent: CalendarEvent = {
      ...event,
      extendedProps: {
        ...extendedProps,
        status: newStatus
      }
    }
    updateEvent(updatedEvent)
    onClose()
  }

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, 'primary' | 'warning' | 'success' | 'error' | 'default'> = {
      confirmed: 'primary',
      pending: 'warning',
      attended: 'success',
      cancelled: 'error',
      need_confirm: 'warning',
      no_show: 'error'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels: Record<AppointmentStatus, string> = {
      confirmed: 'Confirmed',
      pending: 'Pending',
      attended: 'Attended',
      cancelled: 'Cancelled',
      need_confirm: 'Need Confirm',
      no_show: 'No Show'
    }
    return labels[status] || status
  }

  const getPaymentStatusLabel = (status: PaymentStatus) => {
    const labels: Record<PaymentStatus, string> = {
      paid: 'Paid',
      unpaid: 'Unpaid',
      need_confirm: 'Payment Pending'
    }
    return labels[status] || status
  }

  const getPaymentMethodLabel = (method?: PaymentMethod) => {
    if (!method) return null
    const labels: Record<PaymentMethod, string> = {
      bank_transfer: 'Bank Transfer',
      cash_on_arrival: 'Cash on Arrival',
      card_on_arrival: 'Card on Arrival',
      online_payment: 'Online Payment',
      instapay: 'Instapay'
    }
    return labels[method] || method
  }

  return (
    <Drawer
      open={Boolean(anchorEl || event)}
      onClose={onClose}
      anchor='right'
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box className='p-4 flex items-center justify-between border-b'>
          <Typography variant='h6' className='font-semibold'>
            Appointment Details
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>

        {/* Content */}
        <Box className='flex-1 overflow-auto p-6'>
          <div className='flex items-start justify-between mb-4'>
            <Box sx={{ flex: 1 }}>
              <Typography variant='h5' className='font-semibold'>
                {extendedProps.serviceName}
              </Typography>
              {extendedProps.bookingReference && (
                <Typography variant='caption' color='text.secondary'>
                  Ref: {extendedProps.bookingReference}
                </Typography>
              )}
            </Box>
            <IconButton size='medium' onClick={handleToggleStarred}>
              <i className={`${extendedProps.starred ? 'ri-star-fill' : 'ri-star-line'} text-2xl text-warning`} />
            </IconButton>
          </div>

          {/* Status and Payment */}
          <div className='flex flex-wrap items-center gap-2 mb-6'>
            <Chip
              label={getStatusLabel(extendedProps.status)}
              color={getStatusColor(extendedProps.status) as any}
              size='medium'
            />
            <Chip
              label={getPaymentStatusLabel(extendedProps.paymentStatus)}
              color={extendedProps.paymentStatus === 'paid' ? 'success' : extendedProps.paymentStatus === 'need_confirm' ? 'warning' : 'default'}
              size='medium'
              variant='outlined'
            />
            {extendedProps.starred && (
              <Chip
                icon={<i className='ri-star-fill' style={{ fontSize: 14 }} />}
                label='Starred'
                size='small'
                color='warning'
                variant='outlined'
              />
            )}
          </div>

          {/* Booking & Payment Reference */}
          {(extendedProps.bookingReference || extendedProps.paymentReference) && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              {extendedProps.bookingReference && (
                <div className='flex items-center gap-2 mb-1'>
                  <Typography variant='caption' color='text.secondary'>Booking Ref:</Typography>
                  <Typography variant='body2' fontWeight={600}>{extendedProps.bookingReference}</Typography>
                </div>
              )}
              {extendedProps.paymentReference && (
                <div className='flex items-center gap-2'>
                  <Typography variant='caption' color='text.secondary'>Payment Ref:</Typography>
                  <Typography variant='body2' fontWeight={600}>{extendedProps.paymentReference}</Typography>
                </div>
              )}
            </Box>
          )}

          {/* Date and Time */}
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <i className='ri-calendar-line text-xl' />
              <Typography variant='body1'>{formatDate(event.start)}</Typography>
            </div>
            <div className='flex items-center gap-3'>
              <i className='ri-time-line text-xl' />
              <Typography variant='body1'>
                {formatTime(event.start)} - {formatTime(event.end)}
              </Typography>
            </div>
            <div className='flex items-center gap-3'>
              <i className='ri-user-line text-xl' />
              <Box>
                <Typography variant='body1' fontWeight={600}>
                  {extendedProps.customerName}
                </Typography>
                {extendedProps.customerEmail && (
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                    {extendedProps.customerEmail}
                  </Typography>
                )}
                {extendedProps.customerPhone && (
                  <Typography variant='caption' color='text.secondary' sx={{ display: 'block' }}>
                    {extendedProps.customerPhone}
                  </Typography>
                )}
              </Box>
            </div>
            <div className='flex items-center gap-3'>
              <i className='ri-team-line text-xl' />
              <Box>
                <Typography variant='body1'>{extendedProps.staffName}</Typography>
                {extendedProps.roomName && (
                  <Typography variant='caption' color='text.secondary'>
                    Room: {extendedProps.roomName}
                  </Typography>
                )}
              </Box>
            </div>
            <div className='flex items-center gap-3'>
              <i className='ri-money-dollar-circle-line text-xl' />
              <Box>
                <Typography variant='body1'>${extendedProps.price}</Typography>
                {getPaymentMethodLabel(extendedProps.paymentMethod) && (
                  <Typography variant='caption' color='text.secondary'>
                    {getPaymentMethodLabel(extendedProps.paymentMethod)}
                  </Typography>
                )}
              </Box>
            </div>

            {/* Booked By Indicator */}
            <div className='flex items-center gap-3'>
              <i className='ri-bookmark-line text-xl' />
              <Box>
                <Typography variant='body1'>
                  {extendedProps.bookedBy === 'business' ? 'Added In-House' : 'Booked by Client'}
                </Typography>
                {extendedProps.selectionMethod === 'by_client' && (
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                  >
                    <i
                      className='ri-heart-fill'
                      style={{ fontSize: '0.75rem', color: 'var(--mui-palette-customColors-coral)' }}
                    />
                    Staff requested by client
                  </Typography>
                )}
                {extendedProps.selectionMethod === 'automatically' && (
                  <Typography variant='caption' color='text.secondary'>
                    Staff assigned automatically
                  </Typography>
                )}
              </Box>
            </div>

            {/* Business Notes */}
            {extendedProps.notes && (
              <div className='flex items-start gap-3'>
                <i className='ri-file-text-line text-xl mt-0.5' />
                <Box>
                  <Typography variant='caption' color='text.secondary'>Business Notes</Typography>
                  <Typography variant='body2'>{extendedProps.notes}</Typography>
                </Box>
              </div>
            )}

            {/* Client Notes */}
            {extendedProps.clientNotes && (
              <div className='flex items-start gap-3'>
                <i className='ri-chat-3-line text-xl mt-0.5' />
                <Box>
                  <Typography variant='caption' color='text.secondary'>Client Notes</Typography>
                  <Typography variant='body2'>{extendedProps.clientNotes}</Typography>
                </Box>
              </div>
            )}
          </div>
        </Box>

        <Divider />

        {/* Actions */}
        <Box className='p-4 space-y-2 border-t'>
          <Button
            fullWidth
            variant='contained'
            size='large'
            startIcon={<i className='ri-edit-line' />}
            onClick={() => {
              onEdit?.(event)
              onClose()
            }}
          >
            Edit Appointment
          </Button>
          <Button
            fullWidth
            variant='outlined'
            size='large'
            startIcon={<i className={`ri-${extendedProps.paymentStatus === 'paid' ? 'close' : 'check'}-line`} />}
            onClick={handleTogglePayment}
          >
            Mark as {extendedProps.paymentStatus === 'paid' ? 'Unpaid' : 'Paid'}
          </Button>
          <Button
            fullWidth
            variant='outlined'
            size='large'
            color='error'
            startIcon={<i className='ri-delete-bin-line' />}
            onClick={handleDelete}
          >
            Delete Appointment
          </Button>

          {/* Change Status Menu */}
          {extendedProps.status !== 'attended' && extendedProps.status !== 'cancelled' && (
            <>
              <Divider className='my-3' />
              <Typography variant='subtitle2' className='text-textSecondary block mb-2'>
                Change Status
              </Typography>
              <Box className='space-y-1'>
                {['confirmed', 'need_confirm', 'pending', 'attended', 'no_show', 'cancelled'].map(status => (
                  <Button
                    key={status}
                    fullWidth
                    variant='outlined'
                    onClick={() => handleStatusChange(status as AppointmentStatus)}
                    disabled={status === extendedProps.status}
                  >
                    {getStatusLabel(status as AppointmentStatus)}
                  </Button>
                ))}
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}
