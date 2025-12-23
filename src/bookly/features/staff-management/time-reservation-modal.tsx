'use client'

import { useState, useEffect } from 'react'
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
  Paper,
  IconButton,
  Divider,
  Checkbox,
  ListItemText,
  Chip
} from '@mui/material'
import { mockStaff, mockBranches, mockRooms } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import { TimeSelectField } from './time-select-field'
import { DatePickerField } from './date-picker-field'
import type { DayOfWeek } from '../calendar/types'
import { useCalendarStore } from '../calendar/state'

interface TimeReservationModalProps {
  open: boolean
  onClose: () => void
  initialStaffId?: string
  initialDate?: Date
  branchId?: string
}

const dayNames: DayOfWeek[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const formatDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const addMinutesToTime = (time: string, minutesToAdd: number) => {
  const totalMinutes = timeToMinutes(time) + minutesToAdd
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const isWithinShifts = (startTime: string, endTime: string, shifts: Array<{ start: string; end: string }>) => {
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  return shifts.some(shift => {
    const shiftStart = timeToMinutes(shift.start)
    const shiftEnd = timeToMinutes(shift.end)
    return start >= shiftStart && end <= shiftEnd
  })
}

const formatShiftRanges = (shifts: Array<{ start: string; end: string }>) => {
  return shifts.map(shift => `${shift.start} - ${shift.end}`).join(', ')
}

export function TimeReservationModal({
  open,
  onClose,
  initialStaffId,
  initialDate,
  branchId
}: TimeReservationModalProps) {
  const {
    createTimeReservation,
    timeReservations,
    timeOffRequests,
    selectedStaffId,
    getBusinessHours,
    getStaffShiftsForDate
  } = useStaffManagementStore()
  const calendarRooms = useCalendarStore(state => state.rooms)

  const [staffIds, setStaffIds] = useState<string[]>([])
  const [roomIds, setRoomIds] = useState<string[]>([])
  const [date, setDate] = useState<Date>(initialDate || new Date())
  const [startTime, setStartTime] = useState('14:00')
  const [endTime, setEndTime] = useState('15:00')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null)

  const hasKnownBranch = !!branchId && branchId !== 'all' && mockBranches.some(branch => branch.id === branchId)
  const allRooms = calendarRooms.length > 0 ? calendarRooms : mockRooms
  const staffByBranch = hasKnownBranch ? mockStaff.filter(staff => staff.branchId === branchId) : mockStaff
  const roomsByBranch = hasKnownBranch ? allRooms.filter(room => room.branchId === branchId) : allRooms
  const availableStaff = staffByBranch.length > 0 ? staffByBranch : mockStaff
  const availableRooms = roomsByBranch.length > 0 ? roomsByBranch : allRooms

  const getSuggestedTimes = (targetStaffId: string, targetDate: Date) => {
    if (!targetStaffId) return null
    const dateKey = formatDateKey(targetDate)
    const shifts = getStaffShiftsForDate(targetStaffId, dateKey)
    const validShifts = shifts.filter(shift => shift.start !== '00:00' && shift.end !== '00:00')
    const primaryShift = validShifts[0]
    if (!primaryShift) return null
    const suggestedStart = primaryShift.start
    const oneHourLater = addMinutesToTime(primaryShift.start, 60)
    const suggestedEnd =
      timeToMinutes(oneHourLater) <= timeToMinutes(primaryShift.end) ? oneHourLater : primaryShift.end
    return { start: suggestedStart, end: suggestedEnd }
  }

  const getBranchSuggestedTimes = (targetBranchId: string | undefined, targetDate: Date) => {
    if (!targetBranchId || targetBranchId === 'all') return null
    const dayName = dayNames[targetDate.getDay()]
    const businessHours = getBusinessHours(targetBranchId, dayName)
    if (!businessHours.isOpen || businessHours.shifts.length === 0) return null
    const primaryShift = businessHours.shifts[0]
    const suggestedStart = primaryShift.start
    const oneHourLater = addMinutesToTime(primaryShift.start, 60)
    const suggestedEnd =
      timeToMinutes(oneHourLater) <= timeToMinutes(primaryShift.end) ? oneHourLater : primaryShift.end
    return { start: suggestedStart, end: suggestedEnd }
  }

  useEffect(() => {
    if (!open) return
    const defaultStaffId = initialStaffId || selectedStaffId || ''
    const defaultDate = initialDate || new Date()
    const staffInScope = availableStaff.some(staff => staff.id === defaultStaffId)
    const nextStaffIds = staffInScope ? [defaultStaffId] : []

    setStaffIds(nextStaffIds)
    setRoomIds([])
    setDate(defaultDate)
    const suggested = nextStaffIds.length === 1
      ? getSuggestedTimes(nextStaffIds[0], defaultDate)
      : getBranchSuggestedTimes(branchId, defaultDate)
    setStartTime(suggested?.start || '14:00')
    setEndTime(suggested?.end || '15:00')
    setReason('')
    setNote('')
    setValidationError(null)
    setAvailabilityWarning(null)
  }, [open, initialStaffId, selectedStaffId, initialDate, branchId])

  useEffect(() => {
    if (staffIds.length !== 1) return
    if (startTime !== '14:00' || endTime !== '15:00') return
    const suggested = getSuggestedTimes(staffIds[0], date)
    if (suggested) {
      setStartTime(suggested.start)
      setEndTime(suggested.end)
    }
  }, [staffIds, date])

  useEffect(() => {
    setValidationError(null)
    setAvailabilityWarning(null)

    if (!date || !startTime || !endTime) return

    const dateKey = formatDateKey(date)
    const startDateTime = new Date(`${dateKey}T${startTime}`)
    const endDateTime = new Date(`${dateKey}T${endTime}`)

    if (endDateTime <= startDateTime) {
      setValidationError('End time must be after start time')
      return
    }

    for (const staffId of staffIds) {
      const staff = mockStaff.find(s => s.id === staffId)
      const conflictingReservation = timeReservations.find(reservation => {
        if (!reservation.staffIds.includes(staffId)) return false
        return startDateTime < reservation.end && endDateTime > reservation.start
      })
      if (conflictingReservation) {
        setValidationError(`Conflicts with reservation for ${staff?.name || 'staff'}: ${conflictingReservation.reason}`)
        return
      }

      const conflictingTimeOff = timeOffRequests.find(request => {
        if (request.staffId !== staffId) return false
        return startDateTime < request.range.end && endDateTime > request.range.start
      })
      if (conflictingTimeOff) {
        setValidationError(`Conflicts with time off for ${staff?.name || 'staff'}: ${conflictingTimeOff.reason}`)
        return
      }
    }

    for (const roomId of roomIds) {
      const room = calendarRooms.find(r => r.id === roomId)
      const conflictingReservation = timeReservations.find(reservation => {
        if (!reservation.roomIds.includes(roomId)) return false
        return startDateTime < reservation.end && endDateTime > reservation.start
      })
      if (conflictingReservation) {
        setValidationError(`Conflicts with reservation for ${room?.name || 'room'}: ${conflictingReservation.reason}`)
        return
      }
    }

    const warnings: string[] = []
    const dayName = dayNames[date.getDay()]
    staffIds.forEach(staffId => {
      const staff = mockStaff.find(s => s.id === staffId)
      const branch = staff ? mockBranches.find(b => b.id === staff.branchId) : null

      if (branch) {
        const businessHours = getBusinessHours(branch.id, dayName)
        if (!businessHours.isOpen || businessHours.shifts.length === 0) {
          warnings.push(`${staff?.name || 'Staff'}: branch closed on ${dayName}`)
        } else if (!isWithinShifts(startTime, endTime, businessHours.shifts)) {
          warnings.push(
            `${staff?.name || 'Staff'}: outside branch hours (${formatShiftRanges(businessHours.shifts)})`
          )
        }
      }

      const staffShifts = getStaffShiftsForDate(staffId, dateKey).filter(
        shift => shift.start !== '00:00' && shift.end !== '00:00'
      )
      if (staffShifts.length === 0) {
        warnings.push(`${staff?.name || 'Staff'}: no working hours for this date`)
      } else if (!isWithinShifts(startTime, endTime, staffShifts)) {
        warnings.push(`${staff?.name || 'Staff'}: outside staff shift (${formatShiftRanges(staffShifts)})`)
      }
    })

    roomIds.forEach(roomId => {
      const room = calendarRooms.find(r => r.id === roomId)
      const branch = room ? mockBranches.find(b => b.id === room.branchId) : null
      if (!branch) return
      const businessHours = getBusinessHours(branch.id, dayName)
      if (!businessHours.isOpen || businessHours.shifts.length === 0) {
        warnings.push(`${room?.name || 'Room'}: branch closed on ${dayName}`)
      } else if (!isWithinShifts(startTime, endTime, businessHours.shifts)) {
        warnings.push(`${room?.name || 'Room'}: outside branch hours (${formatShiftRanges(businessHours.shifts)})`)
      }
    })

    setAvailabilityWarning(warnings.length ? warnings.join(' | ') : null)
  }, [
    staffIds,
    roomIds,
    date,
    startTime,
    endTime,
    timeReservations,
    timeOffRequests,
    getBusinessHours,
    getStaffShiftsForDate,
    calendarRooms
  ])

  const handleSave = () => {
    if (!date || !startTime || !endTime || !reason.trim()) {
      setValidationError('Please fill in all required fields')
      return
    }
    if (staffIds.length === 0 && roomIds.length === 0) {
      setValidationError('Select at least one staff member or room')
      return
    }
    if (validationError) {
      return
    }

    const dateKey = formatDateKey(date)
    const startDateTime = new Date(`${dateKey}T${startTime}`)
    const endDateTime = new Date(`${dateKey}T${endTime}`)

    createTimeReservation({
      staffIds,
      roomIds,
      start: startDateTime,
      end: endDateTime,
      reason: reason.trim(),
      note
    })

    handleCancel()
  }

  const handleCancel = () => {
    setStaffIds([])
    setRoomIds([])
    setDate(new Date())
    setStartTime('14:00')
    setEndTime('15:00')
    setReason('')
    setNote('')
    setValidationError(null)
    setAvailabilityWarning(null)
    onClose()
  }

  const selectedBranch =
    staffIds.length === 1
      ? mockBranches.find(branch => branch.id === mockStaff.find(staff => staff.id === staffIds[0])?.branchId)
      : null
  const hasTargets = staffIds.length > 0 || roomIds.length > 0

  const renderSelectedChips = (selected: string[], options: Array<{ id: string; name: string }>) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      {selected.map(id => {
        const label = options.find(option => option.id === id)?.name || id
        return <Chip key={id} label={label} size="small" />
      })}
    </Box>
  )

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Add Time Reservation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Block time for meetings, training, or other activities
            </Typography>
          </Box>
          <IconButton size="small" onClick={handleCancel}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Staff Members</InputLabel>
            <Select
              multiple
              value={staffIds}
              onChange={(e) => setStaffIds(e.target.value as string[])}
              label="Staff Members"
              renderValue={(selected) => renderSelectedChips(selected as string[], availableStaff)}
            >
              {availableStaff.map(staff => (
                <MenuItem key={staff.id} value={staff.id}>
                  <Checkbox checked={staffIds.includes(staff.id)} />
                  <ListItemText primary={staff.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Rooms</InputLabel>
            <Select
              multiple
              value={roomIds}
              onChange={(e) => setRoomIds(e.target.value as string[])}
              label="Rooms"
              renderValue={(selected) => renderSelectedChips(selected as string[], availableRooms)}
            >
              {availableRooms.map(room => (
                <MenuItem key={room.id} value={room.id}>
                  <Checkbox checked={roomIds.includes(room.id)} />
                  <ListItemText primary={room.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="caption" color="text.secondary">
            Select one or more staff members, rooms, or both
          </Typography>

          {selectedBranch && (
            <Typography variant="caption" color="text.secondary">
              Branch: {selectedBranch.name}
            </Typography>
          )}

          <Divider />

          {/* Date */}
          <DatePickerField label="Date" value={date} onChange={setDate} required fullWidth />

          {/* Time Range */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TimeSelectField
              label="Start Time"
              value={startTime}
              onChange={setStartTime}
              size="small"
              required
              fullWidth
            />
            <TimeSelectField
              label="End Time"
              value={endTime}
              onChange={setEndTime}
              size="small"
              required
              fullWidth
            />
          </Box>

          {availabilityWarning && (
            <Paper sx={{ p: 1.5, bgcolor: 'warning.lighter', border: 1, borderColor: 'warning.main' }}>
              <Typography variant="body2" color="warning.dark">
                <i className="ri-alert-line" style={{ marginRight: 8 }} />
                {availabilityWarning}
              </Typography>
            </Paper>
          )}

          {validationError && (
            <Paper sx={{ p: 1.5, bgcolor: 'error.lighter', border: 1, borderColor: 'error.main' }}>
              <Typography variant="body2" color="error.dark">
                <i className="ri-error-warning-line" style={{ marginRight: 8 }} />
                {validationError}
              </Typography>
            </Paper>
          )}

          {/* Reason */}
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Staff meeting, Training session"
            required
            fullWidth
          />

          {/* Note */}
          <TextField
            label="Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional details (optional)"
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={!hasTargets || !reason.trim() || !!validationError}>
          Add Reservation
        </Button>
      </DialogActions>
    </Dialog>
  )
}
