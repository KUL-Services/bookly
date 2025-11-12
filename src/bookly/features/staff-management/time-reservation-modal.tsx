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
  MenuItem
} from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'

interface TimeReservationModalProps {
  open: boolean
  onClose: () => void
}

export function TimeReservationModal({ open, onClose }: TimeReservationModalProps) {
  const { createTimeReservation } = useStaffManagementStore()

  const [staffId, setStaffId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('14:00')
  const [endTime, setEndTime] = useState('15:00')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  const handleSave = () => {
    if (!staffId || !date || !startTime || !endTime || !reason) {
      alert('Please fill in all required fields')
      return
    }

    const startDateTime = new Date(`${date}T${startTime}`)
    const endDateTime = new Date(`${date}T${endTime}`)

    createTimeReservation({
      staffId,
      start: startDateTime,
      end: endDateTime,
      reason,
      note
    })

    handleCancel()
  }

  const handleCancel = () => {
    setStaffId('')
    setDate(new Date().toISOString().split('T')[0])
    setStartTime('14:00')
    setEndTime('15:00')
    setReason('')
    setNote('')
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={600}>
          Add Time Reservation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Block time for meetings, training, or other activities
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Staff Selection */}
          <FormControl fullWidth>
            <InputLabel>Staff Member *</InputLabel>
            <Select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              label="Staff Member *"
            >
              {mockStaff.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date */}
          <TextField
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          {/* Time Range */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="time"
              label="Start Time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              type="time"
              label="End Time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Box>

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
        <Button onClick={handleSave} variant="contained">
          Add Reservation
        </Button>
      </DialogActions>
    </Dialog>
  )
}
