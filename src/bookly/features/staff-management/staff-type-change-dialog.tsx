'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
  Chip,
  Stack,
  Divider
} from '@mui/material'
import { format } from 'date-fns'
import { mockBookings } from '@/bookly/data/mock-data'
import type { StaffType } from '@/bookly/data/types'

interface StaffTypeChangeDialogProps {
  open: boolean
  onClose: () => void
  staffId: string
  staffName: string
  currentType: StaffType
  targetType: StaffType
  onConfirm: (effectiveDate: Date) => void
}

export function StaffTypeChangeDialog({
  open,
  onClose,
  staffId,
  staffName,
  currentType,
  targetType,
  onConfirm
}: StaffTypeChangeDialogProps) {
  const [lastBookingDate, setLastBookingDate] = useState<Date | null>(null)
  const [isCalculating, setIsCalculating] = useState(true)
  const [bookingCount, setBookingCount] = useState(0)

  // Calculate last booking date when dialog opens
  useEffect(() => {
    if (!open) return

    setIsCalculating(true)

    // Find all bookings for this staff member
    const staffBookings = mockBookings.filter(booking => {
      // Match by staff name (in real app, would use staffId)
      return booking.staffMemberName === staffName && booking.status !== 'cancelled'
    })

    setBookingCount(staffBookings.length)

    if (staffBookings.length === 0) {
      setLastBookingDate(null)
      setIsCalculating(false)
      return
    }

    // Find the latest booking date
    const latestBooking = staffBookings.reduce((latest, current) => {
      const currentDate = new Date(current.date)
      const latestDate = new Date(latest.date)
      return currentDate > latestDate ? current : latest
    })

    const lastDate = new Date(latestBooking.date)
    // Add the service duration to get the actual end of the last booking
    const [hours, minutes] = latestBooking.time.split(':')
    lastDate.setHours(parseInt(hours), parseInt(minutes))
    // Assume average 60 min service if duration not specified
    lastDate.setHours(lastDate.getHours() + 1)

    setLastBookingDate(lastDate)
    setIsCalculating(false)
  }, [open, staffId, staffName])

  const handleConfirm = () => {
    // Effective date is the day after the last booking, or tomorrow if no bookings
    const effectiveDate = lastBookingDate ? new Date(lastBookingDate.getTime() + 24 * 60 * 60 * 1000) : new Date()

    // If no bookings, make it effective tomorrow
    if (!lastBookingDate) {
      effectiveDate.setDate(effectiveDate.getDate() + 1)
    }

    // Set to start of day
    effectiveDate.setHours(0, 0, 0, 0)

    onConfirm(effectiveDate)
    onClose()
  }

  const getEffectiveDate = (): Date => {
    if (!lastBookingDate) {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      return tomorrow
    }
    const effectiveDate = new Date(lastBookingDate.getTime() + 24 * 60 * 60 * 1000)
    effectiveDate.setHours(0, 0, 0, 0)
    return effectiveDate
  }

  const effectiveDate = getEffectiveDate()
  const daysDifference = Math.ceil((effectiveDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className='ri-alert-line' style={{ color: '#ff9800', fontSize: '1.5rem' }} />
          <Typography variant='h6' component='div'>
            Change Staff Type
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Staff Info */}
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Staff Member
            </Typography>
            <Typography variant='h6'>{staffName}</Typography>
          </Box>

          <Divider />

          {/* Type Change */}
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Type Change
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                label={currentType === 'dynamic' ? 'Dynamic' : 'Static'}
                color='default'
                icon={
                  <i
                    className={currentType === 'dynamic' ? 'ri-user-line' : 'ri-group-line'}
                    style={{ fontSize: '1rem' }}
                  />
                }
              />
              <i className='ri-arrow-right-line' style={{ color: 'text.secondary' }} />
              <Chip
                label={targetType === 'dynamic' ? 'Dynamic' : 'Static'}
                color='primary'
                icon={
                  <i
                    className={targetType === 'dynamic' ? 'ri-user-line' : 'ri-group-line'}
                    style={{ fontSize: '1rem' }}
                  />
                }
              />
            </Box>
          </Box>

          <Divider />

          {/* Loading State */}
          {isCalculating ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant='body2' color='text.secondary'>
                Analyzing existing bookings...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Booking Analysis */}
              <Alert severity={bookingCount > 0 ? 'warning' : 'info'}>
                <AlertTitle>Booking Analysis</AlertTitle>
                {bookingCount > 0 ? (
                  <>
                    <Typography variant='body2' gutterBottom>
                      <strong>{bookingCount}</strong> existing booking{bookingCount > 1 ? 's' : ''} found for this staff
                      member
                    </Typography>
                    <Typography variant='body2' gutterBottom>
                      Last booking ends on:{' '}
                      <strong>
                        {lastBookingDate ? format(lastBookingDate, 'EEE, MMM d, yyyy h:mm a') : 'Unknown'}
                      </strong>
                    </Typography>
                  </>
                ) : (
                  <Typography variant='body2'>No existing bookings found for this staff member</Typography>
                )}
              </Alert>

              {/* Effective Date */}
              <Alert severity='success'>
                <AlertTitle>Change Will Be Effective</AlertTitle>
                <Typography variant='body2' gutterBottom>
                  <strong>{format(effectiveDate, 'EEEE, MMMM d, yyyy')}</strong>
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {daysDifference === 0 && 'Effective today'}
                  {daysDifference === 1 && 'Effective tomorrow'}
                  {daysDifference > 1 && `Effective in ${daysDifference} days`}
                </Typography>
              </Alert>

              {/* Important Notes */}
              <Alert severity='info' icon={<i className='ri-information-line' />}>
                <AlertTitle>Important</AlertTitle>
                <Typography variant='body2' component='div'>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    <li>
                      All bookings before <strong>{format(effectiveDate, 'MMM d, yyyy')}</strong> will use the{' '}
                      <strong>{currentType}</strong> type
                    </li>
                    <li>
                      All bookings from <strong>{format(effectiveDate, 'MMM d, yyyy')}</strong> onward will use the{' '}
                      <strong>{targetType}</strong> type
                    </li>
                    {/* {targetType === 'static' && (
                      <li>You'll need to assign this staff member to rooms/time slots after the change</li>
                    )}
                    {targetType === 'dynamic' && <li>Room assignments will be removed after the change</li>} */}
                  </ul>
                </Typography>
              </Alert>
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant='contained' color='warning' disabled={isCalculating}>
          Confirm Type Change
        </Button>
      </DialogActions>
    </Dialog>
  )
}
