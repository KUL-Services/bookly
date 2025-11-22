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
  Switch,
  FormControlLabel,
  Checkbox,
  Chip,
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment
} from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { TimeOffReasonGroup } from '../calendar/types'
import { DatePickerField } from './date-picker-field'
import { TimeSelectField } from './time-select-field'

interface TimeOffModalProps {
  open: boolean
  onClose: () => void
  editTimeOffId?: string
  initialStaffId?: string
  initialStaffName?: string
  initialDate?: Date
}

const TIME_OFF_REASONS: Record<TimeOffReasonGroup, string[]> = {
  'Vacation': ['Vacation', 'Holiday', 'Personal Travel'],
  'Sick': ['Sick Leave', 'Medical Appointment', 'Family Emergency'],
  'Personal': ['Personal Day', 'Family Event', 'Errands'],
  'Training': ['Professional Development', 'Conference', 'Workshop'],
  'No-Show': ['No Call No Show', 'Late Arrival'],
  'Late': ['Tardy', 'Traffic', 'Transportation Issue'],
  'Other': ['Other', 'Unpaid Leave', 'Bereavement']
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function TimeOffModal({ open, onClose, editTimeOffId, initialStaffId, initialStaffName, initialDate }: TimeOffModalProps) {
  const { createTimeOff, timeOffRequests, updateTimeOff, deleteTimeOff } = useStaffManagementStore()

  // Find existing time-off if editing
  const existingTimeOff = editTimeOffId ? timeOffRequests.find(t => t.id === editTimeOffId) : null

  const [selectedStaffId, setSelectedStaffId] = useState<string>(
    existingTimeOff?.staffId || initialStaffId || ''
  )
  const [startDate, setStartDate] = useState<Date>(
    existingTimeOff?.range.start || initialDate || new Date()
  )
  const [endDate, setEndDate] = useState<Date>(
    existingTimeOff?.range.end || initialDate || new Date()
  )
  const [allDay, setAllDay] = useState(existingTimeOff?.allDay ?? true)
  const [startTime, setStartTime] = useState(() => {
    if (existingTimeOff && !existingTimeOff.allDay) {
      const hours = existingTimeOff.range.start.getHours().toString().padStart(2, '0')
      const minutes = existingTimeOff.range.start.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return '09:00'
  })
  const [endTime, setEndTime] = useState(() => {
    if (existingTimeOff && !existingTimeOff.allDay) {
      const hours = existingTimeOff.range.end.getHours().toString().padStart(2, '0')
      const minutes = existingTimeOff.range.end.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }
    return '17:00'
  })
  const [hasRepeat, setHasRepeat] = useState(!!existingTimeOff?.repeat)
  const [repeatUntil, setRepeatUntil] = useState<Date | null>(existingTimeOff?.repeat?.until || null)
  const [reasonGroup, setReasonGroup] = useState<TimeOffReasonGroup>(existingTimeOff?.reason || 'Sick')
  const [approved, setApproved] = useState(existingTimeOff?.approved ?? false)
  const [note, setNote] = useState(existingTimeOff?.note || '')

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open) {
      const timeOff = editTimeOffId ? timeOffRequests.find(t => t.id === editTimeOffId) : null

      setSelectedStaffId(timeOff?.staffId || initialStaffId || '')
      setStartDate(timeOff?.range.start || initialDate || new Date())
      setEndDate(timeOff?.range.end || initialDate || new Date())
      setAllDay(timeOff?.allDay ?? true)

      if (timeOff && !timeOff.allDay) {
        const startHours = timeOff.range.start.getHours().toString().padStart(2, '0')
        const startMinutes = timeOff.range.start.getMinutes().toString().padStart(2, '0')
        setStartTime(`${startHours}:${startMinutes}`)

        const endHours = timeOff.range.end.getHours().toString().padStart(2, '0')
        const endMinutes = timeOff.range.end.getMinutes().toString().padStart(2, '0')
        setEndTime(`${endHours}:${endMinutes}`)
      } else {
        setStartTime('09:00')
        setEndTime('17:00')
      }

      setHasRepeat(!!timeOff?.repeat)
      setRepeatUntil(timeOff?.repeat?.until || null)
      setReasonGroup(timeOff?.reason || 'Sick')
      setApproved(timeOff?.approved ?? false)
      setNote(timeOff?.note || '')
    }
  }, [open, editTimeOffId, initialStaffId, initialDate, timeOffRequests])

  const handleSave = () => {
    if (!selectedStaffId) {
      alert('Please select a staff member')
      return
    }

    const startDateTime = allDay
      ? new Date(startDate.setHours(0, 0, 0, 0))
      : new Date(`${startDate.toISOString().split('T')[0]}T${startTime}`)

    const endDateTime = allDay
      ? new Date(endDate.setHours(23, 59, 59, 999))
      : new Date(`${endDate.toISOString().split('T')[0]}T${endTime}`)

    if (editTimeOffId && existingTimeOff) {
      // Update existing time-off
      updateTimeOff(editTimeOffId, {
        staffId: selectedStaffId,
        range: {
          start: startDateTime,
          end: endDateTime
        },
        allDay,
        repeat: hasRepeat && repeatUntil ? { until: repeatUntil } : undefined,
        reason: reasonGroup,
        approved,
        note
      })
    } else {
      // Create new time-off
      createTimeOff({
        staffId: selectedStaffId,
        range: {
          start: startDateTime,
          end: endDateTime
        },
        allDay,
        repeat: hasRepeat && repeatUntil ? { until: repeatUntil } : undefined,
        reason: reasonGroup,
        approved,
        note
      })
    }

    handleCancel()
  }

  const handleDelete = () => {
    if (editTimeOffId && confirm('Are you sure you want to delete this time off?')) {
      deleteTimeOff(editTimeOffId)
      handleCancel()
    }
  }

  const handleCancel = () => {
    setSelectedStaffId('')
    setStartDate(new Date())
    setEndDate(new Date())
    setAllDay(true)
    setStartTime('09:00')
    setEndTime('17:00')
    setHasRepeat(false)
    setRepeatUntil(null)
    setReasonGroup('Sick')
    setApproved(false)
    setNote('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {editTimeOffId ? `Edit Time Off • ${initialStaffName || 'Staff'}` : 'Add Time Off'}
            </Typography>
            {!editTimeOffId && (
              <Typography variant="body2" color="text.secondary">
                Request time off for staff members
              </Typography>
            )}
          </Box>
          <IconButton size="small" onClick={handleCancel}>
            <i className="ri-close-line" />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Staff Selection - Dropdown */}
          {!editTimeOffId && (
            <FormControl fullWidth required>
              <InputLabel>Staff Member</InputLabel>
              <Select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                label="Staff Member"
              >
                {mockStaff.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* All Day Toggle + Duration */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  sx={{
                    '&.Mui-checked': {
                      color: 'text.primary'
                    }
                  }}
                />
              }
              label={<Typography fontWeight={500}>All Day</Typography>}
            />
            {!allDay && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="ri-time-line" style={{ fontSize: 20, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {calculateDuration(startTime, endTime)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Select date */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Select date
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <DatePickerField
                label="DATE"
                value={startDate}
                onChange={(date) => {
                  setStartDate(date)
                  if (!endDate || endDate < date) {
                    setEndDate(date)
                  }
                }}
                required
                sx={{ flex: 1 }}
              />
              {!allDay && (
                <>
                  <TimeSelectField
                    label="Start Time"
                    value={startTime}
                    onChange={setStartTime}
                    size="small"
                    sx={{ width: 140 }}
                  />
                  <TimeSelectField
                    label="End Time"
                    value={endTime}
                    onChange={setEndTime}
                    size="small"
                    sx={{ width: 140 }}
                  />
                </>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hasRepeat}
                    onChange={(e) => setHasRepeat(e.target.checked)}
                  />
                }
                label="Repeat"
              />
            </Box>
          </Box>

          {/* Reason Selection - Dropdown */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Select type
            </Typography>
            <FormControl fullWidth required>
              <InputLabel>REASON</InputLabel>
              <Select
                value={reasonGroup}
                onChange={(e) => setReasonGroup(e.target.value as TimeOffReasonGroup)}
                label="REASON"
              >
                {Object.keys(TIME_OFF_REASONS).map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Approved */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  sx={{
                    '&.Mui-checked': {
                      color: 'text.primary'
                    }
                  }}
                />
              }
              label={<Typography fontWeight={500}>Approved</Typography>}
            />
            <Tooltip title="Mark as approved if this time off request has been reviewed and accepted by management">
              <IconButton size="small">
                <i className="ri-question-line" style={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
        {editTimeOffId && (
          <Button onClick={handleDelete} variant="outlined" color="error" startIcon={<i className="ri-delete-bin-line" />}>
            Clear Time Off
          </Button>
        )}
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          {editTimeOffId ? 'Save' : 'Add Time Off'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
