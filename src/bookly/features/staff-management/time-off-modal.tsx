'use client'

import { useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Tooltip,
  IconButton,
  FormHelperText
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { TimeOffReasonGroup } from '../calendar/types'
import { DatePickerField } from './date-picker-field'
import { TimeSelectField } from './time-select-field'

interface TimeOffModalProps {
  open: boolean
  onClose: () => void
  editTimeOffId?: string
  initialStaffId?: string
  initialStaffName?: string
  initialDate?: Date
}

const TIME_OFF_REASONS: Record<TimeOffReasonGroup, string[]> = {
  Vacation: ['Vacation', 'Holiday', 'Personal Travel'],
  Sick: ['Sick Leave', 'Medical Appointment', 'Family Emergency'],
  Personal: ['Personal Day', 'Family Event', 'Errands'],
  Training: ['Professional Development', 'Conference', 'Workshop'],
  'No-Show': ['No Call No Show', 'Late Arrival'],
  Late: ['Tardy', 'Traffic', 'Transportation Issue'],
  Other: ['Other', 'Unpaid Leave', 'Bereavement']
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const minutes = endHour * 60 + endMin - (startHour * 60 + startMin)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

const timeOffSchema = z
  .object({
    staffId: z.string().min(1, 'Please select a staff member'),
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date({ required_error: 'End date is required' }),
    allDay: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    repeat: z.boolean(),
    repeatUntil: z.date().nullable(),
    reasonGroup: z.enum(['Vacation', 'Sick', 'Personal', 'Training', 'No-Show', 'Late', 'Other']),
    approved: z.boolean(),
    note: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (!data.allDay) {
      if (!data.startTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Start time is required',
          path: ['startTime']
        })
      }
      if (!data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time is required',
          path: ['endTime']
        })
      }
    }

    if (data.endDate < data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date cannot be before start date',
        path: ['endDate']
      })
    }
    // Simple check so endTime is after startTime if on the same day?
    // Not strictly enforced here if spanning multiple days, but good for single day logic
    if (!data.allDay && data.startDate.getTime() === data.endDate.getTime()) {
      // Comparison logic for times
      const [startH, startM] = data.startTime.split(':').map(Number)
      const [endH, endM] = data.endTime.split(':').map(Number)
      if (startH * 60 + startM >= endH * 60 + endM) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time must be after start time',
          path: ['endTime']
        })
      }
    }
  })

type TimeOffFormValues = z.infer<typeof timeOffSchema>

