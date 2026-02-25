'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Stack
} from '@mui/material'
import { format } from 'date-fns'

import type { StaffType } from '@/bookly/data/types'
import { StaffService } from '@/lib/api/services/staff.service'
import { AssetsService } from '@/lib/api/services/assets.service'

interface StaffTypeChangeDialogProps {
  open: boolean
  onClose: () => void
  staffId: string
  staffName: string
  currentType: StaffType | string
  targetType: StaffType | string
  onConfirm: () => void
  isChanging: boolean
  resourceType?: 'staff' | 'asset'
}

export function StaffTypeChangeDialog({
  open,
  onClose,
  staffId,
  staffName,
  currentType,
  targetType,
  onConfirm,
  isChanging,
  resourceType = 'staff'
}: StaffTypeChangeDialogProps) {
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [effectiveDatePreview, setEffectiveDatePreview] = useState<Date | null>(null)
  const [latestBookingEndPreview, setLatestBookingEndPreview] = useState<Date | null>(null)
  const [canApplyImmediately, setCanApplyImmediately] = useState<boolean | null>(null)

  const handleConfirm = () => {
    onConfirm()
  }
  const isCurrentFixed = currentType === 'static' || currentType === 'STATIC'
  const isTargetFixed = targetType === 'static' || targetType === 'STATIC'
  const currentLabel = isCurrentFixed ? 'Fixed' : 'Flex'
  const targetLabel = isTargetFixed ? 'Fixed' : 'Flex'
  const currentIcon = isCurrentFixed ? 'ri-calendar-schedule-line' : 'ri-time-line'
  const targetIcon = isTargetFixed ? 'ri-calendar-schedule-line' : 'ri-time-line'
  const isFlexToFixed = !isCurrentFixed && isTargetFixed

  useEffect(() => {
    const parseDate = (value: unknown): Date | null => {
      if (!value || typeof value !== 'string') return null
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? null : date
    }

    const resolveStatus = async () => {
      if (!open || !staffId) return
      setStatusLoading(true)
      setStatusError(null)
      setEffectiveDatePreview(null)
      setLatestBookingEndPreview(null)
      setCanApplyImmediately(null)

      try {
        const result =
          resourceType === 'asset'
            ? await AssetsService.getBookingModeStatus(staffId)
            : await StaffService.getBookingModeStatus(staffId)

        const payload: any = result.data || {}
        const status: any = payload?.data ?? payload

        const effectiveDate =
          parseDate(status?.effectiveDate) ||
          parseDate(status?.estimatedEffectiveDate) ||
          parseDate(status?.bookingModeEffectiveDate)
        const latestBookingEnd =
          parseDate(status?.latestExistingBookingEnd) ||
          parseDate(status?.lastExistingBookingEnd) ||
          parseDate(status?.latestBookingEnd)

        const immediate = status?.canApplyImmediately === true || status?.hasFutureBookings === false

        setEffectiveDatePreview(effectiveDate)
        setLatestBookingEndPreview(latestBookingEnd)
        setCanApplyImmediately(immediate)
      } catch (error: any) {
        setStatusError(error?.message || 'Unable to preview effective time')
      } finally {
        setStatusLoading(false)
      }
    }

    resolveStatus()
  }, [open, staffId, resourceType])

  const effectiveTimeText = useMemo(() => {
    if (statusLoading) return 'Checking schedule...'
    if (canApplyImmediately === true) return 'Applies immediately'
    if (effectiveDatePreview) return format(effectiveDatePreview, "EEE, MMM d, yyyy 'at' h:mm a")
    if (statusError) return 'Will be determined by backend when you confirm'
    return 'Will be determined by backend when you confirm'
  }, [statusLoading, canApplyImmediately, effectiveDatePreview, statusError])

  const latestBookingEndText = useMemo(() => {
    if (!latestBookingEndPreview) return null
    return format(latestBookingEndPreview, "EEE, MMM d, yyyy 'at' h:mm a")
  }, [latestBookingEndPreview])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className='ri-alert-line' style={{ color: 'var(--mui-palette-warning-main)', fontSize: '1.5rem' }} />
          <Typography variant='h6' component='div'>
            Change Booking Mode
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5}>
          {/* Staff Info */}
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Resource Name
            </Typography>
            <Typography variant='h6'>{staffName}</Typography>
          </Box>

          {/* Transition */}
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Booking Mode Transition
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.75,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75
                }}
              >
                <i
                  className={currentIcon}
                  style={{ fontSize: '1rem', color: 'var(--mui-palette-text-secondary)' }}
                />
                <Typography variant='body2' fontWeight={500} color='text.secondary'>
                  {currentLabel}
                </Typography>
              </Box>

              <i
                className='ri-arrow-right-line'
                style={{ fontSize: '1.25rem', color: 'var(--mui-palette-primary-main)' }}
              />

              <Box
                sx={{
                  px: 1.25,
                  py: 0.75,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1.5,
                  bgcolor: 'rgba(10, 44, 36, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75
                }}
              >
                <i
                  className={targetIcon}
                  style={{ fontSize: '1rem', color: 'var(--mui-palette-primary-main)' }}
                />
                <Typography variant='body2' fontWeight={600} color='primary'>
                  {targetLabel}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Mode meanings */}
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Mode Meaning
            </Typography>
            <Stack spacing={1}>
              <Box
                sx={{
                  p: 1.25,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  bgcolor: 'action.hover'
                }}
              >
                <Typography variant='body2' fontWeight={600}>
                  <i className='ri-calendar-schedule-line' style={{ marginInlineEnd: 6 }} />
                  Fixed
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Scheduled sessions with set start/end times and defined capacity.
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 1.25,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  bgcolor: 'action.hover'
                }}
              >
                <Typography variant='body2' fontWeight={600}>
                  <i className='ri-time-line' style={{ marginInlineEnd: 6 }} />
                  Flex
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Individual appointments across working hours using service duration and intervals.
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Alert severity='warning' icon={<i className='ri-alert-line' />}>
            <Typography variant='body2' sx={{ mb: 0.5 }}>
              What happens next:
            </Typography>
            <Box component='ul' sx={{ m: 0, pl: 2 }}>
              <li>
                <Typography variant='caption' color='text.secondary'>
                  The change request is queued immediately.
                </Typography>
              </li>
              <li>
                <Typography variant='caption' color='text.secondary'>
                  {canApplyImmediately ? `Applies immediately after confirmation.` : `Expected effective: ${effectiveTimeText}`}
                </Typography>
              </li>
              {latestBookingEndText && !canApplyImmediately && (
                <li>
                  <Typography variant='caption' color='text.secondary'>
                    Latest existing booking ends: {latestBookingEndText}
                  </Typography>
                </li>
              )}
              <li>
                <Typography variant='caption' color='text.secondary'>
                  Current mode stays active until the scheduled effective time.
                </Typography>
              </li>
            </Box>
          </Alert>

          <Alert severity='info' icon={<i className='ri-information-line' />}>
            <Typography variant='body2' sx={{ mb: 0.5 }}>
              Impact after switch:
            </Typography>
            <Box component='ul' sx={{ m: 0, pl: 2 }}>
              {isFlexToFixed ? (
                <>
                  <li>
                    <Typography variant='caption' color='text.secondary'>
                      You will manage availability as sessions with default capacity.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant='caption' color='text.secondary'>
                      Customers will book into fixed sessions, not free-form time slots.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant='caption' color='text.secondary'>
                      Existing upcoming bookings remain and are not deleted.
                    </Typography>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Typography variant='caption' color='text.secondary'>
                      Session-based capacity rules stop once the mode becomes Flex.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant='caption' color='text.secondary'>
                      Customers will see appointment slots based on working hours and service durations.
                    </Typography>
                  </li>
                  <li>
                    <Typography variant='caption' color='text.secondary'>
                      Existing upcoming bookings remain and are not deleted.
                    </Typography>
                  </li>
                </>
              )}
            </Box>
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant='outlined' disabled={isChanging}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant='contained' color='warning' disabled={isChanging}>
          {isChanging ? 'Scheduling...' : 'Confirm Transition'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
