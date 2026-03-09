'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  TextField,
  Alert,
  Checkbox,
  ListItemText,
  Tooltip,
  Snackbar
} from '@mui/material'

import { useStaffManagementStore } from './staff-store'
import { TimeSelectField } from './time-select-field'
import type { DayOfWeek } from '../calendar/types'

interface RoomScheduleEditorProps {
  open: boolean
  onClose: () => void
  roomId: string | null
  roomName: string
  dayOfWeek: DayOfWeek | null
  initialShift?: { start: string; end: string; serviceIds: string[] } | null
  roomType?: 'dynamic' | 'static' // Flexible vs Fixed capacity
  defaultCapacity?: number // Room's default capacity
  roomServiceIds?: string[] // Services assigned to this room - only these can be selected per shift
}

export function RoomScheduleEditor({
  open,
  onClose,
  roomId,
  roomName,
  dayOfWeek,
  initialShift,
  roomType = 'dynamic',
  defaultCapacity = 10,
  roomServiceIds = []
}: RoomScheduleEditorProps) {
  const { updateRoomSchedule, getRoomSchedule, apiServices, staffMembers } = useStaffManagementStore()

  // Filter available services to only those assigned to this room
  const availableServices =
    roomServiceIds.length > 0 ? apiServices.filter(s => roomServiceIds.includes(s.id)) : apiServices

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'error' | 'success' }>({
    open: false,
    message: '',
    severity: 'error'
  })
  const [isAvailable, setIsAvailable] = useState(false)
  const [shifts, setShifts] = useState<
    Array<{ id: string; start: string; end: string; serviceIds: string[]; capacity?: number; staffIds?: string[] }>
  >([])
  const isFlexibleCapacity = roomType === 'dynamic'
  const isStaticCapacity = roomType === 'static'
  const slotLabel = isStaticCapacity ? 'Session' : 'Shift'
  const dayLabel =
    dayOfWeek === 'Sun'
      ? 'Sunday'
      : dayOfWeek === 'Mon'
        ? 'Monday'
        : dayOfWeek === 'Tue'
          ? 'Tuesday'
          : dayOfWeek === 'Wed'
            ? 'Wednesday'
            : dayOfWeek === 'Thu'
              ? 'Thursday'
              : dayOfWeek === 'Fri'
                ? 'Friday'
                : dayOfWeek === 'Sat'
                  ? 'Saturday'
                  : dayOfWeek

  useEffect(() => {
    if (open && roomId && dayOfWeek) {
      const schedule = getRoomSchedule(roomId, dayOfWeek)
      setIsAvailable(schedule.isAvailable)

      if (schedule.shifts.length > 0) {
        setShifts(
          schedule.shifts.map((s, idx) => ({
            id: s.id || `shift-${idx}`,
            start: s.start,
            end: s.end,
            serviceIds: s.serviceIds || [],
            capacity: isStaticCapacity ? (s.capacity ?? defaultCapacity) : s.capacity
          }))
        )
      } else if (initialShift) {
        // If opening to create a new shift
        setShifts([
          {
            id: `shift-${Date.now()}`,
            start: initialShift.start || '09:00',
            end: initialShift.end || '17:00',
            serviceIds: initialShift.serviceIds || [],
            capacity: isStaticCapacity ? defaultCapacity : undefined
          }
        ])
        setIsAvailable(true)
      } else {
        setShifts([])
      }
    }
  }, [open, roomId, dayOfWeek, getRoomSchedule, initialShift, isStaticCapacity, defaultCapacity])

  const handleAddShift = () => {
    setShifts([
      ...shifts,
      {
        id: `shift-${Date.now()}`,
        start: '09:00',
        end: '17:00',
        serviceIds: [],
        capacity: isStaticCapacity ? defaultCapacity : undefined,
        staffIds: []
      }
    ])
  }

  const handleRemoveShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id))
  }

  const handleUpdateShift = (
    id: string,
    field: 'start' | 'end' | 'serviceIds' | 'capacity' | 'staffIds',
    value: any
  ) => {
    setShifts(shifts.map(s => (s.id === id ? { ...s, [field]: value } : s)))
  }

  // Check for shift overlaps
  const checkShiftOverlaps = () => {
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

  const shiftOverlaps = checkShiftOverlaps()
  const hasOverlaps = shiftOverlaps.length > 0

  const handleSave = () => {
    if (!roomId || !dayOfWeek) return

    if (isAvailable && shifts.length === 0) {
      setSnackbar({
        open: true,
        message: `Please add at least one ${slotLabel.toLowerCase()} or mark the day as unavailable`,
        severity: 'error'
      })
      return
    }

    // Validate shift times and check for overlaps
    if (shifts.length > 1) {
      // Check all pairs of shifts for overlaps
      for (let i = 0; i < shifts.length; i++) {
        const shift1 = shifts[i]
        const [startH1, startM1] = shift1.start.split(':').map(Number)
        const [endH1, endM1] = shift1.end.split(':').map(Number)
        const start1 = startH1 * 60 + startM1
        const end1 = endH1 * 60 + endM1

        // Validate end time is after start time
        if (end1 <= start1) {
          setSnackbar({
            open: true,
            message: `${slotLabel} ${i + 1}: End time must be after start time`,
            severity: 'error'
          })
          return
        }

        for (let j = i + 1; j < shifts.length; j++) {
          const shift2 = shifts[j]
          const [startH2, startM2] = shift2.start.split(':').map(Number)
          const [endH2, endM2] = shift2.end.split(':').map(Number)
          const start2 = startH2 * 60 + startM2
          const end2 = endH2 * 60 + endM2

          // Check for overlap
          if (start1 < end2 && end1 > start2) {
            setSnackbar({
              open: true,
              message: `${slotLabel} ${i + 1} and ${slotLabel} ${j + 1} have overlapping times. Please adjust the times so they don't conflict.`,
              severity: 'error'
            })
            return
          }
        }
      }
    } else if (shifts.length === 1) {
      // Validate single shift
      const shift = shifts[0]
      if (shift.start >= shift.end) {
        setSnackbar({ open: true, message: 'End time must be after start time', severity: 'error' })
        return
      }
    }

    if (isStaticCapacity) {
      for (let i = 0; i < shifts.length; i++) {
        const sessionCapacity = shifts[i].capacity
        if (!sessionCapacity || sessionCapacity < 1) {
          setSnackbar({ open: true, message: `Session ${i + 1}: Capacity is required`, severity: 'error' })
          return
        }
        // Validate service is selected for static sessions
        if (!shifts[i].serviceIds || shifts[i].serviceIds.length === 0) {
          setSnackbar({ open: true, message: `Session ${i + 1}: Please select a service`, severity: 'error' })
          return
        }
      }
    } else {
      // For dynamic rooms, also require at least one service per shift
      for (let i = 0; i < shifts.length; i++) {
        if (!shifts[i].serviceIds || shifts[i].serviceIds.length === 0) {
          setSnackbar({ open: true, message: `Shift ${i + 1}: Please select at least one service`, severity: 'error' })
          return
        }
      }
    }

    updateRoomSchedule(roomId, dayOfWeek, {
      isAvailable,
      shifts: isAvailable
        ? shifts.map(shift => ({
            ...shift,
            capacity: isStaticCapacity ? (shift.capacity ?? defaultCapacity) : shift.capacity
          }))
        : []
    })

    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography variant='h6' fontWeight={600}>
                Edit Room Schedule
              </Typography>
              <Tooltip
                arrow
                placement='right'
                title={
                  isStaticCapacity
                    ? 'Fixed rooms run sessions with capacity per session.'
                    : 'Flex rooms follow availability windows for individual appointments.'
                }
              >
                <i className='ri-information-line' style={{ fontSize: 15, color: 'var(--mui-palette-primary-main)' }} />
              </Tooltip>
            </Box>
            <Typography variant='caption' color='text.secondary'>
              {roomName} - <strong>{dayLabel}</strong>
            </Typography>
          </Box>
          <IconButton onClick={onClose} size='small'>
            <i className='ri-close-line' />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Capacity Mode Info */}
          <Alert severity='info' sx={{ py: 0.5 }}>
            <Typography variant='caption'>
              <strong>{isFlexibleCapacity ? 'Flex Mode' : 'Fixed Mode'}</strong>
              {isFlexibleCapacity
                ? ' — Capacity is managed at room level; this schedule controls availability and services.'
                : ` — Sessions default to ${defaultCapacity} people and can be overridden per session.`}
            </Typography>
          </Alert>

          {/* Availability Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={e => {
                  setIsAvailable(e.target.checked)
                  if (!e.target.checked) {
                    setShifts([])
                  }
                }}
                color='primary'
              />
            }
            label={
              <Box>
                <Typography variant='body2' fontWeight={500}>
                  Room Available on {dayLabel}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  Toggle to make room available or closed
                </Typography>
              </Box>
            }
          />

          {isAvailable && (
            <>
              <Divider />

              {/* Shifts */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant='subtitle1' fontWeight={600}>
                    {isStaticCapacity ? 'Sessions' : 'Shifts'} ({shifts.length})
                  </Typography>
                  <Button size='small' startIcon={<i className='ri-add-line' />} onClick={handleAddShift}>
                    Add {isStaticCapacity ? 'Session' : 'Shift'}
                  </Button>
                </Box>

                {shifts.length === 0 ? (
                  <Box
                    sx={{
                      p: 4,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 1,
                      textAlign: 'center'
                    }}
                  >
                    <i className='ri-time-line' style={{ fontSize: 48, opacity: 0.3 }} />
                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                      No {isStaticCapacity ? 'sessions' : 'shifts'} added yet
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Click &quot;Add {isStaticCapacity ? 'Session' : 'Shift'}&quot; to create a time slot
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {shifts.map((shift, idx) => (
                      <Box
                        key={shift.id}
                        sx={{
                          p: 2,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: 'background.default'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant='subtitle2' fontWeight={600}>
                            {slotLabel} {idx + 1}
                          </Typography>
                          <IconButton size='small' color='error' onClick={() => handleRemoveShift(shift.id)}>
                            <i className='ri-delete-bin-line' />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                          <TimeSelectField
                            label='Start Time'
                            value={shift.start}
                            onChange={value => handleUpdateShift(shift.id, 'start', value)}
                            fullWidth
                          />
                          <TimeSelectField
                            label='End Time'
                            value={shift.end}
                            onChange={value => handleUpdateShift(shift.id, 'end', value)}
                            fullWidth
                          />
                        </Box>

                        <FormControl fullWidth required error={!shift.serviceIds || shift.serviceIds.length === 0}>
                          <InputLabel>
                            {isStaticCapacity ? 'Service for this session' : 'Services for this shift'}
                          </InputLabel>
                          {isStaticCapacity ? (
                            // Static rooms: Single service selection only
                            <Select
                              value={shift.serviceIds[0] || ''}
                              onChange={e => {
                                const value = e.target.value as string
                                handleUpdateShift(shift.id, 'serviceIds', value ? [value] : [])
                              }}
                              input={<OutlinedInput label='Service for this session' />}
                            >
                              {availableServices.map(service => (
                                <MenuItem key={service.id} value={service.id}>
                                  {service.name}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            // Dynamic rooms: Multi-select allowed
                            <Select
                              multiple
                              value={shift.serviceIds}
                              onChange={e => {
                                const value =
                                  typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                                handleUpdateShift(shift.id, 'serviceIds', value)
                              }}
                              input={<OutlinedInput label='Services for this shift' />}
                              renderValue={selected => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map(value => {
                                    const service = availableServices.find(s => s.id === value)
                                    return <Chip key={value} label={service?.name || value} size='small' />
                                  })}
                                </Box>
                              )}
                            >
                              {availableServices.map(service => (
                                <MenuItem key={service.id} value={service.id}>
                                  <Checkbox checked={shift.serviceIds.includes(service.id)} />
                                  <ListItemText primary={service.name} secondary={`${service.duration} min`} />
                                </MenuItem>
                              ))}
                            </Select>
                          )}
                          {isStaticCapacity ? (
                            <Typography variant='caption' color={!shift.serviceIds || shift.serviceIds.length === 0 ? 'error' : 'text.secondary'} sx={{ mt: 0.5 }}>
                              {!shift.serviceIds || shift.serviceIds.length === 0 ? 'Please select a service' : 'Each fixed session requires one service.'}
                            </Typography>
                          ) : (
                            <Typography variant='caption' color={!shift.serviceIds || shift.serviceIds.length === 0 ? 'error' : 'text.secondary'} sx={{ mt: 0.5 }}>
                              {!shift.serviceIds || shift.serviceIds.length === 0 ? 'Please select at least one service' : roomServiceIds.length > 0 ? 'Only services assigned to this room are shown' : 'Select services for this shift'}
                            </Typography>
                          )}
                        </FormControl>

                        {/* Capacity and Staff Assignment for static rooms */}
                        {isStaticCapacity && (
                          <>
                            <Box sx={{ mt: 2 }}>
                              <TextField
                                type='number'
                                label='Session Capacity'
                                value={shift.capacity ?? defaultCapacity}
                                onChange={e => {
                                  const val = e.target.value ? Number(e.target.value) : defaultCapacity
                                  handleUpdateShift(shift.id, 'capacity', val)
                                }}
                                size='small'
                                fullWidth
                                required
                                helperText='Maximum number of participants for this session'
                                InputProps={{
                                  startAdornment: (
                                    <i className='ri-group-line' style={{ marginRight: 8, opacity: 0.5 }} />
                                  )
                                }}
                              />
                            </Box>
                            <FormControl fullWidth sx={{ mt: 2 }}>
                              <InputLabel>Staff Assigned</InputLabel>
                              <Select
                                multiple
                                value={shift.staffIds || []}
                                onChange={e => {
                                  const value =
                                    typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value
                                  handleUpdateShift(shift.id, 'staffIds', value)
                                }}
                                input={<OutlinedInput label='Staff Assigned' />}
                                renderValue={selected => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map(value => {
                                      const staff = staffMembers.find(s => s.id === value)
                                      return <Chip key={value} label={staff?.name || value} size='small' />
                                    })}
                                  </Box>
                                )}
                              >
                                {staffMembers.map(staff => (
                                  <MenuItem key={staff.id} value={staff.id}>
                                    <Checkbox checked={(shift.staffIds || []).includes(staff.id)} />
                                    <ListItemText primary={staff.name} secondary={staff.title} />
                                  </MenuItem>
                                ))}
                              </Select>
                              <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                                Assign staff members to this session
                              </Typography>
                            </FormControl>
                          </>
                        )}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>

              {/* Overlap Warning */}
              {hasOverlaps && shifts.length > 1 && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'error.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <i
                    className='ri-error-warning-line'
                    style={{ color: 'var(--mui-palette-error-main)', fontSize: 20 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant='body2' fontWeight={600} color='error.main'>
                      Overlapping {slotLabel}s Detected
                    </Typography>
                    {shiftOverlaps.map((overlap, idx) => (
                      <Typography key={idx} variant='caption' color='error.dark' display='block'>
                        {overlap.shift1 === overlap.shift2
                          ? `${slotLabel} ${overlap.shift1 + 1}: End time must be after start time`
                          : `${slotLabel} ${overlap.shift1 + 1} and ${slotLabel} ${overlap.shift2 + 1} have overlapping times`}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'info.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'info.main'
                }}
              >
                <Typography variant='caption' color='info.dark'>
                  <strong>Tip:</strong> You can add multiple {slotLabel.toLowerCase()}s per day and assign services per{' '}
                  {slotLabel.toLowerCase()}.
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant='outlined'>
          Cancel
        </Button>
        <Button onClick={handleSave} variant='contained' disabled={hasOverlaps || (isAvailable && shifts.some(s => !s.serviceIds || s.serviceIds.length === 0))}>
          Save Schedule
        </Button>
      </DialogActions>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity as any}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  )
}
