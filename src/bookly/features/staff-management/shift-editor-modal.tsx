'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  List,
  ListItem,
  InputAdornment,
  Alert
} from '@mui/material'
import type { BreakRange, DayOfWeek } from '../calendar/types'
import { TimeSelectField } from './time-select-field'
import { useStaffManagementStore } from './staff-store'
import { mockStaff, mockBranches } from '@/bookly/data/mock-data'

// Stable empty array to avoid infinite re-renders
const EMPTY_BREAKS: BreakRange[] = []

interface ShiftData {
  id: string
  start: string
  end: string
  breaks: BreakRange[]
}

interface ShiftEditorModalProps {
  open: boolean
  onClose: () => void
  staffId?: string
  staffName?: string
  staffType?: 'dynamic' | 'static' // Staff scheduling type
  date?: Date
  hasShift?: boolean
  initialStartTime?: string
  initialEndTime?: string
  initialBreaks?: BreakRange[]
  onSave?: (data: {
    hasShift: boolean
    startTime: string
    endTime: string
    breaks: BreakRange[]
    capacity?: number
  }) => void
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const minutes = endHour * 60 + endMin - (startHour * 60 + startMin)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function ShiftEditorModal({
  open,
  onClose,
  staffId,
  staffName = 'Staff Member',
  staffType = 'dynamic',
  date,
  hasShift = true,
  initialStartTime = '09:00',
  initialEndTime = '17:00',
  initialBreaks = EMPTY_BREAKS,
  onSave
}: ShiftEditorModalProps) {
  const { updateShiftsForDate, getStaffShiftsForDate, getBusinessHours } = useStaffManagementStore()
  const [isWorking, setIsWorking] = useState(hasShift)
  const [capacity, setCapacity] = useState<number>(10) // Default capacity for static staff
  const [shifts, setShifts] = useState<ShiftData[]>([
    {
      id: crypto.randomUUID(),
      start: initialStartTime,
      end: initialEndTime,
      breaks: initialBreaks
    }
  ])

  // Calculate if shift is outside branch business hours
  const businessHoursValidation = useMemo(() => {
    if (!date || !isWorking || !staffId || shifts.length === 0) return { isOutside: false, message: '' }

    // Get staff's branch
    const staff = mockStaff.find(s => s.id === staffId)
    if (!staff) return { isOutside: false, message: '' }

    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] as DayOfWeek
    const businessHours = getBusinessHours(staff.branchId, dayOfWeek)

    // If branch is closed on this day
    if (!businessHours.isOpen || businessHours.shifts.length === 0) {
      return {
        isOutside: true,
        message: 'The branch is closed on this day. Staff cannot work outside business hours.'
      }
    }

    // Get first shift (primary business hours)
    const branchShift = businessHours.shifts[0]

    // Parse times to minutes
    const [branchStartH, branchStartM] = branchShift.start.split(':').map(Number)
    const [branchEndH, branchEndM] = branchShift.end.split(':').map(Number)
    const branchStartMinutes = branchStartH * 60 + branchStartM
    const branchEndMinutes = branchEndH * 60 + branchEndM

    // Format times to 12h for display
    const formatTime = (time24: string) => {
      const [hourStr, minStr] = time24.split(':')
      let hour = parseInt(hourStr)
      const minute = minStr
      const period = hour >= 12 ? 'PM' : 'AM'
      if (hour === 0) hour = 12
      else if (hour > 12) hour -= 12
      return `${hour}:${minute} ${period}`
    }

    // Check if any shift is outside business hours
    for (const shift of shifts) {
      const [shiftStartH, shiftStartM] = shift.start.split(':').map(Number)
      const [shiftEndH, shiftEndM] = shift.end.split(':').map(Number)
      const shiftStartMinutes = shiftStartH * 60 + shiftStartM
      const shiftEndMinutes = shiftEndH * 60 + shiftEndM

      if (shiftStartMinutes < branchStartMinutes || shiftEndMinutes > branchEndMinutes) {
        return {
          isOutside: true,
          message: `All shifts must be within business hours (${formatTime(branchShift.start)} - ${formatTime(branchShift.end)}).`
        }
      }
    }

    return { isOutside: false, message: '' }
  }, [date, shifts, isWorking, staffId, getBusinessHours])