export function TimeOffModal({
  open,
  onClose,
  editTimeOffId,
  initialStaffId,
  initialStaffName,
  initialDate
}: TimeOffModalProps) {
  const { createTimeOff, timeOffRequests, updateTimeOff, deleteTimeOff } = useStaffManagementStore()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TimeOffFormValues>({
    resolver: zodResolver(timeOffSchema),
    defaultValues: {
      staffId: '',
      startDate: new Date(),
      endDate: new Date(),
      allDay: true,
      startTime: '09:00',
      endTime: '17:00',
      repeat: false,
      repeatUntil: null,
      reasonGroup: 'Sick',
      approved: false,
      note: ''
    }
  })

  // Watch values for conditional rendering
  const allDay = watch('allDay')
  const startTime = watch('startTime')
  const endTime = watch('endTime')
  const hasRepeat = watch('repeat')

  // Load existing data when modal opens
  useEffect(() => {
    if (open) {
      const existingTimeOff = editTimeOffId ? timeOffRequests.find(t => t.id === editTimeOffId) : null

      if (existingTimeOff) {
        reset({
          staffId: existingTimeOff.staffId,
          startDate: existingTimeOff.range.start,
          endDate: existingTimeOff.range.end,
          allDay: existingTimeOff.allDay,
          startTime: !existingTimeOff.allDay
            ? `${existingTimeOff.range.start.getHours().toString().padStart(2, '0')}:${existingTimeOff.range.start.getMinutes().toString().padStart(2, '0')}`
            : '09:00',
          endTime: !existingTimeOff.allDay
            ? `${existingTimeOff.range.end.getHours().toString().padStart(2, '0')}:${existingTimeOff.range.end.getMinutes().toString().padStart(2, '0')}`
            : '17:00',
          repeat: !!existingTimeOff.repeat,
          repeatUntil: existingTimeOff.repeat?.until || null,
          reasonGroup: existingTimeOff.reason,
          approved: existingTimeOff.approved,
          note: existingTimeOff.note || ''
        })
      } else {
        reset({
          staffId: initialStaffId || '',
          startDate: initialDate || new Date(),
          endDate: initialDate || new Date(),
          allDay: true,
          startTime: '09:00',
          endTime: '17:00',
          repeat: false,
          repeatUntil: null,
          reasonGroup: 'Sick',
          approved: false,
          note: ''
        })
      }
    }
  }, [open, editTimeOffId, initialStaffId, initialDate, timeOffRequests, reset])

  const onSubmit = (data: TimeOffFormValues) => {
    const startDateTime = data.allDay
      ? new Date(data.startDate.setHours(0, 0, 0, 0))
      : new Date(`${data.startDate.toISOString().split('T')[0]}T${data.startTime}`)

    const endDateTime = data.allDay
      ? new Date(data.endDate.setHours(23, 59, 59, 999))
      : new Date(`${data.endDate.toISOString().split('T')[0]}T${data.endTime}`)

    const payload = {
      staffId: data.staffId,
      range: {
        start: startDateTime,
        end: endDateTime
      },
      allDay: data.allDay,
      repeat: data.repeat && data.repeatUntil ? { until: data.repeatUntil } : undefined,
      reason: data.reasonGroup as TimeOffReasonGroup,
      approved: data.approved,
      note: data.note
    }

    if (editTimeOffId) {
      updateTimeOff(editTimeOffId, payload)
    } else {
      createTimeOff(payload)
    }

    handleCancel()
  }

  const handleDelete = () => {
    if (editTimeOffId && confirm('Are you sure you want to delete this time off?')) {
      deleteTimeOff(editTimeOffId)
      handleCancel()
    }
  }

  const handleCancel = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth='md' fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant='h6' fontWeight={600}>
                {editTimeOffId ? `Edit Time Off • ${initialStaffName || 'Staff'}` : 'Add Time Off'}
              </Typography>
              {!editTimeOffId && (
                <Typography variant='body2' color='text.secondary'>
                  Request time off for staff members
                </Typography>
              )}
            </Box>
            <IconButton size='small' onClick={handleCancel}>
              <i className='ri-close-line' />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Staff Selection */}
            {!editTimeOffId && (
              <Controller
                name='staffId'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.staffId}>
                    <InputLabel>Staff Member</InputLabel>
                    <Select {...field} label='Staff Member'>
                      <MenuItem value=''>
                        <em>Select a staff member</em>
                      </MenuItem>
                      {mockStaff.map(staff => (
                        <MenuItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.staffId && <FormHelperText>{errors.staffId.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            )}

            {/* Editing Existing Staff Name Display */}
            {editTimeOffId && initialStaffName && (
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}
              >
                <i className='ri-user-line' />
                <Typography variant='body2' fontWeight={600}>
                  {initialStaffName}
                </Typography>
              </Box>
            )}

            {/* All Day Toggle + Duration */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Controller
                name='allDay'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        sx={{
                          '&.Mui-checked': {
                            color: 'text.primary'
                          }
                        }}
                      />
                    }
                    label={<Typography fontWeight={500}>All Day</Typography>}
                  />
                )}
              />

              {!allDay && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className='ri-time-line' style={{ fontSize: 20, opacity: 0.5 }} />
                  <Typography variant='body2' color='text.secondary'>
                    {calculateDuration(startTime, endTime)}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Select date */}
            <Box>
              <Typography variant='subtitle2' gutterBottom fontWeight={600}>
                Select date
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Controller
                  name='startDate'
                  control={control}
                  render={({ field }) => (
                    <DatePickerField
                      label='DATE'
                      value={field.value}
                      onChange={date => {
                        field.onChange(date)
                        const currentEnd = watch('endDate')
                        if (!currentEnd || currentEnd < date) {
                          setValue('endDate', date)
                        }
                      }}
                      required
                      sx={{ flex: 1 }}
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />

                {!allDay && (
                  <>
                    <Controller
                      name='startTime'
                      control={control}
                      render={({ field }) => (
                        <TimeSelectField
                          label='Start Time'
                          value={field.value}
                          onChange={field.onChange}
                          size='small'
                          sx={{ width: 140 }}
                          error={!!errors.startTime}
                          helperText={errors.startTime?.message}
                        />
                      )}
                    />
                    <Controller
                      name='endTime'
                      control={control}
                      render={({ field }) => (
                        <TimeSelectField
                          label='End Time'
                          value={field.value}
                          onChange={field.onChange}
                          size='small'
                          sx={{ width: 140 }}
                          error={!!errors.endTime}
                          helperText={errors.endTime?.message}
                        />
                      )}
                    />
                  </>
                )}

                <Controller
                  name='repeat'
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox checked={field.value} onChange={e => field.onChange(e.target.checked)} />}
                      label='Repeat'
                    />
                  )}
                />
              </Box>
              {hasRepeat && (
                <Box sx={{ mt: 2 }}>
                  <Controller
                    name='repeatUntil'
                    control={control}
                    render={({ field }) => (
                      <DatePickerField
                        label='Repeat Until'
                        value={field.value || new Date()}
                        onChange={field.onChange}
                        required
                        error={!!errors.repeatUntil}
                        helperText={errors.repeatUntil?.message}
                      />
                    )}
                  />
                </Box>
              )}
            </Box>

            {/* Reason Selection */}
            <Box>
              <Typography variant='subtitle2' gutterBottom fontWeight={600}>
                Select type
              </Typography>
              <Controller
                name='reasonGroup'
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth required error={!!errors.reasonGroup}>
                    <InputLabel>REASON</InputLabel>
                    <Select {...field} label='REASON'>
                      {Object.keys(TIME_OFF_REASONS).map(group => (
                        <MenuItem key={group} value={group}>
                          {group}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.reasonGroup && <FormHelperText>{errors.reasonGroup.message}</FormHelperText>}
                  </FormControl>
                )}
              />
            </Box>

            {/* Note Field (New) */}
            <Box>
              <Controller
                name='note'
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label='Note (Optional)'
                    fullWidth
                    multiline
                    rows={2}
                    error={!!errors.note}
                    helperText={errors.note?.message}
                  />
                )}
              />
            </Box>

            {/* Approved */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Controller
                name='approved'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        sx={{
                          '&.Mui-checked': {
                            color: 'text.primary'
                          }
                        }}
                      />
                    }
                    label={<Typography fontWeight={500}>Approved</Typography>}
                  />
                )}
              />
              <Tooltip title='Mark as approved if this time off request has been reviewed and accepted by management'>
                <IconButton size='small'>
                  <i className='ri-question-line' style={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          {editTimeOffId && (
            <Button
              onClick={handleDelete}
              variant='outlined'
              color='error'
              startIcon={<i className='ri-delete-bin-line' />}
            >
              Clear Time Off
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleCancel} variant='outlined'>
            Cancel
          </Button>
          <Button type='submit' variant='contained'>
            {editTimeOffId ? 'Save' : 'Add Time Off'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
