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
import type { DayOfWeek } from '../calendar/types'
import { TimeSelectField } from './time-select-field'

interface StaffEditWorkingHoursModalProps {
  open: boolean
  onClose: () => void
  staffId: string
  staffName: string
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

export function StaffEditWorkingHoursModal({ open, onClose, staffId, staffName }: StaffEditWorkingHoursModalProps) {
  const { getStaffWorkingHours, updateStaffWorkingHours } = useStaffManagementStore()
  const [effectiveDate, setEffectiveDate] = useState('immediately')

  const handleSave = () => {
    onClose()
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
          {DAYS_OF_WEEK.map(day => {
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
                      <Box key={shift.id}>
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
        <Button onClick={handleSave} variant='contained'>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
