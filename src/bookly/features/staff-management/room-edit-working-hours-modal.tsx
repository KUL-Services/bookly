'use client'

import { useState, useEffect } from 'react'
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
  FormControl,
  TextField,
  InputLabel,
  OutlinedInput,
  Alert,
  Checkbox,
  ListItemText
} from '@mui/material'
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns'
import { mockServices, mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { DayOfWeek } from '../calendar/types'
import { TimeSelectField } from './time-select-field'

interface RoomEditWorkingHoursModalProps {
  open: boolean
  onClose: () => void
  roomId: string
  roomName: string
  roomType?: 'dynamic' | 'static' // Flexible vs Fixed capacity
  defaultCapacity?: number
  roomServiceIds?: string[] // Services assigned to this room
  referenceDate?: Date
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

interface RoomShiftState {
  id: string
  start: string
  end: string
  serviceId?: string // Single service for static rooms
  serviceIds?: string[] // Multiple services for dynamic rooms (unused in this modal)
  capacity?: number
  staffIds?: string[]
}

export function RoomEditWorkingHoursModal({
  open,
  onClose,
  roomId,
  roomName,
  roomType = 'dynamic',
  defaultCapacity = 10,
  roomServiceIds = [],
  referenceDate
}: RoomEditWorkingHoursModalProps) {
  const { getRoomSchedule, updateRoomSchedule } = useStaffManagementStore()

  // Filter available services to only those assigned to this room
  const availableServices =
    roomServiceIds.length > 0 ? mockServices.filter(s => roomServiceIds.includes(s.id)) : mockServices

  const isStaticRoom = roomType === 'static'
  const isDynamicRoom = roomType === 'dynamic'

  // Dynamic rooms: Default ON (apply to all future weeks)
  // Static rooms: Default OFF (this week only)
  const [applyToAllWeeks, setApplyToAllWeeks] = useState(isDynamicRoom)

  // Local state for each day's schedule
  const [scheduleByDay, setScheduleByDay] = useState<
    Record<DayOfWeek, { isAvailable: boolean; shifts: RoomShiftState[] }>
  >({
    Sun: { isAvailable: false, shifts: [] },
    Mon: { isAvailable: false, shifts: [] },
    Tue: { isAvailable: false, shifts: [] },
    Wed: { isAvailable: false, shifts: [] },
    Thu: { isAvailable: false, shifts: [] },
    Fri: { isAvailable: false, shifts: [] },
    Sat: { isAvailable: false, shifts: [] }
  })

  // Calculate the current week dates
  const weekDates = referenceDate
    ? eachDayOfInterval({
        start: startOfWeek(referenceDate, { weekStartsOn: 0 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 0 })
      })
    : []

  // Load schedule from store when opening
  useEffect(() => {
    if (open && roomId) {
      const newSchedule: Record<DayOfWeek, { isAvailable: boolean; shifts: RoomShiftState[] }> = {
        Sun: { isAvailable: false, shifts: [] },
        Mon: { isAvailable: false, shifts: [] },
        Tue: { isAvailable: false, shifts: [] },
        Wed: { isAvailable: false, shifts: [] },
        Thu: { isAvailable: false, shifts: [] },
        Fri: { isAvailable: false, shifts: [] },
        Sat: { isAvailable: false, shifts: [] }
      }

      DAYS_OF_WEEK.forEach(day => {
        const daySchedule = getRoomSchedule(roomId, day)
        newSchedule[day] = {
          isAvailable: daySchedule.isAvailable,
          shifts: daySchedule.shifts.map(s => ({
            id: s.id || `shift-${Date.now()}-${Math.random()}`,
            start: s.start,
            end: s.end,
            serviceId: s.serviceIds?.[0], // For static: single service
            serviceIds: s.serviceIds,
            capacity: s.capacity,
            staffIds: s.staffIds || []
          }))
        }
      })

      setScheduleByDay(newSchedule)
    }
  }, [open, roomId, getRoomSchedule])

  const handleToggleAvailable = (day: DayOfWeek) => {
    setScheduleByDay(prev => {
      const current = prev[day]
      if (current.isAvailable) {
        return { ...prev, [day]: { isAvailable: false, shifts: [] } }
      } else {
        return {
          ...prev,
          [day]: {
            isAvailable: true,
            shifts: [
              {
                id: `shift-${Date.now()}`,
                start: '09:00',
                end: '17:00',
                serviceId: availableServices[0]?.id,
                capacity: defaultCapacity,
                staffIds: []
              }
            ]
          }
        }
      }
    })
  }

  const handleAddShift = (day: DayOfWeek) => {
    setScheduleByDay(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: [
          ...prev[day].shifts,
          {
            id: `shift-${Date.now()}`,
            start: '09:00',
            end: '17:00',
            serviceId: availableServices[0]?.id,
            capacity: defaultCapacity,
            staffIds: []
          }
        ]
      }
    }))
  }

  const handleRemoveShift = (day: DayOfWeek, shiftId: string) => {
    setScheduleByDay(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: prev[day].shifts.filter(s => s.id !== shiftId)
      }
    }))
  }

  const handleUpdateShift = (day: DayOfWeek, shiftId: string, field: keyof RoomShiftState, value: any) => {
    setScheduleByDay(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        shifts: prev[day].shifts.map(s => (s.id === shiftId ? { ...s, [field]: value } : s))
      }
    }))
  }

  // Check for shift overlaps for a day
  const checkShiftOverlaps = (shifts: RoomShiftState[]) => {
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

  const hasAnyOverlaps = DAYS_OF_WEEK.some(day => {
    const daySchedule = scheduleByDay[day]
    if (!daySchedule.isAvailable || daySchedule.shifts.length <= 1) return false
    return checkShiftOverlaps(daySchedule.shifts).length > 0
  })

  const handleSave = () => {
    // Validate all shifts for overlaps before saving
    for (const day of DAYS_OF_WEEK) {
      const daySchedule = scheduleByDay[day]

      if (daySchedule.isAvailable && daySchedule.shifts.length > 1) {
        const overlaps = checkShiftOverlaps(daySchedule.shifts)
        if (overlaps.length > 0) {
          alert(`${DAY_LABELS[day]}: Please resolve overlapping shifts before saving`)
          return
        }
      }

      // Validate static room shifts have required fields
      if (isStaticRoom && daySchedule.isAvailable) {
        for (let i = 0; i < daySchedule.shifts.length; i++) {
          const shift = daySchedule.shifts[i]
          if (!shift.serviceId) {
            alert(`${DAY_LABELS[day]}, Shift ${i + 1}: Please select a service`)
            return
          }
        }
      }
    }

    // Save to store
    DAYS_OF_WEEK.forEach(day => {
      const daySchedule = scheduleByDay[day]
      updateRoomSchedule(roomId, day, {
        isAvailable: daySchedule.isAvailable,
        shifts: daySchedule.shifts.map(s => ({
          id: s.id,
          start: s.start,
          end: s.end,
          serviceIds: isStaticRoom ? (s.serviceId ? [s.serviceId] : []) : s.serviceIds || [],
          capacity: s.capacity,
          staffIds: s.staffIds
        }))
      })
    })

    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Typography variant='h6' fontWeight={600}>
          Edit • Room Schedule • {roomName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip
            size='small'
            label={isStaticRoom ? 'Fixed Capacity' : 'Flexible Capacity'}
            color={isStaticRoom ? 'primary' : 'success'}
            variant='outlined'
          />
          <Typography variant='body2' color='text.secondary'>
            Set weekly availability for {roomName}
          </Typography>
        </Box>
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
                      ? `Changes will apply to the recurring weekly schedule for ${roomName}. This sets the default availability for each day of the week.`
                      : referenceDate
                        ? `Changes will only apply to the week of ${format(startOfWeek(referenceDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(referenceDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}.`
                        : 'Changes will only apply to the current week.'}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Room Type Info */}
          {isStaticRoom && (
            <Alert severity='info' sx={{ py: 0.5 }}>
              <Typography variant='caption'>
                <strong>Static Room:</strong> Each shift requires a service, staff assignment, and capacity.
              </Typography>
            </Alert>
          )}

          {isDynamicRoom && (
            <Alert severity='success' sx={{ py: 0.5 }}>
              <Typography variant='caption'>
                <strong>Dynamic Room:</strong> Services are inherited from room settings. Just set availability times.
              </Typography>
            </Alert>
          )}

          {/* Days of Week */}
          {DAYS_OF_WEEK.map(day => {
            const daySchedule = scheduleByDay[day]
            const shiftOverlaps = checkShiftOverlaps(daySchedule.shifts)
            const hasOverlaps = shiftOverlaps.length > 0

            return (
              <Paper
                key={day}
                variant='outlined'
                sx={{
                  p: 2,
                  bgcolor: daySchedule.isAvailable ? 'background.paper' : 'action.hover'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: daySchedule.isAvailable ? 2 : 0 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={daySchedule.isAvailable}
                        onChange={() => handleToggleAvailable(day)}
                        color='primary'
                      />
                    }
                    label={
                      <Typography variant='subtitle1' fontWeight={600} sx={{ minWidth: 100 }}>
                        {DAY_LABELS[day]}
                      </Typography>
                    }
                  />

                  {daySchedule.isAvailable && daySchedule.shifts.length > 0 && (
                    <Chip
                      size='small'
                      label={`${daySchedule.shifts.length} shift${daySchedule.shifts.length > 1 ? 's' : ''}`}
                      color='primary'
                      variant='outlined'
                    />
                  )}

                  {!daySchedule.isAvailable && <Chip size='small' label='Unavailable' color='default' />}
                </Box>

                {daySchedule.isAvailable && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {daySchedule.shifts.map((shift, shiftIndex) => (
                      <Box
                        key={shift.id}
                        sx={{
                          p: 1.5,
                          border: daySchedule.shifts.length > 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: daySchedule.shifts.length > 1 ? 'action.hover' : 'transparent'
                        }}
                      >
                        {/* Shift Header */}
                        {daySchedule.shifts.length > 1 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant='caption' fontWeight={600} color='text.secondary'>
                              Shift {shiftIndex + 1}
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                            <IconButton size='small' color='error' onClick={() => handleRemoveShift(day, shift.id)}>
                              <i className='ri-delete-bin-line' style={{ fontSize: 16 }} />
                            </IconButton>
                          </Box>
                        )}

                        {/* Time Selection Row */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            mb: isStaticRoom ? 2 : 0
                          }}
                        >
                          <TimeSelectField
                            value={shift.start}
                            onChange={value => handleUpdateShift(day, shift.id, 'start', value)}
                            size='small'
                            sx={{ minWidth: 120 }}
                          />

                          <TimeSelectField
                            value={shift.end}
                            onChange={value => handleUpdateShift(day, shift.id, 'end', value)}
                            size='small'
                            sx={{ minWidth: 120 }}
                          />

                          <Chip
                            icon={<i className='ri-time-line' style={{ fontSize: 16 }} />}
                            size='small'
                            label={calculateDuration(shift.start, shift.end)}
                          />

                          {daySchedule.shifts.length === 1 && (
                            <IconButton
                              size='small'
                              color='error'
                              onClick={() => handleRemoveShift(day, shift.id)}
                              sx={{ ml: 'auto' }}
                            >
                              <i className='ri-delete-bin-line' style={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Box>

                        {/* Static Room: Service, Staff, Capacity */}
                        {isStaticRoom && (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Single Service Selection */}
                            <FormControl fullWidth size='small'>
                              <InputLabel>Service *</InputLabel>
                              <Select
                                value={shift.serviceId || ''}
                                onChange={e => handleUpdateShift(day, shift.id, 'serviceId', e.target.value)}
                                input={<OutlinedInput label='Service *' />}
                              >
                                {availableServices.map(service => (
                                  <MenuItem key={service.id} value={service.id}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                      <Typography>{service.name}</Typography>
                                      <Typography variant='caption' color='text.secondary'>
                                        {service.duration} min
                                      </Typography>
                                    </Box>
                                  </MenuItem>
                                ))}
                              </Select>
                              {roomServiceIds.length > 0 && (
                                <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                                  Only room's assigned services shown
                                </Typography>
                              )}
                            </FormControl>

                            {/* Staff Assignment */}
                            <FormControl fullWidth size='small'>
                              <InputLabel>Staff Assigned</InputLabel>
                              <Select
                                multiple
                                value={shift.staffIds || []}
                                onChange={e => {
                                  const value =
                                    typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                                  handleUpdateShift(day, shift.id, 'staffIds', value)
                                }}
                                input={<OutlinedInput label='Staff Assigned' />}
                                renderValue={selected => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map(value => {
                                      const staff = mockStaff.find(s => s.id === value)
                                      return <Chip key={value} label={staff?.name || value} size='small' />
                                    })}
                                  </Box>
                                )}
                              >
                                {mockStaff
                                  .filter(s => ['1', '2', '3', '4', '5', '6', '7'].includes(s.id))
                                  .map(staff => (
                                    <MenuItem key={staff.id} value={staff.id}>
                                      <Checkbox checked={(shift.staffIds || []).includes(staff.id)} />
                                      <ListItemText primary={staff.name} secondary={staff.title} />
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>

                            {/* Capacity */}
                            <TextField
                              type='number'
                              label='Capacity'
                              value={shift.capacity ?? defaultCapacity}
                              onChange={e => handleUpdateShift(day, shift.id, 'capacity', Number(e.target.value))}
                              size='small'
                              fullWidth
                              InputProps={{
                                inputProps: { min: 1, max: 100 },
                                startAdornment: <i className='ri-group-line' style={{ marginRight: 8 }} />
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}

                    {/* Add Another Shift Button */}
                    <Button
                      size='small'
                      variant='outlined'
                      startIcon={<i className='ri-add-line' />}
                      onClick={() => handleAddShift(day)}
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
                                : `Shift ${overlap.shift1 + 1} and Shift ${overlap.shift2 + 1} overlap`}
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
              <strong>TIMEFRAME:</strong> These changes will apply to future scheduling for {roomName}. Existing
              appointments will not be affected.
            </Typography>
          </Paper>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          CANCEL
        </Button>
        <Button onClick={handleSave} variant='contained' disabled={hasAnyOverlaps}>
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  )
}
