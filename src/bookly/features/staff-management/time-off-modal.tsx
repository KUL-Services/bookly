'use client'

import { useState } from 'react'
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
  AccordionDetails
} from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'
import type { TimeOffReasonGroup } from '../calendar/types'

interface TimeOffModalProps {
  open: boolean
  onClose: () => void
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

export function TimeOffModal({ open, onClose }: TimeOffModalProps) {
  const { createTimeOff } = useStaffManagementStore()

  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [allDay, setAllDay] = useState(true)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [hasRepeat, setHasRepeat] = useState(false)
  const [repeatUntil, setRepeatUntil] = useState('')
  const [reasonGroup, setReasonGroup] = useState<TimeOffReasonGroup>('Vacation')
  const [approved, setApproved] = useState(false)
  const [note, setNote] = useState('')

  const handleStaffToggle = (staffId: string) => {
    setSelectedStaffIds(prev =>
      prev.includes(staffId)
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    )
  }

  const handleSave = () => {
    if (selectedStaffIds.length === 0) {
      alert('Please select at least one staff member')
      return
    }

    selectedStaffIds.forEach(staffId => {
      const startDateTime = allDay
        ? new Date(`${startDate}T00:00:00`)
        : new Date(`${startDate}T${startTime}`)

      const endDateTime = allDay
        ? new Date(`${endDate}T23:59:59`)
        : new Date(`${endDate}T${endTime}`)

      createTimeOff({
        staffId,
        range: {
          start: startDateTime,
          end: endDateTime
        },
        allDay,
        repeat: hasRepeat && repeatUntil ? { until: new Date(repeatUntil) } : undefined,
        reason: reasonGroup,
        approved,
        note
      })
    })

    handleCancel()
  }

  const handleCancel = () => {
    setSelectedStaffIds([])
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate(new Date().toISOString().split('T')[0])
    setAllDay(true)
    setStartTime('09:00')
    setEndTime('17:00')
    setHasRepeat(false)
    setRepeatUntil('')
    setReasonGroup('Vacation')
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
        <Typography variant="h5" fontWeight={600}>
          Add Time Off
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Request time off for staff members
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Staff Selection */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Staff Members *
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {mockStaff.map((staff) => (
                <Chip
                  key={staff.id}
                  label={staff.name}
                  onClick={() => handleStaffToggle(staff.id)}
                  color={selectedStaffIds.includes(staff.id) ? 'primary' : 'default'}
                  variant={selectedStaffIds.includes(staff.id) ? 'filled' : 'outlined'}
                  deleteIcon={selectedStaffIds.includes(staff.id) ? <i className="ri-check-line" /> : undefined}
                  onDelete={selectedStaffIds.includes(staff.id) ? () => handleStaffToggle(staff.id) : undefined}
                />
              ))}
            </Box>
          </Box>

          {/* All Day Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                color="primary"
              />
            }
            label={<Typography fontWeight={500}>All day</Typography>}
          />

          {/* Date Range */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="date"
              label="Start Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              type="date"
              label="End Date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Box>

          {/* Time Range (if not all day) */}
          {!allDay && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                type="time"
                label="Start Time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                type="time"
                label="End Time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Box>
          )}

          {/* Repeat */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={hasRepeat}
                  onChange={(e) => setHasRepeat(e.target.checked)}
                />
              }
              label="Repeat daily until"
            />
            {hasRepeat && (
              <TextField
                type="date"
                label="Repeat Until"
                value={repeatUntil}
                onChange={(e) => setRepeatUntil(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          {/* Reason (Grouped) */}
          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              Reason *
            </Typography>
            {Object.entries(TIME_OFF_REASONS).map(([group, reasons]) => (
              <Accordion key={group} defaultExpanded={group === 'Vacation'}>
                <AccordionSummary expandIcon={<i className="ri-arrow-down-s-line" />}>
                  <Typography fontWeight={500}>{group}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {reasons.map((reason) => (
                      <Button
                        key={reason}
                        variant={reasonGroup === group ? 'contained' : 'outlined'}
                        onClick={() => setReasonGroup(group as TimeOffReasonGroup)}
                        sx={{ justifyContent: 'flex-start' }}
                        size="small"
                      >
                        {reason}
                      </Button>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          {/* Approved */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={approved}
                  onChange={(e) => setApproved(e.target.checked)}
                  color="success"
                />
              }
              label="Approved"
            />
            <Tooltip title="Mark as approved if this time off request has been reviewed and accepted by management">
              <IconButton size="small">
                <i className="ri-question-line" style={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>

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
        <Button onClick={handleSave} variant="contained">
          Add Time Off
        </Button>
      </DialogActions>
    </Dialog>
  )
}
