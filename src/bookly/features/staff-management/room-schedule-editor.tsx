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
  Alert
} from '@mui/material'
import { mockServices } from '@/bookly/data/mock-data'
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
}

export function RoomScheduleEditor({
  open,
  onClose,
  roomId,
  roomName,
  dayOfWeek,
  initialShift,
  roomType = 'dynamic',
  defaultCapacity = 10
}: RoomScheduleEditorProps) {
  const { updateRoomSchedule, getRoomSchedule } = useStaffManagementStore()

  const [isAvailable, setIsAvailable] = useState(false)
  const [shifts, setShifts] = useState<
    Array<{ id: string; start: string; end: string; serviceIds: string[]; capacity?: number }>
  >([])
  const isFlexibleCapacity = roomType === 'dynamic'

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
            capacity: s.capacity
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
            capacity: undefined
          }
        ])
        setIsAvailable(true)
      } else {
        setShifts([])
      }
    }
  }, [open, roomId, dayOfWeek, getRoomSchedule, initialShift])

  const handleAddShift = () => {
    setShifts([
      ...shifts,
      {
        id: `shift-${Date.now()}`,
        start: '09:00',
        end: '17:00',
        serviceIds: [],
        capacity: undefined
      }
    ])
  }

  const handleRemoveShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id))
  }

  const handleUpdateShift = (id: string, field: 'start' | 'end' | 'serviceIds' | 'capacity', value: any) => {
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
      alert('Please add at least one shift or mark the day as unavailable')
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
          alert(`Shift ${i + 1}: End time must be after start time`)
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
            alert(
              `Shift ${i + 1} and Shift ${j + 1} have overlapping times. Please adjust the times so they don't conflict.`
            )
            return
          }
        }
      }
    } else if (shifts.length === 1) {
      // Validate single shift
      const shift = shifts[0]
      if (shift.start >= shift.end) {
        alert('End time must be after start time')
        return
      }
    }

    updateRoomSchedule(roomId, dayOfWeek, {
      isAvailable,
      shifts: isAvailable ? shifts : []
    })

    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant='h6' fontWeight={600}>
              Edit Room Schedule
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {roomName} - {dayOfWeek}
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
              <strong>{isFlexibleCapacity ? 'Flexible Capacity' : 'Fixed Capacity'}</strong>
              {isFlexibleCapacity
                ? ` — Each time slot can have a different capacity. Default: ${defaultCapacity} people.`
                : ` — All slots use the room's fixed capacity of ${defaultCapacity} people.`}
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
                  Room Available on {dayOfWeek}
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
                    Shifts ({shifts.length})
                  </Typography>
                  <Button size='small' startIcon={<i className='ri-add-line' />} onClick={handleAddShift}>
                    Add Shift
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
                      No shifts added yet
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      Click "Add Shift" to create a time slot
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
                            Shift {idx + 1}
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

                        <FormControl fullWidth>
                          <InputLabel>Services for this shift</InputLabel>
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
                                  const service = mockServices.find(s => s.id === value)
                                  return <Chip key={value} label={service?.name || value} size='small' />
                                })}
                              </Box>
                            )}
                          >
                            {mockServices.map(service => (
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
                        </FormControl>

                        {/* Per-slot capacity for flexible rooms */}
                        {isFlexibleCapacity && (
                          <Box sx={{ mt: 2 }}>
                            <TextField
                              type='number'
                              label='Capacity for this slot'
                              value={shift.capacity ?? ''}
                              onChange={e => {
                                const val = e.target.value ? Number(e.target.value) : undefined
                                handleUpdateShift(shift.id, 'capacity', val)
                              }}
                              placeholder={`Default: ${defaultCapacity}`}
                              size='small'
                              fullWidth
                              helperText={
                                shift.capacity
                                  ? `Override: ${shift.capacity} people`
                                  : `Uses room default: ${defaultCapacity} people`
                              }
                              InputProps={{
                                startAdornment: <i className='ri-group-line' style={{ marginRight: 8, opacity: 0.5 }} />
                              }}
                            />
                          </Box>
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
                  <i className='ri-error-warning-line' style={{ color: '#d32f2f', fontSize: 20 }} />
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
                  <strong>Tip:</strong> You can add multiple shifts per day. Assign specific services to each shift to
                  control which services are available during different time periods.
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
        <Button onClick={handleSave} variant='contained' disabled={hasOverlaps}>
          Save Schedule
        </Button>
      </DialogActions>
    </Dialog>
  )
}
