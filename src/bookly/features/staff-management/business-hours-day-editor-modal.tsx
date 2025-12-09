'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Alert,
  FormControl,
  Select,
  MenuItem
} from '@mui/material'
import { format } from 'date-fns'
import { useStaffManagementStore } from './staff-store'
import type { DayOfWeek, BreakRange } from '../calendar/types'

interface BusinessHoursDayEditorModalProps {
  open: boolean
  onClose: () => void
  branchId: string
  date: Date
  dayOfWeek: DayOfWeek
}

// Generate time options in 15-minute intervals
function generateTimeOptions(): string[] {
  const times: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hourStr = hour.toString().padStart(2, '0')
      const minStr = minute.toString().padStart(2, '0')
      times.push(`${hourStr}:${minStr}`)
    }
  }
  return times
}

// Format time from 24h to 12h format for display
function formatTime12h(time24: string): string {
  const [hourStr, minStr] = time24.split(':')
  let hour = parseInt(hourStr)
  const minute = minStr
  const period = hour >= 12 ? 'PM' : 'AM'

  if (hour === 0) hour = 12
  else if (hour > 12) hour -= 12

  return `${hour}:${minute} ${period}`
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

const TIME_OPTIONS = generateTimeOptions()

const DAY_LABELS: Record<DayOfWeek, string> = {
  Sun: 'Sunday',
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday'
}

export function BusinessHoursDayEditorModal({
  open,
  onClose,
  branchId,
  date,
  dayOfWeek
}: BusinessHoursDayEditorModalProps) {
  const { getBusinessHours, updateBusinessHours } = useStaffManagementStore()

  // Get current business hours for this day
  const currentDayHours = getBusinessHours(branchId, dayOfWeek)

  const [isOpen, setIsOpen] = useState(currentDayHours.isOpen)
  const [shifts, setShifts] = useState(
    currentDayHours.shifts.length > 0
      ? currentDayHours.shifts
      : [{ id: crypto.randomUUID(), start: '09:00', end: '17:00', breaks: [] }]
  )

  // Reset state when modal opens with new data
  useEffect(() => {
    if (open) {
      const dayHours = getBusinessHours(branchId, dayOfWeek)
      setIsOpen(dayHours.isOpen)
      setShifts(
        dayHours.shifts.length > 0
          ? dayHours.shifts
          : [{ id: crypto.randomUUID(), start: '09:00', end: '17:00', breaks: [] }]
      )
    }
  }, [open, branchId, dayOfWeek, getBusinessHours])

  // Validation for reverse times
  const reverseTimeValidation = useMemo(() => {
    if (!isOpen) return { hasError: false, message: '' }

    // Check shifts
    for (const shift of shifts) {
      const [startH, startM] = shift.start.split(':').map(Number)
      const [endH, endM] = shift.end.split(':').map(Number)
      const startMin = startH * 60 + startM
      const endMin = endH * 60 + endM

      if (endMin <= startMin) {
        return {
          hasError: true,
          message: 'End time must be after start time for all shifts'
        }
      }

      // Check breaks within this shift
      if (shift.breaks) {
        for (const breakTime of shift.breaks) {
          const [bStartH, bStartM] = breakTime.start.split(':').map(Number)
          const [bEndH, bEndM] = breakTime.end.split(':').map(Number)
          const bStartMin = bStartH * 60 + bStartM
          const bEndMin = bEndH * 60 + bEndM

          if (bEndMin <= bStartMin) {
            return {
              hasError: true,
              message: 'Break end time must be after break start time'
            }
          }
        }
      }
    }

    return { hasError: false, message: '' }
  }, [shifts, isOpen])

  const handleSave = () => {
    // Don't save if there's a reverse time error
    if (reverseTimeValidation.hasError) {
      return
    }

    updateBusinessHours(branchId, dayOfWeek, {
      isOpen,
      shifts: isOpen ? shifts : []
    })
    onClose()
  }

  const handleToggleOpen = () => {
    setIsOpen(!isOpen)
  }

  const handleUpdateShift = (shiftIndex: number, field: 'start' | 'end', value: string) => {
    const newShifts = [...shifts]
    newShifts[shiftIndex] = {
      ...newShifts[shiftIndex],
      [field]: value
    }
    setShifts(newShifts)
  }

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

  const handleRemoveShift = (shiftIndex: number) => {
    if (shifts.length > 1) {
      setShifts(shifts.filter((_: any, idx: number) => idx !== shiftIndex))
    }
  }

  const handleAddBreak = (shiftIndex: number) => {
    const newShifts = [...shifts]
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
    setShifts(newShifts)
  }

  const handleRemoveBreak = (shiftIndex: number, breakId: string) => {
    const newShifts = [...shifts]
    const shift = newShifts[shiftIndex]
    newShifts[shiftIndex] = {
      ...shift,
      breaks: (shift.breaks || []).filter((b: any) => b.id !== breakId)
    }
    setShifts(newShifts)
  }

  const handleUpdateBreak = (shiftIndex: number, breakId: string, field: 'start' | 'end', value: string) => {
    const newShifts = [...shifts]
    const shift = newShifts[shiftIndex]
    newShifts[shiftIndex] = {
      ...shift,
      breaks: (shift.breaks || []).map((b: any) => (b.id === breakId ? { ...b, [field]: value } : b))
    }
    setShifts(newShifts)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant='h6'>Edit Business Hours</Typography>
            <Typography variant='caption' color='text.secondary'>
              {DAY_LABELS[dayOfWeek]}, {format(date, 'MMM dd, yyyy')}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Open/Closed Toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={isOpen} onChange={handleToggleOpen} color='primary' />}
              label={
                <Typography variant='subtitle1' fontWeight={600}>
                  {isOpen ? 'Open' : 'Closed'}
                </Typography>
              }
            />
            {!isOpen && <Chip size='small' label='Closed' color='default' />}
          </Box>

          {/* Reverse Time Validation Alert */}
          {reverseTimeValidation.hasError && (
            <Alert severity='error' sx={{ mb: 1 }}>
              {reverseTimeValidation.message}
            </Alert>
          )}

          {/* Shifts */}
          {isOpen && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {shifts.map((shift: any, shiftIndex: number) => (
                <Box
                  key={shift.id}
                  sx={{
                    p: 2,
                    border: shifts.length > 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.paper'
                  }}
                >
                  {/* Shift Header */}
                  {shifts.length > 1 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography variant='subtitle2' fontWeight={600}>
                        Shift {shiftIndex + 1}
                      </Typography>
                      <IconButton size='small' onClick={() => handleRemoveShift(shiftIndex)} color='error'>
                        <i className='ri-delete-bin-line' />
                      </IconButton>
                    </Box>
                  )}

                  {/* Shift Times */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <FormControl size='small' sx={{ minWidth: 140 }}>
                      <Select
                        value={shift.start}
                        onChange={e => handleUpdateShift(shiftIndex, 'start', e.target.value)}
                        displayEmpty
                      >
                        {TIME_OPTIONS.map(time => (
                          <MenuItem key={time} value={time}>
                            {formatTime12h(time)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Typography color='text.secondary'>—</Typography>

                    <FormControl size='small' sx={{ minWidth: 140 }}>
                      <Select
                        value={shift.end}
                        onChange={e => handleUpdateShift(shiftIndex, 'end', e.target.value)}
                        displayEmpty
                      >
                        {TIME_OPTIONS.map(time => (
                          <MenuItem key={time} value={time}>
                            {formatTime12h(time)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Chip size='small' label={calculateDuration(shift.start, shift.end)} color='primary' />
                  </Box>

                  {/* Breaks */}
                  {shift.breaks && shift.breaks.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant='caption' color='text.secondary' fontWeight={600}>
                        BREAKS
                      </Typography>
                      {shift.breaks.map((breakTime: any) => (
                        <Box key={breakTime.id} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <FormControl size='small' sx={{ minWidth: 120 }}>
                            <Select
                              value={breakTime.start}
                              onChange={e => handleUpdateBreak(shiftIndex, breakTime.id, 'start', e.target.value)}
                            >
                              {TIME_OPTIONS.map(time => (
                                <MenuItem key={time} value={time}>
                                  {formatTime12h(time)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Typography variant='caption' color='text.secondary'>
                            —
                          </Typography>

                          <FormControl size='small' sx={{ minWidth: 120 }}>
                            <Select
                              value={breakTime.end}
                              onChange={e => handleUpdateBreak(shiftIndex, breakTime.id, 'end', e.target.value)}
                            >
                              {TIME_OPTIONS.map(time => (
                                <MenuItem key={time} value={time}>
                                  {formatTime12h(time)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Chip
                            size='small'
                            label={calculateDuration(breakTime.start, breakTime.end)}
                            variant='outlined'
                          />

                          <IconButton size='small' onClick={() => handleRemoveBreak(shiftIndex, breakTime.id)}>
                            <i className='ri-close-line' />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Add Break Button */}
                  <Button
                    size='small'
                    startIcon={<i className='ri-add-line' />}
                    onClick={() => handleAddBreak(shiftIndex)}
                    sx={{ mt: 1.5 }}
                  >
                    Add Break
                  </Button>
                </Box>
              ))}

              {/* Add Shift Button */}
              <Button
                variant='outlined'
                startIcon={<i className='ri-add-line' />}
                onClick={handleAddShift}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Another Shift
              </Button>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant='contained' disabled={reverseTimeValidation.hasError}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
