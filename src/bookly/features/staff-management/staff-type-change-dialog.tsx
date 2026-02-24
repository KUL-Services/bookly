'use client'

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
  Stack,
  Divider
} from '@mui/material'

import type { StaffType } from '@/bookly/data/types'

interface StaffTypeChangeDialogProps {
  open: boolean
  onClose: () => void
  staffId: string
  staffName: string
  currentType: StaffType | string
  targetType: StaffType | string
  onConfirm: () => void
  isChanging: boolean
}

export function StaffTypeChangeDialog({
  open,
  onClose,
  staffName,
  currentType,
  targetType,
  onConfirm,
  isChanging
}: StaffTypeChangeDialogProps) {
  const handleConfirm = () => {
    onConfirm()
  }

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
        <Stack spacing={3}>
          {/* Staff Info */}
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Resource Name
            </Typography>
            <Typography variant='h6'>{staffName}</Typography>
          </Box>

          <Divider />

          {/* Type Change */}
          <Box>
            <Typography variant='body2' color='text.secondary' gutterBottom>
              Schedule Type Transition
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Current type */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <i
                  className={
                    currentType === 'static' || currentType === 'STATIC' ? 'ri-calendar-schedule-line' : 'ri-time-line'
                  }
                  style={{ fontSize: '1rem', color: 'var(--mui-palette-text-secondary)' }}
                />
                <Typography variant='body2' fontWeight={500} color='text.secondary'>
                  {currentType === 'static' || currentType === 'STATIC' ? 'Fixed' : 'Flex'}
                </Typography>
              </Box>

              {/* Arrow */}
              <i
                className='ri-arrow-right-line'
                style={{ fontSize: '1.25rem', color: 'var(--mui-palette-primary-main)' }}
              />

              {/* Target type */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <i
                  className={
                    targetType === 'static' || targetType === 'STATIC' ? 'ri-calendar-schedule-line' : 'ri-time-line'
                  }
                  style={{ fontSize: '1rem', color: 'var(--mui-palette-primary-main)' }}
                />
                <Typography variant='body2' fontWeight={600} color='primary'>
                  {targetType === 'static' || targetType === 'STATIC' ? 'Fixed' : 'Flex'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider />

          <Alert severity='warning'>
            <AlertTitle>Pending Transition Trigger</AlertTitle>
            <Typography variant='body2' gutterBottom>
              Changing the Booking Mode while existing bookings are scheduled can cause overlapping data.
            </Typography>
            <Typography variant='body2'>
              The system will queue this transition by putting the resource into a <strong>Pending State</strong>. The
              exact effective date is automatically determined by the backend to take place exactly after the latest
              booked appointment finishes.
            </Typography>
          </Alert>

          <Alert severity='info' icon={<i className='ri-information-line' />}>
            <AlertTitle>What to expect</AlertTitle>
            <Typography variant='body2' component='div'>
              <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                <li>
                  A yellow warning flag will appear next to this staff member indicating the transition is queued.
                </li>
                <li>You can cancel the transition at any time before it takes effect from the Staff Details editor.</li>
              </ul>
            </Typography>
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
