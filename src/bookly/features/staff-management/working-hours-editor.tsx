'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  IconButton,
  Chip,
  Divider
} from '@mui/material'
import { useStaffManagementStore } from './staff-store'
import type { DayOfWeek, StaffShift, BreakRange } from '../calendar/types'

interface WorkingHoursEditorProps {
  staffId: string
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

export function WorkingHoursEditor({ staffId }: WorkingHoursEditorProps) {
  const { getStaffWorkingHours, updateStaffWorkingHours } = useStaffManagementStore()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {DAYS_OF_WEEK.map((day) => {
        const dayHours = getStaffWorkingHours(staffId, day)

        const handleToggleWorking = () => {
          if (dayHours.isWorking) {
            updateStaffWorkingHours(staffId, day, {
              isWorking: false,
              shifts: []
            })
          } else {
            updateStaffWorkingHours(staffId, day, {
              isWorking: true,
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
          updateStaffWorkingHours(staffId, day, {
            ...dayHours,
            shifts: newShifts
          })
        }

        const handleAddShift = () => {
          updateStaffWorkingHours(staffId, day, {
            ...dayHours,
            shifts: [
              ...dayHours.shifts,
              {
                id: crypto.randomUUID(),
                start: '09:00',
                end: '17:00',
                breaks: []
              }
            ]
          })
        }

        const handleRemoveShift = (shiftIndex: number) => {
          const newShifts = dayHours.shifts.filter((_, i) => i !== shiftIndex)
          updateStaffWorkingHours(staffId, day, {
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
            breaks: (shift.breaks || []).map(b =>
              b.id === breakId ? { ...b, [field]: value } : b
            )
          }
          updateStaffWorkingHours(staffId, day, {
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
              bgcolor: dayHours.isWorking ? 'background.paper' : 'action.hover'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: dayHours.isWorking ? 2 : 0 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={dayHours.isWorking}
                    onChange={handleToggleWorking}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="subtitle1" fontWeight={600} sx={{ minWidth: 100 }}>
                    {DAY_LABELS[day]}
                  </Typography>
                }
              />

              {dayHours.isWorking && dayHours.shifts.length > 0 && (
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

              {!dayHours.isWorking && (
                <Chip
                  size="small"
                  label="Closed"
                  color="default"
                />
              )}
            </Box>

            {dayHours.isWorking && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {dayHours.shifts.map((shift, shiftIndex) => (
                  <Box key={shift.id}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        type="time"
                        size="small"
                        label="Start"
                        value={shift.start}
                        onChange={(e) => handleUpdateShift(shiftIndex, 'start', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 140 }}
                      />
                      <Typography color="text.secondary">—</Typography>
                      <TextField
                        type="time"
                        size="small"
                        label="End"
                        value={shift.end}
                        onChange={(e) => handleUpdateShift(shiftIndex, 'end', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 140 }}
                      />

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<i className="ri-cup-line" />}
                        onClick={() => handleAddBreak(shiftIndex)}
                      >
                        Add Break
                      </Button>

                      {dayHours.shifts.length > 1 && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveShift(shiftIndex)}
                        >
                          <i className="ri-delete-bin-line" />
                        </IconButton>
                      )}
                    </Box>

                    {/* Breaks */}
                    {shift.breaks && shift.breaks.length > 0 && (
                      <Box sx={{ ml: 4, mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {shift.breaks.map((breakRange) => (
                          <Box key={breakRange.id} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <i className="ri-cup-line" style={{ fontSize: 16, opacity: 0.5 }} />
                            <TextField
                              type="time"
                              size="small"
                              label="Break Start"
                              value={breakRange.start}
                              onChange={(e) => handleUpdateBreak(shiftIndex, breakRange.id, 'start', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              sx={{ width: 140 }}
                            />
                            <Typography variant="body2" color="text.secondary">—</Typography>
                            <TextField
                              type="time"
                              size="small"
                              label="Break End"
                              value={breakRange.end}
                              onChange={(e) => handleUpdateBreak(shiftIndex, breakRange.id, 'end', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              sx={{ width: 140 }}
                            />
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
                              <i className="ri-close-line" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}

                <Button
                  size="small"
                  variant="text"
                  startIcon={<i className="ri-add-line" />}
                  onClick={handleAddShift}
                  sx={{ alignSelf: 'flex-start', ml: 0 }}
                >
                  Add Split Shift
                </Button>
              </Box>
            )}
          </Paper>
        )
      })}
    </Box>
  )
}
