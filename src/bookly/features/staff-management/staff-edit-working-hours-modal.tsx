'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl
} from '@mui/material'
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'
import { useStaffManagementStore } from './staff-store'
import type { DayOfWeek } from '../calendar/types'
import { TimeSelectField } from './time-select-field'

interface StaffEditWorkingHoursModalProps {
  open: boolean
  onClose: () => void
  staffId: string
  staffName: string
  referenceDate?: Date // The date/week being viewed
}

const DAYS_OF_WEEK: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const DAY_LABELS: Record<DayOfWeek, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday'
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)

  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  const durationMinutes = endMinutes - startMinutes

  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`
}

export function StaffEditWorkingHoursModal({
  open,
  onClose,
  staffId,
  staffName,
  referenceDate
}: StaffEditWorkingHoursModalProps) {
  const { getStaffWorkingHours, updateStaffWorkingHours, updateShiftsForDate } = useStaffManagementStore()
  const [effectiveDate, setEffectiveDate] = useState('immediately')
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(true) // Default: edit recurring schedule

  // Calculate the current week dates
  const weekDates = referenceDate
    ? eachDayOfInterval({
        start: startOfWeek(referenceDate, { weekStartsOn: 0 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 0 })
      })
    : []

  const handleSave = () => {
    // Validate all shifts for overlaps before saving
    for (const day of DAYS_OF_WEEK) {
      const dayHours = getStaffWorkingHours(staffId, day)

      if (dayHours.isWorking && dayHours.shifts.length > 1) {
        // Check all pairs of shifts for overlaps
        for (let i = 0; i < dayHours.shifts.length; i++) {
          const shift1 = dayHours.shifts[i]
          const [startH1, startM1] = shift1.start.split(':').map(Number)
          const [endH1, endM1] = shift1.end.split(':').map(Number)
          const start1 = startH1 * 60 + startM1
          const end1 = endH1 * 60 + endM1

          // Validate end time is after start time
          if (end1 <= start1) {
            alert(`${DAY_LABELS[day]}: Shift ${i + 1} end time must be after start time`)
            return
          }

          for (let j = i + 1; j < dayHours.shifts.length; j++) {
            const shift2 = dayHours.shifts[j]
            const [startH2, startM2] = shift2.start.split(':').map(Number)
            const [endH2, endM2] = shift2.end.split(':').map(Number)
            const start2 = startH2 * 60 + startM2
            const end2 = endH2 * 60 + endM2

            // Check for overlap
            if (start1 < end2 && end1 > start2) {
              alert(
                `${DAY_LABELS[day]}: Shift ${i + 1} and Shift ${j + 1} have overlapping times. Please adjust the times so they don't conflict.`
              )
              return
            }
          }
        }
      }
    }

    if (applyToAllWeeks) {
      // Save to recurring weekly template - no additional action needed
      // Changes are already applied via updateStaffWorkingHours in the day handlers
      onClose()
    } else {
      // Create shift instances for this week only
      if (!referenceDate) {
        console.warn('Cannot save for this week only without a reference date')
        onClose()
        return
      }

      // Create shift instances for each day of the week
      weekDates.forEach((date, index) => {
        const dayOfWeek = DAYS_OF_WEEK[index]
        const dayHours = getStaffWorkingHours(staffId, dayOfWeek)
        const dateStr = date.toISOString().split('T')[0]

        if (dayHours.isWorking && dayHours.shifts.length > 0) {
          // Create shift instances for all shifts on this day
          const shiftInstances = dayHours.shifts.map(shift => ({
            id: shift.id,
            date: dateStr,
            start: shift.start,
            end: shift.end,
            breaks: shift.breaks && shift.breaks.length > 0 ? shift.breaks : undefined,
            reason: 'manual' as const
          }))
          updateShiftsForDate(staffId, dateStr, shiftInstances)
        } else {
          // Create no-shift instance for this specific date
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
      })

      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Typography variant='h6' fontWeight={600}>
          Edit • Working Hours • {staffName}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Set working hours for {staffName}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Apply To Toggle */}
          <Box
            sx={{
              p: 2,
              bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(144,202,249,0.08)' : 'rgba(25,118,210,0.08)'),
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'primary.main'
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  checked={applyToAllWeeks}
                  onChange={e => setApplyToAllWeeks(e.target.checked)}
                  color='primary'
                />
              }
              label={
                <Box>
                  <Typography fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className='ri-repeat-line' style={{ fontSize: 18 }} />
                    {applyToAllWeeks ? 'Apply to All Future Weeks' : 'This Week Only'}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {applyToAllWeeks
                      ? `Changes will apply to the recurring weekly schedule for ${staffName}. This sets the default working hours for each day of the week.`
                      : referenceDate
                        ? `Changes will only apply to the week of ${format(startOfWeek(referenceDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(referenceDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}. The recurring schedule will remain unchanged.`
                        : 'Changes will only apply to the current week. The recurring schedule will remain unchanged.'}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {DAYS_OF_WEEK.map(day => {
            const dayHours = getStaffWorkingHours(staffId, day)

            // Check for shift overlaps for this day
            const checkShiftOverlaps = (shifts: typeof dayHours.shifts) => {
              const overlaps: Array<{ shift1: number; shift2: number }> = []

              for (let i = 0; i < shifts.length; i++) {
                const shift1 = shifts[i]
                const [startH1, startM1] = shift1.start.split(':').map(Number)
                const [endH1, endM1] = shift1.end.split(':').map(Number)
                const start1 = startH1 * 60 + startM1
                const end1 = endH1 * 60 + endM1

                // Check if end time is before start time
                if (end1 <= start1) {
                  overlaps.push({ shift1: i, shift2: i })
                  continue
                }

                for (let j = i + 1; j < shifts.length; j++) {
                  const shift2 = shifts[j]
                  const [startH2, startM2] = shift2.start.split(':').map(Number)
                  const [endH2, endM2] = shift2.end.split(':').map(Number)
                  const start2 = startH2 * 60 + startM2
                  const end2 = endH2 * 60 + endM2

                  // Check for overlap
                  if (start1 < end2 && end1 > start2) {
                    overlaps.push({ shift1: i, shift2: j })
                  }
                }
              }

              return overlaps
            }

            const shiftOverlaps = checkShiftOverlaps(dayHours.shifts)
            const hasOverlaps = shiftOverlaps.length > 0

            const handleToggleWorking = () => {
              if (dayHours.isWorking) {
                updateStaffWorkingHours(staffId, day, {
                  isWorking: false,
                  shifts: []
                })
              } else {
                updateStaffWorkingHours(staffId, day, {
                  isWorking: true,
                  shifts: [
                    {
                      id: crypto.randomUUID(),
                      start: '09:00',
                      end: '17:00',
                      breaks: []
                    }
                  ]
                })
              }
            }

            const handleUpdateShift = (shiftIndex: number, field: 'start' | 'end', value: string) => {
              const newShifts = [...dayHours.shifts]
              newShifts[shiftIndex] = {
                ...newShifts[shiftIndex],
                [field]: value
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleAddShift = () => {
              const newShifts = [
                ...dayHours.shifts,
                {
                  id: crypto.randomUUID(),
                  start: '09:00',
                  end: '17:00',
                  breaks: []
                }
              ]
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleRemoveShift = (shiftIndex: number) => {
              if (dayHours.shifts.length > 1) {
                const newShifts = dayHours.shifts.filter((_, idx) => idx !== shiftIndex)
                updateStaffWorkingHours(staffId, day, {
                  ...dayHours,
                  shifts: newShifts
                })
              }
            }

            const handleAddBreak = (shiftIndex: number) => {
              const newShifts = [...dayHours.shifts]
              const shift = newShifts[shiftIndex]
              newShifts[shiftIndex] = {
                ...shift,
                breaks: [
                  ...(shift.breaks || []),
                  {
                    id: crypto.randomUUID(),
                    start: '12:00',
                    end: '13:00'
                  }
                ]
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleRemoveBreak = (shiftIndex: number, breakId: string) => {
              const newShifts = [...dayHours.shifts]
              const shift = newShifts[shiftIndex]
              newShifts[shiftIndex] = {
                ...shift,
                breaks: (shift.breaks || []).filter(b => b.id !== breakId)
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleUpdateBreak = (shiftIndex: number, breakId: string, field: 'start' | 'end', value: string) => {
              const newShifts = [...dayHours.shifts]
              const shift = newShifts[shiftIndex]
              newShifts[shiftIndex] = {
                ...shift,
                breaks: (shift.breaks || []).map(b => (b.id === breakId ? { ...b, [field]: value } : b))
              }
              updateStaffWorkingHours(staffId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            return (
              <Paper
                key={day}
                variant='outlined'
                sx={{
                  p: 2,
                  bgcolor: dayHours.isWorking ? 'background.paper' : 'action.hover'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: dayHours.isWorking ? 2 : 0 }}>
                  <FormControlLabel
                    control={<Switch checked={dayHours.isWorking} onChange={handleToggleWorking} color='primary' />}
                    label={
                      <Typography variant='subtitle1' fontWeight={600} sx={{ minWidth: 100 }}>
                        {DAY_LABELS[day]}
                      </Typography>
                    }
                  />

                  {dayHours.isWorking && dayHours.shifts.length > 0 && (
                    <Chip
                      size='small'
                      label={calculateDuration(dayHours.shifts[0].start, dayHours.shifts[0].end)}
                      color='primary'
                      variant='outlined'
                    />
                  )}

                  {!dayHours.isWorking && <Chip size='small' label='Not Working' color='default' />}
                </Box>

                {dayHours.isWorking && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayHours.shifts.map((shift, shiftIndex) => (
                      <Box
                        key={shift.id}
                        sx={{
                          p: 1.5,
                          border: dayHours.shifts.length > 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: dayHours.shifts.length > 1 ? 'action.hover' : 'transparent'
                        }}
                      >
                        {/* Shift Header (only show if multiple shifts) */}
                        {dayHours.shifts.length > 1 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant='caption' fontWeight={600} color='text.secondary'>
                              Shift {shiftIndex + 1}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton size='small' color='error' onClick={() => handleRemoveShift(shiftIndex)}>
                              <i className='ri-delete-bin-line' style={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <TimeSelectField
                            value={shift.start}
                            onChange={value => handleUpdateShift(shiftIndex, 'start', value)}
                            size='small'
                            sx={{ minWidth: 140 }}
                          />

                          <TimeSelectField
                            value={shift.end}
                            onChange={value => handleUpdateShift(shiftIndex, 'end', value)}
                            size='small'
                            sx={{ minWidth: 140 }}
                          />

                          <Chip
                            icon={<i className='ri-time-line' style={{ fontSize: 16 }} />}
                            size='small'
                            label={calculateDuration(shift.start, shift.end)}
                            sx={{ ml: 1 }}
                          />

                          <Button
                            size='small'
                            variant='text'
                            onClick={() => handleAddBreak(shiftIndex)}
                            sx={{ ml: 'auto' }}
                          >
                            + Add Break
                          </Button>
                        </Box>

                        {/* Breaks */}
                        {shift.breaks && shift.breaks.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {shift.breaks.map(breakRange => (
                              <Box key={breakRange.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', pl: 0 }}>
                                <Typography variant='body2' sx={{ minWidth: 60, color: 'text.secondary' }}>
                                  Break
                                </Typography>

                                <TimeSelectField
                                  value={breakRange.start}
                                  onChange={value => handleUpdateBreak(shiftIndex, breakRange.id, 'start', value)}
                                  size='small'
                                  sx={{ minWidth: 140 }}
                                />

                                <TimeSelectField
                                  value={breakRange.end}
                                  onChange={value => handleUpdateBreak(shiftIndex, breakRange.id, 'end', value)}
                                  size='small'
                                  sx={{ minWidth: 140 }}
                                />

                                <Chip
                                  size='small'
                                  label={calculateDuration(breakRange.start, breakRange.end)}
                                  variant='outlined'
                                />

                                <IconButton
                                  size='small'
                                  color='error'
                                  onClick={() => handleRemoveBreak(shiftIndex, breakRange.id)}
                                >
                                  <i className='ri-delete-bin-line' />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}

                    {/* Add Another Shift Button */}
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<i className='ri-add-line' />}
                      onClick={handleAddShift}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Add Another Shift
                    </Button>

                    {/* Overlap Warning */}
                    {hasOverlaps && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1.5,
                          bgcolor: 'error.50',
                          border: '1px solid',
                          borderColor: 'error.main',
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <i className='ri-error-warning-line' style={{ color: '#d32f2f', fontSize: 18 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant='body2' fontWeight={600} color='error.main'>
                            Overlapping Shifts Detected
                          </Typography>
                          {shiftOverlaps.map((overlap, idx) => (
                            <Typography key={idx} variant='caption' color='error.dark' display='block'>
                              {overlap.shift1 === overlap.shift2
                                ? `Shift ${overlap.shift1 + 1}: End time must be after start time`
                                : `Shift ${overlap.shift1 + 1} and Shift ${overlap.shift2 + 1} have overlapping times`}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            )
          })}

          {/* Make Changes Effective */}
          <Box sx={{ mt: 2 }}>
            <Typography variant='subtitle2' gutterBottom fontWeight={600}>
              Make changes effective
            </Typography>
            <FormControl fullWidth size='small'>
              <Select value={effectiveDate} onChange={e => setEffectiveDate(e.target.value)}>
                <MenuItem value='immediately'>Immediately</MenuItem>
                <MenuItem value='next-week'>Next Week</MenuItem>
                <MenuItem value='custom'>Custom Date</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Timeframe Info */}
          <Paper
            variant='outlined'
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderStyle: 'dashed'
            }}
          >
            <Typography variant='body2' color='text.secondary'>
              <strong>TIMEFRAME:</strong> These changes will apply to future scheduling for {staffName}. Existing
              appointments will not be affected.
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          CANCEL
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={DAYS_OF_WEEK.some(day => {
            const dayHours = getStaffWorkingHours(staffId, day)
            if (!dayHours.isWorking || dayHours.shifts.length <= 1) return false

            // Check for overlaps
            for (let i = 0; i < dayHours.shifts.length; i++) {
              const shift1 = dayHours.shifts[i]
              const [startH1, startM1] = shift1.start.split(':').map(Number)
              const [endH1, endM1] = shift1.end.split(':').map(Number)
              const start1 = startH1 * 60 + startM1
              const end1 = endH1 * 60 + endM1

              if (end1 <= start1) return true

              for (let j = i + 1; j < dayHours.shifts.length; j++) {
                const shift2 = dayHours.shifts[j]
                const [startH2, startM2] = shift2.start.split(':').map(Number)
                const [endH2, endM2] = shift2.end.split(':').map(Number)
                const start2 = startH2 * 60 + startM2
                const end2 = endH2 * 60 + endM2

                if (start1 < end2 && end1 > start2) return true
              }
            }
            return false
          })}
        >
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
