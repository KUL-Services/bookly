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
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  List,
  ListItem
} from '@mui/material'
import type { BreakRange } from '../calendar/types'

interface ShiftEditorModalProps {
  open: boolean
  onClose: () => void
  staffName?: string
  date?: Date
  hasShift?: boolean
  initialStartTime?: string
  initialEndTime?: string
  onSave?: (data: { hasShift: boolean; startTime: string; endTime: string; breaks: BreakRange[] }) => void
}

function calculateDuration(start: string, end: string): string {
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

export function ShiftEditorModal({
  open,
  onClose,
  staffName = 'Staff Member',
  date,
  hasShift = true,
  initialStartTime = '10:00',
  initialEndTime = '19:00',
  onSave
}: ShiftEditorModalProps) {
  const [isWorking, setIsWorking] = useState(hasShift)
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)
  const [breaks, setBreaks] = useState<BreakRange[]>([])

  // Reset form when modal opens with new data
  useState(() => {
    if (open) {
      setIsWorking(hasShift)
      setStartTime(initialStartTime)
      setEndTime(initialEndTime)
      setBreaks([])
    }
  })

  const handleAddBreak = () => {
    setBreaks([
      ...breaks,
      {
        id: crypto.randomUUID(),
        start: '12:00',
        end: '13:00'
      }
    ])
  }

  const handleRemoveBreak = (id: string) => {
    setBreaks(breaks.filter(b => b.id !== id))
  }

  const handleUpdateBreak = (id: string, field: 'start' | 'end', value: string) => {
    setBreaks(breaks.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ))
  }

  const handleSave = () => {
    if (onSave) {
      onSave({
        hasShift: isWorking,
        startTime,
        endTime,
        breaks
      })
    }
    onClose()
  }

  const handleCancel = () => {
    // Reset form
    setIsWorking(hasShift)
    setStartTime(initialStartTime)
    setEndTime(initialEndTime)
    setBreaks([])
    onClose()
  }

  const duration = isWorking ? calculateDuration(startTime, endTime) : '0h 0m'

  const formatDate = (d: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
  }

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={handleCancel} sx={{ mr: 1 }}>
            <i className="ri-close-line" />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Edit shift • {staffName} • {date ? formatDate(date) : 'Select Date'}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Top Row - Shift Toggle, Time Pickers, Duration & Add Break */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Shift Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={isWorking}
                  onChange={(e) => setIsWorking(e.target.checked)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: 'success.main'
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: 'success.main'
                    }
                  }}
                />
              }
              label={<Typography fontWeight={600}>Shift</Typography>}
              sx={{ mr: 2 }}
            />

            {/* Start/End Times */}
            <TextField
              type="time"
              label="Start"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 900 }} // 15 min increments
              disabled={!isWorking}
              sx={{ width: 150 }}
            />
            <TextField
              type="time"
              label="End"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 900 }} // 15 min increments
              disabled={!isWorking}
              sx={{ width: 150 }}
            />

            {/* Duration Display */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="ri-time-line" style={{ fontSize: 20, opacity: 0.5 }} />
              <Typography variant="body1" fontWeight={500}>
                {duration}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Add Break Button */}
            <Button
              size="medium"
              variant="text"
              startIcon={<i className="ri-add-line" />}
              onClick={handleAddBreak}
              disabled={!isWorking}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              + Add Break
            </Button>
          </Box>

          {/* Breaks Section */}
          {isWorking && breaks.length === 0 && (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'action.hover',
                borderRadius: 1,
                color: 'text.secondary'
              }}
            >
              <i className="ri-cup-line" style={{ fontSize: 32, opacity: 0.3 }} />
              <Typography variant="body2" sx={{ mt: 1 }}>
                No breaks added
              </Typography>
            </Box>
          )}

          {isWorking && breaks.length > 0 && (
            <List sx={{ p: 0 }}>
              {breaks.map((breakRange, index) => (
                <ListItem
                  key={breakRange.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', width: '100%' }}>
                    <i className="ri-cup-line" style={{ fontSize: 20, opacity: 0.5 }} />
                    <TextField
                      type="time"
                      label="Start"
                      value={breakRange.start}
                      onChange={(e) => handleUpdateBreak(breakRange.id, 'start', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      sx={{ width: 120 }}
                    />
                    <Typography variant="body2" color="text.secondary">—</Typography>
                    <TextField
                      type="time"
                      label="End"
                      value={breakRange.end}
                      onChange={(e) => handleUpdateBreak(breakRange.id, 'end', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      size="small"
                      sx={{ width: 120 }}
                    />
                    <Chip
                      size="small"
                      label={calculateDuration(breakRange.start, breakRange.end)}
                      variant="outlined"
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveBreak(breakRange.id)}
                    >
                      <i className="ri-delete-bin-line" />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleCancel} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
