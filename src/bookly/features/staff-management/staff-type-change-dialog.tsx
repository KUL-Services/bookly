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
  Stack
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
  const isCurrentFixed = currentType === 'static' || currentType === 'STATIC'
  const isTargetFixed = targetType === 'static' || targetType === 'STATIC'
  const currentLabel = isCurrentFixed ? 'Fixed' : 'Flex'
  const targetLabel = isTargetFixed ? 'Fixed' : 'Flex'
  const currentIcon = isCurrentFixed ? 'ri-calendar-schedule-line' : 'ri-time-line'
  const targetIcon = isTargetFixed ? 'ri-calendar-schedule-line' : 'ri-time-line'

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

          <Alert severity='warning' icon={<i className='ri-alert-line' />}>
            <Typography variant='body2' sx={{ mb: 0.5 }}>
              This change is scheduled automatically after the latest existing booking ends.
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Until then, the resource stays in its current mode and shows as pending in the list.
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
