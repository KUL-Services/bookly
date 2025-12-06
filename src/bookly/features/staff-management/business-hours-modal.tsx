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
import { useStaffManagementStore } from './staff-store'
import type { DayOfWeek, BreakRange } from '../calendar/types'

interface BusinessHoursModalProps {
  open: boolean
  onClose: () => void
  branchId?: string  // The branch ID for which to edit business hours
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

export function BusinessHoursModal({ open, onClose, branchId }: BusinessHoursModalProps) {
  const { getBusinessHours, updateBusinessHours } = useStaffManagementStore()
  const [effectiveDate, setEffectiveDate] = useState('immediately')

  const handleSave = () => {
    // In a real app, you would save with the effective date
    onClose()
  }

  // If no branchId is provided, show a warning
  if (!branchId) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Edit • Business Hours
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Set your business operating hours for each day of the week
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DAYS_OF_WEEK.map((day) => {
            const dayHours = getBusinessHours(branchId, day)

            const handleToggleOpen = () => {
              if (dayHours.isOpen) {
                updateBusinessHours(branchId, day, {
                  isOpen: false,
                  shifts: []
                })
              } else {
                updateBusinessHours(branchId, day, {
                  isOpen: true,
                  shifts: [{
                    id: crypto.randomUUID(),
                    start: '09:00',
                    end: '17:00',
                    breaks: []
                  }]
                })
              }
            }

            const handleUpdateShift = (shiftIndex: number, field: 'start' | 'end', value: string) => {
              const newShifts = [...dayHours.shifts]
              newShifts[shiftIndex] = {
                ...newShifts[shiftIndex],
                [field]: value
              }
              updateBusinessHours(branchId, day, {
                ...dayHours,
                shifts: newShifts
              })
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
              updateBusinessHours(branchId, day, {
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
              updateBusinessHours(branchId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            const handleUpdateBreak = (shiftIndex: number, breakId: string, field: 'start' | 'end', value: string) => {
              const newShifts = [...dayHours.shifts]
              const shift = newShifts[shiftIndex]
              newShifts[shiftIndex] = {
                ...shift,
                breaks: (shift.breaks || []).map(b =>
                  b.id === breakId ? { ...b, [field]: value } : b
                )
              }
              updateBusinessHours(branchId, day, {
                ...dayHours,
                shifts: newShifts
              })
            }

            return (
              <Paper
                key={day}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: dayHours.isOpen ? 'background.paper' : 'action.hover'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: dayHours.isOpen ? 2 : 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={dayHours.isOpen}
                        onChange={handleToggleOpen}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 100 }}>
                        {DAY_LABELS[day]}
                      </Typography>
                    }
                  />

                  {dayHours.isOpen && dayHours.shifts.length > 0 && (
                    <Chip
                      size="small"
                      label={calculateDuration(
                        dayHours.shifts[0].start,
                        dayHours.shifts[0].end
                      )}
                      color="primary"
                      variant="outlined"
                    />
                  )}

                  {!dayHours.isOpen && (
                    <Chip
                      size="small"
                      label="Closed"
                      color="default"
                    />
                  )}
                </Box>

                {dayHours.isOpen && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {dayHours.shifts.map((shift, shiftIndex) => (
                      <Box key={shift.id}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                              value={shift.start}
                              onChange={(e) => handleUpdateShift(shiftIndex, 'start', e.target.value)}
                              displayEmpty
                            >
                              {TIME_OPTIONS.map((time) => (
                                <MenuItem key={time} value={time}>
                                  {formatTime12h(time)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl size="small" sx={{ minWidth: 140 }}>
                            <Select
                              value={shift.end}
                              onChange={(e) => handleUpdateShift(shiftIndex, 'end', e.target.value)}
                              displayEmpty
                            >
                              {TIME_OPTIONS.map((time) => (
                                <MenuItem key={time} value={time}>
                                  {formatTime12h(time)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <Chip
                            icon={<i className="ri-time-line" style={{ fontSize: 16 }} />}
                            size="small"
                            label={calculateDuration(shift.start, shift.end)}
                            sx={{ ml: 1 }}
                          />

                          <Button
                            size="small"
                            variant="text"
                            onClick={() => handleAddBreak(shiftIndex)}
                            sx={{ ml: 'auto' }}
                          >
                            + Add Break
                          </Button>
                        </Box>

                        {/* Breaks */}
                        {shift.breaks && shift.breaks.length > 0 && (
                          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {shift.breaks.map((breakRange) => (
                              <Box key={breakRange.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', pl: 0 }}>
                                <Typography
                                  variant="body2"
                                  sx={{ minWidth: 60, color: 'text.secondary' }}
                                >
                                  Break
                                </Typography>

                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                  <Select
                                    value={breakRange.start}
                                    onChange={(e) => handleUpdateBreak(shiftIndex, breakRange.id, 'start', e.target.value)}
                                    displayEmpty
                                  >
                                    {TIME_OPTIONS.map((time) => (
                                      <MenuItem key={time} value={time}>
                                        {formatTime12h(time)}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <FormControl size="small" sx={{ minWidth: 140 }}>
                                  <Select
                                    value={breakRange.end}
                                    onChange={(e) => handleUpdateBreak(shiftIndex, breakRange.id, 'end', e.target.value)}
                                    displayEmpty
                                  >
                                    {TIME_OPTIONS.map((time) => (
                                      <MenuItem key={time} value={time}>
                                        {formatTime12h(time)}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>

                                <Chip
                                  size="small"
                                  label={calculateDuration(breakRange.start, breakRange.end)}
                                  variant="outlined"
                                />

                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoveBreak(shiftIndex, breakRange.id)}
                                >
                                  <i className="ri-delete-bin-line" />
                                </IconButton>
                              </Box>
                            ))}
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Paper>
            )
          })}

          {/* Make Changes Effective */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Make changes effective
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
              >
                <MenuItem value="immediately">Immediately</MenuItem>
                <MenuItem value="next-week">Next Week</MenuItem>
                <MenuItem value="custom">Custom Date</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Timeframe Info */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: 'action.hover',
              borderStyle: 'dashed'
            }}
          >
            <Typography variant="body2" color="text.secondary">
              <strong>TIMEFRAME:</strong> These changes will apply to all future scheduling. Existing appointments will not be affected.
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          CANCEL
        </Button>
        <Button onClick={handleSave} variant="contained">
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