  // Real-time shift overlap validation
  const shiftOverlapValidation = useMemo(() => {
    if (!isWorking || shifts.length < 2) return { hasOverlap: false, message: '' }

    for (let i = 0; i < shifts.length; i++) {
      const [startH1, startM1] = shifts[i].start.split(':').map(Number)
      const [endH1, endM1] = shifts[i].end.split(':').map(Number)
      const start1 = startH1 * 60 + startM1
      const end1 = endH1 * 60 + endM1

      for (let j = i + 1; j < shifts.length; j++) {
        const [startH2, startM2] = shifts[j].start.split(':').map(Number)
        const [endH2, endM2] = shifts[j].end.split(':').map(Number)
        const start2 = startH2 * 60 + startM2
        const end2 = endH2 * 60 + endM2

        // Check if shifts overlap
        if (start1 < end2 && end1 > start2) {
          return {
            hasOverlap: true,
            message: `Shift ${i + 1} (${shifts[i].start} - ${shifts[i].end}) and Shift ${j + 1} (${shifts[j].start} - ${shifts[j].end}) have overlapping times. Please adjust the times so they don't intersect.`
          }
        }
      }
    }

    return { hasOverlap: false, message: '' }
  }, [shifts, isWorking])

  // Real-time reverse time validation (start must be before end)
  const reverseTimeValidation = useMemo(() => {
    if (!isWorking) return { hasReverse: false, message: '' }

    for (let i = 0; i < shifts.length; i++) {
      const [startH, startM] = shifts[i].start.split(':').map(Number)
      const [endH, endM] = shifts[i].end.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      if (startMinutes >= endMinutes) {
        return {
          hasReverse: true,
          message: `Shift ${i + 1}: End time (${shifts[i].end}) must be after start time (${shifts[i].start}).`
        }
      }

      // Also check breaks
      for (let j = 0; j < shifts[i].breaks.length; j++) {
        const breakItem = shifts[i].breaks[j]
        const [breakStartH, breakStartM] = breakItem.start.split(':').map(Number)
        const [breakEndH, breakEndM] = breakItem.end.split(':').map(Number)
        const breakStartMinutes = breakStartH * 60 + breakStartM
        const breakEndMinutes = breakEndH * 60 + breakEndM

        if (breakStartMinutes >= breakEndMinutes) {
          return {
            hasReverse: true,
            message: `Shift ${i + 1} Break ${j + 1}: End time must be after start time.`
          }
        }
      }
    }

    return { hasReverse: false, message: '' }
  }, [shifts, isWorking])

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open && staffId && date) {
      const dateStr = date.toISOString().split('T')[0]
      const existingShifts = getStaffShiftsForDate(staffId, dateStr)

      if (existingShifts && existingShifts.length > 0) {
        // Load existing shifts from store
        setIsWorking(true)
        setShifts(
          existingShifts.map(s => ({
            id: s.id,
            start: s.start,
            end: s.end,
            breaks: s.breaks || []
          }))
        )
      } else {
        // Use initial values
        setIsWorking(hasShift)
        setShifts([
          {
            id: crypto.randomUUID(),
            start: initialStartTime,
            end: initialEndTime,
            breaks: initialBreaks
          }
        ])
      }
    }
  }, [open, staffId, date, hasShift, initialStartTime, initialEndTime, initialBreaks, getStaffShiftsForDate])

  const handleAddShift = () => {
    setShifts([
      ...shifts,
      {
        id: crypto.randomUUID(),
        start: '09:00',
        end: '17:00',
        breaks: []
      }
    ])
  }

  const handleRemoveShift = (shiftId: string) => {
    if (shifts.length > 1) {
      setShifts(shifts.filter(s => s.id !== shiftId))
    }
  }

  const handleUpdateShift = (shiftId: string, field: 'start' | 'end', value: string) => {
    setShifts(shifts.map(s => (s.id === shiftId ? { ...s, [field]: value } : s)))
  }

  const handleAddBreak = (shiftId: string) => {
    setShifts(
      shifts.map(s =>
        s.id === shiftId
          ? {
              ...s,
              breaks: [
                ...s.breaks,
                {
                  id: crypto.randomUUID(),
                  start: '12:00',
                  end: '13:00'
                }
              ]
            }
          : s
      )
    )
  }

  const handleRemoveBreak = (shiftId: string, breakId: string) => {
    setShifts(shifts.map(s => (s.id === shiftId ? { ...s, breaks: s.breaks.filter(b => b.id !== breakId) } : s)))
  }

  const handleUpdateBreak = (shiftId: string, breakId: string, field: 'start' | 'end', value: string) => {
    setShifts(
      shifts.map(s =>
        s.id === shiftId ? { ...s, breaks: s.breaks.map(b => (b.id === breakId ? { ...b, [field]: value } : b)) } : s
      )
    )
  }

  const handleSave = () => {
    // Only allow save if not outside business hours
    if (businessHoursValidation.isOutside) {
      return
    }

    // Only allow save if no shift overlaps
    if (shiftOverlapValidation.hasOverlap) {
      return
    }

    // Only allow save if no reverse times
    if (reverseTimeValidation.hasReverse) {
      return
    }

    // Validate shift times
    for (const shift of shifts) {
      const [startH, startM] = shift.start.split(':').map(Number)
      const [endH, endM] = shift.end.split(':').map(Number)
      const startMinutes = startH * 60 + startM
      const endMinutes = endH * 60 + endM

      if (startMinutes >= endMinutes) {
        alert('End time must be after start time for all shifts')
        return
      }
    }

    if (staffId && date) {
      // Create a one-time override for this specific date
      const dateStr = date.toISOString().split('T')[0]

      if (isWorking && shifts.length > 0) {
        // Update all shifts for this date at once
        const shiftInstances = shifts.map(shift => ({
          id: shift.id,
          date: dateStr,
          start: shift.start,
          end: shift.end,
          breaks: shift.breaks.length > 0 ? shift.breaks : undefined,
          reason: 'manual' as const
        }))
        updateShiftsForDate(staffId, dateStr, shiftInstances)
      } else {
        // Mark this day as no-shift override (staff not working this specific day)
        updateShiftsForDate(staffId, dateStr, [
          {
            id: crypto.randomUUID(),
            date: dateStr,
            start: '00:00',
            end: '00:00',
            breaks: undefined,
            reason: 'manual'
          }
        ])
      }
    }

    // Also call the legacy onSave callback if provided (using first shift for backward compatibility)
    if (onSave && shifts.length > 0) {
      const firstShift = shifts[0]
      onSave({
        hasShift: isWorking,
        startTime: firstShift.start,
        endTime: firstShift.end,
        breaks: firstShift.breaks,
        capacity: staffType === 'static' ? capacity : undefined
      })
    }
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setIsWorking(hasShift)
    setShifts([
      {
        id: crypto.randomUUID(),
        start: initialStartTime,
        end: initialEndTime,
        breaks: []
      }
    ])
    onClose()
  }

  const formatDate = (d: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size='small' onClick={handleCancel} sx={{ mr: 1 }}>
            <i className='ri-close-line' />
          </IconButton>
          <Typography variant='h6' fontWeight={600}>
            Edit shift • {staffName} • {date ? formatDate(date) : 'Select Date'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Business Hours Validation Warning */}
          {businessHoursValidation.isOutside && (
            <Alert severity='error'>
              <Typography variant='body2' fontWeight={600}>
                Outside Business Hours
              </Typography>
              <Typography variant='body2'>{businessHoursValidation.message}</Typography>
            </Alert>
          )}

          {/* Shift Overlap Validation Warning */}
          {shiftOverlapValidation.hasOverlap && (
            <Alert severity='error'>
              <Typography variant='body2' fontWeight={600}>
                Overlapping Shifts
              </Typography>
              <Typography variant='body2'>{shiftOverlapValidation.message}</Typography>
            </Alert>
          )}

          {/* Reverse Time Validation Warning */}
          {reverseTimeValidation.hasReverse && (
            <Alert severity='error'>
              <Typography variant='body2' fontWeight={600}>
                Invalid Time Range
              </Typography>
              <Typography variant='body2'>{reverseTimeValidation.message}</Typography>
            </Alert>
          )}

          {/* Info about editing single day */}
          <Box
            sx={{
              p: 2,
              bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.08)' : 'rgba(25,118,210,0.08)'),
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'info.main'
            }}
          >
            <Typography
              variant='body2'
              fontWeight={600}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}
            >
              <i className='ri-information-line' style={{ fontSize: 18 }} />
              Editing Single Day
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              This change will only apply to {date ? formatDate(date) : 'this specific date'}. To edit the weekly
              schedule, use "Edit Working Hours" from the staff menu.
            </Typography>
          </Box>

          {/* Shift Toggle */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={isWorking} onChange={e => setIsWorking(e.target.checked)} color='primary' />}
              label={<Typography fontWeight={600}>Working</Typography>}
              sx={{ mr: 2 }}
            />
          </Box>

          {/* Shifts Section */}
          {isWorking &&
            shifts.map((shift, shiftIndex) => (
              <Box
                key={shift.id}
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }}
              >
                {/* Shift Header */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <Typography variant='subtitle2' fontWeight={600}>
                    Shift {shiftIndex + 1}
                  </Typography>
                  <Box sx={{ flexGrow: 1 }} />
                  {shifts.length > 1 && (
                    <IconButton size='small' color='error' onClick={() => handleRemoveShift(shift.id)}>
                      <i className='ri-delete-bin-line' />
                    </IconButton>
                  )}
                </Box>

                {/* Shift Time Fields */}
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                  <TimeSelectField
                    label='Start'
                    value={shift.start}
                    onChange={value => handleUpdateShift(shift.id, 'start', value)}
                    sx={{ width: 150 }}
                  />
                  <TimeSelectField
                    label='End'
                    value={shift.end}
                    onChange={value => handleUpdateShift(shift.id, 'end', value)}
                    sx={{ width: 150 }}
                  />
                  <Chip
                    icon={<i className='ri-time-line' style={{ fontSize: 16 }} />}
                    size='small'
                    label={calculateDuration(shift.start, shift.end)}
                    sx={{ ml: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    size='small'
                    variant='text'
                    startIcon={<i className='ri-add-line' />}
                    onClick={() => handleAddBreak(shift.id)}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                  >
                    Add Break
                  </Button>
                </Box>

                {/* Capacity Input - Only for Static Staff */}
                {staffType === 'static' && (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      type='number'
                      label='Capacity (people)'
                      value={capacity}
                      onChange={e => setCapacity(Number(e.target.value))}
                      size='small'
                      fullWidth
                      InputProps={{
                        inputProps: { min: 1, max: 100 },
                        startAdornment: (
                          <InputAdornment position='start'>
                            <i className='ri-group-line' />
                          </InputAdornment>
                        )
                      }}
                      helperText='Maximum number of concurrent bookings for this shift'
                    />
                  </Box>
                )}

                {/* Breaks for this shift */}
                {shift.breaks.length > 0 && (
                  <List sx={{ p: 0 }}>
                    {shift.breaks.map(breakRange => (
                      <ListItem
                        key={breakRange.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          bgcolor: 'action.hover',
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                          <i className='ri-cup-line' style={{ fontSize: 20, opacity: 0.5 }} />
                          <TimeSelectField
                            label='Start'
                            value={breakRange.start}
                            onChange={value => handleUpdateBreak(shift.id, breakRange.id, 'start', value)}
                            size='small'
                            sx={{ width: 120 }}
                          />
                          <Typography variant='body2' color='text.secondary'>
                            —
                          </Typography>
                          <TimeSelectField
                            label='End'
                            value={breakRange.end}
                            onChange={value => handleUpdateBreak(shift.id, breakRange.id, 'end', value)}
                            size='small'
                            sx={{ width: 120 }}
                          />
                          <Chip
                            size='small'
                            label={calculateDuration(breakRange.start, breakRange.end)}
                            variant='outlined'
                          />
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton
                            size='small'
                            color='error'
                            onClick={() => handleRemoveBreak(shift.id, breakRange.id)}
                          >
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            ))}

          {/* Add Another Shift Button */}
          {isWorking && (
            <Button
              variant='outlined'
              startIcon={<i className='ri-add-line' />}
              onClick={handleAddShift}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Add Another Shift
            </Button>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant='outlined'>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={
            businessHoursValidation.isOutside || shiftOverlapValidation.hasOverlap || reverseTimeValidation.hasReverse
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
