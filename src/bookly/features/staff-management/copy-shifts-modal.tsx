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
  Alert
} from '@mui/material'
import { mockStaff } from '@/bookly/data/mock-data'
import { useStaffManagementStore } from './staff-store'

interface CopyShiftsModalProps {
  open: boolean
  onClose: () => void
  sourceDate: Date
}

export function CopyShiftsModal({ open, onClose, sourceDate }: CopyShiftsModalProps) {
  const { duplicateShifts } = useStaffManagementStore()

  const [staffId, setStaffId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const sourceDateStr = sourceDate.toISOString().split('T')[0]

  const handleCopy = () => {
    if (!staffId || !startDate || !endDate) {
      alert('Please fill in all fields')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('End date must be after start date')
      return
    }

    duplicateShifts(staffId, sourceDateStr, {
      start: startDate,
      end: endDate
    })

    handleCancel()
  }

  const handleCancel = () => {
    setStaffId('')
    setStartDate('')
    setEndDate('')
    onClose()
  }

  const calculateDays = () => {
    if (!startDate || !endDate) return 0
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1 // Include both start and end dates
  }

  const daysCount = calculateDays()

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" fontWeight={600}>
          Copy Shifts
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Duplicate shift from {sourceDateStr} to multiple days
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Info Alert */}
          <Alert severity="info">
            This will copy the shift configuration from <strong>{sourceDateStr}</strong> to all selected days,
            including breaks and working hours.
          </Alert>

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

          {/* Summary */}
          {daysCount > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'success.50',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'success.main'
              }}
            >
              <Typography variant="body2" color="success.dark">
                <strong>Summary:</strong> This will create {daysCount} shift {daysCount === 1 ? 'copy' : 'copies'}.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleCopy} variant="contained">
          Copy Shifts
        </Button>
      </DialogActions>
    </Dialog>
  )
}
